import { apiClient } from "./apiClient";
import { supabase } from "../lib/supabase/client";

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  iconLink?: string;
  webViewLink?: string;
}

export class GoogleDriveService {
  /**
   * List files from Google Drive
   */
  static async listFiles(folderId: string = 'root'): Promise<GoogleDriveFile[]> {
    try {
      const response = await apiClient.get(`/api/google-drive/list?folderId=${folderId}`);
      return response || [];
    } catch (error) {
      console.error("Failed to list Google Drive files:", error);
      throw error;
    }
  }

  /**
   * Create a new project from a Google Drive file
   */
  static async createProject(fileId: string, title: string, description: string = '', workspaceId?: string): Promise<any> {
    try {
      const response = await apiClient.post("/api/google-drive/create-project", {
        fileId,
        title,
        description,
        workspaceId,
      });
      return response;
    } catch (error) {
      console.error("Failed to create project from Google Drive:", error);
      throw error;
    }
  }

  /**
   * Import a file from Google Drive to the project library (existing project)
   */
  static async importFile(projectId: string, fileId: string): Promise<any> {
    try {
      const response = await apiClient.post("/api/google-drive/import", {
        projectId,
        fileId,
      });
      return response;
    } catch (error) {
      console.error("Failed to import Google Drive file:", error);
      throw error;
    }
  }

  /**
   * Get the URL to initiate Google Drive OAuth connection
   */
  static async getConnectUrl(): Promise<string> {
    const apiUrl = process.env.REACT_APP_API_URL || "https://api.colabwize.com";
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || "";
    return `${apiUrl}/api/auth/google/connect?token=${token}`;
  }
}

export default GoogleDriveService;
