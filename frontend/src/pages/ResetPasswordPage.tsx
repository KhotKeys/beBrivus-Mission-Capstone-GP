import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Input, Card, CardHeader, CardBody } from "../components/ui";
import apiClient from "../api/client";

const schema = yup.object({
  new_password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Please confirm your password"),
});

type ResetPasswordFormData = yup.InferType<typeof schema>;

export const ResetPasswordPage: React.FC = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError("");

      await apiClient.post(
        '/auth/password-reset-confirm/',
        {
          uid,
          token,
          new_password: data.new_password,
        }
      );

      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to reset password. The link may be invalid or expired."
      );
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
                Set new password
              </h2>
              <p className="mt-2 text-sm text-secondary-600">
                Enter your new password below.
              </p>
            </div>
          </CardHeader>

          <CardBody>
            {success ? (
              <div className="space-y-4">
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <p className="text-success-700 text-sm">
                    Your password has been reset successfully! Redirecting to login...
                  </p>
                </div>
                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                  >
                    Go to sign in now
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
                  label="New password"
                  type="password"
                  {...register("new_password")}
                  error={errors.new_password?.message}
                  placeholder="Enter new password"
                />

                <Input
                  label="Confirm new password"
                  type="password"
                  {...register("confirm_password")}
                  error={errors.confirm_password?.message}
                  placeholder="Confirm new password"
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Reset password
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-500 text-sm"
                  >
                    Back to sign in
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
