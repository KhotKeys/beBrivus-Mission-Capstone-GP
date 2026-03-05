import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { 
  Search, Filter, Download, Eye, CheckCircle, XCircle, 
  Clock, Calendar, Mail, FileText, MessageSquare
} from 'lucide-react';

interface Application {
  id: number;
  user_name: string;
  user_email: string;
  user_phone?: string;
  opportunity_title: string;
  opportunity_data?: {
    id: number;
    title: string;
    organization: string;
    application_type: string;
  };
  status: string;
  cover_letter: string;
  cv_url?: string;
  submitted_at: string;
}

export const AdminApplicationResponsesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [feedback, setFeedback] = useState('');
  const [visibleCount, setVisibleCount] = useState(5);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: applicationsData, isLoading, error, isError } = useQuery<Application[]>({
    queryKey: ['admin-applications', statusFilter],
    queryFn: async () => {
      try {
        const params = statusFilter !== 'all' ? { status: statusFilter } : {};
        const res = await adminApi.get('/applications/', { params });
        console.log('Admin applications API response:', res.data);
        
        // Handle different response formats
        let data = res.data;
        if (data && typeof data === 'object') {
          // If response has results array (paginated)
          if (Array.isArray(data.results)) {
            console.log('Using data.results:', data.results);
            return data.results;
          }
          // If response is plain array
          if (Array.isArray(data)) {
            console.log('Using data array:', data);
            return data;
          }
        }
        
        console.warn('Unexpected response format:', data);
        return [];
      } catch (err) {
        console.error('Error loading admin applications:', err);
        throw err;
      }
    },
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const applications = applicationsData || [];
  
  console.log('Applications state:', {
    applicationsData,
    applications,
    length: applications.length,
    isLoading,
    isError,
    statusFilter
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, feedback }: { id: number; status: string; feedback?: string }) => {
      console.log('Updating application:', { id, status, feedback });
      const response = await adminApi.patch(`/applications/${id}/`, { status, notes: feedback });
      console.log('Update response:', response.data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      setSelectedApp(null);
      setFeedback('');
    },
    onError: (error) => {
      console.error('Update failed:', error);
      alert('Failed to update. Check console.');
    }
  });

  const filteredApps = applications.filter(app =>
    (app.user_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.opportunity_title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 5);
    setIsExpanded(true);
  };

  const handleShowLess = () => {
    setVisibleCount(5);
    setIsExpanded(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      submitted: 'bg-gray-100 text-gray-800',
      clicked: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      interview_scheduled: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
          Application Responses
          <span style={{
            background: '#10B981',
            color: 'white',
            borderRadius: '12px',
            padding: '2px 10px',
            fontSize: '12px',
            marginLeft: '8px',
          }}>
            {applications.length}
          </span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-600">
          Review and manage applications for your opportunities
        </p>
      </div>

      {/* Filters */}
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
            <option value="submitted">Submitted</option>
            <option value="clicked">Clicked</option>
            <option value="under_review">Under Review</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Grid */}
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
      ) : applications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-neutral-100">
          <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600 font-medium mb-2">No applications found</p>
          <p className="text-neutral-500 text-sm">Status filter: {statusFilter}</p>
          <button 
            onClick={() => setStatusFilter('all')} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Show All Applications
          </button>
        </div>
      ) : filteredApps.length > 0 ? (
        <div style={{ maxHeight: '500px', overflowY: 'auto', scrollBehavior: 'smooth' }}>
          <div className="grid gap-4">
            {filteredApps.slice(0, visibleCount).map((app) => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                    {app.user_name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 mb-1">{app.user_name || 'Unknown User'}</h3>
                    <p className="text-sm text-neutral-600 mb-2">
                      <span className="font-medium">{app.opportunity_title || 'Unknown Opportunity'}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {app.user_email || 'No email'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(app.submitted_at).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.opportunity_data?.application_type === 'internal' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {app.opportunity_data?.application_type === 'internal' ? 'Internal' : 'External'}
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
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-neutral-100">
          <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-600">No applications found</p>
        </div>
      )}

      {/* Show More / Show Less */}
      {filteredApps.length > 5 && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          {visibleCount < filteredApps.length ? (
            <button onClick={handleShowMore}
              style={{
                color: '#10B981',
                background: 'none',
                border: '1px solid #10B981',
                borderRadius: '8px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '14px',
              }}>
              Show More ({filteredApps.length - visibleCount} remaining)
            </button>
          ) : (
            <button onClick={handleShowLess}
              style={{
                color: '#6b7280',
                background: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 20px',
                cursor: 'pointer',
                fontSize: '14px',
              }}>
              Show Less
            </button>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">{selectedApp.user_name || 'Unknown User'}</h2>
                  <p className="text-neutral-600">{selectedApp.opportunity_title || 'Unknown Opportunity'}</p>
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
                    <span className="font-medium text-neutral-900">{selectedApp.user_email}</span>
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
                  {selectedApp.user_phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-600">Phone:</span>
                      <span className="font-medium text-neutral-900">{selectedApp.user_phone}</span>
                    </div>
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

              {/* CV Section */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <h3 className="font-semibold text-neutral-900 text-lg">CV/Resume</h3>
                  </div>
                  {selectedApp.cv_url ? (
                    <a
                      href={selectedApp.cv_url}
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

              {/* Applicant Extended Details */}
              <div style={{
                border: '1px solid #e5e7eb', borderRadius: '12px',
                padding: '20px', marginBottom: '16px', background: 'white'
              }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                  👤 Applicant Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {(selectedApp as any).age && (
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase' }}>Age</span>
                      <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{(selectedApp as any).age}</p>
                    </div>
                  )}
                  {(selectedApp as any).university && (
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase' }}>University / Institution</span>
                      <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{(selectedApp as any).university}</p>
                    </div>
                  )}
                  {(selectedApp as any).course && (
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase' }}>Course / Field of Study</span>
                      <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{(selectedApp as any).course}</p>
                    </div>
                  )}
                  {(selectedApp as any).year_of_study && (
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase' }}>Year of Study</span>
                      <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{(selectedApp as any).year_of_study}</p>
                    </div>
                  )}
                  {(selectedApp as any).country_of_residence && (
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase' }}>Country of Residence</span>
                      <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{(selectedApp as any).country_of_residence}</p>
                    </div>
                  )}
                  {selectedApp.user_phone && (
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase' }}>Phone Number</span>
                      <p style={{ margin: '4px 0 0 0', fontWeight: '600' }}>{selectedApp.user_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Why Chosen */}
              {(selectedApp as any).why_chosen && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '16px', background: 'white' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
                    💡 Why They Chose This Opportunity
                  </h3>
                  <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {(selectedApp as any).why_chosen}
                  </p>
                </div>
              )}

              {/* Career Goals */}
              {(selectedApp as any).career_goals && (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '16px', background: 'white' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600' }}>
                    🎯 Career Goals and Aspirations
                  </h3>
                  <p style={{ margin: 0, color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {(selectedApp as any).career_goals}
                  </p>
                </div>
              )}

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
    </div>
  );
};
