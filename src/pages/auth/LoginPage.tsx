import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams } from "react-router-dom";
import { Mail, Lock, AlertCircle, Smartphone, Shield } from "lucide-react";
import { motion } from "framer-motion";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/auth/FormInput";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  signInWithEmail,
  resendVerificationEmail,
  signUpWithGoogle,
} from "../../services/hybridAuth";
import authService from "../../services/authService";

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
  const [socialLoading, setSocialLoading] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = React.useState(false);
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
  const [redirectPath, setRedirectPath] = React.useState<string | null>(null);
  const [is2FARequired, setIs2FARequired] = React.useState(false);
  const [userIdFor2FA, setUserIdFor2FA] = React.useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = React.useState(0);
  const [isRecoveryMode, setIsRecoveryMode] = React.useState(false);

  // Prevent duplicate submissions using ref
  const isSubmittingRef = React.useRef(false);

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

    // Check for 2FA requirement (e.g. from Google Callback)
    const requires2fa = searchParams.get("requires_2fa") === "true";
    const userId = searchParams.get("userId");
    const provider = searchParams.get("provider");

    if (requires2fa && userId) {
      setIs2FARequired(true);
      setUserIdFor2FA(userId);

      // If provider is specified (e.g. google), we can store it or just use it in the submit handler
      // For now, let's store it in a ref or state if needed, or implied by logic?
      // Let's store it in localStorage to be safe for apiClient immediately
      if (provider) {
        localStorage.setItem("auth_provider", provider);
      }
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setSocialLoading(true);
    try {
      const redirectParams = {
        plan: selectedPlan || undefined,
        redirect: redirectPath || undefined,
      };
      await signUpWithGoogle(redirectParams);
    } catch (error: any) {
      console.error("Google login failed:", error);
      setError("Google login failed. Please try again.");
      setSocialLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current) {
      console.log("Login already in progress, ignoring duplicate submission");
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);
    setIsEmailNotConfirmed(false);

    try {
      console.log("Attempting login with email:", data.email);
      console.log("Remember me option:", data.rememberMe);

      const startTime = performance.now(); // Start timer

      // Use Supabase authentication with remember me option
      const result = await signInWithEmail(
        data.email,
        data.password,
        data.rememberMe
      );

      const endTime = performance.now(); // End timer
      const duration = endTime - startTime;
      console.log(`Login completed in ${duration.toFixed(2)}ms`);

      if (duration > 3000) {
        console.warn(`⚠️ Login took longer than 3000ms (${duration.toFixed(2)}ms) - investigating slowness...`);
      }

      if (result.user) {
        // Handle successful login directly
        await handleLoginSuccess(redirectPath, selectedPlan);
      } else if (result.requires_2fa && result.userId) {
        // Handle 2FA Challenge
        setIs2FARequired(true);
        setUserIdFor2FA(result.userId);
        isSubmittingRef.current = false; // Reset for 2FA form
        setIsLoading(false);
        // We stay on the page but switch to 2FA form
      } else {
        throw new Error("Login failed");
      }
    } catch (error: any) {
      console.error("Login failed:", error);

      // Log full error details for debugging
      console.group("Login Error Details");
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      console.error("Stack:", error.stack);
      console.table(error);
      console.groupEnd();

      // Check if it's an AbortError from duplicate submission
      if (error.name === "AbortError") {
        console.log("Login request was aborted (likely duplicate submission)");
        // Don't show error to user, just reset state
        isSubmittingRef.current = false;
        setIsLoading(false);
        return;
      }

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
            "Unable to reach authentication service. Please check your internet connection and try again."
          );
        } else {
          setError(
            error.message ||
            "Login failed. Please check your credentials and try again."
          );
        }
      }
    } finally {
      if (!error && !isEmailNotConfirmed) {
        // Store auth provider for apiClient to use
        localStorage.setItem("auth_provider", "organic");
      }
      isSubmittingRef.current = false;
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

  const handleLoginSuccess = async (redirect: string | null, plan: string | null) => {
    // Wait a bit for the auth state to propagate
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Determine redirect path
    let finalRedirectPath = redirect || "/dashboard";

    // If there's a selected plan, preserve it in the redirect
    if (plan && !finalRedirectPath.includes("?plan=")) {
      finalRedirectPath += finalRedirectPath.includes("?")
        ? `&plan=${plan}`
        : `?plan=${plan}`;
    }

    console.log("Redirecting to:", finalRedirectPath);
    // Use window.location for full page reload to ensure proper state reset
    window.location.href = finalRedirectPath;
  };

  const handle2FASubmit = async (otp: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!userIdFor2FA) throw new Error("Session invalid");

      // Determine method based on stored provider or context
      const provider = localStorage.getItem("auth_provider");
      let result;

      if (provider === "google") {
        result = await authService.verify2FAGoogle(userIdFor2FA, otp);
      } else {
        result = await authService.verify2FAOrganic(userIdFor2FA, otp);
      }

      if (result.success) {
        await handleLoginSuccess(redirectPath, selectedPlan);
      } else {
        setFailedAttempts((prev) => prev + 1);
        setError(result.message || "Invalid authentication code");
      }
    } catch (err: any) {
      setFailedAttempts((prev) => prev + 1);
      setError(err.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // 2FA Form Render
  if (is2FARequired) {
    return (
      <AuthLayout title="Two-Factor Authentication" subtitle="Enter the code from your app">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="relative w-32 h-32 flex items-center justify-center mb-4">
            <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-2xl"></div>

            {/* Mobile bouncing/floating */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="relative z-10 flex items-center justify-center"
            >
              <Smartphone className="w-24 h-24 text-blue-600" strokeWidth={1} />

              {/* Screen glow effect */}
              <div className="absolute inset-0 bg-blue-400/5 rounded-3xl blur-sm transform scale-x-75 scale-y-90"></div>

              {/* Shield appearing inside screen */}
              <motion.div
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1.2, 1, 0.5]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  times: [0, 0.2, 0.8, 1],
                  ease: "easeInOut"
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white p-1.5 rounded-full shadow-lg">
                  <Shield className="w-5 h-5 text-green-500 fill-green-100" />
                </div>
              </motion.div>
            </motion.div>
          </div>
          <p className="text-sm text-gray-500 text-center max-w-xs">
            {isRecoveryMode
              ? "Please enter one of your 8-character recovery codes."
              : "Your account is protected with 2FA. Please enter the verification code from your authenticator app."}
          </p>
        </div>

        {error && (
          <div className="rounded-lg p-3 bg-red-50 border border-red-200 mb-6 slide-in-from-top-2 animate-in fade-in duration-300">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block text-center">
              {isRecoveryMode ? "Recovery Code" : "Authentication Code"}
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={isRecoveryMode ? 10 : 6}
                placeholder={isRecoveryMode ? "xxxxxxxx" : "000000"}
                autoFocus
                className={`w-full h-14 text-center ${isRecoveryMode ? "text-xl tracking-widest" : "text-3xl tracking-[0.5em]"} font-bold text-gray-800 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-200`}
                onChange={(e) => {
                  const val = e.target.value.replace(
                    isRecoveryMode ? /[^a-zA-Z0-9]/g : /[^0-9]/g,
                    ""
                  );
                  e.target.value = val;
                  if (
                    (!isRecoveryMode && val.length === 6) ||
                    (isRecoveryMode && val.length === 8)
                  ) {
                    handle2FASubmit(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = (e.currentTarget as HTMLInputElement).value;
                    if (val.length >= 6) handle2FASubmit(val);
                  }
                }}
              />
            </div>
            {!isRecoveryMode && failedAttempts >= 3 && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(true);
                    setError(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Use a recovery code
                </button>
              </div>
            )}
            {isRecoveryMode && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecoveryMode(false);
                    setError(null);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Use authenticator app
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={() => setIs2FARequired(false)} // Cancel/Back
              className="w-full h-11 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium shadow-sm transition-colors"
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={() => {
                const input = document.querySelector(
                  'input[type="text"]'
                ) as HTMLInputElement;
                if (input && input.value.length >= 6)
                  handle2FASubmit(input.value);
              }}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      {/* Error Message */}
      {error && (
        <div
          className={`rounded-lg p-3 ${isEmailNotConfirmed ? "bg-blue-50 border border-blue-200" : "bg-red-50 border border-red-200"}`}>
          <div className="flex items-start">
            <AlertCircle
              className={`h-5 w-5 mr-2 ${isEmailNotConfirmed ? "text-blue-600" : "text-red-600"}`}
            />
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${isEmailNotConfirmed ? "text-blue-800" : "text-red-800"}`}>
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

      {/* Social Login */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={socialLoading || isLoading}
          className="flex items-center justify-center gap-2 h-12 bg-white text-gray-900 border-gray-300 hover:bg-gray-100 font-medium transition-all"
        >
          {socialLoading ? (
            <div className="h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.58 22.56 12.25Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.64 12 18.64C9.14 18.64 6.71 16.69 5.84 14.09H2.18V16.96C4 20.53 7.7 23 12 23Z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09C5.62 13.44 5.49 12.74 5.49 12C5.49 11.26 5.62 10.56 5.84 9.91V7.04H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.96L5.84 14.09Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.36C13.62 5.36 15.06 5.93 16.21 7.04L19.36 4.04C17.45 2.24 14.97 1 12 1C7.7 1 4 3.47 2.18 7.04L5.84 9.91C6.71 7.31 9.14 5.36 12 5.36Z"
                  fill="#EA4335"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </Button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-500 bg-white">Or continue with email</span>
        </div>
      </div>

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
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
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
