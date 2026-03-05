import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const RoleGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const currentPath = location.pathname;
      
      // Skip RoleGuard for all admin routes - let AdminAuthContext handle it
      if (currentPath.startsWith('/admin')) {
        return;
      }
      
      // Define role-specific dashboard routes
      const roleRoutes: Record<string, string> = {
        'admin': '/admin/dashboard',
        'mentor': '/mentor-dashboard',
        'institution': '/institution/opportunities',
      };

      const userDashboard = roleRoutes[user.user_type] || '/dashboard';

      // If user is on a dashboard route that doesn't match their role, redirect
      if (currentPath === '/dashboard' && user.user_type === 'mentor') {
        navigate('/mentor-dashboard', { replace: true });
      } else if (currentPath === '/dashboard' && user.user_type === 'institution') {
        navigate('/institution/opportunities', { replace: true });
      } else if (currentPath === '/dashboard' && (user.user_type === 'admin' || user.is_superuser)) {
        navigate('/admin/dashboard', { replace: true });
      } else if (currentPath === '/mentor-dashboard' && user.user_type !== 'mentor') {
        navigate(userDashboard, { replace: true });
      } else if (currentPath.startsWith('/institution/') && user.user_type !== 'institution') {
        navigate(userDashboard, { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, location.pathname, navigate]);

  return <>{children}</>;
};
