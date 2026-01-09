"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getGitHubContributors } from "../lib/github";

export default function Footer() {
  const [contributorCount, setContributorCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchContributors() {
      try {
        const count = await getGitHubContributors();
        // Excluding iBuild from contributor count
        setContributorCount(count -1);
      } catch (error) {
        console.error("Error fetching contributors:", error);
      }
    }
    fetchContributors();
  }, []);

  return (
    <footer className="w-full border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-wrap sm:flex-col items-center justify-center gap-1.5">
          <p className="text-sm text-muted-foreground">
            ©{new Date().getFullYear()} <Link href="https://oneDB.net/terms" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">oneDB</Link>. <Link href="https://github.com/2xBuild/oneDB" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">Open source and community-driven</Link>.
          </p>
          <p className="text-sm text-muted-foreground">
            <Link href="https://x.com/iBuild" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              Built by void{contributorCount !== null && ` with ${contributorCount} other contributor${contributorCount !== 1 ? 's' : ''}`}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
