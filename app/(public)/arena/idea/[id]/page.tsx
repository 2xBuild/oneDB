"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Pencil } from "lucide-react";
import { Button, LikeDislike, CommentThread } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { buildCommentTree, countAllComments } from "@/lib/comments";
import type { Idea, LikeAggregation, Comment, Like } from "@/lib/types";

export default function IdeaPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const id = params.id as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [likeAggregation, setLikeAggregation] = useState<LikeAggregation | null>(null);
  const [userLike, setUserLike] = useState<Like | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [ideaRes, likesRes, commentsRes] = await Promise.all([
        apiClient.getIdea(id),
        apiClient.getIdeaLikes(id).catch(() => ({ data: { likes: 0, dislikes: 0, total: 0 } })),
        apiClient.getIdeaComments(id).catch(() => ({ data: [] })),
      ]);

      setIdea(ideaRes.data || null);
      // Normalize like aggregation to ensure all values are numbers
      const normalizedLikes = {
        likes: Number(likesRes.data?.likes) || 0,
        dislikes: Number(likesRes.data?.dislikes) || 0,
        total: Number(likesRes.data?.total) || 0,
      };
      setLikeAggregation(normalizedLikes);
      setComments(buildCommentTree(commentsRes.data || []));
    } catch (error) {
      console.error("Error fetching idea:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeChange = async (isLike: boolean) => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    // Optimistic update: update UI immediately
    const previousLike = userLike;
    const previousAggregation = likeAggregation;

    if (userLike && userLike.isLike === isLike) {
      // Unlike (remove like/dislike) - optimistic update
      setUserLike(null);
      if (likeAggregation) {
        if (isLike) {
          setLikeAggregation({
            ...likeAggregation,
            likes: Math.max(0, likeAggregation.likes - 1),
            total: Math.max(0, likeAggregation.total - 1),
          });
        } else {
          setLikeAggregation({
            ...likeAggregation,
            dislikes: Math.max(0, likeAggregation.dislikes - 1),
            total: Math.max(0, likeAggregation.total - 1),
          });
        }
      }
    } else {
      // Like or update like/dislike - optimistic update
      const newLike = {
        id: userLike?.id || "temp",
        userId: user?.id || "",
        targetType: "idea" as const,
        targetId: id,
        isLike,
        createdAt: new Date(),
      };
      setUserLike(newLike);

      if (likeAggregation) {
        // If switching from like to dislike or vice versa
        if (previousLike) {
          if (previousLike.isLike && !isLike) {
            // Switching from like to dislike
            setLikeAggregation({
              ...likeAggregation,
              likes: Math.max(0, likeAggregation.likes - 1),
              dislikes: likeAggregation.dislikes + 1,
            });
          } else if (!previousLike.isLike && isLike) {
            // Switching from dislike to like
            setLikeAggregation({
              ...likeAggregation,
              likes: likeAggregation.likes + 1,
              dislikes: Math.max(0, likeAggregation.dislikes - 1),
            });
          }
        } else {
          // New like/dislike
          if (isLike) {
            setLikeAggregation({
              ...likeAggregation,
              likes: likeAggregation.likes + 1,
              total: likeAggregation.total + 1,
            });
          } else {
            setLikeAggregation({
              ...likeAggregation,
              dislikes: likeAggregation.dislikes + 1,
              total: likeAggregation.total + 1,
            });
          }
        }
      }
    }

    // Then make the API call
    try {
      if (previousLike && previousLike.isLike === isLike) {
        // Unlike (remove like/dislike)
        await apiClient.unlikeIdea(id);
        // Already updated optimistically, just refresh to ensure sync
        const likesRes = await apiClient.getIdeaLikes(id);
        const normalizedLikes = {
          likes: Number(likesRes.data?.likes) || 0,
          dislikes: Number(likesRes.data?.dislikes) || 0,
          total: Number(likesRes.data?.total) || 0,
        };
        setLikeAggregation(normalizedLikes);
      } else {
        // Like or update like/dislike
        const res = await apiClient.likeIdea(id, isLike);
        setUserLike(res.data || null);
        // Refresh aggregation to ensure sync
        const likesRes = await apiClient.getIdeaLikes(id);
        const normalizedLikes = {
          likes: Number(likesRes.data?.likes) || 0,
          dislikes: Number(likesRes.data?.dislikes) || 0,
          total: Number(likesRes.data?.total) || 0,
        };
        setLikeAggregation(normalizedLikes);
      }
    } catch (error) {
      console.error("Error updating like:", error);
      // Revert optimistic update on error
      setUserLike(previousLike);
      setLikeAggregation(previousAggregation);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentContent.trim() || !isAuthenticated) return;

    setSubmitting(true);
    try {
      await apiClient.createComment({
        content: commentContent,
        targetType: "idea",
        targetId: id,
      });
      setCommentContent("");
      fetchData();
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    try {
      await apiClient.createComment({
        content,
        targetType: "idea",
        targetId: id,
        parentId,
      });
      fetchData();
    } catch (error) {
      console.error("Error replying:", error);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await apiClient.updateComment(commentId, { content });
      fetchData();
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await apiClient.deleteComment(commentId);
      fetchData();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p>Loading...</p>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p>Idea not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Title and Star Rating */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-4xl font-bold">{idea.title}</h1>
          {isAuthenticated && user && idea.author && user.id === idea.author.id && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/arena/idea/${id}/edit`)}
              className="h-8 w-8"
              title="Edit idea"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex-shrink-0">
          <LikeDislike
            isLike={userLike?.isLike ?? null}
            likesCount={likeAggregation?.likes || 0}
            dislikesCount={likeAggregation?.dislikes || 0}
            totalCount={likeAggregation?.total || 0}
            onChange={handleLikeChange}
            disabled={!isAuthenticated}
          />
        </div>
      </div>

      {/* Description */}
      {(idea.description || idea.bannerImage) && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <div className="text-muted-foreground whitespace-pre-wrap space-y-4">
            {/* Banner Image - shown in description */}
            {idea.bannerImage && (
              <div className="w-full overflow-hidden rounded-lg" style={{ maxWidth: '100%' }}>
                <img
                  src={idea.bannerImage}
                  alt={idea.title}
                  className="w-auto h-auto max-w-full"
                  style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            )}
            {/* Description text */}
            {idea.description && (
              <p>{idea.description}</p>
            )}
          </div>
        </div>
      )}

      {/* Author Section */}
      {idea.author && (
        <div className="flex items-center gap-3 mb-8">
          {idea.author.avatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={idea.author.avatar}
                alt={idea.author.name || "Author"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent flex-shrink-0 flex items-center justify-center">
              <span className="text-base font-bold text-background">
                {(idea.author.name || idea.author.email).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{idea.author.name || idea.author.email}</p>
            {idea.createdAt && (
              <p className="text-xs text-muted-foreground">
                Posted {new Date(idea.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Comments (always visible for ideas) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Discussion ({countAllComments(comments)})</h2>
        </div>

        {/* Comment Form */}
        {isAuthenticated ? (
          <div className="mb-6 space-y-2">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border border-accent rounded-md resize-none"
              rows={4}
            />
            <Button
              onClick={handleCommentSubmit}
              disabled={!commentContent.trim() || submitting}
            >
              {submitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        ) : (
          <div className="mb-6 p-4 border rounded-lg text-center">
            <p className="text-muted-foreground mb-2">Sign in to comment</p>
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          </div>
        )}

        {/* Comments */}
        <CommentThread
          comments={comments}
          currentUserId={user?.id}
          onReply={handleReply}
          onEdit={handleEditComment}
          onDelete={handleDeleteComment}
        />
      </div>
    </div>
  );
}


