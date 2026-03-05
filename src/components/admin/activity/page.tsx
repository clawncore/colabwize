import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2,
  ShieldAlert,
  UserPlus,
  Settings,
  FileText,
  Trash2,
  Logs,
  PlusCircle,
  CheckCircle2,
  History,
} from "lucide-react";
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
      case "PROJECT_CREATED":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "TASK_CREATED":
        return <PlusCircle className="h-4 w-4 text-green-500" />;
      case "TASK_UPDATED":
        return <CheckCircle2 className="h-4 w-4 text-amber-500" />;
      case "TASK_DELETED":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "VERSION_SAVED":
        return <History className="h-4 w-4 text-indigo-500" />;
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
      case "PROJECT_CREATED":
        return `Created project "${details.title}" (${details.type})`;
      case "TASK_CREATED":
        return `Created task "${details.title}"`;
      case "TASK_UPDATED":
        return `Updated task "${details.title}" to ${details.status}`;
      case "TASK_DELETED":
        return `Deleted task "${details.title}"`;
      case "VERSION_SAVED":
        return `Saved version ${details.version} of "${details.projectTitle}"`;
      default:
        return details.message || JSON.stringify(details);
    }
  };

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
            <Logs className="h-7 w-7 text-teal-500" /> Audit Log
          </h1>
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
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <Avatar className="h-9 w-9 border shadow-sm">
                    <AvatarImage src={activity.user.avatar_url} />
                    <AvatarFallback
                      className={`${getUserColor(activity.user.id)} text-white font-bold text-xs`}>
                      {activity.user.full_name?.charAt(0).toUpperCase() ||
                        activity.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.user.full_name}
                      <span className="text-muted-foreground font-normal ml-2 text-xs uppercase tracking-tight">
                        {activity.action.replace(/_/g, " ")}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDetails(activity.action, activity.details)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-medium">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                      })}
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
