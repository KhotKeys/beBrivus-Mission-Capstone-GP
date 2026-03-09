import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../api';
import { AdminHero } from '../../components/admin/AdminHero';

const AdminAnalyticsPage = () => {
  const [period, setPeriod] = useState('7days');
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Fetch real analytics data
  const { data: analytics, isLoading, refetch, error } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: async () => {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      console.log('TOKEN BEING SENT:', token?.substring(0, 50));
      console.log('Making request to:', `/api/admin/analytics/?period=${period}`);
      const response = await api.get(`/admin/analytics/?period=${period}`);
      return response.data;
    },
    refetchInterval: 15000, // Changed from 60000 to 15000 (15 seconds)
    staleTime: 10000,       // Changed from 30000 to 10000
    refetchOnWindowFocus: true, // ADD — refresh when admin returns to tab
  });

  // Log errors
  if (error) {
    console.error('Analytics error:', error?.response?.status, error?.response?.data);
  }

  // Get AI insights
  const getAIInsights = async () => {
    if (!analytics) return;
    setLoadingInsights(true);
    try {
      const response = await api.post('/admin/analytics/ai-insights/', {
        analytics_data: analytics
      });
      setAiInsights(response.data.insights || []);
    } catch (err) {
      console.error('AI insights failed:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Color map for insight types
  const insightColors = {
    positive: { bg: '#f0fdf4', border: '#10B981', icon: '✅' },
    warning: { bg: '#fefce8', border: '#f59e0b', icon: '⚠️' },
    neutral: { bg: '#eff6ff', border: '#3b82f6', icon: '💡' },
  };

  return (
    <div>
      <AdminHero 
        title="Analytics Dashboard" 
        subtitle={`Real-time platform data • Auto-refreshes every 60s${analytics?.generated_at ? ' • Last updated: ' + new Date(analytics.generated_at).toLocaleTimeString() : ''}`}
        variant="sharp"
      />

      <div style={{ padding: '16px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

      {/* Header with Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px', minWidth: '140px' }}
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <button
            onClick={() => refetch()}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '13px' }}
          >
            🔄 Refresh
          </button>
          <button
            onClick={getAIInsights}
            disabled={loadingInsights || !analytics}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: '#10B981', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
          >
            {loadingInsights ? '🤖 Analysing...' : '🤖 Get AI Insights'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .analytics-grid-2 { grid-template-columns: 1fr !important; }
          .analytics-controls { justify-content: center !important; }
        }
        @media (max-width: 640px) {
          .analytics-metrics { grid-template-columns: 1fr !important; }
          .analytics-controls select,
          .analytics-controls button { width: 100%; }
        }
      `}</style>

      {/* Key Metrics Row */}
      <div className="analytics-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px', justifyItems: 'center' }}>
        {[
          { label: 'Total Users', value: analytics?.total_users || 0, sub: `+${analytics?.new_users_period || 0} this period`, icon: '👥', color: '#3b82f6' },
          { label: 'Active Users', value: analytics?.active_users || 0, sub: 'logged in this period', icon: '🟢', color: '#10B981' },
          { label: 'Total Applications', value: analytics?.total_applications || 0, sub: `+${analytics?.applications_period || 0} this period`, icon: '📋', color: '#8b5cf6' },
          { label: 'Accepted', value: analytics?.application_status?.accepted || 0, sub: `${analytics?.total_applications ? Math.round((analytics.application_status.accepted / analytics.total_applications) * 100) : 0}% acceptance rate`, icon: '✅', color: '#10B981' },
          { label: 'Opportunities', value: analytics?.total_opportunities || 0, sub: `${analytics?.active_opportunities || 0} active`, icon: '🎯', color: '#f59e0b' },
          { label: 'Forum Discussions', value: analytics?.total_discussions || 0, sub: `+${analytics?.new_discussions_period || 0} this period`, icon: '💬', color: '#ec4899' },
          { label: 'Mentor Bookings', value: analytics?.total_bookings || 0, sub: `${analytics?.confirmed_bookings || 0} confirmed • ${analytics?.pending_bookings || 0} pending`, icon: '📅', color: '#06b6d4' },
          { label: 'New Signups (1h)', value: analytics?.new_users_1h || 0, sub: 'in last hour', icon: '⚡', color: '#f97316' },
          { label: 'Signups Today', value: analytics?.new_users_today || 0, sub: 'registered today', icon: '🆕', color: '#14b8a6' },
        ].map(metric => (
          <div key={metric.label} style={{ background: 'white', borderRadius: '10px', padding: '16px', border: '1px solid #e5e7eb', borderTop: `3px solid ${metric.color}`, width: '100%', maxWidth: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{metric.label}</p>
                <p style={{ margin: '4px 0', fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                  {isLoading ? '...' : metric.value.toLocaleString()}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', lineHeight: '1.4' }}>{metric.sub}</p>
              </div>
              <span style={{ fontSize: '24px', flexShrink: 0 }}>{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights Section */}
      {aiInsights.length > 0 && (
        <div style={{ background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
          <h2 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🤖 AI-Powered Insights
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {aiInsights.map((insight, i) => {
              const colors = insightColors[insight.type] || insightColors.neutral;
              return (
                <div key={i} style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontWeight: '700', marginBottom: '6px', fontSize: '15px' }}>
                    {colors.icon} {insight.title}
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#374151' }}>{insight.insight}</p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#10B981', fontWeight: '500' }}>
                    → {insight.recommendation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Application Status Distribution */}
      <div className="analytics-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '700' }}>📊 Application Status</h2>
          {analytics?.application_status && Object.entries(analytics.application_status).map(([status, count]) => {
            const total = analytics.total_applications || 1;
            const pct = Math.round((count / total) * 100);
            const colors = {
              pending: '#f59e0b',
              under_review: '#3b82f6',
              interview_scheduled: '#8b5cf6',
              accepted: '#10B981',
              rejected: '#ef4444',
            };
            return (
              <div key={status} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>
                  <span style={{ fontWeight: '700', fontSize: '13px' }}>{count} ({pct}%)</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: '4px', height: '8px' }}>
                  <div style={{ background: colors[status] || '#6b7280', width: `${pct}%`, height: '100%', borderRadius: '4px', transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversion Funnel */}
        <div style={{ background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '700' }}>🔄 Conversion Funnel</h2>
          {analytics?.conversion_funnel?.map((stage, i) => {
            const first = analytics.conversion_funnel[0]?.count || 1;
            const pct = Math.round((stage.count / first) * 100);
            return (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px' }}>{stage.stage}</span>
                  <span style={{ fontWeight: '700', fontSize: '13px' }}>{stage.count.toLocaleString()} ({pct}%)</span>
                </div>
                <div style={{ background: '#f3f4f6', borderRadius: '4px', height: '8px' }}>
                  <div style={{ background: `hsl(${160 - i * 30}, 70%, 50%)`, width: `${pct}%`, height: '100%', borderRadius: '4px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Opportunities */}
      <div style={{ background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px', overflowX: 'auto' }}>
        <h2 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '700' }}>🏆 Top Opportunities by Applications</h2>
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '8px', fontSize: '13px', color: '#6b7280' }}>Opportunity</th>
              <th style={{ textAlign: 'left', padding: '8px', fontSize: '13px', color: '#6b7280' }}>Organization</th>
              <th style={{ textAlign: 'right', padding: '8px', fontSize: '13px', color: '#6b7280' }}>Applications</th>
            </tr>
          </thead>
          <tbody>
            {analytics?.top_opportunities?.map((opp, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 8px', fontSize: '14px', fontWeight: '500' }}>{opp.opportunity__title}</td>
                <td style={{ padding: '10px 8px', fontSize: '13px', color: '#6b7280' }}>{opp.opportunity__organization}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', color: '#10B981' }}>{opp.application_count}</td>
              </tr>
            ))}
            {(!analytics?.top_opportunities || analytics.top_opportunities.length === 0) && (
              <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No applications yet</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Registration Trend */}
      <div style={{ background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #e5e7eb' }}>
        <h2 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '700' }}>📈 Daily Registration Trend (Last 7 Days)</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '120px', overflowX: 'auto' }}>
          {analytics?.registration_trend?.slice().reverse().map((day, i) => {
            const max = Math.max(...analytics.registration_trend.map(d => d.count), 1);
            const height = Math.max((day.count / max) * 100, 4);
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#374151' }}>{day.count}</span>
                <div style={{ width: '100%', height: `${height}px`, background: '#10B981', borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }} />
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
    </div>
  );
};

export { AdminAnalyticsPage as AnalyticsDashboardPage };
