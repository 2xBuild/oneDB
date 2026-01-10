"use client";

import { ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

// Sort types for apps and resources
export type AppsResourcesSortType = 'likes' | 'first-added' | 'last-added';

// Sort types for people (includes followers)
export type PeopleSortType = 'likes' | 'followers' | 'first-added' | 'last-added';

type SortType = AppsResourcesSortType | PeopleSortType;

const sortLabels: Record<SortType, string> = {
  likes: 'Likes',
  followers: 'Followers',
  'first-added': 'First Added',
  'last-added': 'Last Added',
};

interface DBSortSelectorPropsBase {
  type: 'apps' | 'resources' | 'people';
}

interface DBSortSelectorPropsApps extends DBSortSelectorPropsBase {
  type: 'apps' | 'resources';
  sortBy: AppsResourcesSortType;
  onSortChange: (sort: AppsResourcesSortType) => void;
}

interface DBSortSelectorPropsPeople extends DBSortSelectorPropsBase {
  type: 'people';
  sortBy: PeopleSortType;
  onSortChange: (sort: PeopleSortType) => void;
}

type DBSortSelectorProps = DBSortSelectorPropsApps | DBSortSelectorPropsPeople;

export default function DBSortSelector(props: DBSortSelectorProps) {
  const { sortBy, onSortChange, type } = props;
  
  const getSortOptions = (): SortType[] => {
    if (type === 'people') {
      return ['likes', 'followers', 'first-added', 'last-added'];
    }
    return ['likes', 'first-added', 'last-added'];
  };

  const sortOptions = getSortOptions();

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
        {sortOptions.map((option) => (
          <DropdownMenuItem 
            key={option} 
            onClick={() => {
              if (type === 'people') {
                (onSortChange as (sort: PeopleSortType) => void)(option as PeopleSortType);
              } else {
                (onSortChange as (sort: AppsResourcesSortType) => void)(option as AppsResourcesSortType);
              }
            }}
          >
            {sortLabels[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

