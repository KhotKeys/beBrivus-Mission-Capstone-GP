import apiClient from './client';

export interface ForumCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  icon: string;
  color: string;
  is_active: boolean;
  discussion_count: number;
  latest_discussion?: Discussion;
  created_at: string;
}

export interface Discussion {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: ForumCategory;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  like_count: number;
  last_activity: string;
  last_reply?: Reply;
  tags: string[];
  user_liked: boolean;
  user_following: boolean;
  ai_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface Reply {
  id: number;
  discussion: number;
  parent?: number;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  content: string;
  like_count: number;
  is_approved: boolean;
  user_liked: boolean;
  replies: Reply[];
  created_at: string;
  updated_at: string;
}

export interface DiscussionLike {
  id: number;
  user: any;
  discussion?: number;
  reply?: number;
  created_at: string;
}

export interface UserForumProfile {
  user: any;
  discussions_count: number;
  replies_count: number;
  likes_received: number;
  reputation_score: number;
  is_moderator: boolean;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export const forumApi = {
  // Categories
  getCategories: () =>
    apiClient.get<ForumCategory[]>('/forum/categories/'),
  
  getCategoryDetail: (slug: string) =>
    apiClient.get<ForumCategory>(`/forum/categories/${slug}/`),

  // Discussions
  getDiscussions: (params?: any) =>
    apiClient.get<{ results: Discussion[]; count: number; next?: string; previous?: string }>('/forum/discussions/', { params }),
  
  getDiscussion: (slug: string) =>
    apiClient.get<Discussion>(`/forum/discussions/${slug}/`),
  
  createDiscussion: (data: any) =>
    apiClient.post<Discussion>('/forum/discussions/', data),
  
  updateDiscussion: (slug: string, data: any) =>
    apiClient.put<Discussion>(`/forum/discussions/${slug}/`, data),
  
  deleteDiscussion: (slug: string) =>
    apiClient.delete(`/forum/discussions/${slug}/`),
  
  likeDiscussion: (discussionId: number) =>
    apiClient.post(`/forum/discussions/${discussionId}/like/`),
  
  unlikeDiscussion: (discussionId: number) =>
    apiClient.delete(`/forum/discussions/${discussionId}/like/`),
  
  followDiscussion: (discussionId: number) =>
    apiClient.post(`/forum/discussions/${discussionId}/follow/`),
  
  unfollowDiscussion: (discussionId: number) =>
    apiClient.delete(`/forum/discussions/${discussionId}/follow/`),

  // Replies
  getReplies: (discussionId: number, params?: any) =>
    apiClient.get<{ results: Reply[]; count: number; next?: string; previous?: string }>(`/forum/discussions/${discussionId}/replies/`, { params }),
  
  createReply: (discussionId: number, data: any) =>
    apiClient.post<Reply>(`/forum/discussions/${discussionId}/replies/`, data),
  
  updateReply: (discussionId: number, replyId: number, data: any) =>
    apiClient.put<Reply>(`/forum/discussions/${discussionId}/replies/${replyId}/`, data),
  
  deleteReply: (discussionId: number, replyId: number) =>
    apiClient.delete(`/forum/discussions/${discussionId}/replies/${replyId}/`),
  
  likeReply: (replyId: number) =>
    apiClient.post(`/forum/replies/${replyId}/like/`),
  
  unlikeReply: (replyId: number) =>
    apiClient.delete(`/forum/replies/${replyId}/like/`),

  // User profile
  getUserProfile: (userId?: number) =>
    apiClient.get<UserForumProfile>(`/forum/profile/${userId ? `${userId}/` : ''}`),
  
  updateUserProfile: (data: any) =>
    apiClient.put<UserForumProfile>('/forum/profile/', data),

  // Moderation (admin only)
  moderateContent: (contentId: number, contentType: string, action: string) =>
    apiClient.post('/forum/moderate/', { content_id: contentId, content_type: contentType, action }),
  
  getModerationLog: () =>
    apiClient.get('/forum/moderation-log/'),

  // AI Features
  generateSummary: (discussionId: number) =>
    apiClient.post(`/forum/discussions/${discussionId}/ai-summary/`),
  
  getSuggestions: (query: string) =>
    apiClient.get('/forum/ai-suggestions/', { params: { q: query } }),
};
