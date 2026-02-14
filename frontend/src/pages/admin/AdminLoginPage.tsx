import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Lock, User, AlertCircle } from "lucide-react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Button, Card, CardBody } from "../../components/ui";

export const AdminLoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { adminLogin, isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAdminAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await adminLogin(credentials);
      if (success) {
        navigate("/admin/dashboard");
      } else {
        setError("Invalid credentials or insufficient permissions");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className="min-h-screen relative isolate flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(2,6,23,0.7) 0%, rgba(2,6,23,0.6) 50%, rgba(2,6,23,0.75) 100%), url('/security.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Soft blur overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          backgroundColor: "rgba(2,6,23,0.25)",
        }}
        aria-hidden="true"
      ></div>

      <div className="relative z-10 w-full max-w-md pointer-events-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-secondary-200">
            Secure access to beBrivus administration
          </p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl">
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-error-500/20 border border-error-500/30 rounded-lg p-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-error-700 mr-3 flex-shrink-0" />
                  <span className="text-error-700 text-sm">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-primary-600 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-secondary-300"
                    placeholder="Enter admin email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-primary-600 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-secondary-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-shadow-neutral-300 placeholder-secondary-300"
                    placeholder="Enter admin password"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In to Admin Portal"
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-warning-500/20 border border-warning-500/30 rounded-lg">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-warning-700 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-warning-700 font-medium text-sm mb-1">
                    Security Notice
                  </h4>
                  <p className="text-warning-700 text-xs">
                    This is a secure admin area. All activities are monitored
                    and logged. Only authorized personnel should access this
                    portal.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Back to Site */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-secondary-300 hover:text-white transition-colors text-sm"
          >
            ← Back to beBrivus
          </Link>
        </div>
      </div>
    </div>
  );
};
