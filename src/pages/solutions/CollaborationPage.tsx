import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import LayoutWrapper from "../../components/Layout";
import {
  Users,
  History,
  FileDown,
  Map,
  Maximize,
  ArrowRight,
} from "lucide-react";

export default function CollaborationPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <LayoutWrapper>
      <section className="section-padding bg-slate-50 relative">
        <div className="container-custom pt-10 text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-bold text-xs uppercase mb-6">
            <Users className="w-4 h-4" /> The Intelligent Collaborative Editor
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Write Together.{" "}
            <span className="text-blue-600">Perfect Content Instantly.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto font-medium">
            Experience real-time co-authoring backed by a powerful suite of
            academic tools.
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 rounded-full"
            asChild>
            <RouterLink to="/signup">
              Start Editing Free <ArrowRight className="ml-2 w-5 h-5" />
            </RouterLink>
          </Button>
        </div>
      </section>

      <section className="section-padding bg-white overflow-hidden">
        <div className="container-custom grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
          <div className="space-y-8 py-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need, One Click Away
            </h2>
            <div className="flex flex-col">
              {[
                {
                  id: "version-history",
                  title: "Save Version & History",
                  description:
                    "Instantly rollback or view a detailed changelog of who wrote what.",
                  icon: History,
                  iconBg: "bg-indigo-100",
                  iconColor: "text-indigo-700",
                },
                {
                  id: "export-apa",
                  title: "Export & APA",
                  description:
                    "Generate an APA-ready draft and export your project instantly.",
                  icon: FileDown,
                  iconBg: "bg-emerald-100",
                  iconColor: "text-emerald-700",
                },
                {
                  id: "originality-map",
                  title: "Originality Map & Rewrite",
                  description:
                    "Ensure text originality on the fly ethically right inside the editor.",
                  icon: Map,
                  iconBg: "bg-purple-100",
                  iconColor: "text-purple-700",
                },
                {
                  id: "focus-preview",
                  title: "Focus & Preview",
                  description:
                    "Hide the toolbar to write distraction-free alongside your peers.",
                  icon: Maximize,
                  iconBg: "bg-amber-100",
                  iconColor: "text-amber-700",
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
          <div className="relative min-h-[450px] rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 bg-slate-900 p-2">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ease-in-out flex items-center justify-center p-2 ${
                  activeTab === index
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}>
                <div
                  className={`w-full h-full bg-white rounded-2xl flex flex-col p-4 relative transition-all duration-500 ease-out transform ${
                    activeTab === index
                      ? "translate-y-0 scale-100 opacity-100 delay-100"
                      : "translate-y-4 scale-95 opacity-0"
                  }`}>
                  {/* Dynamic Header based on active tab */}
                  <div className="font-bold text-sm mb-4 pb-2 border-b">
                    Collab Test{" "}
                    <span className="text-xs text-gray-400 font-normal ml-2 flex-wrap items-center gap-2 inline-flex">
                      <span
                        className={
                          activeTab === 0 ? "font-bold text-indigo-600" : ""
                        }>
                        Save Version
                      </span>{" "}
                      |
                      <span
                        className={
                          activeTab === 0 ? "font-bold text-indigo-600" : ""
                        }>
                        History
                      </span>{" "}
                      |
                      <span
                        className={
                          activeTab === 1 ? "font-bold text-emerald-600" : ""
                        }>
                        Export
                      </span>{" "}
                      |
                      <span
                        className={
                          activeTab === 1 ? "font-bold text-emerald-600" : ""
                        }>
                        APA
                      </span>{" "}
                      |
                      <span
                        className={
                          activeTab === 3 ? "font-bold text-amber-600" : ""
                        }>
                        Preview
                      </span>{" "}
                      |
                      <span
                        className={
                          activeTab === 3 ? "font-bold text-amber-600" : ""
                        }>
                        Focus
                      </span>{" "}
                      |
                      <span
                        className={
                          activeTab === 2 ? "font-bold text-purple-600" : ""
                        }>
                        Originality Map
                      </span>{" "}
                      |
                      <span
                        className={
                          activeTab === 2 ? "font-bold text-purple-600" : ""
                        }>
                        Rewrite
                      </span>
                    </span>
                  </div>

                  {/* Dynamic Content Body based on active tab */}
                  <div className="font-serif text-sm flex-1 text-gray-800 relative">
                    {activeTab === 0 && (
                      <div className="absolute inset-0 bg-indigo-50/50 rounded p-4 border border-indigo-100 shadow-inner">
                        <div className="text-xs font-sans text-indigo-600 font-bold mb-2 uppercase tracking-wider">
                          Version History
                        </div>
                        <div className="space-y-3">
                          <div className="text-xs text-gray-500 flex justify-between">
                            <div className="font-bold text-gray-800">
                              Current Version
                            </div>
                            <span>Just now</span>
                          </div>
                          <div className="text-xs text-indigo-500 flex justify-between">
                            <div>clawnCore multitech saved</div>
                            <span>2m ago</span>
                          </div>
                          <div className="text-xs text-gray-500 flex justify-between">
                            <div>Initial Draft automatically saved</div>
                            <span>10m ago</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {activeTab === 1 && (
                      <div className="absolute inset-0 bg-emerald-50/50 rounded flex items-center justify-center border border-emerald-100">
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-emerald-100">
                          <FileDown className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                          <div className="font-bold text-gray-800 mb-1">
                            Export Ready
                          </div>
                          <div className="text-xs text-gray-500">
                            Document converted to APA 7th Edition formatting.
                          </div>
                          <button className="mt-4 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full">
                            Download .docx
                          </button>
                        </div>
                      </div>
                    )}
                    {activeTab !== 0 && activeTab !== 1 && (
                      <>
                        <p className="mb-2">how are you doing today</p>
                        <p className="mb-2">
                          perfect is this what i'm seeing correct
                        </p>
                        <p className="mb-2 relative w-max inline-block">
                          see whas happening here{" "}
                          <span
                            className={
                              activeTab === 2
                                ? "bg-red-200 text-red-900 px-1 rounded border-b-2 border-red-500"
                                : "bg-red-800 text-white text-[10px] px-1 rounded absolute -right-32 top-0"
                            }>
                            {activeTab === 2
                              ? "clawnCore multitech will always be some errors"
                              : "clawnCore multitech"}
                          </span>
                        </p>
                        {activeTab === 2 && (
                          <div className="absolute mt-2 left-0 bg-white shadow-xl border border-red-100 rounded-lg p-3 w-[260px] z-20">
                            <div className="text-[10px] font-bold text-red-600 mb-1 uppercase tracking-wide">
                              Originality Alert
                            </div>
                            <div className="text-xs text-gray-600 mb-2">
                              High similarity found (89% match). Source:
                              'Journal of Software Engineering'
                            </div>
                            <button className="bg-purple-50 text-purple-700 hover:bg-purple-100 transition px-2 py-1 text-xs font-bold rounded flex items-center gap-1 w-full justify-center">
                              <Map className="w-3 h-3" /> Rewrite with AI
                            </button>
                          </div>
                        )}
                        {activeTab === 3 && (
                          <div className="absolute inset-x-0 bottom-4 bg-gray-900/90 text-white text-xs p-3 rounded-lg text-center font-sans shadow-lg animate-pulse">
                            Focus Mode Active. Press ESC to exit.
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Static Footer */}
                  <div className="border-t mt-4 pt-3 flex justify-between items-center text-xs text-gray-500 font-bold">
                    <div className="flex gap-4">
                      <span>119 words</span>
                      <span>Timer: 2m 19s</span>
                      <span>Edits: 48</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-purple-600 text-white px-3 py-1.5 rounded shadow">
                        View Proof of Work
                      </span>
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
            <h3 className="text-lg font-bold mb-2">Live Session Tracking</h3>
            <p className="text-sm text-gray-600">
              Track exact word counts, active editing time, and total document
              edits live in the footer.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold mb-2">Integrity AI Tools</h3>
            <p className="text-sm text-gray-600">
              Launch 'Citation Audit', 'Ask Integrity AI', or 'Find Papers' to
              integrate verifiable research seamlessly.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm ring-1 ring-purple-600/20">
            <h3 className="text-lg font-bold mb-2">View Proof of Work</h3>
            <p className="text-sm text-gray-600">
              Click to instantly package your typing history, versions, and
              edits into a secure certificate.
            </p>
          </div>
        </div>
      </section>
    </LayoutWrapper>
  );
}
