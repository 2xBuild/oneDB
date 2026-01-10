"use client";

import { useState, useEffect } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { normalizePlatformName } from "@/lib/format-utils";

interface PeopleSubmissionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    description?: string;
    socialMediaPlatform: string;
    socialMediaLink: string;
    image?: string;
    tags?: string;
    followersCount?: string;
  };
  onSubmit?: (data: any) => Promise<void>;
  isEdit?: boolean;
}

export default function PeopleSubmissionForm({
  onSuccess,
  onCancel,
  initialData,
  onSubmit,
  isEdit = false,
}: PeopleSubmissionFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    socialMediaPlatform: initialData?.socialMediaPlatform || "",
    socialMediaLink: initialData?.socialMediaLink || "",
    image: initialData?.image || "",
    tags: initialData?.tags || "",
    followersCount: initialData?.followersCount || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [isNewPlatform, setIsNewPlatform] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [platformsRes, tagsRes] = await Promise.all([
          apiClient.getPeopleCategories(),
          apiClient.getPeopleTags(),
        ]);
        setPlatforms(platformsRes.data || []);
        setTagSuggestions(tagsRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
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
      const submitData = {
        name: formData.name,
        description: formData.description || undefined,
        socialMediaPlatform: normalizePlatformName(formData.socialMediaPlatform),
        socialMediaLink: formData.socialMediaLink,
        image: formData.image || undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
          : undefined,
        followersCount: formData.followersCount
          ? parseInt(formData.followersCount, 10)
          : undefined,
      };
      
      if (onSubmit) {
        await onSubmit(submitData);
      } else {
        await apiClient.createPerson(submitData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to ${isEdit ? "submit edit" : "submit person"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">{isEdit ? "Edit Person" : "Submit Person"}</h2>
      <p className="text-sm text-muted-foreground">
        {isEdit 
          ? "This edit request will require community approval before being applied."
          : "This submission will require community approval before being added to the database."}
      </p>

      <div>
        <label className="block text-sm font-medium mb-2">
          Name <span className="text-destructive">*</span>
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          maxLength={200}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          maxLength={5000}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Social Media Platform (Category) <span className="text-destructive">*</span>
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={isNewPlatform ? "new" : formData.socialMediaPlatform}
              onChange={(e) => {
                if (e.target.value === "new") {
                  setIsNewPlatform(true);
                  setFormData({ ...formData, socialMediaPlatform: "" });
                } else {
                  setIsNewPlatform(false);
                  setFormData({ ...formData, socialMediaPlatform: e.target.value });
                }
              }}
              className="flex-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select platform...</option>
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
              <option value="new">+ New Platform</option>
            </select>
          </div>
          {isNewPlatform && (
            <Input
              value={formData.socialMediaPlatform}
              onChange={(e) => setFormData({ ...formData, socialMediaPlatform: e.target.value })}
              placeholder="Enter new platform name"
              maxLength={100}
              required
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Social Media Link <span className="text-destructive">*</span>
        </label>
        <Input
          type="url"
          value={formData.socialMediaLink}
          onChange={(e) => setFormData({ ...formData, socialMediaLink: e.target.value })}
          required
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Profile Image URL</label>
        <Input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags (Actual Category)</label>
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
          placeholder="Comma-separated tags (e.g., Developer, Designer, Writer)"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Click suggestions above to add, or type your own tags
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Followers/Subscribers Count</label>
        <Input
          type="number"
          value={formData.followersCount}
          onChange={(e) => setFormData({ ...formData, followersCount: e.target.value })}
          placeholder="e.g., 1000000"
          min="0"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Optional: Enter the current follower or subscriber count
        </p>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? (isEdit ? "Submitting Edit..." : "Submitting...") : (isEdit ? "Submit Edit for Review" : "Submit for Review")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}


