"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "./lib/utils";

export interface LikeDislikeProps {
  isLike?: boolean | null; // true for like, false for dislike, null for neither
  likesCount?: number;
  dislikesCount?: number;
  totalCount?: number;
  onChange?: (isLike: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showCounts?: boolean;
}

export function LikeDislike({
  isLike = null,
  likesCount = 0,
  dislikesCount = 0,
  totalCount = 0,
  onChange,
  disabled = false,
  size = "md",
  showCounts = true,
}: LikeDislikeProps) {
  const handleLikeClick = () => {
    if (disabled || !onChange) return;
    // Toggle: if already liked, unlike (set to null via parent)
    if (isLike === true) {
      onChange(true); // Will be handled by parent to unlike
    } else {
      onChange(true);
    }
  };

  const handleDislikeClick = () => {
    if (disabled || !onChange) return;
    // Toggle: if already disliked, undislike (set to null via parent)
    if (isLike === false) {
      onChange(false); // Will be handled by parent to unlike
    } else {
      onChange(false);
    }
  };

  const sizeClass = size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center gap-3">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleLikeClick}
          disabled={disabled}
          className={cn(
            "relative transition-all flex items-center justify-center gap-2 px-3 py-2 rounded-md",
            !disabled && "hover:bg-muted cursor-pointer",
            disabled && "cursor-not-allowed opacity-50",
            isLike === true && "bg-green-500/20"
          )}
          aria-label="Like"
        >
          <ThumbsUp
            className={cn(
              sizeClass,
              isLike === true
                ? "fill-green-500 text-green-500"
                : "text-muted-foreground hover:text-green-500"
            )}
            strokeWidth={2}
          />
          {showCounts && (
            <span
              className={cn(
                "text-sm font-medium",
                isLike === true ? "text-green-500" : "text-muted-foreground"
              )}
            >
              {String(likesCount || 0)}
            </span>
          )}
        </button>

        {/* Dislike Button */}
        <button
          type="button"
          onClick={handleDislikeClick}
          disabled={disabled}
          className={cn(
            "relative transition-all flex items-center justify-center gap-2 px-3 py-2 rounded-md",
            !disabled && "hover:bg-muted cursor-pointer",
            disabled && "cursor-not-allowed opacity-50",
            isLike === false && "bg-red-500/20"
          )}
          aria-label="Dislike"
        >
          <ThumbsDown
            className={cn(
              sizeClass,
              isLike === false
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground hover:text-red-500"
            )}
            strokeWidth={2}
          />
          {showCounts && (
            <span
              className={cn(
                "text-sm font-medium",
                isLike === false ? "text-red-500" : "text-muted-foreground"
              )}
            >
              {String(dislikesCount || 0)}
            </span>
          )}
        </button>
      </div>

      
    </div>
  );
}

