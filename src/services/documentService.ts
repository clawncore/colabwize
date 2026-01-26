import { apiClient } from "./apiClient";

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  content?: any;
  outline?: any;
  word_count: number;
  citation_style?: string | null;
  file_path?: string;
  file_type?: string;
  created_at: string;
  updated_at: string;
  originality_scans: any[];
  citations: any[];
}

interface UploadResponse {
  success: boolean;
  data?: Project;
  error?: string;
}

interface GetProjectsResponse {
  success: boolean;
  data?: Project[];
  error?: string;
}

export const documentService = {
  async uploadDocument(
    file: File,
    title: string,
    description: string = ""
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("title", title);
    formData.append("description", description);

    try {
      const response = await apiClient.post("/api/documents", formData);
      return response;
    } catch (error: any) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.message || "Upload failed",
      };
    }
  },

  async getProjects(): Promise<GetProjectsResponse> {
    try {
      const response = await apiClient.get("/api/documents");
      return response;
    } catch (error: any) {
      console.error("Fetch projects error:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch projects",
      };
    }
  },

  async updateProject(
    projectId: string,
    title: string,
    description: string,
    content: any,
    wordCount: number,
    citationStyle?: string | null,
    outline?: any
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      const response = await apiClient.put(`/api/documents/${projectId}`, {
        title,
        description,
        content,
        word_count: wordCount,
        citation_style: citationStyle,
        outline,
      });
      return response;
    } catch (error: any) {
      console.error("Update project error:", error);
      return {
        success: false,
        error: error.message || "Failed to update project",
      };
    }
  },

  async getProjectById(
    projectId: string
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      const response = await apiClient.get(`/api/documents/${projectId}`);
      return response;
    } catch (error: any) {
      console.error("Fetch project error:", error);
      return {
        success: false,
        error: error.message || "Failed to fetch project",
      };
    }
  },

  async createProject(
    title: string,
    description: string = "",
    content: any = null,
    projectId: string = ""
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      const response = await apiClient.post("/api/documents/create", {
        title,
        description,
        content,
        projectId,
      });
      return response;
    } catch (error: any) {
      console.error("Create project error:", error);
      return {
        success: false,
        error: error.message || "Failed to create project",
      };
    }
  },

  async duplicateProject(
    projectId: string,
    title: string,
    description: string,
    content: any
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      return this.createProject(title, description, content, projectId);
    } catch (error: any) {
      console.error("Duplicate project error:", error);
      return {
        success: false,
        error: error.message || "Failed to duplicate project",
      };
    }
  },

  async deleteProject(
    projectId: string
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      const response = await apiClient.delete(`/api/projects/${projectId}`);
      return response;
    } catch (error: any) {
      console.error("Delete project error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete project",
      };
    }
  },
};
