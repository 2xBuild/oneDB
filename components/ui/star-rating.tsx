"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "./lib/utils";

export interface StarRatingProps {
  value?: -3 | -2 | -1 | 1 | 2 | 3 | null;
  positiveCount?: number;
  negativeCount?: number;
  totalCount?: number;
  onChange?: (value: -3 | -2 | -1 | 1 | 2 | 3) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showCounts?: boolean;
}

const starValues = [
  { value: -3 as const, label: "-3" },
  { value: -2 as const, label: "-2" },
  { value: -1 as const, label: "-1" },
  { value: 1 as const, label: "+1" },
  { value: 2 as const, label: "+2" },
  { value: 3 as const, label: "+3" },
];

export function StarRating({
  value = null,
  positiveCount = 0,
  negativeCount = 0,
  totalCount = 0,
  onChange,
  disabled = false,
  size = "md",
  showCounts = true,
}: StarRatingProps) {
  const handleStarClick = (starValue: -3 | -2 | -1 | 1 | 2 | 3) => {
    if (disabled || !onChange) return;
    // Toggling: clicking same star unstars (sets to null)
    if (value === starValue) {
      onChange(starValue); // Will be handled by parent to unstar
    } else {
      onChange(starValue);
    }
  };

  // Order: -3 (largest, leftmost) -> -2 -> -1 (smallest, center) | +1 (smallest, center) -> +2 -> +3 (largest, rightmost)
  const negativeStars = starValues.filter((s) => s.value < 0); // Already ordered -3, -2, -1
  const positiveStars = starValues.filter((s) => s.value > 0); // Already ordered 1, 2, 3

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-center gap-1">
        {/* Negative Stars (Left Side) - Red outline, fill when selected and all stars up to it */}
        {negativeStars.map((star) => {
          const absValue = Math.abs(star.value);
          // Size increases from center: -1/+1 smallest, -3/+3 largest
          const sizeClass = size === "sm" 
            ? absValue === 1 ? "h-3 w-3" : absValue === 2 ? "h-4 w-4" : "h-5 w-5"
            : size === "md"
            ? absValue === 1 ? "h-4 w-4" : absValue === 2 ? "h-5 w-5" : "h-6 w-6"
            : absValue === 1 ? "h-5 w-5" : absValue === 2 ? "h-6 w-6" : "h-7 w-7";
          
          // Filling this star and all stars up to it (e.g., if -3 selected, fill -1, -2, -3)
          // For negative: star.value >= value (since -3 <= -2 <= -1)
          const shouldFill = value !== null && value < 0 && star.value >= value;
          
          return (
            <button
              key={star.value}
              type="button"
              onClick={() => handleStarClick(star.value)}
              disabled={disabled}
              className={cn(
                "relative transition-all flex items-center justify-center",
                !disabled && "hover:scale-110 cursor-pointer",
                disabled && "cursor-not-allowed opacity-50"
              )}
              aria-label={`Rate ${star.label}`}
            >
              <Star
                className={cn(
                  sizeClass,
                  shouldFill
                    ? "fill-red-500 text-red-500 stroke-red-500" 
                    : "text-red-500 fill-none stroke-red-500"
                )}
                strokeWidth={2}
              />
            </button>
          );
        })}

        {/* Center Divider */}
        <div className="h-8 w-px bg-border mx-2" />

        {/* Positive Stars (Right Side) - Green outline, fill when selected and all stars up to it */}
        {positiveStars.map((star) => {
          const absValue = Math.abs(star.value);
          const sizeClass = size === "sm" 
            ? absValue === 1 ? "h-3 w-3" : absValue === 2 ? "h-4 w-4" : "h-5 w-5"
            : size === "md"
            ? absValue === 1 ? "h-4 w-4" : absValue === 2 ? "h-5 w-5" : "h-6 w-6"
            : absValue === 1 ? "h-5 w-5" : absValue === 2 ? "h-6 w-6" : "h-7 w-7";
          
          // Filling this star and all stars up to it (e.g., if +3 selected, fill +1, +2, +3)
          // For positive: star.value <= value
          const shouldFill = value !== null && value > 0 && star.value <= value;
          
          return (
            <button
              key={star.value}
              type="button"
              onClick={() => handleStarClick(star.value)}
              disabled={disabled}
              className={cn(
                "relative transition-all flex items-center justify-center",
                !disabled && "hover:scale-110 cursor-pointer",
                disabled && "cursor-not-allowed opacity-50"
              )}
              aria-label={`Rate ${star.label}`}
            >
              <Star
                className={cn(
                  sizeClass,
                  shouldFill
                    ? "fill-green-500 text-green-500 stroke-green-500" 
                    : "text-green-500 fill-none stroke-green-500"
                )}
                strokeWidth={2}
              />
            </button>
          );
        })}
      </div>

      {/* Counts */}
      {showCounts && (
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="text-red-600 font-medium">-{negativeCount}</span>
          <span>/</span>
          <span className="text-green-600 font-medium">+{positiveCount}</span>
          {totalCount > 0 && (
            <>
              <span className="mx-1">•</span>
              <span>{totalCount} {totalCount === 1 ? "rating" : "ratings"}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}


