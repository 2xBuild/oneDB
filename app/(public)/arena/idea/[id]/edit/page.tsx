"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { Idea } from "@onedb/types";

export default function EditIdeaPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;

  const [idea, setIdea] = useState<Idea | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bannerImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIdea = useCallback(async () => {
    try {
      const res = await apiClient.getIdea(id);
      const ideaData = res.data;

      // Checking if user is the author
      if (!user || !ideaData.author || user.id !== ideaData.author.id) {
        router.push(`/arena/idea/${id}`);
        return;
      }

      setIdea(ideaData);
      setFormData({
        title: ideaData.title || "",
        description: ideaData.description || "",
        bannerImage: ideaData.bannerImage || "",
      });
    } catch (error) {
      console.error("Error fetching idea:", error);
      router.push(`/arena/idea/${id}`);
    } finally {
      setLoading(false);
    }
  }, [id, user, router]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      router.push("/signin");
      return;
    }
    fetchIdea();
  }, [id, isAuthenticated, user, authLoading, fetchIdea, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.updateIdea(id, {
        title: formData.title,
        description: formData.description || undefined,
        bannerImage: formData.bannerImage || undefined,
      });
      router.push(`/arena/idea/${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update idea");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p>Loading...</p>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p>Idea not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Edit Idea</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Title <span className="text-destructive">*</span>
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border rounded-md resize-none"
            rows={6}
            maxLength={5000}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Banner Image URL</label>
          <Input
            type="url"
            value={formData.bannerImage}
            onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
            placeholder="https://..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Banner-type image for better explanation of the idea
          </p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update Idea"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/arena/idea/${id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

