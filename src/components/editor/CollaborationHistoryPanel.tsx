import React, { useEffect, useState, useCallback } from "react";
import { History, User, Clock, ChevronRight, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";
import { WorkspaceMember } from "../../services/workspaceService";

interface EditGroup {
  authorId: string;
  authorName: string;
  color: string;
  timestamp: string;
  text: string;
  from: number;
  to: number;
}

interface CollaborationHistoryPanelProps {
  editor: any;
  members: WorkspaceMember[];
  isLoading: boolean;
  onClose: () => void;
  initialAuthorId?: string;
}

export const CollaborationHistoryPanel: React.FC<
  CollaborationHistoryPanelProps
> = ({ editor, members, isLoading, onClose, initialAuthorId }) => {
  const [editGroups, setEditGroups] = useState<EditGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilterAuthorId, setActiveFilterAuthorId] = useState<
    string | null
  >(initialAuthorId || null);
  const [presenceIds, setPresenceIds] = useState<string[]>([]);

  const getUserColor = (userId: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-amber-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-rose-500",
      "bg-emerald-500",
    ];

    // Simple hash to get consistent color for a user
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const refreshHistory = useCallback(() => {
    if (!editor) return;

    const groups: EditGroup[] = [];
    const doc = editor.state.doc;

    doc.descendants((node, pos) => {
      if (node.isText) {
        const authorshipMark = node.marks.find(
          (m) => m.type.name === "authorship",
        );
        if (authorshipMark) {
          const { authorId, authorName, color, timestamp } =
            authorshipMark.attrs;
          const text = node.text || "";

          // Check if we can merge with the last group
          const lastGroup = groups[groups.length - 1];
          if (
            lastGroup &&
            lastGroup.authorId === authorId &&
            Math.abs(lastGroup.to - pos) <= 1
          ) {
            lastGroup.text += text;
            lastGroup.to = pos + node.nodeSize;
          } else {
            groups.push({
              authorId,
              authorName,
              color,
              timestamp,
              text,
              from: pos,
              to: pos + node.nodeSize,
            });
          }
        }
      }
      return true;
    });

    setEditGroups(
      groups.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    );
  }, [editor]);

  useEffect(() => {
    refreshHistory();

    if (editor) {
      const handleUpdate = () => refreshHistory();
      editor.on("update", handleUpdate);

      // Awareness/Presence Handling
      const handleAwarenessUpdate = () => {
        const states =
          editor.storage.collaborationCursor?.awareness?.getStates();
        if (states) {
          const ids = Array.from(states.values())
            .map((s: any) => s.user?.id)
            .filter(Boolean);
          setPresenceIds(ids);
        }
      };

      editor.on("selectionUpdate", handleAwarenessUpdate);

      return () => {
        editor.off("update", handleUpdate);
        editor.off("selectionUpdate", handleAwarenessUpdate);
      };
    }
  }, [editor, refreshHistory]);

  useEffect(() => {
    if (initialAuthorId) {
      setActiveFilterAuthorId(initialAuthorId);
    }
  }, [initialAuthorId]);

  const jumpToEdit = (from: number, to: number) => {
    if (!editor || editor.isDestroyed) return;

    // First safely set the selection to highlight the text
    editor.chain().focus().setTextSelection({ from, to }).run();

    // Use a custom smooth scrolling mechanism targeting our document container
    setTimeout(() => {
      try {
        const coords = editor.view.coordsAtPos(from);
        const scrollContainer = editor.view.dom.closest(".overflow-auto");

        if (scrollContainer) {
          const containerRect = scrollContainer.getBoundingClientRect();
          // Calculate target scroll position to bring the text to the vertical center
          const targetScrollTop =
            scrollContainer.scrollTop +
            (coords.top - containerRect.top) -
            containerRect.height / 2;

          scrollContainer.scrollTo({
            top: targetScrollTop,
            behavior: "smooth",
          });
        } else {
          // Fallback
          editor.commands.scrollIntoView();
        }
      } catch (err) {
        console.error("Scroll to edit failed:", err);
        editor.commands.scrollIntoView();
      }
    }, 50);
  };

  const filteredGroups = editGroups.filter(
    (g) =>
      (!activeFilterAuthorId || g.authorId === activeFilterAuthorId) &&
      (g.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.text.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="h-full flex flex-col bg-white border-l shadow-xl animate-in slide-in-from-right duration-300 relative">
      {/* Header */}
      <div className="px-4 py-4 border-b bg-slate-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900 leading-tight">
              Collaboration History
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-600">
            ×
          </Button>
        </div>
        <p className="text-[11px] text-slate-500 mb-4">
          Real-time activity and authorship tracking.
        </p>

        {/* Collaborators List */}
        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Team Presence
          </h3>
          <div className="flex flex-wrap gap-2">
            {isLoading ? (
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              members.map((member) => {
                const isOnline = presenceIds.includes(member.user_id);
                const isActiveFilter = activeFilterAuthorId === member.user_id;

                return (
                  <button
                    key={member.id}
                    onClick={() =>
                      setActiveFilterAuthorId(
                        isActiveFilter ? null : member.user_id,
                      )
                    }
                    className={cn(
                      "relative group p-0.5 rounded-full border-2 transition-all",
                      isActiveFilter
                        ? "border-blue-500 scale-110"
                        : "border-transparent",
                      !isOnline && "opacity-60",
                    )}
                    title={`${member.user.full_name || member.user.email} (${isOnline ? "Online" : "Offline"})`}>
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/20",
                        getUserColor(member.user_id),
                      )}>
                      {member.user.full_name?.charAt(0).toUpperCase() ||
                        member.user.email.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full transition-transform group-hover:scale-125" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search edits or authors..."
            className="w-full pl-8 pr-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 bg-[#F8FAFC]">
        <div className="p-4 space-y-3">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-10 px-4 bg-white border border-dashed rounded-xl">
              <div className="mx-auto w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <User className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {searchTerm || activeFilterAuthorId
                  ? "No matching contributions found."
                  : "Waiting for contributions..."}
              </p>
            </div>
          ) : (
            filteredGroups.map((group, idx) => (
              <div
                key={`${group.authorId}-${idx}`}
                className="group relative bg-white border rounded-xl p-3 hover:border-blue-300 transition-all cursor-pointer hover:shadow-md active:scale-[0.98]"
                onClick={() => jumpToEdit(group.from, group.to)}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white shadow-sm ring-1 ring-white"
                      style={{ backgroundColor: group.color }}>
                      {group.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-[11px] font-bold text-slate-800 line-clamp-1">
                        {group.authorName}
                      </h3>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        <span>
                          {formatDistanceToNow(new Date(group.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors" />
                </div>

                <div
                  className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg italic border-l-2 leading-relaxed"
                  style={{ borderLeftColor: group.color }}>
                  "
                  {group.text.length > 150
                    ? group.text.substring(0, 150) + "..."
                    : group.text}
                  "
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-3 border-t bg-slate-50 flex-shrink-0">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>{presenceIds.length} Active now</span>
          </div>
          {activeFilterAuthorId && (
            <button
              onClick={() => setActiveFilterAuthorId(null)}
              className="text-blue-600 hover:underline">
              Clear filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
