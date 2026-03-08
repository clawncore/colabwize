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
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        return null;
      }

      return session?.access_token || null;
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  private async request(
    url: string,
    options: RequestInit = {},
    retryCount = 0, // DISABLE retries by default to prevent infinite loops
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
        ...options.headers,
      },
      ...options,
    };

    // Add authentication headers
    if (token) {
      // Determine user provider from token or session metadata if available
      // Since we don't have direct access to user metadata here without another call,
      // we'll try to infer or check local storage if stored during login
      // Determine user provider
      const authProvider = typeof localStorage !== "undefined" 
        ? localStorage.getItem("auth_provider") || "organic" 
        : "organic";

      if (authProvider === "google") {
        (defaultOptions.headers as any)["X-Auth-Google"] = `Bearer ${token}`;
      } else if (authProvider === "azure" || authProvider === "microsoft") {
        (defaultOptions.headers as any)["X-Auth-Microsoft"] = `Bearer ${token}`;
      } else {
        (defaultOptions.headers as any)["X-Auth-Organic"] = `Bearer ${token}`;
      }

      // Keep Authorization as fallback to ensure compatibility and robustness
      (defaultOptions.headers as any)["Authorization"] = `Bearer ${token}`;
    }

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
          console.error("CRITICAL: Auth error detected. Wiping session.", {
            message: errorData.message,
          });

          // Prevent infinite reload loops - check if we just redirected
          const lastAuthError = sessionStorage.getItem("last_auth_error_time");
          const now = Date.now();
          if (lastAuthError && now - parseInt(lastAuthError) < 5000) {
            console.error("Redirect loop detected. Stopping redirect.");
            throw new Error("Authentication failed - Loop detected");
          }

          sessionStorage.setItem("last_auth_error_time", now.toString());

          localStorage.clear();
          // sessionStorage.clear(); // Don't clear session storage wholly so we can track the loop

          // Force redirect to login
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.startsWith("/auth")
          ) {
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
            errorData.message || `HTTP error! status: ${response.status}`,
          );
        } catch (parseError) {
          // If we can't parse the JSON, throw a generic error
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // If response is not ok, try to parse error message
      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignore parsing error, keep empty object
        }

        // Check for 'error' property first, then 'message'
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `HTTP error! status: ${response.status}`;

        // Create error object
        const error = new Error(errorMessage);

        // Attach structured response data for consumers (like citationAuditEngine)
        // Mimic axios structure: error.response.data
        (error as any).response = {
          data: errorData,
          status: response.status,
          statusText: response.statusText,
        };

        // Attach debug info to the error object if available
        if (errorData.debug) {
          (error as any).debug = errorData.debug;
        }

        // Specifically handle 402 Payment Required
        if (response.status === 402) {
          console.warn("💰 Payment Required (402) intercepted in apiClient");
          // We still throw, but the consumer can now read error.response.status === 402
        }

        throw error;
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
          `Request to ${url} timed out - NOT retrying to prevent infinite loop`,
        );
        throw new Error(
          "Request timeout - service may be temporarily unavailable. Please try again later.",
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
            `Retrying request to ${url} due to network error... (${retryCount} attempts left)`,
          );
          // Wait before retrying with exponential backoff (increased delay)
          await new Promise((resolve) =>
            setTimeout(resolve, 10000 * (4 - retryCount)),
          );
          return this.request(url, options, retryCount - 1);
        }

        // Check if this is an authentication issue (no token available)
        const authToken = await this.getAuthToken();
        if (!authToken) {
          throw new Error(
            "Authentication required - please sign in to access this feature",
          );
        }

        throw new Error(
          "Network error - please check your connection and try again",
        );
      }

      throw error;
    }
  }

  async get(url: string, options: RequestInit = {}) {
    // IMPORTANT: Dynamic routes like /api/projects and /api/subscription/current must NOT retry
    // Only static resources can retry on network errors
    // Check if this is a dynamic API endpoint
    const isDynamicRoute = url.startsWith("/api/") || url.includes("?");
    const retries = isDynamicRoute ? 0 : 2; // No retries for dynamic routes
    return this.request(url, { ...options, method: "GET" }, retries);
  }

  async post(url: string, data: any, options: RequestInit = {}) {
    // IMPORTANT: Dynamic routes like /api/projects and /api/subscription/current must NOT retry
    // Mutations should never retry to prevent duplicate operations
    const isFormData = data instanceof FormData;
    return this.request(
      url,
      {
        ...options,
        method: "POST",
        body: isFormData ? data : JSON.stringify(data),
      },
      0,
    ); // Never retry POST requests
  }

  async put(url: string, data: any, options: RequestInit = {}) {
    // IMPORTANT: Dynamic routes like /api/projects and /api/subscription/current must NOT retry
    // Mutations should never retry to prevent duplicate operations
    const isFormData = data instanceof FormData;
    return this.request(
      url,
      {
        ...options,
        method: "PUT",
        body: isFormData ? data : JSON.stringify(data),
      },
      0,
    ); // Never retry PUT requests
  }

  async patch(url: string, data: any, options: RequestInit = {}) {
    // IMPORTANT: Dynamic routes like /api/projects and /api/subscription/current must NOT retry
    // Mutations should never retry to prevent duplicate operations
    const isFormData = data instanceof FormData;
    return this.request(
      url,
      {
        ...options,
        method: "PATCH",
        body: isFormData ? data : JSON.stringify(data),
      },
      0,
    ); // Never retry PATCH requests
  }

  async delete(url: string, data: any = {}, options: RequestInit = {}) {
    // IMPORTANT: Dynamic routes like /api/projects and /api/subscription/current must NOT retry
    // Mutations should never retry to prevent duplicate operations
    return this.request(
      url,
      {
        ...options,
        method: "DELETE",
        ...(data ? { body: JSON.stringify(data) } : {}),
      },
      0,
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
