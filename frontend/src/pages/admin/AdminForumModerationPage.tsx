import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, User, Calendar, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface FlaggedItem {
  id: number;
  content: string;
  author_username: string;
  violation_categories: string[];
  ai_confidence: number;
  reason: string;
  flagged_at: string;
  post_id: number;
  ai_summary?: string;
  discussion_title?: string;
}

interface AuditLogItem {
  id: number;
  action_type: string;
  admin: string;
  content_preview: string;
  author: string;
  notes: string;
  created_at: string;
}

export const AdminForumModerationPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<FlaggedItem | null>(null);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'audit'>('pending');
  const [expandedPending, setExpandedPending] = useState<number | null>(null);
  const [expandedAudit, setExpandedAudit] = useState<number | null>(null);
  const [showMorePending, setShowMorePending] = useState(5);
  const [showMoreAudit, setShowMoreAudit] = useState(5);
  const [searchPending, setSearchPending] = useState('');
  const [searchAudit, setSearchAudit] = useState('');
  const [filterPending, setFilterPending] = useState('all');
  const [filterAudit, setFilterAudit] = useState('all');
  const queryClient = useQueryClient();

  const { data: flaggedItems, isLoading } = useQuery<FlaggedItem[]>({
    queryKey: ['moderation-flagged'],
    queryFn: () => adminApi.get('/forum/moderation/').then(res => res.data),
    refetchInterval: 30000, // Refresh every 30s
  });

  const { data: auditLog } = useQuery<AuditLogItem[]>({
    queryKey: ['moderation-audit'],
    queryFn: () => adminApi.get('/forum/moderation/audit_log/').then(res => res.data),
    enabled: activeTab === 'audit',
    refetchInterval: 30000,
  });

  // Sort and filter pending items
  const filteredPendingItems = useMemo(() => {
    if (!flaggedItems) return [];
    let items = [...flaggedItems].sort((a, b) => new Date(b.flagged_at).getTime() - new Date(a.flagged_at).getTime());
    if (searchPending) {
      items = items.filter(item => 
        item.author_username.toLowerCase().includes(searchPending.toLowerCase()) ||
        item.content.toLowerCase().includes(searchPending.toLowerCase())
      );
    }
    return items;
  }, [flaggedItems, searchPending]);

  // Sort and filter audit log
  const filteredAuditLog = useMemo(() => {
    if (!auditLog) return [];
    let items = [...auditLog].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (searchAudit) {
      items = items.filter(item => 
        item.author.toLowerCase().includes(searchAudit.toLowerCase()) ||
        item.content_preview.toLowerCase().includes(searchAudit.toLowerCase())
      );
    }
    if (filterAudit !== 'all') {
      items = items.filter(item => item.action_type === filterAudit);
    }
    return items;
  }, [auditLog, searchAudit, filterAudit]);

  const actionMutation = useMutation({
    mutationFn: ({ id, action_type, notes }: { id: number; action_type: string; notes: string }) =>
      adminApi.post(`/forum/moderation/${id}/action/`, { action_type, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-flagged'] });
      queryClient.invalidateQueries({ queryKey: ['moderation-audit'] });
      setSelectedItem(null);
      setNotes('');
      alert('Action completed successfully!');
    },
    onError: (error: any) => {
      console.error('Action failed:', error);
      alert(`Action failed: ${error.response?.data?.error || error.message}`);
    },
  });

  const handleAction = (action: string) => {
    if (!selectedItem) return;
    if (!window.confirm(`Confirm ${action} action?`)) return;
    actionMutation.mutate({ id: selectedItem.id, action_type: action, notes });
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="absolute left-0 right-0 w-screen" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
        <div className="relative w-full h-[150px] md:h-[180px] lg:h-[220px]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url(/moderation-forum.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              backdropFilter: 'blur(2px)',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
            }}
          >
            <div className="text-center text-white px-4">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">AI Moderation Center</h1>
              <p className="text-sm md:text-base lg:text-lg">AI listens and flags — all actions require human approval</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-[150px] md:pt-[180px] lg:pt-[220px]">
      <div className="space-y-6 px-2 sm:px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">AI Moderation Center</h1>
          <p className="text-xs sm:text-sm text-gray-600">AI listens and flags only • All actions require human approval</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span className="text-gray-600 truncate">Alerts: ethxkeys@gmail.com</span>
        </div>
      </div>

      <div className="flex gap-2 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 sm:px-4 py-2 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === 'pending' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
        >
          Pending Review <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-semibold">{filteredPendingItems.length}</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 sm:px-4 py-2 font-medium whitespace-nowrap text-sm sm:text-base ${activeTab === 'audit' ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-600'}`}
        >
          Audit Log <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{filteredAuditLog.length}</span>
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by author or content..."
                value={searchPending}
                onChange={(e) => setSearchPending(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="pending-review-list" style={{ maxHeight: '400px', overflowY: 'auto', scrollBehavior: 'smooth' }}>
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : filteredPendingItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">No flagged content pending review</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPendingItems.slice(0, showMorePending).map(item => (
                  <div key={item.id} className="bg-white rounded-lg border p-3 sm:p-4 hover:shadow-md transition cursor-pointer" onClick={() => setExpandedPending(expandedPending === item.id ? null : item.id)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                        <span className="font-semibold text-sm sm:text-base text-gray-900">AI Flagged Content</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          {(item.ai_confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      {expandedPending === item.id ? <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded mb-3">
                      <p className="text-xs sm:text-sm text-gray-800 break-words">{expandedPending === item.id ? item.content : `${item.content.substring(0, 50)}...`}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{item.author_username}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" /> {new Date(item.flagged_at).toLocaleString()}
                      </span>
                      <span className="flex gap-1 flex-wrap">
                        {item.violation_categories.map(cat => (
                          <span key={cat} className="bg-red-100 text-red-800 px-2 py-0.5 rounded">{cat}</span>
                        ))}
                      </span>
                    </div>
                    {expandedPending === item.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        {item.ai_summary && (
                          <div>
                            <label className="text-xs font-medium text-gray-700">AI Summary</label>
                            <div className="mt-1 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded p-2">
                              <p className="text-xs text-primary-800 break-words">{item.ai_summary}</p>
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-medium text-gray-700">AI Reason</label>
                          <p className="mt-1 text-xs text-gray-600 break-words">{item.reason}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }} className="px-2 sm:px-3 py-1.5 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700">Warn</button>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }} className="px-2 sm:px-3 py-1.5 bg-orange-600 text-white text-xs rounded hover:bg-orange-700">Remove</button>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }} className="px-2 sm:px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700">Suspend</button>
                          <button onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }} className="px-2 sm:px-3 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">Dismiss</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {filteredPendingItems.length > showMorePending && (
            <button onClick={() => setShowMorePending(prev => prev + 5)} className="w-full py-2 border rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50">
              Show More
            </button>
          )}
          {showMorePending > 5 && filteredPendingItems.length <= showMorePending && (
            <button onClick={() => setShowMorePending(5)} className="w-full py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              Show Less
            </button>
          )}
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by author or content..."
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <select value={filterAudit} onChange={(e) => setFilterAudit(e.target.value)} className="px-4 py-2 border rounded-lg text-sm w-full sm:w-auto">
              <option value="all">All Actions</option>
              <option value="warn">Warn</option>
              <option value="remove">Remove</option>
              <option value="suspend">Suspend</option>
              <option value="dismiss">Dismiss</option>
            </select>
          </div>
          <div className="audit-log-list" style={{ maxHeight: '400px', overflowY: 'auto', scrollBehavior: 'smooth' }}>
            {filteredAuditLog.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-600">No audit log entries</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredAuditLog.slice(0, showMoreAudit).map(log => (
                  <div key={log.id} className="bg-white rounded-lg border p-3 sm:p-4 hover:shadow-md transition cursor-pointer" onClick={() => setExpandedAudit(expandedAudit === log.id ? null : log.id)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.action_type === 'dismiss' ? 'bg-gray-100 text-gray-800' :
                          log.action_type === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                          log.action_type === 'remove' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {log.action_type.toUpperCase()}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{log.admin}</span>
                      </div>
                      {expandedAudit === log.id ? <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />}
                    </div>
                    <div className="bg-gray-50 p-2 sm:p-3 rounded mb-3">
                      <p className="text-xs sm:text-sm text-gray-800 break-words">{expandedAudit === log.id ? log.content_preview : `${log.content_preview.substring(0, 50)}...`}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 flex-shrink-0" /> <span className="truncate">Author: {log.author}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" /> {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    {expandedAudit === log.id && log.notes && (
                      <div className="mt-4 pt-4 border-t">
                        <label className="text-xs font-medium text-gray-700">Admin Notes</label>
                        <p className="mt-1 text-xs text-gray-600 break-words">{log.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {filteredAuditLog.length > showMoreAudit && (
            <button onClick={() => setShowMoreAudit(prev => prev + 5)} className="w-full py-2 border rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50">
              Show More
            </button>
          )}
          {showMoreAudit > 5 && filteredAuditLog.length <= showMoreAudit && (
            <button onClick={() => setShowMoreAudit(5)} className="w-full py-2 border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              Show Less
            </button>
          )}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-bold">Review Flagged Content</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              {selectedItem.discussion_title && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">Discussion Title</label>
                  <div className="mt-1 text-sm sm:text-base font-semibold text-gray-900 break-words">{selectedItem.discussion_title}</div>
                </div>
              )}
              {selectedItem.ai_summary && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700">AI Summary</label>
                  <div className="mt-1 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-3">
                    <p className="text-xs sm:text-sm text-primary-800 leading-relaxed break-words">{selectedItem.ai_summary}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">Flagged Content</label>
                <div className="mt-1 bg-gray-50 p-3 rounded border text-xs sm:text-sm break-words">{selectedItem.content}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-600">Author:</span>
                  <span className="ml-2 font-medium break-words">{selectedItem.author_username}</span>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <span className="ml-2 font-medium">{(selectedItem.ai_confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">Violation Categories</label>
                <div className="mt-1 flex gap-2 flex-wrap">
                  {selectedItem.violation_categories.map(cat => (
                    <span key={cat} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">{cat}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">AI Reason</label>
                <p className="mt-1 text-xs sm:text-sm text-gray-600 break-words">{selectedItem.reason}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700">Admin Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full border rounded p-2 text-xs sm:text-sm"
                  rows={3}
                  placeholder="Add notes about your decision..."
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-4">
                <button
                  onClick={() => handleAction('warn')}
                  className="px-3 sm:px-4 py-2 bg-yellow-600 text-white text-xs sm:text-sm rounded hover:bg-yellow-700"
                >
                  Warn User
                </button>
                <button
                  onClick={() => handleAction('remove')}
                  className="px-3 sm:px-4 py-2 bg-orange-600 text-white text-xs sm:text-sm rounded hover:bg-orange-700"
                >
                  Remove Content
                </button>
                <button
                  onClick={() => handleAction('suspend')}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white text-xs sm:text-sm rounded hover:bg-red-700"
                >
                  Suspend Account
                </button>
                <button
                  onClick={() => handleAction('dismiss')}
                  className="px-3 sm:px-4 py-2 bg-gray-600 text-white text-xs sm:text-sm rounded hover:bg-gray-700"
                >
                  Dismiss (False Positive)
                </button>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full mt-2 px-4 py-2 border rounded hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      </div>
    </div>
  );
};

export default AdminForumModerationPage;
