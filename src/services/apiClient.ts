import { supabase } from "../lib/supabase/client";
// Simple API client wrapper
import ConfigService from "./ConfigService";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl || ConfigService.getApiUrl();
  }

  private async getAuthToken() {
    try {
      console.log("Getting auth token from Supabase");
      // Get Supabase token
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log("Session data:", session);
      console.log("Session error:", error);

      if (error) {
        console.error("Error getting session:", error);
        // Don't redirect immediately on session error during page load
        // Let the route components handle authentication state
        return null;
      }

      if (!session) {
        console.warn("No active session found");
        // Try to get user directly to see if there's a session issue
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        console.log("Direct user check:", userData, userError);

        if (userData?.user && !userError) {
          // If we can get the user but not the session, try to refresh
          console.log("User exists but no session, attempting to refresh");
          const { data: refreshedData, error: refreshError } =
            await supabase.auth.refreshSession();
          console.log("Refresh session result:", refreshedData);
          console.log("Refresh session error:", refreshError);
          if (refreshError) {
            console.error("Failed to refresh session:", refreshError);
            return null;
          }
          return refreshedData.session?.access_token || null;
        }

        // Don't redirect immediately if there's no session
        // Let the route components handle authentication state
        return null;
      }

      console.log("Session expires at:", session.expires_at);
      console.log("Current time:", new Date().getTime() / 1000);

      // Check if token is about to expire (within 5 minutes)
      const expirationTime = new Date(session.expires_at * 1000);
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      console.log("Token expiration check in apiClient:", {
        expiresAt: session.expires_at,
        expirationTime,
        now,
        fiveMinutesFromNow,
        isExpiringSoon: expirationTime < fiveMinutesFromNow,
        timeUntilExpiration: expirationTime.getTime() - now.getTime(),
        timeUntilRefresh: fiveMinutesFromNow.getTime() - now.getTime(),
      });

      console.log("Expiration time:", expirationTime);
      console.log("Five minutes from now:", fiveMinutesFromNow);

      if (expirationTime < fiveMinutesFromNow) {
        console.warn(
          "Token is about to expire or already expired, attempting to refresh"
        );
        // Try to refresh the session
        console.log("Attempting to refresh session");
        const { data: refreshedData, error: refreshError } =
          await supabase.auth.refreshSession();
        console.log("Refresh session result:", refreshedData);
        console.log("Refresh session error:", refreshError);
        if (refreshError) {
          console.error("Failed to refresh session:", refreshError);
          // If refresh fails, try to get a new session
          console.log("Trying to get new session after refresh failure");
          const { data: newData, error: newError } =
            await supabase.auth.getSession();
          console.log("New session data:", newData);
          console.log("New session error:", newError);
          if (newError || !newData.session) {
            console.error("Failed to get new session:", newError);
            // Don't redirect immediately if we can't get a new session
            // Let the route components handle authentication state
            return null;
          }
          return newData.session?.access_token || null;
        }
        return refreshedData.session?.access_token || null;
      }

      const token = session?.access_token;
      console.log(
        "Returning token:",
        token ? token.substring(0, 20) + "..." : null
      );
      return token;
    } catch (error) {
      console.error("Error getting auth token:", error);
      // Don't redirect immediately on auth error
      // Let the route components handle authentication state
      return null;
    }
  }

  private async request(
    url: string,
    options: RequestInit = {},
    retryCount = 0 // DISABLE retries by default to prevent infinite loops
  ) {
    const fullUrl = `${this.baseUrl}${url}`;

    console.log("Making API request to:", fullUrl);

    // Get auth token
    let token = await this.getAuthToken();
    console.log("Got token for request:", token ? "YES" : "NO");

    // Create AbortController for timeout handling
    const controller = new AbortController();
    // Increase timeout to 120 seconds for heavy backend operations
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

    const isFormData = options.body instanceof FormData;
    const defaultOptions: RequestInit = {
      signal: controller.signal,
      headers: {
        ...(!isFormData && { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    console.log("Request headers being sent:", defaultOptions.headers);

    try {
      console.log(`Making request to: ${fullUrl}`, {
        method: options.method || "GET",
        hasToken: !!token,
        retryCount,
      });

      const response: Response = await fetch(fullUrl, defaultOptions);

      // Clear timeout since request completed
      clearTimeout(timeoutId);

      // Handle 401 errors by throwing an appropriate error
      if (response.status === 401) {
        console.log("Authentication failed - 401 response");
        const errorData = await response.json().catch(() => ({}));
        console.log("401 error details:", errorData);

        // If it's a token missing or invalid error, don't redirect immediately
        // Let the route components handle authentication state
        if (
          errorData.message === "Authorization token missing" ||
          errorData.message === "Invalid or missing authentication token" ||
          errorData.message === "Authentication required" ||
          errorData.message === "Invalid or expired token" || // Added common Supabase/Backend error
          errorData.message === "jwt expired"
        ) {
          // Clear any stored data
          console.log("Clearing session due to auth error:", errorData.message);
          localStorage.clear();
          sessionStorage.clear();

          // Force redirect to login
          if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
            window.location.href = "/login";
          }
        }

        throw new Error(errorData.message || "User not authenticated");
      }

      // Special handling for 404 errors for affiliate record not found
      // This needs to be handled before checking response.ok
      if (response.status === 404) {
        try {
          const errorData = await response.json();
          if (errorData.message === "Affiliate record not found") {
            // Return a special response that the frontend can handle without throwing an error
            return {
              success: false,
              message: "Affiliate record not found",
            };
          }
          // For other 404 errors, we'll still throw
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`
          );
        } catch (parseError) {
          // If we can't parse the JSON, throw a generic error
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // If response is not ok, try to parse error message
      if (!response.ok) {
        try {
          const errorData = await response.json();
          // Check for 'error' property first, then 'message'
          const errorMessage =
            errorData.error ||
            errorData.message ||
            `HTTP error! status: ${response.status}`;

          // Attach debug info to the error object if available
          const error = new Error(errorMessage);
          if (errorData.debug) {
            (error as any).debug = errorData.debug;
          }

          throw error;
        } catch (parseError) {
          // If we can't parse the JSON, throw a generic error if it wasn't already thrown above
          if (
            parseError instanceof Error &&
            parseError.message !== "Unexpected end of JSON input"
          ) {
            if (
              parseError.message &&
              parseError.message !== "HTTP error! status: " + response.status
            ) {
              // It's likely the error we just threw in the try block
              throw parseError;
            }
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      return response.json ? await response.json() : response;
    } catch (error: any) {
      // Clear timeout since request completed or failed
      clearTimeout(timeoutId);

      console.error(`API request failed for ${url}:`, error);

      // Handle abort errors (timeouts) - DO NOT retry on timeouts
      if (
        error.name === "AbortError" ||
        (error.name === "TypeError" && error.message.includes("aborted"))
      ) {
        console.log(
          `Request to ${url} timed out - NOT retrying to prevent infinite loop`
        );
        throw new Error(
          "Request timeout - service may be temporarily unavailable. Please try again later."
        );
      }

      // Handle network errors specifically - ONLY retry on network errors, NOT timeouts
      if (
        error instanceof TypeError &&
        (error.message === "Failed to fetch" ||
          error.message?.includes("ERR_INSUFFICIENT_RESOURCES") ||
          error.message?.includes("NetworkError") ||
          error.message?.includes("ECONNREFUSED") ||
          error.message?.includes("ECONNRESET"))
      ) {
        // This is likely a network connectivity issue
        if (retryCount > 0) {
          console.log(
            `Retrying request to ${url} due to network error... (${retryCount} attempts left)`
          );
          // Wait before retrying with exponential backoff (increased delay)
          await new Promise((resolve) =>
            setTimeout(resolve, 10000 * (4 - retryCount))
          );
          return this.request(url, options, retryCount - 1);
        }

        // Check if this is an authentication issue (no token available)
        const authToken = await this.getAuthToken();
        if (!authToken) {
          throw new Error(
            "Authentication required - please sign in to access this feature"
          );
        }

        throw new Error(
          "Network error - please check your connection and try again"
        );
      }

      throw error;
    }
  }

  async get(url: string, options: RequestInit = {}) {
    // IMPORTANT: Dynamic routes like /api/projects and /api/billing/subscription must NOT retry
    // Only static resources can retry on network errors
    // Check if this is a dynamic API endpoint
    const isDynamicRoute = url.startsWith("/api/") || url.includes("?");
    const retries = isDynamicRoute ? 0 : 2; // No retries for dynamic routes
    return this.request(url, { ...options, method: "GET" }, retries);
  }

  async post(url: string, data: any, options: RequestInit = {}) {
    // IMPORTANT: Dynamic routes like /api/projects and /api/billing/subscription must NOT retry
    // Mutations should never retry to prevent duplicate operations
    const isFormData = data instanceof FormData;
    return this.request(
      url,
      {
        ...options,
        method: "POST",
        body: isFormData ? data : JSON.stringify(data),
      },
      0
    ); // Never retry POST requests
  }

  async put(url: string, data: any, options: RequestInit = {}) {
    // IMPORTANT: Dynamic routes like /api/projects and /api/billing/subscription must NOT retry
    // Mutations should never retry to prevent duplicate operations
    const isFormData = data instanceof FormData;
    return this.request(
      url,
      {
        ...options,
        method: "PUT",
        body: isFormData ? data : JSON.stringify(data),
      },
      0
    ); // Never retry PUT requests
  }

  async patch(url: string, data: any, options: RequestInit = {}) {
    // IMPORTANT: Dynamic routes like /api/projects and /api/billing/subscription must NOT retry
    // Mutations should never retry to prevent duplicate operations
    const isFormData = data instanceof FormData;
    return this.request(
      url,
      {
        ...options,
        method: "PATCH",
        body: isFormData ? data : JSON.stringify(data),
      },
      0
    ); // Never retry PATCH requests
  }

  async delete(url: string, data: any = {}, options: RequestInit = {}) {
    // IMPORTANT: Dynamic routes like /api/projects and /api/billing/subscription must NOT retry
    // Mutations should never retry to prevent duplicate operations
    return this.request(
      url,
      {
        ...options,
        method: "DELETE",
        ...(data ? { body: JSON.stringify(data) } : {}),
      },
      0
    ); // Never retry DELETE requests
  }

  /**
   * Download a file from the API
   * Returns the raw Response object to handle blobs/streams
   */
  async download(url: string, data: any, options: RequestInit = {}) {
    const fullUrl = `${this.baseUrl}${url}`;
    const token = await this.getAuthToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(fullUrl, {
      ...options,
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error ||
        errorData.message ||
        `Download failed: ${response.status}`;
      const error = new Error(errorMessage);
      (error as any).data = errorData;
      throw error;
    }

    return response;
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

export default apiClient;
