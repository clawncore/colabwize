import ConfigService from "../services/ConfigService";

/**
 * Simple logger utility for frontend
 */
const logger = {
  info: (message: string, data?: any) => {
    if (ConfigService.getNodeEnv() === "development") {
      console.log(`[INFO] ${message}`, data || "");
    }
  },
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data || "");
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || "");
  },
  debug: (message: string, data?: any) => {
    if (ConfigService.getNodeEnv() === "development") {
      console.debug(`[DEBUG] ${message}`, data || "");
    }
  },
  authInfo: (message: string, data?: any) => {
    if (ConfigService.getNodeEnv() === "development") {
      console.log(`[AUTH][INFO] ${message}`, data || "");
    }
  },
  authError: (message: string, data?: any) => {
    console.error(`[AUTH][ERROR] ${message}`, data || "");
  },
};

export default logger;
