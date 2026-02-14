import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  BookOpen,
  Users,
  Target,
  BarChart3,
  Gift,
  Bot,
  Trophy,
  Menu as MenuIcon,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui";

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMentor = user?.user_type === "mentor";
  const isInstitution = user?.user_type === "institution";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to={
                isAuthenticated && isMentor
                  ? "/mentor-dashboard"
                  : isAuthenticated && isInstitution
                  ? "/institution/opportunities"
                  : "/"
              }
              className="flex items-center space-x-2"
            >
              <img
                className="h-12 w-auto object-contain"
                src="/beBivus.png"
                alt="beBrivus Logo"
              />
            </Link>
          </div>

          {/* Navigation - Desktop */}
          {isAuthenticated && !isMentor && !isInstitution && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/opportunities"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Opportunities</span>
              </Link>
              <Link
                to="/mentors"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Mentors</span>
              </Link>
              <Link
                to="/tracker"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Target className="w-4 h-4" />
                <span>Tracker</span>
              </Link>
              <Link
                to="/resources"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Resources</span>
              </Link>
              <Link
                to="/forum"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Forum</span>
              </Link>
              <Link
                to="/ai-coach"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Bot className="w-4 h-4" />
                <span>AI Coach</span>
              </Link>
            </nav>
          )}

          {isAuthenticated && isInstitution && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/institution/opportunities"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Target className="w-4 h-4" />
                <span>Institution Portal</span>
              </Link>
            </nav>
          )}

          {/* Mentor Navigation - Simple header for mentors */}
          {/* {isAuthenticated && user?.user_type === 'mentor' && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/mentor-dashboard"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/mentorship"
                className="flex items-center space-x-1 text-secondary-700 hover:text-primary-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Mentorship</span>
              </Link>
            </nav>
          )} */}

          {/* Right side */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-secondary-100"
              aria-label="Toggle navigation"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            {isAuthenticated ? (
              <>
                {/* User Menu */}
                <Menu as="div" className="relative">
                  <MenuButton className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 transition-colors">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.first_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="hidden md:block text-sm font-medium text-secondary-900">
                      {user?.first_name}
                    </span>
                  </MenuButton>

                  <MenuItems className="absolute right-0 mt-2 w-56 bg-white border border-secondary-200 rounded-lg shadow-lg py-1 z-50">
                    <MenuItem>
                      {({ focus }) => (
                        <Link
                          to="/profile"
                          className={`${
                            focus ? "bg-secondary-50" : ""
                          } flex items-center space-x-2 px-4 py-2 text-sm text-secondary-700`}
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                      )}
                    </MenuItem>
                    <hr className="my-1 border-secondary-200" />
                    <MenuItem>
                      {({ focus }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            focus ? "bg-secondary-50" : ""
                          } flex items-center space-x-2 px-4 py-2 text-sm text-error-600 w-full text-left`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      )}
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        {isAuthenticated ? (
          <div
            className={`md:hidden transition-all duration-200 overflow-hidden ${
              mobileOpen ? "max-h-96 pb-4" : "max-h-0"
            }`}
          >
            <nav className="flex flex-col gap-2 pt-2">
              {user?.user_type === "mentor" ? (
                <>
                  <Link
                    to="/mentor-dashboard"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-secondary-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/mentorship"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-secondary-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Mentorship</span>
                  </Link>
                </>
              ) : user?.user_type === "institution" ? (
                <>
                  <Link
                    to="/institution/opportunities"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-secondary-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Target className="w-4 h-4" />
                    <span>Institution Portal</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/opportunities"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-secondary-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Search className="w-4 h-4" />
                    <span>Opportunities</span>
                  </Link>
                  <Link
                    to="/mentors"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-secondary-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Mentors</span>
                  </Link>
                  <Link
                    to="/tracker"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-secondary-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Target className="w-4 h-4" />
                    <span>Tracker</span>
                  </Link>
                  <Link
                    to="/resources"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-secondary-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Resources</span>
                  </Link>
                  <Link
                    to="/forum"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-secondary-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Forum</span>
                  </Link>
                  <Link
                    to="/ai-coach"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-secondary-700 hover:text-primary-600 hover:bg-secondary-100"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Bot className="w-4 h-4" />
                    <span>AI Coach</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        ) : (
          <div
            className={`md:hidden transition-all duration-200 overflow-hidden ${
              mobileOpen ? "max-h-40 pb-4" : "max-h-0"
            }`}
          >
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/login");
                }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setMobileOpen(false);
                  navigate("/register");
                }}
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
