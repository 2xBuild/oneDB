// Database entity types
export interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  githubLink: string | null;
  liveLink: string | null;
  projectImage: string | null;
  tags: string[] | null;
  status: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
}

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  bannerImage: string | null;
  tags: string[] | null;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  targetType: "project" | "idea";
  targetId: string;
  parentId: string | null;
  createdAt: Date;
  isEdited: boolean;
  replies?: Comment[];
  author?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
}

export interface Like {
  id: string;
  userId: string;
  targetType: "project" | "idea" | "person" | "resource" | "app";
  targetId: string;
  isLike: boolean;
  createdAt: Date;
}

export interface Person {
  id: string;
  name: string;
  description: string | null;
  socialMediaPlatform: string;
  socialMediaLink: string;
  tags: string[] | null;
  image: string | null;
  followersCount: number | null;
  submittedBy: string;
  status: string;
  contributionType?: string | null;
  originalId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
  tags: string[] | null;
  image: string | null;
  submittedBy: string;
  status: string;
  contributionType?: string | null;
  originalId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface App {
  id: string;
  name: string;
  description: string | null;
  url: string;
  category: string;
  tags: string[] | null;
  logo: string | null;
  submittedBy: string;
  status: string;
  contributionType?: string | null;
  originalId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface Vote {
  id: string;
  userId: string;
  peopleId: string | null;
  resourceId: string | null;
  appId: string | null;
  voteType: "upvote" | "downvote";
  reqType: "add" | "edit" | "delete";
  createdAt: Date;
}

// Input types
export interface CreateProjectInput {
  title: string;
  tagline: string;
  description?: string;
  githubLink?: string | "";
  liveLink?: string | "";
  projectImage?: string | "";
  tags?: string[];
  status?: "published" | "archived";
}

export interface UpdateProjectInput {
  title?: string;
  tagline?: string;
  description?: string;
  githubLink?: string | "";
  liveLink?: string | "";
  projectImage?: string | "";
  tags?: string[];
  status?: "published" | "archived";
}

export interface CreateIdeaInput {
  title: string;
  description?: string;
  bannerImage?: string | "";
  tags?: string[];
}

export interface UpdateIdeaInput {
  title?: string;
  description?: string;
  bannerImage?: string | "";
  tags?: string[];
}

export interface CreateCommentInput {
  content: string;
  targetType: "project" | "idea";
  targetId: string;
  parentId?: string;
}

export interface UpdateCommentInput {
  content: string;
}

export interface CreatePeopleInput {
  name: string;
  description?: string;
  socialMediaPlatform: string;
  socialMediaLink: string;
  tags?: string[];
  image?: string | "";
  followersCount?: number;
}

export interface UpdatePeopleInput {
  name?: string;
  description?: string;
  socialMediaPlatform?: string;
  socialMediaLink?: string;
  tags?: string[];
  image?: string | "";
  followersCount?: number;
}

export interface CreateResourceInput {
  title: string;
  description?: string;
  url: string;
  category: string;
  tags?: string[];
  image?: string | "";
}

export interface UpdateResourceInput {
  title?: string;
  description?: string;
  url?: string;
  category?: string;
  tags?: string[];
  image?: string | "";
}

export interface CreateAppInput {
  name: string;
  description?: string;
  url: string;
  category: string;
  tags?: string[];
  logo?: string | "";
}

export interface UpdateAppInput {
  name?: string;
  description?: string;
  url?: string;
  category?: string;
  tags?: string[];
  logo?: string | "";
}

export interface CreateVoteInput {
  peopleId?: string;
  resourceId?: string;
  appId?: string;
  voteType: "upvote" | "downvote";
  reqType: "add" | "edit" | "delete";
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LikeAggregation {
  likes: number;
  dislikes: number;
  total: number;
}

export interface LikeInput {
  isLike: boolean;
}

// Filter types
export interface PeopleFilters {
  limit?: number;
  offset?: number;
  platform?: string;
  tags?: string[];
  status?: string;
}

export interface ResourceFilters {
  limit?: number;
  offset?: number;
  category?: string;
  tags?: string[];
  status?: string;
}

export interface AppFilters {
  limit?: number;
  offset?: number;
  category?: string;
  tags?: string[];
  status?: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

// Voting types
export interface ApprovalStatus {
  approved: boolean;
  upvotes: number;
  downvotes: number;
  total: number;
  percentage: number;
  // New 3x ratio fields
  minVotes?: number;
  ratioThreshold?: number;
  votesNeededForMin?: number;
  votesNeededForRatio?: number;
  meetsMinVotes?: boolean;
  meetsRatio?: boolean;
  // Legacy fields for backward compatibility
  threshold: number;
  percentageThreshold: number;
  votesNeededForThreshold: number;
  votesNeededForPercentage: number;
  votesNeeded: number;
  meetsThreshold: boolean;
  meetsPercentage: boolean;
}

export interface PersonWithVotes extends Person {
  votes: {
    upvotes: number;
    downvotes: number;
    total: number;
    percentage: number;
  };
  approvalStatus: ApprovalStatus;
  userVote: {
    id: string;
    voteType: "upvote" | "downvote";
  } | null;
  submitter: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
}

export interface ResourceWithVotes extends Resource {
  votes: {
    upvotes: number;
    downvotes: number;
    total: number;
    percentage: number;
  };
  approvalStatus: ApprovalStatus;
  userVote: {
    id: string;
    voteType: "upvote" | "downvote";
  } | null;
  submitter: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
}

export interface AppWithVotes extends App {
  votes: {
    upvotes: number;
    downvotes: number;
    total: number;
    percentage: number;
  };
  approvalStatus: ApprovalStatus;
  userVote: {
    id: string;
    voteType: "upvote" | "downvote";
  } | null;
  submitter: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  } | null;
}

export interface VotingData {
  people: PersonWithVotes[];
  resources: ResourceWithVotes[];
  apps: AppWithVotes[];
}

// Contributors types
export interface DbContributor {
  userId: string;
  name: string | null;
  email: string;
  avatar: string | null;
  peopleCount: number;
  resourcesCount: number;
  appsCount: number;
  totalSubmissions: number;
}

export interface GitHubContributor {
  login: string;
  avatar: string;
  contributions: number;
  profileUrl: string;
}

export interface ContributorsData {
  pendingSubmissions: {
    people: PersonWithVotes[];
    resources: ResourceWithVotes[];
    apps: AppWithVotes[];
  };
  dbContributors: DbContributor[];
  githubContributors: GitHubContributor[];
  isAdmin?: boolean;
}

