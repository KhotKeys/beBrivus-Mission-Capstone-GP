import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface InstitutionProtectedRouteProps {
  children: React.ReactNode;
}

const InstitutionProtectedRoute: React.FC<InstitutionProtectedRouteProps> = ({
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

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

  if (user?.user_type !== "institution") {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default InstitutionProtectedRoute;
