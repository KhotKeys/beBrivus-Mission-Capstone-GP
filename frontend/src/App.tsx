import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import i18n from './i18n';
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OpportunitiesPage } from "./pages/OpportunitiesPage";
import { ApplicationFormPage } from "./pages/ApplicationFormPage";
import { TrackerPage } from "./pages/TrackerPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { ForumPage } from "./pages/ForumPage";
import { GamificationPage } from "./pages/GamificationPage";
import { AICoachPage } from "./pages/AICoachPage";
import MentorshipPage from "./pages/MentorshipPage";
import MentorDashboard from "./pages/MentorDashboard";
import VideoCallPage from "./pages/VideoCallPage";
import MentorOnboarding from "./components/MentorOnboarding";
import MentorProtectedRoute from "./components/MentorProtectedRoute";
import InstitutionProtectedRoute from "./components/InstitutionProtectedRoute";
import { RoleGuard } from "./components/RoleGuard";
import InstitutionOpportunitiesPage from "./pages/institution/InstitutionOpportunitiesPage";
import { InstitutionApplicationResponsesPage } from "./pages/institution/InstitutionApplicationResponsesPage";

// Admin imports
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { OpportunityManagement } from "./pages/admin/OpportunityManagement";
import { CreateOpportunity } from "./pages/admin/CreateOpportunity";
import { ResourceManagement } from "./pages/admin/ResourceManagement";
import { UserManagement } from "./pages/admin/UserManagement";
import { ForumManagement } from "./pages/admin/ForumManagement";
import { AnalyticsDashboardPage } from "./pages/admin/AnalyticsDashboardPage";
import { WeeklyAnalyticsReportPage } from "./pages/admin/WeeklyAnalyticsReportPage";
import { ResourceUploadPage } from "./pages/admin/ResourceUploadPage";
import { AdminApplicationResponsesPage } from "./pages/admin/AdminApplicationResponsesPage";
import AdminForumModerationPage from "./pages/admin/AdminForumModerationPage";
import { AdminActivityPage } from "./pages/admin/AdminActivityPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import AdminFeedbackPage from "./pages/admin/AdminFeedbackPage";
import { ForumNewPostPage } from "./pages/ForumNewPostPage";
import { ForumDiscussionPage } from "./pages/ForumDiscussionPage";
import { ProfilePage } from "./pages/ProfilePage";
import { InstitutionProfilePage } from "./pages/institution/InstitutionProfilePage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { TermsOfServicePage } from "./pages/TermsOfServicePage";
import { CookiePolicyPage } from "./pages/CookiePolicyPage";
import { AccessibilityPage } from "./pages/AccessibilityPage";
import { SuccessStoriesPage } from "./pages/SuccessStoriesPage";
import { ApplicationTipsPage } from "./pages/ApplicationTipsPage";
import { BlogGuidesPage } from "./pages/BlogGuidesPage";
import { FAQPage } from "./pages/FAQPage";
import { HelpCenterPage } from "./pages/HelpCenterPage";
import { AboutUsPage } from "./pages/AboutUsPage";
import { OurMissionPage } from "./pages/OurMissionPage";
import { CareersPage } from "./pages/CareersPage";
import { ContactUsPage } from "./pages/ContactUsPage";
import { PartnerWithUsPage } from "./pages/PartnerWithUsPage";
import { UploadedResourcesPage } from "./pages/UploadedResourcesPage";
import FeedbackPage from "./pages/FeedbackPage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: "always",
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirect to appropriate dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect to role-specific dashboard
    if (user.user_type === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.user_type === 'mentor') {
      return <Navigate to="/mentor-dashboard" replace />;
    } else if (user.user_type === 'institution') {
      return <Navigate to="/institution/opportunities" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Profile Route Wrapper (shows appropriate profile based on user type)
const ProfileRouteWrapper: React.FC = () => {
  const { user } = useAuth();
  
  if (user?.user_type === 'institution') {
    return <InstitutionProfilePage />;
  }
  
  return <ProfilePage />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      {/* Add more protected routes here */}
      <Route
        path="/opportunities"
        element={
          <ProtectedRoute>
            <OpportunitiesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/opportunities/:opportunityId/apply"
        element={
          <ProtectedRoute>
            <ApplicationFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentors"
        element={
          <ProtectedRoute>
            <MentorshipPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracker"
        element={
          <ProtectedRoute>
            <TrackerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <ResourcesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources/uploads"
        element={
          <ProtectedRoute>
            <UploadedResourcesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum"
        element={
          <ProtectedRoute>
            <ForumPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum/new"
        element={
          <ProtectedRoute>
            <ForumNewPostPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum/discussion/:slug"
        element={
          <ProtectedRoute>
            <ForumDiscussionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <FeedbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gamification"
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-coach"
        element={
          <ProtectedRoute>
            <AICoachPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfileRouteWrapper />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl">Settings Page (Coming Soon)</h1>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl">Analytics Page (Coming Soon)</h1>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/achievements"
        element={
          <ProtectedRoute>
            <GamificationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor/onboarding"
        element={
          <ProtectedRoute>
            <MentorOnboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentor-dashboard"
        element={
          <MentorProtectedRoute>
            <MentorDashboard />
          </MentorProtectedRoute>
        }
      />
      <Route
        path="/institution/opportunities"
        element={
          <InstitutionProtectedRoute>
            <InstitutionOpportunitiesPage />
          </InstitutionProtectedRoute>
        }
      />
      <Route
        path="/institution/applications"
        element={
          <InstitutionProtectedRoute>
            <InstitutionApplicationResponsesPage />
          </InstitutionProtectedRoute>
        }
      />
      <Route
        path="/video-call/:sessionId"
        element={
          <ProtectedRoute>
            <VideoCallPage />
          </ProtectedRoute>
        }
      />

      {/* Legal Pages - Public Routes */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />
      <Route path="/accessibility" element={<AccessibilityPage />} />

      {/* Resources Pages - Public Routes */}
      <Route path="/success-stories" element={<SuccessStoriesPage />} />
      <Route path="/application-tips" element={<ApplicationTipsPage />} />
      <Route path="/blog-guides" element={<BlogGuidesPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/help-center" element={<HelpCenterPage />} />

      {/* Company Pages - Public Routes */}
      <Route path="/about-us" element={<AboutUsPage />} />
      <Route path="/our-mission" element={<OurMissionPage />} />
      <Route path="/careers" element={<CareersPage />} />
      <Route path="/contact" element={<ContactUsPage />} />
      <Route path="/partner-with-us" element={<PartnerWithUsPage />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="opportunities" element={<OpportunityManagement />} />
        <Route path="opportunities/new" element={<CreateOpportunity />} />
        <Route path="resources" element={<ResourceManagement />} />
        <Route path="resources/upload" element={<ResourceUploadPage />} />
        <Route path="resources/:id/edit" element={<ResourceUploadPage />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="forum" element={<ForumManagement />} />
        <Route path="forum/moderation" element={<AdminForumModerationPage />} />
        <Route path="analytics" element={<AnalyticsDashboardPage />} />
        <Route path="analytics/weekly" element={<WeeklyAnalyticsReportPage />} />
        <Route path="activity" element={<AdminActivityPage />} />
        <Route path="applications" element={<AdminApplicationResponsesPage />} />
        <Route path="feedback" element={<AdminFeedbackPage />} />
        <Route
          path="content"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl">Content Management (Coming Soon)</h1>
            </div>
          }
        />
        <Route
          path="settings"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl">Admin Settings (Coming Soon)</h1>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  // Load saved language on app startup
  useEffect(() => {
    const savedLanguage = localStorage.getItem('bebrivus_language') || 'en';
    i18n.changeLanguage(savedLanguage);
    document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AdminAuthProvider>
            <Router>
              <RoleGuard>
                <div className="App">
                  <AppRoutes />
                </div>
              </RoleGuard>
            </Router>
          </AdminAuthProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
