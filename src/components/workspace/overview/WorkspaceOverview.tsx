import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  Clock,
  Briefcase,
  Plus,
  Users,
  Calendar,
  ArrowRight,
  FileText,
} from "lucide-react";
import useAuth from "../../../services/useAuth";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { format } from "date-fns";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import WorkspaceService from "../../../services/workspaceService";
import { OnlineMembers } from "./OnlineMembers";
import { useWorkspacePermissions } from "../../../hooks/useWorkspacePermissions";
import { InviteMemberModal } from "../InviteMemberModal";

interface OverviewData {
  stats: {
    projects: { active: number; completed: number; total: number };
    tasks: { todo: number; in_progress: number; done: number; total: number };
    members: number;
  };
  myTasks: any[];
  recentProjects: any[];
  recentActivity: any[];
}

export default function WorkspaceOverview() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [workspaceDescription, setWorkspaceDescription] = useState<
    string | null
  >(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { canEdit, canManageMembers } = useWorkspacePermissions(workspaceId);

  useEffect(() => {
    if (token) {
      fetchOverview();
    }
    if (workspaceId && token) {
      WorkspaceService.getWorkspace(workspaceId)
        .then((ws) => {
          if (ws) {
            setWorkspaceName(ws.name);
            setWorkspaceDescription(ws.description);
          }
        })
        .catch(console.error);
    }
  }, [workspaceId, token]);

  const fetchOverview = async () => {
    if (!token) return;
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ""}/api/workspaces/${workspaceId}/overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch overview");
      const jsonData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error("Error fetching overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 w-full mx-auto animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-8 w-full mx-auto max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit mb-1">
            {workspaceName || "Workspace"} Overview
          </h1>
          {workspaceDescription && (
            <p className="text-sm text-slate-600 mb-3 max-w-2xl">
              {workspaceDescription}
            </p>
          )}
          <p className="text-slate-500">
            Welcome back, {user?.full_name?.split(" ")[0]}. Here's what's
            happening.
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {workspaceId && <OnlineMembers workspaceId={workspaceId} />}
          {canManageMembers && (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowInviteModal(true)}>
              <Users className="w-4 h-4" />
              Invite
            </Button>
          )}
          {canEdit && (
            <Button
              className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              onClick={() =>
                navigate(
                  `/dashboard/workspace/${workspaceId}/documents?tab=create`,
                )
              }>
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Projects
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {data.stats.projects.active}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Completed Tasks
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {data.stats.tasks.done}{" "}
                <span className="text-sm font-normal text-slate-400">
                  / {data.stats.tasks.total}
                </span>
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending Tasks
              </p>
              <h3 className="text-2xl font-bold text-slate-900">
                {data.stats.tasks.todo + data.stats.tasks.in_progress}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Team Members</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {data.stats.members}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Projects & My Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Projects */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900">
                Recent Projects
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-500 hover:text-indigo-600">
                <Link to={`/dashboard/workspace/${workspaceId}/projects`}>
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentProjects.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No projects yet. Start by creating one!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/dashboard/editor/${project.id}`}
                      className="block p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200 group">
                      <div className="flex justify-between items-start mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            project.status === "completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-indigo-100 text-indigo-700"
                          }`}>
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <Badge
                          variant={
                            project.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            project.status === "active"
                              ? "bg-indigo-600 hover:bg-indigo-700"
                              : ""
                          }>
                          {project.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-700 transition-colors">
                        {project.title}
                      </h4>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3 h-10">
                        {project.description || "No description provided."}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {project._count?.tasks || 0} tasks
                        </div>
                        <div className="flex -space-x-2">
                          {project.members?.map((m: any) => (
                            <Avatar
                              key={m.user.id}
                              className="w-6 h-6 border-2 border-white">
                              <AvatarImage src={m.user.avatar_url} />
                              <AvatarFallback className="text-[10px] bg-slate-200">
                                {m.user.full_name
                                  ?.substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Tasks */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900">
                My Priority Tasks
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-500 hover:text-indigo-600">
                <Link
                  to={`/dashboard/workspace/${workspaceId}/kanban?view=list`}>
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {data.myTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No pending tasks assigned to you.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.myTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            task.priority === "high"
                              ? "bg-red-500"
                              : task.priority === "medium"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {task.project?.title || "No Project"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(task.due_date), "MMM d")}
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {task.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border-slate-200 h-full max-h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Latest Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] px-6 pb-6">
                <div className="space-y-8 relative border-l border-slate-100 ml-3 pt-2">
                  {data.recentActivity.map((activity, index) => (
                    <div key={index} className="relative pl-7 group">
                      <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-indigo-500 ring-4 ring-indigo-50 transition-transform group-hover:scale-125 z-10"></span>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-6 h-6 border border-white shadow-sm">
                            <AvatarImage src={activity.user?.avatar_url} />
                            <AvatarFallback className="text-[9px] bg-slate-100 font-bold text-slate-600">
                              {activity.user?.full_name?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-semibold text-slate-900">
                            {activity.user?.full_name || "System"}
                          </span>
                        </div>
                        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100/50">
                          <p className="text-sm text-slate-600 leading-relaxed">
                            <span className="capitalize">{activity.action.replace(/_/g, " ").toLowerCase()}</span>
                            {activity.details?.target_name && (
                              <span className="font-bold text-slate-800">
                                {" "}
                                {activity.details.target_name}
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 text-[10px] font-medium text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(
                                new Date(activity.created_at),
                                "MMM d, h:mm a",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.recentActivity.length === 0 && (
                    <p className="text-sm text-slate-400 pl-6 italic">
                      No recent activity recorded.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {workspaceId && (
        <InviteMemberModal
          open={showInviteModal}
          onOpenChange={setShowInviteModal}
          workspaceId={workspaceId}
        />
      )}
    </div>
  );
}
