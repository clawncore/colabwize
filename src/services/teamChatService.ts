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
  };
  _count?: {
    replies: number;
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
      messages.map(async (msg) => ({
        ...msg,
        content: await encryptionService.decrypt(msg.content, contextId),
      })),
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
}

const teamChatService = new TeamChatService();
export default teamChatService;
