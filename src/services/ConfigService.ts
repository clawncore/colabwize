/**
 * Centralized Configuration Service for Frontend
 *
 * Handles retrieval of environment variables with standardized fallbacks.
 * Prioritizes REACT_APP_ prefix as per Create React App standards.
 */
export class ConfigService {
  /**
   * Get the backend API base URL
   */
  static getApiUrl(): string {
    // Check various permutations found in the code base
    return (
      process.env.REACT_APP_API_URL ||
      process.env.REACT_APP_BACKEND_URL ||
      // Fallback for VITE/NEXT variables if they happen to be exposed/shimmed
      process.env.VITE_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "https://api.colabwize.com"
    );
  }

  /**
   * Get Supabase configuration
   */
  static getSupabaseConfig() {
    const url =
      process.env.REACT_APP_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.REACT_APP_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.warn("Supabase configuration missing in environment variables");
    }

    return {
      url: url || "",
      anonKey: anonKey || "",
    };
  }

  /**
   * Get Documentation URL
   */
  static getDocsUrl(): string {
    return process.env.REACT_APP_DOCS_URL || "https://docs.colabwize.com";
  }

  /**
   * Get Unsplash Integration Config
   */
  static getUnsplashConfig() {
    return {
      apiUrl:
        process.env.REACT_APP_UNSPLASH_API_URL || "https://api.unsplash.com",
      accessKey: process.env.REACT_APP_UNSPLASH_ACCESS_KEY || "",
      applicationId: process.env.REACT_APP_UNSPLASH_APPLICATION_ID,
      redirectUrl: process.env.REACT_APP_UNSPLASH_REDIRECT_URL,
    };
  }

  /**
   * Get current environment name
   */
  static getNodeEnv(): string {
    return process.env.NODE_ENV || "development";
  }
}

export default ConfigService;
