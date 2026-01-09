"use client";

import Link from "next/link";
import { 
  FolderKanban, 
  CheckCircle,
  Database,
  Vote,
} from "lucide-react";
import OneDBVisualization from "./onedb-visualization";

export default function LandingPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <OneDBVisualization />

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
          
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
              See what's inside oneDB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Arena Features */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-3 mb-4 border-b border-border border-dashed pb-3">
                <div className="p-2 bg-primary/10 rounded-lg ">
                  <FolderKanban className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Arena</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Share your projects and ideas with community and explore other's.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Instant publishing - no approval required.</span>
                </li>
               
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Weekly ranking by community interaction and time.</span>
                </li>
              </ul>
            </div>

            {/* DB Features */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-3 mb-4 border-b border-border border-dashed pb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Database</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Curated database of people, resources, and apps. Community-validated through voting to ensure quality.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>People, Resources, Apps</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Category and tag filtering</span>
                </li>
                
              </ul>
            </div>

            {/* Community Features */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 bg-card">
              <div className="flex items-center gap-3 mb-4 border-b border-border border-dashed pb-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Vote className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Community</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Vote on submissions, contribute to the database, and help build the best resource discovery platform.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Upvote/downvote system</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Threshold-based approval</span>
                </li>
                
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
