"use client";

import { useState, useEffect } from "react";
import ChatPresence from "./ChatPresence";
import { useParams } from "react-router-dom";
import WorkspaceService from "../../../services/workspaceService";

export default function ChatHeader() {
  const { id: workspaceId } = useParams<{ id: string }>();

  const [workspaceName, setWorkspaceName] = useState<string>("");

  useEffect(() => {
    if (workspaceId) {
      WorkspaceService.getWorkspace(workspaceId)
        .then((data) => {
          if (data) setWorkspaceName(data.name);
        })
        .catch((err) => console.error("Failed to fetch workspace name", err));
    }
  }, [workspaceId]);

  return (
    <div className="h-20">
      <div className="p-5 border-b flex items-center justify-between h-full">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center gap-2">
          {workspaceName ? (
            workspaceName
          ) : (
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          )}{" "}
          Chat
        </h1>
        <ChatPresence />
      </div>
    </div>
  );
}
