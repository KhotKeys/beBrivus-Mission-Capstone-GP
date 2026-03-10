import React, { useEffect, useState, useCallback, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Target,
  Bell,
  Search,
  Menu,
  X,
  MessageSquare,
  AlertTriangle,
  Calendar,
  UserPlus,
  FileCheck,
  Bot,
} from "lucide-react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { notificationsApi, type NotificationItem } from "../../api/notifications";
import { adminApi } from "../../services/adminApi";
import { OfflineBanner } from "../OfflineBanner";

export const AdminLayout: React.FC = () => {
  const { adminUser, adminLogout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!notificationsOpen) return;

    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const response = await notificationsApi.list();
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [notificationsOpen]);

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    
    try {
      setSearchLoading(true);
      const response = await adminApi.get(`/admin/search/?q=${encodeURIComponent(query)}`);
      setSearchResults(response.data.results || []);
      setSearchOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSearchResultClick = (result: any) => {
    navigate(result.link);
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'moderation': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'booking': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'ai_coach': return <Bot className="w-4 h-4 text-purple-500" />;
      case 'user_registration': return <UserPlus className="w-4 h-4 text-[#125B66]" />;
      case 'application': return <FileCheck className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      current: location.pathname === "/admin/dashboard",
    },
    {
      name: "Opportunities",
      href: "/admin/opportunities",
      icon: Target,
      current: location.pathname.startsWith("/admin/opportunities"),
    },
    {
      name: "Resources",
      href: "/admin/resources",
      icon: FileText,
      current: location.pathname.startsWith("/admin/resources"),
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
      current: location.pathname.startsWith("/admin/users"),
    },
    {
      name: "Forum Management",
      href: "/admin/forum",
      icon: MessageSquare,
      current: location.pathname.startsWith("/admin/forum"),
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: location.pathname.startsWith("/admin/analytics"),
    },
    {
      name: "Applications",
      href: "/admin/applications",
      icon: FileText,
      current: location.pathname.startsWith("/admin/applications"),
    },
    {
      name: "Feedback Portal",
      href: "/admin/feedback",
      icon: MessageSquare,
      current: location.pathname.startsWith("/admin/feedback"),
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 lg:flex overflow-x-hidden">
      <OfflineBanner />
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden pointer-events-none" />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 relative">
            <div className="absolute inset-0" style={{
              backgroundImage: 'url(/moderation-forum.jpeg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }} />
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }} />
            <div className="flex items-center relative z-10">
              <img
                src="/beBivus.png"
                alt="beBrivus Logo"
                className="h-9 w-9 rounded-lg bg-white p-1 mr-3 object-contain"
              />
              <span className="text-white font-bold text-lg">Admin Portal</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-neutral-200 relative z-10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? "bg-primary-100 text-primary-700 border-r-2 border-primary-600"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-semibold text-sm">
                  {adminUser?.first_name?.[0] ||
                    adminUser?.username?.[0] ||
                    "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {adminUser?.first_name && adminUser?.last_name
                    ? `${adminUser.first_name} ${adminUser.last_name}`
                    : adminUser?.username}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {adminUser?.is_superuser ? "Super Admin" : "Admin"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center px-3 py-2 text-sm font-medium text-error-600 hover:bg-error-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full min-w-0 overflow-x-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center flex-1 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-neutral-500 hover:text-neutral-700 mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 truncate">
                {navigation.find((item) => item.current)?.name || "Dashboard"}
              </h1>
            </div>

            <div className="relative flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
              {/* Search */}
              <div className="hidden md:block relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                  className="w-64 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="Search users, opportunities..."
                />
                {searchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                    {searchLoading ? (
                      <div className="px-4 py-3 text-sm text-neutral-500">Searching...</div>
                    ) : (
                      searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSearchResultClick(result)}
                          className="w-full text-left px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-primary-600 uppercase">{result.type}</span>
                          </div>
                          <p className="text-sm font-medium text-neutral-900 mt-1">{result.title}</p>
                          <p className="text-xs text-neutral-500">{result.subtitle}</p>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setSearchOpen(false);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Notifications */}
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative p-2 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-error-500 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-4 sm:right-6 top-16 w-80 bg-white border border-neutral-200 rounded-xl shadow-xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                    <span className="text-sm font-semibold text-neutral-900">
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </span>
                    <button
                      className="text-xs text-primary-600 hover:text-primary-700"
                      onClick={async () => {
                        await notificationsApi.markAllRead();
                        setNotifications((prev) =>
                          prev.map((item) => ({ ...item, read_at: new Date().toISOString() }))
                        );
                      }}
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationsLoading ? (
                      <div className="px-4 py-6 text-sm text-neutral-500">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-neutral-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((item) => (
                        <button
                          key={item.id}
                          className={`w-full text-left px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 ${
                            item.read_at ? "" : "bg-primary-50"
                          }`}
                          onClick={async () => {
                            if (!item.read_at) {
                              await notificationsApi.markRead(item.id);
                              setNotifications((prev) =>
                                prev.map((entry) =>
                                  entry.id === item.id
                                    ? { ...entry, read_at: new Date().toISOString() }
                                    : entry
                                )
                              );
                            }
                            if (item.link) {
                              navigate(item.link);
                              setNotificationsOpen(false);
                            }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {getNotificationIcon(item.notification_type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-neutral-900">
                                {item.title}
                              </p>
                              <p className="text-xs text-neutral-600 mt-1">
                                {item.body}
                              </p>
                              <p className="text-xs text-neutral-400 mt-2">
                                {new Date(item.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Profile */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {adminUser?.first_name?.[0] ||
                      adminUser?.username?.[0] ||
                      "A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
