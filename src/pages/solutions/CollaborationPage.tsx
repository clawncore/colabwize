import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import LayoutWrapper from "../../components/Layout";
import {
  Users,
  History,
  ShieldCheck,
  MessageSquare,
  Lock,
  Layers,
  Zap,
  CheckCircle2,
  ArrowRight,
  Database,
  BarChart3,
  Network,
} from "lucide-react";

export default function CollaborationPage() {
  const [activeTab, setActiveTab] = useState(0);

  const keyFeatures = [
    {
      id: "real-time-sync",
      title: "Real-Time Proof-of-Work",
      description:
        "Every stroke, deletion, and pause is recorded in our high-resolution audit log. This isn't just a text editor; it's an evidence engine that generates a verifiable chain of authorship as you type.",
      icon: History,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-700",
    },
    {
      id: "encrypted-chat",
      title: "Encrypted Researcher Chat",
      description:
        "Discuss sensitive research findings in a chat environment secured by AES-256 encryption. Messages are linked directly to your projects and workspaces, keeping your scientific discourse organized and private.",
      icon: MessageSquare,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      id: "workspace-governance",
      title: "Institutional Governance",
      description:
        "Manage complex team hierarchies with granular role-based access control (RBAC). Assign Admins, Editors, and Viewers to specific research workspaces to maintain strict data integrity and compliance.",
      icon: Lock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
    },
    {
      id: "version-vault",
      title: "The Version Vault",
      description:
        "Never lose a breakthrough. Our immutable versioning system allows you to snapshot research states and instantly compare drafts with AI-powered diffing to track conceptual evolution.",
      icon: Layers,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
  ];

  return (
    <LayoutWrapper>
      {/* Hero Section */}
      <section className="section-padding bg-slate-900 text-white relative overflow-hidden">
        {/* Abstract Network Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3b82f644_0%,transparent_50%)]"></div>
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom pt-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase mb-8 backdrop-blur-sm">
              <Users className="w-4 h-4" /> Professional Research Collaboration
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold mb-8 tracking-tight leading-tight">
              Defensible Co-Authorship. <br />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                Unbreakable Integrity.
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              ColabWize is the only collaborative platform designed to withstand
              academic scrutiny. Build, debate, and verify together in a
              high-security environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-7 rounded-2xl text-lg shadow-2xl shadow-blue-500/20 transition-all border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                asChild>
                <RouterLink to="/signup">
                  Launch Team Workspace <ArrowRight className="ml-2 w-5 h-5" />
                </RouterLink>
              </Button>
              <Button
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold px-10 py-7 rounded-2xl text-lg backdrop-blur-md"
                asChild>
                <RouterLink to="/resources/demo">
                  Request Institutional Demo
                </RouterLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep-Dive */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Column: Interactive Feature List */}
            <div className="space-y-10">
              <div className="inline-block px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm mb-2">
                CORE CAPABILITIES
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                Beyond Shared Docs. <br />
                <span className="text-slate-500 text-3xl font-medium">
                  Built for Scientific Rigor.
                </span>
              </h2>

              <div className="space-y-4">
                {keyFeatures.map((feature, index) => {
                  const isActive = activeTab === index;
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.id}
                      className={`group p-6 rounded-3xl transition-all duration-300 border ${
                        isActive
                          ? "bg-slate-50 border-slate-200 shadow-xl shadow-slate-200/50"
                          : "bg-white border-transparent hover:bg-slate-50/50"
                      }`}>
                      <button
                        onClick={() => setActiveTab(index)}
                        className="w-full text-left flex items-start gap-6 outline-none">
                        <div
                          className={`mt-1 p-4 rounded-2xl flex-shrink-0 transition-all duration-500 ${
                            isActive
                              ? `${feature.iconBg} scale-110 rotate-3 shadow-lg`
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
                              <p className="text-slate-600 text-base leading-relaxed font-medium">
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

            {/* Right Column: Dynamic Preview Area */}
            <div className="relative">
              {/* Decorative background elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>

              <div className="relative bg-slate-900 p-3 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border-8 border-slate-800 overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="bg-white rounded-[1.8rem] h-[600px] flex flex-col overflow-hidden relative">
                  {/* Editor Header */}
                  <div className="px-6 py-4 border-b bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        C
                      </div>
                      <span className="font-bold text-slate-800 text-sm">
                        Research_Draft_V4
                      </span>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                        JD
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                        MK
                      </div>
                      <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                        +2
                      </div>
                    </div>
                  </div>

                  {/* Content Area (Changes based on activeTab) */}
                  <div className="flex-1 p-8 overflow-y-auto font-serif">
                    {activeTab === 0 && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="mb-6 pb-4 border-b border-indigo-100">
                          <div className="text-[10px] font-bold text-indigo-600 uppercase mb-2 tracking-widest">
                            Active Audit Trail
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed italic">
                            System capturing typing patterns for authorship
                            verification...
                          </p>
                        </div>
                        <p className="text-lg text-slate-800 leading-relaxed relative">
                          The longitudinal study of quantum entanglement
                          suggests a paradigm shift in how we perceive localized
                          information
                          <span className="bg-indigo-100 border-b-2 border-indigo-600 px-1 relative">
                            transfer mechanisms
                            <span className="absolute -top-7 left-0 bg-indigo-600 text-white text-[9px] px-2 py-1 rounded font-sans font-bold whitespace-nowrap">
                              John Doe typing...
                            </span>
                          </span>
                        </p>
                        <div className="mt-12 bg-slate-100 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-3 mb-3">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-slate-700">
                              Authorship Signal Strength: 98%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="w-[98%] h-full bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 1 && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-start">
                            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
                              <p className="text-xs text-slate-700">
                                Have you reviewed the methodology section for
                                the peer-review draft?
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <div className="bg-emerald-600 p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-white">
                              <p className="text-xs">
                                Yes, MK has verified the data sets against the
                                CrossRef source.
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-start">
                            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
                              <p className="text-xs text-slate-700 font-bold mb-1">
                                Source Attached:
                              </p>
                              <div className="bg-white border rounded-lg p-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                                <span className="text-[10px] text-slate-500">
                                  Methodology_Audit.pdf
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t relative">
                          <div className="w-full bg-slate-50 border rounded-full px-4 py-2 text-xs text-slate-400 flex justify-between items-center">
                            Type a secure message...
                            <Lock className="w-3 h-3 text-slate-300" />
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 2 && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                          <h5 className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Workspace Access
                            Control
                          </h5>
                          <p className="text-[10px] text-amber-700">
                            You are viewing the governance dashboard for
                            Institutional Lab A.
                          </p>
                        </div>
                        <div className="space-y-4">
                          {[
                            {
                              name: "Prof. Sarah Miller",
                              role: "Workspace Admin",
                              status: "Active",
                            },
                            {
                              name: "John Doe",
                              role: "Lead Editor",
                              status: "Active",
                            },
                            {
                              name: "Maria Garcia",
                              role: "Dataset Contributor",
                              status: "Active",
                            },
                            {
                              name: "Extern Advisor",
                              role: "External Viewer",
                              status: "Limited",
                            },
                          ].map((member, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                <div>
                                  <div className="text-[11px] font-bold text-slate-800">
                                    {member.name}
                                  </div>
                                  <div className="text-[9px] text-slate-500">
                                    {member.role}
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${member.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                {member.status}
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="mt-8 w-full py-3 border-2 border-dashed border-slate-300 rounded-2xl text-xs font-bold text-slate-400 hover:bg-slate-50 transition-colors">
                          + Invite Researcher
                        </button>
                      </div>
                    )}

                    {activeTab === 3 && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 mb-6">
                          <div className="text-[10px] font-bold text-purple-700 uppercase tracking-widest mb-1">
                            State: VERSION COMPARISON
                          </div>
                          <p className="text-[11px] text-purple-900 leading-relaxed font-semibold">
                            Comparing "Draft_V4" (Active) vs "Draft_V3"
                            (Baseline)
                          </p>
                        </div>
                        <div className="flex-1 space-y-4 font-serif text-sm">
                          <p className="text-slate-800 line-through decoration-red-400 bg-red-50/50 px-1">
                            The old approach utilized standard data gathering
                            metrics that were largely influenced by local
                            variables.
                          </p>
                          <p className="text-slate-800 bg-emerald-50/50 border-l-4 border-emerald-400 pl-4 py-2">
                            The updated research methodology incorporates
                            high-resolution sensor metadata, eliminating
                            previous localized variances.
                          </p>
                          <div className="mt-8 flex gap-3">
                            <button className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-[10px] font-bold">
                              Restore V3
                            </button>
                            <button className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold">
                              Accept Change
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status Bar */}
                  <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />{" "}
                        SYNCED
                      </span>
                      <span>1,248 WORDS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-indigo-200">
                        PROOF OF WORK ACTIVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Block */}
      <section className="section-padding bg-slate-50 border-t border-b">
        <div className="container-custom max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Built for Institutional Scale
            </h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Deploy private research networks within your university or lab
              with enterprise-grade infrastructure.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Database,
                title: "Shared Research Repositories",
                description:
                  "Teams can centralize PDFs, citations, and notes in a shared vault accessible only to verified workspace members.",
              },
              {
                icon: BarChart3,
                title: "Author Contribution Analytics",
                description:
                  "Detailed visualization of who contributed which concepts. Perfect for transparent co-authorship attribution.",
              },
              {
                icon: Network,
                title: "Multi-Lab Connectivity",
                description:
                  "Seamlessly connect disparate research teams across time zones with real-time sync and low-latency co-authoring.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-shadow group">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <item.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-4">
                  {item.title}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-3xl">
            {/* Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight">
                Ready to collaborate without <br className="hidden md:block" />
                compromising integrity?
              </h2>
              <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
                Join the researchers who are building the future of academia on
                ColabWize. Full workspace suites are now available for teams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-bold">
                <Button
                  className="bg-white text-blue-700 hover:bg-blue-50 px-10 py-7 rounded-2xl w-full sm:w-auto"
                  asChild>
                  <RouterLink to="/signup">Get Started For Free</RouterLink>
                </Button>
                <Button
                  className="bg-transparent border-white/20 hover:bg-white/10 text-white px-10 py-7 rounded-2xl w-full sm:w-auto backdrop-blur-sm"
                  asChild>
                  <RouterLink to="/contact">Contact Sales</RouterLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
