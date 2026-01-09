"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { Project } from "@onedb/types";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const id = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    description: "",
    githubLink: "",
    liveLink: "",
    projectImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      const res = await apiClient.getProject(id);
      const projectData = res.data;

      // Checking if user is the author
      if (!user || !projectData.author || user.id !== projectData.author.id) {
        router.push(`/arena/project/${id}`);
        return;
      }

      setProject(projectData);
      setFormData({
        title: projectData.title || "",
        tagline: projectData.tagline || "",
        description: projectData.description || "",
        githubLink: projectData.githubLink || "",
        liveLink: projectData.liveLink || "",
        projectImage: projectData.projectImage || "",
      });
    } catch (error) {
      console.error("Error fetching project:", error);
      router.push(`/arena/project/${id}`);
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
    fetchProject();
  }, [id, isAuthenticated, user, authLoading, fetchProject, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.updateProject(id, {
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description || undefined,
        githubLink: formData.githubLink || undefined,
        liveLink: formData.liveLink || undefined,
        projectImage: formData.projectImage || undefined,
      });
      router.push(`/arena/project/${id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update project");
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

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Edit Project</h1>

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
          <label className="block text-sm font-medium mb-2">
            Tagline <span className="text-destructive">*</span>
          </label>
          <Input
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            required
            maxLength={200}
            placeholder="Short one-liner description"
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
          <label className="block text-sm font-medium mb-2">GitHub Link</label>
          <Input
            type="url"
            value={formData.githubLink}
            onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
            placeholder="https://github.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Live Link</label>
          <Input
            type="url"
            value={formData.liveLink}
            onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Project Image URL</label>
          <Input
            type="url"
            value={formData.projectImage}
            onChange={(e) => setFormData({ ...formData, projectImage: e.target.value })}
            placeholder="https://..."
          />
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Updating..." : "Update Project"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/arena/project/${id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

