/**
 * Utility functions for formatting display values
 */

/**
 * Format follower count for display (e.g., 1.2M, 5.3K)
 */
export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toLocaleString();
}

/**
 * Get the appropriate label for follower count based on platform
 */
export function getFollowerLabel(platform: string): string {
  const normalized = normalizePlatformName(platform);
  const labels: Record<string, string> = {
    twitter: "followers",
    linkedin: "followers",
    youtube: "subscribers",
    instagram: "followers",
    github: "followers",
    facebook: "followers",
    tiktok: "followers",
    reddit: "followers",
    discord: "members",
    telegram: "members",
    whatsapp: "followers",
    snapchat: "followers",
    pinterest: "followers",
    medium: "followers",
    substack: "subscribers",
  };
  return labels[normalized] || "followers";
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Normalize social media platform name to a canonical lowercase value
 * Maps variations like "X", "Twitter", "twitter" to "twitter"
 */
export function normalizePlatformName(platform: string): string {
  if (!platform) return platform;
  
  const normalized = platform.trim().toLowerCase();
  
  // Map common variations to canonical names
  const platformMap: Record<string, string> = {
    "x": "twitter",
    "twitter/x": "twitter",
    "twitter": "twitter",
    "linkedin": "linkedin",
    "youtube": "youtube",
    "instagram": "instagram",
    "github": "github",
    "facebook": "facebook",
    "tiktok": "tiktok",
    "reddit": "reddit",
    "discord": "discord",
    "telegram": "telegram",
    "whatsapp": "whatsapp",
    "snapchat": "snapchat",
    "pinterest": "pinterest",
    "medium": "medium",
    "substack": "substack",
  };
  
  return platformMap[normalized] || normalized;
}

/**
 * Get display name for a normalized platform (capitalize first letter)
 */
export function getPlatformDisplayName(platform: string): string {
  if (!platform) return platform;
  return capitalizeFirst(normalizePlatformName(platform));
}

