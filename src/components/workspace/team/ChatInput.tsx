"use client";
import React, { useState, useEffect } from "react";
import { MentionInput, MentionUser } from "../../ui/mention-input";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../../stores/user";
import { Imessage, useMessage } from "../../../stores/messages";
import workspaceTaskService from "../../../services/workspaceTaskService";

export default function ChatInput({ workspaceId }: { workspaceId?: string }) {
  const [text, setText] = useState("");
  const [members, setMembers] = useState<MentionUser[]>([]);
  const user = useUser((state) => state.user);
  const addMessage = useMessage((state) => state.addMessage);
  const setOptimisticIds = useMessage((state) => state.setOptimisticIds);
  const supabase = supabaseBrowser();

  useEffect(() => {
    if (workspaceId) {
      workspaceTaskService
        .getWorkspaceMembers(workspaceId)
        .then((data) => {
          setMembers(
            data.map((member) => ({
              id: member.id,
              name: member.full_name || member.email,
              email: member.email,
            }))
          );
        })
        .catch((err) =>
          console.error("Failed to fetch members for mentions", err)
        );
    }
  }, [workspaceId]);

  const handleSendMessage = async () => {
    if (text.trim()) {
      const id = uuidv4();

      // Resolve @[Name] mentions to @[Name](UserId) using our members list
      const resolvedContent = text.replace(
        /@\[([^\]]+)\](?!\()/g,
        (match, name) => {
          const member = members.find((m) => m.name === name);
          return member ? `@[${name}](${member.id})` : match;
        }
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
      const { error } = await supabase.from("TeamChatMessage").insert({
        content: resolvedContent,
        id,
        user_id: user?.id,
        workspace_id: workspaceId,
      });

      if (error) {
        toast.error(error.message);
      } else {
        // Create notifications for other members
        const otherMembers = members.filter((m) => m.id !== user?.id);
        if (otherMembers.length > 0) {
          const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
          const mentionedUserIds = new Set(
            Array.from(resolvedContent.matchAll(mentionRegex)).map((m) => m[2])
          );

          const notifications = otherMembers.map((member) => ({
            user_id: member.id,
            type: mentionedUserIds.has(member.id) ? "mention" : "comment",
            title: `New message in ${workspaceId ? "workspace" : "chat"}`,
            message: `${user?.user_metadata.full_name || user?.email}: ${resolvedContent.substring(0, 50)}${resolvedContent.length > 50 ? "..." : ""}`,
            data: {
              workspaceId,
              messageId: id,
              senderId: user?.id,
            },
          }));

          await supabase.from("notifications").insert(notifications);
        }
      }
      setText("");
    } else {
      toast.error("Message can not be empty!!");
    }
  };

  return (
    <div className="p-5">
      <MentionInput
        value={text}
        onChange={setText}
        users={members}
        placeholder="send message"
        onEnter={handleSendMessage}
      />
    </div>
  );
}
