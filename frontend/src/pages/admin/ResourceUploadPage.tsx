import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Upload, FileText, Video, File, Tag, CheckCircle } from "lucide-react";
import { Button, Card, CardBody } from "../../components/ui";
import { adminApi } from "../../services/adminApi";

const typeOptions = [
  { value: "guide", label: "Guide" },
  { value: "template", label: "Template" },
  { value: "tutorial", label: "Tutorial" },
  { value: "video", label: "Video" },
  { value: "article", label: "Article" },
  { value: "tool", label: "Tool" },
  { value: "checklist", label: "Checklist" },
  { value: "webinar", label: "Webinar" },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "guide":
    case "template":
    case "tutorial":
    case "article":
    case "checklist":
      return FileText;
    case "video":
    case "webinar":
      return Video;
    case "tool":
      return File;
    default:
      return File;
  }
};

export const ResourceUploadPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("guide");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [isPublished, setIsPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);

  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const TypeIcon = getTypeIcon(type);

  const handleAddTag = () => {
    const trimmed = currentTag.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags([...tags, trimmed]);
    setCurrentTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await adminApi.getResourceCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    const loadResource = async () => {
      if (!id) return;
      try {
        const resource = await adminApi.getResource(Number(id));
        setTitle(resource.title || "");
        setSlug(resource.slug || "");
        setDescription(resource.description || "");
        setCategory(resource.category?.id ? String(resource.category.id) : "");
        setType(resource.resource_type || "guide");
        setTags(resource.tags || []);
        setExternalUrl(resource.external_url || "");
        setDifficulty(resource.difficulty_level || "beginner");
        setIsPublished(Boolean(resource.is_published));
      } catch (err) {
        console.error("Failed to load resource:", err);
        setError("Unable to load resource details.");
      }
    };

    loadCategories();
    loadResource();
  }, [id]);

  const slugValue = useMemo(() => {
    return title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
  }, [title]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!file && !externalUrl) {
      setError("Add a file or an external link before publishing.");
      return;
    }

    if (!category) {
      setError("Select a category before publishing.");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("title", title);
      formData.append(
        "slug",
        (isEditMode && slug) || slugValue || `resource-${Date.now()}`
      );
      formData.append("description", description);
      formData.append("resource_type", type);
      formData.append("category_id", category);
      formData.append("difficulty_level", difficulty);
      formData.append("external_url", externalUrl);
      formData.append("is_published", String(isPublished));
      if (isPublished) {
        formData.append("published_at", new Date().toISOString());
      }
      if (file) {
        formData.append("file", file);
      }
      tags.forEach((tag) => formData.append("tags", tag));

      if (isEditMode) {
        await adminApi.updateResource(Number(id), formData);
      } else {
        await adminApi.createResource(formData);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      navigate("/admin/resources");
    } catch (err: any) {
      console.error("Failed to save resource:", err);
      const responseData = err?.response?.data;
      if (responseData) {
        if (typeof responseData === "string") {
          setError(responseData);
        } else if (responseData.detail) {
          setError(responseData.detail);
        } else if (responseData.error) {
          setError(responseData.error);
        } else {
          try {
            setError(JSON.stringify(responseData));
          } catch {
            setError("Failed to save resource. Please try again.");
          }
        }
      } else {
        setError("Failed to save resource. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            {isEditMode ? "Edit Resource" : "Add Resource"}
          </h1>
          <p className="text-neutral-600 mt-1">
            Upload guides, templates, tutorials, and videos for students and graduates.
          </p>
        </div>
        {saved && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 text-success-700 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            Resource published
          </div>
        )}
        {error && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-error-100 text-error-700 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <Card>
        <CardBody className="p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g., Scholarship Essay Template"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Short summary for students"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((item) => (
                        <option key={item.id} value={String(item.id)}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Resource Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={type}
                      onChange={(event) => setType(event.target.value)}
                    >
                      {typeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={difficulty}
                      onChange={(event) => setDifficulty(event.target.value)}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      External Link (optional)
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={externalUrl}
                      onChange={(event) => setExternalUrl(event.target.value)}
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={currentTag}
                      onChange={(event) => setCurrentTag(event.target.value)}
                      placeholder="Add a tag"
                    />
                    <Button type="button" variant="secondary" onClick={handleAddTag}>
                      <Tag className="w-4 h-4 mr-2" />
                      Add Tag
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Upload File
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400">
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4,.mov,.avi"
                      onChange={(event) => setFile(event.target.files?.[0] || null)}
                    />
                    <Upload className="w-6 h-6 text-neutral-500 mb-2" />
                    <p className="text-sm text-neutral-600">
                      Drag a file here or click to upload
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      PDF, video, image, or document
                    </p>
                  </label>

                  {file && (
                    <div className="flex items-center gap-3 mt-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-primary-700 mb-2">
                    Visibility
                  </h3>
                  <label className="inline-flex items-center gap-2 text-sm text-primary-700">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(event) => setIsPublished(event.target.checked)}
                    />
                    Publish immediately (visible to users)
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <Button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white"
                disabled={isSubmitting}
              >
                {isEditMode ? "Save Changes" : "Publish Resource"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
