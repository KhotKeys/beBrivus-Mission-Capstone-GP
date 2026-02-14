import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { Layout } from "../components/layout";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  Share2,
  CheckCircle,
  Pin,
  Lock,
} from "lucide-react";

interface Author {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_picture?: string;
}

interface Reply {
  id: number;
  content: string;
  author: Author;
  parent?: number;
  likes_count: number;
  is_solution: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  child_replies: Reply[];
  is_liked_by_user: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface Discussion {
  id: number;
  title: string;
  content: string;
  discussion_type: string;
  author: Author;
  category: {
    id: number;
    name: string;
    description: string;
    color: string;
    icon: string;
  };
  views_count: number;
  likes_count: number;
  replies_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_resolved: boolean;
  ai_summary?: string;
  ai_keywords: string[];
  created_at: string;
  updated_at: string;
  last_activity: string;
  replies: Reply[];
  is_liked_by_user: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_moderate: boolean;
  tag_list: string[];
}

export const ForumDiscussionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Fetch discussion details
  const {
    data: discussion,
    isLoading,
    error,
  } = useQuery<Discussion>({
    queryKey: ["forum-discussion", slug],
    queryFn: () =>
      api.get(`/forum/discussions/${slug}/`).then((res) => res.data),
  });

  const postWithFallback = async (
    pathBuilder: (key: string | number) => string,
    data?: object
  ) => {
    const primaryKey = slug || discussion?.slug || discussion?.id;
    if (!primaryKey) {
      throw new Error("Missing discussion identifier.");
    }
    try {
      return await api.post(pathBuilder(primaryKey), data || {});
    } catch (err: any) {
      if (err?.response?.status === 404 && discussion?.id && primaryKey !== discussion.id) {
        return api.post(pathBuilder(discussion.id), data || {});
      }
      throw err;
    }
  };

  // Like discussion mutation
  const likeMutation = useMutation({
    mutationFn: () => postWithFallback((key) => `/forum/discussions/${key}/like/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-discussion", slug] });
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: (data: { content: string; parent?: number }) =>
      postWithFallback((key) => `/forum/discussions/${key}/replies/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-discussion", slug] });
      setReplyContent("");
      setReplyingTo(null);
      setReplyError(null);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Failed to post reply. Please try again.";
      setReplyError(message);
    },
  });

