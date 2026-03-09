import apiClient from './client';

export interface Badge {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  rarity: string;
  icon: string;
  color: string;
  points_required: number;
  condition_type: string;
  condition_value: number;
  condition_data: any;
  is_active: boolean;
  is_hidden: boolean;
  earned_count: number;
  user_earned: boolean;
  user_progress: number;
  created_at: string;
}

export interface UserBadge {
  id: number;
  badge: Badge;
  earned: boolean;
  earned_at: string;
  progress: number;
  notified: boolean;
}

export interface Level {
  id: number;
  level_number: number;
  name: string;
  min_points: number;
  max_points: number;
  icon: string;
  color: string;
  benefits: any;
}

export interface UserProfile {
  user: any;
  total_points: number;
  current_level?: Level;
  level_progress: number;
  current_login_streak: number;
  longest_login_streak: number;
  current_activity_streak: number;
  longest_activity_streak: number;
  applications_submitted: number;
  opportunities_bookmarked: number;
  resources_completed: number;
  forum_posts: number;
  forum_likes_received: number;
  mentoring_sessions: number;
  workshops_attended: number;
  badges_earned: number;
  rare_badges_earned: number;
  show_progress: boolean;
  public_profile: boolean;
  next_level?: Level;
  total_badges: number;
  recent_badges: UserBadge[];
  rank: number;
}

export interface PointTransaction {
  id: number;
  user: string;
  points: number;
  transaction_type: string;
  reason: string;
  description: string;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  score: number;
  level?: number;
  badges_count?: number;
}

export interface UserStats {
  total_points: number;
  current_level: number;
  badges_earned: number;
  rank: number;
  login_streak: number;
  applications_count: number;
  resources_completed: number;
}

export interface GamificationSummary {
  total_users: number;
  total_badges: number;
  total_points_distributed: number;
  active_challenges: number;
  top_performers: LeaderboardEntry[];
}

export const gamificationApi = {
  // Badges
  getBadges: (params?: any) =>
    apiClient.get<Badge[]>('/gamification/badges/', { params }),
  
  getUserBadges: () =>
    apiClient.get<UserBadge[]>('/gamification/user/badges/'),

  // Levels
  getLevels: () =>
    apiClient.get<Level[]>('/gamification/levels/'),

  // User Profile & Stats
  getUserProfile: () =>
    apiClient.get<UserProfile>('/gamification/profile/'),
  
  updateUserProfile: (data: any) =>
    apiClient.put<UserProfile>('/gamification/profile/', data),
  
  getUserStats: () =>
    apiClient.get<UserStats>('/gamification/stats/'),

  // Points
  getPointHistory: (params?: any) =>
    apiClient.get<{ results: PointTransaction[]; count: number; next?: string; previous?: string }>('/gamification/points/history/', { params }),
  
  awardPoints: (userId: number, points: number, reason: string) =>
    apiClient.post('/gamification/points/award/', { user_id: userId, points, reason }),

  // Leaderboard
  getLeaderboard: (type: string = 'points', period: string = 'all_time', limit: number = 10) =>
    apiClient.get<LeaderboardEntry[]>('/gamification/leaderboard/', {
      params: { type, period, limit }
    }),

  // Badge Progress
  checkBadgeProgress: () =>
    apiClient.post('/gamification/check-progress/'),

  // Summary
  getSummary: () =>
    apiClient.get<GamificationSummary>('/gamification/summary/'),
};
