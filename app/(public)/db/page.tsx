"use client";

import Link from "next/link";

export default function DbPage() {
    const dbCategories = [
        {
            title: "People",
            description: "Find talented individuals across various niches",
            link: "/db/people",
            submitType: "people",
        },
        {
            title: "Apps",
            description: "All useful apps sorted by niche",
            link: "/db/apps",
            submitType: "app",
        },
        {
            title: "Resources",
            description: "All useful resources sorted by niche",
            link: "/db/resources",
            submitType: "resource",
        },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-5xl">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <h1 className="text-xl p-2"> Explore db, our curated collection of people, apps, and resources.</h1>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {dbCategories.map((category) => (
                    <div
                        key={category.title}
                        className="border border-border rounded-xl bg-card p-5 flex flex-col"
                    >
                        {/* Title */}
                        <h2 className="text-lg font-semibold text-foreground">{category.title}</h2>
                        
                        {/* Divider */}
                        <div className="border-b border-border my-3 -mx-5" />

                        {/* Description */}
                        <p className="text-sm text-muted-foreground mb-5">{category.description}</p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-auto">
                            <Link
                                href={category.link}
                                className="px-4 py-1.5 bg-accent/50 hover:bg-accent/70 rounded-md transition-colors text-sm font-medium"
                            >
                                Explore
                            </Link>
                            <Link
                                href={`/submit?type=${category.submitType}`}
                                className="px-3 py-1.5 bg-accent/50 hover:bg-accent/70 rounded-md transition-colors text-sm font-medium"
                            >
                                Add +
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
