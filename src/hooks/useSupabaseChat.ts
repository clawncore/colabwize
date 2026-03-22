import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase/client";
import encryptionService from "../services/encryptionService";
import { TeamChatMessage } from "../services/teamChatService";
import ConfigService from "../services/ConfigService";

interface UseSupabaseChatProps {
  workspaceId?: string;
  projectId?: string;
  onNewMessage: (message: TeamChatMessage) => void;
  onMessageDeleted: (messageId: string) => void;
  onMessageUpdated: (message: TeamChatMessage) => void;
  currentUser: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
}

export function useSupabaseChat({
  workspaceId,
  projectId,
  onNewMessage,
  onMessageDeleted,
  onMessageUpdated,
  currentUser,
}: UseSupabaseChatProps) {
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const optimisticIdsRef = useRef<Set<string>>(new Set());

  const addOptimisticId = useCallback((id: string) => {
    optimisticIdsRef.current.add(id);
    setTimeout(() => {
      optimisticIdsRef.current.delete(id);
    }, 10000);
  }, []);

  const sendTypingStatus = useCallback(
    (isTyping: boolean) => {
      if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const chatRoomId = projectId || workspaceId;
        const channelName = `team-chat-${chatRoomId}`;
        
        wsRef.current.send(JSON.stringify({
          type: "typing",
          channel: channelName,
          isTyping
        }));
      }
    },
    [isConnected, workspaceId, projectId],
  );

  // Use refs to avoid re-subscribing handlers in effects
  const onNewMessageRef = useRef(onNewMessage);
  const onMessageDeletedRef = useRef(onMessageDeleted);
  const onMessageUpdatedRef = useRef(onMessageUpdated);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onMessageDeletedRef.current = onMessageDeleted;
    onMessageUpdatedRef.current = onMessageUpdated;
  }, [onNewMessage, onMessageDeleted, onMessageUpdated]);

  useEffect(() => {
    if (!currentUser?.id || (!workspaceId && !projectId)) return;

    const contextId = workspaceId || projectId || "global";
    const chatRoomId = projectId || workspaceId;
    const channelName = `team-chat-${chatRoomId}`;
    let reconnectTimeout: any;

    const connect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const url = ConfigService.getNotificationUrl();
        const ws = new WebSocket(`${url}?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("[WS] Connected to backend notification server");
          setIsConnected(true);
          
          // Subscribe to the chat channel
          ws.send(JSON.stringify({
            type: "subscribe",
            channels: [channelName, "global-presence"]
          }));
        };

        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === "channel_message") {
              const { channel, data: payload } = data;
              
              if (channel === channelName) {
                // Handle Chat Events
                switch (payload.type) {
                  case "NEW_MESSAGE": {
                    const msg = payload.message;
                    if (optimisticIdsRef.current.has(msg.id)) {
                      optimisticIdsRef.current.delete(msg.id);
                      return;
                    }
                    
                    // Decrypt content
                    const decryptedContent = await encryptionService.decrypt(msg.content, contextId);
                    
                    // Decrypt parent content if exists
                    let parent = msg.parent;
                    if (parent && parent.content) {
                      const decryptedParentContent = await encryptionService.decrypt(parent.content, contextId);
                      parent = { ...parent, content: decryptedParentContent };
                    }

                    onNewMessageRef.current({ ...msg, content: decryptedContent, parent });
                    break;
                  }
                  case "MESSAGE_UPDATED": {
                    const msg = payload.message;
                    const decryptedContent = await encryptionService.decrypt(msg.content, contextId);
                    
                    // Decrypt parent content if exists
                    let parent = msg.parent;
                    if (parent && parent.content) {
                      const decryptedParentContent = await encryptionService.decrypt(parent.content, contextId);
                      parent = { ...parent, content: decryptedParentContent };
                    }

                    onMessageUpdatedRef.current({ ...msg, content: decryptedContent, parent });
                    break;
                  }
                  case "MESSAGE_DELETED": {
                    onMessageDeletedRef.current(payload.messageId);
                    break;
                  }
                  case "TYPING_STATUS": {
                    if (payload.userId !== currentUser.id) {
                      setTypingUsers(prev => ({
                        ...prev,
                        [payload.userId]: payload.isTyping
                      }));
                    }
                    break;
                  }
                }
              } else if (channel === "global-presence") {
                // Update active users based on presence (if implemented on backend)
                if (payload.type === "USER_PRESENCE") {
                  // This is a simplified version, real presence would need a full list
                }
              }
            }
          } catch (err) {
            console.error("[WS] Message processing error:", err);
          }
        };

        ws.onclose = () => {
          console.log("[WS] Disconnected from backend");
          setIsConnected(false);
          // Try to reconnect after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };

        ws.onerror = (error) => {
          console.error("[WS] Connection error:", error);
        };

      } catch (err) {
        console.error("[WS] Setup error:", err);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [workspaceId, projectId, currentUser?.id]);

  return {
    activeUsers, // Note: backend presence still basic, but chat is fully functional
    typingUsers,
    isConnected,
    addOptimisticId,
    sendTypingStatus,
  };
}
