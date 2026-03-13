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
  isPanel?: boolean;
}

export function TeamChat({
  workspaceId,
  projectId,
  title = "Team Chat",
  className = "",
  onClose,
  isPanel = false,
}: TeamChatProps) {
  // Extract workspaceId from URL if not provided as prop
  const params = useParams<{ id: string }>();
  const effectiveWorkspaceId = workspaceId || params.id;
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [projects, setProjects] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<{
    id: string;
    type: "workspace" | "project";
    name: string;
  } | null>(null);

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
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({}); // userId -> name
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

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

  // Fetch initial workspace data
  useEffect(() => {
    if (effectiveWorkspaceId) {
      WorkspaceService.getWorkspace(effectiveWorkspaceId)
        .then((data) => {
          if (data) {
            setWorkspaceName(data.name);
            setProjects(data.projects || []);
            if (data.members) {
              setWorkspaceMembers(data.members);
              const mapped = data.members.map(mapMemberToMentionUser);
              setMembers(mapped);
            }

            // Set initial active channel if not already set by props
            if (!activeChannel) {
              if (projectId) {
                const proj = data.projects?.find(
                  (p: any) => p.id === projectId,
                );
                setActiveChannel({
                  id: projectId,
                  type: "project",
                  name: proj?.title || "Project Chat",
                });
              } else {
                setActiveChannel({
                  id: effectiveWorkspaceId,
                  type: "workspace",
                  name: data.name,
                });
              }
            }
          }
        })
        .catch((err) => console.error("Failed to fetch workspace data", err));
    }
  }, [effectiveWorkspaceId, projectId]);

  // Fetch messages when active channel changes
  useEffect(() => {
    if (userLoading || !user || !activeChannel) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const data = await TeamChatService.getMessages({
          workspaceId:
            activeChannel.type === "workspace" ? activeChannel.id : undefined,
          projectId:
            activeChannel.type === "project" ? activeChannel.id : undefined,
        });
        setMessages(data);

        // Mark latest message as read if it's from someone else
        if (data.length > 0) {
          const lastMsg = data[data.length - 1];
          if (lastMsg.user_id !== user.id) {
            TeamChatService.markAsRead(lastMsg.id).catch(console.error);
          }
        }
      } catch (err) {
        console.error("Failed to load chat messages:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [activeChannel, user, userLoading]);

  // Real-time subscription
  useEffect(() => {
    if (!activeChannel) return;

    const channelName = `team-chat-${activeChannel.id}`;
    const presenceChannel = "global-presence";

    console.log(
      `[Chat] Subscribing to channels: ${channelName}, ${presenceChannel}`,
    );

    const handleChannelMessage = async (data: any) => {
      if (data.type === "NEW_MESSAGE") {
        const msg = data.message;
        // Check if message belongs to current channel
        const isCurrentChannel =
          (activeChannel.type === "workspace" &&
            msg.workspace_id === activeChannel.id) ||
          (activeChannel.type === "project" &&
            msg.project_id === activeChannel.id);

        if (isCurrentChannel) {
          // Decrypt if necessary
          try {
            const encryptionService = (
              await import("../../../services/encryptionService")
            ).default;
            const decryptedContent = await encryptionService.decrypt(
              msg.content,
              activeChannel.id,
            );
            const decryptedMsg = { ...msg, content: decryptedContent };

            setMessages((prev) => {
              if (prev.find((m) => m.id === decryptedMsg.id)) return prev;
              return [...prev, decryptedMsg];
            });

            // Mark as read if not from me
            if (msg.user_id !== user?.id) {
              TeamChatService.markAsRead(msg.id).catch(console.error);
            }
          } catch (err) {
            console.error("Failed to process new message:", err);
          }
        }
      } else if (data.type === "TYPING_STATUS") {
        if (data.userId !== user?.id) {
          setTypingUsers((prev) => {
            const next = { ...prev };
            if (data.isTyping) {
              // Get user name
              const member = workspaceMembers.find(
                (m) => m.user_id === data.userId,
              );
              next[data.userId] = member?.user?.full_name || "Someone";
            } else {
              delete next[data.userId];
            }
            return next;
          });
        }
      } else if (data.type === "USER_PRESENCE") {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          if (data.status === "online") next.add(data.userId);
          else next.delete(data.userId);
          return next;
        });
      } else if (data.type === "MESSAGE_READ") {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === data.messageId) {
              // Update read count locally (simplified)
              return {
                ...m,
                _count: {
                  replies: m._count?.replies || 0,
                  read_by: (m._count?.read_by || 0) + 1,
                },
              };
            }
            return m;
          }),
        );
      }
    };

    NotificationService.subscribeToChannels([channelName, presenceChannel]);
    NotificationService.on(`channel:${channelName}`, handleChannelMessage);
    NotificationService.on(`channel:${presenceChannel}`, handleChannelMessage);

    return () => {
      NotificationService.unsubscribeFromChannels([
        channelName,
        presenceChannel,
      ]);
      NotificationService.off(`channel:${channelName}`, handleChannelMessage);
      NotificationService.off(
        `channel:${presenceChannel}`,
        handleChannelMessage,
      );
    };
  }, [activeChannel, user, workspaceMembers]);

  // Typing status effect
  useEffect(() => {
    if (!inputValue || !activeChannel || !user) return;

    // Broadcast typing start
    NotificationService.sendTypingStatus(`team-chat-${activeChannel.id}`, true);

    const timeout = setTimeout(() => {
      NotificationService.sendTypingStatus(
        `team-chat-${activeChannel.id}`,
        false,
      );
    }, 3000);

    return () => clearTimeout(timeout);
  }, [inputValue, activeChannel, user]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !user || !activeChannel) return;

    try {
      // Resolve @[Name] mentions to @[Name](UserId) using our members list
      const resolvedContent = inputValue.replace(/@\[([^\]]+)\](?!\()/g, (match, name) => {
        const member = members.find(m => m.name === name);
        return member ? `@[${name}](${member.id})` : match;
      });

      const content = resolvedContent;
      setInputValue("");

      // Broadcast typing stop immediately
      NotificationService.sendTypingStatus(
        `team-chat-${activeChannel.id}`,
        false,
      );

      const encryptedMsg = await TeamChatService.sendMessage({
        content,
        workspaceId:
          activeChannel.type === "workspace" ? activeChannel.id : undefined,
        projectId:
          activeChannel.type === "project" ? activeChannel.id : undefined,
        parentId: replyTo?.id,
      });

      // We handle appending via the WebSocket NEW_MESSAGE event,
      // but we can add it optimistically too
      setMessages((prev) => {
        if (prev.find((m) => m.id === encryptedMsg.id)) return prev;
        return [...prev, encryptedMsg];
      });

      setReplyTo(null);
      scrollToBottom();
    } catch (err) {
      console.error("[Chat] Failed to send message:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await TeamChatService.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleClearChat = async () => {
    if (!activeChannel) return;
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    try {
      await TeamChatService.clearChat({
        workspaceId:
          activeChannel.type === "workspace" ? activeChannel.id : undefined,
        projectId:
          activeChannel.type === "project" ? activeChannel.id : undefined,
      });
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  const handleUserClick = (userId: string) => {
    const member = workspaceMembers.find((m) => m.user_id === userId);
    if (member) {
      setSelectedUser(member);
    }
  };

  const renderMessageContent = (content: string) => {
    if (!content) return "";

    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = Array.from(content.matchAll(mentionRegex));

    if (matches.length === 0) return content;

    const parts = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      const fullMatch = match[0];
      const name = match[1];
      const id = match[2];
      const startIndex = match.index || 0;

      // Add text before the mention
      if (startIndex > lastIndex) {
        parts.push(content.substring(lastIndex, startIndex));
      }

      // Add mention badge
      parts.push(
        <button
          key={`mention-${i}`}
          onClick={() => handleUserClick(id)}
          className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[12px] font-bold hover:bg-emerald-200 transition-colors mx-0.5 cursor-pointer relative z-10">
          @{name}
        </button>,
      );

      lastIndex = startIndex + fullMatch.length;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div
      className={`flex h-full bg-white border-l border-border overflow-hidden ${className}`}>
      {/* WhatsApp Left Sidebar: Conversations List */}
      {!isPanel && (
        <div className="w-80 flex flex-col bg-white border-r border-border shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 bg-white flex items-center justify-between border-b border-border">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-emerald-600 text-white font-bold">
              {user?.user_metadata?.full_name?.charAt(0) ||
                user?.email?.charAt(0) ||
                "Y"}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-4 text-slate-500">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-emerald-600"
              onClick={() => setIsSearching(!isSearching)}>
              <MessageSquare className="w-5 h-5" />
            </Button>
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-emerald-600"
                onClick={() => {
                  // This could open a member list or contact selector
                  setIsSearching(true);
                  setTimeout(() => {
                    const searchInput = document.querySelector(
                      'input[placeholder="Search messages..."]',
                    ) as HTMLInputElement;
                    if (searchInput) searchInput.focus();
                  }, 100);
                }}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Sidebar */}
        <div className="p-2 bg-white">
          <div className="relative bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 flex items-center">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search or start new chat"
              className="bg-transparent border-none text-sm w-full focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 bg-white">
          <div className="flex flex-col">
            {/* Workspace General Chat */}
            <div
              onClick={() =>
                setActiveChannel({
                  id: effectiveWorkspaceId!,
                  type: "workspace",
                  name: workspaceName,
                })
              }
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100
                ${activeChannel?.type === "workspace" ? "bg-slate-100" : ""}`}>
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 truncate">
                    Workspace General
                  </h3>
                  <span className="text-[10px] text-slate-400">General</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-1">
                  Shared group chat for {workspaceName}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white overflow-hidden relative">
        {activeChannel ? (
          <>
            {/* Chat Header */}
            <div className="px-3 sm:px-4 py-2 bg-white border-b border-border flex items-center justify-between shrink-0 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Avatar className="h-10 w-10 border border-border shrink-0">
                  <AvatarFallback className="bg-emerald-600 text-white font-bold">
                    {activeChannel.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-800 truncate">
                    {activeChannel.name}
                  </h2>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                    <span className="hidden sm:inline">Group Chat •</span> <Lock className="w-2.5 h-2.5 shrink-0" /> <span className="truncate">E2E Encrypted</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-slate-500 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearching(!isSearching)}
                  className={`h-8 w-8 rounded-full ${isSearching ? "text-emerald-600" : "text-slate-500"}`}>
                  <Search className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearChat}
                  className="h-8 w-8 rounded-full text-slate-500 hover:text-rose-600">
                  <Eraser className="w-4 h-4" />
                </Button>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 rounded-full text-slate-500">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Search Bar (if active) */}
            {isSearching && (
              <div className="px-4 py-2 bg-white border-b border-border animate-in slide-in-from-top-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-emerald-500/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Messages Container */}
            <div className="flex-1 relative min-h-0 bg-white">
              <ScrollArea
                className="h-full px-4 scroll-smooth"
                ref={scrollRef}
                onScrollCapture={handleScroll}>
                <div className="flex flex-col gap-2 py-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="mx-auto mt-10 bg-[#fff9c2] p-2 rounded-lg text-[11px] text-center shadow-sm max-w-[80%] border border-yellow-200/50">
                      <p className="text-slate-600">
                        <Lock className="inline w-3 h-3 mr-1" />
                        Messages are end-to-end encrypted. No one outside of
                        this chat, not even ColabWize, can read them.
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
                            .includes(searchQuery.toLowerCase()),
                      );

                      let lastDate = "";
                      return filteredMessages.map((msg, index) => {
                        const isMe = msg.user_id === user?.id;
                        const msgDate = new Date(msg.created_at).toDateString();
                        const showSeparator = msgDate !== lastDate;
                        if (showSeparator) lastDate = msgDate;

                        // Grouping logic
                        const prevMsg = filteredMessages[index - 1];
                        const isFirstInGroup =
                          !prevMsg ||
                          prevMsg.user_id !== msg.user_id ||
                          showSeparator;
                        const nextMsg = filteredMessages[index + 1];
                        const isLastInGroup =
                          !nextMsg ||
                          nextMsg.user_id !== msg.user_id ||
                          (nextMsg &&
                            new Date(nextMsg.created_at).toDateString() !==
                              msgDate);

                        return (
                          <div
                            key={msg.id || index}
                            className={`flex flex-col ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}>
                            {showSeparator && (
                              <div className="flex justify-center my-4">
                                <span className="bg-slate-100 text-slate-500 text-[11px] px-3 py-1 rounded-lg shadow-sm uppercase tracking-wide">
                                  {formatDateSeparator(msg.created_at)}
                                </span>
                              </div>
                            )}{" "}
                            <div
                              className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
                              {!isMe && (
                                <div className="w-8 shrink-0">
                                  {isLastInGroup && (
                                    <Avatar className="h-8 w-8 border border-border">
                                      <AvatarImage
                                        src={msg.user.avatar_url || ""}
                                      />
                                      <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700 font-bold">
                                        {(msg.user.full_name || "U").charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              )}

                              <div
                                className={`relative max-w-[85%] px-2.5 py-1.5 shadow-sm rounded-lg flex flex-col group
                                 ${isMe ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white rounded-tl-none border border-slate-100"}
                                 ${!isFirstInGroup ? (isMe ? "rounded-tr-lg" : "rounded-tl-lg") : ""}`}>
                                {isFirstInGroup && (
                                  <>
                                    {!isMe && (
                                      <div className="absolute top-0 -left-2 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent"></div>
                                    )}
                                    {isMe && (
                                      <div className="absolute top-0 -right-2 w-0 h-0 border-t-[8px] border-t-[#d9fdd3] border-r-[8px] border-r-transparent"></div>
                                    )}
                                  </>
                                )}

                                {!isMe && isFirstInGroup && (
                                  <button
                                    onClick={() => handleUserClick(msg.user_id)}
                                    className="text-[11px] font-bold text-emerald-700 mb-0.5 text-left hover:underline">
                                    {msg.user.full_name || "Team Member"}
                                  </button>
                                )}

                                {msg.parent && (
                                  <div className="mb-1 p-1.5 bg-black/5 border-l-4 border-emerald-500 rounded text-[11px] text-slate-500 flex flex-col">
                                    <span className="font-bold text-[10px] text-emerald-600">
                                      {msg.parent.user.full_name || "Member"}
                                    </span>
                                    <p className="line-clamp-2 italic text-[10.5px]">
                                      {renderMessageContent(msg.parent.content)}
                                    </p>
                                  </div>
                                )}

                                <div className="flex flex-col pr-14 relative min-h-[1.5rem]">
                                  <div className="text-[13.5px] text-slate-800 whitespace-pre-wrap leading-relaxed break-words">
                                    {renderMessageContent(msg.content)}
                                  </div>
                                  <div className="absolute bottom-[-1px] right-0 flex items-center gap-1 opacity-60">
                                    <span className="text-[9px] text-slate-500 font-medium">
                                      {new Date(
                                        msg.created_at,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                      })}
                                    </span>
                                    {isMe && (
                                      <CheckCheck
                                        className={`w-3 h-3 ${msg._count?.read_by ? "text-blue-500" : "text-slate-400"}`}
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Overlay actions on hover */}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded overflow-hidden flex divide-x divide-black/5">
                                  <button
                                    onClick={() => setReplyTo(msg)}
                                    className="p-1 hover:bg-black/5"
                                    title="Reply">
                                    <Reply className="w-3 h-3 text-slate-500" />
                                  </button>
                                  {isMe && (
                                    <button
                                      onClick={() => handleDelete(msg.id)}
                                      className="p-1 hover:bg-black/5">
                                      <Trash2 className="w-3 h-3 text-red-500" />
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

                  {/* Typing indicator */}
                  {Object.keys(typingUsers).length > 0 && (
                    <div className="flex justify-start mb-2">
                      <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm text-[11px] italic text-slate-500 border border-slate-100">
                        {Object.values(typingUsers).join(", ")}{" "}
                        {Object.keys(typingUsers).length > 1 ? "are" : "is"}{" "}
                        typing...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {showScrollButton && (
                <button
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-6 h-10 w-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-all z-20 border border-slate-100">
                  <ChevronDown className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-2 bg-white flex flex-col border-t border-border">
              {replyTo && (
                <div className="mx-2 mb-2 p-2 bg-white border-l-4 border-emerald-500 rounded shadow-sm flex items-center justify-between text-xs animate-in slide-in-from-bottom-2">
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-emerald-600 uppercase text-[10px]">
                      Replying to {replyTo.user.full_name}
                    </span>
                    <p className="text-slate-500 truncate">{replyTo.content}</p>
                  </div>
                  <X
                    className="w-4 h-4 cursor-pointer hover:text-red-500 shrink-0"
                    onClick={() => setReplyTo(null)}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 px-2">
                <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-transparent focus-within:border-emerald-500/50 transition-all flex items-center shadow-sm">
                  <MentionInput
                    value={inputValue}
                    onChange={setInputValue}
                    users={members}
                    placeholder="Type a message"
                    className="flex-1 bg-transparent border-none focus-visible:ring-0 min-h-[24px] max-h-[100px] text-[15px]"
                    onEnter={() => handleSend()}
                  />
                </div>
                <div
                  className="bg-emerald-600 rounded-full p-2.5 cursor-pointer hover:bg-emerald-700 active:scale-95 transition-all shadow-md flex items-center justify-center"
                  onClick={() => handleSend()}>
                  <Send className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-white border-l border-border">
            <div className="w-64 h-64 bg-[#f8f9fa] rounded-full flex items-center justify-center mb-10 overflow-hidden relative">
              <MessageSquare className="w-32 h-32 text-slate-200" />
            </div>
            <h2 className="text-3xl font-light text-slate-800 mb-4">
              ColabWize Web
            </h2>
            <p className="max-w-md text-slate-500 leading-relaxed">
              Send and receive messages instantly without keeping your phone
              online. Everything is automatically synced and encrypted for your
              security.
            </p>
            <div className="absolute bottom-10 flex items-center gap-1.5 text-slate-400 text-xs">
              <Lock className="w-3 h-3" /> End-to-end encrypted
            </div>
          </div>
        )}
      </div>

      {/* User Details Overlay */}
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
