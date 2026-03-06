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
  BarChart3,
  Kanban,
  Shield,
  Zap,
  Users2,
  Lock,
  Search,
  Plus,
  Network,
  Clock,
  PieChart,
} from "lucide-react";

export default function TeamWorkspacePage() {
  const [activeTab, setActiveTab] = useState(0);

  const workspaceFeatures = [
    {
      id: "strategic-mapping",
      title: "Strategic Project Mapping",
      description:
        "Visualize your entire research portfolio on one timeline. Monitor milestones, identify bottlenecks, and ensure every lab project is moving toward publication with high-resolution health indicators.",
      icon: LayoutDashboard,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-700",
    },
    {
      id: "resource-vault",
      title: "Centralized Resource Vault",
      description:
        "Consolidate your team's intellectual property. A single, encrypted enclosure for datasets, PDFs, and shared citation libraries accessible only to verified workspace members.",
      icon: FolderOpen,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      id: "contribution-analytics",
      title: "Contribution Analytics",
      description:
        "Quantify team throughput with unprecedented clarity. Our analytics engine tracks contribution signals, editing velocity, and research distribution to ensure fair co-authorship attribution.",
      icon: BarChart3,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      id: "agile-research",
      title: "Agile Research Workflows",
      description:
        "Adapt professional PM methodologies for the lab. Use specialized Kanban boards and research-ready task management to bridge the gap between experimental work and manuscript drafting.",
      icon: Kanban,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
  ];

  return (
    <LayoutWrapper>
      {/* Hero Section */}
      <section className="section-padding bg-slate-900 text-white relative overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#4f46e544_0%,transparent_50%)]"></div>
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-blue-500/10 rounded-full blur-[120px]"></div>
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full opacity-10">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="border-[0.5px] border-white/20"></div>
            ))}
          </div>
        </div>

        <div className="container-custom pt-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-[10px] sm:text-xs uppercase mb-8 tracking-widest backdrop-blur-sm">
              <Shield className="w-4 h-4" /> Institutional Command Center
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold mb-8 tracking-tighter leading-[1.1]">
              Command Your <br />
              <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Research Ecosystem.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              ColabWize centralizes your institution's intellectual output into
              a high-security, high-visibility hub. Total oversight for labs,
              universities, and private teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-7 rounded-2xl text-lg shadow-2xl shadow-indigo-500/20 transition-all border-b-4 border-indigo-800 active:border-b-0 active:translate-y-1"
                asChild>
                <RouterLink to="/signup">
                  Launch Team Hub <ArrowRight className="ml-2 w-5 h-5" />
                </RouterLink>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold px-10 py-7 rounded-2xl text-lg backdrop-blur-md"
                asChild>
                <RouterLink to="/pricing">Explore Enterprise Plans</RouterLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Command Center */}
      <section className="section-padding bg-white relative">
        <div className="container-custom max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Box: Content */}
            <div className="order-2 lg:order-1 space-y-8">
              <div className="space-y-4">
                <div className="px-3 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm w-max uppercase tracking-wider">
                  Operational Control
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                  One Unified Hub. <br />
                  <span className="text-slate-400">Unlimited Visibility.</span>
                </h2>
                <p className="text-slate-600 font-medium leading-relaxed max-w-lg">
                  Stop chasing updates through email and fragmented tools.
                  ColabWize provides a single source of truth for your team's
                  entire output.
                </p>
              </div>

              <div className="grid sm:grid-cols-1 gap-4">
                {workspaceFeatures.map((feature, index) => {
                  const isActive = activeTab === index;
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      className={`group p-6 rounded-3xl transition-all duration-300 border cursor-pointer ${
                        isActive
                          ? "bg-slate-50 border-indigo-200 shadow-xl shadow-indigo-100/50"
                          : "bg-white border-transparent hover:bg-slate-50/50"
                      }`}
                      onClick={() => setActiveTab(index)}>
                      <div className="flex items-start gap-6">
                        <div
                          className={`mt-1 p-4 rounded-2xl flex-shrink-0 transition-all duration-500 ${
                            isActive
                              ? `${feature.iconBg} scale-110 shadow-lg`
                              : "bg-slate-100 group-hover:bg-slate-200"
                          }`}>
                          <Icon
                            className={`w-7 h-7 ${isActive ? feature.iconColor : "text-slate-400"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4
                            className={`text-xl font-bold mb-2 transition-colors ${isActive ? "text-slate-900" : "text-slate-500 group-hover:text-slate-700"}`}>
                            {feature.title}
                          </h4>
                          <div
                            className={`grid transition-all duration-300 ${
                              isActive
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0 h-0"
                            }`}>
                            <div className="overflow-hidden">
                              <p className="text-slate-600 text-base leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Box: Mockup */}
            <div className="order-1 lg:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200/40 to-blue-200/40 blur-[100px] rounded-full"></div>

              <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-3xl border-8 border-slate-800 transform lg:-rotate-2 hover:rotate-0 transition-transform duration-1000">
                <div className="bg-slate-50 rounded-[2rem] h-[650px] overflow-hidden flex flex-col relative font-sans">
                  {/* Header Mockup */}
                  <div className="px-6 py-4 border-b bg-white flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <Network className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          Institutional_Lab_V6
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          Global Overview
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center bg-slate-100 rounded-full px-4 py-1.5 gap-2 border">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          Search command...
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white"></div>
                    </div>
                  </div>

                  {/* Middle Dashboard Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Metric Grid */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          label: "Active Nodes",
                          val: "12",
                          icon: Zap,
                          color: "text-amber-500",
                          bg: "bg-amber-50",
                        },
                        {
                          label: "Team Health",
                          val: "94%",
                          icon: Shield,
                          color: "text-indigo-500",
                          bg: "bg-indigo-50",
                        },
                        {
                          label: "Throughput",
                          val: "8.4",
                          icon: BarChart3,
                          color: "text-emerald-500",
                          bg: "bg-emerald-50",
                        },
                      ].map((m, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-2xl border bg-white shadow-sm flex flex-col justify-between transition-all duration-700 ${activeTab === 2 ? "scale-105 border-emerald-200" : "border-slate-100"}`}>
                          <m.icon className={`w-4 h-4 mb-2 ${m.color}`} />
                          <div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">
                              {m.label}
                            </div>
                            <div className="text-xl font-bold text-slate-800">
                              {m.val}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Tab-driven content simulation */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 min-h-[350px]">
                      {activeTab === 0 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                          <h4 className="font-bold text-slate-900 text-sm mb-4">
                            Portfolio Timeline
                          </h4>
                          <div className="space-y-5">
                            {[
                              {
                                name: "Quantum-Mesh Phase 1",
                                progress: 75,
                                date: "Due in 4d",
                                color: "bg-blue-500",
                              },
                              {
                                name: "Neural-Sync Beta",
                                progress: 40,
                                date: "Due in 12d",
                                color: "bg-indigo-500",
                              },
                              {
                                name: "Institutional Audit",
                                progress: 95,
                                date: "Due Tomorrow",
                                color: "bg-emerald-500",
                              },
                            ].map((p, i) => (
                              <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[10px]">
                                  <span className="font-bold text-slate-700">
                                    {p.name}
                                  </span>
                                  <span className="text-slate-400">
                                    {p.date}
                                  </span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${p.color} rounded-full`}
                                    style={{ width: `${p.progress}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className="mt-8 w-full py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-bold text-slate-400 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                            + Schedule Milestone
                          </button>
                        </div>
                      )}

                      {activeTab === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                          <div className="flex justify-between items-center mb-6">
                            <h4 className="font-bold text-slate-900 text-sm">
                              Consolidated Vault
                            </h4>
                            <div className="flex gap-2">
                              <div className="p-1 px-3 bg-blue-50 text-blue-700 text-[9px] font-bold rounded-full border border-blue-100">
                                ALL FILES
                              </div>
                              <div className="p-1 px-3 bg-slate-50 text-slate-500 text-[9px] font-bold rounded-full border">
                                COLLECTIONS
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              {
                                name: "DataSet_Q.csv",
                                size: "2.4GB",
                                type: "DATA",
                              },
                              {
                                name: "Theory_V2.pdf",
                                size: "45MB",
                                type: "PDF",
                              },
                              {
                                name: "Citation_Lib",
                                size: "1.2k",
                                type: "REF",
                              },
                              {
                                name: "Raw_Feed.log",
                                size: "8GB",
                                type: "LOG",
                              },
                            ].map((f, i) => (
                              <div
                                key={i}
                                className="p-3 border rounded-xl bg-slate-50/50 flex items-center gap-3 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-white border shadow-sm flex items-center justify-center text-[8px] font-bold text-blue-600">
                                  {f.type}
                                </div>
                                <div>
                                  <div className="text-[10px] font-bold text-slate-800">
                                    {f.name}
                                  </div>
                                  <div className="text-[8px] text-slate-400">
                                    {f.size}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-24 h-24 rounded-full border-8 border-emerald-500 border-t-transparent animate-spin-slow"></div>
                            <div>
                              <div className="text-2xl font-black text-slate-900">
                                88.4%
                              </div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                Resource Utilization
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] p-2 bg-emerald-50 rounded-lg">
                              <span className="font-bold text-emerald-800">
                                Team Velocity Increase
                              </span>
                              <span className="text-emerald-700">+12.4%</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] p-2 bg-slate-50 rounded-lg">
                              <span className="font-bold text-slate-600">
                                Cross-Lab Latency
                              </span>
                              <span className="text-slate-400">14ms</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-4">
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            <span className="text-[9px] font-bold px-3 py-1 bg-purple-100 text-purple-700 rounded-full shrink-0">
                              BACKLOG
                            </span>
                            <span className="text-[9px] font-bold px-3 py-1 bg-slate-100 text-slate-400 rounded-full shrink-0">
                              IN REVIEW
                            </span>
                            <span className="text-[9px] font-bold px-3 py-1 bg-slate-100 text-slate-400 rounded-full shrink-0">
                              PUBLISHED
                            </span>
                          </div>
                          <div className="p-4 border-2 border-indigo-100 bg-indigo-50/50 rounded-2xl shadow-sm">
                            <div className="text-[9px] font-black text-indigo-600 mb-2">
                              URGENT
                            </div>
                            <div className="text-xs font-bold text-slate-800 mb-4">
                              Validate methodology against ethical framework 7.b
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex -space-x-1">
                                <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                                <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white"></div>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400">
                                Mar 12
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Nav Mockup */}
                  <div className="px-8 py-4 bg-white border-t flex items-center justify-between">
                    <div className="flex gap-8">
                      <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                      <FolderOpen className="w-5 h-5 text-slate-300" />
                      <Users2 className="w-5 h-5 text-slate-300" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Network Section */}
      <section className="section-padding bg-slate-50 border-t">
        <div className="container-custom max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
            <div className="max-w-xl">
              <div className="text-indigo-600 font-bold text-sm uppercase mb-4 tracking-widest">
                Global Architecture
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900">
                Synchronized Research, <br />
                Global Scale.
              </h3>
            </div>
            <p className="text-slate-500 font-medium md:max-w-xs text-sm leading-relaxed">
              Connect disparate lab nodes across institutions with zero latency
              and absolute data sovereignty.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Network,
                title: "Multi-Node Registry",
                desc: "Manage multiple satellite labs from a single administrative parent node.",
              },
              {
                icon: Clock,
                title: "Real-Time Sync",
                desc: "Every project update propagates across your global network in 50ms or less.",
              },
              {
                icon: PieChart,
                title: "Executive Reports",
                desc: "Institutional-level analytics on research output and IP generation.",
              },
              {
                icon: Lock,
                title: "Sovereign Storage",
                desc: "Choose your data jurisdiction with local cloud or on-premise hosting.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                  <item.icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h5 className="text-lg font-bold text-slate-900 mb-3">
                  {item.title}
                </h5>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-6xl font-black mb-8 tracking-tighter">
                Ready for total <br />
                research control?
              </h2>
              <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto font-medium">
                Join leading institutions building the future of coordinated
                scientific discovery on ColabWize.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-12 py-8 rounded-2xl text-lg shadow-2xl shadow-indigo-600/20"
                  asChild>
                  <RouterLink to="/signup">Deploy Workspace Hub</RouterLink>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/5 border-white/20 hover:bg-white/10 text-white font-bold px-12 py-8 rounded-2xl text-lg"
                  asChild>
                  <RouterLink to="/contact">Schedule Site Visit</RouterLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
