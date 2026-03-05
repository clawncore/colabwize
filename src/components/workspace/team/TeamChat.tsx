import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { MentionInput, MentionUser } from "../../ui/mention-input";
import {
  Send,
  MessageSquare,
  X,
  Lock,
  Trash2,
  Reply,
  Loader2,
  Search,
  History,
  Eraser,
  Plus,
  ChevronDown,
  CheckCheck,
} from "lucide-react";
import TeamChatService, {
  TeamChatMessage,
} from "../../../services/teamChatService";
import { supabase } from "../../../lib/supabase/client";
import { useUser } from "../../../services/useUser";
import { useParams } from "react-router-dom";
import WorkspaceService, {
  WorkspaceMember,
} from "../../../services/workspaceService";
import WorkspaceTaskService from "../../../services/workspaceTaskService";
import NotificationService from "../../../services/notificationService";
import { UserDetailsPanel } from "./UserDetailsPanel";

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
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(
    [],
  );
  const [selectedUser, setSelectedUser] = useState<WorkspaceMember | null>(
    null,
  );
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Helper to format date for separators
  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    // If within same week, show day name
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    }

    // Default to DD/MM/YYYY
    return date.toLocaleDateString("en-GB");
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 100;
    setShowScrollButton(!isAtBottom);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

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
          if (data) {
            setWorkspaceName(data.name);
            if (data.members) {
              setWorkspaceMembers(data.members);
            }
          }
        })
        .catch((err) => console.error("Failed to fetch workspace name", err));
    }
  }, [effectiveWorkspaceId, projectId, user, userLoading]);

  // Real-time subscription
  useEffect(() => {
    const channelName = `team-chat-${effectiveWorkspaceId || projectId}`;
    console.log(`[Chat] Subscribing to channel: ${channelName}`);

    // Register WebSocket from NotificationServer
    const handleChannelMessage = async (data: any) => {
      console.log("[Chat] Custom WS message received:", data);

      if (data.type === "NEW_MESSAGE" || data.type === "MESSAGE_DELETED") {
        // Refresh thoroughly in background to ensure correct threading/decryption forms
        try {
          const fetchedData = await TeamChatService.getMessages({
            workspaceId: effectiveWorkspaceId,
            projectId,
          });
          setMessages(fetchedData);
        } catch (err) {
          console.error(
            "[Chat] Failed to refresh messages after custom WS event:",
            err,
          );
        }
      }
    };

    NotificationService.subscribeToChannels([channelName]);
    NotificationService.on(`channel:${channelName}`, handleChannelMessage);

    const channel = supabase
      .channel(channelName)
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
          console.log("[Chat] New message received via Realtime:", payload);
          // Refresh the whole list to maintain order and threading
          try {
            const data = await TeamChatService.getMessages({
              workspaceId: effectiveWorkspaceId,
              projectId,
            });
            setMessages(data);
          } catch (err) {
            console.error(
              "[Chat] Failed to refresh messages on real-time event:",
              err,
            );
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
          console.log("[Chat] Message deleted via Realtime:", payload);
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        },
      )
      .subscribe((status) => {
        console.log(`[Chat] Subscription status for ${channelName}:`, status);
      });

    return () => {
      console.log(`[Chat] Unsubscribing from channel: ${channelName}`);
      NotificationService.unsubscribeFromChannels([channelName]);
      NotificationService.off(`channel:${channelName}`, handleChannelMessage);
      supabase.removeChannel(channel);
    };
  }, [effectiveWorkspaceId, projectId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Reactive logging for messages
  useEffect(() => {
    console.log(`[Chat] Messages state updated. Count: ${messages.length}`);
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !user) return;

    try {
      const content = inputValue;
      setInputValue("");

      console.log("[Chat] Sending message...");

      // OPTIMISTIC UI: Emulate the message locally immediately
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: TeamChatMessage = {
        id: tempId,
        user_id: user.id || "",
        content: content,
        workspace_id: effectiveWorkspaceId,
        project_id: projectId,
        parent_id: replyTo?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: user.id || "",
          full_name:
            (user as any)?.user_metadata?.full_name || user.email || "User",
          email: user?.email || "",
        },
        parent: replyTo ? { ...replyTo, content: replyTo.content } : null,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      scrollToBottom();

      await TeamChatService.sendMessage({
        content,
        workspaceId: effectiveWorkspaceId,
        projectId,
        parentId: replyTo?.id,
      });

      setReplyTo(null);

      // Manual refresh as fallback for Realtime
      console.log("[Chat] Manual refresh after send...");
      const data = await TeamChatService.getMessages({
        workspaceId: effectiveWorkspaceId,
        projectId,
      });
      setMessages(data);
    } catch (err) {
      console.error("[Chat] Failed to send message:", err);
      // Remove optimistic message on fail
      const data = await TeamChatService.getMessages({
        workspaceId: effectiveWorkspaceId,
        projectId,
      });
      setMessages(data);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await TeamChatService.deleteMessage(id);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleNewChat = () => {
    setInputValue("");
    setReplyTo(null);
    setSearchQuery("");
    setIsSearching(false);

    // Scroll to bottom and try to focus the input smoothly
    setTimeout(() => {
      scrollToBottom();
      const input = document.querySelector(
        'textarea[placeholder="Type a message..."], input[placeholder="Type a message..."], .mention-input textarea, .mention-input input',
      ) as HTMLElement;
      if (input) input.focus();
    }, 100);
  };



  const handleClearChat = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear the entire chat history? This cannot be undone.",
      )
    )
      return;

    try {
      await TeamChatService.clearChat({
        workspaceId: effectiveWorkspaceId,
        projectId,
      });
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  const handleUserClick = (userId: string) => {
    // Attempt to find the full member details
    const member = workspaceMembers.find((m) => m.user_id === userId);
    if (member) {
      setSelectedUser(member);
    } else {
      console.warn("Could not find full member details for user:", userId);
    }
  };

  return (
    <div
      className={`flex flex-row h-full border-l border-border bg-white overflow-hidden relative ${className}`}>
      {/* Left Side: Main Chat UI */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Page Header - Refined Minimalist Style */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight text-slate-800 flex items-center gap-2">
              {workspaceName || (
                <div className="h-5 w-32 bg-gray-50 animate-pulse rounded" />
              )}{" "}
              Group Chat
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-bold tracking-wide uppercase">
                <Lock className="w-2.5 h-2.5" /> Encrypted
              </p>
              <span className="text-[10px] text-slate-300">•</span>
              <p className="text-[10px] text-slate-400 font-medium">
                {messages.length} messages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
              title="New Chat">
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearching(!isSearching)}
              className={`h-8 w-8 rounded-full transition-all ${isSearching ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
              title="Chat History / Search">
              <History className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
              title="Clear Chat">
              <Eraser className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isSearching && (
          <div className="px-6 py-2 bg-slate-50/50 border-b border-gray-100 animate-in slide-in-from-top-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search in conversation..."
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Messages Area - Ultra-clean White Background */}
        <div className="relative flex-1 flex flex-col min-h-0">
          <ScrollArea
            className="flex-1 px-4 py-6 scroll-smooth"
            ref={scrollRef}
            onScrollCapture={handleScroll}>
            <div className="flex flex-col gap-4 max-w-4xl mx-auto pb-4">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="bg-gray-50 p-6 rounded-full mb-6 border border-gray-100">
                    <MessageSquare className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-400">
                    Secure Team Communication
                  </p>
                  <p className="text-xs text-gray-300 mt-1 max-w-[200px]">
                    Messages are protected with workspace-level encryption.
                  </p>
                </div>
              ) : (
                (() => {
                  const filteredMessages = messages.filter(
                    (msg) =>
                      !searchQuery ||
                      msg.content
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      msg.user.full_name
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      msg.user.email
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  );

                  if (filteredMessages.length === 0 && searchQuery) {
                    return (
                      <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                        <Search className="w-8 h-8 opacity-20 mb-3" />
                        <p>No messages found matching "{searchQuery}"</p>
                      </div>
                    );
                  }

                  let lastDate = "";
                  return filteredMessages.map((msg, index) => {
                    const isMe = msg.user_id === user?.id;
                    const msgDate = new Date(msg.created_at).toDateString();
                    const showSeparator = msgDate !== lastDate;
                    if (showSeparator) lastDate = msgDate;

                    return (
                      <div
                        key={msg.id || index}
                        className="flex flex-col gap-4">
                        {showSeparator && (
                          <div className="flex justify-center my-4 sticky top-2 z-10">
                            <span className="bg-slate-100/80 backdrop-blur-sm text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-slate-200/50 uppercase tracking-widest">
                              {formatDateSeparator(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          <button
                            onClick={() => handleUserClick(msg.user_id)}
                            className="focus:outline-none transition-transform hover:scale-105"
                            title={`View ${msg.user.full_name || "User"} profile`}>
                            <Avatar
                              className={`h-7 w-7 shrink-0 border ${isMe ? "border-emerald-100" : "border-slate-100"}`}>
                              <AvatarImage src={undefined} />
                              <AvatarFallback
                                className={`${isMe ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"} text-[10px] font-bold`}>
                                {msg.user.full_name?.charAt(0) ||
                                  msg.user.email?.charAt(0) ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                          </button>

                          <div
                            className={`group relative max-w-[85%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                            {!isMe && (
                              <button
                                onClick={() => handleUserClick(msg.user_id)}
                                className="focus:outline-none text-[10px] font-bold text-slate-400 hover:text-emerald-600 transition-colors ml-1 mb-1 uppercase tracking-wider text-left"
                                title={`View ${msg.user.full_name || "User"} profile`}>
                                {msg.user.full_name || "Team Member"}
                              </button>
                            )}

                            <div
                              className={`text-[13px] leading-[1.5] py-2 px-3.5 rounded-2xl break-words relative transition-all border shadow-sm
                              ${isMe
                                  ? "bg-emerald-50/50 border-emerald-100 text-slate-800 rounded-tr-none"
                                  : "bg-white border-slate-100 text-slate-800 rounded-tl-none"
                                }`}>
                              {msg.parent && (
                                <div className="mb-2 p-2 bg-slate-50/80 border-l-2 border-emerald-500 rounded text-[11px] text-slate-500 italic flex flex-col gap-0.5">
                                  <span className="font-bold text-[10px] text-emerald-600 non-italic not-italic">
                                    Replying to{" "}
                                    {msg.parent.user.full_name || "Team Member"}
                                  </span>
                                  <span className="line-clamp-1">
                                    {msg.parent.content}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-col gap-0.5">
                                <span>{msg.content}</span>
                                <div
                                  className={`flex items-center justify-end gap-1 -mb-0.5 -mr-1 self-end`}>
                                  <span className="text-[9px] text-slate-400 font-medium">
                                    {new Date(
                                      msg.created_at,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    })}
                                  </span>
                                  {isMe && (
                                    <CheckCheck className="w-3 h-3 text-emerald-500" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Message Actions (Visible on hover) */}
                            <div
                              className={`flex items-center gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1`}>
                              <button
                                onClick={() => setReplyTo(msg)}
                                className="text-[10px] text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors font-medium">
                                <Reply className="w-3 h-3" /> Reply
                              </button>
                              {isMe && (
                                <button
                                  onClick={() => handleDelete(msg.id)}
                                  className="text-[10px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors font-medium">
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </ScrollArea>

          {/* Scroll to Bottom Button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-4 right-6 h-9 w-9 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all animate-bounce z-20"
              title="Scroll to latest">
              <ChevronDown className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          {replyTo && (
            <div className="flex items-center justify-between mb-3 p-2 bg-emerald-50/50 border-l-4 border-emerald-500 rounded text-[10px] animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 truncate">
                <div className="bg-emerald-100 p-1 rounded">
                  <Reply className="w-3 h-3 text-emerald-600" />
                </div>
                <div>
                  <span className="font-bold text-emerald-700">
                    Replying to {replyTo.user.full_name || "User"}
                  </span>
                  <p className="text-slate-500 truncate max-w-[200px]">
                    {replyTo.content}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                className="p-1 hover:bg-emerald-100 rounded-full transition-all">
                <X className="w-3 h-3 text-slate-400" />
              </button>
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="flex gap-3 items-center max-w-4xl mx-auto">
            <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-emerald-500/50 transition-all px-3 py-1 flex items-center shadow-sm">
              <MentionInput
                value={inputValue}
                onChange={setInputValue}
                users={members}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none focus-visible:ring-0 min-h-[36px] max-h-[120px] text-[13px] py-2"
                onEnter={() => handleSend()}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-md transform hover:scale-105 active:scale-95 transition-all shrink-0"
              disabled={!inputValue.trim()}>
              <Send className="w-5 h-5 text-white" />
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side: User Details Panel */}
      {selectedUser && (
        <UserDetailsPanel
          member={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
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
