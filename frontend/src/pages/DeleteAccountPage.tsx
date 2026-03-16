import React, { useState } from "react";
import { Layout } from "../components/layout";
import { AlertTriangle, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

export const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter your password to confirm deletion");
      return;
    }

    if (!window.confirm("Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.")) {
      return;
    }

    try {
      setIsLoading(true);
      await authApi.deleteAccount(password);
      // Redirect happens in the API function
    } catch (err: any) {
      setIsLoading(false);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Failed to delete account. Please try again.");
      }
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-6 sm:py-16 lg:py-20 overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 w-full box-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 bg-error-100 rounded-2xl mb-4 xs:mb-6">
              <AlertTriangle className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 text-error-600" />
            </div>
            <h1 className="text-lg xs:text-2xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Delete Account
            </h1>
            <p className="text-xs xs:text-base sm:text-lg text-secondary-600">
              This action is permanent and cannot be undone
            </p>
          </div>

          {/* Warning Card */}
          <div className="bg-white rounded-2xl shadow-lg p-3 xs:p-5 sm:p-8 mb-6 w-full overflow-hidden">
            <div className="bg-error-50 border-l-4 border-error-500 p-2 xs:p-4 rounded mb-6 overflow-hidden">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-error-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-error-900 mb-2">
                    Warning: All Data Will Be Permanently Deleted
                  </h3>
                  <p className="text-error-800 text-xs xs:text-sm">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
              </div>
            </div>

            {/* What Will Be Deleted */}
            <div className="mb-6">
              <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-secondary-900 mb-4">
                The following data will be permanently deleted:
              </h3>
              <div className="space-y-3 text-xs xs:text-sm text-secondary-700">
                <div className="flex items-start">
                  <span className="text-error-600 mr-2">•</span>
                  <span><strong>Profile data:</strong> Name, email, bio, profile picture, contact information, education, experience, skills</span>
                </div>
                <div className="flex items-start">
                  <span className="text-error-600 mr-2">•</span>
                  <span><strong>Applications:</strong> All scholarship/opportunity applications, cover letters, uploaded documents (CVs, transcripts, certificates, portfolios)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-error-600 mr-2">•</span>
                  <span><strong>Forum activity:</strong> All posts, replies, images, likes, and forum reputation</span>
                </div>
                <div className="flex items-start">
                  <span className="text-error-600 mr-2">•</span>
                  <span><strong>Mentorship records:</strong> Session notes, bookings, reviews, mentor profile (if applicable)</span>
                </div>
                <div className="flex items-start">
                  <span className="text-error-600 mr-2">•</span>
                  <span><strong>AI chat history:</strong> All conversations with AI coach, insights, recommendations, and memory profile</span>
                </div>
                <div className="flex items-start">
                  <span className="text-error-600 mr-2">•</span>
                  <span><strong>Goals and tracker data:</strong> All goals, milestones, activities, habits, and progress snapshots</span>
                </div>
                <div className="flex items-start">
                  <span className="text-error-600 mr-2">•</span>
                  <span><strong>Gamification data:</strong> Points, badges, levels, streaks, and achievements</span>
                </div>
                <div className="flex items-start">
                  <span className="text-error-600 mr-2">•</span>
                  <span><strong>Messages:</strong> All conversations and notifications</span>
                </div>
                <div className="flex items-start">
                  <span className="text-error-600 mr-2">•</span>
                  <span><strong>Resource activity:</strong> Bookmarks, ratings, progress, workshop registrations</span>
                </div>
                <div className="flex items-start">
                  <span className="text-error-600 mr-2">•</span>
                  <span><strong>All uploaded files:</strong> Profile pictures, application documents, forum images</span>
                </div>
              </div>
            </div>

            {/* Password Confirmation Form */}
            <form onSubmit={handleDelete} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-xs xs:text-sm font-medium text-secondary-900 mb-2">
                  Enter your password to confirm deletion
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-error-500 focus:border-transparent"
                  placeholder="Your password"
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-3 text-error-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 xs:px-6 py-2 xs:py-3 bg-secondary-100 text-secondary-700 font-semibold rounded-lg hover:bg-secondary-200 transition-colors text-xs xs:text-sm sm:text-base"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-3 xs:px-6 py-2 xs:py-3 bg-error-600 text-white font-semibold rounded-lg hover:bg-error-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs xs:text-sm sm:text-base"
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4 xs:w-5 xs:h-5" />
                  {isLoading ? "Deleting..." : "Permanently Delete My Account"}
                </button>
              </div>
            </form>
          </div>

          {/* Additional Info */}
          <div className="text-center text-xs xs:text-sm text-secondary-600">
            <p>
              Need help? Contact us at{" "}
              <a href="mailto:support@bebrivus.com" className="text-primary-600 hover:text-primary-700">
                support@bebrivus.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};
