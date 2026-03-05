"use client";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { formatDistanceToNow } from "date-fns";

export interface ActivityLog {
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

interface AuditLogFeedProps {
  activities: ActivityLog[];
}

export function AuditLogFeed({ activities }: AuditLogFeedProps) {
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
        return `Created project "${details.title}" (${details.type || "Document"})`;
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

    let hash = 0;
    if (!userId) return colors[0];

    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground bg-card rounded-lg border border-border">
        <p>No recent activity or audits found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 p-4 bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all opacity-0 animate-fadeIn"
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: "forwards",
          }}>
          <Avatar className="h-10 w-10 border shadow-sm">
            <AvatarImage src={activity.user?.avatar_url} />
            <AvatarFallback
              className={`${getUserColor(activity.user?.id || "default")} text-white font-bold text-sm`}>
              {activity.user?.full_name?.charAt(0).toUpperCase() ||
                activity.user?.email.charAt(0).toUpperCase() ||
                "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium leading-none text-foreground">
                {activity.user?.full_name || "Unknown User"}
                <span className="text-muted-foreground font-normal ml-2 text-xs uppercase tracking-tight">
                  {activity.action?.replace(/_/g, " ")}
                </span>
              </p>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(
                  new Date(activity.created_at || new Date()),
                  {
                    addSuffix: true,
                  },
                )}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 bg-muted/50 p-2 rounded line-clamp-2">
              {formatDetails(activity.action, activity.details)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
