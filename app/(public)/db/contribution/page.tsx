"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import type { ContributorsData, PersonWithVotes, ResourceWithVotes, AppWithVotes } from "@/lib/types";
import { ThumbsUp, ThumbsDown, CheckCircle2, ExternalLink, Trash2, Shield, User } from "lucide-react";

export default function ContributorsPage() {
  const { isAuthenticated } = useAuth();
  const [contributorsData, setContributorsData] = useState<ContributorsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get request type badge info
  const getRequestTypeBadge = (contributionType: string | null | undefined) => {
    if (!contributionType || contributionType === "new") {
      return { label: "Add", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700" };
    }
    if (contributionType === "edit") {
      return { label: "Edit", color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700" };
    }
    if (contributionType === "delete") {
      return { label: "Delete", color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700" };
    }
    return { label: "Add", color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700" };
  };

  useEffect(() => {
    fetchContributorsData();
    // Refreshing every 30 seconds
    const interval = setInterval(fetchContributorsData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchContributorsData = async () => {
    try {
      const res = await apiClient.getContributorsData();
      setContributorsData(res.data || null);
      // Debug: log admin status
      if (res.data?.isAdmin) {
        console.log("User is admin");
      }
    } catch (error) {
      console.error("Error fetching contributors data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (
    type: "upvote" | "downvote",
    peopleId?: string,
    resourceId?: string,
    appId?: string
  ) => {
    if (!isAuthenticated) {
      alert("Please sign in to vote");
      return;
    }

    try {
      await apiClient.vote({
        peopleId,
        resourceId,
        appId,
        voteType: type,
      });
      fetchContributorsData(); // Refresh data
    } catch (error) {
      console.error("Error voting:", error);
      alert("Failed to vote. Please try again.");
    }
  };

  const handleAdminApprove = async (type: "people" | "resource" | "app", id: string) => {
    if (!confirm(`Are you sure you want to approve this ${type}?`)) {
      return;
    }

    try {
      await apiClient.adminApprove(type, id);
      fetchContributorsData();
    } catch (error: any) {
      console.error("Error approving:", error);
      alert(error?.response?.data?.error || "Failed to approve. Please try again.");
    }
  };

  const handleAdminDelete = async (type: "people" | "resource" | "app", id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.adminDelete(type, id);
      fetchContributorsData();
    } catch (error: any) {
      console.error("Error deleting:", error);
      alert(error?.response?.data?.error || "Failed to delete. Please try again.");
    }
  };

  const isAdmin = contributorsData?.isAdmin === true;

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

  const allPending = [
    ...(contributorsData?.pendingSubmissions.people || []),
    ...(contributorsData?.pendingSubmissions.resources || []),
    ...(contributorsData?.pendingSubmissions.apps || []),
  ];

  // Rendering approval progress
  const renderApprovalProgress = (item: PersonWithVotes | ResourceWithVotes | AppWithVotes) => {
    const approvalStatus = item.approvalStatus;
    if (!approvalStatus) return null;

    const upvotes = approvalStatus.upvotes || 0;
    const downvotes = approvalStatus.downvotes || 0;
    const total = approvalStatus.total || 0;
    const ratioThreshold = approvalStatus.ratioThreshold || 3;
    const minVotes = approvalStatus.minVotes || 50;
    const votesNeeded = approvalStatus.votesNeeded ?? 0;
    const meetsMinVotes = approvalStatus.meetsMinVotes ?? false;
    const meetsRatio = approvalStatus.meetsRatio ?? false;
    
    // Calculate progress - show progress towards both requirements
    const progressMinVotes = Math.min(100, (total / minVotes) * 100);
    const requiredUpvotesForRatio = downvotes > 0 ? ratioThreshold * downvotes : minVotes;
    const progressRatio = requiredUpvotesForRatio > 0 ? Math.min(100, (upvotes / requiredUpvotesForRatio) * 100) : 0;
    // Overall progress is the minimum of both (both must be met)
    const progress = Math.min(progressMinVotes, progressRatio);

    // Calculate how many more votes are needed
    const votesNeededForMin = approvalStatus.votesNeededForMin || 0;
    const votesNeededForRatio = approvalStatus.votesNeededForRatio || 0;
    const maxVotesNeeded = Math.max(votesNeededForMin, votesNeededForRatio);

    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Approval Progress</span>
          {approvalStatus.approved && (
            <span className="flex items-center gap-1 text-green-600 font-semibold">
              <CheckCircle2 className="h-3 w-3" />
              Approved
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {approvalStatus.approved ? (
            <span className="text-green-600">✓ Approved</span>
          ) : (
            <span>Needs {maxVotesNeeded} more vote{maxVotesNeeded !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Section 1: Pending Submissions for Voting */}
      {allPending.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Pending Submissions for Voting</h2>
            {isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-md">
                <Shield className="h-4 w-4 text-yellow-700 dark:text-yellow-400" />
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Admin Mode</span>
              </div>
            )}
          </div>
          <p className="text-muted-foreground mb-6">
            Review and vote on pending submissions. They need <strong>minimum 50 votes</strong> and a <strong>healthy 3x upvote ratio</strong> (upvotes ≥ 3× downvotes) to be automatically approved, or admin approval.
          </p>

          <div className="space-y-8">
            {/* People */}
            {contributorsData?.pendingSubmissions.people && contributorsData.pendingSubmissions.people.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">People ({contributorsData.pendingSubmissions.people.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contributorsData.pendingSubmissions.people.map((person) => {
                    const userVote = person.userVote;
                    const isUpvoted = userVote?.voteType === "upvote";
                    const isDownvoted = userVote?.voteType === "downvote";
                    
                    return (
                      <div key={person.id} className="border border-muted rounded-lg p-6 hover:border-primary/50 transition-colors">
                        <div className="flex gap-4 mb-4">
                          {person.image && (
                            <img
                              src={person.image}
                              alt={person.name}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-bold">{person.name}</h4>
                              {(() => {
                                const badge = getRequestTypeBadge(person.contributionType);
                                return (
                                  <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </div>
                            {person.submitter && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <User className="h-3 w-3" />
                                <span>Submitted by </span>
                                {person.submitter.avatar && (
                                  <img
                                    src={person.submitter.avatar}
                                    alt={person.submitter.name || "User"}
                                    className="w-4 h-4 rounded-full"
                                  />
                                )}
                                <span className="font-medium">{person.submitter.name || person.submitter.email}</span>
                              </div>
                            )}
                            {person.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {person.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mb-2">
                              <div className="text-xs px-2 py-1 bg-muted rounded">
                                <strong>Platform:</strong> {person.socialMediaPlatform}
                              </div>
                              {person.followersCount && (
                                <div className="text-xs px-2 py-1 bg-muted rounded">
                                  <strong>Followers:</strong> {person.followersCount.toLocaleString()}
                                </div>
                              )}
                              {person.tags && person.tags.length > 0 && (
                                <div className="text-xs px-2 py-1 bg-muted rounded">
                                  <strong>Tags:</strong> {person.tags.join(", ")}
                                </div>
                              )}
                            </div>
                            {person.socialMediaLink && (
                              <a
                                href={person.socialMediaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                View Profile <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {person.votes?.upvotes || 0}
                                </span>
                                <span className="text-red-600 font-medium flex items-center gap-1">
                                  <ThumbsDown className="h-4 w-4" />
                                  {person.votes?.downvotes || 0}
                                </span>
                              </div>
                              {userVote && (
                                <div className="text-xs text-blue-600 mt-1">
                                  You voted {userVote.voteType === "upvote" ? "👍" : "👎"}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={isUpvoted ? "default" : "outline"}
                                onClick={() => handleVote("upvote", person.id)}
                                disabled={!isAuthenticated}
                                className={isUpvoted ? "bg-green-600 hover:!bg-green-600" : "hover:!bg-transparent"}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={isDownvoted ? "default" : "outline"}
                                onClick={() => handleVote("downvote", person.id)}
                                disabled={!isAuthenticated}
                                className={isDownvoted ? "bg-red-600 hover:!bg-red-600" : "hover:!bg-transparent"}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {renderApprovalProgress(person)}
                          {isAdmin && (
                            <div className="flex gap-2 pt-2 border-t border-muted mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdminApprove("people", person.id)}
                                className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Approve (Admin)
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdminDelete("people", person.id)}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete (Admin)
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Resources */}
            {contributorsData?.pendingSubmissions.resources && contributorsData.pendingSubmissions.resources.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Resources ({contributorsData.pendingSubmissions.resources.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contributorsData.pendingSubmissions.resources.map((resource) => {
                    const userVote = resource.userVote;
                    const isUpvoted = userVote?.voteType === "upvote";
                    const isDownvoted = userVote?.voteType === "downvote";
                    
                    return (
                      <div key={resource.id} className="border border-muted rounded-lg p-6 hover:border-primary/50 transition-colors">
                        <div className="flex gap-4 mb-4">
                          {resource.image && (
                            <img
                              src={resource.image}
                              alt={resource.title}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-bold">{resource.title}</h4>
                              {(() => {
                                const badge = getRequestTypeBadge(resource.contributionType);
                                return (
                                  <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </div>
                            {resource.submitter && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <User className="h-3 w-3" />
                                <span>Submitted by </span>
                                {resource.submitter.avatar && (
                                  <img
                                    src={resource.submitter.avatar}
                                    alt={resource.submitter.name || "User"}
                                    className="w-4 h-4 rounded-full"
                                  />
                                )}
                                <span className="font-medium">{resource.submitter.name || resource.submitter.email}</span>
                              </div>
                            )}
                            {resource.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {resource.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mb-2">
                              <div className="text-xs px-2 py-1 bg-muted rounded">
                                <strong>Category:</strong> {resource.category}
                              </div>
                              {resource.tags && resource.tags.length > 0 && (
                                <div className="text-xs px-2 py-1 bg-muted rounded">
                                  <strong>Tags:</strong> {resource.tags.join(", ")}
                                </div>
                              )}
                            </div>
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                Visit Resource <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {resource.votes?.upvotes || 0}
                                </span>
                                <span className="text-red-600 font-medium flex items-center gap-1">
                                  <ThumbsDown className="h-4 w-4" />
                                  {resource.votes?.downvotes || 0}
                                </span>
                              </div>
                              {userVote && (
                                <div className="text-xs text-blue-600 mt-1">
                                  You voted {userVote.voteType === "upvote" ? "👍" : "👎"}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={isUpvoted ? "default" : "outline"}
                                onClick={() => handleVote("upvote", undefined, resource.id)}
                                disabled={!isAuthenticated}
                                className={isUpvoted ? "bg-green-600 hover:!bg-green-600" : "hover:!bg-transparent"}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={isDownvoted ? "default" : "outline"}
                                onClick={() => handleVote("downvote", undefined, resource.id)}
                                disabled={!isAuthenticated}
                                className={isDownvoted ? "bg-red-600 hover:!bg-red-600" : "hover:!bg-transparent"}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {renderApprovalProgress(resource)}
                          {isAdmin && (
                            <div className="flex gap-2 pt-2 border-t border-muted mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdminApprove("resource", resource.id)}
                                className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Approve (Admin)
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdminDelete("resource", resource.id)}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete (Admin)
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Apps */}
            {contributorsData?.pendingSubmissions.apps && contributorsData.pendingSubmissions.apps.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Apps ({contributorsData.pendingSubmissions.apps.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contributorsData.pendingSubmissions.apps.map((app) => {
                    const userVote = app.userVote;
                    const isUpvoted = userVote?.voteType === "upvote";
                    const isDownvoted = userVote?.voteType === "downvote";
                    
                    return (
                      <div key={app.id} className="border border-muted rounded-lg p-6 hover:border-primary/50 transition-colors">
                        <div className="flex gap-4 mb-4">
                          {app.logo && (
                            <img
                              src={app.logo}
                              alt={app.name}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-bold">{app.name}</h4>
                              {(() => {
                                const badge = getRequestTypeBadge(app.contributionType);
                                return (
                                  <span className={`text-xs px-2 py-0.5 rounded font-semibold border ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                );
                              })()}
                            </div>
                            {app.submitter && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <User className="h-3 w-3" />
                                <span>Submitted by </span>
                                {app.submitter.avatar && (
                                  <img
                                    src={app.submitter.avatar}
                                    alt={app.submitter.name || "User"}
                                    className="w-4 h-4 rounded-full"
                                  />
                                )}
                                <span className="font-medium">{app.submitter.name || app.submitter.email}</span>
                              </div>
                            )}
                            {app.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {app.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mb-2">
                              <div className="text-xs px-2 py-1 bg-muted rounded">
                                <strong>Category:</strong> {app.category}
                              </div>
                              {app.tags && app.tags.length > 0 && (
                                <div className="text-xs px-2 py-1 bg-muted rounded">
                                  <strong>Tags:</strong> {app.tags.join(", ")}
                                </div>
                              )}
                            </div>
                            {app.url && (
                              <a
                                href={app.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                Visit App <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div className="flex items-center gap-3">
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4" />
                                  {app.votes?.upvotes || 0}
                                </span>
                                <span className="text-red-600 font-medium flex items-center gap-1">
                                  <ThumbsDown className="h-4 w-4" />
                                  {app.votes?.downvotes || 0}
                                </span>
                              </div>
                              {userVote && (
                                <div className="text-xs text-blue-600 mt-1">
                                  You voted {userVote.voteType === "upvote" ? "👍" : "👎"}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={isUpvoted ? "default" : "outline"}
                                onClick={() => handleVote("upvote", undefined, undefined, app.id)}
                                disabled={!isAuthenticated}
                                className={isUpvoted ? "bg-green-600 hover:!bg-green-600" : "hover:!bg-transparent"}
                              >
                                <ThumbsUp className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={isDownvoted ? "default" : "outline"}
                                onClick={() => handleVote("downvote", undefined, undefined, app.id)}
                                disabled={!isAuthenticated}
                                className={isDownvoted ? "bg-red-600 hover:!bg-red-600" : "hover:!bg-transparent"}
                              >
                                <ThumbsDown className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {renderApprovalProgress(app)}
                          {isAdmin && (
                            <div className="flex gap-2 pt-2 border-t border-muted mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdminApprove("app", app.id)}
                                className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                              >
                                <Shield className="h-4 w-4 mr-1" />
                                Approve (Admin)
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdminDelete("app", app.id)}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete (Admin)
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Border between voting and contributors sections */}
      {allPending.length > 0 && (
        <div className="border-t border-border my-12"></div>
      )}

      {/* Contributors heading and description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Contributors</h1>
        <p className="text-muted-foreground">
          Recognizing the amazing people who contribute to oneDB through submissions and code.
        </p>
      </div>

      {/* Section 2: Database Contributors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Database Contributors</h2>
        <p className="text-muted-foreground mb-6">
          Contributors who have added content to the database, sorted by most submissions.
        </p>

        {!contributorsData?.dbContributors || contributorsData.dbContributors.length === 0 ? (
          <div className="text-center py-12" role="status">
            <p className="text-muted-foreground text-lg">No contributors yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributorsData.dbContributors.map((contributor) => (
              <div key={contributor.userId} className="border border-muted rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {contributor.avatar ? (
                    <img
                      src={contributor.avatar}
                      alt={contributor.name || "Contributor"}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-semibold text-sm">
                        {(contributor.name || "C")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-semibold text-base truncate">{contributor.name || "Anonymous"}</h3>
                      <span className="text-sm text-muted-foreground font-medium">~ 
                        {contributor.totalSubmissions} {contributor.totalSubmissions === 1 ? "contribution" : "contributions"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  {contributor.peopleCount > 0 && (
                    <span>People: <span className="font-medium">{contributor.peopleCount}</span></span>
                  )}
                  {contributor.resourcesCount > 0 && (
                    <span>Resources: <span className="font-medium">{contributor.resourcesCount}</span></span>
                  )}
                  {contributor.appsCount > 0 && (
                    <span>Apps: <span className="font-medium">{contributor.appsCount}</span></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 3: GitHub Contributors */}
      <section>
        <h2 className="text-2xl font-bold mb-4">GitHub Contributors</h2>
        <p className="text-muted-foreground mb-6">
          Top contributors who have contributed code to the oneDB repository on GitHub.
        </p>

        {!contributorsData?.githubContributors || contributorsData.githubContributors.length === 0 ? (
          <div className="text-center py-12" role="status">
            <p className="text-muted-foreground text-lg">No GitHub contributors found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributorsData.githubContributors.map((contributor) => (
              <div key={contributor.login} className="border border-muted rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={contributor.avatar}
                    alt={contributor.login}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base truncate">{contributor.login}</h3>
                    <a
                      href={contributor.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                    >
                      View Profile
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
