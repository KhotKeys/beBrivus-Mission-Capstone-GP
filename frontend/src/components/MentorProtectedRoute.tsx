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

      if (user.user_type !== "mentor") {
        setNeedsOnboarding(false);
        setIsChecking(false);
        return;
      }

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          "http://localhost:8000/api/mentors/onboarding/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setNeedsOnboarding(data.needs_onboarding);
        } else {
          // If check fails, assume onboarding is needed
          setNeedsOnboarding(true);
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
        // If check fails, assume onboarding is needed
        setNeedsOnboarding(true);
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

//   if (needsOnboarding && user?.user_type === "mentor") {
//     return <Navigate to="/mentor/onboarding" />;
//   }

  return <>{children}</>;
};

export default MentorProtectedRoute;