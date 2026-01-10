"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { Resource } from "@/lib/types";
import ResourceSubmissionForm from "@/app/(public)/submit/components/ResourceSubmissionForm";

export default function EditResourcePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }

    const fetchResource = async () => {
      try {
        const res = await apiClient.getResource(id);
        const resourceData = res.data;

        if (!resourceData || resourceData.status !== "approved") {
          router.push("/db/resources");
          return;
        }

        setResource(resourceData);
      } catch (error) {
        console.error("Error fetching resource:", error);
        router.push("/db/resources");
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
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

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <p className="text-muted-foreground">Resource not found.</p>
        <Button onClick={() => router.push("/db/resources")} className="mt-4">
          Back to Resources
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.push("/db/resources")}
        className="mb-4"
      >
        ← Back to Resources
      </Button>

      <ResourceSubmissionForm
        onSuccess={() => {
          alert("Edit request submitted. It will be reviewed by the community.");
          router.push("/db/contribution");
        }}
        onCancel={() => router.push("/db/resources")}
        initialData={{
          title: resource.title,
          description: resource.description || "",
          url: resource.url,
          category: resource.category,
          image: resource.image || "",
          tags: resource.tags?.join(", ") || "",
        }}
        onSubmit={async (data) => {
          await apiClient.submitResourceEdit(resource.id, data);
        }}
        isEdit={true}
      />
    </div>
  );
}

