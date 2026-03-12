import apiClient from "./apiClient";
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
  user: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url?: string | null;
  };
  parent?: {
    id: string;
    content: string;
    user: {
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
  }) {
    const query = new URLSearchParams();
    if (params.workspaceId) query.append("workspaceId", params.workspaceId);
    if (params.projectId) query.append("projectId", params.projectId);
    if (params.parentId) query.append("parentId", params.parentId);

    const response = await apiClient.get(`/api/team-chat?${query.toString()}`);
    const messages = response.messages as TeamChatMessage[];

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
        };
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
    // Encrypt message content before sending
    const contextId = params.workspaceId || params.projectId || "global";
    const encryptedContent = await encryptionService.encrypt(
      params.content,
      contextId,
    );

    const response = await apiClient.post("/api/team-chat", {
      ...params,
      content: encryptedContent,
    });

    const message = response.message as TeamChatMessage;

    // Return decrypted version for UI
    return {
      ...message,
      content: params.content,
    };
  }

  async deleteMessage(messageId: string) {
    return await apiClient.delete(`/api/team-chat?id=${messageId}`, null);
  }

  async clearChat(params: { workspaceId?: string; projectId?: string }) {
    const query = new URLSearchParams();
    if (params.workspaceId) query.append("workspaceId", params.workspaceId);
    if (params.projectId) query.append("projectId", params.projectId);

    return await apiClient.delete(
      `/api/team-chat/clear?${query.toString()}`,
      null,
    );
  }

  async markAsRead(messageId: string) {
    return await apiClient.post("/api/team-chat/read", { messageId });
  }

  sendTypingStatus(params: {
    workspaceId?: string;
    projectId?: string;
    isTyping: boolean;
  }) {
    // This is handled via WebSocket directly if we have access to it, 
    // but the service could provide a way to emit these events.
    // For now, we'll assume the component will handle the socket.emit("typing", ...)
  }
}

const teamChatService = new TeamChatService();
export default teamChatService;
