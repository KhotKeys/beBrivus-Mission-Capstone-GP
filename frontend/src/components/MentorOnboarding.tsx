import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface MentorOnboardingData {
  current_position: string;
  current_company: string;
  years_of_experience: number;
  specializations: string;
  mentoring_experience: string;
  languages_spoken: string;
  hourly_rate: number;
  time_zone: string;
}

const API_BASE_URL = "http://localhost:8000/api";

const MentorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [formData, setFormData] = useState<MentorOnboardingData>({
    current_position: "",
    current_company: "",
    years_of_experience: 0,
    specializations: "",
    mentoring_experience: "",
    languages_spoken: "English",
    hourly_rate: 50,
    time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const createMentorProfile = async (data: MentorOnboardingData) => {
    const token = localStorage.getItem("access_token");
    const response = await axios.post(
      `${API_BASE_URL}/mentors/onboarding/`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  };

  const onboardingMutation = useMutation({
    mutationFn: createMentorProfile,
    onSuccess: () => {
      setSuccess("Welcome! Your mentor profile has been created successfully.");
      setError("");
      setTimeout(() => {
        navigate("/mentor/dashboard");
      }, 2000);
    },
    onError: (error: any) => {
      setError(
        error.response?.data?.message || "Failed to create mentor profile"
      );
      setSuccess("");
    },
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      onboardingMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (data: Partial<MentorOnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.current_position &&
          formData.current_company &&
          formData.years_of_experience > 0
        );
      case 2:
        return formData.specializations && formData.mentoring_experience;
      case 3:
        return (
          formData.languages_spoken &&
          formData.hourly_rate > 0 &&
          formData.time_zone
        );
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Professional Information
        </h3>
        <p className="text-neutral-600 mb-6">
          Tell us about your current professional background
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Current Position *
          </label>
          <input
            type="text"
            value={formData.current_position}
            onChange={(e) =>
              updateFormData({ current_position: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Senior Software Engineer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Current Company *
          </label>
          <input
            type="text"
            value={formData.current_company}
            onChange={(e) =>
              updateFormData({ current_company: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Google, Microsoft, Startup Inc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Years of Experience *
          </label>
          <input
            type="number"
            min="1"
            value={formData.years_of_experience}
            onChange={(e) =>
              updateFormData({
                years_of_experience: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="5"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Expertise & Experience
        </h3>
        <p className="text-neutral-600 mb-6">
          Share your areas of expertise and mentoring background
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Areas of Expertise *
          </label>
          <input
            type="text"
            value={formData.specializations}
            onChange={(e) =>
              updateFormData({ specializations: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., React, Node.js, System Design, Product Management"
          />
          <p className="text-sm text-neutral-500 mt-1">
            Separate multiple areas with commas
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Mentoring Experience *
          </label>
          <textarea
            rows={4}
            value={formData.mentoring_experience}
            onChange={(e) =>
              updateFormData({ mentoring_experience: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Describe your mentoring experience, teaching background, or what makes you a great mentor..."
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Session Details
        </h3>
        <p className="text-neutral-600 mb-6">
          Set your availability and pricing preferences
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Languages Spoken *
          </label>
          <input
            type="text"
            value={formData.languages_spoken}
            onChange={(e) =>
              updateFormData({ languages_spoken: e.target.value })
            }
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., English, Spanish, French"
          />
          <p className="text-sm text-neutral-500 mt-1">
            Separate multiple languages with commas
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Hourly Rate (USD) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-neutral-500">$</span>
            <input
              type="number"
              min="1"
              value={formData.hourly_rate}
              onChange={(e) =>
                updateFormData({ hourly_rate: parseInt(e.target.value) || 0 })
              }
              className="w-full pl-8 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Time Zone *
          </label>
          <select
            value={formData.time_zone}
            onChange={(e) => updateFormData({ time_zone: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="America/New_York">Eastern Time (UTC-5)</option>
            <option value="America/Chicago">Central Time (UTC-6)</option>
            <option value="America/Denver">Mountain Time (UTC-7)</option>
            <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
            <option value="Europe/London">London (UTC+0)</option>
            <option value="Europe/Paris">Paris (UTC+1)</option>
            <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
            <option value="Asia/Shanghai">Shanghai (UTC+8)</option>
            <option value="Asia/Kolkata">India (UTC+5:30)</option>
            <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
              My Local Time Zone
            </option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? "bg-primary-600 text-white"
                        : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`h-1 w-12 ${
                        step < currentStep ? "bg-primary-600" : "bg-neutral-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-neutral-900">
              Welcome to BeBrivus!
            </h2>
            <p className="text-neutral-600">Let's set up your mentor profile</p>

            {/* Success/Error Messages */}
            {success && (
              <div className="mt-4 p-3 bg-success-100 border border-success-400 text-success-700 rounded">
                {success}
              </div>
            )}
            {error && (
              <div className="mt-4 p-3 bg-error-100 border border-error-400 text-error-700 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentStep === 1
                  ? "text-neutral-400 cursor-not-allowed"
                  : "text-neutral-700 hover:text-neutral-900"
              }`}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepValid() || onboardingMutation.isPending}
              className={`px-6 py-2 text-sm font-medium rounded-md ${
                isStepValid() && !onboardingMutation.isPending
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              }`}
            >
              {onboardingMutation.isPending
                ? "Creating..."
                : currentStep === 3
                ? "Complete Setup"
                : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorOnboarding;
