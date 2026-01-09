"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function TrackBox({ title, description, link }: { title: string, description: string, link: string }) {
    const router = useRouter();

    // add icons too with lucid icon 
    return (
        <div
            className="card card-interactive  m-2 p-4 ml-5 mr-6 sm:w-[400px] sm:h-fit cursor-pointer flex flex justify-between border border-accent rounded-lg hover:bg-accent"
            onClick={() => router.push(link)}
        >
            <div className="flex-1">
                <h1 className="text-xl font-bold mb-2">{title}</h1>
                <p className="text-sm text-light-foreground">{description}</p>
            </div>

            <div className="flex justify-end items-center mt-2">
                <span className="text-primary text-sm font-medium flex items-center gap-1">
                    <ArrowRight />
                </span>
            </div>
        </div>
    );
}
