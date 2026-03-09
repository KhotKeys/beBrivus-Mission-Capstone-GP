import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api';
import { Layout } from '../../components/layout';
import { Link } from 'react-router-dom';
import { InstitutionHero } from '../../components/institution/InstitutionHero';
import { 
  Search, Eye, CheckCircle, XCircle, 
  Clock, Calendar, Mail, FileText, MessageSquare
} from 'lucide-react';

interface Application {
  id: number;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  opportunity: {
    id: number;
    title: string;
    organization: string;
    application_type: string;
  };
  status: string;
  cover_letter: string;
  submitted_at: string;
}

export const InstitutionApplicationResponsesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [feedback, setFeedback] = useState('');

  const { data: applications, isLoading, error, isError } = useQuery<Application[]>({
    queryKey: ['institution-applications', statusFilter],
    queryFn: async () => {
      try {
        const params = statusFilter !== 'all' ? { status: statusFilter } : {};
        const res = await api.get('/applications/my_opportunities/', { params });
        console.log('Applications loaded:', res.data);
        return res.data;
      } catch (err) {
        console.error('Error loading applications:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, feedback }: { id: number; status: string; feedback?: string }) => {
      const response = await api.patch(`/applications/${id}/`, { status, feedback });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution-applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setSelectedApp(null);
      setFeedback('');
    },
    onError: (error) => {
      console.error('Institution update failed:', error);
      alert('Failed to update. Check console.');
    }
  });

  const filteredApps = applications?.filter(app =>
    (app.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.opportunity?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      clicked: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      interview_scheduled: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <InstitutionHero 
        title="Application Responses" 
        subtitle="Review and manage applications for your opportunities"
        variant="rounded"
      />
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Tabs - Hidden on hero, kept for functionality */}
          <div className="flex gap-2 border-b border-neutral-200 mb-6" style={{ visibility: 'hidden', height: 0, overflow: 'hidden' }}>
            <Link
              to="/institution/opportunities"
              className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-neutral-600 hover:text-neutral-900 hover:border-neutral-300"
            >
              Opportunities
            </Link>
            <Link
              to="/institution/applications"
              className="px-4 py-2 text-sm font-medium border-b-2 border-primary-600 text-primary-600"
            >
              Applications
            </Link>
          </div>

          {/* Header - Hidden since hero shows title */}
          <div className="mb-6" style={{ visibility: 'hidden', height: 0, overflow: 'hidden' }}>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
              Application Responses
            </h1>
            <p className="text-sm sm:text-base text-neutral-600">
              Review and manage applications for your opportunities
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="clicked">Clicked</option>
                <option value="under_review">Under Review</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-neutral-100">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-neutral-600">Loading applications...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-neutral-100">
              <XCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-2">Error loading applications</p>
              <p className="text-neutral-600 text-sm">{error instanceof Error ? error.message : 'Please try again later'}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Reload Page
              </button>
            </div>
          ) : !applications ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-neutral-100">
              <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No data available</p>
            </div>
          ) : filteredApps && filteredApps.length > 0 ? (
            <div className="grid gap-4">
              {filteredApps.map((app) => (
                <div key={app.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {app.user?.full_name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-neutral-900 mb-1">{app.user?.full_name || 'Unknown User'}</h3>
                        <p className="text-sm text-neutral-600 mb-2">
                          <span className="font-medium">{app.opportunity?.title || 'Unknown Opportunity'}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {app.user?.email || 'No email'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(app.submitted_at).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.opportunity.application_type === 'internal' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {app.opportunity.application_type === 'internal' ? 'Internal' : 'External'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <span className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-neutral-100">
              <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-600">No applications found</p>
            </div>
          )}
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{
          backgroundImage: 'url(/email.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }} />
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-10">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">{selectedApp.user?.full_name || 'Unknown User'}</h2>
                  <p className="text-neutral-600">{selectedApp.opportunity?.title || 'Unknown Opportunity'}</p>
                </div>
                <button onClick={() => setSelectedApp(null)} className="text-neutral-400 hover:text-neutral-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Applicant Info */}
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-4 border border-primary-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary-600" />
                    <span className="text-neutral-600">Email:</span>
                    <span className="font-medium text-neutral-900">{selectedApp.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" />
                    <span className="text-neutral-600">Applied:</span>
                    <span className="font-medium text-neutral-900">
                      {new Date(selectedApp.submitted_at).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* CV Section */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-neutral-900 text-lg">CV/Resume</h3>
                  </div>
                  {(selectedApp as any).cv_url ? (
                    <a
                      href={(selectedApp as any).cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      View CV
                    </a>
                  ) : (
                    <span className="text-sm text-neutral-400 italic">No CV uploaded</span>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h3 className="font-semibold text-neutral-900 text-lg">Cover Letter</h3>
                </div>
                <div className="bg-neutral-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
                    {selectedApp.cover_letter || (
                      <span className="text-neutral-400 italic">No cover letter provided</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Applicant Details - Enhanced */}
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '16px', background: 'white' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  👤 Applicant Details
                </h3>

                {/* Personal Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {(selectedApp as any).age && (
                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Age</div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{(selectedApp as any).age}</div>
                    </div>
                  )}
                  {(selectedApp as any).university && (
                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>University / Institution</div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{(selectedApp as any).university}</div>
                    </div>
                  )}
                  {(selectedApp as any).course && (
                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Course / Field of Study</div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{(selectedApp as any).course}</div>
                    </div>
                  )}
                  {(selectedApp as any).year_of_study && (
                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Year of Study</div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{(selectedApp as any).year_of_study}</div>
                    </div>
                  )}
                  {(selectedApp as any).country_of_residence && (
                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Country of Residence</div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{(selectedApp as any).country_of_residence}</div>
                    </div>
                  )}
                  {(selectedApp as any).user_phone && (
                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>Phone Number</div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{(selectedApp as any).user_phone}</div>
                    </div>
                  )}
                </div>

                {/* Why Chosen */}
                {(selectedApp as any).why_chosen && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
                      💡 Why They Chose This Opportunity
                    </div>
                    <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-wrap' }}>
                      {(selectedApp as any).why_chosen}
                    </div>
                  </div>
                )}

                {/* Career Goals */}
                {(selectedApp as any).career_goals && (
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
                      🎯 Career Goals and Aspirations
                    </div>
                    <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', lineHeight: '1.6', color: '#374151', whiteSpace: 'pre-wrap' }}>
                      {(selectedApp as any).career_goals}
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Section */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <label className="flex items-center gap-2 font-semibold text-neutral-900 text-lg mb-3">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  Feedback to Applicant
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback that will be sent to the applicant..."
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-neutral-50"
                  rows={4}
                />
                <p className="text-xs text-neutral-500 mt-2">This feedback will be visible to the applicant</p>
              </div>

              {/* Action Buttons */}
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Update Application Status</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'under_review', feedback })}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Clock className="w-4 h-4" />
                    Under Review
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'interview_scheduled', feedback })}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Interview
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'accepted', feedback })}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: selectedApp.id, status: 'rejected', feedback })}
                    disabled={updateStatusMutation.isPending}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
