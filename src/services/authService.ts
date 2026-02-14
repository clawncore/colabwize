import { apiClient } from "./apiClient";
import { supabase } from "../lib/supabase/client";

export interface RegisterData {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otpCode: string;
}

export interface SurveyData {
  role: string;
  institution?: string;
  fieldOfStudy?: string;
  primaryUseCase?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    username?: string;
    fullName?: string;
    emailVerified: boolean;
    surveyCompleted: boolean;
  };
  userId?: string;
  requiresOTP?: boolean;
  requires_2fa?: boolean;
  requiresSurvey?: boolean;
}

export interface SurveyResponse {
  success: boolean;
  message: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/auth/register", data);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Registration failed",
      };
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/auth/login", data);

      // We no longer manually set localStorage here. 
      // The useAuth hook listens to Supabase auth state changes which 
      // happens when the backend returns the session or when explicit signIn occurs.

      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Login failed",
      };
    }
  }

  /**
   * Verify OTP
   */
  async verifyOTP(data: VerifyOTPData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/auth/verify-otp", data);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "OTP verification failed",
      };
    }
  }

  /**
   * Resend OTP
   */
  async resendOTP(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/auth/resend-otp", {
        email,
      });
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to resend OTP",
      };
    }
  }

  /**
   * Submit survey
   */
  async submitSurvey(data: SurveyData): Promise<SurveyResponse> {
    try {
      const response = await apiClient.post("/api/survey/submit", data);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Survey submission failed",
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const response = await apiClient.get("/api/auth/me");
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to get user",
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");
    await supabase.auth.signOut();
  }

  /**
   * Check if user is authenticated
   * @deprecated Use useAuth() hook for reactive state
   */
  isAuthenticated(): boolean {
    // Fallback to localStorage for legacy non-react code
    // But prefer checking if Supabase has a session via synchronous local check if possible 
    // (Supabase client doesn't expose synchronous checks easily without async)
    return !!localStorage.getItem("auth_token");
  }

  /**
   * Enable 2FA (Start - Get Secret)
   */
  async enable2FA(): Promise<{ success: boolean; secret?: string; qrCodeUrl?: string; message?: string }> {
    try {
      const response = await apiClient.post("/api/auth/2fa/setup", {});

      // Map backend response { qrCode, manualKey } to expected interface
      if (response && (response as any).qrCode) {
        return {
          success: true,
          secret: (response as any).manualKey,
          qrCodeUrl: (response as any).qrCode,
          message: "2FA setup initiated"
        };
      }
      return response as any;
    } catch (error: any) {
      console.error("Enable 2FA Error:", error);
      return { success: false, message: error.message || "Failed to start 2FA setup" };
    }
  }

  /**
   * Confirm 2FA (Verify Code & Activate)
   */
  async confirm2FA(token: string, secret?: string): Promise<{ success: boolean; backupCodes?: string[]; message?: string }> {
    try {
      const response = await apiClient.post("/api/auth/2fa/verify", { token, secret });
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to confirm 2FA" };
    }
  }

  /**
   * Verify 2FA (Organic/Email)
   */
  async verify2FAOrganic(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      // Ensure we identifying as organic for this request
      localStorage.setItem("auth_provider", "organic");
      const response = await apiClient.post("/api/auth/hybrid/verify-2fa", { userId, token });
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || "Invalid code" };
    }
  }

  /**
   * Verify 2FA (Google/OAuth)
   */
  async verify2FAGoogle(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      // Ensure we identifying as google for this request
      localStorage.setItem("auth_provider", "google");
      const response = await apiClient.post("/api/auth/hybrid/verify-2fa", { userId, token });
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || "Invalid code" };
    }
  }

  /**
   * Verify 2FA (Legacy/Generic)
   * @deprecated Use verify2FAOrganic or verify2FAGoogle
   */
  async verify2FA(userId: string, token: string): Promise<{ success: boolean; message: string }> {
    // Default to organic if not specified, or checks current state
    return this.verify2FAOrganic(userId, token);
  }

  /**
   * Disable 2FA
   */
  async disable2FA(password: string, token: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post("/api/auth/2fa/disable", { password, token });
      return response;
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to disable 2FA" };
    }
  }

  getToken(): string | null {
    return localStorage.getItem("auth_token");
  }
}

const authService = new AuthService();
export default authService;
