import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface MentorProtectedRouteProps {
  children: React.ReactNode;
}

const MentorProtectedRoute: React.FC<MentorProtectedRouteProps> = ({
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {

      if (isLoading) {
        return; // Do not run if the state is still loading
      }

      if (!isAuthenticated || !user) {
        setIsChecking(false);
        return;
      }

      // Redirect non-mentors to user dashboard
      if (user.user_type !== "mentor") {
        setNeedsOnboarding(false);
        setIsChecking(false);
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          "http://localhost:8001/api/mentors/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          // User has mentor profile, allow access
          setNeedsOnboarding(false);
        } else {
          // No mentor profile, redirect to user dashboard
          setNeedsOnboarding(false);
        }
      } catch (error) {
        console.error("Failed to check mentor profile:", error);
        setNeedsOnboarding(false);
      }

      setIsChecking(false);
    };

    checkOnboardingStatus();
  }, [isAuthenticated, user, isLoading]); // Add isLoading to the dependencies

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect non-mentors to user dashboard
  if (user?.user_type !== 'mentor') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default MentorProtectedRoute;