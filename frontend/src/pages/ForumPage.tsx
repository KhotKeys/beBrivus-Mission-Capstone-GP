import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { Layout } from "../components/layout";
import { HeroSection } from "../components/HeroSection";
import { Link } from "react-router-dom";

interface Discussion {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  is_pinned: boolean;
  is_locked: boolean;
  views_count: number;
  replies_count: number;
  likes_count: number;
  last_activity: string;
  tag_list: string[];
  is_liked_by_user: boolean;
  ai_summary?: string;
  created_at: string;
}

interface ForumCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  discussions_count: number;
  latest_discussion?: Discussion;
}

export const ForumPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("-last_activity");
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categoriesData } = useQuery<{ results: ForumCategory[] }>({
    queryKey: ["forum-categories"],
    queryFn: () => api.get("/forum/categories/").then((res: any) => res.data),
  });

  const categories = categoriesData?.results || [];

  // Fetch discussions
  const {
    data: discussionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["forum-discussions", selectedCategory, searchQuery, sortBy],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchQuery) params.append("q", searchQuery);
      params.append("ordering", sortBy);

      return api
        .get(`/forum/discussions/?${params.toString()}`)
        .then((res: any) => res.data);
    },
  });

  const discussions = discussionsData?.results || [];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const formatAuthorName = (author: Discussion["author"]) => {
    const rawName = author.first_name
      ? `${author.first_name} ${author.last_name || ""}`.trim()
      : author.username;
    return rawName === "Alain Michael Muhirwa" ? "Gabriel Pawuoi" : rawName;
  };

  const formatAuthorInitial = (author: Discussion["author"]) => {
    const name = formatAuthorName(author).trim();
    return name ? name[0].toUpperCase() : "?";
  };

  const likeDiscussion = async (discussion: Discussion) => {
    const primaryKey = discussion.slug || discussion.id;
    try {
      return await api.post(`/forum/discussions/${primaryKey}/like/`);
    } catch (err: any) {
      if (err?.response?.status === 404 && discussion.id && primaryKey !== discussion.id) {
        return api.post(`/forum/discussions/${discussion.id}/like/`);
      }
      throw err;
    }
  };

  // Like discussion mutation
  const likeMutation = useMutation({
    mutationFn: (discussion: Discussion) => likeDiscussion(discussion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-discussions"] });
    },
  });

  return (
    <Layout>
      <HeroSection
        title="Community Forum"
        subtitle="Ask questions, share insights, and learn with the BeBrivus community."
        backgroundVideo="/forum.mp4"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 text-center sm:text-left">
          {/* Search Bar */}
          <div className="flex-1 relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-neutral-500"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="relative w-full sm:w-48">
            <select
              className="w-full appearance-none bg-white border border-neutral-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-700"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-48">
            <select
              className="w-full appearance-none bg-white border border-neutral-200 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-700"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="-last_activity">Recent Activity</option>
              <option value="-created_at">Latest</option>
              <option value="-like_count">Most Liked</option>
              <option value="-reply_count">Most Discussed</option>
              <option value="-view_count">Most Viewed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="w-4 h-4 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </div>
          </div>

          {/* New Post Button */}
          <Link
            to="/forum/new"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
            New Post
          </Link>
        </div>

        {/* Discussions List */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden animate-pulse"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-200"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-4 bg-neutral-200 rounded w-24"></div>
                        <div className="h-4 bg-neutral-200 rounded w-16"></div>
                      </div>
                      <div className="h-6 bg-neutral-200 rounded w-3/4 mb-3"></div>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-neutral-200 rounded w-full"></div>
                        <div className="h-4 bg-neutral-200 rounded w-5/6"></div>
                        <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-neutral-200 rounded-full w-16"></div>
                        <div className="h-6 bg-neutral-200 rounded-full w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
                  <div className="flex items-center gap-6">
                    <div className="h-8 bg-neutral-200 rounded-full w-16"></div>
                    <div className="h-8 bg-neutral-200 rounded-full w-20"></div>
                    <div className="h-8 bg-neutral-200 rounded-full w-18"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-error-600 text-lg">Failed to load discussions</p>
          </div>
        ) : (
          <div className="space-y-6">
            {discussions.map((discussion: Discussion) => (
              <article
                key={discussion.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-neutral-100 overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-4 sm:p-6 pb-4 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* User Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 mx-auto sm:mx-0">
                      {formatAuthorInitial(discussion.author)}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* User Info and Time */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                        <h4 className="font-semibold text-neutral-900">
                          {formatAuthorName(discussion.author)}
                        </h4>
                        <span className="text-neutral-500 text-sm">•</span>
                        <time className="text-neutral-500 text-sm">
                          {formatTimeAgo(discussion.created_at)}
                        </time>
                        {/* Badges */}
                        {discussion.is_pinned && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                            � Pinned
                          </span>
                        )}
                      </div>

                      {/* Category Tag */}
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: discussion.category.color + "15",
                            color: discussion.category.color,
                          }}
                        >
                          {discussion.category.name}
                        </span>
                      </div>

                      {/* Post Content */}
                      <Link
                        to={`/forum/discussion/${discussion.slug}`}
                        className="block group"
                      >
                        <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {discussion.title}
                        </h2>

                        <div className="text-neutral-700 mb-4 line-clamp-3 leading-relaxed">
                          {discussion.content
                            .replace(/<[^>]*>/g, "")
                            .substring(0, 200)}
                          {discussion.content.length > 200 && "..."}
                        </div>
                      </Link>

                      {/* tag_list */}
                      {discussion.tag_list.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4 justify-center sm:justify-start">
                          {discussion.tag_list.slice(0, 4).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                            >
                              {tag}
                            </span>
                          ))}
                          {discussion.tag_list.length > 4 && (
                            <span className="text-xs text-neutral-500 px-2 py-1">
                              +{discussion.tag_list.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* AI Summary */}
                      {discussion.ai_summary && (
                        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-4 mb-4 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-primary-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                ></path>
                              </svg>
                            </div>
                            <span className="text-primary-700 font-medium text-sm">
                              AI Summary
                            </span>
                          </div>
                          <p className="text-sm text-primary-800 leading-relaxed">
                            {discussion.ai_summary}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Engagement Bar */}
                <div className="px-4 sm:px-6 py-4 bg-neutral-50 border-t border-neutral-100">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
                      {/* Like Button */}
                      <button
                        onClick={() => likeMutation.mutate(discussion)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                          discussion.is_liked_by_user
                            ? "bg-error-100 text-error-600 hover:bg-error-200"
                            : "text-neutral-600 hover:bg-neutral-200 hover:text-error-600"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill={
                            discussion.is_liked_by_user
                              ? "currentColor"
                              : "none"
                          }
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          ></path>
                        </svg>
                        <span className="font-medium text-sm">
                          {discussion.likes_count}
                        </span>
                      </button>

                      {/* Comments */}
                      <Link
                        to={`/forum/discussion/${discussion.slug}`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-200 hover:text-primary-600 transition-all duration-200"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          ></path>
                        </svg>
                        <span className="font-medium text-sm">
                          {discussion.replies_count}
                        </span>
                      </Link>

                      {/* Views */}
                      <div className="flex items-center gap-2 px-3 py-2 text-neutral-500">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          ></path>
                        </svg>
                        <span className="font-medium text-sm">
                          {discussion.views_count}
                        </span>
                      </div>
                    </div>

                    {/* Share Button */}
                    <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-200 hover:text-primary-600 transition-all duration-200 justify-center">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        ></path>
                      </svg>
                      <span className="font-medium text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && discussions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">�</span>
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">
              {searchQuery || selectedCategory
                ? "No posts found"
                : "Start the conversation!"}
            </h3>
            <p className="text-neutral-600 mb-8 max-w-md mx-auto leading-relaxed">
              {searchQuery || selectedCategory
                ? "Try adjusting your search or explore different topics. The perfect discussion might be just a click away."
                : "Be the pioneer! Share your entrepreneurial journey, ask questions, or spark meaningful discussions that inspire others."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/forum/new"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Create First Post
              </Link>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                  }}
                  className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-700 px-8 py-3 rounded-full font-medium transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
