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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["forum-categories"],
    queryFn: () => api.get("/forum/categories/").then((res: any) => res.data),
  });
  const categories = categoriesData?.results || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/forum/discussions/", data),
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
