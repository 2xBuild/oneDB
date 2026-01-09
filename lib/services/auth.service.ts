import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { users, accounts } from "../db/schema";
// Auth service - now using NextAuth, this file may not be needed
// Keeping for backward compatibility if needed
import { randomBytes } from "crypto";

export interface OAuthProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export class AuthService {
  /**
   * Find or create a user based on OAuth profile.
   * If a user with the same email exists (from another provider), 
   * links the new account to the existing user instead of creating a duplicate.
   * 
   * Flow:
   * 1. Check if account exists for this provider → return existing user
   * 2. Check if user exists by email → link account to existing user
   * 3. Otherwise, create new user
   * 4. Create/link account record
   */
  async findOrCreateUser(provider: "google" | "github", profile: OAuthProfile): Promise<typeof users.$inferSelect> {
    // Step 1: Check if account already exists for this provider + providerAccountId
    const existingAccounts = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, provider),
          eq(accounts.providerAccountId, profile.id)
        )
      )
      .limit(1);

    if (existingAccounts.length > 0) {
      const account = existingAccounts[0];
      if (account) {
        const userList = await db
          .select()
          .from(users)
          .where(eq(users.id, account.userId))
          .limit(1);
        if (userList.length > 0 && userList[0]) {
          return userList[0];
        }
      }
    }

    // Step 2: Check if user exists by email (from another provider)
    // This ensures GitHub and Google logins with same email share the same user
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, profile.email))
      .limit(1);

    let user: typeof users.$inferSelect;

    if (existingUsers.length > 0 && existingUsers[0]) {
      // User exists - link this provider's account to existing user
      user = existingUsers[0];
      // Update user info if needed (fill in missing fields)
      const updates: {
        name?: string | null;
        avatar?: string | null;
      } = {};
      if (profile.name && !user.name) {
        updates.name = profile.name;
      }
      if (profile.avatar && !user.avatar) {
        updates.avatar = profile.avatar;
      }
      if (Object.keys(updates).length > 0) {
        const updated = await db
          .update(users)
          .set(updates)
          .where(eq(users.id, user.id))
          .returning();
        if (updated[0]) {
          user = updated[0];
        }
      }
    } else {
      // Step 3: Create new user (first time login with this email)
      const userId = randomBytes(16).toString("hex");
      const newUsers = await db
        .insert(users)
        .values({
          id: userId,
          email: profile.email,
          name: profile.name ?? null,
          avatar: profile.avatar ?? null,
        })
        .returning();
      if (!newUsers[0]) {
        throw new Error("Failed to create user");
      }
      user = newUsers[0];
    }

    // Step 4: Create account record linking provider to user (if it doesn't exist)
    const existingAccountForUser = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, user.id),
          eq(accounts.provider, provider),
          eq(accounts.providerAccountId, profile.id)
        )
      )
      .limit(1);

    if (existingAccountForUser.length === 0) {
      const accountId = randomBytes(16).toString("hex");
      await db.insert(accounts).values({
        id: accountId,
        userId: user.id,
        provider,
        providerAccountId: profile.id,
      });
    }

    return user;
  }

  // Note: Token generation is now handled by NextAuth
  // This method is kept for backward compatibility but should not be used
  // generateToken(user: typeof users.$inferSelect): string {
  //   return generateToken(user);
  // }
}

