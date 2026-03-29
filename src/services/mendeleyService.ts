import { apiClient } from "./apiClient";
import { supabase } from "../lib/supabase/client";
import ConfigService from "./ConfigService";

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
   * Import specific items from Mendeley to a ColabWize project
   */
  static async importItems(projectId: string, items: MendeleyItem[]): Promise<any> {
    try {
      const response = await apiClient.post("/api/mendeley/import", {
        projectId,
        items,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to import Mendeley items:", error);
      throw error;
    }
  }

  /**
   * Get the URL to initiate Mendeley OAuth connection
   */
  static async getConnectUrl(): Promise<string> {
    const apiUrl = ConfigService.getApiUrl();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || "";
    return `${apiUrl}/api/auth/mendeley/connect?token=${token}`;
  }

  /**
   * Fetch authenticated user's Mendeley folders
   */
  static async getFolders(): Promise<any[]> {
    try {
      const response = await apiClient.get("/api/auth/mendeley/folders");
      return response || [];
    } catch (error) {
      console.error("Failed to fetch Mendeley folders:", error);
      throw error;
    }
  }

  /**
   * Fetch items from a specific Mendeley folder
   */
  static async getFolderItems(folderId: string): Promise<MendeleyItem[]> {
    try {
      const response = await apiClient.get(`/api/auth/mendeley/folders/${folderId}/items`);
      return response || [];
    } catch (error) {
      console.error("Failed to fetch Mendeley folder items:", error);
      throw error;
    }
  }
}

export default MendeleyService;
