"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import type { VotingData, PersonWithVotes, ResourceWithVotes, AppWithVotes } from "@onedb/types";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";

export default function VotingPage() {
  const { isAuthenticated } = useAuth();
  const [votingData, setVotingData] = useState<VotingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotingData();
    // Refreshing every 30 seconds
    const interval = setInterval(fetchVotingData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchVotingData = async () => {
    try {
      const res = await apiClient.getVotingData();
      setVotingData(res.data);
    } catch (error) {
      console.error("Error fetching voting data:", error);
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
      fetchVotingData(); // Refresh data
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
    ...(votingData?.people || []),
    ...(votingData?.resources || []),
    ...(votingData?.apps || []),
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
      <h1 className="text-3xl font-bold mb-8">Community Voting</h1>
      <p className="text-muted-foreground mb-8">
        Review and vote on pending submissions. It needs community approval before being added to the database.
      </p>

      {allPending.length === 0 ? (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground text-lg">No pending submissions to review.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* People */}
          {votingData?.people && votingData.people.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">People ({votingData.people.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {votingData.people.map((person) => {
                  const userVote = person.userVote;
                  const isUpvoted = userVote?.voteType === "upvote";
                  const isDownvoted = userVote?.voteType === "downvote";
                  
                  return (
                    <div key={person.id} className="border rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-2">{person.name}</h3>
                      {person.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {person.description}
                        </p>
                      )}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="text-green-600 font-medium">
                              ↑ {person.votes?.upvotes || 0} upvote{(person.votes?.upvotes || 0) !== 1 ? "s" : ""}
                            </div>
                            <div className="text-red-600 font-medium">
                              ↓ {person.votes?.downvotes || 0} downvote{(person.votes?.downvotes || 0) !== 1 ? "s" : ""}
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
                              className={isUpvoted ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={isDownvoted ? "default" : "outline"}
                              onClick={() => handleVote("downvote", person.id)}
                              disabled={!isAuthenticated}
                              className={isDownvoted ? "bg-red-600 hover:bg-red-700" : ""}
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
            </section>
          )}

          {/* Resources */}
          {votingData?.resources && votingData.resources.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Resources ({votingData.resources.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {votingData.resources.map((resource) => {
                  const userVote = resource.userVote;
                  const isUpvoted = userVote?.voteType === "upvote";
                  const isDownvoted = userVote?.voteType === "downvote";
                  
                  return (
                    <div key={resource.id} className="border rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-2">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="text-green-600 font-medium">
                              ↑ {resource.votes?.upvotes || 0} upvote{(resource.votes?.upvotes || 0) !== 1 ? "s" : ""}
                            </div>
                            <div className="text-red-600 font-medium">
                              ↓ {resource.votes?.downvotes || 0} downvote{(resource.votes?.downvotes || 0) !== 1 ? "s" : ""}
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
                              className={isUpvoted ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={isDownvoted ? "default" : "outline"}
                              onClick={() => handleVote("downvote", undefined, resource.id)}
                              disabled={!isAuthenticated}
                              className={isDownvoted ? "bg-red-600 hover:bg-red-700" : ""}
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
            </section>
          )}

          {/* Apps */}
          {votingData?.apps && votingData.apps.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Apps ({votingData.apps.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {votingData.apps.map((app) => {
                  const userVote = app.userVote;
                  const isUpvoted = userVote?.voteType === "upvote";
                  const isDownvoted = userVote?.voteType === "downvote";
                  
                  return (
                    <div key={app.id} className="border rounded-lg p-6">
                      <h3 className="text-lg font-bold mb-2">{app.name}</h3>
                      {app.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {app.description}
                        </p>
                      )}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <div className="text-green-600 font-medium">
                              ↑ {app.votes?.upvotes || 0} upvote{(app.votes?.upvotes || 0) !== 1 ? "s" : ""}
                            </div>
                            <div className="text-red-600 font-medium">
                              ↓ {app.votes?.downvotes || 0} downvote{(app.votes?.downvotes || 0) !== 1 ? "s" : ""}
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
                              className={isUpvoted ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={isDownvoted ? "default" : "outline"}
                              onClick={() => handleVote("downvote", undefined, undefined, app.id)}
                              disabled={!isAuthenticated}
                              className={isDownvoted ? "bg-red-600 hover:bg-red-700" : ""}
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
            </section>
          )}
        </div>
      )}
    </div>
  );
}


