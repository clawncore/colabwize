import ConfigService from "../../services/ConfigService";

// Simple API client for docs site
const API_URL = ConfigService.getApiUrl();

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl || API_URL;
  }

  private async request(url: string, options: RequestInit = {}) {
    const fullUrl = `${this.baseUrl}${url}`;

    // Default headers
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(fullUrl, config);

      if (!response.ok) {
        // Try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Check if response has content
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return response;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  get(url: string, options: RequestInit = {}) {
    return this.request(url, { ...options, method: "GET" });
  }

  post(url: string, data: any, options: RequestInit = {}) {
    return this.request(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put(url: string, data: any, options: RequestInit = {}) {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete(url: string, options: RequestInit = {}) {
    return this.request(url, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
