import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Card, CardHeader, CardBody } from "../../components/ui";
import {
  AFRICAN_COUNTRIES,
  saveRegistrationRecord,
} from "../../utils/registrationAnalytics";

const schema = yup.object({
  first_name: yup.string().trim().required("First name is required"),
  last_name: yup.string().trim().required("Last name is required"),
  username: yup.string().trim().required("Username is required"),
  email: yup.string().email("Invalid email format").required("Email is required").trim(),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Za-z]/, "Password must include at least one letter")
    .matches(/\d/, "Password must include at least one number")
    .required("Password is required"),
  password_confirm: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
  user_type: yup.string().required("Please select your role"),
  country: yup.string().required("Please select your country"),
});

type RegisterFormData = yup.InferType<typeof schema>;

export const RegisterForm: React.FC = () => {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>(
    {}
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    mode: "onBlur",
    defaultValues: {
      user_type: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError("");
      setBackendErrors({});
      await registerUser(data);

      if (data.user_type === "student" || data.user_type === "graduate") {
        saveRegistrationRecord({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          country: data.country,
          userType: data.user_type,
          createdAt: new Date().toISOString(),
        });
      }

      // Show success message
      window.alert("✅ Account Created Successfully!\n\nYour account has been created. Please sign in to continue.");
      
      // Redirect to login after successful registration
      navigate("/login", { state: { fromSignup: true } });
    } catch (err: any) {
      // Handle backend validation errors
      if (err.response?.data && typeof err.response.data === "object") {
        const errors = err.response.data;

        // Handle non-field errors (like password mismatch)
        if (errors.non_field_errors) {
          const errorMsg = Array.isArray(errors.non_field_errors) 
            ? errors.non_field_errors[0] 
            : errors.non_field_errors;
          setError(errorMsg);
          return;
        }

        // Check if it's a field-specific error object
        const hasFieldErrors = Object.keys(errors).some(
          (key) =>
            Array.isArray(errors[key]) ||
            (typeof errors[key] === "string" &&
              key !== "detail" &&
              key !== "message")
        );

        if (hasFieldErrors) {
          setBackendErrors(errors);

          // Also set form errors for individual fields
          Object.keys(errors).forEach((fieldName) => {
            const fieldErrors = errors[fieldName];
            const errorMessage = Array.isArray(fieldErrors)
              ? fieldErrors.join(", ")
              : fieldErrors;

            if (fieldName in data) {
              setFormError(fieldName as keyof RegisterFormData, {
                type: "manual",
                message: errorMessage,
              });
            }
          });
        } else {
          // Generic error message
          const errorMsg = errors.detail || errors.message || "Registration failed. Please try again.";
          setError(errorMsg);
        }
      } else if (err.response?.status === 400) {
        const errorMsg = "There were errors with your registration. Please check all fields are filled correctly.";
        setError(errorMsg);
      } else if (err.code === "ERR_NETWORK") {
        const errorMsg = "Network error. Please check your connection and try again.";
        setError(errorMsg);
      } else {
        const errorMsg = err.response?.data?.detail ||
            err.response?.data?.message ||
            "Registration failed. Please try again.";
        setError(errorMsg);
      }
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
              <h2 className="text-xl font-bold text-secondary-900">
                {t('Create account')}
              </h2>
              <p className="mt-2 text-sm text-secondary-600">
                {t('Already have an account')}{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-500"
                >
                  {t('Sign In')}
                </Link>
              </p>
            </div>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                  <p className="text-error-600 text-sm">{error}</p>
                </div>
              )}

              {Object.keys(backendErrors).length > 0 && !error && (
                <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-error-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-error-800">
                        There were errors with your submission:
                      </h3>
                      <div className="mt-2 text-sm text-error-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {Object.entries(backendErrors).map(
                            ([field, messages]) => (
                              <li key={field}>
                                <strong className="capitalize">
                                  {field.replace("_", " ")}:
                                </strong>{" "}
                                {Array.isArray(messages)
                                  ? messages.join(", ")
                                  : messages}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('First Name')}
                  {...register("first_name")}
                  error={errors.first_name?.message}
                  placeholder={t('First Name')}
                />
                <Input
                  label={t('Last Name')}
                  {...register("last_name")}
                  error={errors.last_name?.message}
                  placeholder={t('Last Name')}
                />
              </div>

              <Input
                label="Username"
                {...register("username")}
                error={errors.username?.message}
                placeholder="Username"
              />

              <Input
                label={t('Email')}
                type="email"
                {...register("email")}
                error={errors.email?.message}
                placeholder={t('Email')}
              />

              <div className="space-y-1">
                <label className="label">I am a</label>
                <select {...register("user_type")} className="input">
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="graduate">Graduate</option>
                  <option value="community_talent">Community Talent</option>
                  <option value="professional">Professional</option>
                </select>
                {errors.user_type && (
                  <p className="text-sm text-error-600">
                    {errors.user_type.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="label">Country</label>
                <select {...register("country")} className="input">
                  <option value="">Select your country</option>
                  {AFRICAN_COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-sm text-error-600">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <Input
                label={t('Password')}
                type="password"
                {...register("password")}
                error={errors.password?.message}
                placeholder={t('Password')}
                helperText="Use 8+ characters and avoid common passwords."
              />

              <Input
                label={t('Confirm Password')}
                type="password"
                {...register("password_confirm")}
                error={errors.password_confirm?.message}
                placeholder={t('Confirm Password')}
              />

              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label
                  htmlFor="agree-terms"
                  className="ml-2 block text-sm text-secondary-900"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms-of-service"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {t('Create account')}
              </Button>
              
              {Object.keys(errors).length > 0 && (
                <div className="text-center text-sm text-secondary-600">
                  Please fix the errors above before continuing.
                </div>
              )}
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
