import React, { useState, useEffect } from "react";
import {
  Users,
  Target,
  FileText,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
  Plus,
  Eye,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardBody } from "../../components/ui";
import { adminApi } from "../../services/adminApi";
import type { DashboardStats, RecentActivity } from "../../services/adminApi";

export const AdminDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, activityData] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getRecentActivity(),
        ]);
        setDashboardStats(statsData);
        setRecentActivity(activityData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  // Build stats array from API data
  const stats = dashboardStats
    ? [
        {
          title: "Total Users",
          value: dashboardStats.users.total.toLocaleString(),
          change: `+${dashboardStats.users.new_30d}`,
          changeType: "increase" as const,
          icon: Users,
          color: "primary" as const,
        },
        {
          title: "Active Opportunities",
          value: dashboardStats.opportunities.active.toLocaleString(),
          change: `+${dashboardStats.opportunities.new_30d}`,
          changeType: "increase" as const,
          icon: Target,
          color: "success" as const,
        },
        {
          title: "Resources",
          value: dashboardStats.resources.total.toLocaleString(),
          change: `+${dashboardStats.resources.new_30d}`,
          changeType: "increase" as const,
          icon: FileText,
          color: "warning" as const,
        },
        {
          title: "Applications",
          value: dashboardStats.applications.total.toLocaleString(),
          change: `+${dashboardStats.applications.new_30d}`,
          changeType: "increase" as const,
          icon: TrendingUp,
          color: "secondary" as const,
        },
      ]
    : [];

  const mockActivity = [
    {
      type: "user",
      message: "New user registered: Sarah Chen",
      time: "2 minutes ago",
      icon: Users,
    },
    {
      type: "opportunity",
      message: "Rhodes Scholarship 2025 application opened",
      time: "15 minutes ago",
      icon: Target,
    },
    {
      type: "resource",
      message: "Personal Statement Guide updated",
      time: "1 hour ago",
      icon: FileText,
    },
    {
      type: "application",
      message: "5 new applications submitted",
      time: "2 hours ago",
      icon: Calendar,
    },
  ];

  const quickActions = [
    {
      title: "Add Opportunity",
      description: "Create a new scholarship or fellowship",
      icon: Target,
      href: "/admin/opportunities/new",
      color: "primary",
    },
    {
      title: "Add Resource",
      description: "Upload guides, templates, or tutorials",
      icon: FileText,
      href: "/admin/resources/upload",
      color: "success",
    },
    {
      title: "Manage Users",
      description: "View and moderate user accounts",
      icon: Users,
      href: "/admin/users",
      color: "warning",
    },
    {
      title: "View Analytics",
      description: "Check platform performance metrics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "secondary",
    },
  ];

  const alerts = [
    {
      type: "warning",
      message: "5 opportunities expiring in the next 7 days",
      action: "Review expiring opportunities",
      href: "/admin/opportunities?filter=expiring",
    },
    {
      type: "info",
      message: "Weekly analytics report is ready",
      action: "View report",
      href: "/admin/analytics/weekly",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(2,6,23,0.75) 0%, rgba(2,6,23,0.55) 45%, rgba(2,6,23,0.8) 100%), url('/security.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-primary-100 text-lg">
              Here's what's happening with your platform today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center">
              <Award className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border ${
                alert.type === "warning"
                  ? "bg-warning-50 border-warning-200"
                  : "bg-primary-50 border-primary-200"
              }`}
            >
              <div className="flex items-center">
                <AlertCircle
                  className={`w-5 h-5 mr-3 ${
                    alert.type === "warning"
                      ? "text-warning-600"
                      : "text-primary-600"
                  }`}
                />
                <span
                  className={`font-medium ${
                    alert.type === "warning"
                      ? "text-warning-800"
                      : "text-primary-800"
                  }`}
                >
                  {alert.message}
                </span>
              </div>
              <Link
                to={alert.href}
                className={`text-sm font-medium hover:underline self-start sm:self-auto ${
                  alert.type === "warning"
                    ? "text-warning-700"
                    : "text-primary-700"
                }`}
              >
                {alert.action}
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-neutral-900 mb-2">
                      {stat.value}
                    </p>
                    <div className="flex items-center">
                      <ArrowUpRight
                        className={`w-4 h-4 mr-1 ${
                          stat.changeType === "increase"
                            ? "text-success-600"
                            : "text-error-600"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          stat.changeType === "increase"
                            ? "text-success-600"
                            : "text-error-600"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-neutral-500 text-sm ml-1">
                        vs last month
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      stat.color === "primary"
                        ? "bg-primary-100 text-primary-600"
                        : stat.color === "success"
                        ? "bg-success-100 text-success-600"
                        : stat.color === "warning"
                        ? "bg-warning-100 text-warning-600"
                        : "bg-secondary-100 text-secondary-600"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.href}>
                  <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group">
                    <CardBody className="p-6">
                      <div className="flex items-start">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                            action.color === "primary"
                              ? "bg-primary-100 text-primary-600 group-hover:bg-primary-200"
                              : action.color === "success"
                              ? "bg-success-100 text-success-600 group-hover:bg-success-200"
                              : action.color === "warning"
                              ? "bg-warning-100 text-warning-600 group-hover:bg-warning-200"
                              : "bg-secondary-100 text-secondary-600 group-hover:bg-secondary-200"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {action.description}
                          </p>
                        </div>
                        <Plus className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Recent Activity
          </h2>
          <Card>
            <CardBody className="p-0">
              <div className="space-y-0">
                {recentActivity?.activities?.map((activity, index) => {
                  // Map icon names to components
                  const getIcon = (iconName: string) => {
                    switch (iconName) {
                      case "user-plus":
                        return Users;
                      case "file-text":
                        return FileText;
                      case "briefcase":
                        return Target;
                      default:
                        return Calendar;
                    }
                  };
                  const Icon = getIcon(activity.icon);

                  return (
                    <div
                      key={index}
                      className="flex items-start p-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900 mb-1">
                          {activity.message}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-neutral-50 border-t border-neutral-100">
                <Link
                  to="/admin/activity"
                  className="flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View all activity
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
