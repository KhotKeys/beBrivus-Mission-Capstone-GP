import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { Layout } from '../components/layout';

const CATEGORY_OPTIONS = [
  { value: 'bug',        label: 'Bug Report' },
  { value: 'feature',    label: 'Feature Request' },
  { value: 'complaint',  label: 'Complaint' },
  { value: 'compliment', label: 'Compliment' },
  { value: 'general',    label: 'General Feedback' },
  { value: 'other',      label: 'Other' },
];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  bug:        { bg: '#fef2f2', color: '#ef4444' },
  feature:    { bg: '#eff6ff', color: '#3b82f6' },
  complaint:  { bg: '#fff7ed', color: '#f97316' },
  compliment: { bg: '#e6f2f3', color: '#125B66' },
  general:    { bg: '#faf5ff', color: '#8b5cf6' },
  other:      { bg: '#f9fafb', color: '#6b7280' },
};

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  open:      { bg: '#fffbeb', color: '#f59e0b', border: '#fcd34d' },
  in_review: { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' },
  resolved:  { bg: '#e6f2f3', color: '#125B66', border: '#66b1b7' },
  closed:    { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
};

function StarRating({ value, onChange, readonly = false }: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={() => !readonly && onChange?.(star === value ? 0 : star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize: readonly ? '14px' : '24px',
            cursor: readonly ? 'default' : 'pointer',
            color: star <= (hovered || value) ? '#f59e0b' : '#d1d5db',
            transition: 'color 0.1s',
            userSelect: 'none',
          }}
        >★</span>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const { data: myFeedbacks, isLoading: historyLoading } = useQuery({
    queryKey: ['my-feedbacks'],
    queryFn: () => api.get('/feedback/my_feedbacks/').then(r => r.data),
    staleTime: 30000,
  });

  const submitMutation = useMutation({
    mutationFn: (data: any) => api.post('/feedback/', data),
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || 'Failed to submit feedback. Please try again.');
    },
  });

  const handleSubmit = () => {
    if (!subject.trim()) { alert('Please enter a subject.'); return; }
    if (message.trim().length < 20) { alert('Message must be at least 20 characters.'); return; }
    submitMutation.mutate({
      category,
      subject: subject.trim(),
      message: message.trim(),
      rating: rating || null,
    });
  };

  const resetForm = () => {
    setSubmitted(false);
    setRating(0);
    setCategory('general');
    setSubject('');
    setMessage('');
  };

  const feedbacks = Array.isArray(myFeedbacks) ? myFeedbacks : [];

  return (
    <Layout>
      <div style={{ minHeight: '100vh', background: '#f9fafb', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
        <style>{`
          /* Feedback page responsive layout */
          * { box-sizing: border-box; }

          .feedback-grid {
            display: grid;
            grid-template-columns: 3fr 2fr;
            gap: 24px;
            width: 100%;
          }

          .feedback-left-col,
          .feedback-right-col {
            min-width: 0;
            width: 100%;
          }

          /* Hero responsive */
          @media (max-width: 768px) {
            .feedback-hero-left-blur,
            .feedback-hero-right-blur {
              width: 10% !important;
            }
            .feedback-hero-text {
              padding: 36px 16px !important;
            }
            .feedback-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            .feedback-right-col {
              position: static !important;
            }
          }

          @media (max-width: 480px) {
            .feedback-hero-left-blur,
            .feedback-hero-right-blur {
              width: 6% !important;
            }
            .feedback-left-col > div,
            .feedback-right-col > div {
              padding: 16px !important;
              border-radius: 12px !important;
            }
            .feedback-grid {
              gap: 12px;
            }
          }

          /* Ensure all inputs never overflow */
          .feedback-left-col input,
          .feedback-left-col select,
          .feedback-left-col textarea,
          .feedback-left-col button {
            max-width: 100%;
            width: 100%;
            box-sizing: border-box;
          }

          /* History card text wrapping */
          .feedback-right-col p,
          .feedback-right-col span {
            word-break: break-word;
            overflow-wrap: break-word;
          }

          /* Scrollbar styling for history list */
          .feedback-history-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .feedback-history-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .feedback-history-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 4px;
          }
          .feedback-history-scroll::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
        `}</style>

        {/* ── HERO HEADER ─────────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          width: '100%',
          minHeight: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginBottom: '32px',
          borderRadius: '0 0 24px 24px',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)',
        }}>

          {/* Background image — fills full hero */}
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
              zIndex: 0,
            }}
          />

          {/* Hero text — centered, above image */}
          <div className="feedback-hero-text" style={{
            position: 'relative',
            zIndex: 3,
            textAlign: 'center',
            padding: '48px 24px',
            maxWidth: '600px',
          }}>
            <h1 style={{
              margin: '0 0 10px',
              fontSize: 'clamp(22px, 4vw, 36px)',
              fontWeight: '800',
              color: 'white',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              lineHeight: 1.2,
            }}>
              {t('Share Your Feedback')}
            </h1>
            <p style={{
              margin: 0,
              fontSize: 'clamp(13px, 2vw, 16px)',
              color: 'rgba(255,255,255,0.88)',
              textShadow: '0 1px 6px rgba(0,0,0,0.4)',
              lineHeight: 1.5,
            }}>
              {t('Help us improve beBrivus for everyone')}
            </p>
          </div>
        </div>
        {/* ── END HERO HEADER ──────────────────────────────────────── */}

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px 48px', boxSizing: 'border-box', width: '100%' }}>
          <div className="feedback-grid">

            <div className="feedback-left-col">
              <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', width: '100%', boxSizing: 'border-box', minWidth: 0 }}>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                  <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: '700', color: '#111827' }}>{t('Feedback Submitted!')}</h2>
                  <p style={{ color: '#6b7280', margin: '0 0 28px', fontSize: '15px', lineHeight: '1.6' }}>
                    {t('Thank you! We will review your feedback and get back to you.')}
                  </p>
                  <button
                    onClick={resetForm}
                    style={{ background: '#125B66', color: 'white', padding: '12px 28px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px', boxSizing: 'border-box' }}
                  >
                    {t('Submit Another')}
                  </button>
                </div>
              ) : (
                <div>
                  <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '700', color: '#111827' }}>{t('New Feedback')}</h2>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                      {t('How would you rate your experience?')} <span style={{ color: '#9ca3af', fontWeight: '400' }}>({t('optional')})</span>
                    </label>
                    <StarRating value={rating} onChange={setRating} />
                    {rating > 0 && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>{rating}/5 {t('stars')} — {t('click again to remove')}</p>}
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>{t('Category')}</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', background: 'white', outline: 'none', cursor: 'pointer', boxSizing: 'border-box', maxWidth: '100%' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#125B66'}
                      onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                    >
                      {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                      {t('Subject')}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder={t('Brief summary of your feedback')}
                      maxLength={200}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', outline: 'none', maxWidth: '100%' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#125B66'}
                      onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af', textAlign: 'right' }}>{subject.length}/200</p>
                  </div>

                  <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                      {t('Message')} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={t('Describe your feedback in detail... (minimum 20 characters)')}
                      rows={5}
                      style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', outline: 'none', maxWidth: '100%' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#125B66'}
                      onBlur={e => e.currentTarget.style.borderColor = '#d1d5db'}
                    />
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: message.length < 20 ? '#ef4444' : '#9ca3af' }}>
                      {message.length < 20 ? `${20 - message.length} ${t('more characters needed')}` : `${message.length} ${t('characters')}`}
                    </p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending}
                    style={{
                      width: '100%', padding: '14px',
                      background: 'linear-gradient(135deg,#125B66,#124666)',
                      color: 'white', border: 'none', borderRadius: '10px',
                      fontSize: '15px', fontWeight: '700', cursor: submitMutation.isPending ? 'not-allowed' : 'pointer',
                      opacity: submitMutation.isPending ? 0.7 : 1,
                      transition: 'opacity 0.2s',
                      boxSizing: 'border-box',
                    }}
                  >
                    {submitMutation.isPending ? `⏳ ${t('Submitting...')}` : t('Submit Feedback')}
                  </button>
                </div>
              )}
              </div>
            </div>

            <div className="feedback-right-col">
              <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', width: '100%', boxSizing: 'border-box', minWidth: 0, height: 'fit-content', position: 'sticky', top: '24px' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>{t('My Previous Feedback')}</h2>

              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>{t('Loading...')}</div>
              ) : feedbacks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📋</p>
                  <p style={{ color: '#6b7280', margin: 0 }}>{t('No feedback submitted yet')}</p>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>{t('Your submissions will appear here')}</p>
                </div>
              ) : (
                <div className="feedback-history-scroll" style={{ maxHeight: '580px', overflowY: 'auto', overflowX: 'hidden', paddingRight: '4px' }}>
                  {feedbacks.map((fb: any) => {
                    const catColor = CATEGORY_COLORS[fb.category] || CATEGORY_COLORS.other;
                    const stColor  = STATUS_COLORS[fb.status]    || STATUS_COLORS.open;
                    return (
                      <div key={fb.id} style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px', border: '1px solid #e5e7eb', width: '100%', boxSizing: 'border-box', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                          <span style={{ background: catColor.bg, color: catColor.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                            {fb.category_display}
                          </span>
                          <span style={{ background: stColor.bg, color: stColor.color, border: `1px solid ${stColor.border}`, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                            {fb.status_display}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', fontSize: '14px', color: '#111827' }}>{fb.subject}</p>
                        <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#9ca3af' }}>
                          {new Date(fb.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {fb.rating && <StarRating value={fb.rating} readonly />}
                        {fb.admin_note && ['resolved', 'closed'].includes(fb.status) && (
                          <div style={{ background: '#e6f2f3', borderLeft: '3px solid #125B66', borderRadius: '8px', padding: '10px 12px', marginTop: '10px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#15803d', textTransform: 'uppercase' }}>{t('Admin Response')}</p>
                            <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>{fb.admin_note}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
