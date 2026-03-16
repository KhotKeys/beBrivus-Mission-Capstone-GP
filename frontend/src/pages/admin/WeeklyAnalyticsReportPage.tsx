import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar, Download, TrendingUp, TrendingDown, Users, FileText,
  Globe, RefreshCw, BarChart2, AlertCircle,
} from "lucide-react";
import adminApiClient from "../../api/adminClient";

interface DailyEntry {
  date: string;
  day_short: string;
  active_users: number;
  applications: number;
}

interface CountryEntry {
  country: string;
  total_users: number;
  new_signups: number;
  applications: number;
}

interface MetricEntry {
  value: number;
  change: string;
  trend: "up" | "down";
  prev: number;
}

interface WeeklyData {
  report_period: { start: string; end: string; year: number; label: string };
  metrics: {
    active_users: MetricEntry;
    applications_submitted: MetricEntry;
    resources_viewed: MetricEntry;
    new_signups: MetricEntry;
  };
  top_countries: CountryEntry[];
  daily_breakdown: DailyEntry[];
  generated_at: string;
}

const fetchWeekly = async (): Promise<WeeklyData> => {
  const res = await adminApiClient.get("/admin/analytics/weekly/");
  return res.data;
};

const MetricCard: React.FC<{
  label: string;
  icon: React.ElementType;
  metric?: MetricEntry;
  color: string;
  isLoading: boolean;
}> = ({ label, icon: Icon, metric, color, isLoading }) => (
  <div className="wa-card wa-metric-card">
    {isLoading ? (
      <div className="wa-skeleton" style={{ height: 80 }} />
    ) : (
      <div className="wa-metric-inner">
        <div className="wa-metric-text">
          <p className="wa-metric-label">{label}</p>
          <p className="wa-metric-value">{(metric?.value ?? 0).toLocaleString()}</p>
          <div className="wa-metric-change">
            {metric?.trend === "up"
              ? <TrendingUp size={13} color="#16a34a" />
              : <TrendingDown size={13} color="#dc2626" />}
            <span style={{ color: metric?.trend === "up" ? "#16a34a" : "#dc2626", fontWeight: 600, fontSize: 12 }}>
              {metric?.change ?? "0%"}
            </span>
            <span className="wa-vs">vs last week</span>
          </div>
        </div>
        <div className="wa-icon-box" style={{ background: color }}>
          <Icon size={18} color="#fff" />
        </div>
      </div>
    )}
  </div>
);

