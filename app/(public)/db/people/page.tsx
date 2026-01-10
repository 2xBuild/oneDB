"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/api";
import type { Person, LikeAggregation } from "@/lib/types";
import { Input, LikeDislike } from "@/components/ui";
import Image from "next/image";
import { Twitter, Linkedin, Youtube, Instagram, Github, Globe, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { formatFollowerCount, getFollowerLabel, capitalizeFirst, getPlatformDisplayName, normalizePlatformName } from "@/lib/format-utils";
import DBSortSelector, { type PeopleSortType } from "../components/DBSortSelector";

const platformIcons: Record<string, any> = {
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  instagram: Instagram,
  github: Github,
};

function getPlatformIcon(platform: string) {
  // Normalizing platform name for icon lookup
  const normalized = platform.toLowerCase();
  return platformIcons[normalized] || Globe;
}

interface PersonWithLikes extends Person {
  likes?: LikeAggregation;
  userLike?: boolean | null;
}

export default function PeoplePage() {
  const [people, setPeople] = useState<PersonWithLikes[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<PeopleSortType>('likes');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const platformParam = params.get("platform");
      const tagParam = params.get("tag");
      if (platformParam) {
        // Normalizing platform name from URL parameter
        setPlatformFilter(normalizePlatformName(platformParam));
      }
      if (tagParam) {
        setTagFilter(tagParam);
      }
    }
  }, []);

  const fetchPeople = useCallback(async () => {
    try {
      const res = await apiClient.getPeople({
        limit: 100,
        platform: platformFilter ? normalizePlatformName(platformFilter) : undefined,
        tags: tagFilter ? [tagFilter] : undefined,
      });
      const peopleData = res.data || [];
      
      // Fetching likes for each person
      const peopleWithLikes = await Promise.all(
        peopleData.map(async (person) => {
          try {
            const likesRes = await apiClient.getPersonLikes(person.id);
            let userLike = null;
            if (isAuthenticated && user?.id) {
              try {
                const userLikeRes = await apiClient.get<{ isLike: boolean | null }>(`/db/people/${person.id}/user-like`);
                userLike = userLikeRes.data?.isLike ?? null;
              } catch {
                // Endpoint doesn't exist, userLike stays null
              }
            }
            return { ...person, likes: likesRes.data, userLike };
          } catch {
            return { ...person, likes: { likes: 0, dislikes: 0, total: 0 }, userLike: null };
          }
        })
      );
      
      setPeople(peopleWithLikes);
    } catch (error) {
      console.error("Error fetching people:", error);
    } finally {
      setLoading(false);
    }
  }, [platformFilter, tagFilter, isAuthenticated, user?.id]);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  const filteredPeople = people.filter((person) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      person.name.toLowerCase().includes(query) ||
      person.description?.toLowerCase().includes(query) ||
      person.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  // Sorting helpers
  const sortByLikes = (a: PersonWithLikes, b: PersonWithLikes) => {
    const aLikes = a.likes?.likes || 0;
    const aDislikes = a.likes?.dislikes || 0;
    const aNetLikes = aLikes - aDislikes;
    
    const bLikes = b.likes?.likes || 0;
    const bDislikes = b.likes?.dislikes || 0;
    const bNetLikes = bLikes - bDislikes;
    
    // Sorting by net likes (likes - dislikes), then total likes, then time
    if (bNetLikes !== aNetLikes) {
      return bNetLikes - aNetLikes;
    }
    if (bLikes !== aLikes) {
      return bLikes - aLikes;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };

  const sortByFollowers = (a: PersonWithLikes, b: PersonWithLikes) => {
    const aFollowers = a.followersCount ?? 0;
    const bFollowers = b.followersCount ?? 0;
    
    // Sorting by followers count (descending), then likes, then time
    if (bFollowers !== aFollowers) {
      return bFollowers - aFollowers;
    }
    return sortByLikes(a, b);
  };

  const sortByFirstAdded = (a: PersonWithLikes, b: PersonWithLikes) => {
    // Sorting by oldest first
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  };

  const sortByLastAdded = (a: PersonWithLikes, b: PersonWithLikes) => {
    // Sorting by newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };

  // Applying sorting based on selected sort type
  const sortedPeople = useMemo(() => {
    const sorted = [...filteredPeople];
    switch (sortBy) {
      case 'likes':
        return sorted.sort(sortByLikes);
      case 'followers':
        return sorted.sort(sortByFollowers);
      case 'first-added':
        return sorted.sort(sortByFirstAdded);
      case 'last-added':
        return sorted.sort(sortByLastAdded);
      default:
        return sorted;
    }
  }, [filteredPeople, sortBy]);

  const platforms = Array.from(new Set(people.map((p) => p.socialMediaPlatform))).sort();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" role="status" aria-live="polite">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">People</h1>

      {/* Search and Active Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <Input
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <DBSortSelector sortBy={sortBy} onSortChange={setSortBy} type="people" />
        </div>
        {tagFilter && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active tag filter:</span>
            <span className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded-md">
              {tagFilter}
            </span>
            <button
              onClick={() => {
                setTagFilter("");
                const params = new URLSearchParams(window.location.search);
                params.delete("tag");
                window.history.pushState({}, "", `?${params.toString()}`);
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Platform Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Filter by Platform</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setPlatformFilter("");
              const params = new URLSearchParams(window.location.search);
              params.delete("platform");
              window.history.pushState({}, "", `?${params.toString()}`);
            }}
            className={`px-4 py-2 rounded-md border transition-colors text-sm ${
              platformFilter === ""
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-accent"
            }`}
          >
            All Platforms
          </button>
          {platforms.map((platform) => {
            const PlatformIcon = getPlatformIcon(platform);
            const displayName = getPlatformDisplayName(platform);
            return (
              <button
                key={platform}
                onClick={() => {
                  setPlatformFilter(platform);
                  const params = new URLSearchParams(window.location.search);
                  params.set("platform", platform);
                  window.history.pushState({}, "", `?${params.toString()}`);
                }}
                className={`px-4 py-2 rounded-md border  transition-colors text-sm flex items-center gap-2 ${
                  platformFilter === platform
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:bg-accent"
                }`}
              >
                <PlatformIcon className="w-4 h-4" />
                {displayName}
              </button>
            );
          })}
        </div>
      </div>

      {/* People list */}
      {sortedPeople.length === 0 ? (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground">No people found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPeople.map((person) => {
            const PlatformIcon = getPlatformIcon(person.socialMediaPlatform);
            const followerLabel = getFollowerLabel(person.socialMediaPlatform);
            const platformDisplayName = getPlatformDisplayName(person.socialMediaPlatform);
            
            const handleLikeChange = async (isLike: boolean) => {
              if (!isAuthenticated) return;
              
              // Optimistically updating
              const previousLike = person.userLike;
              const previousLikes = person.likes;
              
              // Computing optimistic counts (ensuring numbers)
              let optimisticLikes = Number(previousLikes?.likes || 0);
              let optimisticDislikes = Number(previousLikes?.dislikes || 0);
              let optimisticTotal = Number(previousLikes?.total || 0);
              
              // Clicking same button removes the like/dislike
              if ((isLike && previousLike === true) || (!isLike && previousLike === false)) {
                // Removing like/dislike
                if (previousLike === true) optimisticLikes = Math.max(0, optimisticLikes - 1);
                if (previousLike === false) optimisticDislikes = Math.max(0, optimisticDislikes - 1);
                optimisticTotal = Math.max(0, optimisticTotal - 1);
                
                // Updating state optimistically
                setPeople((prev) =>
                  prev.map((p) =>
                    p.id === person.id
                      ? {
                          ...p,
                          userLike: null,
                          likes: {
                            likes: optimisticLikes,
                            dislikes: optimisticDislikes,
                            total: optimisticTotal,
                          },
                        }
                      : p
                  )
                );
              } else {
                // Adding or changing like/dislike
                // Removing previous like/dislike if exists
                if (previousLike === true) optimisticLikes = Math.max(0, optimisticLikes - 1);
                if (previousLike === false) optimisticDislikes = Math.max(0, optimisticDislikes - 1);
                if (previousLike !== null) optimisticTotal = Math.max(0, optimisticTotal - 1);
                
                // Adding new like/dislike
                if (isLike) optimisticLikes += 1;
                else optimisticDislikes += 1;
                optimisticTotal += 1;
                
                // Updating state optimistically
                setPeople((prev) =>
                  prev.map((p) =>
                    p.id === person.id
                      ? {
                          ...p,
                          userLike: isLike,
                          likes: {
                            likes: optimisticLikes,
                            dislikes: optimisticDislikes,
                            total: optimisticTotal,
                          },
                        }
                      : p
                  )
                );
              }
              
              try {
                // Clicking same active button unlikes
                if ((isLike && previousLike === true) || (!isLike && previousLike === false)) {
                  await apiClient.unlikePerson(person.id);
                } else {
                  // Liking or disliking
                  await apiClient.likePerson(person.id, isLike);
                }
                
                // Refreshing data to get accurate counts
                const likesRes = await apiClient.getPersonLikes(person.id);
                let userLike = null;
                if (isAuthenticated && user?.id) {
                  try {
                    const userLikeRes = await apiClient.get<{ isLike: boolean | null }>(`/db/people/${person.id}/user-like`);
                    userLike = userLikeRes.data?.isLike ?? null;
                  } catch {
                    // Endpoint doesn't exist, userLike stays null
                  }
                }
                
                // Updating with server response
                setPeople((prev) =>
                  prev.map((p) =>
                    p.id === person.id
                      ? {
                          ...p,
                          likes: likesRes.data,
                          userLike,
                        }
                      : p
                  )
                );
              } catch (error) {
                console.error("Error updating like:", error);
                // Reverting optimistic update on error
                setPeople((prev) =>
                  prev.map((p) =>
                    p.id === person.id
                      ? {
                          ...p,
                          userLike: previousLike,
                          likes: previousLikes,
                        }
                      : p
                  )
                );
              }
            };

            return (
              <div
                key={person.id}
                className="border border-muted rounded-lg px-4 py-3 hover:shadow-md transition-shadow bg-card"
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Logo/DP */}
                  {person.image ? (
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={person.image}
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <PlatformIcon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Name and Description */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                      <PlatformIcon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <h3 className="text-sm sm:text-base font-semibold truncate">{person.name}</h3>
                      <span className="text-xs text-muted-foreground hidden sm:inline">({platformDisplayName})</span>
                    </div>
                    {person.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 truncate">
                        {person.description}
                      </p>
                    )}
                  </div>

                  {/* Combined Like/Dislike and Follow Button */}
                  <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                    <LikeDislike
                      isLike={person.userLike ?? null}
                      likesCount={person.likes?.likes || 0}
                      dislikesCount={person.likes?.dislikes || 0}
                      totalCount={person.likes?.total || 0}
                      onChange={handleLikeChange}
                      disabled={!isAuthenticated}
                      size="sm"
                      showCounts={true}
                    />
                    <a
                      href={person.socialMediaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2"
                    >
                      <span className="hidden sm:inline">Follow</span>
                      <ExternalLink className="w-3 h-3 sm:w-3 sm:h-3" />
                    </a>
                  </div>
                </div>

                {/* Tags at Bottom with Followers Count */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    {person.tags && person.tags.length > 0 && (
                      <>
                        {person.tags.map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setTagFilter(tagFilter === tag ? "" : tag);
                              // Updating URL
                              const params = new URLSearchParams(window.location.search);
                              if (tagFilter === tag) {
                                params.delete("tag");
                              } else {
                                params.set("tag", tag);
                              }
                              window.history.pushState({}, "", `?${params.toString()}`);
                            }}
                            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                              tagFilter === tag
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            {capitalizeFirst(tag)}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {person.followersCount !== null && person.followersCount !== undefined ? (
                      <>
                        <span className="font-medium">{formatFollowerCount(person.followersCount)}</span>
                        <span>{followerLabel}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">—</span>
                        <span>{followerLabel}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


