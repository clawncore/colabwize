import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/auth/FormInput";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  signInWithEmail,
  resendVerificationEmail,
} from "../../services/hybridAuth";

// List of allowed email domains
const ALLOWED_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
  "aol.com",
  "protonmail.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "live.com",
  "msn.com",
  "qq.com",
  "163.com",
  "126.com",
  "sina.com",
  "sohu.com",
  "edu.cn", // Educational institutions
  "ac.uk", // UK educational institutions
  "ac.in", // Indian educational institutions
  "edu.au", // Australian educational institutions
  "edu.ca", // Canadian educational institutions
  // Add more domains as needed
];

// Function to validate email domain
const isValidEmailDomain = (email: string): boolean => {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;

  // Check if domain is in allowed list
  return ALLOWED_DOMAINS.some(
    (allowedDomain) =>
      domain === allowedDomain || domain.endsWith("." + allowedDomain)
  );
};

const loginSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
  })
  .refine(
    (data) => {
      try {
        return isValidEmailDomain(data.email);
      } catch (error) {
        console.error("Error in email domain validation:", error);
        return true; // Allow validation to pass if there's an error
      }
    },
    {
      message:
        "Please use a valid email domain (gmail.com, outlook.com, yahoo.com, etc.)",
      path: ["email"],
    }
  );

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
  const [redirectPath, setRedirectPath] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const watchedFields = watch();

  // Get parameters from URL
  React.useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan) {
      setSelectedPlan(plan);
    }

    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectPath(redirect);
    }
  }, [searchParams]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    setIsEmailNotConfirmed(false);
    try {
      console.log("Attempting login with email:", data.email);
      console.log("Remember me option:", data.rememberMe);

      // Use Supabase authentication with remember me option
      const result = await signInWithEmail(
        data.email,
        data.password,
        data.rememberMe
      );

      if (result.user) {
        // Handle successful login
        console.log("Login successful", result);

        // Wait a bit for the auth state to propagate
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Determine redirect path
        let finalRedirectPath = redirectPath || "/dashboard";

        // If there's a selected plan, preserve it in the redirect
        if (selectedPlan && !finalRedirectPath.includes("?plan=")) {
          finalRedirectPath += finalRedirectPath.includes("?")
            ? `&plan=${selectedPlan}`
            : `?plan=${selectedPlan}`;
        }

        console.log("Redirecting to:", finalRedirectPath);
        // Use window.location for full page reload to ensure proper state reset
        window.location.href = finalRedirectPath;
      } else {
        throw new Error("Login failed");
      }
    } catch (error: any) {
      console.error("Login failed:", error);

      // Check if it's an email not confirmed error
      if (
        error.code === "EMAIL_NOT_CONFIRMED" ||
        (error.message &&
          error.message.toLowerCase().includes("email not confirmed"))
      ) {
        setIsEmailNotConfirmed(true);
        setError(
          `Email not confirmed for ${watchedFields.email || "your account"}. Please verify your email before signing in.`
        );
        // Do not auto-redirect; allow user to choose explicit verification action
      } else {
        if (error.code === "NETWORK_ERROR") {
          setError(
            "Unable to reach authentication service. Please check your internet connection, ensure your Supabase project is reachable, and try again."
          );
        } else {
          setError(
            error.message ||
              "Login failed. Please check your credentials and try again."
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const email = watchedFields.email;
      if (email) {
        // Use hybrid resend verification
        await resendVerificationEmail(email);

        setError(
          "Verification email resent successfully. Please check your inbox."
        );
      }
    } catch (error: any) {
      console.error("Resend verification failed:", error);
      setError(
        error.message ||
          "Failed to resend verification email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      {/* Error Message */}
      {error && (
        <div
          className={`rounded-lg p-3 ${isEmailNotConfirmed ? "bg-blue-900/50 border border-blue-800" : "bg-red-900/50 border border-red-800"}`}>
          <div className="flex items-start">
            <AlertCircle
              className={`h-5 w-5 mr-2 ${isEmailNotConfirmed ? "text-blue-300" : "text-red-300"}`}
            />
            <div className="flex-1">
              <p
                className={`text-sm ${isEmailNotConfirmed ? "text-blue-300" : "text-red-300"}`}>
                {error}
              </p>

              {/* Resend verification button for email not confirmed error */}
              {isEmailNotConfirmed && (
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                    className="bg-blue-800/50 border-blue-700 text-blue-100 hover:bg-blue-700/50">
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Resend Verification Email"
                    )}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="bg-blue-800/50 border-blue-700 text-blue-100 hover:bg-blue-700/50">
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(watchedFields.email || "")}&source=manual`}>
                      Verify Email Manually
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          success={
            !errors.email &&
            !!watchedFields.email &&
            watchedFields.email.length > 0
          }
          {...register("email")}
        />

        <FormInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          leftIcon={<Lock className="h-4 w-4" />}
          showPasswordToggle
          error={errors.password?.message}
          {...register("password")}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={watchedFields.rememberMe || false}
              onCheckedChange={(checked) =>
                setValue("rememberMe", checked as boolean)
              }
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
            <label
              htmlFor="rememberMe"
              className="text-sm text-gray-500 cursor-pointer">
              Remember me
            </label>
          </div>

          <Link
            to="/forgot-password"
            className="text-sm text-blue-400 hover:text-blue-300 font-medium">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-gray-500 font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          disabled={!isValid || isLoading}>
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center space-y-4">
        <p className="text-gray-500">
          Don't have an account?{" "}
          <Link
            to={{
              pathname: "/signup",
              search: `${selectedPlan ? `?plan=${selectedPlan}` : ""}${redirectPath ? `${selectedPlan ? "&" : "?"}redirect=${encodeURIComponent(redirectPath)}` : ""}`,
            }}
            className="text-blue-400 hover:text-blue-300 font-medium">
            Sign up
          </Link>
        </p>

        <p className="text-xs text-gray-400">
          By signing in, you agree to our{" "}
          <Link to="/legal/terms" className="text-blue-400 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/legal/privacy" className="text-blue-400 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
