
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Loader2, ShieldAlert, UserPlus, Settings, FileText, Trash2, LogIn, Logs } from "lucide-react";
import WorkspaceService from "../../../services/workspaceService";
import { toast } from "sonner";

interface ActivityLog {
    id: string;
    action: string;
    details: any;
    created_at: string;
    user: {
        id: string;
        full_name: string;
        email: string;
        avatar_url?: string;
    };
}

export const WorkspaceActivityPage = () => {
    const { id } = useParams<{ id: string }>();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // We might need to add this method to WorkspaceService or call axios directly
                // Assuming WorkspaceService.getActivityLog exists or we add it safely
                // For now, let's use a direct fetch or extend the service
                const response = await WorkspaceService.getActivityLog(id);
                setActivities(response.items || []);
            } catch (error) {
                console.error("Failed to fetch activity log:", error);
                toast.error("Failed to load activity log");
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [id]);

    const getActionIcon = (action: string) => {
        switch (action) {
            case "WORKSPACE_CREATED":
                return <ShieldAlert className="h-4 w-4 text-blue-500" />;
            case "SETTINGS_UPDATED":
                return <Settings className="h-4 w-4 text-orange-500" />;
            case "INVITATION_SENT":
            case "MEMBER_JOINED":
                return <UserPlus className="h-4 w-4 text-green-500" />;
            case "MEMBER_REMOVED":
                return <Trash2 className="h-4 w-4 text-red-500" />;
            case "MEMBER_ROLE_UPDATED":
                return <ShieldAlert className="h-4 w-4 text-purple-500" />;
            default:
                return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const formatDetails = (action: string, details: any) => {
        if (!details) return "";
        switch (action) {
            case "SETTINGS_UPDATED":
                return `Updated settings: ${Object.keys(details.changes || {}).join(", ")}`;
            case "INVITATION_SENT":
                return `Invited ${details.email} as ${details.role}`;
            case "MEMBER_JOINED":
                return `${details.email} joined as ${details.role}`;
            case "MEMBER_ROLE_UPDATED":
                return `Changed ${details.memberEmail}'s role to ${details.role}`;
            case "MEMBER_REMOVED":
                return `Removed member`;
            case "WORKSPACE_CREATED":
                return `Created workspace "${details.name}"`;
            default:
                return JSON.stringify(details);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center gap-2">
                        <Logs className="h-7 w-7 text-teal-500" /> Audit Log</h1>
                    <p className="text-muted-foreground">
                        View recent administrative actions and events in this workspace.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                        A chronological list of improved security and management events.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {activities.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                No activity recorded yet.
                            </p>
                        ) : (
                            activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={activity.user.avatar_url} />
                                        <AvatarFallback>{activity.user.full_name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.user.full_name}
                                            <span className="text-muted-foreground font-normal ml-2">
                                                {activity.action.replace(/_/g, " ")}
                                            </span>
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDetails(activity.action, activity.details)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WorkspaceActivityPage;
