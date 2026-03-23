/**
 * ConfigService.ts
 * Centralized configuration management for the Docs application.
 * Abstracts access to environment variables.
 */

const ConfigService = {
  /**
   * Get the backend API URL.
   * Defaults to localhost:3001 if not set.
   */
  getApiUrl: (): string => {
    return process.env.REACT_APP_API_URL || "http://localhost:3001";
  },

  /**
   * Get the current NODE_ENV.
   */
  getNodeEnv: (): string => {
    return process.env.NODE_ENV || "development";
  },

  /**
   * Check if running in development mode.
   */
  isDevelopment: (): boolean => {
    return process.env.NODE_ENV === "development";
  },

  /**
   * Check if running in production mode.
   */
  isProduction: (): boolean => {
    return process.env.NODE_ENV === "production";
  },
};

export default ConfigService;
