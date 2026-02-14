// Admin API service for backend integration
import { api } from './api';

export interface DashboardStats {
  users: {
    total: number;
    new_30d: number;
    active: number;
    by_type: Array<{ user_type: string; count: number }>;
  };
  opportunities: {
    total: number;
    active: number;
    new_30d: number;
  };
  applications: {
    total: number;
    new_30d: number;
    submitted?: number;
    submitted_30d?: number;
  };
  resources: {
    total: number;
    new_30d: number;
  };
}

export interface RecentActivity {
  activities: Array<{
    type: string;
    message: string;
    timestamp: string;
    user: string;
    icon: string;
  }>;
}

export interface AnalyticsData {
  monthly_users: Array<{
    month: string;
    users: number;
  }>;
  monthly_applications: Array<{
    month: string;
    applications: number;
  }>;
}

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
  created_at: string;
  phone_number?: string;
  country?: string;
  location?: string;
  university?: string;
  field_of_study?: string;
  graduation_year?: number;
  last_active?: string;
  temporary_password?: string;
  password_generated?: boolean;
  password?: string;
}

export interface AdminOpportunity {
  id: number;
  title: string;
  organization: string;
  organization_logo?: string;
  location: string;
  remote_allowed: boolean;
  category: number;
  category_name: string;
  difficulty_level: string;
  description: string;
  requirements?: string;
  benefits?: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  application_deadline: string;
  start_date?: string;
  end_date?: string;
  external_url?: string;
  status: string;
  featured: boolean;
  is_active: boolean;
  views_count: number;
  applications_count: number;
  match_score: number;
  days_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface OpportunityCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  active: boolean;
}

class AdminApiService {
  async get(url: string, config?: any) {
    return api.get(url, config);
  }

  async post(url: string, data?: any, config?: any) {
    return api.post(url, data, config);
  }

  async patch(url: string, data?: any, config?: any) {
    return api.patch(url, data, config);
  }

  async delete(url: string, config?: any) {
    return api.delete(url, config);
  }

  // Dashboard endpoints
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard/stats/');
    return response.data;
  }

  async getRecentActivity(): Promise<RecentActivity> {
    const response = await api.get('/admin/dashboard/recent-activity/');
    return response.data;
  }

  async getAnalytics(): Promise<AnalyticsData> {
    const response = await api.get('/admin/dashboard/analytics/');
    return response.data;
  }

  // User management endpoints
  async getUsers(params?: {
    user_type?: string;
    is_active?: boolean;
    search?: string;
    page?: number;
  }): Promise<{ results: AdminUser[]; count: number; next?: string; previous?: string }> {
    const response = await api.get('/admin/users/', { params });
    return response.data;
  }

  async getUser(id: number): Promise<AdminUser> {
    const response = await api.get(`/admin/users/${id}/`);
    return response.data;
  }

  async createUser(data: Partial<AdminUser>): Promise<AdminUser> {
    const response = await api.post('/admin/users/', data);
    return response.data;
  }

  async updateUser(id: number, data: Partial<AdminUser>): Promise<AdminUser> {
    const response = await api.patch(`/admin/users/${id}/`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}/`);
  }

  async toggleUserStatus(id: number): Promise<{ message: string; is_active: boolean }> {
    const response = await api.post(`/admin/users/${id}/toggle_status/`);
    return response.data;
  }

  async bulkUserActions(action: 'activate' | 'deactivate' | 'delete', userIds: number[]): Promise<{ message: string }> {
    const response = await api.post('/admin/users/bulk-actions/', {
      action,
      user_ids: userIds
    });
    return response.data;
  }

  // Opportunity management endpoints
  async getOpportunities(params?: {
    status?: string;
    category?: string;
    search?: string;
    page?: number;
  }): Promise<{ results: AdminOpportunity[]; count: number; next?: string; previous?: string }> {
    const response = await api.get('/admin/opportunities/', { params });
    return response.data;
  }

  async getOpportunity(id: number): Promise<AdminOpportunity> {
    const response = await api.get(`/admin/opportunities/${id}/`);
    return response.data;
  }

  async createOpportunity(data: Partial<AdminOpportunity>): Promise<AdminOpportunity> {
    const response = await api.post('/admin/opportunities/', data);
    return response.data;
  }

  async updateOpportunity(id: number, data: Partial<AdminOpportunity>): Promise<AdminOpportunity> {
    const response = await api.patch(`/admin/opportunities/${id}/`, data);
    return response.data;
  }

  async deleteOpportunity(id: number): Promise<void> {
    await api.delete(`/admin/opportunities/${id}/`);
  }

  async toggleOpportunityStatus(id: number): Promise<{ message: string; is_active: boolean }> {
    const response = await api.post(`/admin/opportunities/${id}/toggle_status/`);
    return response.data;
  }

  // Category endpoints
  async getCategories(): Promise<OpportunityCategory[]> {
    const response = await api.get('/admin/categories/');
    return response.data.results || response.data;
  }

  // Resource management endpoints
  async getResources(params?: {
    resource_type?: string;
    category?: string;
    search?: string;
    page?: number;
  }): Promise<{ results: any[]; count: number; next?: string; previous?: string }> {
    const response = await api.get('/admin/resources/', { params });
    return response.data;
  }

  async getResourceCategories(): Promise<any[]> {
    const response = await api.get('/resources/categories/');
    return response.data.results || response.data;
  }

  async getResource(id: number): Promise<any> {
    const response = await api.get(`/admin/resources/${id}/`);
    return response.data;
  }

  async createResource(data: any): Promise<any> {
    const config = data instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined;
    const response = await api.post('/admin/resources/', data, config);
    return response.data;
  }

  async updateResource(id: number, data: any): Promise<any> {
    const config = data instanceof FormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined;
    const response = await api.patch(`/admin/resources/${id}/`, data, config);
    return response.data;
  }

  async deleteResource(id: number): Promise<void> {
    await api.delete(`/admin/resources/${id}/`);
  }
}

export const adminApi = new AdminApiService();