export const WeeklyAnalyticsReportPage: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const { data, isLoading, isFetching, isError, error, refetch, dataUpdatedAt } =
    useQuery<WeeklyData>({
      queryKey: ["weekly-analytics"],
      queryFn: fetchWeekly,
      refetchInterval: 60 * 1000,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    });

  const handleExport = async () => {
    setExporting(true);
    setExportError("");
    try {
      const res = await adminApiClient.get("/admin/analytics/weekly/export/", {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      const cd = res.headers["content-disposition"] ?? "";
      const match = cd.match(/filename="?([^"]+)"?/);
      a.download = match ? match[1] : "bebrivus_weekly_report.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const lastUpdated = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : null;
  const daily = data?.daily_breakdown ?? [];
  const allVals = daily.flatMap((d) => [d.active_users, d.applications]);
  const maxVal = Math.max(...allVals, 1);

  if (isError) {
    return (
      <div className="wa-error-box">
        <AlertCircle size={24} color="#dc2626" />
        <p style={{ margin: "8px 0 0", color: "#dc2626", fontWeight: 600 }}>
          Failed to load analytics
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 12px" }}>
          {(error as any)?.message ?? "Unknown error"}
        </p>
        <button className="wa-btn-primary" onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="wa-page">

        {/* Header */}
        <div className="wa-header">
          <div className="wa-header-left">
            <h1 className="wa-title">Weekly Analytics Report</h1>
            <p className="wa-subtitle">Platform performance for the last 7 days</p>
            {isLoading
              ? <div className="wa-skeleton-inline" style={{ width: 200, marginTop: 4 }} />
              : (
                <p className="wa-period-label">
                  <Calendar size={13} style={{ marginRight: 4, verticalAlign: "middle" }} />
                  {data?.report_period?.label}
                </p>
              )}
          </div>
          <div className="wa-header-actions">
            <div className="wa-refresh-status">
              <span className="wa-dot" style={{ background: isFetching ? "#f59e0b" : "#22c55e" }} />
              <span className="wa-status-text">
                {isFetching ? "Refreshing…" : lastUpdated ? `Updated ${lastUpdated}` : "Live"}
              </span>
            </div>
            <button className="wa-btn-secondary" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={14} className={isFetching ? "wa-spin" : ""} style={{ marginRight: 6 }} />
              Refresh
            </button>
            <button className="wa-btn-primary" onClick={handleExport} disabled={exporting}>
              <Download size={14} style={{ marginRight: 6 }} />
              {exporting ? "Exporting…" : "Export Report"}
            </button>
          </div>
        </div>

        {exportError && <div className="wa-alert">{exportError}</div>}

        {/* Metric Cards */}
        <div className="wa-metrics-grid">
          <MetricCard label="Active Users"            icon={Users}      metric={data?.metrics?.active_users}           color="#6366f1" isLoading={isLoading} />
          <MetricCard label="Applications Submitted"  icon={TrendingUp} metric={data?.metrics?.applications_submitted} color="#22c55e" isLoading={isLoading} />
          <MetricCard label="Resources Viewed"        icon={FileText}   metric={data?.metrics?.resources_viewed}       color="#8b5cf6" isLoading={isLoading} />
          <MetricCard label="New Signups"             icon={Users}      metric={data?.metrics?.new_signups}            color="#f59e0b" isLoading={isLoading} />
        </div>

        {/* Daily Chart */}
        <div className="wa-card">
          <div className="wa-section-header">
            <BarChart2 size={18} color="#6366f1" />
            <h2 className="wa-section-title">Daily Breakdown</h2>
          </div>
          {isLoading ? (
            <div className="wa-skeleton" style={{ height: 140 }} />
          ) : daily.length === 0 ? (
            <p className="wa-empty-text">No daily data available</p>
          ) : (
            <>
              <div className="wa-chart-wrap">
                {daily.map((d) => (
                  <div key={d.date} className="wa-chart-col">
                    <div className="wa-bars-row">
                      <div
                        className="wa-bar"
                        style={{ height: `${Math.max((d.active_users / maxVal) * 100, 2)}%`, background: "#6366f1" }}
                        title={`Active: ${d.active_users}`}
                      />
                      <div
                        className="wa-bar"
                        style={{ height: `${Math.max((d.applications / maxVal) * 100, 2)}%`, background: "#22c55e" }}
                        title={`Apps: ${d.applications}`}
                      />
                    </div>
                    <span className="wa-day-label">{d.date}</span>
                  </div>
                ))}
              </div>
              <div className="wa-legend">
                <span className="wa-legend-item"><span className="wa-legend-dot" style={{ background: "#6366f1" }} />Active Users</span>
                <span className="wa-legend-item"><span className="wa-legend-dot" style={{ background: "#22c55e" }} />Applications</span>
              </div>
            </>
          )}
        </div>

        {/* Top Countries */}
        <div className="wa-card">
          <div className="wa-section-header">
            <Globe size={18} color="#6366f1" />
            <h2 className="wa-section-title">Top Countries</h2>
          </div>
          {isLoading ? (
            <div className="wa-skeleton" style={{ height: 120 }} />
          ) : !data?.top_countries?.length ? (
            <div className="wa-empty-state">
              <Globe size={32} color="#d1d5db" />
              <p className="wa-empty-text">No country data available for this period</p>
            </div>
          ) : (
            <div className="wa-table-wrap">
              <table className="wa-table">
                <thead>
                  <tr>
                    {["#", "Country", "Total Users", "New Signups", "Applications"].map((h) => (
                      <th key={h} className="wa-th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.top_countries.map((row, i) => (
                    <tr key={row.country} className={i % 2 !== 0 ? "wa-tr-alt" : ""}>
                      <td className="wa-td"><span className="wa-rank-badge">{i + 1}</span></td>
                      <td className="wa-td wa-td-bold">{row.country}</td>
                      <td className="wa-td">{(row.total_users ?? 0).toLocaleString()}</td>
                      <td className="wa-td">{row.new_signups.toLocaleString()}</td>
                      <td className="wa-td">{row.applications.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

const CSS = `
  .wa-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding-bottom: 32px;
    overflow-x: hidden;
  }

  /* ── Header ── */
  .wa-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    box-sizing: border-box;
  }
  .wa-header-left { flex: 1 1 200px; min-width: 0; }
  .wa-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
  .wa-subtitle { font-size: 14px; color: #6b7280; margin: 4px 0 0; }
  .wa-period-label { font-size: 13px; color: #6366f1; margin: 4px 0 0; font-weight: 500; }

  .wa-header-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .wa-refresh-status { display: flex; align-items: center; gap: 6px; }
  .wa-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .wa-status-text { font-size: 12px; color: #6b7280; white-space: nowrap; }

  /* ── Buttons ── */
  .wa-btn-primary {
    display: inline-flex; align-items: center; padding: 8px 14px;
    border-radius: 8px; background: #6366f1; color: #fff;
    border: none; cursor: pointer; font-size: 13px; font-weight: 600;
    white-space: nowrap; flex-shrink: 0;
  }
  .wa-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
  .wa-btn-secondary {
    display: inline-flex; align-items: center; padding: 8px 14px;
    border-radius: 8px; background: #fff; color: #374151;
    border: 1px solid #e5e7eb; cursor: pointer; font-size: 13px;
    white-space: nowrap; flex-shrink: 0;
  }
  .wa-btn-secondary:disabled { opacity: 0.7; cursor: not-allowed; }

  /* ── Alert ── */
  .wa-alert {
    padding: 10px 14px; border-radius: 8px; background: #fef2f2;
    color: #dc2626; font-size: 13px; border: 1px solid #fecaca;
    box-sizing: border-box; width: 100%;
  }

  /* ── Metrics Grid ── */
  .wa-metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    width: 100%;
    box-sizing: border-box;
  }

  /* ── Card ── */
  .wa-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    border: 1px solid #e5e7eb;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    overflow: hidden;
  }
  .wa-metric-card { padding: 16px; }

  /* ── Metric card internals ── */
  .wa-metric-inner {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }
  .wa-metric-text { flex: 1; min-width: 0; }
  .wa-metric-label { font-size: 13px; color: #6b7280; margin: 0; }
  .wa-metric-value { font-size: 26px; font-weight: 700; color: #111827; margin: 4px 0 0; }
  .wa-metric-change { display: flex; align-items: center; gap: 4px; margin-top: 4px; flex-wrap: wrap; }
  .wa-vs { font-size: 11px; color: #9ca3af; }
  .wa-icon-box {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* ── Skeleton ── */
  .wa-skeleton {
    background: #f3f4f6; border-radius: 8px;
    animation: wa-pulse 1.5s ease-in-out infinite;
  }
  .wa-skeleton-inline {
    background: #f3f4f6; border-radius: 4px; height: 14px; display: inline-block;
    animation: wa-pulse 1.5s ease-in-out infinite;
  }
  @keyframes wa-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ── Section header ── */
  .wa-section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
  .wa-section-title { font-size: 16px; font-weight: 600; color: #111827; margin: 0; }

  /* ── Chart ── */
  .wa-chart-wrap {
    display: flex;
    align-items: flex-end;
    gap: 6px;
    height: 140px;
    padding: 0 4px;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }
  .wa-chart-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    min-width: 0;
  }
  .wa-bars-row {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    width: 100%;
  }
  .wa-bar {
    flex: 1;
    border-radius: 3px 3px 0 0;
    min-height: 2px;
    transition: height 0.3s ease;
    min-width: 0;
  }
  .wa-day-label {
    font-size: 9px;
    color: #9ca3af;
    margin-top: 4px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .wa-legend { display: flex; gap: 16px; margin-top: 12px; justify-content: center; flex-wrap: wrap; }
  .wa-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
  .wa-legend-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; flex-shrink: 0; }

  /* ── Table ── */
  .wa-table-wrap { overflow-x: auto; width: 100%; -webkit-overflow-scrolling: touch; }
  .wa-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 400px; }
  .wa-th {
    text-align: left; padding: 8px 12px; color: #6b7280;
    font-weight: 500; border-bottom: 1px solid #e5e7eb; white-space: nowrap;
  }
  .wa-td { padding: 10px 12px; color: #374151; border-bottom: 1px solid #f3f4f6; }
  .wa-td-bold { font-weight: 600; color: #111827; }
  .wa-tr-alt { background: #f9fafb; }
  .wa-rank-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; border-radius: 50%;
    background: #ede9fe; color: #6366f1; font-size: 11px; font-weight: 700;
  }

  /* ── Empty / Error ── */
  .wa-empty-state { display: flex; flex-direction: column; align-items: center; padding: 24px 0; gap: 8px; }
  .wa-empty-text { color: #9ca3af; font-size: 13px; text-align: center; margin: 0; }
  .wa-error-box {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 40px 20px; background: #fff; border-radius: 12px;
    border: 1px solid #fecaca; text-align: center; box-sizing: border-box;
  }

  /* ── Spin animation ── */
  .wa-spin { animation: wa-rotate 1s linear infinite; }
  @keyframes wa-rotate { to { transform: rotate(360deg); } }

  /* ── Responsive breakpoints ── */
  @media (max-width: 1024px) {
    .wa-metrics-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .wa-metrics-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .wa-card { padding: 14px; }
    .wa-metric-card { padding: 12px; }
    .wa-metric-value { font-size: 20px; }
    .wa-title { font-size: 18px; }
    .wa-header-actions { width: 100%; }
    .wa-btn-primary, .wa-btn-secondary { font-size: 12px; padding: 7px 10px; }
    .wa-chart-wrap { height: 110px; gap: 4px; }
    .wa-day-label { font-size: 8px; }
  }
  @media (max-width: 400px) {
    .wa-metrics-grid { grid-template-columns: 1fr; }
    .wa-metric-value { font-size: 22px; }
    .wa-icon-box { width: 34px; height: 34px; }
  }
  @media (max-width: 300px) {
    .wa-metrics-grid { grid-template-columns: 1fr; gap: 8px; }
    .wa-card { padding: 10px; }
    .wa-metric-card { padding: 10px; }
    .wa-metric-value { font-size: 18px; }
    .wa-title { font-size: 15px; }
    .wa-header-actions { flex-wrap: wrap; gap: 6px; }
    .wa-btn-primary, .wa-btn-secondary { font-size: 11px; padding: 6px 8px; }
    .wa-table { min-width: 0; font-size: 11px; }
    .wa-th, .wa-td { padding: 6px 6px; }
    .wa-chart-wrap { height: 80px; gap: 2px; }
    .wa-day-label { font-size: 7px; }
    .wa-metric-inner { flex-direction: column; gap: 6px; }
    .wa-icon-box { width: 28px; height: 28px; }
  }
`;
