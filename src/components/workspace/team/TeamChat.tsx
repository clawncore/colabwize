import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { MentionInput, MentionUser } from "../../ui/mention-input";
import { Send, MessageSquare, X, Lock, Trash2, Reply } from "lucide-react";
import TeamChatService, {
  TeamChatMessage,
} from "../../../services/teamChatService";
import { supabase } from "../../../lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "../../../services/useUser";
import { useParams } from "react-router-dom";
import WorkspaceService from "../../../services/workspaceService";
import WorkspaceTaskService from "../../../services/workspaceTaskService";

interface TeamChatProps {
  workspaceId?: string;
  projectId?: string;
  title?: string;
  className?: string;
  onClose?: () => void;
}

export function TeamChat({
  workspaceId,
  projectId,
  title = "Team Chat",
  className = "",
  onClose,
}: TeamChatProps) {
  // Extract workspaceId from URL if not provided as prop
  const params = useParams<{ id: string }>();
  const effectiveWorkspaceId = workspaceId || params.id;
  const [workspaceName, setWorkspaceName] = useState<string>("");

  const { user, loading: userLoading } = useUser();
  const [messages, setMessages] = useState<TeamChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<TeamChatMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [members, setMembers] = useState<MentionUser[]>([]);

  // Fetch workspace members for mentions
  useEffect(() => {
    if (effectiveWorkspaceId) {
      WorkspaceTaskService.getWorkspaceMembers(effectiveWorkspaceId)
        .then((data) => {
          const mapped = data.map(mapMemberToMentionUser);
          setMembers(mapped);
        })
        .catch((err) =>
          console.error("Failed to fetch members for chat mentions:", err),
        );
    }
  }, [effectiveWorkspaceId]);

  // Fetch initial messages
  useEffect(() => {
    // Wait for user authentication to initialize
    if (userLoading) return;

    // If no user after loading, stop here (DashboardLayout usually handles redirect)
    if (!user) {
      setLoading(false);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      try {
        const data = await TeamChatService.getMessages({
          workspaceId: effectiveWorkspaceId,
          projectId,
        });
        setMessages(data);
      } catch (err) {
        console.error("Failed to load chat messages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    // Fetch workspace name
    if (effectiveWorkspaceId) {
      WorkspaceService.getWorkspace(effectiveWorkspaceId)
        .then((data) => {
          if (data) setWorkspaceName(data.name);
        })
        .catch((err) => console.error("Failed to fetch workspace name", err));
    }
  }, [effectiveWorkspaceId, projectId, user, userLoading]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`team-chat-${effectiveWorkspaceId || projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "TeamChatMessage",
          filter: effectiveWorkspaceId
            ? `workspace_id=eq.${effectiveWorkspaceId}`
            : `project_id=eq.${projectId}`,
        },
        async (payload) => {
          // Fetch full message with user info instead of just the payload
          // because the payload doesn't include the 'user' join data
          const newMessageId = (payload.new as any).id;
          try {
            // We can't easily fetch just one with join via apiClient without a new route
            // For now, let's refresh or push a partial (optimization later)
            // Simpler for now: refresh the whole list to maintain order and threading
            const data = await TeamChatService.getMessages({
              workspaceId: effectiveWorkspaceId,
              projectId,
            });
            setMessages(data);
          } catch (err) {
            console.error("Failed to refresh messages:", err);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "TeamChatMessage",
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [effectiveWorkspaceId, projectId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !user) return;

    try {
      const content = inputValue;
      setInputValue("");

      await TeamChatService.sendMessage({
        content,
        workspaceId: effectiveWorkspaceId,
        projectId,
        parentId: replyTo?.id,
      });

      setReplyTo(null);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await TeamChatService.deleteMessage(id);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-white border-l border-border overflow-hidden ${className}`}>
      {/* Page Header - Clean White Style */}
      <div className="p-6 pb-2 bg-white border-b border-border">
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          {workspaceName || (
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          )}{" "}
          Team Chat
        </h1>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Lock className="w-3 h-3" /> End-to-end encrypted
        </p>
      </div>

      {/* Messages Area - Clean White Background */}
      <ScrollArea className="flex-1 px-4 py-8 scroll-smooth" ref={scrollRef}>
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin rounded-full"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
              <div className="bg-slate-50 p-5 rounded-full mb-4 shadow-inner">
                <MessageSquare className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">
                No messages yet
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Your messages are secured with E2EE.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === user?.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar
                    className={`h-9 w-9 shrink-0 shadow-sm border ${isMe ? "border-blue-100" : "border-slate-100"}`}>
                    <AvatarImage src={msg.user.id ? undefined : undefined} />
                    <AvatarFallback
                      className={`${isMe ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"} text-sm font-bold`}>
                      {msg.user.full_name?.charAt(0) ||
                        msg.user.email?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`group relative max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <span className="text-[10px] font-bold text-slate-400 ml-1 mb-1">
                        {msg.user.full_name || "Team Member"}
                      </span>
                    )}

                    <div
                      className={`text-sm py-2.5 px-4 rounded-2xl break-words relative transition-all shadow-sm
                        ${
                          isMe
                            ? "bg-slate-50 dark:bg-blue-900/40 text-slate-900 dark:text-slate-100 rounded-tr-none border border-slate-200/50"
                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200"
                        }`}>
                      {msg.content}
                      <div
                        className={`mt-1.5 flex items-center justify-end gap-1.5 ${isMe ? "text-blue-500" : "text-slate-400"}`}>
                        <span className="text-[9px] font-medium">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && (
                          <div className="text-[10px] font-bold">✓✓</div>
                        )}
                      </div>
                    </div>

                    {/* Message Actions (Visible on hover) */}
                    <div
                      className={`flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1`}>
                      <button
                        onClick={() => setReplyTo(msg)}
                        className="text-[10px] text-slate-400 hover:text-primary flex items-center gap-1 transition-colors">
                        <Reply className="w-3 h-3" /> Reply
                      </button>
                      {isMe && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-[10px] text-slate-400 hover:text-destructive flex items-center gap-1 transition-colors">
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        {replyTo && (
          <div className="flex items-center justify-between mb-3 p-2 bg-slate-50 border-l-4 border-primary rounded text-[10px] animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 truncate">
              <div className="bg-primary/10 p-1 rounded">
                <Reply className="w-3 h-3 text-primary" />
              </div>
              <div>
                <span className="font-bold text-primary">
                  Replying to {replyTo.user.full_name || "User"}
                </span>
                <p className="text-slate-500 truncate max-w-[200px]">
                  {replyTo.content}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 hover:bg-slate-200 rounded-full transition-colors">
              <X className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="flex gap-3 items-center max-w-4xl mx-auto">
          <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-primary/50 transition-all px-3 py-1 flex items-center">
            <MentionInput
              value={inputValue}
              onChange={setInputValue}
              users={members}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 min-h-[36px] max-h-[120px] text-sm py-2"
              onEnter={() => handleSend()}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-full bg-teal-600 hover:bg-teal-700 shadow-md transform hover:scale-105 transition-all shrink-0"
            disabled={!inputValue.trim()}>
            <Send className="w-5 h-5 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// Helper to convert DB member to MentionUser
function mapMemberToMentionUser(member: any): MentionUser {
  return {
    id: member.user?.id || member.id, // Handle different shapes
    name: member.user?.full_name || member.full_name || "User",
    email: member.user?.email || member.email,
    avatar: member.user?.avatar_url || member.avatar_url,
  };
}
