import apiClient from './client';

export interface Opportunity {
  external_url: any;
  category_name: string;
  remote_allowed: any;
  organization: ReactNode;
  currency: any;
  difficulty_level: ReactNode;
  created_at: string | number | Date;
  id: number;
  title: string;
  company: string;
  company_logo?: string;
  location: string;
  is_remote: boolean;
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  experience_level: string;
  description: string;
  requirements: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  required_skills_list: string[];
  benefits_list: string[];
  application_url?: string;
  posted_date: string;
  application_deadline?: string;
  match_score: number;
  days_remaining?: number;
  is_active: boolean;
  is_saved?: boolean;
  is_applied?: boolean;
}

export interface OpportunitySearchParams {
  search?: string;
  type?: string;
  location?: string;
  min_salary?: number;
  max_salary?: number;
  experience_level?: string;
  sort?: 'match' | 'date' | 'deadline' | 'salary';
  page?: number;
  page_size?: number;
}

export interface OpportunitySearchResponse {
  results: Opportunity[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ApplyData {
  cover_letter?: string;
  notes?: string;
}

export const opportunitiesApi = {
  // Get all opportunities with filters
  getOpportunities: async (params?: OpportunitySearchParams): Promise<OpportunitySearchResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const url = searchParams.toString() ? `/opportunities/search/?${searchParams}` : '/opportunities/';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get a specific opportunity
  getOpportunity: async (id: number): Promise<Opportunity> => {
    const response = await apiClient.get(`/opportunities/${id}/`);
    return response.data;
  },

  // Search opportunities with advanced filtering
  searchOpportunities: async (params: OpportunitySearchParams): Promise<OpportunitySearchResponse> => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get(`/opportunities/search/?${searchParams}`);
    return response.data;
  },

  // Apply to an opportunity
  applyToOpportunity: async (opportunityId: number, data?: ApplyData): Promise<any> => {
    const response = await apiClient.post(`/opportunities/${opportunityId}/apply/`, data || {});
    return response.data;
  },

  // Save an opportunity
  saveOpportunity: async (opportunityId: number): Promise<any> => {
    const response = await apiClient.post(`/opportunities/${opportunityId}/save/`);
    return response.data;
  },

  // Unsave an opportunity
  unsaveOpportunity: async (opportunityId: number): Promise<void> => {
    await apiClient.delete(`/opportunities/${opportunityId}/save/`);
  },

  // Get saved opportunities
  getSavedOpportunities: async (): Promise<Opportunity[]> => {
    const response = await apiClient.get('/opportunities/saved/');
    return response.data;
  },

  // Get recommended opportunities
  getRecommendations: async (): Promise<Opportunity[]> => {
    const response = await apiClient.get('/opportunities/recommendations/');
    return response.data;
  },
};

export default opportunitiesApi;