  // Like reply mutation
  const likeReplyMutation = useMutation({
    mutationFn: (replyId: number) =>
      postWithFallback((key) => `/forum/discussions/${key}/replies/${replyId}/like/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-discussion", slug] });
    },
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    if (!slug && !discussion?.slug && !discussion?.id) {
      setReplyError("Missing discussion identifier. Please refresh the page.");
      return;
    }
    setReplyError(null);

    replyMutation.mutate({
      content: replyContent,
      parent: replyingTo || undefined,
    });
  };

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

  const formatAuthorName = (author: Author) => {
    const rawName = author.full_name || author.email;
    return rawName === "Alain Michael Muhirwa" ? "Gabriel Pawuoi" : rawName;
  };

  const formatAuthorInitial = (author: Author) => {
    const name = formatAuthorName(author).trim();
    return name ? name[0].toUpperCase() : "?";
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !discussion) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-error-600 text-lg mb-4">Discussion not found</p>
            <Link
              to="/forum"
              className="text-primary-600 hover:text-primary-700"
            >
              Back to Forum
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forum
          </Link>

          {/* Discussion Card */}
          <article className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden mb-6">
            {/* Discussion Header */}
            <div className="p-4 sm:p-6 border-b border-neutral-100 text-center sm:text-left">
              {/* Category and Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: discussion.category.color + "15",
                    color: discussion.category.color,
                  }}
                >
                  {discussion.category.name}
                </span>
                {discussion.is_pinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </span>
                )}
                {discussion.is_locked && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-error-100 text-error-800">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                )}
                {discussion.is_resolved && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    <CheckCircle className="w-3 h-3" />
                    Resolved
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                {discussion.title}
              </h1>

              {/* Author Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg mx-auto sm:mx-0">
                  {formatAuthorInitial(discussion.author)}
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">
                    {formatAuthorName(discussion.author)}
                  </h4>
                  <time className="text-neutral-500 text-sm">
                    {formatTimeAgo(discussion.created_at)}
                  </time>
                </div>
              </div>
            </div>

            {/* Discussion Content */}
            <div className="p-4 sm:p-6">
              {/* AI Summary */}
              {discussion.ai_summary && (
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-4 mb-6">
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

              {/* Content */}
              <div
                className="prose prose-neutral max-w-none mb-6"
                dangerouslySetInnerHTML={{ __html: discussion.content }}
              />

              {/* Tags */}
              {discussion.tag_list.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {discussion.tag_list.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 pt-4 border-t border-neutral-100">
                <button
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    discussion.is_liked_by_user
                      ? "bg-error-100 text-error-600 hover:bg-error-200"
                      : "text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  <Heart
                    className="w-5 h-5"
                    fill={discussion.is_liked_by_user ? "currentColor" : "none"}
                  />
                  <span className="font-medium">{discussion.likes_count}</span>
                </button>

                <div className="flex items-center gap-2 text-neutral-600">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {discussion.replies_count}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-neutral-600">
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">{discussion.views_count}</span>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-all duration-200 sm:ml-auto">
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Share</span>
                </button>
              </div>
            </div>
          </article>

          {/* Replies Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-neutral-100 text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                {discussion.replies_count}{" "}
                {discussion.replies_count === 1 ? "Reply" : "Replies"}
              </h2>
            </div>

            {/* Reply Form */}
            {!discussion.is_locked && (
              <div className="p-4 sm:p-6 border-b border-neutral-100">
                <form onSubmit={handleSubmitReply}>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  {replyError && (
                    <p className="mt-2 text-sm text-error-600 text-center sm:text-left">
                      {replyError}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 mt-3">
                    {replyingTo && (
                      <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="px-4 py-2 text-neutral-600 hover:text-neutral-900"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={!replyContent.trim() || replyMutation.isPending}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {replyMutation.isPending ? "Posting..." : "Post Reply"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Replies List */}
            <div className="divide-y divide-neutral-100">
              {discussion.replies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  onLike={(replyId) => likeReplyMutation.mutate(replyId)}
                  onReply={(replyId) => setReplyingTo(replyId)}
                  formatTimeAgo={formatTimeAgo}
                  formatAuthorName={formatAuthorName}
                />
              ))}
            </div>

            {discussion.replies.length === 0 && !discussion.is_locked && (
              <div className="p-8 sm:p-12 text-center">
                <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">
                  No replies yet. Be the first to comment!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Reply Card Component
const ReplyCard: React.FC<{
  reply: Reply;
  onLike: (replyId: number) => void;
  onReply: (replyId: number) => void;
  formatTimeAgo: (date: string) => string;
  formatAuthorName: (author: Author) => string;
  depth?: number;
}> = ({ reply, onLike, onReply, formatTimeAgo, formatAuthorName, depth = 0 }) => {
  return (
    <div
      className={`p-4 sm:p-6 ${
        depth > 0 ? "sm:ml-12 sm:border-l-2 sm:border-neutral-200" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 text-center sm:text-left">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center text-white font-semibold flex-shrink-0 mx-auto sm:mx-0">
          {(formatAuthorName(reply.author).trim()[0] || "?").toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h4 className="font-semibold text-neutral-900">
              {formatAuthorName(reply.author)}
            </h4>
            <span className="text-neutral-500 text-sm">•</span>
            <time className="text-neutral-500 text-sm">
              {formatTimeAgo(reply.created_at)}
            </time>
            {reply.is_solution && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                <CheckCircle className="w-3 h-3" />
                Solution
              </span>
            )}
            {reply.is_edited && (
              <span className="text-neutral-400 text-xs">(edited)</span>
            )}
          </div>

          <div
            className="prose prose-sm prose-neutral max-w-none mb-3"
            dangerouslySetInnerHTML={{ __html: reply.content }}
          />

          <div className="flex items-center justify-center sm:justify-start gap-4">
            <button
              onClick={() => onLike(reply.id)}
              className={`flex items-center gap-1 text-sm ${
                reply.is_liked_by_user
                  ? "text-error-600"
                  : "text-neutral-500 hover:text-error-600"
              }`}
            >
              <Heart
                className="w-4 h-4"
                fill={reply.is_liked_by_user ? "currentColor" : "none"}
              />
              <span>{reply.likes_count}</span>
            </button>

            <button
              onClick={() => onReply(reply.id)}
              className="text-sm text-neutral-500 hover:text-primary-600"
            >
              Reply
            </button>
          </div>

          {/* Nested replies */}
          {reply.child_replies && reply.child_replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {reply.child_replies.map((childReply) => (
                <ReplyCard
                  key={childReply.id}
                  reply={childReply}
                  onLike={onLike}
                  onReply={onReply}
                  formatTimeAgo={formatTimeAgo}
                  formatAuthorName={formatAuthorName}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
