import { apiClient } from "./apiClient";

export interface Project {
  id: string;
  workspace_id?: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  role: "admin" | "editor" | "viewer";
  joined_at: string;
  user: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url?: string | null;
  };
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  role?: string; // Current user's role
  members?: WorkspaceMember[];
  projects?: Project[];
  _count?: {
    projects: number;
    members: number;
  };
}

export interface WorkspaceOverviewData {
  stats: {
    projects: {
      active: number;
      completed: number;
      total: number;
    };
    tasks: {
      todo: number;
      in_progress: number;
      done: number;
      total: number;
    };
    members: number;
  };
  myTasks: any[];
  recentActivity: any[];
  projectStats?: any[];
  recentProjects: any[];
}

class WorkspaceService {
  /**
   * Get all workspaces for the current user
   */
  async getWorkspaces(): Promise<Workspace[]> {
    try {
      const response = await apiClient.get("/api/workspaces");
      return response;
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      throw error;
    }
  }

  /**
   * Create a new workspace
   */
  async createWorkspace(data: {
    name: string;
    description?: string;
    icon?: string;
    templateId?: string;
  }): Promise<Workspace> {
    try {
      const response = await apiClient.post("/api/workspaces", data);
      return response;
    } catch (error) {
      console.error("Failed to create workspace:", error);
      throw error;
    }
  }

  /**
   * Get available workspace templates
   */
  async getWorkspaceTemplates(): Promise<any[]> {
    try {
      const response = await apiClient.get("/api/workspace-templates");
      return response.templates || [];
    } catch (error) {
      console.error("Failed to fetch workspace templates:", error);
      return [];
    }
  }

  /**
   * Get a specific workspace by ID
   */
  async getWorkspace(id: string): Promise<Workspace> {
    try {
      const response = await apiClient.get(`/api/workspaces/${id}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch workspace ${id}:`, error);
      throw error;
    }
  }

  /**
   * Invite a member to the workspace
   */
  async inviteMember(
    workspaceId: string,
    email: string,
    role: string = "viewer",
  ): Promise<WorkspaceMember> {
    try {
      const response = await apiClient.post(
        `/api/workspaces/${workspaceId}/invite`,
        {
          email,
          role,
        },
      );
      return response;
    } catch (error) {
      console.error("Failed to invite member:", error);
      throw error;
    }
  }

  /**
   * Update workspace settings (name, description, icon)
   */
  async updateWorkspace(
    id: string,
    data: { name?: string; description?: string; icon?: string }
  ): Promise<Workspace> {
    try {
      const response = await apiClient.put(`/api/workspaces/${id}`, data);
      return response;
    } catch (error) {
      console.error("Failed to update workspace:", error);
      throw error;
    }
  }

  /**
   * Get activity log
   */
  async getActivityLog(workspaceId: string, limit = 20, offset = 0): Promise<any> {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      const response = await apiClient.get(
        `/api/workspaces/${workspaceId}/activity?${queryParams.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch activity log:", error);
      throw error;
    }
  }

  /**
   * Delete a workspace (owner only)
   */
  async deleteWorkspace(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/workspaces/${id}`);
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      throw error;
    }
  }

  /**
   * Update a workspace member's role
   */
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    role: string
  ): Promise<WorkspaceMember> {
    try {
      const response = await apiClient.put(
        `/api/workspaces/${workspaceId}/members/${memberId}`,
        { role }
      );
      return response;
    } catch (error) {
      console.error("Failed to update member role:", error);
      throw error;
    }
  }

  /**
   * Remove a member from the workspace
   */
  async removeMember(workspaceId: string, memberId: string): Promise<void> {
    try {
      await apiClient.delete(
        `/api/workspaces/${workspaceId}/members/${memberId}`
      );
    } catch (error) {
      console.error("Failed to remove member:", error);
      throw error;
    }
  }

  /**
   * Get pending workspace invitations for the current user
   */
  async getPendingInvitations(): Promise<any[]> {
    try {
      const response = await apiClient.get(
        "/api/workspaces/invitations/pending"
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Failed to fetch pending invitations:", error);
      return [];
    }
  }

  /**
   * Accept a workspace invitation
   */
  async acceptInvitation(token: string): Promise<any> {
    try {
      const response = await apiClient.post(
        `/api/workspaces/invitations/${token}/accept`,
        {}
      );
      return response;
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      throw error;
    }
  }

  /**
   * Decline a workspace invitation
   */
  async declineInvitation(token: string): Promise<any> {
    try {
      const response = await apiClient.post(
        `/api/workspaces/invitations/${token}/decline`,
        {}
      );
      return response;
    } catch (error) {
      console.error("Failed to decline invitation:", error);
      throw error;
    }
  }

  /**
   * Get all invitations for a specific workspace (admin only)
   */
  async getWorkspaceInvitations(workspaceId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `/api/workspaces/${workspaceId}/invitations`
      );
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error("Failed to fetch workspace invitations:", error);
      throw error;
    }
  }

  /**
   * Revoke a workspace invitation
   */
  async revokeInvitation(
    workspaceId: string,
    invitationId: string
  ): Promise<void> {
    try {
      await apiClient.delete(
        `/api/workspaces/${workspaceId}/invitations/${invitationId}`
      );
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
      throw error;
    }
  }

  /**
   * Get workspace overview data
   */
  async getWorkspaceOverview(
    workspaceId: string,
  ): Promise<WorkspaceOverviewData> {
    try {
      const response = await apiClient.get(
        `/api/workspaces/${workspaceId}/overview`,
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch workspace overview:", error);
      throw error;
    }
  }
}
const workspaceService = new WorkspaceService();
export default workspaceService;
