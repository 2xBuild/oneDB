"use client";

import Link from "next/link";
import { ThumbsUp, ThumbsDown, MessageCircle } from "lucide-react";
import type { Idea, LikeAggregation } from "@/lib/types";

interface IdeaCardProps {
  idea: Idea;
  likeAggregation?: LikeAggregation;
  commentCount?: number;
}

export default function IdeaCard({ idea, likeAggregation, commentCount = 0 }: IdeaCardProps) {
  const likes = likeAggregation?.likes || 0;
  const dislikes = likeAggregation?.dislikes || 0;

  return (
    <Link href={`/arena/idea/${idea.id}`} className="block h-full">
      <div className="border border-accent rounded-lg overflow-hidden transition-all cursor-pointer bg-background hover:bg-muted flex flex-col h-48">
        {/* Main Content */}
        <div className="w-full p-6 flex flex-col flex-1 min-h-0">
          {/* Title */}
          <div className="h-10 mb-3 flex items-center flex-shrink-0">
            <h3 className="text-xl font-bold line-clamp-1 w-full">{idea.title}</h3>
          </div>

          {/* Border between title and description */}
          <div className="border-t border-border mb-3 flex-shrink-0"></div>

          {/* Description */}
          <div className="flex-1 flex items-start min-h-0 overflow-hidden">
            {idea.description ? (
              <p className="text-sm text-muted-foreground line-clamp-4 w-full">
                {idea.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground w-full">&nbsp;</p>
            )}
          </div>
        </div>

        {/* Stats Section with different background */}
        <div className="w-full bg-muted/50 border-t border-border p-4 flex items-center justify-center gap-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="text-sm font-medium text-green-600">{String(likes || 0)}</span>
            {dislikes > 0 && (
              <>
                <span className="mx-1 text-muted-foreground">/</span>
                <ThumbsDown className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm font-medium text-red-600">{String(dislikes || 0)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium">{String(commentCount || 0)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
