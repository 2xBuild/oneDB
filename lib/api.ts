import type {
  ApiResponse,
  Project,
  Idea,
  Comment,
  LikeAggregation,
  Like,
  LikeInput,
  CreateProjectInput,
  UpdateProjectInput,
  CreateIdeaInput,
  UpdateIdeaInput,
  CreateCommentInput,
  UpdateCommentInput,
  Person,
  Resource,
  App,
  Vote,
  CreatePeopleInput,
  UpdatePeopleInput,
  CreateResourceInput,
  UpdateResourceInput,
  CreateAppInput,
  UpdateAppInput,
  CreateVoteInput,
  VotingData,
  ContributorsData,
  PeopleFilters,
  ResourceFilters,
  AppFilters,
  PaginationParams,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    // NextAuth handles authentication via cookies, so this method is kept for backward compatibility
    // but doesn't do anything as cookies are automatically included with credentials: "include"
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // NextAuth handles authentication via cookies automatically
    // credentials: "include" ensures cookies are sent with requests

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Include cookies for NextAuth
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Project endpoints
  async getProjects(params?: PaginationParams) {
    const query = new URLSearchParams();
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());
    return this.get<Project[]>(`/projects${query.toString() ? `?${query}` : ""}`);
  }

  async getProject(id: string) {
    return this.get<Project>(`/projects/${id}`);
  }

  async createProject(data: CreateProjectInput) {
    return this.post<Project>("/projects", data);
  }

  async updateProject(id: string, data: UpdateProjectInput) {
    return this.put<Project>(`/projects/${id}`, data);
  }

  async deleteProject(id: string) {
    return this.delete<{ message: string }>(`/projects/${id}`);
  }

  // Project like endpoints
  async likeProject(id: string, isLike: boolean) {
    return this.post<Like>(`/projects/${id}/like`, { isLike });
  }

  async unlikeProject(id: string) {
    return this.delete<{ message: string }>(`/projects/${id}/like`);
  }

  async getProjectLikes(id: string) {
    return this.get<LikeAggregation>(`/projects/${id}/likes`);
  }

  async getProjectTags() {
    return this.get<string[]>("/projects/tags");
  }

  // Idea endpoints
  async getIdeas(params?: PaginationParams) {
    const query = new URLSearchParams();
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());
    return this.get<Idea[]>(`/ideas${query.toString() ? `?${query}` : ""}`);
  }

  async getIdea(id: string) {
    return this.get<Idea>(`/ideas/${id}`);
  }

  async createIdea(data: CreateIdeaInput) {
    return this.post<Idea>("/ideas", data);
  }

  async updateIdea(id: string, data: UpdateIdeaInput) {
    return this.put<Idea>(`/ideas/${id}`, data);
  }

  async deleteIdea(id: string) {
    return this.delete<{ message: string }>(`/ideas/${id}`);
  }

  // Idea like endpoints
  async likeIdea(id: string, isLike: boolean) {
    return this.post<Like>(`/ideas/${id}/like`, { isLike });
  }

  async unlikeIdea(id: string) {
    return this.delete<{ message: string }>(`/ideas/${id}/like`);
  }

  async getIdeaLikes(id: string) {
    return this.get<LikeAggregation>(`/ideas/${id}/likes`);
  }

  async getIdeaTags() {
    return this.get<string[]>("/ideas/tags");
  }

  // Comment endpoints
  async getProjectComments(projectId: string) {
    return this.get<Comment[]>(`/comments/project/${projectId}`);
  }

  async getIdeaComments(ideaId: string) {
    return this.get<Comment[]>(`/comments/idea/${ideaId}`);
  }

  async getComment(id: string) {
    return this.get<Comment>(`/comments/${id}`);
  }

  async createComment(data: CreateCommentInput) {
    return this.post<Comment>("/comments", data);
  }

  async updateComment(id: string, data: UpdateCommentInput) {
    return this.put<Comment>(`/comments/${id}`, data);
  }

  async deleteComment(id: string) {
    return this.delete<{ message: string }>(`/comments/${id}`);
  }

  // People endpoints
  async getPeople(filters?: PeopleFilters) {
    const query = new URLSearchParams();
    if (filters?.limit) query.append("limit", filters.limit.toString());
    if (filters?.offset) query.append("offset", filters.offset.toString());
    if (filters?.platform) query.append("platform", filters.platform);
    if (filters?.tags) query.append("tags", filters.tags.join(","));
    if (filters?.status) query.append("status", filters.status);
    return this.get<Person[]>(`/db/people${query.toString() ? `?${query}` : ""}`);
  }

  async getPerson(id: string) {
    return this.get<Person>(`/db/people/${id}`);
  }

  async getPersonLikes(id: string) {
    return this.get<LikeAggregation>(`/db/people/${id}/likes`);
  }

  async likePerson(id: string, isLike: boolean) {
    return this.post<Like>(`/db/people/${id}/like`, { isLike });
  }

  async unlikePerson(id: string) {
    return this.delete<{ message: string }>(`/db/people/${id}/like`);
  }

  async createPerson(data: CreatePeopleInput) {
    return this.post<Person>("/db/people", data);
  }

  async updatePerson(id: string, data: UpdatePeopleInput) {
    return this.put<Person>(`/db/people/${id}`, data);
  }

  async deletePerson(id: string) {
    return this.delete<{ message: string }>(`/db/people/${id}`);
  }

  async getPeopleCategories() {
    return this.get<string[]>("/db/people/categories");
  }

  async getPeopleTags() {
    return this.get<string[]>("/db/people/tags");
  }

  // Resource endpoints
  async getResources(filters?: ResourceFilters) {
    const query = new URLSearchParams();
    if (filters?.limit) query.append("limit", filters.limit.toString());
    if (filters?.offset) query.append("offset", filters.offset.toString());
    if (filters?.category) query.append("category", filters.category);
    if (filters?.tags) query.append("tags", filters.tags.join(","));
    if (filters?.status) query.append("status", filters.status);
    return this.get<Resource[]>(`/db/resources${query.toString() ? `?${query}` : ""}`);
  }

  async getResource(id: string) {
    return this.get<Resource>(`/db/resources/${id}`);
  }

  async getResourceLikes(id: string) {
    return this.get<LikeAggregation>(`/db/resources/${id}/likes`);
  }

  async likeResource(id: string, isLike: boolean) {
    return this.post<Like>(`/db/resources/${id}/like`, { isLike });
  }

  async unlikeResource(id: string) {
    return this.delete<{ message: string }>(`/db/resources/${id}/like`);
  }

  async createResource(data: CreateResourceInput) {
    return this.post<Resource>("/db/resources", data);
  }

  async updateResource(id: string, data: UpdateResourceInput) {
    return this.put<Resource>(`/db/resources/${id}`, data);
  }

  async deleteResource(id: string) {
    return this.delete<{ message: string }>(`/db/resources/${id}`);
  }

  async getResourceCategories() {
    return this.get<string[]>("/db/resources/categories");
  }

  async getResourceTags() {
    return this.get<string[]>("/db/resources/tags");
  }

  // App endpoints
  async getApps(filters?: AppFilters) {
    const query = new URLSearchParams();
    if (filters?.limit) query.append("limit", filters.limit.toString());
    if (filters?.offset) query.append("offset", filters.offset.toString());
    if (filters?.category) query.append("category", filters.category);
    if (filters?.tags) query.append("tags", filters.tags.join(","));
    if (filters?.status) query.append("status", filters.status);
    return this.get<App[]>(`/db/apps${query.toString() ? `?${query}` : ""}`);
  }

  async getApp(id: string) {
    return this.get<App>(`/db/apps/${id}`);
  }

  async getAppLikes(id: string) {
    return this.get<LikeAggregation>(`/db/apps/${id}/likes`);
  }

  async likeApp(id: string, isLike: boolean) {
    return this.post<Like>(`/db/apps/${id}/like`, { isLike });
  }

  async unlikeApp(id: string) {
    return this.delete<{ message: string }>(`/db/apps/${id}/like`);
  }

  async createApp(data: CreateAppInput) {
    return this.post<App>("/db/apps", data);
  }

  async updateApp(id: string, data: UpdateAppInput) {
    return this.put<App>(`/db/apps/${id}`, data);
  }

  async deleteApp(id: string) {
    return this.delete<{ message: string }>(`/db/apps/${id}`);
  }

  async getAppCategories() {
    return this.get<string[]>("/db/apps/categories");
  }

  async getAppTags() {
    return this.get<string[]>("/db/apps/tags");
  }

  // Voting endpoints
  async getVotingData() {
    return this.get<VotingData>("/db/contribution");
  }

  async vote(data: CreateVoteInput) {
    return this.post<{ vote: Vote; approvalStatus: any }>("/db/contribution/votes", data);
  }

  async removeVote(voteId: string) {
    return this.delete<{ message: string }>(`/db/contribution/votes/${voteId}`);
  }

  // Contributors endpoints
  async getContributorsData() {
    return this.get<ContributorsData>("/db/contributors");
  }

  // Auth endpoints
  async getCurrentUser() {
    return this.get<{ user: any }>("/auth/me");
  }
}

export const apiClient = new ApiClient();

