"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    // NextAuth handles the actual callback at /api/auth/callback/[provider]
    // This page is just a fallback that redirects to home after auth completes
    if (status === "authenticated") {
      router.push("/");
    } else if (status === "unauthenticated") {
      router.push("/signin?error=authentication_failed");
    }
  }, [status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

