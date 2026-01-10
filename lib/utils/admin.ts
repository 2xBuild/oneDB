/**
 * Admin utility functions
 * Checks if a user is an admin based on environment variable
 */

/**
 * Get admin user IDs from environment variable
 * Format: comma-separated list of user IDs or emails
 */
export function getAdminIds(): string[] {
  const adminEnv = process.env.ADMIN_IDS || "";
  if (!adminEnv) {
    return [];
  }
  return adminEnv.split(",").map((id) => id.trim()).filter(Boolean);
}

/**
 * Check if a user ID or email is an admin
 */
export function isAdmin(userIdOrEmail: string | null | undefined): boolean {
  if (!userIdOrEmail) {
    return false;
  }
  const adminIds = getAdminIds();
  return adminIds.includes(userIdOrEmail);
}

/**
 * Check if the current user is an admin
 * Requires the user object with id or email
 */
export function isUserAdmin(user: { id?: string; email?: string } | null | undefined): boolean {
  if (!user) {
    return false;
  }
  return isAdmin(user.id || user.email || "");
}

