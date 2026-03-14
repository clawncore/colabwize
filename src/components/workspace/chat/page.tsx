import React, { useEffect, useState } from "react";
import ChatHeader from "../team/ChatHeader";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import InitUser from "../../../stores/InitUser";
import ChatInput from "../team/ChatInput";
import ChatMessages from "../team/ChatMessages";
import { User } from "@supabase/supabase-js";

interface TeamChatProps {
  workspaceId?: string;
  className?: string;
  isPanel?: boolean;
}

export default function TeamChat({
  workspaceId,
  className,
  isPanel,
}: TeamChatProps) {
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      }
    };
    fetchSession();
  }, []);

  return (
    <>
    <div className={`${!isPanel ? "max-w-3xl mx-auto md:py-10" : ""} h-screen ${className}`}>
        <div className=" h-full border rounded-md flex flex-col relative">
          <ChatHeader />
          <ChatMessages workspaceId={workspaceId} />
          <ChatInput workspaceId={workspaceId} />
        </div>
      </div>
      <InitUser user={user} />
    </>
  );
}
