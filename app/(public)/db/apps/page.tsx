"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { App, LikeAggregation } from "@/lib/types";
import { Input, LikeEdit, Dialog, DialogContent, DialogHeader, DialogTitle, Button } from "@/components/ui";
import Image from "next/image";
import { ExternalLink, Globe, ChevronDown, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import DBSortSelector, { type AppsResourcesSortType } from "../components/DBSortSelector";

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
  const [sortBy, setSortBy] = useState<AppsResourcesSortType>('likes');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingApp, setDeletingApp] = useState<AppWithLikes | null>(null);
  const router = useRouter();
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

  // Sorting helpers
  const sortByLikes = (a: AppWithLikes, b: AppWithLikes) => {
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

  const sortByFirstAdded = (a: AppWithLikes, b: AppWithLikes) => {
    // Sorting by oldest first
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  };

  const sortByLastAdded = (a: AppWithLikes, b: AppWithLikes) => {
    // Sorting by newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };

  // Applying sorting based on selected sort type
  const sortedApps = useMemo(() => {
    const sorted = [...filteredApps];
    switch (sortBy) {
      case 'likes':
        return sorted.sort(sortByLikes);
      case 'first-added':
        return sorted.sort(sortByFirstAdded);
      case 'last-added':
        return sorted.sort(sortByLastAdded);
      default:
        return sorted;
    }
  }, [filteredApps, sortBy]);

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
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
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
          <DBSortSelector sortBy={sortBy} onSortChange={setSortBy} type="apps" />
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
      {sortedApps.length === 0 ? (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground">No apps found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedApps.map((app) => {
            const handleLikeChange = async (isLike: boolean) => {
              if (!isAuthenticated) return;
              
              // Optimistically updating
              const previousLike = app.userLike;
              const previousLikes = app.likes;
              
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
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Logo */}
                  {app.logo ? (
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                      <Image
                        src={app.logo}
                        alt={app.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                    </div>
                  )}

                  {/* Name and Description */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <h3 className="text-sm sm:text-base font-semibold truncate">{app.name}</h3>
                    </div>
                    {app.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 truncate">
                        {app.description}
                      </p>
                    )}
                  </div>

                  {/* Combined Like/Edit and Visit Button */}
                  <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2">
                    <LikeEdit
                      isLike={app.userLike ?? null}
                      likesCount={app.likes?.likes || 0}
                      totalCount={app.likes?.total || 0}
                      onChange={handleLikeChange}
                      onEdit={() => {
                        router.push(`/db/apps/${app.id}/edit`);
                      }}
                      onDelete={() => {
                        setDeletingApp(app);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={!isAuthenticated}
                      size="sm"
                      showCounts={true}
                    />
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2"
                    >
                      <span className="hidden sm:inline">Visit</span>
                      <ExternalLink className="w-3 h-3 sm:w-3 sm:h-3" />
                    </a>
                  </div>
                </div>

                {/* Category and Tags at Bottom */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border overflow-hidden">
                  <span className="px-2 py-1 text-xs bg-muted rounded-full whitespace-nowrap flex-shrink-0">
                    {app.category}
                  </span>
                  {app.tags && app.tags.length > 0 && (
                    <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                      {app.tags.slice(0, 5).map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSearchQuery(tag);
                          }}
                          className={`px-2 py-1 text-xs rounded-full whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 ${
                            tagFilter === tag
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                      {app.tags.length > 5 && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          +{app.tags.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete App - Submit for Review</DialogTitle>
          </DialogHeader>
          {deletingApp && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to request deletion of <strong>{deletingApp.name}</strong>? 
                This will be sent for community voting and requires approval before the item is deleted.
              </p>
              <div className="flex gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setDeletingApp(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await apiClient.submitAppDelete(deletingApp.id);
                      setDeleteDialogOpen(false);
                      setDeletingApp(null);
                      alert("Delete request submitted. It will be reviewed by the community.");
                      fetchApps();
                    } catch (error: any) {
                      console.error("Error submitting delete:", error);
                      alert(error?.response?.data?.error || "Failed to submit delete request.");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Submit Delete Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


