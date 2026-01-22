import {
  supabase,
  configureSessionPersistence,
  sessionManager,
} from "../lib/supabase/client";
import logger from "../utils/logger";

// API base URL - adjust this to match your backend URL
import ConfigService from "./ConfigService";

const API_BASE_URL = ConfigService.getApiUrl();

// Timeout wrapper for fetch requests
const fetchWithTimeout = (
  url: string,
  options: RequestInit = {},
  timeout = 15000
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

/**
 * Hybrid Authentication Utilities
 * Uses Supabase Authentication for authentication and Supabase for user data storage
 */

/**
 * Sign up with email and password using hybrid approach
 */
/**
 * Sign up with email and password using Supabase SDK
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  userData: {
    full_name?: string;
    phone_number?: string;
    otp_method?: string; // 'email' or 'sms' - Supabase handles this via type
    user_type?: string;
    field_of_study?: string;
    selected_plan?: string;
    affiliate_ref?: string;
  }
): Promise<{
  success: boolean;
  user: any;
  message: string;
  otpSent?: boolean;
  needsVerification?: boolean;
}> {
  try {
    // metadata for the user
    const options = {
      data: {
        full_name: userData.full_name,
        user_type: userData.user_type,
        field_of_study: userData.field_of_study,
        selected_plan: userData.selected_plan,
        affiliate_ref: userData.affiliate_ref,
      },
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options,
    });

    if (error) {
      // Convert Supabase error to our format
      throw new Error(error.message);
    }

    // If successful, data.user should be present. 
    // If email confirmation is enabled, data.session might be null.

    let otpSent = false;
    if (data.user) {
      // 1. Explicitly register user in backend (Prisma)
      // This is required because OTP mechanism needs a User record for foreign key constraints
      try {
        const registerResponse = await fetch(`${API_BASE_URL}/api/auth/hybrid/register-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: data.user.id,
            email: email,
            fullName: userData.full_name,
            fieldOfStudy: userData.field_of_study,
            userType: userData.user_type,
            selectedPlan: userData.selected_plan,
            affiliateRef: userData.affiliate_ref,
            otpMethod: userData.otp_method,
          }),
        });

        if (!registerResponse.ok) {
          const errText = await registerResponse.text();
          logger.error("Backend registration failed", { error: errText });
          // If registration fails, OTP might fail too due to FK constraints, but we proceed anyway
        } else {
          logger.info("Backend registration successful");
        }
      } catch (regError) {
        logger.error("Backend registration network error", { error: regError });
      }

      // 2. Trigger our custom Resend email immediately
      try {
        await resendVerificationEmail(email, data.user.id, userData.full_name);
        otpSent = true;
        logger.info("Custom Resend OTP email triggered after signup");
      } catch (emailError) {
        logger.error("Failed to trigger Resend email after signup", { error: emailError });
        // We don't fail the whole signup if email fails, but we should inform the user
      }
    }

    return {
      success: true,
      user: data.user,
      message: "Signup successful. Please verify your email.",
      otpSent: otpSent, // Now reflects if OUR email was sent
      needsVerification: !data.session, // If no session, verification needed
    };

  } catch (error: any) {
    logger.error("Sign up error", { error: error.message, email });
    throw error;
  }
}

/**
 * Sign in with email and password using hybrid approach
 */
export async function signInWithEmail(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<{ success: boolean; user: any; userData: any }> {
  try {
    const sanitizedEmail = email.trim().toLowerCase();
    // First, sign in with Supabase Authentication
    // Configure session persistence based on "Remember Me" option
    configureSessionPersistence(rememberMe);

    console.log("Hybrid sign in with rememberMe:", rememberMe);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (error) {
      // Normalize AuthApiError for UI handling
      const normalized: any = new Error(error.message);
      normalized.name = error.name;
      normalized.status = (error as any).status;
      if (
        typeof error.message === "string" &&
        error.message.toLowerCase().includes("email not confirmed")
      ) {
        normalized.code = "EMAIL_NOT_CONFIRMED";
        normalized.email = sanitizedEmail; // Add email to error for UI handling
        normalized.needsVerification = true; // Flag to indicate user needs to verify email
        normalized.message =
          "Email not confirmed. Please check your email for a verification code.";
      }
      logger.authError("Sign in error", {
        email: sanitizedEmail,
        name: normalized.name,
        status: normalized.status,
        code: normalized.code,
      });
      throw normalized;
    }

    // Get Supabase ID token (access token)
    const idToken = data.session?.access_token;

    // Then, verify token with our hybrid backend endpoint
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/auth/hybrid/signin`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      logger.info("User signed in with hybrid auth", {
        email: sanitizedEmail,
        uid: data.user?.id,
        rememberMe,
      });

      // Perform any additional session management
      sessionManager.handleSessionCleanup();

      return result;
    } else {
      throw new Error(result.error || "Failed to verify user with backend");
    }
  } catch (error: any) {
    // Map network/CORS issues for clearer UI feedback
    if (
      error instanceof TypeError ||
      (typeof error.message === "string" &&
        error.message.includes("Failed to fetch"))
    ) {
      const networkErr: any = new Error(
        "Network error: failed to reach authentication service"
      );
      networkErr.code = "NETWORK_ERROR";
      logger.authError("Network/CORS failure during sign-in", {
        email,
        original: error.message,
      });
      throw networkErr;
    }
    logger.authError("Hybrid sign in error", {
      error: error.message,
      code: error?.code,
      email,
    });
    throw error;
  }
}

/**
 * Sign in with Google using hybrid approach
 */
export async function signInWithGoogle(): Promise<{
  success: boolean;
  user: any;
  userData: any;
}> {
  try {
    // Sign in with Google popup
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    // For OAuth, we'll need to handle the redirect flow
    // The user will be redirected back to the callback URL
    // and we'll handle the session there
    logger.info("User initiated Google sign in with hybrid auth");

    // Return a success response indicating the OAuth flow has started
    return {
      success: true,
      user: null,
      userData: null,
    };
  } catch (error: any) {
    logger.error("Hybrid Google sign in error", { error: error.message });
    throw error;
  }
}

/**
 * Sign in with Microsoft using hybrid approach
 */
export async function signInWithMicrosoft(): Promise<{
  success: boolean;
  user: any;
  userData: any;
}> {
  try {
    // Sign in with Microsoft (Azure) popup
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    // For OAuth, we'll need to handle the redirect flow
    // The user will be redirected back to the callback URL
    // and we'll handle the session there
    logger.info("User initiated Microsoft sign in with hybrid auth");

    // Return a success response indicating the OAuth flow has started
    return {
      success: true,
      user: null,
      userData: null,
    };
  } catch (error: any) {
    logger.error("Hybrid Microsoft sign in error", { error: error.message });
    throw error;
  }
}

/**
 * Sign up with Google using hybrid approach
 */
export async function signUpWithGoogle(redirectParams?: {
  plan?: string;
  redirect?: string;
}): Promise<{
  success: boolean;
  user: any;
  userData: any;
}> {
  try {
    // Build redirect URL with parameters
    let redirectUrl = `${window.location.origin}/auth/callback`;
    if (redirectParams?.plan || redirectParams?.redirect) {
      const params = new URLSearchParams();
      if (redirectParams.plan) params.set("plan", redirectParams.plan);
      if (redirectParams.redirect)
        params.set("redirect", redirectParams.redirect);
      redirectUrl += `?${params.toString()}`;
    }

    // Sign in with Google popup
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      throw error;
    }

    logger.info("User initiated Google signup with hybrid auth");

    // Return a success response indicating the OAuth flow has started
    return {
      success: true,
      user: null,
      userData: null,
    };
  } catch (error: any) {
    logger.error("Hybrid Google signup error", { error: error.message });
    throw error;
  }
}

/**
 * Sign up with Microsoft using hybrid approach
 */
export async function signUpWithMicrosoft(redirectParams?: {
  plan?: string;
  redirect?: string;
}): Promise<{
  success: boolean;
  user: any;
  userData: any;
}> {
  try {
    // Build redirect URL with parameters
    let redirectUrl = `${window.location.origin}/auth/callback`;
    if (redirectParams?.plan || redirectParams?.redirect) {
      const params = new URLSearchParams();
      if (redirectParams.plan) params.set("plan", redirectParams.plan);
      if (redirectParams.redirect)
        params.set("redirect", redirectParams.redirect);
      redirectUrl += `?${params.toString()}`;
    }

    // Sign in with Microsoft (Azure) popup
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      throw error;
    }

    logger.info("User initiated Microsoft signup with hybrid auth");

    // Return a success response indicating the OAuth flow has started
    return {
      success: true,
      user: null,
      userData: null,
    };
  } catch (error: any) {
    logger.error("Hybrid Microsoft signup error", { error: error.message });
    throw error;
  }
}

/**
 * Update user profile using hybrid approach
 */
export async function updateUserProfile(updates: {
  full_name?: string;
  email?: string;
  phone_number?: string;
  user_type?: string;
  field_of_study?: string;
}): Promise<{ success: boolean; user: any; userData: any }> {
  try {
    const currentUser = (await supabase.auth.getUser()).data.user;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    // Get Supabase ID token (access token)
    const session = (await supabase.auth.getSession()).data.session;
    const idToken = session?.access_token;

    // Update user in Supabase
    const { error: updateError } = await supabase.auth.updateUser({
      data: updates,
    });

    if (updateError) {
      throw updateError;
    }

    // Send updates to our hybrid backend endpoint
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/auth/hybrid/profile`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idToken,
          updates,
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      logger.info("User profile updated with hybrid auth");
      return result;
    } else {
      throw new Error(result.error || "Failed to update user profile");
    }
  } catch (error: any) {
    logger.error("Hybrid profile update error", { error: error.message });
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    logger.info("User signed out");
  } catch (error: any) {
    logger.error("Sign out error", { error: error.message });
    throw error;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<any> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      logger.error("Get user error", { error: error.message });
      return null;
    }
    return data.user;
  } catch (error: any) {
    logger.error("Get user error", { error: error.message });
    return null;
  }
}

