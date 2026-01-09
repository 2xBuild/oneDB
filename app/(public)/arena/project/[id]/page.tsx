"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Github, ExternalLink, MessageCircle, ArrowLeft, Pencil } from "lucide-react";
import { Button, LikeDislike, CommentThread } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { buildCommentTree, countAllComments } from "@/lib/comments";
import type { Project, LikeAggregation, Comment, Like } from "@/lib/types";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [likeAggregation, setLikeAggregation] = useState<LikeAggregation | null>(null);
  const [userLike, setUserLike] = useState<Like | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [projectRes, likesRes, commentsRes] = await Promise.all([
        apiClient.getProject(id),
        apiClient.getProjectLikes(id).catch(() => ({ data: { likes: 0, dislikes: 0, total: 0 } })),
        apiClient.getProjectComments(id).catch(() => ({ data: [] })),
      ]);

      setProject(projectRes.data);
      // Normalize like aggregation to ensure all values are numbers
      const normalizedLikes = {
        likes: Number(likesRes.data.likes) || 0,
        dislikes: Number(likesRes.data.dislikes) || 0,
        total: Number(likesRes.data.total) || 0,
      };
      setLikeAggregation(normalizedLikes);
      
      // Debug: Log the raw API response
      console.log("Comments API Response:", commentsRes);
      console.log("Comments Data:", commentsRes.data);
      if (commentsRes.data && commentsRes.data.length > 0) {
        console.log("First Comment:", commentsRes.data[0]);
        console.log("First Comment Author:", commentsRes.data[0]?.author);
      }
      
      const commentTree = buildCommentTree(commentsRes.data);
      console.log("Comment Tree:", commentTree);
      if (commentTree.length > 0) {
        console.log("First Comment in Tree:", commentTree[0]);
        console.log("First Comment Author in Tree:", commentTree[0]?.author);
      }
      
      setComments(commentTree);
      setCommentCount(countAllComments(commentTree));

      // Get user's like if authenticated
      if (isAuthenticated && user) {
        try {
          // We need to check if user has liked - this would need a new endpoint
          // For now, we'll handle it in the like/dislike component
        } catch (error) {
          // User hasn't liked
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
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
        targetType: "project" as const,
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
        await apiClient.unlikeProject(id);
        // Already updated optimistically, just refresh to ensure sync
        const likesRes = await apiClient.getProjectLikes(id);
        const normalizedLikes = {
          likes: Number(likesRes.data.likes) || 0,
          dislikes: Number(likesRes.data.dislikes) || 0,
          total: Number(likesRes.data.total) || 0,
        };
        setLikeAggregation(normalizedLikes);
      } else {
        // Like or update like/dislike
        const res = await apiClient.likeProject(id, isLike);
        setUserLike(res.data);
        // Refresh aggregation to ensure sync
        const likesRes = await apiClient.getProjectLikes(id);
        const normalizedLikes = {
          likes: Number(likesRes.data.likes) || 0,
          dislikes: Number(likesRes.data.dislikes) || 0,
          total: Number(likesRes.data.total) || 0,
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
        targetType: "project",
        targetId: id,
      });
      setCommentContent("");
      fetchData(); // Refresh comments
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
        targetType: "project",
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

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Project Header with Logo, Title, Tagline, Links and Star Rating */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3 flex-1">
          {/* Project Logo */}
          {project.projectImage && (
            <div className="relative w-16 h-16 flex-shrink-0 rounded-full overflow-hidden sm:w-24 sm:h-24">
              <Image
                src={project.projectImage}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-bold">{project.title}</h1>
              {isAuthenticated && user && project.author && user.id === project.author.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/arena/project/${id}/edit`)}
                  className="h-8 w-8"
                  title="Edit project"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
            {project.tagline && (
              <p className="text-xl text-muted-foreground mb-4">{project.tagline}</p>
            )}
            {/* Links */}
            <div className="flex gap-4">
              {project.githubLink && (
                <Button
                  asChild
                  className="bg-accent hover:bg-accent/90 dark:hover:text-background text-background"
                >
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="h-5 w-5" />
                    Github
                  </a>
                </Button>
              )}
              {project.liveLink && (
                <Button
                  asChild
                  className="bg-accent hover:bg-accent/90 dark:hover:text-background hotext-background"
                >
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Visit
                  </a>
                </Button>
              )}
            </div>
          </div>
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
      {project.description && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      {/* Author Section */}
      {project.author && (
        <div className="flex items-center gap-3 mb-8">
          {project.author.avatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={project.author.avatar}
                alt={project.author.name || "Author"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent flex-shrink-0 flex items-center justify-center">
              <span className="text-base font-bold text-background">
                {(project.author.name || project.author.email).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium">{project.author.name || project.author.email}</p>
            {project.createdAt && (
              <p className="text-xs text-muted-foreground">
                Posted {new Date(project.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Discussion Button (for projects, comments are hidden) */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => setShowDiscussion(!showDiscussion)}
          className="mb-4"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Discussion ({commentCount})
        </Button>

        {showDiscussion && (
          <div className="mt-4">
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
        )}
      </div>
    </div>
  );
}


