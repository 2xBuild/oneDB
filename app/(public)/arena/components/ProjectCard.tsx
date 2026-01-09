"use client";

import Link from "next/link";
import Image from "next/image";
import { ThumbsUp, ThumbsDown, MessageCircle, ExternalLink } from "lucide-react";
import type { Project, LikeAggregation } from "@/lib/types";
import { Button } from "@/components/ui";

interface ProjectCardProps {
  project: Project;
  likeAggregation?: LikeAggregation;
  commentCount?: number;
}

export default function ProjectCard({ project, likeAggregation, commentCount = 0 }: ProjectCardProps) {
  const likes = likeAggregation?.likes || 0;
  const dislikes = likeAggregation?.dislikes || 0;

  return (
    <Link href={`/arena/project/${project.id}`}>
      
      <div className="border border-accent rounded-full px-4 py-3 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4 bg-background hover:bg-muted">
        {/* Logo */}
        {project.projectImage ? (
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={project.projectImage}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
            <span className="text-lg font-bold text-muted-foreground">
              {project.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Title and Tagline */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold truncate">{project.title}</h3>
          {project.tagline && (
            <p className="text-sm text-muted-foreground truncate">{project.tagline}</p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0 bg-muted rounded-full px-4 py-2">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4 text-green-600" />
            <span className="text-green-600">{String(likes || 0)}</span>
            {dislikes > 0 && (
              <>
                <span className="mx-1">/</span>
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span className="text-red-600">{String(dislikes || 0)}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{String(commentCount || 0)}</span>
          </div>
        </div>

        {/* Visit Icon */}
        {/* External link: use live link if present, else fallback to github. Show with arrow */}
        {project.liveLink || project.githubLink ? (
          <Button variant="link" size="icon" asChild>
            <Link href={project.liveLink || project.githubLink || ''} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-5 w-5 text-muted-foreground transition-colors" />
            </Link>
          </Button>
        ) : null}
        </div>
      
    </Link>
  );
}

