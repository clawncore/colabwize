"use client";

import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import apiClient from "../../../services/apiClient";
import { useParams } from "react-router-dom";
import WorkspaceService from "../../../services/workspaceService";

interface AnalyticsData {
  totalTasks: number;
  doneTasks: number;
  totalMembers: number;
  completionRate: number;
  health: {
    overdue: number;
    upcoming: number;
  };
  efficiency: {
    avgCompletionDays: number;
  };
  statusDistribution: { name: string; value: number }[];
  priorityDistribution: { status: string; count: number }[];
  memberActivity: { name: string; assigned: number; completed: number }[];
  completionTrend: { date: string; count: number }[];
  projectMetrics?: {
    id: string;
    title: string;
    status: string;
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }[];
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function WorkspaceAnalytics() {
  const { id: workspaceId } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState<string>("");

  useEffect(() => {
    // Early check inside useEffect instead
    if (!workspaceId) {
      setIsLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get(
          `/api/workspaces/${workspaceId}/analytics`,
        );
        setData(response);
      } catch (error) {
        console.error("Failed to fetch workspace analytics", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();

    // Fetch workspace name
    if (workspaceId) {
      WorkspaceService.getWorkspace(workspaceId)
        .then((data) => {
          if (data) setWorkspaceName(data.name);
        })
        .catch((err) => console.error("Failed to fetch workspace name", err));
    }
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse p-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 bg-slate-200 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return <div>No data available</div>;

  return (
    <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center gap-2">
          {workspaceName ? (
            workspaceName
          ) : (
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          )}{" "}
          Workspace Analytics
        </h1>
        <p className="text-muted-foreground">
          {data.totalTasks} total tasks · {data.completionRate}% completion rate
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-600 font-medium text-xs uppercase tracking-wider">
              Completion Rate
            </CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center justify-between">
              {data.completionRate}%
              <TrendingUp className="w-6 h-6 text-emerald-500/50" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 font-medium text-xs uppercase tracking-wider">
              Workload Size
            </CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center justify-between">
              {data.totalTasks}
              <BarChart3 className="w-6 h-6 text-blue-500/50" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-orange-600 font-medium text-xs uppercase tracking-wider text-red-500">
              Overdue Tasks
            </CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center justify-between text-red-600">
              {data.health.overdue}
              <AlertTriangle className="w-6 h-6 text-red-500/50" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-600 font-medium text-xs uppercase tracking-wider">
              Avg Speed (Days)
            </CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center justify-between">
              {data.efficiency.avgCompletionDays}
              <Clock className="w-6 h-6 text-purple-500/50" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Project Progress Section */}
      {data.projectMetrics && data.projectMetrics.length > 0 && (
        <Card className="border-slate-200/60 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-500" />
              Project Health & Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {data.projectMetrics.map((project) => {
                let displayProgress = project.progress;
                if (!displayProgress || displayProgress === 0) {
                  switch (project.status) {
                    case "completed":
                      displayProgress = 100;
                      break;
                    case "in-progress":
                      displayProgress = 40;
                      break;
                    case "active":
                      displayProgress = 30;
                      break;
                    case "planning":
                      displayProgress = 20;
                      break;
                    case "draft":
                      displayProgress = 10;
                      break;
                    default:
                      displayProgress = 0;
                  }
                }

                return (
                  <div key={project.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-slate-800 group-hover:text-teal-600 transition-colors">
                          {project.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${project.status === "completed" ? "bg-emerald-500" : "bg-blue-400"}`}
                          />
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {project.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-700">
                          {displayProgress}%
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {project.completedTasks}/{project.totalTasks} Tasks
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${displayProgress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Balancer */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Workload Balancer (Completed vs Assigned)
            </CardTitle>
            <CardDescription className="text-xs">
              Monitor team distribution to prevent burnout
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.memberActivity}
                layout="vertical"
                margin={{ left: 20, right: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  fontSize={10}
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ fill: "#f8fafc" }}
                />
                <Legend iconType="circle" />
                <Bar
                  name="Completed Tasks"
                  dataKey="completed"
                  stackId="a"
                  fill="#8b5cf6"
                  radius={[0, 0, 0, 0]}
                  barSize={20}
                />
                <Bar
                  name="Remaining Tasks"
                  dataKey="assigned"
                  stackId="a"
                  fill="#e2e8f0"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completion Trend */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Delivery Velocity (14 Days)
            </CardTitle>
            <CardDescription className="text-xs">
              Historical task completion trend
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.completionTrend}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(val) => val.split("-").slice(1).join("/")}
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#fff",
                    stroke: "#3b82f6",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Workflow Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value">
                  {data.statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      strokeWidth={0}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Counts */}
        <Card className="border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Risk Distribution (Priority)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.priorityDistribution}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="status"
                  fontSize={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#fff7ed" }} />
                <Bar
                  dataKey="count"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
