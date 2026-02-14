import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "../../components/layout";
import {
  Building,
  Mail,
  MapPin,
  Globe,
  Phone,
  Edit,
  Save,
  X,
  User,
  FileText,
} from "lucide-react";
import { profileApi } from "../../api/profile";
import type { UserProfile } from "../../api/profile";

export const InstitutionProfilePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileApi.getProfile().then((res) => res.data),
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
    },
  });

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="card mb-4 sm:mb-6">
          <div className="card-body p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Organization Logo */}
              <div className="relative mx-auto sm:mx-0">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.first_name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-100 flex items-center justify-center">
                    <Building className="w-10 h-10 sm:w-12 sm:h-12 text-primary-600" />
                  </div>
                )}
              </div>

              {/* Organization Info */}
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                  <h1 className="institution-name text-2xl sm:text-3xl font-bold text-secondary-900 text-center sm:text-left">
                    {profile.university || `${profile.first_name} ${profile.last_name}`}
                  </h1>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="btn btn-secondary btn-sm w-full sm:w-auto"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                  <span className="badge badge-primary text-xs sm:text-sm">
                    Institution
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

        {/* Edit Form */}
        {isEditing && (
          <InstitutionEditForm
            profile={profile}
            onSave={(data) => updateProfileMutation.mutate(data)}
            onCancel={() => setIsEditing(false)}
            isSaving={updateProfileMutation.isPending}
          />
        )}

        {/* About Section */}
        {!isEditing && (
          <div className="card mb-4 sm:mb-6">
            <div className="card-body p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-secondary-900 mb-3 sm:mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                About
              </h2>
              {profile.bio ? (
                <p className="text-sm sm:text-base text-secondary-700 whitespace-pre-wrap leading-relaxed">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-sm sm:text-base text-secondary-500 italic">
                  No description added yet. Click "Edit Profile" to add one.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="card mb-4 sm:mb-6">
          <div className="card-body p-4 sm:p-6">
            <h2 className="institution-contact-title text-lg sm:text-xl font-semibold text-secondary-900 mb-3 sm:mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              {profile.phone_number && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div>
                    <p className="institution-phone-label text-xs sm:text-sm text-secondary-600">Phone</p>
                    <p className="institution-phone-value font-medium text-secondary-900 text-sm sm:text-base">
                      {profile.phone_number}
                    </p>
                  </div>
                </div>
              )}
              {profile.portfolio_website && (
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm text-secondary-600">Website</p>
                    <a
                      href={profile.portfolio_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base break-all"
                    >
                      {profile.portfolio_website}
                    </a>
                  </div>
                </div>
              )}
              {!profile.phone_number && !profile.portfolio_website && (
                <p className="text-sm sm:text-base text-secondary-500 italic">
                  No contact information added yet. Click "Edit Profile" to add details.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Institution Edit Form Component
interface InstitutionEditFormProps {
  profile: UserProfile;
  onSave: (data: Partial<UserProfile>) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const InstitutionEditForm: React.FC<InstitutionEditFormProps> = ({
  profile,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [formData, setFormData] = useState({
    university: profile.university || "",
    bio: profile.bio || "",
    location: profile.location || "",
    phone_number: profile.phone_number || "",
    portfolio_website: profile.portfolio_website || "",
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
            Edit Institution Profile
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Organization Name */}
          <div>
            <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
              <Building className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Organization Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="form-input w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              value={formData.university}
              onChange={(e) =>
                setFormData({ ...formData, university: e.target.value })
              }
              required
              placeholder="Your institution/organization name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              About Your Institution
            </label>
            <textarea
              className="form-input w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
              rows={6}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Describe your institution, mission, values, and what opportunities you offer..."
              maxLength={1000}
            />
            <p className="text-xs text-secondary-500 mt-1">
              {formData.bio.length}/1000 characters
            </p>
          </div>

          {/* Location */}
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
              placeholder="City, Country or Region"
            />
          </div>

          {/* Contact Information */}
          <div className="border-t border-secondary-200 pt-4 sm:pt-6">
            <h3 className="text-base sm:text-lg font-semibold text-secondary-900 mb-3 sm:mb-4">
              Contact Information
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
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

              <div>
                <label className="form-label text-xs sm:text-sm font-medium text-secondary-700 mb-2 block">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Website
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
                  placeholder="https://yourinstitution.com"
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

export default InstitutionProfilePage;
