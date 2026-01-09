"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import GoogleIcon from "./googleIcon"
import GitHubIcon from "./githubIcon"
import DiscordIcon from "./discordIcon"

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
  const [isLoadingDiscord, setIsLoadingDiscord] = useState(false);

  const handleGoogleLogin = async () => {
    if (!acceptedTerms) {
      return;
    }
    setIsLoadingGoogle(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Google sign in error:", error);
      setIsLoadingGoogle(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (!acceptedTerms) {
      return;
    }
    setIsLoadingGitHub(true);
    try {
      await signIn("github", { callbackUrl: "/" });
    } catch (error) {
      console.error("GitHub sign in error:", error);
      setIsLoadingGitHub(false);
    }
  };

  const handleDiscordLogin = async () => {
    if (!acceptedTerms) {
      return;
    }
    setIsLoadingDiscord(true);
    try {
      await signIn("discord", { callbackUrl: "/" });
    } catch (error) {
      console.error("Discord sign in error:", error);
      setIsLoadingDiscord(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <div className="w-full max-w-sm space-y-3">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            {error === "authentication_failed" && "Authentication failed. Please try again."}
            {error === "no_token" && "No authentication token received. Please try again."}
          </div>
        )}
        
        <button
          onClick={handleGoogleLogin}
          disabled={!acceptedTerms || isLoadingGoogle || isLoadingGitHub || isLoadingDiscord}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GoogleIcon className="w-5 h-5" />
          <span>{isLoadingGoogle ? "Signing in..." : "Continue with Google"}</span>
        </button>

        <button
          onClick={handleGitHubLogin}
          disabled={!acceptedTerms || isLoadingGoogle || isLoadingGitHub || isLoadingDiscord}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <GitHubIcon className="w-5 h-5" />
          <span>{isLoadingGitHub ? "Signing in..." : "Continue with GitHub"}</span>
        </button>

        <button
          onClick={handleDiscordLogin}
          disabled={!acceptedTerms || isLoadingGoogle || isLoadingGitHub || isLoadingDiscord}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DiscordIcon className="w-5 h-5" />
          <span>{isLoadingDiscord ? "Signing in..." : "Continue with Discord"}</span>
        </button>

        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            id="accept-terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-foreground/20 text-primary focus:ring-2 focus:ring-primary flex-shrink-0"
          />
          <div className="text-sm text-foreground/80 flex-1">
            <label htmlFor="accept-terms" className="cursor-pointer">
              By logging in, you accept our{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
                onClick={(e) => e.stopPropagation()}
              >
                Terms & Conditions
              </Link>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  )
}
