"use client";

import { ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

type SortType = 'likes' | 'comments' | 'time';

interface SortSelectorProps {
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
}

const sortLabels: Record<SortType, string> = {
  likes: 'Likes',
  comments: 'Comments',
  time: 'Time',
};

export default function SortSelector({ sortBy, onSortChange }: SortSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-md hover:bg-muted transition-colors">
          <ArrowUpDown className="h-4 w-4" />
          <span className="text-muted-foreground">Sort:</span>
          <span className="font-medium">{sortLabels[sortBy]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onSortChange('likes')}>
          Likes
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('comments')}>
          Comments
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSortChange('time')}>
          Time
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

