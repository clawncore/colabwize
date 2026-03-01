import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import LayoutWrapper from "../../components/Layout";
import {
  LayoutDashboard,
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  Activity,
  BookOpen,
  MessageCircle,
  BarChart,
  Kanban,
} from "lucide-react";

export default function TeamWorkspacePage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <LayoutWrapper>
      <section className="section-padding bg-slate-50 relative overflow-hidden text-center">
        <div className="container-custom pt-10 max-w-4xl mx-auto mb-16">
          <div className="inline-flex gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs uppercase mb-6">
            <LayoutDashboard className="w-4 h-4" /> Dedicated Teamspace
            Organization
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Total Oversight.{" "}
            <span className="text-indigo-600">Perfect Productivity.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto font-medium">
            Take comprehensive control of organizational workspaces. Track
            active projects, manage pending tasks, and oversee team activity
            instantly from a customized visual dashboard.
          </p>
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-6 rounded-full"
            asChild>
            <RouterLink to="/signup">
              Launch Your Hub <ArrowRight className="ml-2 w-5 h-5" />
            </RouterLink>
          </Button>
        </div>
      </section>

      <section className="section-padding bg-white overflow-hidden">
        <div className="container-custom grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
          <div className="space-y-8 py-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Command Center for Active Works
            </h2>
            <div className="flex flex-col">
              {[
                {
                  id: "active-projects",
                  title: "Active Projects Overview",
                  description:
                    "Monitor all 'Recent Projects' like 'Collab Test' or 'test workspace document' at a glance.",
                  icon: FolderOpen,
                  iconBg: "bg-blue-100",
                  iconColor: "text-blue-700",
                },
                {
                  id: "priority-tasks",
                  title: "My Priority Tasks",
                  description:
                    "Highlight urgent 'Todo' tasks (e.g. 'Collaboration' due 'Mar 1') natively on the home overview.",
                  icon: CheckCircle2,
                  iconBg: "bg-emerald-100",
                  iconColor: "text-emerald-700",
                },
                {
                  id: "activity-feed",
                  title: "Transparent Activity Feed",
                  description:
                    "Track real-time 'Latest Activity' (e.g. 'test user 2 member joined' & 'simbisai chinhema invitation sent').",
                  icon: Activity,
                  iconBg: "bg-amber-100",
                  iconColor: "text-amber-700",
                },
                {
                  id: "custom-nav",
                  title: "Custom Navigation",
                  description:
                    "Group tools into Sections: Dashboard, AI Reader, and Teamspaces (Overview, Templates, Kanban, Chat).",
                  icon: LayoutDashboard,
                  iconBg: "bg-purple-100",
                  iconColor: "text-purple-700",
                },
                {
                  id: "files",
                  title: "Files",
                  description: "Access and manage files for your team.",
                  icon: BookOpen,
                  iconBg: "bg-blue-100",
                  iconColor: "text-blue-700",
                },
                {
                  id: "kanban",
                  title: "Kanban",
                  description: "Manage your team's work in a Kanban board.",
                  icon: Kanban,
                  iconBg: "bg-blue-100",
                  iconColor: "text-blue-700",
                },
                {
                  id: "analytics",
                  title: "Analytics",
                  description: "Track and analyze your team's work.",
                  icon: BarChart,
                  iconBg: "bg-blue-100",
                  iconColor: "text-blue-700",
                },
                {
                  id: "chat",
                  title: "Chat",
                  description: "Chat with your team.",
                  icon: MessageCircle,
                  iconBg: "bg-blue-100",
                  iconColor: "text-blue-700",
                },
              ].map((feature, index) => {
                const isActive = activeTab === index;
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.id}
                    className="border-b border-gray-100 last:border-0">
                    <button
                      onClick={() => setActiveTab(index)}
                      className="w-full text-left py-5 flex items-start gap-4 group transition-all outline-none">
                      <div
                        className={`mt-0.5 p-3 rounded-xl ${feature.iconBg} transition-transform duration-300 ${isActive ? "scale-110 shadow-sm" : "group-hover:scale-110"}`}>
                        <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`text-lg font-bold ${isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"} transition-colors`}>
                          {feature.title}
                        </h4>
                        <div
                          className={`grid transition-all duration-300 ease-in-out ${isActive ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0"}`}>
                          <div className="overflow-hidden">
                            <p className="text-gray-500 text-sm leading-relaxed pr-4 font-medium">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Preview Area */}
          <div className="relative min-h-[450px] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-200/50 bg-slate-900 p-2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ease-in-out flex items-center justify-center p-2 ${
                  activeTab === index
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}>
                <div
                  className={`w-full h-full bg-slate-50 rounded-2xl flex p-4 text-xs font-sans gap-4 relative transition-all duration-500 ease-out transform ${
                    activeTab === index
                      ? "translate-y-0 scale-100 opacity-100 delay-100"
                      : "translate-y-4 scale-95 opacity-0"
                  }`}>
                  {/* Sidebar Mockup */}
                  <div
                    className={`w-40 border-r border-slate-200 pr-2 py-2 space-y-4 text-slate-500 font-medium hidden sm:block transition-colors duration-500 ${activeTab === 3 ? "bg-indigo-50/50 rounded-l-xl -ml-4 pl-4" : ""}`}>
                    <div className="font-bold text-slate-300 text-[10px] tracking-wider">
                      PRIVATE
                    </div>
                    <div>
                      <span className="text-slate-800 flex items-center gap-2">
                        <LayoutDashboard className="w-3 h-3" />
                        Dashboard
                      </span>
                      <span className="flex items-center gap-2 mt-2">
                        <FolderOpen className="w-3 h-3" />
                        My Projects
                      </span>
                      <span className="flex items-center gap-2 mt-2">
                        <Activity className="w-3 h-3" />
                        AI Reader
                      </span>
                    </div>
                    <div className="font-bold text-slate-300 text-[10px] tracking-wider pt-2">
                      TEAMSPACES
                    </div>
                    <div className="bg-green-100 text-green-800 p-1.5 rounded font-bold text-xs flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500 text-white flex items-center justify-center text-[8px]">
                        A
                      </div>{" "}
                      Audacity Impact
                    </div>
                    <div className="pl-3 border-l-2 border-green-200 ml-2 space-y-2 relative">
                      {activeTab === 3 && (
                        <div className="absolute -left-[2px] top-0 bottom-0 border-l-2 border-indigo-500 animate-pulse"></div>
                      )}
                      <span className="text-green-700 font-bold block">
                        Overview
                      </span>
                      <span className="block hover:text-slate-800 cursor-pointer">
                        Projects
                      </span>
                      <span className="block hover:text-slate-800 cursor-pointer">
                        Templates
                      </span>
                      <span className="block hover:text-slate-800 cursor-pointer">
                        Files
                      </span>
                      <span className="block hover:text-slate-800 cursor-pointer">
                        Kanban
                      </span>
                      <span className="block hover:text-slate-800 cursor-pointer">
                        Analytics
                      </span>
                      <span className="block hover:text-slate-800 cursor-pointer">
                        Chat
                      </span>
                    </div>
                  </div>

                  {/* Content Mockup */}
                  <div className="flex-1 py-2 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                    <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                          Audacity Impact Overview
                        </h3>
                        <p className="text-slate-400 mt-1">
                          Organization of works
                        </p>
                      </div>
                      <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm text-white rounded-md text-xs px-3 h-8 font-medium transition-all">
                        + New Project
                      </Button>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-3 text-center mb-6">
                      <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium mb-1">
                          Active
                        </div>
                        <div className="font-bold text-2xl text-slate-700">
                          2
                        </div>
                      </div>
                      <div
                        className={`bg-slate-50/80 p-3 rounded-lg border transition-colors ${activeTab === 1 ? "border-emerald-300 bg-emerald-50" : "border-slate-100"}`}>
                        <div
                          className={`font-medium mb-1 ${activeTab === 1 ? "text-emerald-600" : "text-slate-400"}`}>
                          Tasks
                        </div>
                        <div
                          className={`font-bold text-2xl ${activeTab === 1 ? "text-emerald-700" : "text-slate-700"}`}>
                          0 / 1
                        </div>
                      </div>
                      <div
                        className={`bg-slate-50/80 p-3 rounded-lg border transition-colors ${activeTab === 1 ? "border-amber-300 bg-amber-50" : "border-slate-100"}`}>
                        <div
                          className={`font-medium mb-1 ${activeTab === 1 ? "text-amber-600" : "text-slate-400"}`}>
                          Pending
                        </div>
                        <div
                          className={`font-bold text-2xl ${activeTab === 1 ? "text-amber-700" : "text-slate-700"}`}>
                          1
                        </div>
                      </div>
                      <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                        <div className="text-slate-400 font-medium mb-1">
                          Members
                        </div>
                        <div className="font-bold text-2xl text-slate-700">
                          2
                        </div>
                      </div>
                    </div>

                    {/* Feeds */}
                    <div className="flex gap-6 mt-2 flex-1 relative">
                      {/* Active Projects Overlay effect */}
                      {activeTab === 0 && (
                        <div className="absolute inset-0 bg-blue-50/30 w-[60%] -left-3 rounded-xl pointer-events-none mix-blend-multiply border border-blue-100/50"></div>
                      )}

                      <div className="flex-1 space-y-3 z-10 relative">
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          Recent Projects{" "}
                          {activeTab === 0 && (
                            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <div
                          className={`bg-white border rounded-lg p-3 relative shadow-sm transition-all hover:shadow-md ${activeTab === 0 ? "border-blue-300 ring-1 ring-blue-100" : "border-slate-200"}`}>
                          <span className="absolute top-3 right-3 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                          <div className="font-bold text-slate-900 text-sm mb-1">
                            Collab Test
                          </div>
                          <div className="text-slate-500 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" />1 tasks pending
                          </div>
                        </div>
                        <div
                          className={`bg-white border rounded-lg p-3 relative shadow-sm transition-all hover:shadow-md ${activeTab === 0 ? "border-blue-300 ring-1 ring-blue-100 delay-75" : "border-slate-200"}`}>
                          <span className="absolute top-3 right-3 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                          <div className="font-bold text-slate-900 text-sm mb-1">
                            test workspace document
                          </div>
                          <div className="text-slate-500 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 opacity-50" />0
                            tasks
                          </div>
                        </div>

                        {/* Priority Tasks overlay */}
                        <div
                          className={`transition-all duration-500 overflow-hidden ${activeTab === 1 ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"}`}>
                          <div className="font-bold text-emerald-800 text-sm flex items-center gap-2 mb-2">
                            Priority Todo
                          </div>
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 relative shadow-sm">
                            <span className="absolute top-3 right-3 text-emerald-600 text-[10px] font-bold">
                              Due Mar 1
                            </span>
                            <div className="font-bold text-slate-900 text-sm mb-1 flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full border-2 border-emerald-500 mt-0.5 shrink-0"></span>
                              Collaboration
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Feed Column */}
                      <div className="w-[45%] border-l border-slate-100 pl-6 space-y-4 relative z-10 transition-colors duration-500">
                        {activeTab === 2 && (
                          <div className="absolute inset-y-0 -right-4 -left-2 bg-amber-50/40 rounded-xl pointer-events-none -z-10 mix-blend-multiply border border-amber-100/50"></div>
                        )}

                        {/* Feed items */}
                        <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                          Latest Activity{" "}
                          {activeTab === 2 && (
                            <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                          )}
                        </div>

                        <div className="relative border-l-2 border-slate-100 pl-3 ml-2 space-y-5">
                          <div className="relative">
                            <div
                              className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${activeTab === 2 ? "bg-amber-400 scale-125" : "bg-slate-300"}`}></div>
                            <div className="text-xs text-slate-600">
                              <b className="text-slate-900 block mb-0.5">
                                test user 2
                              </b>{" "}
                              member joined
                              <div className="text-[10px] text-slate-400 mt-1">
                                2 hours ago
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <div
                              className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white transition-all delay-100 ${activeTab === 2 ? "bg-amber-400 scale-125" : "bg-slate-300"}`}></div>
                            <div className="text-xs text-slate-600">
                              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.5 rounded block w-max mb-1">
                                Invite
                              </span>
                              <b className="text-slate-900 block mb-0.5">
                                simbisai chinhema
                              </b>{" "}
                              invitation sent
                              <div className="text-[10px] text-slate-400 mt-1">
                                Yesterday
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-slate-50 border-t">
        <div className="container-custom max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-2">Structured Navigation</h3>
            <p className="text-sm text-gray-600">
              Organize your team spaces into specific sections like Overview,
              Kanban, Calendar, Analytics, and Chat.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-2">My Priority Tasks</h3>
            <p className="text-sm text-gray-600">
              Highlight pending actions, assignees, and deadlines intuitively
              directly on the home dashboard.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-2">Transparent Activity</h3>
            <p className="text-sm text-gray-600">
              Instantly see tracking details of member requests, document
              updates, and file changes.
            </p>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
