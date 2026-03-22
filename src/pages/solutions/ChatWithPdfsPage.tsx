import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "../../components/ui/button";
import LayoutWrapper from "../../components/Layout";
import {
  MessageSquareText,
  Shield,
  Zap,
  Bot,
  Sparkles,
  Layers,
  Search,
  ArrowRight,
  CheckCircle2,
  FileText,
  Quote,
  Network,
  Calculator,
  History,
  Eye,
  Microscope,
  Database,
  Lock,
} from "lucide-react";

export default function ChatWithPdfsPage() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      id: "contextual-synthesis",
      title: "Contextual Synthesis",
      description:
        "Our engine bridges knowledge gaps by correlating findings across multiple papers. It doesn't just extract text; it synthesizes consensus and contradictions within your library.",
      icon: Network,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      id: "math-precision",
      title: "Mathematical Precision",
      description:
        "Full support for LaTeX formulas and complex data tables. Extract quantitative data from charts and textual tables with institutional-grade accuracy.",
      icon: Calculator,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-700",
    },
    {
      id: "knowledge-topology",
      title: "Knowledge Topology",
      description:
        "Visualize the conceptual connections between your documents. Map the evolution of ideas and identify the most influential sources in your research niche.",
      icon: Microscope,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      id: "verified-attribution",
      title: "Verified Attribution",
      description:
        "Every response is pinned to exact coordinates in your PDFs. Click any citation to immediately view the highlighted evidence in its original structural context.",
      icon: Eye,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
  ];

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-white font-sans selection:bg-blue-500 selection:text-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          </div>

          <div className="container-custom relative z-10 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase mb-8 tracking-widest backdrop-blur-sm animate-fade-in">
                <Bot className="w-4 h-4" /> Cognitive Institutional Intelligence
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[1.1] animate-fade-in">
                Chat with your <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                  Institutional Memory.
                </span>
              </h1>
              <p
                className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-fade-in"
                style={{ animationDelay: "0.2s" }}>
                Transform static PDFs into dynamic research nodes. ColabWize
                extracts structural meaning, cross-references methodologies, and
                provides instant, cited intelligence for the modern scholar.
              </p>
              <div
                className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
                style={{ animationDelay: "0.4s" }}>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-7 rounded-2xl text-lg shadow-xl shadow-blue-500/20 transition-all border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                  asChild>
                  <RouterLink to="/signup">
                    Start Free Analysis <ArrowRight className="ml-2 w-5 h-5" />
                  </RouterLink>
                </Button>
                <Button className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold px-10 py-7 rounded-2xl text-lg backdrop-blur-md">
                  View Security Specs
                </Button>
              </div>
            </div>
          </div>

          {/* Visual Floating Elements */}
          <div
            className="container-custom mt-20 relative px-4 md:px-0 lg:px-20 animate-fade-in"
            style={{ animationDelay: "0.6s" }}>
            <div className="relative mx-auto max-w-6xl rounded-[3rem] p-2 bg-gradient-to-b from-white/20 to-transparent backdrop-blur-sm border border-white/10 shadow-3xl overflow-hidden group">
              <div className="rounded-[2.5rem] bg-[#0F1218] overflow-hidden aspect-[16/8] relative">
                <img
                  src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80"
                  alt="Research Console"
                  className="w-full h-full object-cover opacity-30 group-hover:scale-[1.02] transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1016] via-transparent to-transparent"></div>

                {/* Simulated Chat Interface */}
                <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12">
                  <div className="w-full h-full bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-white font-bold text-sm tracking-tight">
                          Project Delta Collective
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-slate-400 uppercase font-bold tracking-widest border border-white/5">
                          12 Sources Active
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-6 space-y-6 overflow-hidden">
                      <div className="flex gap-4 max-w-[80%]">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                          JD
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 text-sm md:text-base text-slate-300">
                          Does the longitudinal study in the{" "}
                          <span className="text-blue-400 font-bold">
                            Nature 2023 paper
                          </span>{" "}
                          contradict the findings about sample bias in our
                          internal drafts?
                        </div>
                      </div>
                      <div className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center shadow-lg">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-blue-600 p-5 rounded-2xl rounded-tr-none text-sm md:text-base text-white shadow-xl shadow-blue-900/20 relative">
                          <p className="font-medium">
                            Yes, but only in context. The Nature study (p. 42)
                            reports a{" "}
                            <span className="underline decoration-white/50 font-bold">
                              14% variance
                            </span>{" "}
                            that our current draft overlooks...
                          </p>
                          <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                            <div className="px-2 py-1 bg-white/10 rounded flex items-center gap-1.5 text-[10px] font-bold">
                              <FileText className="w-3 h-3" /> Nature_2023.pdf
                              (Source)
                            </div>
                            <div className="px-2 py-1 bg-emerald-400/20 rounded flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
                              <Shield className="w-3 h-3" /> Verified Cite
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Feature Deep-Dive */}
        <section className="section-padding bg-white relative">
          <div className="container-custom max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                <div className="space-y-4">
                  <div className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-sm w-max uppercase tracking-wider">
                    Academic Intelligence
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                    Deep Reading. <br />
                    <span className="text-slate-400 text-3xl md:text-4xl font-semibold">
                      At institutional scale.
                    </span>
                  </h2>
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    ColabWize is trained on the structures of academic writing.
                    It understands the nuance of a hypothesis, the weight of a
                    p-value, and the hierarchy of citation evidence.
                  </p>
                </div>

                <div className="grid gap-4">
                  {features.map((f, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                        activeTab === i
                          ? "bg-slate-50 border-blue-200 shadow-xl shadow-blue-100/50"
                          : "bg-white border-transparent hover:bg-slate-50/50"
                      }`}>
                      <div className="flex items-start gap-6">
                        <div
                          className={`p-4 rounded-2xl flex-shrink-0 transition-all duration-500 ${
                            activeTab === i
                              ? `${f.iconBg} scale-110 shadow-md`
                              : "bg-slate-100"
                          }`}>
                          <f.icon
                            className={`w-7 h-7 ${activeTab === i ? f.iconColor : "text-slate-400"}`}
                          />
                        </div>
                        <div>
                          <h4
                            className={`text-xl font-bold mb-2 transition-colors ${activeTab === i ? "text-slate-900" : "text-slate-500"}`}>
                            {f.title}
                          </h4>
                          <div
                            className={`grid transition-all duration-300 ${activeTab === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 h-0"}`}>
                            <div className="overflow-hidden">
                              <p className="text-slate-600 font-medium text-base leading-relaxed">
                                {f.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Feature Preview */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/40 to-indigo-200/40 blur-[120px] rounded-full"></div>
                <div className="relative bg-slate-900 rounded-[3rem] p-4 shadow-3xl border border-slate-800 rotate-1">
                  <div className="bg-slate-50 rounded-[2.5rem] p-8 aspect-[4/5] flex flex-col justify-center text-center space-y-8">
                    <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mx-auto text-blue-600">
                      {React.createElement(features[activeTab].icon, {
                        className: "w-12 h-12",
                      })}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                        {features[activeTab].title}
                      </h3>
                      <p className="text-slate-500 font-medium leading-relaxed italic px-8">
                        "Configuring specialized neural layers to prioritize{" "}
                        {features[activeTab].title.toLowerCase()} across global
                        research repositories..."
                      </p>
                    </div>
                    <div className="pt-8 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                          Confidence
                        </div>
                        <div className="text-xl font-black text-slate-900">
                          99.2%
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">
                          Cross-References
                        </div>
                        <div className="text-xl font-black text-slate-900">
                          142+
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Institutional Modules */}
        <section className="section-padding bg-slate-50 border-y border-slate-200">
          <div className="container-custom max-w-6xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic">
                Enterprise Knowledge.
              </h2>
              <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                Deploy cognitive engines across your entire department.
                Centralize knowledge without sacrificing security.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Knowledge Registry",
                  desc: "Private departmental repositories where AI learns the unique context of your lab's data.",
                  icon: Database,
                },
                {
                  title: "Evidence Audit Trails",
                  desc: "Immutable logs of every AI interaction and sourced fact for peer review defensibility.",
                  icon: History,
                },
                {
                  title: "Sovereign Security",
                  desc: "AES-256 encryption for all documents with zero-knowledge metadata processing.",
                  icon: Lock,
                },
              ].map((mod, i) => (
                <div
                  key={i}
                  className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-600 transition-colors duration-500 opacity-20 group-hover:opacity-10"></div>
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-all duration-500">
                    <mod.icon className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-4">
                    {mod.title}
                  </h4>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">
                    {mod.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding bg-white overflow-hidden relative">
          <div className="container-custom max-w-5xl mx-auto relative z-10">
            <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-3xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]"></div>

              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
                  Research at the <br />
                  Speed of Thought.
                </h2>
                <p className="text-lg text-slate-400 mb-12 max-w-xl mx-auto font-medium">
                  Join the thousands of researchers transforming cognitive labor
                  into creative breakthrough with ColabWize.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-12 py-8 rounded-2xl text-xl shadow-xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1"
                    asChild>
                    <RouterLink to="/signup">Deploy Your Engine</RouterLink>
                  </Button>
                  <Button
                    className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold px-12 py-8 rounded-2xl text-xl backdrop-blur-sm"
                    asChild>
                    <RouterLink to="/contact">Request Lab Demo</RouterLink>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 1s ease-out forwards; }
          .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5); }
        `,
          }}
        />
      </div>
    </LayoutWrapper>
  );
}
