import { auth } from "../auth";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const userList = await db
    .select()
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  return userList[0] || null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

