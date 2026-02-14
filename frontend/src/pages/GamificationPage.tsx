import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { Layout } from "../components/layout";
import {
  Trophy,
  Star,
  Target,
  Flame,
  Crown,
  Award,
  TrendingUp,
  Medal,
  Lock,
  CheckCircle,
  BarChart3,
} from "lucide-react";

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  points_value: number;
  unlock_criteria: string;
  is_unlocked?: boolean;
  unlocked_at?: string;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_awarded: number;
  progress: number;
  total_required: number;
  is_completed: boolean;
  completed_at?: string;
}

interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  total_points: number;
  level: number;
  level_progress: number;
  points_to_next_level: number;
  badges_count: number;
  achievements_count: number;
  rank: number;
  streak_days: number;
}

interface LeaderboardEntry {
  user: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  total_points: number;
  level: number;
  rank: number;
  badges_count: number;
}

export const GamificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "badges" | "achievements" | "leaderboard"
  >("overview");
  const [badgeFilter, setBadgeFilter] = useState<string>("");
  const [leaderboardType, setLeaderboardType] = useState<
    "all" | "weekly" | "monthly"
  >("all");

  // Fetch user profile
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["gamification-profile"],
    queryFn: () =>
      api.get("/gamification/profile/").then((res: any) => res.data),
  });

  // Fetch badges
  const { data: badgesData } = useQuery<{ results: Badge[] }>({
    queryKey: ["gamification-badges", badgeFilter],
    queryFn: () => {
      const params = badgeFilter ? `?category=${badgeFilter}` : "";
      return api
        .get(`/gamification/badges/${params}`)
        .then((res: any) => res.data);
    },
  });

  // Fetch achievements
  const { data: achievementsData } = useQuery<{ results: Achievement[] }>({
    queryKey: ["gamification-achievements"],
    queryFn: () =>
      api.get("/gamification/achievements/").then((res: any) => res.data),
  });

  // Fetch leaderboard
  const { data: leaderboardData } = useQuery<{ results: LeaderboardEntry[] }>({
    queryKey: ["gamification-leaderboard", leaderboardType],
    queryFn: () => {
      const params =
        leaderboardType !== "all" ? `?period=${leaderboardType}` : "";
      return api
        .get(`/gamification/leaderboard/${params}`)
        .then((res: any) => res.data);
    },
  });

  const badges = badgesData?.results || [];
  const achievements = achievementsData?.results || [];
  const leaderboard = leaderboardData?.results || [];
  const badgeCategories: string[] = [
    ...new Set(badges.map((b: Badge) => b.category)),
  ];

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "text-gray-600 bg-gray-100",
      uncommon: "text-green-600 bg-green-100",
      rare: "text-blue-600 bg-blue-100",
      epic: "text-purple-600 bg-purple-100",
      legendary: "text-yellow-600 bg-yellow-100",
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const formatDisplayName = (user: any) => {
    return user.first_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;
  };

  if (!profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-secondary-900 mb-4">
            Your Progress Dashboard
          </h1>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Track your achievements, earn badges, and see how you compare with
            the community!
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-secondary-200">
            {[
              { key: "overview", label: "Overview", icon: BarChart3 },
              { key: "badges", label: "Badges", icon: Trophy },
              { key: "achievements", label: "Achievements", icon: Target },
              { key: "leaderboard", label: "Leaderboard", icon: Crown },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2 ${
                    activeTab === tab.key
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-secondary-600 hover:text-secondary-900 hover:bg-secondary-50"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="card">
              <div className="card-body text-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-12 h-12 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                  {formatDisplayName(profile)}
                </h2>
                <div className="flex justify-center items-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">
                      {profile.level}
                    </div>
                    <div className="text-sm text-secondary-600">Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">
                      {profile.total_points.toLocaleString()}
                    </div>
                    <div className="text-sm text-secondary-600">
                      Total Points
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">
                      #{profile.rank}
                    </div>
                    <div className="text-sm text-secondary-600">Rank</div>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-secondary-600 mb-2">
                    <span>Level {profile.level}</span>
                    <span>
                      {profile.points_to_next_level} points to next level
                    </span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${profile.level_progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card text-center">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Trophy className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-2xl font-bold text-secondary-900">
                    {profile.badges_count}
                  </div>
                  <div className="text-secondary-600">Badges Earned</div>
                </div>
              </div>
              <div className="card text-center">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Target className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-2xl font-bold text-secondary-900">
                    {profile.achievements_count}
                  </div>
                  <div className="text-secondary-600">Achievements</div>
                </div>
              </div>
              <div className="card text-center">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Flame className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-2xl font-bold text-secondary-900">
                    {profile.streak_days}
                  </div>
                  <div className="text-secondary-600">Day Streak</div>
                </div>
              </div>
              <div className="card text-center">
                <div className="card-body">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-2xl font-bold text-secondary-900">
                    {profile.level}
                  </div>
                  <div className="text-secondary-600">Current Level</div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="card">
              <div className="card-body">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  Recent Achievements
                </h3>
                <div className="space-y-3">
                  {achievements
                    .filter((a) => a.is_completed)
                    .slice(0, 5)
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-4 p-3 bg-secondary-50 rounded-lg"
                      >
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-secondary-900">
                            {achievement.name}
                          </h4>
                          <p className="text-sm text-secondary-600">
                            {achievement.description}
                          </p>
                        </div>
                        <div className="text-primary-600 font-semibold">
                          +{achievement.points_awarded} pts
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === "badges" && (
          <div>
            {/* Badge Filters */}
            <div className="card mb-8">
              <div className="card-body">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setBadgeFilter("")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      !badgeFilter
                        ? "bg-primary-600 text-white"
                        : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                    }`}
                  >
                    All Badges
                  </button>
                  {badgeCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setBadgeFilter(category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        badgeFilter === category
                          ? "bg-primary-600 text-white"
                          : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {badges.map((badge: Badge) => (
                <div
                  key={badge.id}
                  className={`card transition-all hover:shadow-lg ${
                    badge.is_unlocked ? "bg-white" : "bg-gray-50 opacity-75"
                  }`}
                >
                  <div className="card-body text-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      {badge.is_unlocked ? (
                        <Medal className="w-8 h-8 text-primary-600" />
                      ) : (
                        <Lock className="w-8 h-8 text-secondary-400" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-secondary-600 mb-3">
                      {badge.description}
                    </p>
                    <div className="flex justify-center gap-2 mb-3">
                      <span
                        className={`badge text-xs ${getRarityColor(
                          badge.rarity
                        )}`}
                      >
                        {badge.rarity.charAt(0).toUpperCase() +
                          badge.rarity.slice(1)}
                      </span>
                      <span className="badge badge-secondary text-xs">
                        {badge.points_value} pts
                      </span>
                    </div>
                    {badge.is_unlocked ? (
                      <div className="text-xs text-success-600 font-medium flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Unlocked{" "}
                        {badge.unlocked_at &&
                          new Date(badge.unlocked_at).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="text-xs text-secondary-500">
                        {badge.unlock_criteria}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="space-y-6">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="card">
                <div className="card-body">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      {achievement.is_completed ? (
                        <Award className="w-6 h-6 text-primary-600" />
                      ) : (
                        <Target className="w-6 h-6 text-secondary-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-secondary-900">
                          {achievement.name}
                        </h3>
                        {achievement.is_completed && (
                          <span className="badge bg-success-100 text-success-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-secondary-600 mb-3">
                        {achievement.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-secondary-600 mb-1">
                          <span>
                            Progress: {achievement.progress}/
                            {achievement.total_required}
                          </span>
                          <span>{achievement.points_awarded} points</span>
                        </div>
                        <div className="w-full bg-secondary-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              achievement.is_completed
                                ? "bg-success-500"
                                : "bg-primary-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                (achievement.progress /
                                  achievement.total_required) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {achievement.completed_at && (
                        <div className="text-sm text-success-600">
                          Completed on{" "}
                          {new Date(
                            achievement.completed_at
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div>
            {/* Leaderboard Filters */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-lg p-1 shadow-sm border border-secondary-200">
                {[
                  { key: "all", label: "All Time" },
                  { key: "monthly", label: "This Month" },
                  { key: "weekly", label: "This Week" },
                ].map((period) => (
                  <button
                    key={period.key}
                    onClick={() => setLeaderboardType(period.key as any)}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      leaderboardType === period.key
                        ? "bg-primary-600 text-white"
                        : "text-secondary-600 hover:text-secondary-900"
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="card">
              <div className="card-body">
                <h3 className="text-xl font-semibold text-secondary-900 mb-6 text-center flex items-center justify-center gap-2">
                  <Crown className="w-6 h-6 text-primary-600" />
                  Top Performers
                </h3>
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => {
                    const getRankIcon = (index: number) => {
                      if (index === 0)
                        return <Crown className="w-6 h-6 text-yellow-500" />;
                      if (index === 1)
                        return <Medal className="w-6 h-6 text-gray-400" />;
                      if (index === 2)
                        return <Award className="w-6 h-6 text-amber-600" />;
                      return (
                        <span className="text-lg font-bold">#{entry.rank}</span>
                      );
                    };

                    return (
                      <div
                        key={entry.user.id}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                          entry.user.id === profile.id
                            ? "bg-primary-50 border-2 border-primary-200"
                            : "bg-secondary-50"
                        }`}
                      >
                        <div className="w-8 flex items-center justify-center">
                          {getRankIcon(index)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-secondary-900">
                            {formatDisplayName(entry.user)}
                            {entry.user.id === profile.id && (
                              <span className="text-primary-600 text-sm ml-2">
                                (You)
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-secondary-600">
                            <span>Level {entry.level}</span>
                            <span>{entry.badges_count} badges</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            {entry.total_points.toLocaleString()} pts
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
