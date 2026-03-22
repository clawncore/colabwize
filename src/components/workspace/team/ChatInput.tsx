"use client";
import React, { useState, useRef, useEffect } from "react";
import { MentionInput, MentionUser } from "../../ui/mention-input";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../../stores/user";
import { EmojiPicker } from "./EmojiPicker";
import { Imessage, useMessage } from "../../../stores/messages";
import { encryptMessage } from "../../../lib/encryption";

export default function ChatInput({
  workspaceId,
  parentId,
  projectId,
  isPanel,
  members = [],
}: {
  workspaceId?: string;
  parentId?: string;
  projectId?: string;
  isPanel?: boolean;
  members?: MentionUser[];
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const user = useUser((state) => state.user);
  const addMessage = useMessage((state) => state.addMessage);
  const setOptimisticIds = useMessage((state) => state.setOptimisticIds);
  const supabase = supabaseBrowser();
  const lastTypingTimeRef = useRef<number>(0);

  const handleEmojiSelect = (emoji: string) => {
    if (!inputRef.current) return;

    const textarea = inputRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newText = text.substring(0, start) + emoji + text.substring(end);
    setText(newText);

    // Restore focus and position cursor after the emoji
    textarea.focus();
    setTimeout(() => {
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast.error("Please log in to send messages");
      return;
    }
    if (text.trim()) {
      const id = uuidv4();

      // When a message is sent, clear typing indicator via REST broadcast (httpSend avoids deprecated WS fallback)
      const chatRoomId = projectId || workspaceId;
      if (chatRoomId && user) {
        supabase
          .channel(`chat_events:${chatRoomId}`)
          .send({
            type: "broadcast",
            event: "stopped_typing",
            payload: { userId: user.id },
          })
          .catch(() => {
            // Suppress errors for this non-critical broadcast
          });
      }
      lastTypingTimeRef.current = 0; // Reset typing time immediately on send

      // Resolve @[Name] mentions to @[Name](UserId) using our members list
      const resolvedContent = text.replace(
        /@\[([^\]]+)\](?!\()/g,
        (match, name) => {
          const member = members.find((m) => m.name === name);
          return member ? `@[${name}](${member.id})` : match;
        },
      );

      const newMessage: Imessage = {
        id,
        content: resolvedContent,
        user_id: user?.id!,
        created_at: new Date().toISOString(),
        users: {
          id: user?.id!,
          avatar_url: user?.user_metadata.avatar_url,
          created_at: new Date().toISOString(),
          full_name:
            user?.user_metadata.full_name || user?.user_metadata.user_name,
        },
      };
      addMessage(newMessage);
      setOptimisticIds(newMessage.id);
      const contextId = projectId || workspaceId || "";
      const encryptedContent = await encryptMessage(resolvedContent, contextId);

      const { error } = await supabase.from("TeamChatMessage").insert({
        id,
        content: encryptedContent,
        user_id: user?.id,
        workspace_id: workspaceId || null,
        project_id: projectId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        toast.error(error.message);
      } else {
        // Create notifications for other members
        const otherMembers = members.filter((m) => m.id !== user?.id);
        if (otherMembers.length > 0) {
          const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
          const mentionedUserIds = new Set(
            Array.from(resolvedContent.matchAll(mentionRegex)).map((m) => m[2]),
          );

          const notifications = otherMembers.map((member) => ({
            id: crypto.randomUUID(), // Generate a UUID to ensure primary key
            user_id: member.id,
            type: mentionedUserIds.has(member.id) ? "mention" : "comment",
            title: `New message in ${workspaceId ? "workspace" : "chat"}`,
            message: `${user?.user_metadata.full_name || user?.email}: ${resolvedContent.substring(0, 50)}${resolvedContent.length > 50 ? "..." : ""}`,
            data: {
              workspaceId,
              messageId: id,
              senderId: user?.id,
            },
            read: false,
            dismissed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          try {
            const { error: notifyError } = await supabase
              .from("notifications")
              .insert(notifications);
            if (notifyError) {
              console.error(
                "TeamChat: Failed to insert notifications!",
                notifyError,
              );
            }
          } catch (e) {
            console.error("TeamChat: Exception during notification insert!", e);
          }
        }
      }
      setText("");
    } else {
      toast.error("Message can not be empty!!");
    }
  };

  useEffect(() => {
    const chatRoomId = projectId || workspaceId;
    if (!chatRoomId || !user) return;

    const broadcastTyping = async () => {
      const now = Date.now();
      // Only broadcast every 2 seconds to avoid flooding
      if (now - lastTypingTimeRef.current > 2000) {
        if (text.length > 0) {
          // Direct REST broadcast sending to bypass WS fallback warnings
          supabase
            .channel(`chat_events:${chatRoomId}`)
            .send({
              type: "broadcast",
              event: "typing",
              payload: {
                userId: user.id,
                userName:
                  user.user_metadata.full_name || user.email.split("@")[0],
                timestamp: now,
              },
            })
            .catch(() => {});
          lastTypingTimeRef.current = now;
        }
      }
    };

    const broadcastStopped = async () => {
      supabase
        .channel(`chat_events:${chatRoomId}`)
        .send({
          type: "broadcast",
          event: "stopped_typing",
          payload: { userId: user.id },
        })
        .catch(() => {});
      lastTypingTimeRef.current = 0;
    };

    if (text.length > 0) {
      broadcastTyping();
    } else if (lastTypingTimeRef.current !== 0) {
      broadcastStopped();
    }
  }, [text, workspaceId, projectId, user, supabase]);


  return (
    <div className={`${isPanel ? "p-2" : "p-4"} bg-[#F0F2F5] shrink-0 border-t flex flex-col gap-2`}>
      <div className={`flex items-center ${isPanel ? "gap-2" : "gap-3"}`}>
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex items-end pr-2 overflow-hidden">
          <div className="flex-1">
            <MentionInput
              ref={inputRef}
              value={text}
              onChange={setText}
              users={members}
              placeholder="Type a message... or use @ to mention someone"
              onEnter={handleSendMessage}
              className={`border-0 focus-visible:ring-0 min-h-[44px] max-h-[120px] ${isPanel ? "py-2" : "py-3"}`}
            />
          </div>
          <div className="pb-1.5 shrink-0">
            <EmojiPicker onSelect={handleEmojiSelect} />
          </div>
        </div>
        <button
          onClick={handleSendMessage}
          className={`${isPanel ? "w-9 h-9" : "w-12 h-12"} rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-md hover:bg-emerald-700 transition-all transform active:scale-95 shrink-0`}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={`${isPanel ? "w-4 h-4" : "w-6 h-6"} rotate-45 mr-1`}
            xmlns="http://www.w3.org/2000/svg">
            <path d="M3.4 22c-.2 0-.4-.1-.5-.2-.3-.3-.4-.7-.2-1l2.5-9L2.7 2.8C2.5 2.5 2.6 2.1 2.9 1.8c.3-.3.8-.4 1.1-.2l17.5 9c.4.2.6.5.6.9s-.2.7-.6.9L3.9 21.8c-.1.1-.3.2-.5.2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
