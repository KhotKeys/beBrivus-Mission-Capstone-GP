import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { adminApi } from "../services/adminApi";

interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_staff?: boolean;
  is_superuser?: boolean;
  permissions?: string[];
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  adminLogin: (credentials: {
    email: string;
    password: string;
  }) => Promise<boolean>;
  adminLogout: () => void;
  hasPermission: (permission: string) => boolean;
  refreshAdminUser: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({
  children,
}) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdminAuthenticated: boolean =
    !!adminUser &&
    (adminUser.user_type === "admin" ||
      !!adminUser.is_staff ||
      !!adminUser.is_superuser);

  // Check if admin is authenticated on app load
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (token) {
          const response = await adminApi.get("/auth/profile/");
          if (
            response.data.user_type === "admin" ||
            response.data.is_staff ||
            response.data.is_superuser
          ) {
            setAdminUser(response.data);
          } else {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminRefreshToken");
          }
        }
      } catch (error) {
        console.error("Admin auth check failed:", error);
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, []);

  const adminLogin = async (credentials: {
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Attempting admin login with:", { email: credentials.email });

      const response = await adminApi.post("/auth/admin/login/", credentials);
      const { access, refresh, user } = response.data;

      console.log("Login response received:", {
        userType: user.user_type,
        isStaff: user.is_staff,
        isSuperuser: user.is_superuser,
        userId: user.id,
        email: user.email,
      });

      // Check if user has admin privileges
      if (user.user_type === "admin" || user.is_staff || user.is_superuser) {
        localStorage.setItem("adminToken", access);
        localStorage.setItem("adminRefreshToken", refresh);
        setAdminUser(user);
        console.log("Admin login successful");
        return true;
      } else {
        console.log("User does not have admin privileges:", {
          userType: user.user_type,
          isStaff: user.is_staff,
          isSuperuser: user.is_superuser,
        });
        throw new Error(
          "Insufficient permissions for admin access. Admin user type required."
        );
      }
    } catch (error: any) {
      console.error("Admin login failed:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    setAdminUser(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!adminUser) return false;
    if (adminUser.is_superuser) return true;
    // For now, admin users have all permissions
    if (adminUser.user_type === "admin") return true;
    return adminUser.permissions?.includes(permission) || false;
  };

  const refreshAdminUser = async (): Promise<void> => {
    try {
      const response = await adminApi.get("/auth/profile/");
      if (
        response.data.user_type === "admin" ||
        response.data.is_staff ||
        response.data.is_superuser
      ) {
        setAdminUser(response.data);
      } else {
        adminLogout();
      }
    } catch (error) {
      console.error("Failed to refresh admin user:", error);
      adminLogout();
    }
  };

  const value: AdminAuthContextType = {
    adminUser,
    isAdminAuthenticated,
    isLoading,
    adminLogin,
    adminLogout,
    hasPermission,
    refreshAdminUser,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
