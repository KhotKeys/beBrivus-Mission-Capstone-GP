import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Layout } from "../components/layout";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Link as LinkIcon,
  Github,
  Linkedin,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Building,
  BookOpen,
  Upload,
} from "lucide-react";
import { profileApi } from "../api/profile";
import type {
  UserProfile,
  UserSkill,
  UserEducation,
  UserExperience,
} from "../api/profile";

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { updateProfile: updateAuthProfile } = useAuth();
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingEducation, setIsEditingEducation] = useState(false);
  const [isEditingExperience, setIsEditingExperience] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.getProfile().then((res) => res.data),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => profileApi.updateProfile(data),
    onSuccess: async () => {
      const updatedProfile = await profileApi.getProfile().then((res) => res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Update AuthContext with the new profile data
      await updateAuthProfile({
        first_name: updatedProfile.first_name,
        last_name: updatedProfile.last_name,
        profile_picture: updatedProfile.profile_picture,
        user_type: updatedProfile.user_type as "institution" | "student" | "graduate" | "mentor" | "admin",
      });
      setIsEditingBasic(false);
    },
  });

  // Upload profile picture mutation
  const uploadPictureMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture(file),
    onSuccess: async () => {
      const updatedProfile = await profileApi.getProfile().then((res) => res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Update AuthContext with the full updated profile data
      await updateAuthProfile({
        first_name: updatedProfile.first_name,
        last_name: updatedProfile.last_name,
        profile_picture: updatedProfile.profile_picture,
        user_type: updatedProfile.user_type as "institution" | "student" | "graduate" | "mentor" | "admin",
      });
      setIsUploadingPicture(false);
      alert("Profile picture uploaded successfully!");
    },
    onError: () => {
      alert("Failed to upload profile picture. Please try again.");
      setIsUploadingPicture(false);
    },
  });

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setIsUploadingPicture(true);
      uploadPictureMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-secondary-600">Failed to load profile</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl">
        {/* Header */}
        <div className="card mb-4 sm:mb-6">
          <div className="card-body p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Profile Picture */}
              <div className="relative mx-auto sm:mx-0">
                {profile.profile_picture ? (
                  <div className="relative group">
                    <img
                      src={profile.profile_picture}
                      alt={profile.first_name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <label className="cursor-pointer hover:bg-black/70 p-2 rounded">
                        <Edit className="w-4 h-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          disabled={isUploadingPicture}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to remove your profile picture?")) {
                            // TODO: Implement delete profile picture
                            alert("Profile picture deletion coming soon!");
                          }
                        }}
                        className="hover:bg-black/70 p-2 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    {isUploadingPicture && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600 group-hover:hidden" />
                    <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer">
                        <Upload className="w-5 h-5 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          disabled={isUploadingPicture}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {isUploadingPicture && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900 text-center sm:text-left">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <button
                    onClick={() => setIsEditingBasic(!isEditingBasic)}
                    className="btn btn-secondary btn-sm w-full sm:w-auto"
                  >
                    {isEditingBasic ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4" />
                        {t("Edit Profile")}
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                  <span className="badge badge-primary text-xs sm:text-sm">
                    {profile.user_type}
                  </span>
                  {profile.email_verified && (
                    <span className="badge badge-success text-xs sm:text-sm">Verified</span>
                  )}
                </div>

                <div className="space-y-2 text-secondary-600 text-sm sm:text-base">
                  {profile.email && (
                    <div className="flex items-start sm:items-center gap-2 justify-center sm:justify-start">
                      <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <span className="break-all">{profile.email}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Basic Info Form */}
        {isEditingBasic && (
          <BasicInfoForm
            profile={profile}
            onSave={(data) => updateProfileMutation.mutate(data)}
            onCancel={() => setIsEditingBasic(false)}
            isSaving={updateProfileMutation.isPending}
          />
        )}

        {/* Bio */}
        {!isEditingBasic && (
          <div className="card mb-4 sm:mb-6">
            <div className="card-body p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-3 sm:mb-4">
                {t("About")}
              </h2>
              {profile.bio ? (
                <p className="text-sm sm:text-base text-secondary-700 whitespace-pre-wrap leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm sm:text-base text-secondary-500 italic">
                  No bio added yet. Click "Edit Profile" to add one.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Education & Academic Info */}
        <div className="card mb-4 sm:mb-6">
          <div className="card-body p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-secondary-900">
                {t("Education")} & Academic Info
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {profile.university && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-secondary-900 text-sm sm:text-base">
                      {profile.university}
                    </p>
                    <p className="text-xs sm:text-sm text-secondary-600">University</p>
                  </div>
                </div>
              )}
              {profile.field_of_study && (
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-secondary-900 text-sm sm:text-base">
                      {profile.field_of_study}
                    </p>
                    <p className="text-xs sm:text-sm text-secondary-600">Field of Study</p>
                  </div>
                </div>
              )}
              {profile.graduation_year && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-secondary-900 text-sm sm:text-base">
                      {profile.graduation_year}
                    </p>
                    <p className="text-xs sm:text-sm text-secondary-600">
                      Graduation Year
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Links */}
        {(profile.linkedin_profile ||
          profile.github_profile ||
          profile.portfolio_website) && (
          <div className="card mb-4 sm:mb-6">
            <div className="card-body p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-3 sm:mb-4">
                {t("Links")}
              </h2>
              <div className="space-y-3">
                {profile.linkedin_profile && (
                  <a
                    href={profile.linkedin_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary-600 hover:text-primary-700 text-sm sm:text-base break-all"
                  >
                    <Linkedin className="w-5 h-5 flex-shrink-0" />
                    <span>{t("LinkedIn Profile")}</span>
                  </a>
                )}
                {profile.github_profile && (
                  <a
                    href={profile.github_profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary-600 hover:text-primary-700 text-sm sm:text-base break-all"
                  >
                    <Github className="w-5 h-5 flex-shrink-0" />
                    <span>{t("GitHub Profile")}</span>
                  </a>
                )}
                {profile.portfolio_website && (
                  <a
                    href={profile.portfolio_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-primary-600 hover:text-primary-700 text-sm sm:text-base break-all"
                  >
                    <LinkIcon className="w-5 h-5 flex-shrink-0" />
                    <span>{t("Portfolio Website")}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Skills Section */}
        <SkillsSection
          isEditing={isEditingSkills}
          onEditToggle={() => setIsEditingSkills(!isEditingSkills)}
        />

        {/* Education Section */}
        <EducationSection
          isEditing={isEditingEducation}
          onEditToggle={() => setIsEditingEducation(!isEditingEducation)}
        />

        {/* Experience Section */}
        <ExperienceSection
          isEditing={isEditingExperience}
          onEditToggle={() => setIsEditingExperience(!isEditingExperience)}
        />

        {/* Account Management */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-l-4 border-error-500">
          <h2 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-4">
            Account Management
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-secondary-600">
              If you wish to permanently delete your account and all associated data, you can do so below.
            </p>
            <Link
              to="/delete-account"
              className="inline-flex items-center gap-2 px-4 py-2 bg-error-600 text-white font-semibold rounded-lg hover:bg-error-700 transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Basic Info Form Component
interface BasicInfoFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  profile,
  onSave,
  onCancel,
  isSaving,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    bio: profile.bio,
    location: profile.location,
    phone_number: profile.phone_number || "",
    university: profile.university,
    field_of_study: profile.field_of_study,
    graduation_year: profile.graduation_year || undefined,
    linkedin_profile: profile.linkedin_profile,
    github_profile: profile.github_profile,
    portfolio_website: profile.portfolio_website,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="card mb-4 sm:mb-6 shadow-md">
      <div className="card-body p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Edit className="w-5 h-5 text-primary-600 flex-shrink-0" />
          <h2 className="text-lg sm:text-xl font-semibold text-secondary-900">
            Edit Basic Information
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                required
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                required
                placeholder="Enter your last name"
              />
            </div>
          </div>

          {/* Bio Field */}
          <div>
            <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
              Bio / About Me
            </label>
            <textarea
              className="form-input w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
              rows={5}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about yourself, your interests, goals, and what you're passionate about..."
              maxLength={500}
            />
            <p className="text-xs text-secondary-500 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Location & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="City, Country"
              />
            </div>
            <div>
              <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="border-t border-secondary-200 pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-3 sm:mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
              Academic Information
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                    <Building className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    University
                  </label>
                  <input
                    type="text"
                    className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    value={formData.university}
                    onChange={(e) =>
                      setFormData({ ...formData, university: e.target.value })
                    }
                    placeholder="Your university name"
                  />
                </div>
                <div>
                  <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                    <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    Field of Study
                  </label>
                  <input
                    type="text"
                    className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    value={formData.field_of_study}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        field_of_study: e.target.value,
                      })
                    }
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Graduation Year
                </label>
                <input
                  type="number"
                  className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={formData.graduation_year || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      graduation_year: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    })
                  }
                  min="1950"
                  max="2050"
                  placeholder="e.g., 2024"
                />
              </div>
            </div>
          </div>

          {/* Professional Links */}
          <div className="border-t border-secondary-200 pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-3 sm:mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0" />
              Professional Links
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                  <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 text-blue-600" />
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={formData.linkedin_profile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      linkedin_profile: e.target.value,
                    })
                  }
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                  <Github className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  GitHub Profile
                </label>
                <input
                  type="url"
                  className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={formData.github_profile}
                  onChange={(e) =>
                    setFormData({ ...formData, github_profile: e.target.value })
                  }
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div>
                <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                  <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Portfolio Website
                </label>
                <input
                  type="url"
                  className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  value={formData.portfolio_website}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      portfolio_website: e.target.value,
                    })
                  }
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-secondary-200">
            <button
              type="submit"
              className="btn btn-primary w-full sm:flex-1 md:flex-initial px-4 sm:px-6 py-2.5 text-sm sm:text-base"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary w-full sm:flex-1 md:flex-initial px-4 sm:px-6 py-2.5 text-sm sm:text-base"
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Skills Section Component
interface SkillsSectionProps {
  isEditing: boolean;
  onEditToggle: () => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  isEditing,
  onEditToggle,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState({
    name: "",
    level: "beginner" as const,
  });
  const [error, setError] = useState<string>("");

  const { data: skills = [], isLoading: isLoadingSkills, isError: isSkillsError, refetch: refetchSkills } = useQuery({
    queryKey: ["skills"],
    queryFn: () => profileApi.getSkills().then((res) => res.data),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const addSkillMutation = useMutation({
    mutationFn: (skill: Omit<UserSkill, "id" | "verified" | "created_at">) =>
      profileApi.addSkill(skill),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      await refetchSkills();
      setNewSkill({ name: "", level: "beginner" });
      
      // Show message if skill was updated instead of created
      if (response.data.message) {
        setError(response.data.message);
        setTimeout(() => setError(""), 3000);
      } else {
        setError("");
      }
    },
    onError: (error: any) => {
      let errorMessage = "Failed to add skill. Please try again.";
      
      if (error.response?.data) {
        const data = error.response.data;
        // Get field-specific errors if available
        if (typeof data === 'object') {
          const fieldErrors = Object.entries(data)
            .map(([key, value]: [string, any]) => {
              const fieldName = key.replace(/_/g, ' ').toLowerCase();
              if (Array.isArray(value)) {
                return `${fieldName}: ${value.join(', ')}`;
              }
              return `${fieldName}: ${value}`;
            })
            .join('. ');
          if (fieldErrors) errorMessage = fieldErrors;
        } else {
          errorMessage = data.detail || data.message || errorMessage;
        }
      }
      setError(errorMessage);
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: number) => profileApi.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.refetchQueries({ queryKey: ["skills"] });
      setError("");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Failed to delete skill. Please try again.";
      setError(errorMessage);
    },
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.name.trim()) {
      addSkillMutation.mutate(newSkill);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: "bg-blue-100 text-blue-800",
      intermediate: "bg-[#e6f2f3] text-[#09373f]",
      advanced: "bg-orange-100 text-orange-800",
      expert: "bg-purple-100 text-purple-800",
    };
    return colors[level as keyof typeof colors] || colors.beginner;
  };

  return (
    <div className="card mb-4 sm:mb-6">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 flex items-center gap-2">
            <Award className="w-5 h-5 flex-shrink-0" />
            Skills
          </h2>
          <button onClick={onEditToggle} className="btn btn-secondary btn-sm w-full sm:w-auto">
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Done
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Manage Skills
              </>
            )}
          </button>
        </div>

        {isLoadingSkills && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {isSkillsError && !isLoadingSkills && (
          <div className="mb-3 p-3 bg-error-100 border border-error-300 rounded text-error-700 text-sm">
            Failed to load skills. Please try again.
          </div>
        )}

        {isEditing && (
          <form
            onSubmit={handleAddSkill}
            className="mb-4 p-3 sm:p-4 bg-secondary-50 rounded-lg border border-secondary-200"
          >
            {error && (
              <div className="mb-3 p-2 bg-error-100 border border-error-300 rounded text-error-700 text-sm">
                {error}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                id="skill-name"
                name="skill-name"
                type="text"
                className="form-input flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Skill name (e.g., JavaScript)"
                value={newSkill.name}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, name: e.target.value })
                }
              />
              <select
                id="skill-level"
                name="skill-level"
                className="form-input px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={newSkill.level}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, level: e.target.value as any })
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                type="submit"
                className="btn btn-primary whitespace-nowrap px-4 sm:px-5 text-sm sm:text-base"
                disabled={addSkillMutation.isPending || !newSkill.name.trim()}
              >
                {addSkillMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 ${getLevelColor(
                  skill.level
                )}`}
              >
                <span>{skill.name}</span>
                <span className="text-xs opacity-75">({skill.level})</span>
                {isEditing && (
                  <button
                    onClick={() =>
                      skill.id && deleteSkillMutation.mutate(skill.id)
                    }
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-secondary-500 italic">No skills added yet</p>
        )}
      </div>
    </div>
  );
};

// Education Section Component
interface EducationSectionProps {
  isEditing: boolean;
  onEditToggle: () => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  isEditing,
  onEditToggle,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string>("");
  const [newEducation, setNewEducation] = useState<
    Omit<UserEducation, "id" | "created_at" | "updated_at">
  >({
    institution: "",
    degree: "",
    field_of_study: "",
    start_date: "",
    end_date: "",
    grade: "",
    description: "",
    current: false,
  });

  const { data: education = [], isLoading: isLoadingEducation, isError: isEducationError, refetch: refetchEducation } = useQuery({
    queryKey: ["education"],
    queryFn: () => profileApi.getEducation().then((res) => res.data),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const addEducationMutation = useMutation({
    mutationFn: (
      data: Omit<UserEducation, "id" | "created_at" | "updated_at">
    ) => profileApi.addEducation(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["education"] });
      await refetchEducation();
      setShowAddForm(false);
      
      // Show message if education was updated instead of created
      if (response.data.message) {
        setError(response.data.message);
        setTimeout(() => setError(""), 3000);
      } else {
        setError("");
      }
      
      setNewEducation({
        institution: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
        grade: "",
        description: "",
        current: false,
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to add education. Please try again.";
      
      if (error.response?.data) {
        const data = error.response.data;
        // Get field-specific errors if available
        if (typeof data === 'object') {
          const fieldErrors = Object.entries(data)
            .map(([key, value]: [string, any]) => {
              const fieldName = key.replace(/_/g, ' ').toLowerCase();
              if (Array.isArray(value)) {
                return `${fieldName}: ${value.join(', ')}`;
              }
              return `${fieldName}: ${value}`;
            })
            .join('. ');
          if (fieldErrors) errorMessage = fieldErrors;
        } else {
          errorMessage = data.detail || data.message || errorMessage;
        }
      }
      setError(errorMessage);
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: (id: number) => profileApi.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education"] });
      queryClient.refetchQueries({ queryKey: ["education"] });
      setError("");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Failed to delete education. Please try again.";
      setError(errorMessage);
    },
  });

  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert empty strings to null for optional date fields
    const dataToSubmit = {
      ...newEducation,
      end_date: newEducation.end_date || null,
    };
    addEducationMutation.mutate(dataToSubmit as any);
  };

  return (
    <div className="card mb-4 sm:mb-6">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 flex-shrink-0" />
            Education
          </h2>
          <button onClick={onEditToggle} className="btn btn-secondary btn-sm w-full sm:w-auto">
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Done
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Manage Education
              </>
            )}
          </button>
        </div>

        {isLoadingEducation && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {isEducationError && !isLoadingEducation && (
          <div className="mb-3 p-3 bg-error-100 border border-error-300 rounded text-error-700 text-sm">
            Failed to load education. Please try again.
          </div>
        )}

        {isEditing && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary btn-sm mb-4 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        )}

        {showAddForm && (
          <form
            onSubmit={handleAddEducation}
            className="mb-6 p-3 sm:p-4 border border-secondary-200 rounded-lg"
          >
            <h3 className="font-semibold text-secondary-900 mb-3 text-sm sm:text-base">
              Add Education
            </h3>
            {error && (
              <div className="mb-3 p-2 bg-error-100 border border-error-300 rounded text-error-700 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <input
                id="education-institution"
                name="institution"
                type="text"
                className="form-input w-full text-sm sm:text-base"
                placeholder="Institution"
                value={newEducation.institution}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    institution: e.target.value,
                  })
                }
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  id="education-degree"
                  name="degree"
                  type="text"
                  className="form-input text-sm sm:text-base"
                  placeholder="Degree"
                  value={newEducation.degree}
                  onChange={(e) =>
                    setNewEducation({ ...newEducation, degree: e.target.value })
                  }
                  required
                />
                <input
                  id="education-field"
                  name="field_of_study"
                  type="text"
                  className="form-input text-sm sm:text-base"
                  placeholder="Field of Study"
                  value={newEducation.field_of_study}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      field_of_study: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs sm:text-sm">Start Date</label>
                  <input
                    id="education-start-date"
                    name="start_date"
                    type="date"
                    className="form-input text-sm sm:text-base"
                    value={newEducation.start_date}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        start_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-xs sm:text-sm">End Date</label>
                  <input
                    id="education-end-date"
                    name="end_date"
                    type="date"
                    className="form-input text-sm sm:text-base"
                    value={newEducation.end_date}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        end_date: e.target.value,
                      })
                    }
                    disabled={newEducation.current}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  id="education-current"
                  name="current"
                  type="checkbox"
                  checked={newEducation.current}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      current: e.target.checked,
                      end_date: "",
                    })
                  }
                />
                <span className="text-xs sm:text-sm text-secondary-700">
                  Currently studying here
                </span>
              </label>
              <textarea
                id="education-description"
                name="description"
                className="form-input text-sm sm:text-base"
                placeholder="Description (optional)"
                rows={3}
                value={newEducation.description}
                onChange={(e) =>
                  setNewEducation({
                    ...newEducation,
                    description: e.target.value,
                  })
                }
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm w-full sm:w-auto"
                  disabled={addEducationMutation.isPending}
                >
                  {addEducationMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary btn-sm w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {education.length > 0 ? (
          <div className="space-y-4">
            {education.map((edu) => (
              <div
                key={edu.id}
                className="p-3 sm:p-4 border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900 text-sm sm:text-base">
                      {edu.degree} in {edu.field_of_study}
                    </h3>
                    <p className="text-primary-600 font-medium text-sm sm:text-base">
                      {edu.institution}
                    </p>
                    <p className="text-xs sm:text-sm text-secondary-600 mt-1">
                      {new Date(edu.start_date).getFullYear()} -{" "}
                      {edu.current
                        ? "Present"
                        : new Date(edu.end_date || "").getFullYear()}
                    </p>
                    {edu.description && (
                      <p className="text-xs sm:text-sm text-secondary-700 mt-2">
                        {edu.description}
                      </p>
                    )}
                  </div>
                  {isEditing && edu.id && (
                    <button
                      onClick={() => deleteEducationMutation.mutate(edu.id!)}
                      className="text-red-600 hover:text-red-700 self-end sm:self-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-secondary-500 italic">
            No education history added yet
          </p>
        )}
      </div>
    </div>
  );
};

// Experience Section Component
interface ExperienceSectionProps {
  isEditing: boolean;
  onEditToggle: () => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  isEditing,
  onEditToggle,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string>("");
  const [newExperience, setNewExperience] = useState<
    Omit<UserExperience, "id" | "created_at" | "updated_at">
  >({
    company: "",
    position: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
    current: false,
  });

  const { data: experience = [], isLoading: isLoadingExperience, isError: isExperienceError, refetch: refetchExperience } = useQuery({
    queryKey: ["experience"],
    queryFn: () => profileApi.getExperience().then((res) => res.data),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const addExperienceMutation = useMutation({
    mutationFn: (
      data: Omit<UserExperience, "id" | "created_at" | "updated_at">
    ) => profileApi.addExperience(data),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["experience"] });
      await refetchExperience();
      setShowAddForm(false);
      
      // Show message if experience was updated instead of created
      if (response.data.message) {
        setError(response.data.message);
        setTimeout(() => setError(""), 3000);
      } else {
        setError("");
      }
      
      setNewExperience({
        company: "",
        position: "",
        location: "",
        start_date: "",
        end_date: "",
        description: "",
        current: false,
      });
    },
    onError: (error: any) => {
      let errorMessage = "Failed to add experience. Please try again.";
      
      if (error.response?.data) {
        const data = error.response.data;
        // Get field-specific errors if available
        if (typeof data === 'object') {
          const fieldErrors = Object.entries(data)
            .map(([key, value]: [string, any]) => {
              const fieldName = key.replace(/_/g, ' ').toLowerCase();
              if (Array.isArray(value)) {
                return `${fieldName}: ${value.join(', ')}`;
              }
              return `${fieldName}: ${value}`;
            })
            .join('. ');
          if (fieldErrors) errorMessage = fieldErrors;
        } else {
          errorMessage = data.detail || data.message || errorMessage;
        }
      }
      setError(errorMessage);
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: (id: number) => profileApi.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience"] });
      queryClient.refetchQueries({ queryKey: ["experience"] });
      setError("");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Failed to delete experience. Please try again.";
      setError(errorMessage);
    },
  });

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert empty strings to null for optional date fields
    const dataToSubmit = {
      ...newExperience,
      end_date: newExperience.end_date || null,
    };
    addExperienceMutation.mutate(dataToSubmit as any);
  };

  return (
    <div className="card mb-4 sm:mb-6">
      <div className="card-body p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 flex-shrink-0" />
            Experience
          </h2>
          <button onClick={onEditToggle} className="btn btn-secondary btn-sm w-full sm:w-auto">
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                Done
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Manage Experience
              </>
            )}
          </button>
        </div>

        {isLoadingExperience && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}

        {isExperienceError && !isLoadingExperience && (
          <div className="mb-3 p-3 bg-error-100 border border-error-300 rounded text-error-700 text-sm">
            Failed to load experience. Please try again.
          </div>
        )}

        {isEditing && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary btn-sm mb-4 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        )}

        {showAddForm && (
          <form
            onSubmit={handleAddExperience}
            className="mb-6 p-3 sm:p-4 border border-secondary-200 rounded-lg"
          >
            <h3 className="font-semibold text-secondary-900 mb-3 text-sm sm:text-base">
              Add Experience
            </h3>
            {error && (
              <div className="mb-3 p-2 bg-error-100 border border-error-300 rounded text-error-700 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <input
                id="experience-company"
                name="company"
                type="text"
                className="form-input text-sm sm:text-base"
                placeholder="Company"
                value={newExperience.company}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    company: e.target.value,
                  })
                }
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  id="experience-position"
                  name="position"
                  type="text"
                  className="form-input text-sm sm:text-base"
                  placeholder="Position"
                  value={newExperience.position}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      position: e.target.value,
                    })
                  }
                  required
                />
                <input
                  id="experience-location"
                  name="location"
                  type="text"
                  className="form-input text-sm sm:text-base"
                  placeholder="Location (optional)"
                  value={newExperience.location}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      location: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label text-xs sm:text-sm">Start Date</label>
                  <input
                    id="experience-start-date"
                    name="start_date"
                    type="date"
                    className="form-input text-sm sm:text-base"
                    value={newExperience.start_date}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        start_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="form-label text-xs sm:text-sm">End Date</label>
                  <input
                    id="experience-end-date"
                    name="end_date"
                    type="date"
                    className="form-input text-sm sm:text-base"
                    value={newExperience.end_date}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        end_date: e.target.value,
                      })
                    }
                    disabled={newExperience.current}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  id="experience-current"
                  name="current"
                  type="checkbox"
                  checked={newExperience.current}
                  onChange={(e) =>
                    setNewExperience({
                      ...newExperience,
                      current: e.target.checked,
                      end_date: "",
                    })
                  }
                />
                <span className="text-xs sm:text-sm text-secondary-700">
                  Currently working here
                </span>
              </label>
              <textarea
                id="experience-description"
                name="description"
                className="form-input text-sm sm:text-base"
                placeholder="Description (optional)"
                rows={3}
                value={newExperience.description}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    description: e.target.value,
                  })
                }
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm w-full sm:w-auto"
                  disabled={addExperienceMutation.isPending}
                >
                  {addExperienceMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary btn-sm w-full sm:w-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {experience.length > 0 ? (
          <div className="space-y-4">
            {experience.map((exp) => (
              <div
                key={exp.id}
                className="p-3 sm:p-4 border border-secondary-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-secondary-900 text-sm sm:text-base">
                      {exp.position}
                    </h3>
                    <p className="text-primary-600 font-medium text-sm sm:text-base">
                      {exp.company}
                    </p>
                    {exp.location && (
                      <p className="text-xs sm:text-sm text-secondary-600">
                        {exp.location}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-secondary-600 mt-1">
                      {new Date(exp.start_date).toLocaleDateString()} -{" "}
                      {exp.current
                        ? "Present"
                        : new Date(exp.end_date || "").toLocaleDateString()}
                    </p>
                    {exp.description && (
                      <p className="text-xs sm:text-sm text-secondary-700 mt-2 whitespace-pre-wrap">
                        {exp.description}
                      </p>
                    )}
                  </div>
                  {isEditing && exp.id && (
                    <button
                      onClick={() => deleteExperienceMutation.mutate(exp.id!)}
                      className="text-red-600 hover:text-red-700 self-end sm:self-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm sm:text-base text-secondary-500 italic">
            No work experience added yet
          </p>
        )}
      </div>
    </div>
  );
};
