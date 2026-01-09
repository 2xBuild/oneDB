"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Lightbulb, Users, AppWindow, BookOpen, Star } from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Button } from "./ui";
import { getGitHubStars, getGitHubContributors } from "@/lib/github";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Configuration for floating items
const items = [
    {
        title: "Projects",
        icon: FolderKanban,
        href: "/arena",
        // Mobile: Top Left, Desktop: Top Left spaced
        position: "top-4 left-4 sm:top-[12%] sm:left-[10%] lg:left-[15%]",
    },
    {
        title: "Ideas",
        icon: Lightbulb,
        href: "/arena",
        // Mobile: Bottom Right, Desktop: Bottom Right spaced
        position: "bottom-4 right-4 sm:bottom-[15%] sm:right-[5%] lg:right-[15%]",
    },
    {
        title: "People",
        icon: Users,
        href: "/db/people",
        // Mobile: Bottom Left, Desktop: Bottom Left spaced
        position: "bottom-4 left-4 sm:bottom-[15%] sm:left-[5%] lg:left-[10%]",
    },
    {
        title: "Apps",
        icon: AppWindow,
        href: "/db/apps",
        // Mobile: Top Right, Desktop: Top Right spaced
        position: "top-4 right-4 sm:top-[15%] sm:right-[10%] lg:right-[15%]",
    },
    {
        title: "Resources",
        icon: BookOpen,
        href: "/db/resources",
        // Mobile: Hidden or Top Center? Let's hide on very small mobile to avoid clutter, show on sm+
        position: "hidden sm:block top-[50%] right-[2%] lg:right-[5%] -translate-y-1/2",
    },
];

export default function OneDBVisualization() {
    const [starCount, setStarCount] = useState<number | null>(null);
    const [contributorCount, setContributorCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGitHubData() {
            try {
                const [stars, contributors] = await Promise.all([
                    getGitHubStars(),
                    getGitHubContributors(),
                ]);
                setStarCount(stars);
                setContributorCount(contributors);
            } catch (error) {
                console.error("Error fetching GitHub data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchGitHubData();
    }, []);

    return (
        <div className="w-full min-h-[500px] sm:min-h-[600px] flex items-center justify-center relative overflow-hidden bg-background py-10 sm:py-20">

            {/* Center Content */}
            <div className="z-20 flex flex-col items-center justify-center text-center max-w-4xl px-4 mt-8 sm:mt-0">

                {/* GitHub Star Button (Top) */}
                <Link href="https://github.com/2xBuild/oneDB" target="_blank" rel="noopener noreferrer">
                    <motion.button
                        
                        className="mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-background hover:text-primary hover:border-primary border border-primary"
                    >
                        <Star className="w-3 h-3 fill-current" />
                        <span>
                            {loading ? "Loading..." : starCount !== null ? `${starCount} Stars` : "Star on GitHub"}
                        </span>
                    </motion.button>
                </Link>

                {/* Hero Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground mb-6">
                    One database for <br className="hidden sm:block" /> everything you need.
                </h1>

                {/* Description */}
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                    Discover projects, ideas, people, apps, and resources all in one place. Explore, contribute, and build with the oneDB community.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap justify-center gap-4 items-center">
                    <Button 
                        asChild 
                        className="h-10 px-6 rounded-md bg-primary text-primary-foreground hover:bg-accent dark:hover:text-background transition-all duration-200 font-medium text-sm"
                    >
                        <Link href="/arena">VIEW ARENA</Link>
                    </Button>
                    <Button 
                        asChild 
                        variant="secondary"
                        className="h-10 px-6 rounded-md border border-border bg-background  text-primary hover:bg-primary/30 hover:text-primary  font-medium text-sm text-primary"
                    >
                        <Link href="/db">EXPLORE DB</Link>
                    </Button>
                </div>

                {/* Feature Note */}
                <div className="flex items-center gap-2 mt-8 text-muted-foreground">
                    <p className="text-sm">
                        Open source and community-driven.
                    </p>
                </div>
            </div>

            {/* Floating Items (Static) */}
            {items.map((item) => (
                <div
                    key={item.title}
                    className={cn("absolute z-10 hidden sm:block", item.position)}
                >
                    <Link href={item.href}>
                        <motion.div
                            initial={{ opacity: 0.6, scale: 0.95 }}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-border shadow-sm",
                                "cursor-pointer",
                                "bg-background text-foreground/70 hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <div className={cn("p-1 rounded-md bg-primary/10")}>
                                <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider">{item.title}</span>
                        </motion.div>
                    </Link>
                </div>
            ))}


        </div>
    );
}
