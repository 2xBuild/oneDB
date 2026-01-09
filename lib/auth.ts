import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { db } from "./db";
import { users, accounts } from "./db/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) {
        return false;
      }

      // For GitHub, email might not be in profile, fetch it from API
      let email = user.email;
      if (account.provider === "github" && !email && account.access_token) {
        try {
          const emailResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${account.access_token}`,
              Accept: "application/vnd.github.v3+json",
            },
          });
          if (emailResponse.ok) {
            const emails = await emailResponse.json();
            const primaryEmail = emails.find((e: any) => e.primary && e.verified);
            const verifiedEmail = emails.find((e: any) => e.verified);
            email = primaryEmail?.email || verifiedEmail?.email || emails[0]?.email;
          }
        } catch (error) {
          console.warn("Failed to fetch email from GitHub API:", error);
        }
      }

      if (!email) {
        return false;
      }

      try {
        const provider = account.provider as "google" | "github";
        const providerAccountId = account.providerAccountId;

        // Check if account already exists
        const existingAccounts = await db
          .select()
          .from(accounts)
          .where(
            and(
              eq(accounts.provider, provider),
              eq(accounts.providerAccountId, providerAccountId)
            )
          )
          .limit(1);

        if (existingAccounts.length > 0) {
          return true;
        }

        // Check if user exists by email
        const existingUsers = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        let userId: string;

        if (existingUsers.length > 0 && existingUsers[0]) {
          userId = existingUsers[0].id;
        } else {
          // Create new user
          userId = randomBytes(16).toString("hex");
          await db.insert(users).values({
            id: userId,
            email: email,
            name: user.name || null,
            avatar: user.image || null,
          });
        }

        // Create account record
        const accountId = randomBytes(16).toString("hex");
        await db.insert(accounts).values({
          id: accountId,
          userId,
          provider,
          providerAccountId,
          accessToken: account.access_token || null,
          refreshToken: account.refresh_token || null,
          expiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
        });

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        const userList = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email))
          .limit(1);

        if (userList.length > 0 && userList[0]) {
          (session.user as any).id = userList[0].id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig);

