"use client";
import { getErrorMessage } from "../../../utils/errorHandler";
import { Imessage, useMessage } from "../../../stores/messages";
import { formatChatDate } from "../../../lib/utils";
import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import { DeleteAlert, EditAlert } from "./MessasgeActions";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import { toast } from "sonner";
import { ArrowDown } from "lucide-react";
import LoadMoreMessages from "./LoadMoreMessages";
import { useUser } from "../../../stores/user";
import { useTypingStore } from "../../../stores/typing";

export default function ListMessages({
  workspaceId,
  projectId,
  onAvatarClick,
  searchQuery,
  isPanel,
}: {
  workspaceId?: string;
  projectId?: string;
  onAvatarClick?: (userId: string, userData?: any) => void;
  searchQuery?: string;
  isPanel?: boolean;
}) {
  const scrollRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const [userScrolled, setUserScrolled] = useState(false);
  const [notification, setNotification] = useState(0);
  const user = useUser((state) => state.user);
  const { typingUsers, setTyping, removeTyping, clearStale } = useTypingStore();

  const chatRoomId = projectId || workspaceId;
  const currentTypingUsers = (chatRoomId && typingUsers[chatRoomId]) || [];
  const otherTypingUsers = currentTypingUsers.filter(u => u.userId !== user?.id);

  const {
    messages,
    addMessage,
    optimisticIds,
    optimisticDeleteMessage,
    optimisticUpdateMessage,
  } = useMessage((state) => state);

  const optimisticIdsRef = useRef(optimisticIds);
  useEffect(() => {
    optimisticIdsRef.current = optimisticIds;
  }, [optimisticIds]);

  const supabase = supabaseBrowser();

  useEffect(() => {
    if (!chatRoomId || !user) return;

    const channel = supabase.channel(`chat_events:${chatRoomId}`);
    
    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        setTyping(chatRoomId, {
          userId: payload.userId,
          userName: payload.userName,
          timestamp: payload.timestamp
        });
      })
      .on('broadcast', { event: 'stopped_typing' }, ({ payload }) => {
        removeTyping(chatRoomId, payload.userId);
      })
      .subscribe();

    const interval = setInterval(() => {
      clearStale(chatRoomId);
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [chatRoomId, user, setTyping, removeTyping, clearStale, supabase]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "TeamChatMessage" },
        async (payload) => {
          if (!optimisticIdsRef.current.includes(payload.new.id)) {
            // Filter by projectId if specified, else by workspaceId
            if (projectId) {
              if (payload.new.project_id !== projectId) return;
            } else if (workspaceId && payload.new.workspace_id !== workspaceId) {
              return;
            }

            const { error, data } = await supabase
              .from("users")
              .select("*")
              .eq("id", payload.new.user_id)
              .single();
            if (error) {
              toast.error(getErrorMessage(error));
            } else {
              const newMessage = {
                ...payload.new,
                users: data,
              } as unknown as Imessage;
              addMessage(newMessage);
            }
          }
          const scrollContainer = scrollRef.current;
          if (
            scrollContainer.scrollTop <
            scrollContainer.scrollHeight - scrollContainer.clientHeight - 10
          ) {
            setNotification((current) => current + 1);
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "TeamChatMessage" },
        (payload) => {
          optimisticDeleteMessage(payload.old.id);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "TeamChatMessage" },
        (payload) => {
          optimisticUpdateMessage(payload.new as Imessage);
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [workspaceId, projectId, user]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer && !userScrolled) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const handleOnScroll = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const isScroll =
        scrollContainer.scrollTop <
        scrollContainer.scrollHeight - scrollContainer.clientHeight - 10;
      setUserScrolled(isScroll);
      if (
        scrollContainer.scrollTop ===
        scrollContainer.scrollHeight - scrollContainer.clientHeight
      ) {
        setNotification(0);
      }
    }
  };
  const scrollDown = () => {
    setNotification(0);
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  return (
    <>
      <div
        className={`flex-1 min-h-0 flex flex-col ${isPanel ? "p-3 space-y-2" : "p-6 space-y-4"} overflow-y-auto bg-[#F0F2F5]`}
        ref={scrollRef}
        onScroll={handleOnScroll}>
        <div className="flex-1 pb-2">
          <LoadMoreMessages workspaceId={workspaceId} projectId={projectId} />
        </div>
        <div className={`${isPanel ? "space-y-2" : "space-y-4"} pb-2`}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                <svg
                  className="w-8 h-8 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-slate-900 font-semibold">No messages yet</p>
                <p className="text-slate-500 text-sm max-w-[200px] leading-relaxed">
                  Be the first to start a conversation in this workspace!
                </p>
              </div>
            </div>
          )}
          {messages
            .filter((msg) => {
              // When scoped to a project, only show project messages
              if (projectId) return msg.project_id === projectId;
              // When scoped to workspace (no projectId), only show workspace-level messages (no project_id)
              if (workspaceId) return !msg.project_id;
              return true;
            })
            .filter((msg) => 
              searchQuery 
                ? msg.content.toLowerCase().includes(searchQuery.toLowerCase()) 
                : true
            )
            .map((value, index, array) => {
              const date = formatChatDate(value.created_at);
              const prevDate = index > 0 ? formatChatDate(array[index - 1].created_at) : null;
              const showSeparator = date !== prevDate;

              return (
                <React.Fragment key={value.id || index}>
                  {showSeparator && (
                    <div className="flex justify-center my-6">
                      <div className="bg-slate-200/50 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm border border-slate-200/50">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {date}
                        </span>
                      </div>
                    </div>
                  )}
                  <Message
                    message={value}
                    workspaceId={workspaceId!}
                    projectId={projectId}
                    onAvatarClick={onAvatarClick}
                    isPanel={isPanel}
                  />
                </React.Fragment>
              );
            })}

          {/* Typing Indicator */}
          {otherTypingUsers.length > 0 && (
            <div className="flex items-center gap-2 px-2 py-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex gap-1 bg-white/80 backdrop-blur-sm p-2 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                <div className="flex gap-1 items-center">
                  <span className="flex gap-0.5">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 ml-1">
                    {otherTypingUsers.length === 1 
                      ? `${otherTypingUsers[0].userName} is typing...`
                      : otherTypingUsers.length === 2
                      ? `${otherTypingUsers[0].userName} and ${otherTypingUsers[1].userName} are typing...`
                      : "Several people are typing..."}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DeleteAlert />
        <EditAlert workspaceId={workspaceId} />
      </div>
      {userScrolled && (
        <div className=" absolute bottom-20 w-full">
          {notification ? (
            <div
              className="w-36 mx-auto bg-indigo-500 p-1 rounded-md cursor-pointer"
              onClick={scrollDown}>
              <h1>New {notification} messages</h1>
            </div>
          ) : (
            <div
              className="w-10 h-10 bg-blue-500 rounded-full justify-center items-center flex mx-auto border cursor-pointer hover:scale-110 transition-all"
              onClick={scrollDown}>
              <ArrowDown />
            </div>
          )}
        </div>
      )}
    </>
  );
}
