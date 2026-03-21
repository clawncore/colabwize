import { useState, useEffect } from "react";
import WorkspaceService from "../services/workspaceService";
import { useUser } from "../services/useUser";

export interface WorkspacePermissions {
    role: "admin" | "editor" | "viewer" | null;
    isAdmin: boolean;
    isEditor: boolean;
    isViewer: boolean;
    canEdit: boolean; // editor or admin
    canManageMembers: boolean; // admin or owner
    loading: boolean;
}

export const useWorkspacePermissions = (workspaceId?: string) => {
    const { user, loading: userLoading } = useUser();
    const [permissions, setPermissions] = useState<WorkspacePermissions>({
        role: null,
        isAdmin: false,
        isEditor: false,
        isViewer: false,
        canEdit: false,
        canManageMembers: false,
        loading: true,
    });

    useEffect(() => {
        const fetchRole = async () => {
            if (userLoading) return;

            if (!workspaceId || !user) {
                setPermissions(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                setPermissions(prev => ({ ...prev, loading: true }));
                const workspace = await WorkspaceService.getWorkspace(workspaceId);
                const role = (workspace as any).role || "viewer";
                console.log(`[Permissions] Workspace ${workspaceId} role:`, role);

                setPermissions({
                    role,
                    isAdmin: role === "admin" || role === "owner",
                    isEditor: role === "editor",
                    isViewer: role === "viewer",
                    canEdit: role === "admin" || role === "editor" || role === "owner",
                    canManageMembers: role === "admin" || role === "owner",
                    loading: false,
                });
            } catch (error) {
                console.error("Failed to fetch workspace permissions:", error);
                setPermissions(prev => ({ ...prev, loading: false }));
            }
        };

        fetchRole();
    }, [workspaceId, user, userLoading]);

    return permissions;
};
