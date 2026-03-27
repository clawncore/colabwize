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
    const isProd = this.getNodeEnv() === "production";
    const url = process.env.REACT_APP_API_URL || (isProd ? "https://api.colabwize.com" : "http://localhost:3001");

    // Log resolved config once at boot
    if (!this.logged) {
      console.log(
        "✅ [Config] Environment Loaded:",
        ConfigService.getNodeEnv(),
      );
      console.log("✅ [Config] API URL:", url);
      console.log("✅ [Config] Collab URL:", ConfigService.getCollabUrl());
      console.log(
        "✅ [Config] Supabase URL:",
        process.env.REACT_APP_SUPABASE_URL ? "Set" : "Missing",
      );
      this.logged = true;
    }

    return url;
  }

  /**
   * Get the collaboration (Hocuspocus) WebSocket URL
   */
  static getCollabUrl(): string {
    const isProd = this.getNodeEnv() === "production";
    const defaultUrl = isProd
      ? "wss://api.colabwize.com/collaboration"
      : "ws://localhost:3001/collaboration";
    return process.env.REACT_APP_HOCUSPOCUS_URL || defaultUrl;
  }

  /**
   * Get the notification WebSocket URL
   */
  static getNotificationUrl(): string {
    const isProd = this.getNodeEnv() === "production";
    const defaultUrl = isProd
      ? "wss://api.colabwize.com/notifications"
      : "ws://localhost:3001/notifications";
    return process.env.REACT_APP_NOTIFICATION_URL || defaultUrl;
  }

  /**
   * Get Supabase configuration
   */
  static getSupabaseConfig() {
    const url = process.env.REACT_APP_SUPABASE_URL;
    const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.warn(
        "❌ [Config] Supabase configuration missing in environment variables!",
      );
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
   * Get the reCAPTCHA v3 Site Key
   */
  static getRecaptchaSiteKey(): string {
    if (this.getNodeEnv() === "development") return "";
    
    return (
      process.env.REACT_APP_RECAPTCHA_SITE_KEY ||
      "6LfAnpgsAAAAAPse1qAZ1kReTvWaM_ThzjjRjNYv"
    );
  }

  /**
   * Get the reCAPTCHA v2 Site Key (Checkbox)
   */
  static getRecaptchaV2SiteKey(): string {
    if (this.getNodeEnv() === "development") return "";

    return (
      process.env.REACT_APP_RC_V2_SITE ||
      "" // Default to empty, user must provide this for v2 to work
    );
  }

  /**
   * Get current environment name
   */
  static getNodeEnv(): string {
    return process.env.NODE_ENV || "development";
  }
}

export default ConfigService;
