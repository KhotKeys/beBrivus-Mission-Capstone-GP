import apiClient from './client';

export interface Mentor {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture?: string;
  };
  name: string;
  avatar: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  hourly_rate: number;
  experience_years: number;
  rating: number;
  total_sessions: number;
  availability: 'Available' | 'Busy' | 'Offline';
  response_time_hours: number;
  expertise_list: string[];
  languages_list: string[];
  education: string;
  certifications: string;
  match_score: number;
  created_at: string;
  updated_at: string;
}

export interface MentorSearchParams {
  search?: string;
  expertise?: string;
  availability?: string;
  min_rating?: number;
  max_rate?: number;
  sort?: 'match' | 'rating' | 'experience' | 'price_low' | 'price_high';
  page?: number;
  page_size?: number;
}

export interface MentorSearchResponse {
  results: Mentor[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface BookSessionData {
  session_date: string;
  start_time: string;
  duration: number;
  session_type: 'career_guidance' | 'interview_prep' | 'skill_development' | 'portfolio_review' | 'networking' | 'other';
  notes?: string;
}

export interface MentorSession {
  id: number;
  mentee: number;
  mentor: number;
  mentee_name: string;
  mentor_name: string;
  session_date: string;
  start_time: string;
  duration: number;
  session_type: string;
  status: string;
  notes: string;
  agenda?: string;
  mentor_notes?: string;
  meeting_link?: string;
  meeting_id?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  feedback?: string;
  rating?: number;
  created_at: string;
}

export const mentorsApi = {
  // Get all mentors with filters
  getMentors: async (params?: MentorSearchParams): Promise<MentorSearchResponse> => {
    try {
      const searchParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString());
          }
        });
      }
      const url = params?.search?.toString() ? `/mentors/search/?${searchParams}` : '/mentors/';
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      // If it's a 404, return empty results instead of throwing
      if (error.response?.status === 404) {
        return {
          results: [],
          total: 0,
          page: params?.page || 1,
          page_size: params?.page_size || 20,
          has_next: false,
          has_previous: false,
        };
      }
      throw error;
    }
  },

  // Get a specific mentor
  getMentor: async (id: number): Promise<Mentor | null> => {
    try {
      const response = await apiClient.get(`/mentors/${id}/`);
      return response.data;
    } catch (error: any) {
      // If mentor doesn't exist, return null instead of throwing
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Search mentors with advanced filtering
  searchMentors: async (params: MentorSearchParams): Promise<MentorSearchResponse> => {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
      
      const response = await apiClient.get(`/mentors/search/?${searchParams}`);
      return response.data;
    } catch (error: any) {
      // If it's a 404, return empty results instead of throwing
      if (error.response?.status === 404) {
        return {
          results: [],
          total: 0,
          page: params?.page || 1,
          page_size: params?.page_size || 20,
          has_next: false,
          has_previous: false,
        };
      }
      throw error;
    }
  },

  // Get mentor availability
  getMentorAvailability: async (mentorId: number): Promise<any[]> => {
    const response = await apiClient.get(`/mentors/${mentorId}/availability/`);
    return response.data;
  },

  // Book a session with a mentor
  bookSession: async (mentorId: number, sessionData: BookSessionData): Promise<MentorSession> => {
    const response = await apiClient.post(`/mentors/${mentorId}/book/`, sessionData);
    return response.data;
  },

  // Send message to mentor (placeholder for future implementation)
  sendMessage: async (mentorId: number, message: string): Promise<any> => {
    // This would be implemented when messaging system is added
    const response = await apiClient.post(`/mentors/${mentorId}/message/`, { message });
    return response.data;
  },
};

// Mentor Dashboard API
export const mentorApi = {
  // Get mentor's sessions with optional filters
  getMySessions: async (filters?: { status?: string; session_type?: string }): Promise<MentorSession[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.session_type) params.append('session_type', filters.session_type);
    
    const response = await apiClient.get(`/mentors/dashboard/my_sessions/?${params}`);
    return response.data;
  },

  // Get pending sessions (sessions that need mentor's approval)
  getPendingSessions: async (): Promise<MentorSession[]> => {
    const response = await apiClient.get('/mentors/dashboard/pending_sessions/');
    return response.data;
  },

  // Get upcoming confirmed sessions
  getUpcomingSessions: async (): Promise<MentorSession[]> => {
    const response = await apiClient.get('/mentors/dashboard/upcoming_sessions/');
    return response.data;
  },

  // Get mentor's mentees
  getMyMentees: async (): Promise<any[]> => {
    const response = await apiClient.get('/mentors/dashboard/my_mentees/');
    return response.data;
  },

  // Confirm a session request
  confirmSession: async (data: { session_id: number; mentor_notes?: string; meeting_link?: string }): Promise<MentorSession> => {
    const response = await apiClient.post('/mentors/dashboard/confirm_session/', data);
    return response.data;
  },

  // Reject a session request
  rejectSession: async (data: { session_id: number; mentor_notes?: string }): Promise<MentorSession> => {
    const response = await apiClient.post('/mentors/dashboard/reject_session/', data);
    return response.data;
  },

  // Start a session
  startSession: async (data: { session_id: number }): Promise<MentorSession> => {
    const response = await apiClient.post('/mentors/dashboard/start_session/', data);
    return response.data;
  },

  // End a session
  endSession: async (data: { session_id: number; mentor_notes?: string }): Promise<MentorSession> => {
    const response = await apiClient.post('/mentors/dashboard/end_session/', data);
    return response.data;
  },
};

export default mentorsApi;
