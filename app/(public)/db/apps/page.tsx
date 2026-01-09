"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type { App, LikeAggregation } from "@/lib/types";
import { Input, LikeDislike } from "@/components/ui";
import Image from "next/image";
import { ExternalLink, Globe, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface AppWithLikes extends App {
  likes?: LikeAggregation;
  userLike?: boolean | null;
}

export default function AppsPage() {
  const [apps, setApps] = useState<AppWithLikes[]>([]);
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
    fetchApps();
  }, [categoryFilter, tagFilter]);

  const fetchApps = async () => {
    try {
      const res = await apiClient.getApps({
        limit: 100,
        category: categoryFilter || undefined,
        tags: tagFilter ? [tagFilter] : undefined,
      });
      const appsData = res.data || [];
      
      // Fetching likes for each app
      const appsWithLikes = await Promise.all(
        appsData.map(async (app) => {
          try {
            const likesRes = await apiClient.getAppLikes(app.id);
            let userLike = null;
            if (isAuthenticated && user?.id) {
              try {
                const userLikeRes = await apiClient.get<{ isLike: boolean | null }>(`/db/apps/${app.id}/user-like`);
                userLike = userLikeRes.data?.isLike ?? null;
              } catch {
                // Endpoint doesn't exist, userLike stays null
              }
            }
            return { ...app, likes: likesRes.data, userLike };
          } catch {
            return { ...app, likes: { likes: 0, dislikes: 0, total: 0 }, userLike: null };
          }
        })
      );
      
      setApps(appsWithLikes);
    } catch (error) {
      console.error("Error fetching apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = apps.filter((app) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      app.name.toLowerCase().includes(query) ||
      app.description?.toLowerCase().includes(query) ||
      app.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const categories = Array.from(new Set(apps.map((a) => a.category)));

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
      <h1 className="text-3xl font-bold mb-8">Apps</h1>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search apps..."
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
              <option  value="">All Categories </option>
              
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

      {/* Apps List*/}
      {filteredApps.length === 0 ? (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground">No apps found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const handleLikeChange = async (isLike: boolean) => {
              if (!isAuthenticated) return;
              
              // Optimistically updating
              const previousLike = app.userLike;
              const previousLikes = app.likes;
              
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
                
                // Updating state optimistically
                setApps((prev) =>
                  prev.map((a) =>
                    a.id === app.id
                      ? {
                          ...a,
                          userLike: null,
                          likes: {
                            likes: optimisticLikes,
                            dislikes: optimisticDislikes,
                            total: optimisticTotal,
                          },
                        }
                      : a
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
                setApps((prev) =>
                  prev.map((a) =>
                    a.id === app.id
                      ? {
                          ...a,
                          userLike: isLike,
                          likes: {
                            likes: optimisticLikes,
                            dislikes: optimisticDislikes,
                            total: optimisticTotal,
                          },
                        }
                      : a
                  )
                );
              }
              
              try {
                // Clicking same active button unlikes
                if ((isLike && previousLike === true) || (!isLike && previousLike === false)) {
                  await apiClient.unlikeApp(app.id);
                } else {
                  // Liking or disliking
                  await apiClient.likeApp(app.id, isLike);
                }
                
                // Refreshing data to get accurate counts
                const likesRes = await apiClient.getAppLikes(app.id);
                let userLike = null;
                if (isAuthenticated && user?.id) {
                  try {
                    const userLikeRes = await apiClient.get<{ isLike: boolean | null }>(`/db/apps/${app.id}/user-like`);
                    userLike = userLikeRes.data?.isLike ?? null;
                  } catch {
                    // Endpoint doesn't exist, userLike stays null
                  }
                }
                
                // Updating with server response
                setApps((prev) =>
                  prev.map((a) =>
                    a.id === app.id
                      ? {
                          ...a,
                          likes: likesRes.data,
                          userLike,
                        }
                      : a
                  )
                );
              } catch (error) {
                console.error("Error updating like:", error);
                // Reverting optimistic update on error
                setApps((prev) =>
                  prev.map((a) =>
                    a.id === app.id
                      ? {
                          ...a,
                          userLike: previousLike,
                          likes: previousLikes,
                        }
                      : a
                  )
                );
              }
            };

            return (
              <div
                key={app.id}
                className="border border-muted rounded-lg px-4 py-3 hover:shadow-md transition-shadow bg-card"
              >
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  {app.logo ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                      <Image
                        src={app.logo}
                        alt={app.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Name and Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <h3 className="text-base font-semibold truncate">{app.name}</h3>
                    </div>
                    {app.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 truncate">
                        {app.description}
                      </p>
                    )}
                  </div>

                  {/* Like/Dislike Buttons */}
                  <div className="flex-shrink-0">
                    <LikeDislike
                      isLike={app.userLike ?? null}
                      likesCount={app.likes?.likes || 0}
                      dislikesCount={app.likes?.dislikes || 0}
                      totalCount={app.likes?.total || 0}
                      onChange={handleLikeChange}
                      disabled={!isAuthenticated}
                      size="sm"
                      showCounts={true}
                    />
                  </div>

                  {/* Visit Button */}
                  <div className="flex-shrink-0">
                    <a
                      href={app.url}
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
                    {app.category}
                  </span>
                  {app.tags && app.tags.length > 0 && (
                    <>
                      {app.tags.map((tag, idx) => (
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


