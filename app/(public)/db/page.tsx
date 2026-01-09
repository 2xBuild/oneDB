"use client";

import Link from "next/link";
import { Users, Smartphone, BookOpen, Twitter, Linkedin, Youtube, Instagram, Github, Globe, ArrowRight, Plus } from "lucide-react";

const platformIcons: Record<string, any> = {
    Twitter: Twitter,
    LinkedIn: Linkedin,
    YouTube: Youtube,
    Instagram: Instagram,
    GitHub: Github,
};

function getPlatformIcon(platform: string) {
    return platformIcons[platform] || Globe;
}

// Static categories for homepage
const staticPeoplePlatforms = ["Twitter/X", "LinkedIn", "YouTube", "Instagram"];
const staticAppCategories = ["Productivity", "Design", "Development", "Marketing"];
const staticResourceCategories = ["Tutorials", "Documentation", "Templates", "Articles"];

export default function DbPage() {
    const dbCategories = [
        {
            title: "People",
            description: "Find talented individuals across various niches",
            link: "/db/people",
            icon: Users,
            categories: staticPeoplePlatforms,
            categoryType: "platform",
            submitType: "people",
        },
        {
            title: "Apps",
            description: "All useful apps sorted by niche",
            link: "/db/apps",
            icon: Smartphone,
            categories: staticAppCategories,
            categoryType: "category",
            submitType: "app",
        },
        {
            title: "Resources",
            description: "All useful resources sorted by niche",
            link: "/db/resources",
            icon: BookOpen,
            categories: staticResourceCategories,
            categoryType: "category",
            submitType: "resource",
        },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                    Browse Our Database
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
                    Explore our curated collection of people, apps, and resources
                </p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {dbCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                        <div
                            key={category.title}
                            className="border border-border rounded-lg bg-card p-6 sm:p-8 flex flex-col h-full"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-border/60 bg-accent/10 rounded-t-lg -mx-6 sm:-mx-8 px-6 sm:px-8 pt-4 sm:pt-6 -mt-6 sm:-mt-8">
                            
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">{category.title}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="flex-1 mb-4 sm:mb-6">
                                {category.categories.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3">
                                        {category.categories.slice(0, 6).map((cat) => {
                                            const CategoryIcon =
                                                category.categoryType === "platform"
                                                    ? getPlatformIcon(cat)
                                                    : null;
                                            return (
                                                <Link
                                                    key={cat}
                                                    href={`${category.link}?${category.categoryType}=${encodeURIComponent(cat)}`}
                                                    className="flex items-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-accent/20 transition-colors text-sm"
                                                >
                                                    {CategoryIcon && (
                                                        <CategoryIcon className="w-3 h-3 flex-shrink-0" />
                                                    )}
                                                    <span className="truncate">{cat}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No categories available</p>
                                )}
                            </div>

                            {/* Action Links */}
                            <div className="flex flex-col gap-2 mt-auto">
                                <Link
                                    href={category.link}
                                    className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-accent/20 transition-colors text-sm font-medium"
                                >
                                    <span>View All</span>
                                </Link>
                                <Link
                                    href={`/submit?type=${category.submitType}`}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                                >
                                    <span>Add more in DB</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
