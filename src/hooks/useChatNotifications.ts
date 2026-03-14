"use client";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabaseBrowser } from "../lib/supabase/browser";
import { useUser } from "../stores/user";
import { toast } from "./use-toast";

export const useChatNotifications = () => {
  const user = useUser((state) => state.user);
  const location = useLocation();
  const supabase = supabaseBrowser();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("new-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          const { type, message, data, title } = payload.new;

          // Only show toasts for chat related notifications
          if (type === "mention" || type === "comment") {
            const workspaceId = data?.workspaceId;
            const currentPath = location.pathname;

            // Don't show toast if user is already in the relevant chat room
            const isChatPage = currentPath.includes(`/workspace/${workspaceId}/chat`);
            if (!isChatPage) {
              toast({
                title: title || "New Message",
                description: message,
                // You can add an action to navigate to the chat
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, location.pathname, supabase]);
};
