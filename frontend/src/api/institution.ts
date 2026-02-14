import apiClient from "./client";

export interface InstitutionOpportunity {
  id: number;
  title: string;
  short_description: string;
  organization: string;
  location: string;
  remote_allowed: boolean;
  category: number;
  category_name: string;
  difficulty_level: string;
  description: string;
  requirements?: string;
  benefits?: string;
  application_process?: string;
  required_documents?: string;
  application_deadline?: string;
  start_date?: string;
  end_date?: string;
  external_url?: string;
  status: string;
  featured: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface InstitutionOpportunityPayload {
  title: string;
  short_description: string;
  description: string;
  category?: number;
  organization: string;
  location?: string;
  remote_allowed?: boolean;
  application_deadline?: string;
  currency?: string;
  salary_min?: number;
  salary_max?: number;
  requirements?: string;
  benefits?: string;
  application_process?: string;
  required_documents?: string;
  external_url?: string;
  status?: string;
  difficulty_level?: string;
}

export interface OpportunityCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  active: boolean;
}

const normalizeList = <T>(data: any): T[] => {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (Array.isArray(data?.results)) {
    return data.results as T[];
  }
  return [];
};

export const institutionApi = {
  listOpportunities: async (): Promise<InstitutionOpportunity[]> => {
    const response = await apiClient.get("/opportunities/institution/");
    return normalizeList<InstitutionOpportunity>(response.data);
  },

  createOpportunity: async (
    data: InstitutionOpportunityPayload
  ): Promise<InstitutionOpportunity> => {
    const response = await apiClient.post("/opportunities/institution/", data);
    return response.data;
  },

  updateOpportunity: async (
    id: number,
    data: Partial<InstitutionOpportunityPayload>
  ): Promise<InstitutionOpportunity> => {
    const response = await apiClient.patch(
      `/opportunities/institution/${id}/`,
      data
    );
    return response.data;
  },

  deleteOpportunity: async (id: number): Promise<void> => {
    await apiClient.delete(`/opportunities/institution/${id}/`);
  },

  getCategories: async (): Promise<OpportunityCategory[]> => {
    const response = await apiClient.get("/opportunities/categories/");
    return normalizeList<OpportunityCategory>(response.data);
  },
};

export default institutionApi;