/**
 * Get current user's ID token
 */
export async function getIdToken(
  forceRefresh: boolean = false
): Promise<string | null> {
  try {
    if (forceRefresh) {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        logger.error("Refresh session error", { error: error.message });
        return null;
      }
      return data.session?.access_token || null;
    } else {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        logger.error("Get session error", { error: error.message });
        return null;
      }
      return data.session?.access_token || null;
    }
  } catch (error: any) {
    logger.error("Get ID token error", { error: error.message });
    return null;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    // Send request to our hybrid backend endpoint
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/auth/hybrid/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      logger.info("Password reset email sent", { email });
    } else {
      throw new Error(result.error || "Failed to send password reset email");
    }
  } catch (error: any) {
    logger.error("Password reset error", { error: error.message, email });
    throw error;
  }
}

/**
 * Verify OTP code for email confirmation
 */
export async function verifyEmailOTP(
  email: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get current user ID
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Send OTP verification request to backend
    const response = await fetchWithTimeout(
      `${API_BASE_URL}/api/auth/hybrid/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          otp,
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      logger.info("Email OTP verified successfully", {
        email,
        userId: user.id,
      });
      return {
        success: true,
        message: "Email verified successfully! You can now sign in.",
      };
    } else {
      throw new Error(result.message || "Failed to verify OTP code");
    }
  } catch (error: any) {
    logger.error("Email OTP verification error", {
      error: error.message,
      email,
    });
    throw error;
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(
  email: string,
  otp: string,
  userId?: string // Made optional for backward compatibility but required for backend verification
): Promise<{ success: boolean; message: string }> {
  try {
    // If userId is provided, verify with our backend (Hybrid/Resend approach)
    if (userId) {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/auth/hybrid/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            otp,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        logger.info("OTP verified successfully via Backend");
        return {
          success: true,
          message:
            result.message || "Email verified successfully.",
        };
      } else {
        throw new Error(result.message || "Failed to verify OTP with backend");
      }
    }

    // Fallback to Supabase SDK if no userId provided (Legacy/Pure Supabase)
    // type: 'signup' is used for email verification token
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    if (error) {
      throw new Error(error.message);
    }

    logger.info("OTP verified successfully via Supabase SDK");
    return {
      success: true,
      message: "Email verified successfully.",
    };
  } catch (error: any) {
    logger.error("OTP verification error", { error: error.message });
    throw error;
  }
}

/**
 * Resend email verification
 * This function can be used to resend the OTP verification email
 */
export async function resendVerificationEmail(
  email: string,
  userId?: string, // Added userId param
  fullName?: string // Added fullName param
): Promise<{ success: boolean; message: string }> {
  try {
    // If userId is provided, use our backend (Hybrid/Resend approach)
    if (userId) {
      const payload = {
        userId,
        email,
        method: "email",
        fullName: fullName || "",
      };

      console.log("DEBUG: Sending OTP payload:", payload);

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/api/auth/hybrid/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result?.success) { // Check for result.success explicitly or just 200 OK if structure differs, but typically we return {success:true}
        logger.info("Verification email resent via Backend");
        return {
          success: true,
          message: "Verification email sent successfully.",
        };
      } else {
        // If backend fails, we might want to throw or fall back, but let's error for now to respect "Secret Services" usage
        throw new Error(result.message || "Failed to send verification email via backend");
      }
    }

    // Fallback to Supabase resend if no userId (Legacy)
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      logger.error("Resend verification email error", {
        error: error.message,
      });
      throw error;
    }

    logger.info("Verification email resent via Supabase SDK");
    return {
      success: true,
      message:
        "Verification email sent successfully. Please check your inbox for the confirmation link.",
    };
  } catch (error: any) {
    logger.error("Resend verification email error", {
      error: error.message,
      email,
    });
    throw error;
  }
}
