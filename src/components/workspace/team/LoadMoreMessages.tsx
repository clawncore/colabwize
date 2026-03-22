import React from "react";
import { Button } from "../../ui/button";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import { LIMIT_MESSAGE } from "../../../lib/constant";
import { getFromAndTo } from "../../../lib/utils";
import { useMessage } from "../../../stores/messages";
import { toast } from "sonner";
import { useUser } from "../../../stores/user";

export default function LoadMoreMessages({
  workspaceId,
  projectId,
}: {
  workspaceId?: string;
  projectId?: string;
}) {
  const page = useMessage((state) => state.page);
  const setMesssages = useMessage((state) => state.setMesssages);
  const hasMore = useMessage((state) => state.hasMore);
  const user = useUser((state) => state.user);

  const fetchMore = async () => {
    if (!user) return;
    const { from, to } = getFromAndTo(page, LIMIT_MESSAGE);

    const supabase = supabaseBrowser();

    let query = supabase
      .from("TeamChatMessage")
      .select("*,users(*)")
      .range(from, to)
      .order("created_at", { ascending: false });

    if (projectId) {
      query = query.eq("project_id", projectId);
    } else if (workspaceId) {
      query = query.eq("workspace_id", workspaceId).is("project_id", null);
    }

    const { data, error } = await query;

    if (error) {
      toast.error(error.message);
    } else {
      setMesssages(data.reverse());
    }
  };

  if (hasMore) {
    return (
      <Button className="w-full" onClick={fetchMore}>
        Load More
      </Button>
    );
  }
  return <></>;
}
