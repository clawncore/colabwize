import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import FormInput from "../../components/auth/FormInput";
import PasswordStrength from "../../components/auth/PasswordStrength";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import OTPInput from "../../components/auth/OTPInput";
import SurveyForm from "../../components/auth/SurveyForm";
import { supabase } from "../../lib/supabase/client";
import {
  signUpWithEmail as hybridSignUpWithEmail,
  verifyOTP as hybridVerifyOTP,
  signInWithEmail,
  signUpWithGoogle,
  signUpWithMicrosoft,
} from "../../services/hybridAuth";
import { SubscriptionService } from "../../services/subscriptionService";
import { useToast } from "../../hooks/use-toast";
import ConfigService from "../../services/ConfigService";

// API base URL - adjust this to match your backend URL
const API_BASE_URL = ConfigService.getApiUrl();

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
  "ac.in", // Indian educational institutions
  "ac.uk", // UK educational institutions
  "edu.au", // Australian educational institutions
  "edu.ca", // Canadian educational institutions
  // Add more domains as needed
];

// List of country codes with unique keys

// Timeout wrapper for fetch requests
const fetchWithTimeout = (
  url: string,
  options: RequestInit = {},
  timeout = 60000
): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(
        () => reject(new Error("Request timeout after " + timeout + "ms")),
        timeout
      )
    ),
  ]) as Promise<Response>;
};

// Function to validate email domain
const isValidEmailDomain = (email: string): boolean => {
  try {
    const domain = email.split("@")[1]?.toLowerCase();
    if (!domain) return false;

    // Check if domain is in allowed list
    return ALLOWED_DOMAINS.some(
      (allowedDomain) =>
        domain === allowedDomain || domain.endsWith("." + allowedDomain)
    );
  } catch (error) {
    console.error("Error validating email domain:", error);
    return false; // Return false instead of true to properly reject invalid emails
  }
};

const signupSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Please enter a valid email address"),
    countryCode: z.string().optional(),
    phoneNumber: z.string().optional(),
    otpMethod: z.union([z.literal("sms"), z.literal("email")]), // Default handled by useForm
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ), // Add this line for special characters (adjust as needed)
    confirmPassword: z.string(),
    fieldOfStudy: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
    // OTP fields
    otp: z.string().optional(), // Make otp optional since it's only used in OTP step
    otpVerified: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // Only validate domain if email exists
      if (!data.email) return true;
      try {
        return isValidEmailDomain(data.email);
      } catch (error) {
        console.error("Error in email domain validation:", error);
        return false; // Properly reject if there's an error
      }
    },
    {
      message:
        "Please use a valid email domain (gmail.com, outlook.com, yahoo.com, etc.)",
      path: ["email"],
    }
  );

type SignupFormData = z.infer<typeof signupSchema>;

const SignupPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showOtpStep, setShowOtpStep] = React.useState(false);
  const [showSurveyStep, setShowSurveyStep] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState<string | null>(null);
  const [affiliateRef, setAffiliateRef] = React.useState<string | null>(null);
  const [redirectPath, setRedirectPath] = React.useState<string | null>(null);


  // Add state for validation errors
  const [validationErrors, setValidationErrors] = React.useState<{
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  }>({});
  // Add state for validation loading
  const [validating, setValidating] = React.useState<{
    fullName?: boolean;
    email?: boolean;
    phoneNumber?: boolean;
  }>({});

  // Add state for social signup
  const [socialLoading, setSocialLoading] = React.useState(false);
  // Add debounce timer ref
  const validationTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    setError,
    clearErrors,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched", // Change from "onChange" to "onTouched" to only validate after user interacts with field
    defaultValues: {
      agreeToTerms: false,
      otpMethod: "email",
    },
  });

  const watchedFields = watch();

  // Check for OAuth callback data when component mounts
  React.useEffect(() => {
    const oauthParam = searchParams.get("oauth");
    const oauthUserDataStr = sessionStorage.getItem("oauthUserData");

    if (oauthParam === "true" && oauthUserDataStr) {
      try {
        const oauthUserData = JSON.parse(oauthUserDataStr);

        // Set the user ID from OAuth data
        setUserId(oauthUserData.id);

        // Now we need to register the OAuth user in the database and send OTP
        // This ensures the user is registered in both Supabase Auth and our database
        const registerOAuthUser = async () => {
          try {
            setIsLoading(true);

            const response = await fetch(
              `${API_BASE_URL}/api/auth/hybrid/oauth-signup`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id: oauthUserData.id,
                  email: oauthUserData.email,
                  fullName: oauthUserData.fullName,
                  provider: oauthUserData.provider,
                }),
              }
            );

            const result = await response.json();

            if (response.ok && result.success) {
              console.log("OAuth user registered successfully, OTP sent");
              // Set the user ID and proceed to OTP verification
              setUserId(oauthUserData.id);
              setShowOtpStep(true);
            } else {
              throw new Error(
                result.message || "Failed to register OAuth user"
              );
            }
          } catch (error: any) {
            console.error("Error registering OAuth user:", error);
            // Set an error that can be displayed to the user
            setError("root", {
              message:
                error.message ||
                "Failed to complete OAuth signup. Please try again.",
            });
          } finally {
            setIsLoading(false);
          }
        };

        registerOAuthUser();

        // Clear the session storage to prevent reuse
        sessionStorage.removeItem("oauthUserData");

        console.log("OAuth user data detected, proceeding to OTP verification");
      } catch (error) {
        console.error("Error parsing OAuth user data:", error);
      }
    }
  }, [searchParams, setError]);

  // Check if user has a session but needs to complete signup (for OAuth users)
  React.useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // If user has a session but we don't have userId set and we're not in an OAuth flow
        if (session && !userId && !searchParams.get("oauth")) {
          // Check if user exists in our database
          const response = await fetch(
            `${API_BASE_URL}/api/auth/hybrid/check-email`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: session.user.email }),
            }
          );

          const result = await response.json();

          if (result.success && result.exists && result.confirmed) {
            // User exists in database and is confirmed, redirect to dashboard
            const redirectPath = searchParams.get("redirect") || "/dashboard";
            navigate(redirectPath);
          } else {
            // User exists in auth but not in database or not confirmed
            // This might be an OAuth signup that needs to complete the flow
            // Set the userId and potentially show OTP step
            setUserId(session.user.id);

            // For OAuth users who have auth session but need to complete signup,
            // we should show the OTP verification step
            if (!showOtpStep) {
              setShowOtpStep(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    checkSessionAndRedirect();
  }, [userId, showOtpStep, searchParams, navigate]);

  // Get parameters from URL
  React.useEffect(() => {
    const plan = searchParams.get("plan");
    if (plan) {
      setSelectedPlan(plan);
    }

    const ref = searchParams.get("ref");
    if (ref) {
      setAffiliateRef(ref);
    }

    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectPath(redirect);
    }

    // Check if this is a checkout flow
    const checkout = searchParams.get("checkout");
    if (checkout === "true") {
      // This will be handled in the form submission
    }
  }, [searchParams]);

  // Initialize recaptcha verifier
  React.useEffect(() => {
    console.log("Initializing recaptcha verifier, Supabase status:", {
      hasSupabase: typeof supabase !== "undefined" && supabase !== null,
    });

    // For Supabase, phone authentication is not directly supported
    // We'll skip recaptcha verifier initialization
    console.log(
      "Supabase does not support phone authentication directly, skipping recaptcha verifier initialization"
    );
  }, []);



  // Custom register function that clears validation errors when field changes
  const registerWithValidationClear = (name: any) => {
    const fieldRegistration = register(name);

    return {
      ...fieldRegistration,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        // Call the original onChange if it exists
        fieldRegistration.onChange(e);

        // Clear validation errors for this field
        clearErrors(name);

        // Also trigger validation if needed
        validateUserDetails(name, e.target.value);
      },
    };
  };

  // Function to validate user details in real-time
  const validateUserDetails = React.useCallback(
    async (field: string, value: string) => {
      // Clear any existing timer
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }

      // Don't validate empty fields
      if (!value) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof typeof newErrors];
          return newErrors;
        });
        return;
      }

      // Set validating state
      setValidating((prev) => ({ ...prev, [field]: true }));

      try {
        // Prepare validation data
        const validationData: { [key: string]: string } = {};
        if (field === "fullName") validationData.fullName = value;
        if (field === "email") validationData.email = value;

        // Call validation API with timeout
        const response = await fetchWithTimeout(
          `${API_BASE_URL}/api/auth/validate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(validationData),
          }
        );

        const result = await response.json();

        if (response.ok && result.success && result.validationResults) {
          const { validationResults } = result;

          // Update validation errors based on results
          setValidationErrors((prev) => {
            const newErrors = { ...prev };

            if (field === "fullName" && validationResults.fullNameExists) {
              newErrors.fullName =
                validationResults.message || "This name is already registered";
            } else if (
              field === "fullName" &&
              !validationResults.fullNameExists
            ) {
              delete newErrors.fullName;
            }

            if (field === "email" && validationResults.emailExists) {
              newErrors.email =
                validationResults.message || "This email is already registered";
            } else if (field === "email" && !validationResults.emailExists) {
              delete newErrors.email;
            }

            return newErrors;
          });
        } else if (!response.ok) {
          // Handle HTTP errors (like 500 Internal Server Error)
          console.error("Validation API error:", {
            status: response.status,
            statusText: response.statusText,
            result,
          });
          // Clear validation error for this field on server error
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field as keyof typeof newErrors];
            return newErrors;
          });
        }
      } catch (error: unknown) {
        console.error("Validation error:", error);
        // Clear validation error for this field on error
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as keyof typeof newErrors];
          return newErrors;
        });
      } finally {
        setValidating((prev) => ({ ...prev, [field]: false }));
      }
    },
    []
  ); // Remove API_BASE_URL as it's a constant

  // Debounced validation effect
  const { fullName, email } = watchedFields;
  React.useEffect(() => {
    // Clear any existing timer
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Set a new timer to debounce validation
    validationTimerRef.current = setTimeout(() => {
      // Validate fields that have values
      if (fullName) {
        validateUserDetails("fullName", fullName);
      }

      if (email) {
        validateUserDetails("email", email);
      }
    }, 500); // 500ms debounce

    // Return cleanup function
    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fullName,
    email,
    validateUserDetails,
  ]);

  const passwordValue = watch("password");
  const otpMethod = watch("otpMethod");

  // Function to complete signup
  const completeSignup = async (data: SignupFormData) => {
    // Log the supabase object for debugging
    console.log("Supabase object in completeSignup:", {
      supabase,
      hasSupabase: typeof supabase !== "undefined" && supabase !== null,
    });
    try {
      // Combine country code and phone number
      console.log("Attempting signup with data:", {
        email: data.email,
        fullName: data.fullName,
        otpMethod: data.otpMethod,
        selectedPlan: selectedPlan,
      });

      // Check if Supabase is configured and use hybrid approach
      console.log("Supabase configuration check:", {
        hasSupabase: typeof supabase !== "undefined" && supabase !== null,
      });

      // Check if this is a checkout flow
      const isCheckoutFlow = searchParams.get("checkout") === "true";

      if (isCheckoutFlow && selectedPlan) {
        // For checkout flow, first create a checkout session
        try {
          const checkoutUrl = await SubscriptionService.createCheckout(
            selectedPlan as string
          );

          if (checkoutUrl) {
            // Store user data in localStorage for post-checkout processing
            localStorage.setItem(
              "pendingCheckoutUser",
              JSON.stringify({
                email: data.email,
                fullName: data.fullName,
                otpMethod: data.otpMethod,
                selectedPlan: selectedPlan,
              })
            );

            // Redirect to checkout
            window.location.href = checkoutUrl;
            return;
          } else {
            throw new Error("Failed to create checkout session");
          }
        } catch (checkoutError: any) {
          console.error("Checkout creation failed:", checkoutError);
          throw new Error(
            `Checkout failed: ${checkoutError.message || "Unknown error"}`
          );
        }
      }

      // Instead of using Supabase's signup directly, we'll use hybrid approach
      // For both email and phone signup, we'll use the same approach
      try {
        // First, create user in Supabase Authentication
        const result = await hybridSignUpWithEmail(data.email, data.password, {
          full_name: data.fullName,
          phone_number: "",
          otp_method: data.otpMethod,
          field_of_study: data.fieldOfStudy,
          selected_plan: selectedPlan || "free",
          affiliate_ref: affiliateRef,
        });

        // Store the user ID for OTP verification
        const newUserId = result.user ? result.user.id : null;
        if (newUserId) {
          setUserId(newUserId);
          const otpSent = (result as any).otpSent || false;
          const needsVerification = (result as any).needsVerification || false;

          // Update state

          return {
            success: true,
            userId: newUserId,
            otpSent: otpSent,
            needsVerification: needsVerification,
          };
        } else {
          throw new Error("Failed to get user ID from signup result");
        }
      } catch (error: any) {
        console.error("Signup failed:", error);
        throw new Error(`Signup failed: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to create account:", error);
      throw error;
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    console.log("onSubmit called with step:", {
      showOtpStep,
      data,
      userId,
    });

    // Handle each step separately
    if (!showOtpStep) {
      // First step: Create user account
      console.log("Processing signup step");

      // Check for validation errors before proceeding with signup
      if (Object.keys(validationErrors).length > 0) {
        setError("root", {
          message: "Please fix the highlighted errors before continuing.",
        });
        return;
      }

      setIsLoading(true);
      try {
        // Create user account first
        const signupResult = await completeSignup(data);
        console.log("Signup completed:", signupResult);

        // Ensure userId is set before proceeding
        let finalUserId = (signupResult as any).userId;
        if (!finalUserId) {
          // If we don't have a userId but the signup was successful,
          // check if we can get it from the data
          let userIdFromData = null;

          // Try different possible locations for userId
          if (data && typeof data === "object") {
            if ("id" in data) userIdFromData = data.id;
            else if (
              "user" in data &&
              data.user &&
              typeof data.user === "object" &&
              "id" in data.user
            ) {
              userIdFromData = data.user.id;
            }
          }

          if (userIdFromData) {
            finalUserId = userIdFromData;
            setUserId(finalUserId);
          } else {
            throw new Error("User ID not received from signup");
          }
        } else {
          // Update userId state if it's different
          if (finalUserId !== userId) {
            setUserId(finalUserId);
          }
        }

        // Check if OTP was already sent by the backend during signup
        const otpAlreadySent = (signupResult as any).otpSent || false;
        const needsVerification =
          (signupResult as any).needsVerification || false;

        // Always go to OTP verification step if OTP was sent or if verification is needed
        if (otpAlreadySent || needsVerification) {
          console.log(
            "OTP sent or verification needed, moving to OTP verification step"
          );
          setShowOtpStep(true);
        } else {
          // Should not happen for email signup with confirmation enabled
          console.log("Signup successful, but no OTP needed?");
          setShowOtpStep(true);
        }
      } catch (error: unknown) {
        console.error("Signup failed:", error);
        // Check if it's the "already registered" error
        if (
          error instanceof Error &&
          (error.message.includes("already registered") ||
            error.message.includes("already exists") ||
            error.message.includes("already signed up") ||
            error.message.includes("already registered") ||
            error.message.includes("A user with this"))
        ) {
          // This is an informational message, not an error
          toast({
            title: "Account Already Exists",
            description:
              error.message +
              "\n\nIf you already have an account, please sign in instead.",
          });
          // Optionally, you could redirect to login or handle differently
        } else {
          setError("root", {
            message:
              error instanceof Error
                ? error.message
                : "Failed to create account. Please try again or contact support if the problem persists.",
          });
        }
      } finally {
        setIsLoading(false);
      }
      return; // Important: return here to prevent executing the next steps
    }

    if (showOtpStep) {
      // Second step: Verify OTP
      console.log("Processing OTP verification step");
      setIsLoading(true);
      try {
        // The verifyOTP function returns true on success or throws on error
        // Now requires email and OTP
        await verifyOTP(data.email, data.otp || "");
        console.log("OTP verified, signing in user...");

        // Sign in user to allow survey submission (establishes Supabase session)
        try {
          await signInWithEmail(data.email, data.password);
          console.log("User signed in successfully");
        } catch (loginError) {
          console.error("Auto-login failed:", loginError);
          // We continue anyway, hoping the survey might work or user can sign in later
          // But realistically survey submission will fail without auth
        }

        setShowOtpStep(false);
        // After OTP verification, show survey step
        setShowSurveyStep(true);
      } catch (error: unknown) {
        console.error("Failed to verify OTP:", error);
        setError("otp", {
          message: error instanceof Error ? error.message : "Invalid OTP code",
        });
      } finally {
        setIsLoading(false);
      }
      return; // Important: return here to prevent executing the next steps
    }

    if (showSurveyStep) {
      // Third step: Survey completion - this is handled by the SurveyForm component
      // The SurveyForm will call onSuccess when completed, which will trigger navigation
      // This step is just a placeholder since SurveyForm handles its own submission
    }
  };

  const handleBackToSignup = () => {
    if (showSurveyStep) {
      // If on survey step, go back to OTP step
      setShowSurveyStep(false);
    } else if (showOtpStep) {
      // If on OTP step, go back to signup step
      setShowOtpStep(false);
    }
    // If on signup step, there's no previous step to go back to
  };

  const handleSurveyComplete = () => {
    // After survey completion, redirect to the intended destination
    const finalRedirectPath = redirectPath || "/dashboard";
    navigate(finalRedirectPath);
  };

  // Function to resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      // Get the current form data
      const currentData = {
        fullName: watchedFields.fullName || "",
        email: watchedFields.email || "",
        phoneNumber: watchedFields.phoneNumber || "",
        otpMethod: watchedFields.otpMethod || "email",
        password: watchedFields.password || "",
        confirmPassword: watchedFields.confirmPassword || "",
        agreeToTerms: watchedFields.agreeToTerms || false,
        fieldOfStudy: watchedFields.fieldOfStudy || "",
      } as SignupFormData;

      // Combine country code and phone number for SMS
      // Only add country code if phone number doesn't already start with +
      const fullPhoneNumber = "";

      // Make sure we have a userId
      if (!userId) {
        throw new Error(
          "User ID not available. Please restart the signup process."
        );
      }

      await sendOTP(
        {
          ...currentData,
          phoneNumber: fullPhoneNumber,
        } as SignupFormData,
        userId
      );
      console.log("OTP resent successfully");
    } catch (error: unknown) {
      console.error("Failed to resend OTP:", error);
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to resend OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to send OTP (now uses client-side Supabase resend)
  const sendOTP = async (data: SignupFormData, userIdParam?: string) => {
    try {
      console.log("Sending OTP to:", data.email);

      // Use the service function which wraps supabase.auth.resend
      const result = await resendVerificationEmail(data.email);

      if (result.success) {
        console.log("OTP sent successfully via Supabase");
        return true;
      } else {
        throw new Error(result.message || "Failed to send OTP");
      }
    } catch (error: unknown) {
      console.error("Failed to send OTP:", error);
      // Re-throw the error so it can be handled by the calling function
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  // Function to verify OTP - Signature updated for Supabase
  const verifyOTP = async (email: string, otp: string) => {
    try {
      if (!email) {
        const error = new Error("Email is required to verify OTP");
        console.error("OTP verify error:", error.message);
        throw error;
      }

      if (!otp) {
        const error = new Error("OTP is required");
        console.error("OTP verify error:", error.message);
        throw error;
      }

      console.log("Verifying OTP:", { email, otp });

      // Use the hybrid OTP verification function (now calls Supabase)
      const result = await hybridVerifyOTP(email, otp);

      if (result.success) {
        console.log("OTP verified successfully");
        return true;
      } else {
        const errorMessage = result.message || "Failed to verify OTP";
        console.error("OTP verify failed:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: unknown) {
      console.error("Failed to verify OTP:", error);
      setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Failed to verify OTP. Please try again.",
      });
      // Re-throw the error so the calling function can handle it properly
      throw error;
    }
  };

  // Function to handle Google signup
  const handleGoogleSignup = async () => {
    setSocialLoading(true);
    try {
      // Prepare redirect parameters if needed
      const redirectParams = {
        plan: selectedPlan || undefined,
        redirect: redirectPath || undefined,
      };

      // Call the hybrid auth function to initiate Google signup
      await signUpWithGoogle(redirectParams);

      // The function will redirect to Google OAuth, so no further action needed here
      console.log("Google signup initiated");
    } catch (error: any) {
      console.error("Google signup failed:", error);
      setError("root", {
        message: error.message || "Google signup failed. Please try again.",
      });
      setSocialLoading(false);
    }
  };

  // Function to handle Microsoft signup
  const handleMicrosoftSignup = async () => {
    setSocialLoading(true);
    try {
      // Prepare redirect parameters if needed
      const redirectParams = {
        plan: selectedPlan || undefined,
        redirect: redirectPath || undefined,
      };

      // Call the hybrid auth function to initiate Microsoft signup
      await signUpWithMicrosoft(redirectParams);

      // The function will redirect to Microsoft OAuth, so no further action needed here
      console.log("Microsoft signup initiated");
    } catch (error: any) {
      console.error("Microsoft signup failed:", error);
      setError("root", {
        message: error.message || "Microsoft signup failed. Please try again.",
      });
      setSocialLoading(false);
    }
  };

  return (
    <AuthLayout
      title={
        showOtpStep
          ? "Verify Your Account"
          : showSurveyStep
            ? "Tell Us About Yourself"
            : selectedPlan
              ? `Sign up for ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} Plan`
              : "Create your account"
      }
      subtitle={
        showOtpStep
          ? `We've sent a code to your ${otpMethod === "sms" ? "phone number" : "email"}`
          : showSurveyStep
            ? "Help us personalize your ColabWize experience"
            : selectedPlan
              ? `Start your journey with our ${selectedPlan} plan`
              : "Start writing better papers today"
      }>
      {/* Recaptcha container - invisible */}
      <div
        id="recaptcha-container"
        className="hidden"
        style={{ position: "absolute", top: "-100px" }}></div>

      {/* Registration Form */}
      {!showSurveyStep && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error message */}
          {errors.root && (
            <div className="text-red-400 text-sm py-2">
              {errors.root.message}
            </div>
          )}

          {!showOtpStep && (
            <>
              {/* Social Signup Buttons - Re-enabled */}
              <div className="grid grid-cols-2 gap-3 hidden">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignup}
                  disabled={socialLoading || isLoading}
                  className="flex items-center justify-center gap-2 h-12 bg-white text-gray-900 border-gray-300 hover:bg-gray-100">
                  {socialLoading ? (
                    <div className="h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none">
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
                      <span className="text-gray-900">Google</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMicrosoftSignup}
                  disabled={socialLoading || isLoading}
                  className="flex items-center justify-center gap-2 h-12 bg-blue-600 text-gray-500 border-blue-700 hover:bg-blue-700">
                  {socialLoading ? (
                    <div className="h-5 w-5 border-2 bg-gray-50 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none">
                        <path
                          d="M11.4 24h12.6v-12.6h-12.6v12.6z"
                          fill="#f25022"
                        />
                        <path d="M0 24h12.6v-12.6h-12.6v12.6z" fill="#7fba00" />
                        <path
                          d="M11.4 12.6h12.6v-12.6h-12.6v12.6z"
                          fill="#ffb900"
                        />
                        <path
                          d="M0 12.6h12.6v-12.6h-12.6v12.6z"
                          fill="#00a4ef"
                        />
                      </svg>
                      <span>Microsoft</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="relative my-6 hidden">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t bg-gray-50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-500 bg-white rounded-full">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Full Name Input */}
              <FormInput
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                leftIcon={<User className="h-4 w-4" />}
                error={
                  watchedFields.fullName !== undefined &&
                    watchedFields.fullName !== ""
                    ? errors.fullName?.message || validationErrors.fullName
                    : undefined
                }
                success={
                  !errors.fullName &&
                  !validationErrors.fullName &&
                  !!watchedFields.fullName &&
                  watchedFields.fullName.length > 0
                }
                loading={validating.fullName}
                {...registerWithValidationClear("fullName")}
                className="bg-gray-50 text-gray-500 placeholder-gray-500"
              />

              <FormInput
                label="Email"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={
                  watchedFields.email !== undefined &&
                    watchedFields.email !== ""
                    ? errors.email?.message || validationErrors.email
                    : undefined
                }
                success={
                  !errors.email &&
                  !validationErrors.email &&
                  !!watchedFields.email &&
                  watchedFields.email.length > 0
                }
                loading={validating.email}
                {...registerWithValidationClear("email")}
                className="bg-gray-50 text-gray-500 placeholder-gray-500"
              />

              <div>
                <FormInput
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  showPasswordToggle
                  error={
                    watchedFields.password !== undefined &&
                      watchedFields.password !== ""
                      ? errors.password?.message
                      : undefined
                  }
                  {...register("password")}
                  className="bg-gray-50 text-gray-500 placeholder-gray-500"
                />
                {passwordValue && (
                  <div className="mt-3">
                    <PasswordStrength password={passwordValue} />
                  </div>
                )}
              </div>

              <FormInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                leftIcon={<Lock className="h-4 w-4" />}
                showPasswordToggle
                error={
                  watchedFields.confirmPassword !== undefined &&
                    watchedFields.confirmPassword !== ""
                    ? errors.confirmPassword?.message
                    : undefined
                }
                success={
                  !errors.confirmPassword &&
                  !!watchedFields.confirmPassword &&
                  watchedFields.confirmPassword === watchedFields.password &&
                  !!watchedFields.password &&
                  watchedFields.password.length > 0
                }
                {...register("confirmPassword")}
                className="bg-gray-50 text-gray-500 placeholder-gray-500"
              />

              {/* Optional Fields */}
              <div className="space-y-4 pt-2">
                <FormInput
                  label="Field of study (optional)"
                  type="text"
                  placeholder="e.g. Computer Science, Psychology, etc."
                  {...register("fieldOfStudy")}
                  className="bg-gray-50 text-gray-500 placeholder-gray-500"
                />
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={watchedFields.agreeToTerms || false}
                  onCheckedChange={(checked) => {
                    setValue("agreeToTerms", checked as boolean, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });

                    // Clear the error when the checkbox is checked
                    if (checked) {
                      clearErrors("agreeToTerms");
                    }
                  }}
                  className="mt-1 border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label
                  htmlFor="agreeToTerms"
                  className="text-sm text-gray-400 cursor-pointer">
                  I agree to the{" "}
                  <Link
                    to="/legal/terms"
                    className="text-blue-400 hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/legal/privacy"
                    className="text-blue-400 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {watchedFields.agreeToTerms !== undefined &&
                watchedFields.agreeToTerms === false &&
                errors.agreeToTerms && (
                  <p className="text-sm text-red-400">
                    {errors.agreeToTerms.message}
                  </p>
                )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-gray-500 font-medium rounded-xl transition-all duration-200 btn-glow"
                disabled={
                  !isValid ||
                  isLoading ||
                  Object.keys(validationErrors).length > 0
                }>
                {isLoading ? (
                  <div className="h-5 w-5 border-2 bg-gray-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            </>
          )}

          {/* OTP Verification Step */}
          {showOtpStep && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-gray-400 mb-2">
                  Enter the 6-digit code we sent to your{" "}
                  {otpMethod === "sms" ? "phone number" : "email"}
                </p>
                <p className="text-sm text-gray-500">
                  Didn't receive it?{" "}
                  <button
                    type="button"
                    className="text-blue-400 hover:text-blue-300 font-medium"
                    onClick={handleResendOTP}
                    disabled={isLoading}>
                    Resend code
                  </button>
                </p>
              </div>

              <OTPInput
                length={6}
                onChange={(value) =>
                  setValue("otp", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                onAutoVerify={async (value) => {
                  // Auto-submit the form when all digits are entered
                  try {
                    await handleSubmit(onSubmit)();
                  } catch (error) {
                    // Error is already handled in onSubmit, no need to do anything here
                    console.log("Auto-verify error handled in onSubmit");
                  }
                }}
                error={errors.otp?.message}
              />

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBackToSignup}
                  className="flex-1 bg-blue-500 text-gray-500 hover:bg-blue-600">
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-gray-500 font-medium rounded-xl transition-all duration-200 btn-glow"
                  disabled={true} // Hidden but kept for form structure
                  style={{ display: "none" }} // Hide the button
                >
                  Verify
                </Button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Survey Step - MOVED OUTSIDE THE MAIN FORM */}
      {showSurveyStep && (
        <div className="space-y-4">
          <SurveyForm onSuccess={handleSurveyComplete} />
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToSignup}
              className="flex-1 bg-blue-500 text-gray-500 hover:bg-blue-600">
              Back
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center">
        <p className="text-gray-400">
          Already have an account?{" "}
          <Link
            to={selectedPlan ? `/login?plan=${selectedPlan}` : "/login"}
            className="text-blue-400 hover:text-blue-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
