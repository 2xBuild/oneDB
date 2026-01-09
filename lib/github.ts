// GitHub API utilities with caching

interface GitHubCache {
  stars?: { count: number; timestamp: number };
  contributors?: { count: number; timestamp: number };
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const GITHUB_OWNER = "2xBuild"; 
const GITHUB_REPO = "oneDB"; 

let cache: GitHubCache = {};

// Fetches repo star count with caching to avoid rate limits
export async function getGitHubStars(): Promise<number> {
  // Checking cache
  if (cache.stars && Date.now() - cache.stars.timestamp < CACHE_DURATION) {
    return cache.stars.count;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const starCount = data.stargazers_count || 0;

    // Updating cache
    cache.stars = {
      count: starCount,
      timestamp: Date.now(),
    };

    return starCount;
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    // Returning cached value or 0
    return cache.stars?.count || 0;
  }
}

// Fetches contributor count with caching to avoid rate limits
export async function getGitHubContributors(): Promise<number> {
  // Checking cache
  if (
    cache.contributors &&
    Date.now() - cache.contributors.timestamp < CACHE_DURATION
  ) {
    return cache.contributors.count;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contributors?per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 }, // Revalidate every hour
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const contributors = await response.json();
    // Filtering out bots and counting unique contributors
    const contributorCount =
      Array.isArray(contributors)
        ? contributors.filter(
            (contributor: any) => contributor.type === "User"
          ).length
        : 0;

    // Updating cache
    cache.contributors = {
      count: contributorCount,
      timestamp: Date.now(),
    };

    return contributorCount;
  } catch (error) {
    console.error("Error fetching GitHub contributors:", error);
    // Returning cached value or 0
    return cache.contributors?.count || 0;
  }
}

// Clears the cache (useful for testing or manual refresh)
export function clearGitHubCache() {
  cache = {};
}

