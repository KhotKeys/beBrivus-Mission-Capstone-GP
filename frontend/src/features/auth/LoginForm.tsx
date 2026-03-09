import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Card, CardHeader, CardBody } from "../../components/ui";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

type LoginFormData = yup.InferType<typeof schema>;

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupSuccess] = useState(
    Boolean(location.state && (location.state as { fromSignup?: boolean }).fromSignup)
  );
  const [sessionExpired] = useState(
    new URLSearchParams(location.search).get('session_expired') === 'true'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Reset form on component mount to clear any cached values
  useEffect(() => {
    reset({
      email: "",
      password: "",
    });
  }, [reset]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await login(data.email, data.password);
      const user = response.user;

      // Route based on user_type - strict role-based redirect
      if (user.user_type === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.user_type === 'institution') {
        navigate('/institution/opportunities', { replace: true });
      } else if (user.user_type === 'mentor') {
        navigate('/mentor-dashboard', { replace: true });
      } else {
        // Regular users (student, graduate, community_talent, professional)
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      // Handle different error formats from the backend
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.non_field_errors) {
        // Django REST Framework validation error
        const errors = err.response.data.non_field_errors;
        errorMessage = Array.isArray(errors) ? errors[0] : errors;
      } else if (err.response?.data?.password) {
        errorMessage = "Invalid password. Please try again.";
      } else if (err.response?.data?.email) {
        errorMessage = "Email not found. Please check and try again.";
      }
      
      setError(errorMessage);
      // Show popup alert
      window.alert(`❌ Login Failed\n\n${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="mx-auto my-4 rounded-lg flex items-center justify-center mb-4">
                <img
                  className="max-w-20"
                  src="/beBivus.png"
                  alt="beBrivus Logo"
                />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-secondary-900">
                {t('Sign In')}
              </h2>
              <p className="mt-2 text-sm text-secondary-600">
                {t('Don\'t have an account')}{" "}
                <Link
                  to="/register"
                  className="text-primary-600 hover:text-primary-500"
                >
                  {t('Sign Up')}
                </Link>
              </p>
            </div>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {sessionExpired && !error && (
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
                  <p className="text-warning-700 font-semibold text-sm">
                    ⏱ Your session has expired. Please log in again.
                  </p>
                </div>
              )}

              {signupSuccess && !error && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <p className="text-success-700 font-semibold text-sm">
                    ✓ Account created successfully. Please sign in.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-4 flex items-start gap-3">
                  <div className="text-error-600 font-bold text-lg leading-6">!</div>
                  <div>
                    <p className="text-error-700 font-semibold text-sm mb-1">Login Failed</p>
                    <p className="text-error-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <Input
                label={t('Email')}
                type="email"
                autoComplete="off"
                {...register("email")}
                error={errors.email?.message}
                placeholder={t('Email')}
              />

              <Input
                label={t('Password')}
                type="password"
                autoComplete="off"
                {...register("password")}
                error={errors.password?.message}
                placeholder={t('Password')}
              />

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-xs md:text-sm text-secondary-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-xs md:text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {t('Sign In')}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
