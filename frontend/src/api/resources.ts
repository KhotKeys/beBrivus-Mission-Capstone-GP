import apiClient from './client';

export interface Resource {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  resource_type: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  difficulty_level: string;
  external_url?: string;
  file?: string;
  thumbnail?: string;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  is_featured: boolean;
  is_premium: boolean;
  is_published: boolean;
  view_count: number;
  download_count: number;
  like_count: number;
  estimated_duration_minutes?: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  tags: string[];
  average_rating: number;
  rating_count: number;
  is_bookmarked: boolean;
  user_rating?: number;
  user_progress?: {
    status: string;
    progress_percentage: number;
    time_spent_minutes: number;
    last_accessed: string;
    completed_at?: string;
    notes: string;
  };
  comments_preview: any[];
  workshop?: any;
}

export interface ResourceCategory {
  id: number;
  name: string;
  description: string;
  slug: string;
  parent?: number;
  icon: string;
  is_active: boolean;
  display_order: number;
  subcategories: ResourceCategory[];
  resource_count: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceBookmark {
  id: number;
  resource: Resource;
  created_at: string;
}

export interface ResourceRating {
  id: number;
  user: any;
  rating: number;
  review: string;
  created_at: string;
  updated_at: string;
}

export interface Workshop {
  resource: Resource;
  instructor_name: string;
  instructor_bio: string;
  instructor_photo?: string;
  start_date?: string;
  end_date?: string;
  is_recurring: boolean;
  max_participants?: number;
  current_participants: number;
  is_full: boolean;
  meeting_link?: string;
  materials_link?: string;
  prerequisites: string;
  user_registered: boolean;
  created_at: string;
  updated_at: string;
}

export const resourcesApi = {
  // Categories
  getCategories: () =>
    apiClient.get<ResourceCategory[]>('/resources/categories/'),
  
  getCategoryDetail: (slug: string) =>
    apiClient.get<ResourceCategory>(`/resources/categories/${slug}/`),

  // Resources
  getResources: (params?: any) =>
    apiClient.get<{ results: Resource[]; count: number; next?: string; previous?: string }>('/resources/', { params }),
  
  getResource: (slug: string) =>
    apiClient.get<Resource>(`/resources/${slug}/`),
  
  getFeaturedResources: () =>
    apiClient.get<Resource[]>('/resources/featured/'),
  
  getPopularResources: () =>
    apiClient.get<Resource[]>('/resources/popular/'),
  
  getRecentResources: () =>
    apiClient.get<Resource[]>('/resources/recent/'),
  
  createResource: (data: any) =>
    apiClient.post<Resource>('/resources/create/', data),
  
  updateResource: (slug: string, data: any) =>
    apiClient.put<Resource>(`/resources/${slug}/edit/`, data),
  
  deleteResource: (slug: string) =>
    apiClient.delete(`/resources/${slug}/delete/`),

  // Resource interactions
  rateResource: (resourceId: number, rating: number, review?: string) =>
    apiClient.post(`/resources/${resourceId}/rate/`, { rating, review }),
  
  deleteRating: (resourceId: number) =>
    apiClient.delete(`/resources/${resourceId}/rate/`),
  
  bookmarkResource: (resourceId: number) =>
    apiClient.post(`/resources/${resourceId}/bookmark/`),
  
  removeBookmark: (resourceId: number) =>
    apiClient.delete(`/resources/${resourceId}/bookmark/`),
  
  updateProgress: (resourceId: number, data: any) =>
    apiClient.post(`/resources/${resourceId}/progress/`, data),
  
  downloadResource: (resourceId: number) =>
    apiClient.post(`/resources/${resourceId}/download/`),

  // User resources
  getUserBookmarks: () =>
    apiClient.get<ResourceBookmark[]>('/resources/user/bookmarks/'),

  // Workshops
  getWorkshops: () =>
    apiClient.get<Workshop[]>('/resources/workshops/'),
  
  getWorkshop: (slug: string) =>
    apiClient.get<Workshop>(`/resources/workshops/${slug}/`),
  
  registerForWorkshop: (workshopId: number) =>
    apiClient.post(`/resources/workshops/${workshopId}/register/`),
  
  cancelWorkshopRegistration: (workshopId: number) =>
    apiClient.delete(`/resources/workshops/${workshopId}/register/`),

  // Stats
  getResourceStats: () =>
    apiClient.get('/resources/stats/'),
};
