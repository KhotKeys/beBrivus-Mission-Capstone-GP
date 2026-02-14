import apiClient from './client';

export interface ApplicationData {
  id: number;
  opportunity: number;
  opportunity_title: string;
  company_name: string;
  company_logo?: string;
  location: string;
  employment_type: string;
  salary_range: string;
  status: 'draft' | 'clicked' | 'under_review' | 'interview_scheduled' | 'accepted' | 'rejected' | 'withdrawn';
  submitted_at: string | null;
  interview_date?: string;
  notes: string;
  cover_letter: string;
  days_since_applied: number;
  next_action_date?: string;
  is_upcoming_action: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDetail extends ApplicationData {
  interview_dates: string[];
  status_history: Array<{
    status: string;
    date: string;
    note: string;
  }>;
  feedback?: string;
}

export interface ApplicationStats {
  stats: {
    total_applications: number;
    recent_applications: number;
    interview_rate: number;
    offer_rate: number;
  };
  status_breakdown: Record<string, number>;
  upcoming_actions: {
    interviews: number;
    follow_ups: number;
  };
  recent_activity: ApplicationData[];
}

export interface ApplicationAnalytics {
  monthly_trend: Record<string, number>;
  top_companies: Array<{
    opportunity__company: string;
    applications: number;
  }>;
  top_roles: Array<{
    opportunity__title: string;
    applications: number;
  }>;
  avg_response_time_days: number;
  total_companies_applied: number;
  success_insights: Array<{
    type: 'success' | 'improvement' | 'action';
    title: string;
    message: string;
    suggestion: string;
  }>;
}

export interface CreateApplicationData {
  opportunity: number;
  status?: string;
  priority?: 'high' | 'medium' | 'low';
  applied_date?: string;
  interview_date?: string;
  notes?: string;
  cover_letter?: string;
}

export interface ApplicationSearchParams {
  search?: string;
  status?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface ApplicationSearchResponse {
  count: number;
  next?: string;
  previous?: string;
  results: ApplicationData[];
}

export const applicationsApi = {
  // Get all applications with filters
  getApplications: async (params?: ApplicationSearchParams): Promise<ApplicationSearchResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const url = searchParams.toString() ? `/applications/?${searchParams}` : '/applications/';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get a specific application
  getApplication: async (id: number): Promise<ApplicationDetail> => {
    const response = await apiClient.get(`/applications/${id}/`);
    return response.data;
  },

  // Create a new application
  createApplication: async (data: CreateApplicationData): Promise<ApplicationData> => {
    const response = await apiClient.post('/applications/', data);
    return response.data;
  },

  // Update an application
  updateApplication: async (id: number, data: Partial<ApplicationData>): Promise<ApplicationData> => {
    const response = await apiClient.patch(`/applications/${id}/`, data);
    return response.data;
  },

  // Delete an application
  deleteApplication: async (id: number): Promise<void> => {
    await apiClient.delete(`/applications/${id}/`);
  },

  // Update application status
  updateStatus: async (id: number, status: string): Promise<ApplicationData> => {
    const response = await apiClient.patch(`/applications/${id}/update_status/`, { status });
    return response.data;
  },

  // Add interview date
  addInterview: async (id: number, interviewDate: string): Promise<ApplicationData> => {
    const response = await apiClient.post(`/applications/${id}/add_interview/`, {
      interview_date: interviewDate
    });
    return response.data;
  },

  // Add or update notes
  addNotes: async (id: number, notes: string): Promise<ApplicationData> => {
    const response = await apiClient.patch(`/applications/${id}/add_notes/`, { notes });
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<ApplicationStats> => {
    const response = await apiClient.get('/applications/dashboard/');
    return response.data;
  },

  // Get analytics data
  getAnalytics: async (): Promise<ApplicationAnalytics> => {
    const response = await apiClient.get('/applications/analytics/');
    return response.data;
  },

  // Batch operations
  bulkUpdateStatus: async (applicationIds: number[], status: string): Promise<void> => {
    await apiClient.post('/applications/bulk_update/', {
      application_ids: applicationIds,
      status
    });
  },

  // Export applications
  exportApplications: async (format: 'csv' | 'pdf' = 'csv'): Promise<Blob> => {
    const response = await apiClient.get(`/applications/export/?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },
};

export default applicationsApi;
