/**
 * Gets the base URL for the application
 * Uses NEXT_PUBLIC_BASE_URL or falls back to localhost for development
 */
function getBaseUrl(): string {
  // In production, use the environment variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // For development, default to localhost
  return "http://localhost:3000";
}

/**
 * Generates an absolute URL for OG images
 * Uses NEXT_PUBLIC_BASE_URL or falls back to localhost for development
 */
export function getOgImageUrl(params: {
  type?: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string;
}): string {
  const baseUrl = getBaseUrl();
  const searchParams = new URLSearchParams();
  
  if (params.type) searchParams.set("type", params.type);
  if (params.title) searchParams.set("title", params.title);
  if (params.description) searchParams.set("description", params.description);
  if (params.category) searchParams.set("category", params.category);
  if (params.tags) searchParams.set("tags", params.tags);
  
  return `${baseUrl}/api/og?${searchParams.toString()}`;
}

