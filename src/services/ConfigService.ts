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
  private static logged = false;

  /**
   * Get the backend API base URL
   */
  static getApiUrl(): string {
    const url = process.env.REACT_APP_API_URL || "https://api.colabwize.com";

    // Log resolved config once at boot
    if (!this.logged) {
      console.log("✅ [Config] Environment Loaded:", ConfigService.getNodeEnv());
      console.log("✅ [Config] API URL:", url);
      console.log("✅ [Config] Supabase URL:", process.env.REACT_APP_SUPABASE_URL ? "Set" : "Missing");
      this.logged = true;
    }

    return url;
  }

  /**
   * Get Supabase configuration
   */
  static getSupabaseConfig() {
    const url = process.env.REACT_APP_SUPABASE_URL;
    const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.warn("❌ [Config] Supabase configuration missing in environment variables!");
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
