"use client";

import { useState, useEffect } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { apiClient } from "@/lib/api";

interface AppSubmissionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    name: string;
    description?: string;
    url: string;
    category: string;
    logo?: string;
    tags?: string;
  };
  onSubmit?: (data: any) => Promise<void>;
  isEdit?: boolean;
}

export default function AppSubmissionForm({
  onSuccess,
  onCancel,
  initialData,
  onSubmit,
  isEdit = false,
}: AppSubmissionFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    url: initialData?.url || "",
    category: initialData?.category || "",
    logo: initialData?.logo || "",
    tags: initialData?.tags || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          apiClient.getAppCategories(),
          apiClient.getAppTags(),
        ]);
        setCategories(categoriesRes.data || []);
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
        url: formData.url,
        category: formData.category,
        logo: formData.logo || undefined,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
      };
      
      if (onSubmit) {
        await onSubmit(submitData);
      } else {
        await apiClient.createApp(submitData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || `Failed to ${isEdit ? "submit edit" : "submit app"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">{isEdit ? "Edit App" : "Submit App"}</h2>
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
          URL <span className="text-destructive">*</span>
        </label>
        <Input
          type="url"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Category <span className="text-destructive">*</span>
        </label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <select
              value={isNewCategory ? "new" : formData.category}
              onChange={(e) => {
                if (e.target.value === "new") {
                  setIsNewCategory(true);
                  setFormData({ ...formData, category: "" });
                } else {
                  setIsNewCategory(false);
                  setFormData({ ...formData, category: e.target.value });
                }
              }}
              className="flex-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select category...</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">+ New Category</option>
            </select>
          </div>
          {isNewCategory && (
            <Input
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="Enter new category name"
              maxLength={100}
              required
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Logo URL</label>
        <Input
          type="url"
          value={formData.logo}
          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        {tagSuggestions.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {tagSuggestions.slice(0, 15).map((tag) => (
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
          placeholder="Comma-separated tags"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Click suggestions above to add, or type your own tags
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


