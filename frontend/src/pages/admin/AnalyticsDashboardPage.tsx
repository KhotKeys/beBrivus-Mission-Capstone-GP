import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Users,
  Target,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MousePointer,
  Clock,
  Globe,
  Activity,
  Server,
} from "lucide-react";
import { Card, CardBody } from "../../components/ui";
import { adminApi } from "../../services/adminApi";

export const AnalyticsDashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState("7d");

  const {
    data: dashboardStats,
    isLoading: isStatsLoading,
    isFetching: isStatsFetching,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin-analytics-stats"],
    queryFn: () => adminApi.getDashboardStats(),
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  const {
    data: analyticsData,
    isFetching: isAnalyticsFetching,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["admin-analytics-data"],
    queryFn: () => adminApi.getAnalytics(),
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
  });

  const isRefreshing = isStatsFetching || isAnalyticsFetching;

  const handleRefresh = () => {
    void Promise.all([refetchStats(), refetchAnalytics()]);
  };

  const handleExport = () => {
    const escapeCsvValue = (value: string | number | null | undefined) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const timeRangeLabel =
      {
        "24h": "Last 24 Hours",
        "7d": "Last 7 Days",
        "30d": "Last 30 Days",
        "90d": "Last 90 Days",
        "1y": "Last Year",
      }[timeRange] || "Last 7 Days";

    const submittedTotal =
      dashboardStats?.applications.submitted ?? dashboardStats?.applications.total ?? 0;
    const submittedDelta =
      dashboardStats?.applications.submitted_30d ??
      dashboardStats?.applications.new_30d ??
      0;

    const overviewRows = [
      ["Metric", "Value", "Change", "Notes"],
      [
        "Active Users",
        dashboardStats?.users.active ?? "Not tracked",
        dashboardStats?.users.new_30d ?? "",
        "New users in last 30 days",
      ],
      [
        "Tracked Applications (Submitted)",
        submittedTotal,
        submittedDelta,
        "In-platform submissions only",
      ],
      [
        "Opportunities (Active)",
        dashboardStats?.opportunities.active ?? "Not tracked",
        dashboardStats?.opportunities.new_30d ?? "",
        "New opportunities in last 30 days",
      ],
      [
        "Resources (Total)",
        dashboardStats?.resources.total ?? "Not tracked",
        dashboardStats?.resources.new_30d ?? "",
        "New resources in last 30 days",
      ],
    ];

    const monthlyUsersRows = [
      ["Month", "Users"],
      ...(analyticsData?.monthly_users || []).map((item) => [
        item.month,
        item.users,
      ]),
    ];

    const monthlyApplicationsRows = [
      ["Month", "Applications"],
      ...(analyticsData?.monthly_applications || []).map((item) => [
        item.month,
        item.applications,
      ]),
    ];

    const sections = [
      ["Analytics Export"],
      ["Generated At", new Date().toISOString()],
      ["Time Range", timeRangeLabel],
      [],
      ["Overview Stats"],
      ...overviewRows,
      [],
      ["Monthly Users"],
      ...monthlyUsersRows,
      [],
      ["Monthly Applications"],
      ...monthlyApplicationsRows,
    ];

    const csvContent = sections
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-export-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatCount = (value?: number) => {
    if (isStatsLoading) return "Loading...";
    if (typeof value !== "number") return "Not tracked";
    return value.toLocaleString();
  };

  const formatDelta = (value?: number) => {
    if (typeof value !== "number") return undefined;
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toLocaleString()}`;
  };

  const submittedApplications =
    dashboardStats?.applications.submitted ??
    dashboardStats?.applications.total;
  const submittedDelta =
    dashboardStats?.applications.submitted_30d ??
    dashboardStats?.applications.new_30d;

  const overviewStats = useMemo(
    () => [
      {
        title: "Total Page Views",
        value: "Not tracked",
        icon: Eye,
        color: "primary",
      },
      {
        title: "Active Users",
        value: formatCount(dashboardStats?.users.active),
        change: formatDelta(dashboardStats?.users.new_30d),
        trend: (dashboardStats?.users.new_30d || 0) > 0 ? "up" : "down",
        changeLabel: "new in last 30 days",
        icon: Users,
        color: "success",
      },
      {
        title: "Tracked Applications",
        value: formatCount(submittedApplications),
        change: formatDelta(submittedDelta),
        trend: (submittedDelta || 0) > 0 ? "up" : "down",
        changeLabel: "clicked in last 30 days",
        note: "In-platform submissions only",
        icon: Target,
        color: "warning",
      },
      {
        title: "Avg. Session Duration",
        value: "Not tracked",
        icon: Clock,
        color: "secondary",
      },
    ],
    [
      dashboardStats?.users.active,
      dashboardStats?.users.new_30d,
      submittedApplications,
      submittedDelta,
      isStatsLoading,
    ]
  );

  const trafficSources = [
    { name: "Direct", value: 45, color: "bg-primary-500" },
    { name: "Organic Search", value: 30, color: "bg-success-500" },
    { name: "Social Media", value: 15, color: "bg-warning-500" },
    { name: "Referral", value: 10, color: "bg-secondary-500" },
  ];

  const topPages = [
    { path: "/opportunities", views: 45234, unique: 32156, avgTime: "5m 23s" },
    { path: "/dashboard", views: 38912, unique: 28456, avgTime: "8m 45s" },
    { path: "/mentors", views: 28456, unique: 19234, avgTime: "4m 12s" },
    { path: "/resources", views: 23145, unique: 16789, avgTime: "6m 34s" },
    { path: "/forum", views: 19823, unique: 14567, avgTime: "7m 56s" },
  ];

  const userEngagement = [
    { metric: "Bounce Rate", value: "32.4%", change: "-5.2%", trend: "down" },
    {
      metric: "Pages per Session",
      value: "4.8",
      change: "+12.3%",
      trend: "up",
    },
    {
      metric: "New vs Returning",
      value: "65/35",
      change: "+2.1%",
      trend: "up",
    },
    { metric: "Conversion Rate", value: "8.9%", change: "+15.7%", trend: "up" },
  ];

  const geographicData = [
    { country: "South Sudan", users: 680, percentage: 8.5 },
    { country: "Uganda", users: 500, percentage: 7.3 },
    { country: "Rwanda", users: 370, percentage: 6.6 },
    { country: "Kenya", users: 367, percentage: 5.7 },
    { country: "Others", users: 1090, percentage: 12.9 },
  ];

  const deviceStats = [
    { device: "Desktop", users: 234, percentage: 4.1 },
    { device: "Mobile", users: 2456, percentage: 29.1 },
    { device: "Tablet", users: 142, percentage: 2.8 },
  ];

  const funnelSteps = [
    { label: "Visits", value: 128340, rate: "100%" },
    { label: "Signups", value: 18420, rate: "14.3%" },
    { label: "Applications", value: 6230, rate: "4.9%" },
    { label: "Accepted", value: 980, rate: "0.8%" },
  ];

  const realtimeSignals = [
    { label: "Live Users", value: "312", icon: Activity },
    { label: "New Signups (1h)", value: "42", icon: Users },
    { label: "Applications (1h)", value: "18", icon: Target },
  ];

  const systemHealth = [
    { label: "API Uptime", value: "99.98%", trend: "up", change: "+0.02%" },
    { label: "Avg. Response", value: "210ms", trend: "down", change: "-18ms" },
    { label: "Error Rate", value: "0.12%", trend: "down", change: "-0.04%" },
  ];

  const statClass = {
    primary: { bg: "bg-primary-100", text: "text-primary-600" },
    success: { bg: "bg-success-100", text: "text-success-600" },
    warning: { bg: "bg-warning-100", text: "text-warning-600" },
    secondary: { bg: "bg-secondary-100", text: "text-secondary-600" },
  } as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Analytics Dashboard
          </h1>
          <p className="text-secondary-600 mt-1">
            Track platform performance and user behavior
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>

          <button
            onClick={handleRefresh}
            className="p-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`w-5 h-5 text-secondary-600 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          const color = statClass[stat.color as keyof typeof statClass];
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-secondary-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-secondary-900 mb-2">
                      {stat.value}
                    </p>
                    {stat.change && stat.trend && (
                      <div
                        className={`flex items-center text-sm ${
                          stat.trend === "up"
                            ? "text-success-600"
                            : "text-error-600"
                        }`}
                      >
                        {stat.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 mr-1" />
                        )}
                        <span className="font-medium">{stat.change}</span>
                        <span className="text-secondary-500 ml-1">
                          {stat.changeLabel || "vs last period"}
                        </span>
                      </div>
                    )}
                    {stat.note && (
                      <p className="text-xs text-secondary-500 mt-2">
                        {stat.note}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg ${color.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 ${color.text}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Realtime Signals */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">
              Realtime Signals
            </h3>
            <Activity className="w-5 h-5 text-secondary-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {realtimeSignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div
                  key={signal.label}
                  className="rounded-xl border border-secondary-200 p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm text-secondary-600">{signal.label}</p>
                    <p className="text-2xl font-bold text-secondary-900 mt-1">
                      {signal.value}
                    </p>
                  </div>
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">
                Traffic Sources
              </h3>
              <Globe className="w-5 h-5 text-secondary-400" />
            </div>

            <div className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-secondary-900">
                      {source.name}
                    </span>
                    <span className="text-sm font-semibold text-secondary-900">
                      {source.value}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary-100 rounded-full h-2">
                    <div
                      className={`${source.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${source.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* User Engagement Metrics */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">
                User Engagement
              </h3>
              <MousePointer className="w-5 h-5 text-secondary-400" />
            </div>

            <div className="space-y-4">
              {userEngagement.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-secondary-600">{item.metric}</p>
                    <p className="text-xl font-bold text-secondary-900">
                      {item.value}
                    </p>
                  </div>
                  <div
                    className={`flex items-center text-sm font-medium ${
                      item.trend === "up"
                        ? "text-success-600"
                        : "text-error-600"
                    }`}
                  >
                    {item.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {item.change}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">
              Conversion Funnel
            </h3>
            <TrendingUp className="w-5 h-5 text-secondary-400" />
          </div>
          <div className="space-y-4">
            {funnelSteps.map((step, index) => {
              const width = Math.max(8, Math.round((step.value / funnelSteps[0].value) * 100));
              return (
                <div key={step.label} className="rounded-lg border border-secondary-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-secondary-900">
                      {step.label}
                    </span>
                    <span className="text-sm text-secondary-600">
                      {step.value.toLocaleString()} ({step.rate})
                    </span>
                  </div>
                  <div className="w-full bg-secondary-100 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  {index < funnelSteps.length - 1 && (
                    <p className="text-xs text-secondary-500 mt-2">
                      Drop-off from previous step: {(
                        100 -
                        Math.round(
                          (funnelSteps[index + 1].value / step.value) * 100
                        )
                      ).toString()}%
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Top Pages Table */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">
              Top Pages
            </h3>
            <TrendingUp className="w-5 h-5 text-secondary-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-secondary-700">
                    Page Path
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-secondary-700">
                    Page Views
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-secondary-700">
                    Unique Views
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-secondary-700">
                    Avg. Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, index) => (
                  <tr
                    key={index}
                    className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-primary-600">
                        {page.path}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="text-sm text-secondary-900">
                        {page.views.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="text-sm text-secondary-900">
                        {page.unique.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="text-sm text-secondary-600">
                        {page.avgTime}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Geographic Distribution & Device Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Data */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">
                Geographic Distribution
              </h3>
              <Globe className="w-5 h-5 text-secondary-400" />
            </div>

            <div className="space-y-3">
              {geographicData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-secondary-50 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900">
                      {item.country}
                    </p>
                    <p className="text-xs text-secondary-600">
                      {item.users.toLocaleString()} users
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-secondary-100 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-secondary-900 w-12 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Device Stats */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-900">
                Device Distribution
              </h3>
              <Calendar className="w-5 h-5 text-secondary-400" />
            </div>

            <div className="space-y-6">
              {deviceStats.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-secondary-900">
                      {item.device}
                    </span>
                    <span className="text-sm font-semibold text-secondary-900">
                      {item.users.toLocaleString()} users
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-secondary-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-secondary-900 w-12">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-900 font-medium">
                Most users access from desktop devices
              </p>
              <p className="text-xs text-primary-700 mt-1">
                Consider optimizing mobile experience to increase mobile
                engagement
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">
              System Health
            </h3>
            <Server className="w-5 h-5 text-secondary-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systemHealth.map((item) => (
              <div key={item.label} className="rounded-xl border border-secondary-200 p-4">
                <p className="text-sm text-secondary-600">{item.label}</p>
                <p className="text-2xl font-bold text-secondary-900 mt-2">
                  {item.value}
                </p>
                <div
                  className={`flex items-center text-sm mt-2 ${
                    item.trend === "up"
                      ? "text-success-600"
                      : "text-error-600"
                  }`}
                >
                  {item.trend === "up" ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {item.change}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
