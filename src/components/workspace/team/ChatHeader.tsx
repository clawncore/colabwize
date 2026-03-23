"use client";
import { useState, useEffect } from "react";
import ChatPresence from "./ChatPresence";
import { useParams } from "react-router-dom";
import WorkspaceService from "../../../services/workspaceService";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import { useMessage } from "../../../stores/messages";
import { toast } from "sonner";
import { Input } from "../../ui/input";
import { Search, X, Loader2, Eraser } from "lucide-react";

export default function ChatHeader({
  onSearch,
  workspaceId: propWorkspaceId,
  workspaceName: propWorkspaceName,
  userRole: propUserRole,
  isPanel,
}: {
  onSearch?: (q: string) => void;
  workspaceId?: string;
  workspaceName?: string;
  userRole?: string;
  isPanel?: boolean;
}) {
  const params = useParams<{ id: string }>();
  // Use prop workspaceId if available, otherwise fallback to params
  const workspaceId = propWorkspaceId || params.id;
  
  const [internalWorkspaceName, setInternalWorkspaceName] = useState<string>("");
  const [internalUserRole, setInternalUserRole] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isClearing, setIsClearing] = useState(false);

  // Derive final values from props or local state
  const workspaceName = propWorkspaceName || internalWorkspaceName;
  const userRole = propUserRole || internalUserRole;

  const resetMessages = useMessage((state) => state.resetMessages);
  const supabase = supabaseBrowser();

  useEffect(() => {
    // Only fetch if not provided via props
    if (workspaceId && !propWorkspaceName) {
      WorkspaceService.getWorkspace(workspaceId)
        .then((data) => {
          if (data) {
            setInternalWorkspaceName(data.name);
            if (data.role) setInternalUserRole(data.role);
          }
        })
        .catch((err) => console.error("Failed to fetch workspace data", err));
    }
  }, [workspaceId, propWorkspaceName]);

  const toggleSearch = () => {
    const nextState = !isSearching;
    setIsSearching(nextState);
    if (!nextState) {
      setSearchText("");
      onSearch?.("");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchText(val);
    onSearch?.(val);
  };

  const handleClearChat = async () => {
    if (!workspaceId) return;
    if (
      !window.confirm(
        "Are you sure you want to clear ALL messages in this workspace? This cannot be undone.",
      )
    )
      return;

    setIsClearing(true);
    try {
      const { error } = await supabase
        .from("TeamChatMessage")
        .delete()
        .eq("workspace_id", workspaceId);

      if (error) throw error;

      resetMessages();
      toast.success("Chat cleared successfully");
    } catch (err: any) {
      console.error("Failed to clear chat", err);
      toast.error(err.message || "Failed to clear chat");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className={`${isPanel ? "h-14 px-3" : "h-20 px-6"} border-b flex items-center justify-between bg-white shrink-0`}>
      <div className={`flex items-center ${isPanel ? "gap-2" : "gap-4"} flex-1 min-w-0`}>
        {!isSearching ? (
          <>
            <div className={`flex items-center justify-center text-white font-bold uppercase shrink-0 ring-2 ${isPanel ? "w-8 h-8 text-xs rounded-lg bg-emerald-500 ring-emerald-50" : "w-12 h-12 text-xl rounded-full bg-emerald-600 ring-4 ring-emerald-50"}`}>
              {workspaceName?.[0] || "W"}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h1 className={`font-bold tracking-tight text-gray-900 truncate uppercase ${isPanel ? "text-xs" : "text-xl"}`}>
                {workspaceName || "Workspace"}
              </h1>
              {!isPanel && (
                <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                  Group Chat <span className="opacity-50">•</span>
                  <span className="flex items-center gap-1">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-3 h-3 text-emerald-500"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0110 0v4"></path>
                    </svg>
                    E2E Encrypted
                  </span>
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center gap-2 pr-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                autoFocus
                placeholder="Search messages..."
                className="pl-9 bg-gray-50 border-none ring-1 ring-gray-200 focus-visible:ring-emerald-500"
                value={searchText}
                onChange={handleSearchChange}
              />
            </div>
            <button
              title="close search"
              onClick={toggleSearch}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      <div className={`flex items-center text-gray-400 shrink-0 ${isPanel ? "gap-1" : "gap-4"}`}>
        {!isSearching && (
          <button
            onClick={toggleSearch}
            className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-all">
            <Search className="w-5 h-5" />
          </button>
        )}
        {userRole === "admin" || userRole === "owner" ? (
          <button
            title="clear messages"
            onClick={handleClearChat}
            disabled={isClearing}
            className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all disabled:opacity-50">
            {isClearing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Eraser className="w-5 h-5" />
            )}
          </button>
        ) : null}
        {!isPanel && <div className="w-px h-8 bg-gray-100 mx-1" />}
        <ChatPresence workspaceId={workspaceId} isPanel={isPanel} />
      </div>
    </div>
  );
}
