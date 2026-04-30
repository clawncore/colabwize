import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DraftComparisonPanel } from "../../components/originality/DraftComparisonPanel";
import {
  DraftComparisonService,
  ComparisonResult,
} from "../../services/draftComparisonService";
import {
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  History,
  FileSearch,
  BrainCircuit,
  Zap,
  Lock,
  Layers,
  Quote,
  Eye,
  CheckCircle2,
  LineChart,
  Network,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Link as RouterLink } from "react-router-dom";

export const DraftComparisonPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const features = [
    {
      id: "semantic-delta",
      title: "Semantic Delta Analysis",
      description:
        "Go beyond character matching. Our engine understands the structural and semantic shifts in your work, identifying where arguments have been refined versus mere stylistic changes.",
      icon: BrainCircuit,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      id: "citation-audit",
      title: "Citation Stability Graph",
      description:
        "Track your references across versions. Ensure that critical citations remain linked and that no 'ghost' references are introduced or lost during major structural revisions.",
      icon: Quote,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-700",
    },
    {
      id: "integrity-shield",
      title: "Integrity Verification Shield",
      description:
        "A specialized cross-check against all repository drafts to avoid accidental self-plagiarism. Maintain a perfect, defensible audit trail of your unique authorship evolution.",
      icon: ShieldCheck,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
    },
    {
      id: "authorship-flow",
      title: "Authorship Signal Flow",
      description:
        "Analyze the 'voice' consistency across versions. Identify authorship signal strength to prove original contribution during institutional audits or peer review.",
      icon: Layers,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
    },
  ];

  const handleCompare = async (data: {
    currentDraft: string;
    previousDraft?: string;
    file?: File;
  }) => {
    setIsComparing(true);
    setError(null);
    setResult(null);

    try {
      const comparisonData = await DraftComparisonService.compareDrafts(
        "temp-session",
        data.currentDraft,
        { previousDraft: data.previousDraft, file: data.file },
      );
      setResult(comparisonData);
    } catch (err: any) {
      setError(err.message || "Comparison failed");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 pb-20 lg:pt-32 lg:pb-32 bg-slate-50 border-b border-slate-200 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 font-bold text-[10px] uppercase mb-8 tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" /> Authorship Integrity Protocol
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[1.05] text-slate-900">
                Integrity at <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">
                  Every Version.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed font-medium">
                ColabWize’s version comparison engine provides high-resolution
                insights into your writing evolution, safeguards against
                self-plagiarism, and builds a defensible history for every
                manuscript.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-7 rounded-2xl text-lg shadow-xl shadow-blue-500/10 transition-all border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 active:scale-95">
                  Start Analysis <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-8 py-7 rounded-2xl text-lg shadow-sm">
                  View Certification Workflow
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-[3rem] overflow-hidden border border-slate-200 shadow-2xl bg-white p-4">
                <img 
                  src="/minimal_document_comparison_vector_1773997443325.png" 
                  alt="Minimal Document Comparison" 
                  className="w-full h-auto object-cover rounded-[2rem]"
                />
              </div>
              
              {/* Soft decorative background glow */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-200/20 rounded-full blur-[80px]"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Deep-Dive */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Mockup Column */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/40 to-indigo-200/40 blur-[120px] rounded-full"></div>

              <div className="relative bg-slate-900 rounded-[2.5rem] p-2 shadow-3xl border border-slate-800 transform lg:rotate-1">
                <div className="bg-slate-50 rounded-[2rem] h-[550px] overflow-hidden flex flex-col font-sans">
                  {/* Comparison Header */}
                  <div className="px-6 py-4 border-b bg-white flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <History className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="font-bold text-slate-700 text-xs">
                        V2 vs V1 Comparative Analysis
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Comparative View */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Left Panel: V1 */}
                      <div className="space-y-3">
                        <div className="text-[10px] font-bold text-slate-400 uppercase letter-spacing-widest mb-1">
                          Draft V1 (Baseline)
                        </div>
                        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 opacity-60">
                          <div className="h-2 w-full bg-slate-100 rounded"></div>
                          <div className="h-2 w-4/5 bg-slate-100 rounded"></div>
                          <div className="h-2 w-full bg-slate-100 rounded"></div>
                          <div className="h-2 w-3/4 bg-red-100 rounded border-l-2 border-red-400"></div>
                          <div className="h-2 w-full bg-slate-100 rounded"></div>
                        </div>
                      </div>
                      {/* Right Panel: V2 */}
                      <div className="space-y-3">
                        <div className="text-[10px] font-bold text-indigo-500 uppercase letter-spacing-widest mb-1">
                          Draft V2 (Current)
                        </div>
                        <div className="p-3 bg-white border-2 border-indigo-100 rounded-xl space-y-2 shadow-sm">
                          <div className="h-2 w-full bg-slate-100 rounded"></div>
                          <div className="h-2 w-4/5 bg-slate-100 rounded"></div>
                          <div className="h-2 w-full bg-slate-100 rounded"></div>
                          <div className="h-2 w-full bg-emerald-50 rounded border-l-2 border-emerald-400 animate-pulse"></div>
                          <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Overlay */}
                    <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <BrainCircuit className="w-16 h-16" />
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-900 text-sm">
                          Intelligence Breakdown
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-emerald-100">
                          88.4% Integrity
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                            <Zap className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                              <span>Semantic Shift</span>
                              <span>Minimal</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: "24%" }}></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                            <FileSearch className="w-5 h-5 text-amber-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                              <span>Reference Overlap</span>
                              <span>Verified</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: "95%" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Footer */}
                  <div className="p-4 bg-slate-900 text-white flex justify-between items-center px-8">
                    <div className="flex gap-4 opacity-70">
                      <ShieldCheck className="w-4 h-4" />
                      <Network className="w-4 h-4" />
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 h-8 px-4 text-[10px] font-bold rounded-lg transition-transform active:scale-95">
                      Generate Audit Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm w-max uppercase tracking-wider">
                  Precision Audit
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
                  Defensible Science. <br />
                  <span className="text-slate-400 text-3xl md:text-4xl">
                    One comparison at a time.
                  </span>
                </h2>
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
          </div>
        </div>
      </section>

      {/* Institutional Vigilance Section */}
      <section className="section-padding bg-slate-50 border-y border-slate-200 overflow-hidden">
        <div className="container-custom max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Institutional Vigilance.
            </h3>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto italic">
              “ColabWize has transformed our department's audit workflow,
              reducing self-plagiarism risks by 94% through autonomous version
              reconciliation.”
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Journal Certification",
                desc: "Instantly generate integrity certificates to accompany manuscript submissions.",
                icon: CheckCircle2,
              },
              {
                title: "Historical Health",
                desc: "Longitudinal analysis of authorship signals across years of research drafts.",
                icon: LineChart,
              },
              {
                title: "Compliance Hub",
                desc: "Role-based access to comparison reports for laboratory directors and PIs.",
                icon: Lock,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-500 transition-colors duration-500 opacity-20 group-hover:opacity-10"></div>
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors duration-500">
                  <item.icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h5 className="text-xl font-bold text-slate-900 mb-4">
                  {item.title}
                </h5>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Engine Section */}
      <section className="section-padding bg-white relative">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Access the Live Engine
            </h2>
            <p className="text-slate-500 font-medium max-w-xl mx-auto">
              Test your drafts against our baseline algorithms. Experience the
              power of defensible authorship analysis firsthand.
            </p>
          </div>

          <div className="bg-white rounded-[3rem] shadow-3xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                ColabWize_Analysis_Console
              </div>
              <div className="w-10"></div>
            </div>

            <div className="p-8 md:p-12">
              {error && (
                <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="font-bold text-sm">{error}</span>
                </div>
              )}

              <DraftComparisonPanel
                onCompare={handleCompare}
                isComparing={isComparing}
              />

              {result && (
                <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 relative overflow-hidden">
                    {/* Analysis Badge */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-slate-200">
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">
                          Analysis Results
                        </h3>
                        <p className="text-slate-500 text-sm font-medium">
                          Diagnostic code: CW-
                          {(Math.random() * 10000).toFixed(0)}
                        </p>
                      </div>
                      <div
                        className={`px-6 py-3 rounded-2xl font-black text-xl flex flex-col items-center ${
                          result.similarityScore > 20
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                        <span className="text-[10px] uppercase tracking-tighter opacity-70">
                          Similarity Score
                        </span>
                        {result.similarityScore.toFixed(1)}%
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <BrainCircuit className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-bold text-slate-900 text-sm">
                          Semantic Interpretation
                        </h4>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed italic">
                        "{result.analysis}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">
                          Integrity Metrics
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-colors shadow-sm">
                            <span className="font-bold text-slate-600 text-sm">
                              Structural Overlap
                            </span>
                            <span className="font-black text-slate-900">
                              {result.overlapPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-colors shadow-sm">
                            <span className="font-bold text-slate-600 text-sm">
                              Self-Plagiarism Risk
                            </span>
                            <span
                              className={`font-black ${result.isSelfPlagiarismInternal ? "text-red-600" : "text-emerald-600"}`}>
                              {result.isSelfPlagiarismInternal
                                ? "CRITICAL"
                                : "MINIMAL"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">
                          Matched Segments
                        </h4>
                        <div className="max-h-56 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                          {result.matchedSegments.length > 0 ? (
                            result.matchedSegments.map((match, i) => (
                              <div
                                key={i}
                                className="p-4 border border-slate-200 bg-white rounded-2xl group hover:border-blue-400 transition-all shadow-sm">
                                <p className="text-slate-800 text-xs font-medium line-clamp-2 leading-relaxed italic">
                                  "{match.segment}"
                                </p>
                                <div className="mt-3 flex justify-between items-center text-[10px] font-black uppercase text-blue-600 tracking-tighter">
                                  <span>Signal Confidence</span>
                                  <span>
                                    {(match.similarity * 100).toFixed(0)}% Match
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400">
                              <ShieldCheck className="w-10 h-10 mb-4 opacity-20" />
                              <p className="text-xs font-bold text-center">
                                No high-similarity segments detected in this
                                audit.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Premium CTA */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="bg-blue-600 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-3xl shadow-blue-500/20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-8 tracking-tighter italic">
                Proof of Authorship. <br />
                Available Instantly.
              </h2>
              <p className="text-lg text-blue-100 mb-12 max-w-xl mx-auto font-medium">
                Protect your intellectual legacy with the industry’s most
                advanced version comparison and integrity suite.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-12 py-8 rounded-2xl text-lg shadow-xl"
                  asChild>
                  <RouterLink to="/signup">Deploy Integrity Engine</RouterLink>
                </Button>
                <Button
                  className="bg-transparent border-white/30 hover:bg-white/10 text-white font-bold px-12 py-8 rounded-2xl text-lg"
                  asChild>
                  <RouterLink to="/contact">Request Audit Demo</RouterLink>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
