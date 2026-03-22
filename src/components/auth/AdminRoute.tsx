import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useWorkspacePermissions } from "../../hooks/useWorkspacePermissions";
import { Loader2 } from "lucide-react";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { id } = useParams<{ id: string }>();
    const { isAdmin, loading } = useWorkspacePermissions(id);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard/admin" replace />;
    }

    return <>{children}</>;
};
