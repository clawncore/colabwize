import { apiClient } from "./apiClient";

export interface MendeleyItem {
  id: string;
  type: string;
  title: string;
  year?: number;
  source?: string;
  authors?: Array<{ first_name: string; last_name: string }>;
  keywords?: string[];
  created?: string;
  last_modified?: string;
  [key: string]: any;
}

export class MendeleyService {
  /**
   * Fetch authenticated user's Mendeley library
   */
  static async getLibrary(): Promise<MendeleyItem[]> {
    try {
      const response = await apiClient.get("/api/mendeley/library");
      return response || [];
    } catch (error) {
      console.error("Failed to fetch Mendeley library:", error);
      throw error;
    }
  }

  /**
   * Search user's Mendeley library by Title
   */
  static async queryLibrary(query: string): Promise<MendeleyItem[]> {
    try {
      const response = await apiClient.get(`/api/mendeley/query?q=${encodeURIComponent(query)}`);
      return response || [];
    } catch (error) {
      console.error("Failed to query Mendeley library:", error);
      throw error;
    }
  }

  /**
   * Get the URL to initiate Mendeley OAuth connection
   */
  static getConnectUrl(): string {
    const apiUrl = process.env.REACT_APP_API_URL || "https://api.colabwize.com";
    const token = localStorage.getItem("token");
    return `${apiUrl}/api/auth/mendeley/connect?token=${token}`;
  }
}

export default MendeleyService;
