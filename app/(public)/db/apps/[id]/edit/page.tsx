"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { App } from "@/lib/types";
import AppSubmissionForm from "@/app/(public)/submit/components/AppSubmissionForm";

export default function EditAppPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;

  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    const fetchApp = async () => {
      try {
        const res = await apiClient.getApp(id);
        const appData = res.data;

        if (!appData || appData.status !== "approved") {
          router.push("/db/apps");
          return;
        }

        setApp(appData);
      } catch (error) {
        console.error("Error fetching app:", error);
        router.push("/db/apps");
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id, isAuthenticated, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <p className="text-muted-foreground">App not found.</p>
        <Button onClick={() => router.push("/db/apps")} className="mt-4">
          Back to Apps
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.push("/db/apps")}
        className="mb-4"
      >
        ← Back to Apps
      </Button>

      <AppSubmissionForm
        onSuccess={() => {
          alert("Edit request submitted. It will be reviewed by the community.");
          router.push("/db/contribution");
        }}
        onCancel={() => router.push("/db/apps")}
        initialData={{
          name: app.name,
          description: app.description || "",
          url: app.url,
          category: app.category,
          logo: app.logo || "",
          tags: app.tags?.join(", ") || "",
        }}
        onSubmit={async (data) => {
          await apiClient.submitAppEdit(app.id, data);
        }}
        isEdit={true}
      />
    </div>
  );
}

