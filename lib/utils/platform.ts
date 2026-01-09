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

