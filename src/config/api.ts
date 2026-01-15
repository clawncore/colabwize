import ConfigService from "../services/ConfigService";

// Use the configured API URL from ConfigService
export const BACKEND_URL = ConfigService.getApiUrl();
