"use client";
import { useUser } from "../../../stores/user";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import React, { useEffect, useState } from "react";

export default function ChatPresence({ workspaceId, isPanel }: { workspaceId?: string; isPanel?: boolean }) {
  const user = useUser((state) => state.user);
  const supabase = supabaseBrowser();
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    if (!workspaceId) return;

    const channel = supabase.channel(`presence:${workspaceId}`);
    channel
      .on("presence", { event: "sync" }, () => {
        const userIds = [];
        for (const id in channel.presenceState()) {
          // @ts-ignore
          userIds.push(channel.presenceState()[id][0].user_id);
        }
        setOnlineUsers([...new Set(userIds)].length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            online_at: new Date().toISOString(),
            user_id: user?.id,
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user, workspaceId]);

  if (!user) {
    return <div className=" h-3 w-1"></div>;
  }

  return (
    <div className="flex items-center gap-1">
      <div className={`bg-green-500 rounded-full animate-pulse ${isPanel ? "h-2.5 w-2.5" : "h-4 w-4"}`}></div>
      <h1 className={`text-gray-400 ${isPanel ? "text-xs" : "text-sm"}`}>{onlineUsers} onlines</h1>
    </div>
  );
}
