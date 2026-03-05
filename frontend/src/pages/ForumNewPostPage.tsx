import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { Layout } from "../components/layout";

export const ForumNewPostPage: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [discussionType, setDiscussionType] = useState("discussion");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["forum-categories"],
    queryFn: () => api.get("/forum/categories/").then((res: any) => res.data),
  });
  const categories = categoriesData?.results || [];

  const createMutation = useMutation({
    mutationFn: async (postData: any) => {
      const formData = new FormData();
      formData.append('title', postData.title);
      formData.append('content', postData.content);
      if (postData.category) formData.append('category', String(postData.category));
      if (postData.discussion_type) formData.append('discussion_type', postData.discussion_type);
      if (postData.tags && postData.tags.length > 0) {
        formData.append('tags', JSON.stringify(postData.tags));
      }
      if (postData.image instanceof File) {
        formData.append('image', postData.image);
        console.log('Appending image:', postData.image.name, postData.image.size);
      }
      // Log FormData contents
      for (let [key, val] of formData.entries()) {
        console.log('FormData:', key, val);
      }
      const response = await api.post('/forum/discussions/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Response:', response.data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-discussions"] });
      navigate("/forum");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const postData: any = {
      title,
      content,
      category,
      discussion_type: discussionType,
      image: imageFile, // Pass the File object
    };

    // Only include tags if they exist
    if (tags.length > 0) {
      postData.tags = tags;
    }

    createMutation.mutate(postData);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6">Create New Forum Post</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Content</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              required
            />
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block mb-1 font-medium">Image (optional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="space-y-2">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-gray-600">
                      <span className="font-medium text-primary-600 hover:text-primary-500">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Image must be under 5MB');
                        return;
                      }
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }}
                  />
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Category</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={discussionType}
              onChange={(e) => setDiscussionType(e.target.value)}
            >
              <option value="discussion">Discussion</option>
              <option value="question">Question</option>
              <option value="announcement">Announcement</option>
              <option value="job_posting">Job Posting</option>
              <option value="resource_sharing">Resource Sharing</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Tags (optional, comma separated)
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={tags.join(", ")}
              onChange={(e) =>
                setTags(
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                )
              }
              placeholder="e.g., startup, funding, marketing"
            />
          </div>
          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-2 rounded font-semibold"
            disabled={createMutation.status === "pending"}
          >
            {createMutation.status === "pending" ? "Posting..." : "Create Post"}
          </button>
        </form>
      </div>
    </Layout>
  );
};
