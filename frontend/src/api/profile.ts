import { api } from "./index";

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  user_type: string;
  phone_number?: string;
  date_of_birth?: string;
  profile_picture?: string;
  bio: string;
  location: string;
  university: string;
  field_of_study: string;
  graduation_year?: number;
  linkedin_profile: string;
  github_profile: string;
  portfolio_website: string;
  profile_public: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  last_active: string;
  skills: UserSkill[];
  education: UserEducation[];
  experience: UserExperience[];
}

export interface UserSkill {
  id?: number;
  name: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  verified: boolean;
  created_at?: string;
}

export interface UserEducation {
  id?: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  grade?: string;
  description?: string;
  current: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserExperience {
  id?: number;
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description?: string;
  current: boolean;
  created_at?: string;
  updated_at?: string;
}

export const profileApi = {
  // Profile
  getProfile: () => api.get<UserProfile>("/auth/profile/"),
  
  updateProfile: (data: Partial<UserProfile>) =>
    api.patch<UserProfile>("/auth/profile/", data),
  
  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append("profile_picture", file);
    return api.patch<UserProfile>("/auth/profile/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Skills
  getSkills: () => api.get<UserSkill[]>("/auth/skills/"),
  
  addSkill: (skill: Omit<UserSkill, "id" | "verified" | "created_at">) =>
    api.post<UserSkill>("/auth/skills/", skill),
  
  updateSkill: (id: number, skill: Partial<UserSkill>) =>
    api.patch<UserSkill>(`/auth/skills/${id}/`, skill),
  
  deleteSkill: (id: number) => api.delete(`/auth/skills/${id}/`),

  // Education
  getEducation: () => api.get<UserEducation[]>("/auth/education/"),
  
  addEducation: (education: Omit<UserEducation, "id" | "created_at" | "updated_at">) =>
    api.post<UserEducation>("/auth/education/", education),
  
  updateEducation: (id: number, education: Partial<UserEducation>) =>
    api.patch<UserEducation>(`/auth/education/${id}/`, education),
  
  deleteEducation: (id: number) => api.delete(`/auth/education/${id}/`),

  // Experience
  getExperience: () => api.get<UserExperience[]>("/auth/experience/"),
  
  addExperience: (experience: Omit<UserExperience, "id" | "created_at" | "updated_at">) =>
    api.post<UserExperience>("/auth/experience/", experience),
  
  updateExperience: (id: number, experience: Partial<UserExperience>) =>
    api.patch<UserExperience>(`/auth/experience/${id}/`, experience),
  
  deleteExperience: (id: number) => api.delete(`/auth/experience/${id}/`),
};
