import { apiClient } from "./apiClient";
import ConfigService from "./ConfigService";

const API_URL = ConfigService.getApiUrl();

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

      // Store token if login successful
      if (response.success && response.token) {
        localStorage.setItem("auth_token", response.token);
      }

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

      // Store token if verification successful
      if (response.success && response.token) {
        localStorage.setItem("auth_token", response.token);
      }

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
  logout(): void {
    localStorage.removeItem("auth_token");
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem("auth_token");
  }
}

export default new AuthService();
