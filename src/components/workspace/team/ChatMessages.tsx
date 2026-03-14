import React, { Suspense, useEffect, useState } from "react";
import ListMessages from "./ListMessages";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import InitMessages from "../../../stores/InitMessages";
import { LIMIT_MESSAGE } from "../../../lib/constant";

export default function ChatMessages({ workspaceId }: { workspaceId?: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const supabase = supabaseBrowser();
      let query = supabase
        .from("TeamChatMessage")
        .select("*,users(*)")
        .range(0, LIMIT_MESSAGE)
        .order("created_at", { ascending: false });

      if (workspaceId) {
        query = query.eq("workspace_id", workspaceId);
      }

      const { data } = await query;

      setMessages(data?.reverse() || []);
      setLoading(false);
    };
    fetchMessages();
  }, [workspaceId]);

  return (
    <Suspense fallback={"loading.."}>
      {loading ? (
        <div className="p-10 text-center">loading..</div>
      ) : (
        <>
          <ListMessages workspaceId={workspaceId} />
          <InitMessages messages={messages} />
        </>
      )}
    </Suspense>
  );
}
