import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  // Original
  bug:                 { bg: '#fef2f2', color: '#ef4444' },
  feature:             { bg: '#eff6ff', color: '#3b82f6' },
  complaint:           { bg: '#fff7ed', color: '#f97316' },
  compliment:          { bg: '#f0fdf4', color: '#10b981' },
  general:             { bg: '#faf5ff', color: '#8b5cf6' },
  other:               { bg: '#f9fafb', color: '#6b7280' },
  // Institution
  student_quality:     { bg: '#eff6ff', color: '#3b82f6' },
  platform_posting:    { bg: '#fff7ed', color: '#f97316' },
  application_process: { bg: '#faf5ff', color: '#8b5cf6' },
  student_conduct:     { bg: '#fef2f2', color: '#ef4444' },
  partnership:         { bg: '#f0fdf4', color: '#10b981' },
  platform_bug:        { bg: '#fef2f2', color: '#dc2626' },
  billing_admin:       { bg: '#fffbeb', color: '#d97706' },
  // Mentor
  session_issue:       { bg: '#fef2f2', color: '#ef4444' },
  student_behaviour:   { bg: '#fff7ed', color: '#f97316' },
  payment_payout:      { bg: '#fffbeb', color: '#d97706' },
  profile_visibility:  { bg: '#faf5ff', color: '#8b5cf6' },
  feature_request:     { bg: '#eff6ff', color: '#2563eb' },
  scheduling:          { bg: '#f0f9ff', color: '#0284c7' },
  communication:       { bg: '#f0fdf4', color: '#10b981' },
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high:   '#f97316',
  medium: '#f59e0b',
  low:    '#9ca3af',
};

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  open:      { bg: '#fffbeb', color: '#f59e0b', border: '#fcd34d' },
  in_review: { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' },
  resolved:  { bg: '#f0fdf4', color: '#10b981', border: '#6ee7b7' },
  closed:    { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
};

export default function AdminFeedbackPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [editStates, setEditStates] = useState<Record<number, { status: string; priority: string; admin_note: string }>>({});

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (statusFilter)   params.append('status',   statusFilter);
    if (categoryFilter) params.append('category', categoryFilter);
    if (priorityFilter) params.append('priority', priorityFilter);
    if (search)         params.append('search',   search);
    return params.toString();
  };

  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ['admin-feedbacks', statusFilter, categoryFilter, priorityFilter, search],
    queryFn: () => adminApi.get(`/feedback/?${buildQueryParams()}`).then(r => r.data),
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery({
    queryKey: ['feedback-stats'],
    queryFn: () => adminApi.get('/feedback/stats/').then(r => r.data),
    staleTime: 15000,
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) =>
      adminApi.post(`/feedback/${id}/update_status/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
      setToastMsg('Changes saved successfully');
      setTimeout(() => setToastMsg(null), 3000);
    },
    onError: () => {
      setToastMsg('Failed to save. Please try again.');
      setTimeout(() => setToastMsg(null), 3000);
    },
  });

  const feedbacks = Array.isArray(feedbackData)
    ? feedbackData
    : feedbackData?.results || [];

  const getEditState = (fb: any) =>
    editStates[fb.id] || { status: fb.status, priority: fb.priority, admin_note: fb.admin_note || '' };

  const updateEditState = (id: number, field: string, value: string) =>
    setEditStates(prev => ({
      ...prev,
      [id]: { ...getEditState({ id, status: '', priority: '', admin_note: '' }), ...prev[id], [field]: value },
    }));

  const statCards = [
    { label: 'Total Feedback',  value: stats?.total     ?? '—', color: '#6366f1', icon: '📬' },
    { label: 'Open',            value: stats?.open      ?? '—', color: '#f59e0b', icon: '📭' },
    { label: 'In Review',       value: stats?.in_review ?? '—', color: '#3b82f6', icon: '🔍' },
    { label: 'Resolved',        value: stats?.resolved  ?? '—', color: '#10b981', icon: '✅' },
  ];

  const pieData = [
    { name: 'Submitted', value: stats?.open || 0, color: '#10b981' },
    { name: 'Under Review', value: stats?.in_review || 0, color: '#f59e0b' },
    { name: 'Approved', value: stats?.resolved || 0, color: '#10b981' },
    { name: 'Escalated', value: stats?.closed || 0, color: '#dc2626' },
  ].filter(item => item.value > 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', width: '100%', overflowX: 'hidden' }}>
      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .admin-feedback-container {
            padding: 0 12px 32px !important;
          }
          .feedback-stat-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .feedback-filters {
            flex-direction: column !important;
          }
          .feedback-filters > * {
            width: 100% !important;
            min-width: unset !important;
          }
          .feedback-card-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .feedback-card-meta {
            width: 100% !important;
            justify-content: space-between !important;
          }
        }
        @media (max-width: 480px) {
          .admin-feedback-container {
            padding: 0 8px 24px !important;
          }
          .feedback-stat-grid {
            grid-template-columns: 1fr !important;
          }
          .feedback-admin-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── HERO HEADER ─────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: '24px',
      }}>
        <img
          src="/feedback.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4))',
          backdropFilter: 'blur(2px)',
        }} />
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          padding: '0 16px',
        }}>
          <h1 style={{
            margin: '0 0 8px',
            fontSize: 'clamp(20px, 5vw, 32px)',
            fontWeight: '800',
            color: 'white',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}>
            Feedback Portal
          </h1>
          <p style={{
            margin: 0,
            fontSize: 'clamp(12px, 3vw, 14px)',
            color: 'rgba(255,255,255,0.9)',
            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
          }}>
            Manage and respond to user feedback
          </p>
        </div>
      </div>
      {/* ── END HERO HEADER ──────────────────────────────────────── */}

      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px',
          background: toastMsg.includes('Failed') ? '#ef4444' : '#10b981',
          color: 'white', padding: '12px 24px', borderRadius: '10px',
          fontWeight: '600', fontSize: '14px', zIndex: 99999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          {toastMsg}
        </div>
      )}

      <div className="admin-feedback-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 48px', width: '100%' }}>

      <div className="feedback-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px', marginBottom: '20px' }}>
        {statCards.map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{card.label}</p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: card.color }}>{card.value}</p>
              </div>
              <span style={{ fontSize: '28px' }}>{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {pieData.length > 0 && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#111827' }}>Feedback Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="feedback-filters" style={{ background: 'white', borderRadius: '12px', padding: '14px 16px', border: '1px solid #e5e7eb', marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by subject, user or email..."
          style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }}
        />
        {[
          { value: statusFilter,   onChange: setStatusFilter,   placeholder: 'All Statuses',   options: [['open','Open'],['in_review','In Review'],['resolved','Resolved'],['closed','Closed']] },
          { value: categoryFilter, onChange: setCategoryFilter, placeholder: 'All Categories', options: [['bug','Bug Report'],['feature','Feature Request'],['complaint','Complaint'],['compliment','Compliment'],['general','General Feedback'],['other','Other']] },
          { value: priorityFilter, onChange: setPriorityFilter, placeholder: 'All Priorities', options: [['low','Low'],['medium','Medium'],['high','High'],['urgent','Urgent']] },
        ].map((filter, i) => (
          <select
            key={i}
            value={filter.value}
            onChange={e => filter.onChange(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', background: 'white', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">{filter.placeholder}</option>
            {filter.options.map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        ))}
        <span style={{ fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
          {feedbacks.length} result{feedbacks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', fontSize: '15px' }}>Loading feedback...</div>
      ) : feedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📭</p>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>No feedback found</p>
          <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
        {feedbacks.map((fb: any) => {
          const isExpanded  = expandedId === fb.id;
          const catColor    = CATEGORY_COLORS[fb.category]  || { bg: '#f9fafb', color: '#6b7280' };
          const stColor     = STATUS_COLORS[fb.status]      || STATUS_COLORS.open;
          const prioColor   = PRIORITY_COLORS[fb.priority]  || '#9ca3af';
          const edit        = getEditState(fb);

          return (
            <div key={fb.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

              <div
                className="feedback-card-header"
                onClick={() => setExpandedId(isExpanded ? null : fb.id)}
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexWrap: 'wrap' }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: prioColor, flexShrink: 0 }} title={fb.priority_display} />

                <span style={{ background: catColor.bg, color: catColor.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', flexShrink: 0 }}>
                  {fb.category_display}
                </span>

                <div style={{ flex: 1, minWidth: '150px' }}>
                  <p style={{ margin: '0 0 2px', fontWeight: '700', fontSize: '14px', color: '#111827' }}>{fb.subject}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{fb.user_display} · {fb.email}</p>
                </div>

                <div className="feedback-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                  <span style={{ background: stColor.bg, color: stColor.color, border: `1px solid ${stColor.border}`, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                    {fb.status_display}
                  </span>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {new Date(fb.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ color: '#9ca3af', fontSize: '12px', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f3f4f6' }}>

                  <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '16px', margin: '16px 0', border: '1px solid #e5e7eb' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase' }}>Message</p>
                    <p style={{ margin: 0, color: '#374151', lineHeight: '1.7', fontSize: '14px' }}>{fb.message}</p>
                  </div>

                  {fb.rating && (
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>Rating:</span>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= fb.rating ? '#f59e0b' : '#d1d5db', fontSize: '16px' }}>★</span>
                      ))}
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>({fb.rating}/5)</span>
                    </div>
                  )}

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '16px' }}>
                    <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Actions</p>

                    <div className="feedback-admin-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      {[
                        { label: 'Priority', field: 'priority', value: edit.priority, options: [['low','Low'],['medium','Medium'],['high','High'],['urgent','Urgent']] },
                        { label: 'Status',   field: 'status',   value: edit.status,   options: [['open','Open'],['in_review','In Review'],['resolved','Resolved'],['closed','Closed']] },
                      ].map(sel => (
                        <div key={sel.field}>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{sel.label}</label>
                          <select
                            value={sel.value}
                            onChange={e => updateEditState(fb.id, sel.field, e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', background: 'white', outline: 'none', cursor: 'pointer' }}
                          >
                            {sel.options.map(([val, label]) => (
                              <option key={val} value={val}>{label}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Admin Response / Note</label>
                      <textarea
                        value={edit.admin_note}
                        onChange={e => updateEditState(fb.id, 'admin_note', e.target.value)}
                        placeholder="Add a response or note to the user..."
                        rows={3}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
                        onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
                        onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                      />
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                        User will be notified by email when status is set to Resolved or Closed.
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => updateMutation.mutate({
                          id: fb.id,
                          status: edit.status,
                          priority: edit.priority,
                          admin_note: edit.admin_note,
                        })}
                        disabled={updateMutation.isPending}
                        style={{
                          padding: '10px 24px', borderRadius: '8px', border: 'none',
                          background: '#6366f1', color: 'white', cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                          fontWeight: '700', fontSize: '14px',
                          opacity: updateMutation.isPending ? 0.7 : 1,
                          transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={e => { if (!updateMutation.isPending) e.currentTarget.style.opacity = '0.85'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      )}
      </div>
    </div>
  );
}
