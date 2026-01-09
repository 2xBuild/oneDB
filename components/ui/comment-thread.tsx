"use client";

import * as React from "react";
import { Reply, Pencil, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "./button";
import { cn } from "./lib/utils";

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
  createdAt: string | Date;
  parentId?: string | null;
  replies?: Comment[];
  isEdited?: boolean;
}

export interface CommentThreadProps {
  comments: Comment[];
  currentUserId?: string;
  onReply?: (parentId: string, content: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  maxDepth?: number; // Unlimited depth by default
  depth?: number;
}

export function CommentThread({
  comments,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  maxDepth,
  depth = 0,
}: CommentThreadProps) {
  if (!comments || comments.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth}
          maxDepth={maxDepth}
        />
      ))}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onReply?: (parentId: string, content: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  depth: number;
  maxDepth?: number;
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  depth,
  maxDepth,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = React.useState(false);
  const [replyContent, setReplyContent] = React.useState("");
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(comment.content);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const canReply = maxDepth === undefined || depth < maxDepth;
  const isOwner = currentUserId === comment.authorId;

  // Count child comments recursively
  const countChildComments = (replies?: Comment[]): number => {
    if (!replies || replies.length === 0) return 0;
    return replies.reduce((total, reply) => {
      return total + 1 + countChildComments(reply.replies);
    }, 0);
  };

  const childCount = countChildComments(comment.replies);
  const hasReplies = childCount > 0;

  const handleReply = () => {
    if (!replyContent.trim() || !onReply) return;
    onReply(comment.id, replyContent);
    setReplyContent("");
    setIsReplying(false);
  };

  const handleEdit = () => {
    if (!editContent.trim() || !onEdit) return;
    onEdit(comment.id, editContent);
    setIsEditing(false);
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className={cn(
      "flex gap-2",
      depth > 0 && "ml-8"
    )}>
      {/* Collapse/Expand Thread Button */}
      {hasReplies ? (
        <div className="flex items-start pt-1">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 p-0.5 rounded hover:bg-muted transition-colors"
            aria-label={isCollapsed ? "Expand thread" : "Collapse thread"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">{childCount}</span>
          </button>
        </div>
      ) : (
        <div className="w-5" />
      )}

      {/* Comment Content */}
      <div className="flex-1 min-w-0">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            {(() => {
              const author = comment.author;
              const avatar = author?.avatar;
              const name = author?.name;
              const email = author?.email;
              const initials = name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "?";
              
              return avatar ? (
                <img
                  src={avatar}
                  alt={name || email || "User"}
                  className="h-6 w-6 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent && !parent.querySelector('.avatar-fallback')) {
                      const fallback = document.createElement("div");
                      fallback.className = "avatar-fallback h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0";
                      fallback.innerHTML = `<span class="text-xs font-medium text-foreground">${initials}</span>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-foreground">
                    {initials}
                  </span>
                </div>
              );
            })()}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-foreground">
                {comment.author?.name || comment.author?.email || "Anonymous"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground italic">(edited)</span>
              )}
            </div>
          </div>
          {isOwner && onEdit && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6"
              onClick={() => {
                setIsEditing(!isEditing);
                setEditContent(comment.content);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="space-y-2 mb-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-accent rounded-md resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-sm whitespace-pre-wrap mb-1">{comment.content}</div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mb-1">
          {canReply && onReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setIsReplying(!isReplying)}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          {isOwner && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="h-7 px-2 text-xs text-destructive hover:text-destructive cursor-pointer"
              onClick={() => onDelete(comment.id)}
            >
              Delete
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && canReply && (
          <div className="mt-2 mb-2">
            <div className="space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border border-accent rounded-md resize-none bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                rows={3}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply} disabled={!replyContent.trim()}>
                  Post Reply
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {!isCollapsed && comment.replies && comment.replies.length > 0 && (
          <div className="mt-1">
            <CommentThread
              comments={comment.replies}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          </div>
        )}
      </div>
    </div>
  );
}


