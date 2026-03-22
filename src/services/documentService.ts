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
  workspace_id?: string;
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
    description: string = "",
    workspaceId?: string,
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("title", title);
    formData.append("description", description);
    if (workspaceId) {
      formData.append("workspaceId", workspaceId);
    }

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

  normalizeProject(project: any): Project {
    if (!project) return project;
    return {
      ...project,
      originality_scans: (project.originality_scans || []).map((scan: any) => ({
        ...scan,
        overallScore: scan.overall_score ?? scan.overallScore,
        scanStatus: scan.scan_status ?? scan.scanStatus,
        matchCount: scan.match_count ?? scan.matchCount,
        scannedAt: scan.scanned_at ?? scan.scannedAt,
        wordsScanned: scan.words_scanned ?? scan.wordsScanned,
        costAmount: scan.cost_amount ?? scan.costAmount,
        projectId: scan.project_id ?? scan.projectId,
        userId: scan.user_id ?? scan.userId,
      })),
    };
  },

  async getProjects(): Promise<GetProjectsResponse> {
    try {
      const response = await apiClient.get("/api/documents");
      if (response.success && response.data) {
        response.data = response.data.map((p: any) => this.normalizeProject(p));
      }
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
    updates?: any,
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      const response = await apiClient.put(`/api/documents/${projectId}`, {
        title,
        description,
        content,
        word_count: wordCount,
        citation_style: citationStyle,
        ...updates,
      });
      if (response.success && response.data) {
        response.data = this.normalizeProject(response.data);
      }
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
    projectId: string,
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      const response = await apiClient.get(`/api/documents/${projectId}`);
      if (response.success && response.data) {
        response.data = this.normalizeProject(response.data);
      }
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
    projectId: string = "",
    workspaceId?: string,
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      const response = await apiClient.post("/api/documents/create", {
        title,
        description,
        content,
        projectId,
        workspace_id: workspaceId || null,
      });
      if (response.success && response.data) {
        response.data = this.normalizeProject(response.data);
      }
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
    content: any,
    workspaceId?: string,
  ): Promise<{ success: boolean; data?: Project; error?: string }> {
    try {
      return this.createProject(
        title,
        description,
        content,
        projectId,
        workspaceId,
      );
    } catch (error: any) {
      console.error("Duplicate project error:", error);
      return {
        success: false,
        error: error.message || "Failed to duplicate project",
      };
    }
  },

  async deleteProject(
    projectId: string,
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

  // Get all projects for a user
  async getUserProjects(userId: string, archived: boolean = false) {
    try {
      const queryParams = new URLSearchParams({ userId });
      if (archived) {
        queryParams.append("archived", "true");
      }

      const response = await apiClient.get(
        `/api/projects?${queryParams.toString()}`,
      );
      
      const projects = response.projects || response.data || response;
      
      if (Array.isArray(projects)) {
        return projects.map((p: any) => this.normalizeProject(p));
      }
      
      return projects;
    } catch (error) {
      console.error("Error fetching user projects:", error);
      throw error;
    }
  },

  // Get all projects for a user in a specific workspace
  async getUserProjectsInWorkspace(
    userId: string,
    workspaceId: string,
    archived: boolean = false,
  ) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("workspaceId", workspaceId);
      if (archived) {
        queryParams.append("archived", "true");
      }

      const response = await apiClient.get(
        `/api/projects?${queryParams.toString()}`,
      );
      return response.data || response.projects || response;
    } catch (error) {
      console.error("Error fetching user projects in workspace:", error);
      throw error;
    }
  },

  // Get all projects for a user that are not in any workspace (personal projects)
  async getUserPersonalProjects(userId: string, archived: boolean = false) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("workspaceId", "null"); // null indicates personal projects
      if (archived) {
        queryParams.append("archived", "true");
      }

      const response = await apiClient.get(
        `/api/projects?${queryParams.toString()}`,
      );
      return response.data || response.projects || response;
    } catch (error) {
      console.error("Error fetching user personal projects:", error);
      throw error;
    }
  },

  // Get document versions for a project
  async getDocumentVersions(projectId: string) {
    try {
      const response = await apiClient.get(
        `/api/editor/versions?projectId=${projectId}`,
      );
      return response.versions || response;
    } catch (error) {
      console.error("Error fetching document versions:", error);
      throw error;
    }
  },

  // Create a document version
  async createDocumentVersion(
    projectId: string,
    content: any,
    wordCount: number,
  ) {
    try {
      const response = await apiClient.post(`/api/editor/versions`, {
        projectId,
        content,
        wordCount,
        force: true,
      });
      return response.version || response;
    } catch (error) {
      console.error("Error creating document version:", error);
      throw error;
    }
  },

  // Restore a document version
  async restoreDocumentVersion(projectId: string, versionId: string) {
    try {
      const response = await apiClient.post(`/api/editor/restore-version`, {
        projectId,
        versionId,
      });
      return response.project || response;
    } catch (error) {
      console.error("Error restoring document version:", error);
      throw error;
    }
  },

  // Delete a document version
  async deleteDocumentVersion(projectId: string, versionId: string) {
    try {
      const response = await apiClient.delete(
        `/api/editor/versions/${versionId}?projectId=${projectId}`,
        {},
      );
      return response;
    } catch (error) {
      console.error("Error deleting document version:", error);
      throw error;
    }
  },

  // Get a specific document version - currently not supported by backend
  async getDocumentVersion(projectId: string, versionId: string) {
    try {
      // Get all versions and find the specific one
      const allVersions = await this.getDocumentVersions(projectId);
      const specificVersion = allVersions.find((v: any) => v.id === versionId);

      if (!specificVersion) {
        throw new Error(`Version with ID ${versionId} not found`);
      }

      return specificVersion;
    } catch (error) {
      console.error("Error fetching document version:", error);
      throw error;
    }
  },

  // Get version schedules for a project
  async getVersionSchedules(projectId: string) {
    try {
      const response = await apiClient.get(
        `/api/projects/${projectId}/version-schedules`,
      );
      return response.schedules || response;
    } catch (error) {
      console.error("Error fetching version schedules:", error);
      throw error;
    }
  },

  // Create a version schedule
  async createVersionSchedule(
    projectId: string,
    scheduleData: { frequency: string },
  ) {
    try {
      const response = await apiClient.post(
        `/api/projects/${projectId}/version-schedules`,
        scheduleData,
      );
      return response.schedule || response;
    } catch (error) {
      console.error("Error creating version schedule:", error);
      throw error;
    }
  },

  // Update a version schedule
  async updateVersionSchedule(
    projectId: string,
    scheduleId: string,
    updateData: { enabled?: boolean; frequency?: string },
  ) {
    try {
      const response = await apiClient.put(
        `/api/projects/${projectId}/version-schedules/${scheduleId}`,
        updateData,
      );
      return response.schedule || response;
    } catch (error) {
      console.error("Error updating version schedule:", error);
      throw error;
    }
  },

  // Delete a version schedule
  async deleteVersionSchedule(projectId: string, scheduleId: string) {
    try {
      const response = await apiClient.delete(
        `/api/projects/${projectId}/version-schedules/${scheduleId}`,
        {},
      );
      return response;
    } catch (error) {
      console.error("Error deleting version schedule:", error);
      throw error;
    }
  },

  // Get all projects for a user that are in a workspace (workspace projects)
  async getUserWorkspaceProjects(userId: string, archived: boolean = false) {
    try {
      const queryParams = new URLSearchParams({ userId });
      queryParams.append("workspaceId", "not-null"); // indicates projects that have a workspace

      if (archived) {
        queryParams.append("archived", "true");
      }

      const response = await apiClient.get(
        `/api/projects?${queryParams.toString()}`,
      );
      return response.projects || response;
    } catch (error) {
      console.error("Error fetching user workspace projects:", error);
      throw error;
    }
  },
};
