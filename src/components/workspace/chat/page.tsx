import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatHeader from "../team/ChatHeader";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import InitUser from "../../../stores/InitUser";
import ChatInput from "../team/ChatInput";
import ChatMessages from "../team/ChatMessages";
import { User } from "@supabase/supabase-js";
import { UserDetailsPanel } from "../team/UserDetailsPanel";
import workspaceService, {
  WorkspaceMember,
} from "../../../services/workspaceService";

interface TeamChatProps {
  workspaceId?: string;
  projectId?: string;
  parentId?: string;
  className?: string;
  isPanel?: boolean;
}

export default function TeamChat({
  workspaceId: propWorkspaceId,
  projectId,
  parentId,
  className,
  isPanel,
}: TeamChatProps) {
  const params = useParams<{ id: string }>();
  // Prioritize prop, then fallback to params only if NOT in a panel (where params.id might be project ID)
  const workspaceId = propWorkspaceId || (isPanel ? undefined : params.id);

  console.log("TeamChat: Render", {
    workspaceId,
    source: propWorkspaceId ? "prop" : "params",
  });
  const [user, setUser] = useState<User | undefined>(undefined);
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(
    null,
  );
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

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

  const [memberLoading, setMemberLoading] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      console.log("TeamChat: Starting fetch for workspace", workspaceId);
      setMemberLoading(true);
      workspaceService
        .getWorkspace(workspaceId)
        .then((data) => {
          console.log("TeamChat: Workspace data loaded successfully", {
            id: data.id,
            memberCount: data.members?.length,
            members: data.members?.map((m: any) => m.user?.id || m.user_id),
          });
          setMembers(data.members || []);
        })
        .catch((err) => {
          console.error("TeamChat: Failed to fetch workspace members!", err);
        })
        .finally(() => {
          setMemberLoading(false);
        });
    } else {
      console.warn("TeamChat: No workspaceId available to fetch members.");
    }
  }, [workspaceId]);

  const handleAvatarClick = (userId: string, userData?: any) => {
    console.log("TeamChat: Avatar clicked for user", userId, {
      cachedMembersCount: members.length,
      hasUserDataProp: !!userData,
      isPanel,
    });

    if (isPanel) {
      // Redirect to Collaboration History panel with filter
      const event = new CustomEvent("openSidebarPanel", {
        detail: {
          panelType: "collaboration-history",
          data: { authorId: userId },
        },
      });
      window.dispatchEvent(event);
      return;
    }

    // Exhaustive ID match: check user object, user_id field, and direct member ID
    let member = members.find((m) => {
      const match =
        m.user?.id === userId || m.user_id === userId || m.id === userId;
      return match;
    });

    if (member) {
      console.log("TeamChat: Found member in cache", member.id);
    }

    if (!member && userData) {
      console.log("TeamChat: Using fallback for user", userId);
      // Synthesize member from message user data if lookup fails
      member = {
        id: `synth-${userId}`,
        user_id: userId,
        role: "editor",
        joined_at: new Date().toISOString(),
        user: {
          id: userId,
          full_name: userData.full_name,
          email: userData.email || "No email available",
        },
      } as WorkspaceMember;
    }

    if (member) {
      setSelectedMember(member);
    } else {
      console.warn(`Member data not found for user ${userId} in cache.`);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string>("");
  const [workspaceName, setWorkspaceName] = useState<string>("");

  useEffect(() => {
    if (workspaceId) {
      console.log("TeamChat: Starting fetch for workspace", workspaceId);
      setMemberLoading(true);
      workspaceService
        .getWorkspace(workspaceId)
        .then((data) => {
          console.log("TeamChat: Workspace data loaded successfully", {
            id: data.id,
            role: data.role,
            memberCount: data.members?.length,
          });
          setMembers(data.members || []);
          if (data.role) setUserRole(data.role);
          if (data.name) setWorkspaceName(data.name);
        })
        .catch((err) => {
          console.error("TeamChat: Failed to fetch workspace members!", err);
        })
        .finally(() => {
          setMemberLoading(false);
        });
    }
  }, [workspaceId]);

  // Map members for the MentionInput to ensure we use User IDs, not Member IDs
  const mentionMembers = members
    .map((m) => {
      // Ensure m.user exists and has an id, or m.user_id exists
      const userId = m.user?.id || m.user_id;
      if (!userId) {
        console.warn("TeamChat: Skipping member with invalid user ID", m);
        return null; // Filter out invalid members
      }
      return {
        id: userId,
        name: m.user?.full_name || m.user?.email || "Unknown User",
        avatar: m.user?.avatar_url,
        email: m.user?.email,
      };
    })
    .filter(Boolean); // Filter out nulls

  return (
    <>
      <div
        className={`h-full bg-white ${className} flex relative overflow-hidden`}>
        <div className="flex-1 min-h-0 flex flex-col relative overflow-hidden">
          <ChatHeader
            onSearch={setSearchQuery}
            workspaceId={workspaceId}
            workspaceName={workspaceName}
            userRole={userRole}
            isPanel={isPanel}
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <ChatMessages
              workspaceId={workspaceId}
              parentId={parentId}
              projectId={projectId}
              onAvatarClick={handleAvatarClick}
              searchQuery={searchQuery}
              isPanel={isPanel}
            />
          </div>
          <ChatInput
            workspaceId={workspaceId}
            parentId={parentId}
            projectId={projectId}
            isPanel={isPanel}
            members={members.map((m) => ({
              id: m.user?.id || m.user_id,
              name: m.user?.full_name || m.user?.email || "Unknown User",
              email: m.user?.email || "",
            }))}
          />
        </div>

        {selectedMember && (
          <UserDetailsPanel
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </div>
      <InitUser user={user} />
    </>
  );
}
