import React, { Suspense, useEffect, useState } from "react";
import ListMessages from "./ListMessages";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import InitMessages from "../../../stores/InitMessages";
import { LIMIT_MESSAGE } from "../../../lib/constant";
import { useUser } from "../../../stores/user";

export default function ChatMessages({
  workspaceId,
  parentId,
  projectId,
  onAvatarClick,
  searchQuery,
  isPanel,
}: {
  workspaceId?: string;
  parentId?: string;
  projectId?: string;
  onAvatarClick?: (userId: string, userData?: any) => void;
  searchQuery?: string;
  isPanel?: boolean;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUser((state) => state.user);

  useEffect(() => {
    const fetchMessages = async () => {
      console.log("ChatMessages: fetchMessages triggered", {
        workspaceId,
        hasUser: !!user,
      });

      if (!user) {
        setLoading(true); // Keep loading true if no user yet
        return;
      }

      setLoading(true); // Reset loading on user/workspace change
      try {
        const supabase = supabaseBrowser();
        let query = supabase
          .from("TeamChatMessage")
          .select("*,users(*)")
          .range(0, LIMIT_MESSAGE)
          .order("created_at", { ascending: false });

        if (projectId) {
          query = query.eq("project_id", projectId);
        } else if (workspaceId) {
          query = query.eq("workspace_id", workspaceId).is("project_id", null);
        }

        const { data, error } = await query;
        if (error) {
          console.error("ChatMessages: Error fetching messages:", error);
        } else {
          console.log("ChatMessages: Messages fetched successfully", {
            count: data?.length,
            workspaceId,
          });
        }

        setMessages(data?.reverse() || []);
      } catch (err) {
        console.error("ChatMessages: Unexpected error in fetchMessages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [workspaceId, projectId, user]);

  return (
    <Suspense fallback={"loading.."}>
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#F0F2F5]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-medium animate-pulse">
              Loading messages...
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col relative">
          <ListMessages
            workspaceId={workspaceId}
            projectId={projectId}
            onAvatarClick={onAvatarClick}
            searchQuery={searchQuery}
            isPanel={isPanel}
          />
          <InitMessages messages={messages} />
        </div>
      )}
    </Suspense>
  );
}
