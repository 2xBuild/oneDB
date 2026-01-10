"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import type { ContributorsData, PersonWithVotes, ResourceWithVotes, AppWithVotes } from "@/lib/types";
import { ThumbsUp, ThumbsDown, CheckCircle2, ExternalLink } from "lucide-react";

export default function ContributorsPage() {
  const { isAuthenticated } = useAuth();
  const [contributorsData, setContributorsData] = useState<ContributorsData | null>(null);
  const [loading, setLoading] = useState(true);

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

    const threshold = approvalStatus.threshold || 10;
    const percentageThreshold = approvalStatus.percentageThreshold || 70;
    const upvotes = approvalStatus.upvotes || 0;
    const votesNeeded = approvalStatus.votesNeeded ?? approvalStatus.votesNeededForThreshold ?? 0;
    const progress = Math.min(100, (upvotes / threshold) * 100);

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
            <span className="text-green-600">✓ Meets approval requirements</span>
          ) : (
            <span>
              Needs {votesNeeded} more upvote{votesNeeded !== 1 ? "s" : ""} to reach {threshold} upvotes
              {!approvalStatus.meetsPercentage && (
                <span> or {percentageThreshold}% positive rating</span>
              )}
            </span>
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
          <h2 className="text-2xl font-bold mb-4">Pending Submissions for Voting</h2>
          <p className="text-muted-foreground mb-6">
            Review and vote on pending submissions. They need community approval before being added to the database.
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
                      <div key={person.id} className="border border-muted rounded-lg p-6">
                        <h4 className="text-lg font-bold mb-2">{person.name}</h4>
                        {person.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {person.description}
                          </p>
                        )}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600 font-medium">
                                  ↑ {person.votes?.upvotes || 0} upvote{(person.votes?.upvotes || 0) !== 1 ? "s" : ""}
                                </span>
                                <span className="text-red-600 font-medium">
                                  ↓ {person.votes?.downvotes || 0} downvote{(person.votes?.downvotes || 0) !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="text-muted-foreground">
                                {person.votes?.percentage.toFixed(1) || 0}% positive
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
                      <div key={resource.id} className="border border-muted rounded-lg p-6">
                        <h4 className="text-lg font-bold mb-2">{resource.title}</h4>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {resource.description}
                          </p>
                        )}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600 font-medium">
                                  ↑ {resource.votes?.upvotes || 0} upvote{(resource.votes?.upvotes || 0) !== 1 ? "s" : ""}
                                </span>
                                <span className="text-red-600 font-medium">
                                  ↓ {resource.votes?.downvotes || 0} downvote{(resource.votes?.downvotes || 0) !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="text-muted-foreground">
                                {resource.votes?.percentage.toFixed(1) || 0}% positive
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
                      <div key={app.id} className="border border-muted rounded-lg p-6">
                        <h4 className="text-lg font-bold mb-2">{app.name}</h4>
                        {app.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {app.description}
                          </p>
                        )}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600 font-medium">
                                  ↑ {app.votes?.upvotes || 0} upvote{(app.votes?.upvotes || 0) !== 1 ? "s" : ""}
                                </span>
                                <span className="text-red-600 font-medium">
                                  ↓ {app.votes?.downvotes || 0} downvote{(app.votes?.downvotes || 0) !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="text-muted-foreground">
                                {app.votes?.percentage.toFixed(1) || 0}% positive
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
