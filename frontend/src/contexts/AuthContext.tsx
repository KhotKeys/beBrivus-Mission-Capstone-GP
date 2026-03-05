import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../api/auth";
import { authApi } from "../api/auth";
import { tokenManager } from "../api/client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = () => {
      const accessToken = tokenManager.getAccessToken();

      if (accessToken && !tokenManager.isTokenExpired(accessToken)) {
        try {
          const userProfile = localStorage.getItem("user");
          if (userProfile) {
            setUser(JSON.parse(userProfile));
          }
        } catch (error) {
          console.error("Failed to get user profile:", error);
          tokenManager.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Set up token refresh interval - refresh every 50 minutes (before 1 hour expiry)
    const refreshInterval = setInterval(async () => {
      const accessToken = tokenManager.getAccessToken();
      const refreshToken = tokenManager.getRefreshToken();
      
      if (accessToken && refreshToken && !tokenManager.isTokenExpired(refreshToken)) {
        try {
          const response = await authApi.refreshToken();
          const newAccessToken = response.access;
          const newRefreshToken = (response as any).refresh || refreshToken;
          tokenManager.setTokens(newAccessToken, newRefreshToken);
        } catch (error) {
          console.error('Token refresh failed:', error);
          tokenManager.clearTokens();
          localStorage.removeItem('user');
          setUser(null);
          window.location.href = '/login?session_expired=true';
        }
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      const userProfile = await authApi.getProfile();
      localStorage.setItem("user", JSON.stringify(userProfile));
      setUser(userProfile); // Use the detailed profile instead of response.user
      return { ...response, user: userProfile }; // Return response with complete user info
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      tokenManager.clearTokens();
      localStorage.removeItem("user");
      setUser(null);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenManager.clearTokens();
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
