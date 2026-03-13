import { apiClient } from "./apiClient";
import encryptionService from "./encryptionService";

export interface TeamChatMessage {
  id: string;
  workspace_id?: string;
  project_id?: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url?: string | null;
  };
  parent?: {
    id: string;
    content: string;
    user?: {
      id: string;
      full_name: string | null;
      email: string;
      avatar_url?: string | null;
    };
  } | null;
  _count?: {
    replies: number;
    read_by: number;
  };
}

class TeamChatService {
  async getMessages(params: {
    workspaceId?: string;
    projectId?: string;
    parentId?: string;
    limit?: number;
    offset?: number;
  }) {
    // Call the backend API instead of direct Supabase query
    const response = await apiClient.get("/api/team-chat", {
      params: {
        workspaceId: params.workspaceId,
        projectId: params.projectId,
        parentId: params.parentId,
        limit: params.limit,
        offset: params.offset,
      },
    } as any);

    const messages = (response.messages as any[]) || [];

    // Decrypt messages
    const contextId = params.workspaceId || params.projectId || "global";
    const decryptedMessages = await Promise.all(
      messages.map(async (msg) => {
        const decryptedContent = await encryptionService.decrypt(
          msg.content,
          contextId,
        );
        let decryptedParentContent = undefined;

        if (msg.parent) {
          decryptedParentContent = await encryptionService.decrypt(
            msg.parent.content,
            contextId,
          );
        }

        return {
          ...msg,
          content: decryptedContent,
          parent: msg.parent
            ? {
                ...msg.parent,
                content: decryptedParentContent || msg.parent.content,
              }
            : null,
        } as TeamChatMessage;
      }),
    );

    return decryptedMessages;
  }

  async sendMessage(params: {
    content: string;
    workspaceId?: string;
    projectId?: string;
    parentId?: string;
  }) {
    // Encrypt content on frontend before sending to backend
    const contextId = params.workspaceId || params.projectId || "global";
    const encryptedContent = await encryptionService.encrypt(
      params.content,
      contextId,
    );

    // POST to backend
    const response = await apiClient.post("/api/team-chat", {
      content: encryptedContent,
      workspaceId: params.workspaceId,
      projectId: params.projectId,
      parentId: params.parentId,
    });

    const message = response.message;

    // Return decrypted version for UI
    return {
      ...message,
      content: params.content, // Return plaintext for optimistic UI/immediate display
    } as TeamChatMessage;
  }

  async editMessage(messageId: string, newContent: string, contextId: string) {
    const encryptedContent = await encryptionService.encrypt(
      newContent,
      contextId,
    );

    // Note: Backend currently doesn't have a specific PATCH endpoint for single message update in index.ts
    // but we can add it or just use a generic update if available.
    // For now, let's assume we might need to add it to the backend.
    const response = await apiClient.patch(`/api/team-chat/${messageId}`, {
      content: encryptedContent,
    });

    return { ...response.message, content: newContent };
  }

  async deleteMessage(messageId: string) {
    await apiClient.delete(`/api/team-chat?id=${messageId}`);
    return true;
  }

  async clearChat(params: { workspaceId?: string; projectId?: string }) {
    const queryParams = new URLSearchParams();
    if (params.workspaceId) queryParams.append("workspaceId", params.workspaceId);
    if (params.projectId) queryParams.append("projectId", params.projectId);

    await apiClient.delete(`/api/team-chat/clear?${queryParams.toString()}`);
    return true;
  }

  async markAsRead(messageId: string) {
    await apiClient.post("/api/team-chat/read", { messageId });
    return true;
  }

  sendTypingStatus(params: {
    workspaceId?: string;
    projectId?: string;
    isTyping: boolean;
  }) {
    // Still best handled via Supabase Presence for ultra-low latency
  }
}

const teamChatService = new TeamChatService();
export default teamChatService;
