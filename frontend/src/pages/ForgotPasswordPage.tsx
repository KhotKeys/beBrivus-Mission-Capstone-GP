import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Button, Input, Card, CardHeader, CardBody } from "../components/ui";
import apiClient from "../api/client";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
});

type ForgotPasswordFormData = yup.InferType<typeof schema>;

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError("");
      
      await apiClient.post(
        '/auth/password-reset/',
        { email: data.email }
      );
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
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
                  src="/beBivus.png"
                  alt="beBrivus Logo"
                  style={{
                    height: '40px',
                    width: 'auto',
                    maxHeight: '40px',
                    objectFit: 'contain'
                  }}
                />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-secondary-900">
                {t('Reset your password')}
              </h2>
              <p className="mt-2 text-sm text-secondary-600">
                {t('Reset password description')}
              </p>
            </div>
          </CardHeader>

          <CardBody>
            {success ? (
              <div className="space-y-4">
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <p className="text-success-700 text-sm">
                    If an account exists with this email, you will receive a password reset link shortly. Please check your inbox.
                  </p>
                </div>
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    Return to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                    <p className="text-error-600 text-sm">{error}</p>
                  </div>
                )}

                <Input
                  label={t('Email address')}
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                  placeholder={t('Enter your email')}
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {t('Send reset link')}
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-500 text-sm"
                  >
                    {t('Back to sign in')}
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
