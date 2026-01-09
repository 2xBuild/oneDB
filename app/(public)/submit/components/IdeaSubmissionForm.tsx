"use client";

import { useState, useEffect } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { apiClient } from "@/lib/api";

interface IdeaSubmissionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function IdeaSubmissionForm({
  onSuccess,
  onCancel,
}: IdeaSubmissionFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bannerImage: "",
    tags: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tagsRes = await apiClient.getIdeaTags();
        setTagSuggestions(tagsRes.data || []);
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.createIdea({
        title: formData.title,
        description: formData.description || undefined,
        bannerImage: formData.bannerImage || undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to submit idea");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Submit Idea</h2>

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
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        {tagSuggestions.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {tagSuggestions.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const currentTags = formData.tags
                      ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
                      : [];
                    if (!currentTags.includes(tag)) {
                      setFormData({
                        ...formData,
                        tags: [...currentTags, tag].join(", "),
                      });
                    }
                  }}
                  className="px-2 py-1 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors"
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>
        )}
        <Input
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="Comma-separated tags (e.g., web, design, ui)"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Click suggestions above to add, or type your own tags separated by commas
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Idea"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}


