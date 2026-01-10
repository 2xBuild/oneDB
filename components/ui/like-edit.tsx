"use client";

import * as React from "react";
import { ThumbsUp, Pencil, Trash2 } from "lucide-react";
import { cn } from "./lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface LikeEditProps {
  isLike?: boolean | null; // true for like, null for neither
  likesCount?: number;
  totalCount?: number;
  onChange?: (isLike: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showCounts?: boolean;
}

export function LikeEdit({
  isLike = null,
  likesCount = 0,
  totalCount = 0,
  onChange,
  onEdit,
  onDelete,
  disabled = false,
  size = "md",
  showCounts = true,
}: LikeEditProps) {
  const handleLikeClick = () => {
    if (disabled || !onChange) return;
    // Toggle: if already liked, unlike (set to null via parent)
    if (isLike === true) {
      onChange(true); // Will be handled by parent to unlike
    } else {
      onChange(true);
    }
  };

  const getSizeClasses = () => {
    if (size === "sm") {
      return {
        mobile: "h-3 w-3",
        desktop: "sm:h-4 sm:w-4",
      };
    } else if (size === "md") {
      return {
        mobile: "h-3.5 w-3.5",
        desktop: "sm:h-5 sm:w-5",
      };
    } else {
      return {
        mobile: "h-4 w-4",
        desktop: "sm:h-6 sm:w-6",
      };
    }
  };

  const iconSizeClasses = getSizeClasses();

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Like Button */}
      <button
        type="button"
        onClick={handleLikeClick}
        disabled={disabled}
        className={cn(
          "relative transition-all flex items-center justify-center gap-1 sm:gap-2 px-1.5 py-1 sm:px-3 sm:py-2 rounded-md",
          !disabled && "hover:bg-muted cursor-pointer",
          disabled && "cursor-not-allowed opacity-50",
          isLike === true && "bg-green-500/20"
        )}
        aria-label="Like"
      >
        <ThumbsUp
          className={cn(
            iconSizeClasses.mobile,
            iconSizeClasses.desktop,
            isLike === true
              ? "fill-green-500 text-green-500"
              : "text-muted-foreground hover:text-green-500"
          )}
          strokeWidth={2}
        />
        {showCounts && (
          <span
            className={cn(
              "text-xs sm:text-sm font-medium",
              isLike === true ? "text-green-500" : "text-muted-foreground"
            )}
          >
            {String(likesCount || 0)}
          </span>
        )}
      </button>

      {/* Edit/Delete Menu Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "relative transition-all flex items-center justify-center gap-1 sm:gap-2 px-1.5 py-1 sm:px-3 sm:py-2 rounded-md",
              !disabled && "hover:bg-muted cursor-pointer",
              disabled && "cursor-not-allowed opacity-50"
            )}
            aria-label="Edit or Delete"
          >
            <Pencil
              className={cn(
                iconSizeClasses.mobile,
                iconSizeClasses.desktop,
                "text-muted-foreground hover:text-primary"
              )}
              strokeWidth={2}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem onClick={onDelete} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

