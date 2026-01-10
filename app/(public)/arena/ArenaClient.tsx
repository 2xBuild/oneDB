"use client"

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui";
import { ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { Project, Idea, LikeAggregation } from "@/lib/types";
import ProjectCard from "./components/ProjectCard";
import IdeaCard from "./components/IdeaCard";
import SortSelector from "./components/SortSelector";

type TabType = 'ideas' | 'projects';
type SortType = 'likes' | 'comments' | 'time';

interface ProjectWithStats extends Project {
  likeAggregation?: LikeAggregation;
  commentCount?: number;
}

interface IdeaWithStats extends Idea {
  likeAggregation?: LikeAggregation;
  commentCount?: number;
}

export default function ArenaClient() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('ideas');
    const [currentWeek, setCurrentWeek] = useState(0);
    const [sortBy, setSortBy] = useState<SortType>('likes');
    const [projects, setProjects] = useState<ProjectWithStats[]>([]);
    const [ideas, setIdeas] = useState<IdeaWithStats[]>([]);
    const [loading, setLoading] = useState(true);

    const getWeekRange = () => {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + (currentWeek * 7));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return { weekStart, weekEnd };
    };

    const getWeekNumber = () => {
        const { weekStart } = getWeekRange();
        // Computing week number (1-52) based on the year
        const startOfYear = new Date(weekStart.getFullYear(), 0, 1);
        const daysSinceStart = Math.floor((weekStart.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
        // Getting day of week for Jan 1st (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfYear = startOfYear.getDay();
        // Computing week number: days since start + offset for first week
        const weekNumber = Math.ceil((daysSinceStart + firstDayOfYear) / 7);
        // Clamping to 1-52
        return Math.max(1, Math.min(52, weekNumber));
    };

    const getWeekLabel = () => {
        const { weekStart, weekEnd } = getWeekRange();
        const formatDate = (date: Date) => {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        };
        return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const { weekStart, weekEnd } = getWeekRange();
            
            // Fetching projects and ideas
            const [projectsRes, ideasRes] = await Promise.all([
                apiClient.getProjects({ limit: 100 }),
                apiClient.getIdeas({ limit: 100 }),
            ]);

            // Filtering by week
            const filteredProjects = (projectsRes.data || [])
                .filter((p: Project) => {
                    const createdAt = new Date(p.createdAt);
                    return createdAt >= weekStart && createdAt <= weekEnd;
                })
                .map(async (p: Project) => {
                    const [likesRes, commentsRes] = await Promise.all([
                        apiClient.getProjectLikes(p.id).catch(() => ({ data: { likes: 0, dislikes: 0, total: 0 } })),
                        apiClient.getProjectComments(p.id).catch(() => ({ data: [] })),
                    ]);
                    return {
                        ...p,
                        likeAggregation: {
                            likes: Number(likesRes.data?.likes) || 0,
                            dislikes: Number(likesRes.data?.dislikes) || 0,
                            total: Number(likesRes.data?.total) || 0,
                        },
                        commentCount: commentsRes.data?.length || 0,
                    };
                });

            const filteredIdeas = (ideasRes.data || [])
                .filter((i: Idea) => {
                    const createdAt = new Date(i.createdAt);
                    return createdAt >= weekStart && createdAt <= weekEnd;
                })
                .map(async (i: Idea) => {
                    const [likesRes, commentsRes] = await Promise.all([
                        apiClient.getIdeaLikes(i.id).catch(() => ({ data: { likes: 0, dislikes: 0, total: 0 } })),
                        apiClient.getIdeaComments(i.id).catch(() => ({ data: [] })),
                    ]);
                    return {
                        ...i,
                        likeAggregation: {
                            likes: Number(likesRes.data?.likes) || 0,
                            dislikes: Number(likesRes.data?.dislikes) || 0,
                            total: Number(likesRes.data?.total) || 0,
                        },
                        commentCount: commentsRes.data?.length || 0,
                    };
                });

            const [resolvedProjects, resolvedIdeas] = await Promise.all([
                Promise.all(filteredProjects),
                Promise.all(filteredIdeas),
            ]);

            setProjects(resolvedProjects);
            setIdeas(resolvedIdeas);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentWeek]);

    // Sorting helpers
    const sortByLikes = (a: ProjectWithStats | IdeaWithStats, b: ProjectWithStats | IdeaWithStats) => {
        const aLikes = a.likeAggregation?.likes || 0;
        const aDislikes = a.likeAggregation?.dislikes || 0;
        const aNetLikes = aLikes - aDislikes;
        
        const bLikes = b.likeAggregation?.likes || 0;
        const bDislikes = b.likeAggregation?.dislikes || 0;
        const bNetLikes = bLikes - bDislikes;
        
        // Sorting by net likes (likes - dislikes), then total likes, then time
        if (bNetLikes !== aNetLikes) {
            return bNetLikes - aNetLikes;
        }
        if (bLikes !== aLikes) {
            return bLikes - aLikes;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    };

    const sortByComments = (a: ProjectWithStats | IdeaWithStats, b: ProjectWithStats | IdeaWithStats) => {
        const aComments = a.commentCount || 0;
        const bComments = b.commentCount || 0;
        
        // Sorting by comment count, then likes, then time
        if (bComments !== aComments) {
            return bComments - aComments;
        }
        return sortByLikes(a, b);
    };

    const sortByTime = (a: ProjectWithStats | IdeaWithStats, b: ProjectWithStats | IdeaWithStats) => {
        // Sorting by newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    };

    // Applying sorting based on selected sort type
    const sortedProjects = useMemo(() => {
        const sorted = [...projects];
        switch (sortBy) {
            case 'likes':
                return sorted.sort(sortByLikes);
            case 'comments':
                return sorted.sort(sortByComments);
            case 'time':
                return sorted.sort(sortByTime);
            default:
                return sorted;
        }
    }, [projects, sortBy]);

    const sortedIdeas = useMemo(() => {
        const sorted = [...ideas];
        switch (sortBy) {
            case 'likes':
                return sorted.sort(sortByLikes);
            case 'comments':
                return sorted.sort(sortByComments);
            case 'time':
                return sorted.sort(sortByTime);
            default:
                return sorted;
        }
    }, [ideas, sortBy]);

    const weekNumber = getWeekNumber();
    const weekLabel = getWeekLabel();

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header Section */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold mb-1">Arena</h1>
                        <p className="text-xs text-muted-foreground">Discover and explore ideas and projects</p>
                    </div>
                    <Button 
                        onClick={() => router.push(`/submit?type=${activeTab === 'ideas' ? 'idea' : 'project'}`)}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 h-8 text-background hover:text-background dark:hover:text-background"
                    >
                        Add your {activeTab === 'ideas' ? 'idea' : 'project'}
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                </div>

                {/* Controls Section */}
                <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
                    <div className="relative inline-flex items-center rounded-full p-1 bg-background border border-foreground">
                        {/* Active Slider Background */}
                        <div
                            className={`absolute inset-y-0 transition-all duration-300 ease-in-out rounded-full bg-primary/20 backdrop-blur-sm border border-foreground ${
                                activeTab === 'ideas'
                                    ? 'left-0 right-[100px]'
                                    : 'left-[90px] right-0'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setActiveTab('ideas')}
                            className={`relative z-10 px-4 py-1.5 h-8 text-sm font-medium rounded-full transition-all duration-300 min-w-[90px] ${
                                activeTab === 'ideas' 
                                    ? 'text-foreground' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Ideas
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('projects')}
                            className={`relative z-10 px-4 py-1.5 h-8 text-sm font-medium rounded-full transition-all duration-300 min-w-[100px] ${
                                activeTab === 'projects' 
                                    ? 'text-foreground' 
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            Projects
                        </button>
                    </div>

                    {/* Week Button with integrated arrows */}
                    <div className="group relative inline-flex items-center rounded-full p-1 bg-background border border-foreground">
                        <button
                            onClick={() => setCurrentWeek(prev => prev - 1)}
                            className="px-2 py-1.5 h-8 text-xs font-medium rounded-l-full hover:bg-background/70 transition-all duration-200 text-muted-foreground hover:text-foreground"
                            aria-label="Previous week"
                        >
                            ←
                        </button>
                        <span className="px-1.5 py-1.5 h-8 text-xs font-medium flex items-center">
                            W{weekNumber}
                        </span>
                        <button
                            onClick={() => setCurrentWeek(prev => prev + 1)}
                            className="px-2 py-1.5 h-8 text-xs font-medium rounded-r-full hover:bg-background/70 transition-all duration-200 text-muted-foreground hover:text-foreground"
                            aria-label="Next week"
                        >
                            →
                        </button>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-popover text-popover-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {weekLabel}
                        </span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="mt-8" role="main" aria-label={activeTab === 'ideas' ? 'Ideas list' : 'Projects list'}>
                    {loading ? (
                        <div className="text-center py-20" role="status" aria-live="polite">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4"></div>
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    ) : activeTab === 'ideas' ? (
                        <div>
                            {sortedIdeas.length === 0 ? (
                                <div className="text-center py-20  rounded-xl" role="status">
                                    <p className="text-muted-foreground text-lg">No ideas available for this week.</p>
                                    <p className="text-muted-foreground text-sm mt-2">Check back later or browse other weeks.</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="flex justify-end mb-4">
                                        <SortSelector sortBy={sortBy} onSortChange={setSortBy} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sortedIdeas.map((idea) => (
                                            <IdeaCard
                                                key={idea.id}
                                                idea={idea}
                                                likeAggregation={idea.likeAggregation}
                                                commentCount={idea.commentCount}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            {sortedProjects.length === 0 ? (
                                <div className="text-center py-20  rounded-xl" role="status">
                                    <p className="text-muted-foreground text-lg">No projects available for this week.</p>
                                    <p className="text-muted-foreground text-sm mt-2">Check back later or browse other weeks.</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="flex justify-end mb-4">
                                        <SortSelector sortBy={sortBy} onSortChange={setSortBy} />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        {sortedProjects.map((project) => (
                                            <ProjectCard
                                                key={project.id}
                                                project={project}
                                                likeAggregation={project.likeAggregation}
                                                commentCount={project.commentCount}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

