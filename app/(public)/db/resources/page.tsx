"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { Resource, LikeAggregation } from "@onedb/types";
import { Input, LikeDislike } from "@/components/ui";
import Image from "next/image";
import { ExternalLink, Globe, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface ResourceWithLikes extends Resource {
  likes?: LikeAggregation;
  userLike?: boolean | null;
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceWithLikes[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get("category");
      const tagParam = params.get("tag");
      if (categoryParam) {
        setCategoryFilter(categoryParam);
      }
      if (tagParam) {
        setTagFilter(tagParam);
      }
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [categoryFilter, tagFilter]);

  const fetchResources = async () => {
    try {
      const res = await apiClient.getResources({
        limit: 100,
        category: categoryFilter || undefined,
        tags: tagFilter ? [tagFilter] : undefined,
      });
      const resourcesData = res.data;
      
      // Fetching likes for each resource
      const resourcesWithLikes = await Promise.all(
        resourcesData.map(async (resource) => {
          try {
            const likesRes = await apiClient.getResourceLikes(resource.id);
            let userLike = null;
            if (isAuthenticated && user?.id) {
              try {
                const userLikeRes = await apiClient.get<{ isLike: boolean | null }>(`/db/resources/${resource.id}/user-like`);
                userLike = userLikeRes.data?.isLike ?? null;
              } catch {
                // Endpoint doesn't exist, userLike stays null
              }
            }
            return { ...resource, likes: likesRes.data, userLike };
          } catch {
            return { ...resource, likes: { likes: 0, dislikes: 0, total: 0 }, userLike: null };
          }
        })
      );
      
      setResources(resourcesWithLikes);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter((resource) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      resource.description?.toLowerCase().includes(query) ||
      resource.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const categories = Array.from(new Set(resources.map((r) => r.category)));

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
      <h1 className="text-3xl font-bold mb-8">Resources</h1>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="relative mr-4">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                const params = new URLSearchParams(window.location.search);
                if (e.target.value) {
                  params.set("category", e.target.value);
                } else {
                  params.delete("category");
                }
                window.history.pushState({}, "", `?${params.toString()}`);
              }}
              className="px-4 py-2 pr-10 border rounded-md appearance-none bg-transparent w-full"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
          </div>
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

      {/* Resources list */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground">No resources found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResources.map((resource) => {
            const handleLikeChange = async (isLike: boolean) => {
              if (!isAuthenticated) return;
              
              // Optimistically updating
              const previousLike = resource.userLike;
              const previousLikes = resource.likes;
              
              // Computing optimistic counts
              let optimisticLikes = previousLikes?.likes || 0;
              let optimisticDislikes = previousLikes?.dislikes || 0;
              let optimisticTotal = previousLikes?.total || 0;
              
              // Clicking same button removes the like/dislike
              if ((isLike && previousLike === true) || (!isLike && previousLike === false)) {
                // Removing like/dislike
                if (previousLike === true) optimisticLikes = Math.max(0, optimisticLikes - 1);
                if (previousLike === false) optimisticDislikes = Math.max(0, optimisticDislikes - 1);
                optimisticTotal = Math.max(0, optimisticTotal - 1);
                
                // Update state optimistically
                setResources((prev) =>
                  prev.map((r) =>
                    r.id === resource.id
                      ? {
                          ...r,
                          userLike: null,
                          likes: {
                            likes: optimisticLikes,
                            dislikes: optimisticDislikes,
                            total: optimisticTotal,
                          },
                        }
                      : r
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
                
                // Update state optimistically
                setResources((prev) =>
                  prev.map((r) =>
                    r.id === resource.id
                      ? {
                          ...r,
                          userLike: isLike,
                          likes: {
                            likes: optimisticLikes,
                            dislikes: optimisticDislikes,
                            total: optimisticTotal,
                          },
                        }
                      : r
                  )
                );
              }
              
              try {
                // Clicking same active button unlikes
                if ((isLike && previousLike === true) || (!isLike && previousLike === false)) {
                  await apiClient.unlikeResource(resource.id);
                } else {
                  // Liking or disliking
                  await apiClient.likeResource(resource.id, isLike);
                }
                
                // Refreshing data to get accurate counts
                const likesRes = await apiClient.getResourceLikes(resource.id);
                let userLike = null;
                if (isAuthenticated && user?.id) {
                  try {
                    const userLikeRes = await apiClient.get<{ isLike: boolean | null }>(`/db/resources/${resource.id}/user-like`);
                    userLike = userLikeRes.data?.isLike ?? null;
                  } catch {
                    // Endpoint doesn't exist, userLike stays null
                  }
                }
                
                // Updating with server response
                setResources((prev) =>
                  prev.map((r) =>
                    r.id === resource.id
                      ? {
                          ...r,
                          likes: likesRes.data,
                          userLike,
                        }
                      : r
                  )
                );
              } catch (error) {
                console.error("Error updating like:", error);
                // Reverting optimistic update on error
                setResources((prev) =>
                  prev.map((r) =>
                    r.id === resource.id
                      ? {
                          ...r,
                          userLike: previousLike,
                          likes: previousLikes,
                        }
                      : r
                  )
                );
              }
            };

            return (
              <div
                key={resource.id}
                className="border border-muted rounded-lg px-4 py-3 hover:shadow-md transition-shadow bg-card"
              >
                <div className="flex items-center gap-4">
                  {/* Logo/Image */}
                  {resource.image ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={resource.image}
                        alt={resource.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Title and Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <h3 className="text-base font-semibold truncate">{resource.title}</h3>
                    </div>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 truncate">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  {/* Like/Dislike Buttons */}
                  <div className="flex-shrink-0">
                    <LikeDislike
                      isLike={resource.userLike ?? null}
                      likesCount={resource.likes?.likes || 0}
                      dislikesCount={resource.likes?.dislikes || 0}
                      totalCount={resource.likes?.total || 0}
                      onChange={handleLikeChange}
                      disabled={!isAuthenticated}
                      size="sm"
                      showCounts={true}
                    />
                  </div>

                  {/* Visit Button */}
                  <div className="flex-shrink-0">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      Visit
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Category and Tags at Bottom */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <span className="px-2 py-1 text-xs bg-muted rounded-full whitespace-nowrap">
                    {resource.category}
                  </span>
                  {resource.tags && resource.tags.length > 0 && (
                    <>
                      {resource.tags.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(tag);
                          }}
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                            tagFilter === tag
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


