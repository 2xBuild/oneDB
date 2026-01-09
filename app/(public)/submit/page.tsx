"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";
import { apiClient } from "@/lib/api";
import ProjectSubmissionForm from "./components/ProjectSubmissionForm";
import IdeaSubmissionForm from "./components/IdeaSubmissionForm";
import PeopleSubmissionForm from "./components/PeopleSubmissionForm";
import ResourceSubmissionForm from "./components/ResourceSubmissionForm";
import AppSubmissionForm from "./components/AppSubmissionForm";

type SubmissionType = "project" | "idea" | "people" | "resource" | "app";

function SubmitPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [submissionType, setSubmissionType] = useState<SubmissionType | null>(null);

  useEffect(() => {
    const typeParam = searchParams.get("type") as SubmissionType | null;
    if (typeParam && ["project", "idea", "people", "resource", "app"].includes(typeParam)) {
      setSubmissionType(typeParam);
    }
  }, [searchParams]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4">Submit Content</h1>
        <p className="text-muted-foreground mb-6">Please sign in to submit content.</p>
        <Button asChild>
          <a href="/signin">Sign In</a>
        </Button>
      </div>
    );
  }

  if (!submissionType) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Submit Content</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setSubmissionType("project")}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-xl font-bold mb-2">Project</h3>
            <p className="text-sm text-muted-foreground">
              Submit a project to the Arena. Goes live immediately.
            </p>
          </button>
          <button
            onClick={() => setSubmissionType("idea")}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-xl font-bold mb-2">Idea</h3>
            <p className="text-sm text-muted-foreground">
              Submit an idea to the Arena. Goes live immediately.
            </p>
          </button>
          <button
            onClick={() => setSubmissionType("people")}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-xl font-bold mb-2">Person</h3>
            <p className="text-sm text-muted-foreground">
              Submit a person to the DB. Requires community approval.
            </p>
          </button>
          <button
            onClick={() => setSubmissionType("resource")}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-xl font-bold mb-2">Resource</h3>
            <p className="text-sm text-muted-foreground">
              Submit a resource to the DB. Requires community approval.
            </p>
          </button>
          <button
            onClick={() => setSubmissionType("app")}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow text-left"
          >
            <h3 className="text-xl font-bold mb-2">App</h3>
            <p className="text-sm text-muted-foreground">
              Submit an app to the DB. Requires community approval.
            </p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => setSubmissionType(null)}
        className="mb-4"
      >
        ← Back to selection
      </Button>

      {submissionType === "project" && (
        <ProjectSubmissionForm
          onSuccess={() => router.push("/arena")}
          onCancel={() => setSubmissionType(null)}
        />
      )}
      {submissionType === "idea" && (
        <IdeaSubmissionForm
          onSuccess={() => router.push("/arena")}
          onCancel={() => setSubmissionType(null)}
        />
      )}
      {submissionType === "people" && (
        <PeopleSubmissionForm
          onSuccess={() => router.push("/db/voting")}
          onCancel={() => setSubmissionType(null)}
        />
      )}
      {submissionType === "resource" && (
        <ResourceSubmissionForm
          onSuccess={() => router.push("/db/voting")}
          onCancel={() => setSubmissionType(null)}
        />
      )}
      {submissionType === "app" && (
        <AppSubmissionForm
          onSuccess={() => router.push("/db/voting")}
          onCancel={() => setSubmissionType(null)}
        />
      )}
    </div>
  );
}

export default function SubmitPage() {
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
      <SubmitPageContent />
    </Suspense>
  );
}

