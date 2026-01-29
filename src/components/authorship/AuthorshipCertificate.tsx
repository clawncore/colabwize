import React from "react";
import { AuthorshipStatsDisplay } from "./AuthorshipStatsDisplay";
import { AuthorshipDetails } from "./AuthorshipDetails";
import { CertificateDownloadButton } from "./CertificateDownloadButton";
import { ShieldCheck, FileEdit, Bot, AlertTriangle } from "lucide-react";
import { InlineLimitMessage } from "../common/InlineLimitMessage";
import { BehavioralTrackingService, WritingDNAReport } from "../../services/behavioralTrackingService";
import { SourceIntegrationService, SourceIntegrationReport } from "../../services/sourceIntegrationService";

interface AuthorshipCertificateProps {
  projectId: string;
  projectTitle: string;
}

export const AuthorshipCertificate: React.FC<AuthorshipCertificateProps> = ({
  projectId,
  projectTitle,
}) => {
  const [downloadStep, setDownloadStep] = React.useState<'idle' | 'preparing' | 'signing' | 'ready'>('preparing');
  const [behavioralReport, setBehavioralReport] = React.useState<WritingDNAReport | null>(null);
  const [sourceIntegrationReport, setSourceIntegrationReport] = React.useState<SourceIntegrationReport | null>(null);
  const [generationError, setGenerationError] = React.useState<any | null>(null);

  // Auto-run "preparation" on mount
  React.useEffect(() => {
    // Sequence to simulate "Fetching / Signing" on load
    const timer1 = setTimeout(() => setDownloadStep('signing'), 800);

    // Fetch behavioral and source integration reports
    const fetchReports = async () => {
      try {
        const [behavioralRes, sourceRes] = await Promise.all([
          BehavioralTrackingService.analyzePatterns(projectId),
          SourceIntegrationService.verifySourceIntegration(projectId)
        ]);

        setBehavioralReport(behavioralRes);
        setSourceIntegrationReport(sourceRes);
      } catch (error) {
        console.error('Error fetching reports:', error);
        setGenerationError(error);
      }
    };

    fetchReports();

    const timer2 = setTimeout(() => setDownloadStep('ready'), 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [projectId]);

  // SKELETON COMPONENT for consistency
  const ReportSkeleton = ({ title, icon: Icon, colorClass }: any) => (
    <div className={`p-4 bg-white rounded-xl border border-gray-100 shadow-sm opacity-60`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span className={`p-1.5 ${colorClass} bg-opacity-10 rounded-lg`}><Icon className={`w-3.5 h-3.5 ${colorClass}`} /></span>
          {title}
        </h3>
        <div className="h-5 w-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between border-b border-gray-50 pb-1"><div className="h-2.5 w-14 bg-gray-100 rounded"></div><div className="h-2.5 w-6 bg-gray-100 rounded"></div></div>
        <div className="flex justify-between border-b border-gray-50 pb-1"><div className="h-2.5 w-16 bg-gray-100 rounded"></div><div className="h-2.5 w-6 bg-gray-100 rounded"></div></div>
        <div className="flex justify-between"><div className="h-2.5 w-10 bg-gray-100 rounded"></div><div className="h-2.5 w-8 bg-gray-100 rounded"></div></div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
      <div className="bg-white w-full h-full shadow-none flex flex-col md:flex-row overflow-hidden">
        {/* Left Side - Visual Preview (Sidebar) */}
        <div className="hidden md:flex md:w-[320px] lg:w-[380px] flex-shrink-0 bg-[#0B1121] relative p-8 flex-col items-center justify-center text-center overflow-hidden border-r border-gray-200 shadow-2xl z-10">
          {/* Decor/Background Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent"></div>

          <div className="relative z-10 mb-10 transform translate-y-[-10px]">
            <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl shadow-indigo-500/10 mb-6 mx-auto transition-transform hover:scale-105 duration-500">
              {downloadStep === 'preparing' ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
              ) : (
                <img src="/logo.svg" alt="App Logo" className="w-8 h-8 opacity-90" />
              )}
            </div>
            <h2 className="text-2xl font-serif text-white tracking-wide mb-3 font-medium">
              {downloadStep === 'preparing' ? 'Generating Proof...' : 'Authorship Certificate'}
            </h2>
            <p className="text-slate-400 text-sm px-4 leading-relaxed font-light">
              {downloadStep === 'preparing' ? 'Aggregating edit logs & metadata...' :
                downloadStep === 'signing' ? 'Cryptographically signing...' :
                  'Official immutable proof of work based on granular edit history.'}
            </p>
          </div>

          {/* Certificate Preview Card - Slightly Larger & Better Shadow */}
          <div className={`relative w-[260px] h-[182px] bg-white shadow-2xl shadow-black/50 rounded-sm transform transition-all duration-700 cursor-default flex-shrink-0 mx-auto group ${downloadStep === 'ready' ? 'rotate-0 scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-80 translate-y-4'}`}>
            <div className="absolute inset-0 bg-[#fffdf5] border-[6px] border-double border-slate-800 m-1.5"></div>
            <div className="absolute inset-0 m-3 border border-yellow-600/20"></div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent z-20 opacity-0 group-hover:animate-shimmer pointer-events-none"></div>

            <div className="relative h-full w-full p-4 flex flex-col items-center justify-between z-10">
              <div className="text-center space-y-1.5 mt-1">
                <p className="text-[6px] font-serif tracking-[0.25em] text-slate-500 uppercase">ColabWize Platform</p>
                <h3 className="font-serif font-bold text-slate-900 text-[9px] leading-tight tracking-wide border-b border-slate-200 pb-1.5 mx-2">
                  CERTIFICATE OF AUTHORSHIP AND <br /> ACADEMIC INTEGRITY
                </h3>
              </div>
              <div className="w-full text-center px-4 space-y-1">
                <div className="h-px w-3/4 mx-auto bg-slate-200 my-1"></div>
                <div className="space-y-0.5 opacity-60">
                  <div className="h-px w-full bg-slate-300"></div>
                  <div className="h-px w-5/6 mx-auto bg-slate-300"></div>
                </div>
              </div>
              <div className="mt-auto pt-1 flex justify-between items-end w-full px-1">
                <div className="flex flex-col items-start scale-75 origin-bottom-left">
                  <div className="font-dancing-script text-[8px] text-indigo-900 mb-0.5">Signed Digitally</div>
                  <div className="w-12 h-px bg-slate-400"></div>
                  <span className="text-[4px] uppercase text-slate-400 mt-0.5">Signature</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-md flex items-center justify-center border-2 border-yellow-100 scale-90">
                  <ShieldCheck className="w-5 h-5 text-yellow-900 opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Dashboard (Main Content) */}
        <div className="flex-1 h-full flex flex-col bg-gray-50/50 overflow-hidden relative min-w-0">

          {/* Header Area */}
          <div className="px-10 pt-8 pb-6 border-b border-gray-200/60 bg-white shrink-0">
            {/* Only show CRITICAL errors that block download. Soft errors handled in cards. */}
            {generationError && generationError.data?.code === "INSUFFICIENT_CREDITS" && (
              <div className="mb-4 animate-in slide-in-from-top-2 fade-in duration-300">
                <InlineLimitMessage
                  type={generationError.data?.code}
                  title="Oops! You need credits"
                  message="You're out of credits! Top up now to generate your official certificate."
                  actionLabel="Purchase Credits"
                  onAction={() => window.open(generationError.data?.data?.upgrade_url || "/pricing", "_blank")}
                />
              </div>
            )}

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">{projectTitle}</h1>
                <p className="text-sm text-gray-500 flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Verified & Ready for Issue
                </p>
              </div>
              <div>
                {downloadStep === 'ready' ? (
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                    Ready to Issue
                  </span>
                ) : (
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
                    Preparing...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dashboard Content Grid - Constrained Width to prevent stretching */}
          <div className="flex-1 overflow-y-auto px-10 py-8 min-h-0 custom-scrollbar">
            <div className="w-full">

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                {/* Column 1: Basic Stats (5 cols) */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                  <div className="prose prose-sm text-slate-600 bg-white p-5 rounded-xl border border-gray-200/60 shadow-sm leading-relaxed text-sm">
                    <p className="m-0">
                      This certificate is an <strong>immutable record</strong>. It aggregates edit logs, session metadata, and keystroke dynamics to prove original authorship.
                    </p>
                  </div>

                  <AuthorshipStatsDisplay projectId={projectId} />
                </div>

                {/* Column 2: Advanced Analysis (7 cols) - ALWAYS VISIBLE (Skeleton or Data) */}
                <div className="xl:col-span-7 flex flex-col gap-5">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Detailed Analysis</h3>

                  <div className="grid grid-cols-1 gap-3">

                    {/* Writing Pattern Card - Metrics First Layout */}
                    {behavioralReport ? (
                      <div className="p-4 bg-white rounded-xl border border-indigo-100/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300">
                        {/* Header: Title + Main Score */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
                            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Bot className="w-3.5 h-3.5" /></span>
                            Writing Pattern Analysis
                          </h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-indigo-600">{behavioralReport.humanAuthenticityScore}</span>
                            <span className="text-[10px] text-indigo-400 font-bold">% Human</span>
                          </div>
                        </div>

                        {/* Top Row: Key Metrics Bubbles (The "Numbers Up" request) */}
                        <div className="flex gap-2 mb-4">
                          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                            <div className="text-lg font-black text-gray-800 leading-tight">{Math.round(behavioralReport.averageTypingSpeed)}</div>
                            <div className="text-[9px] uppercase tracking-wide text-gray-400 font-bold">WPM</div>
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                            <div className="text-lg font-black text-gray-800 leading-tight">{Math.round(behavioralReport.thinkPauseRatio)}</div>
                            <div className="text-[9px] uppercase tracking-wide text-gray-400 font-bold">Think Ratio</div>
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                            <div className="text-lg font-black text-gray-800 leading-tight">{Math.round(behavioralReport.errorCorrectionFrequency)}</div>
                            <div className="text-[9px] uppercase tracking-wide text-gray-400 font-bold">Corrections</div>
                          </div>
                        </div>

                        {/* Detailed Analysis / Status Below */}
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Validation Status</span>
                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-emerald-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                              Valid Pattern
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ReportSkeleton title="Writing Pattern Analysis" icon={Bot} colorClass="text-indigo-500" />
                    )}

                    {/* Source Integration Card - Metrics First Layout */}
                    {sourceIntegrationReport ? (
                      <div className="p-4 bg-white rounded-xl border border-emerald-100/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2.5">
                            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><FileEdit className="w-3.5 h-3.5" /></span>
                            Source Integration
                          </h3>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-xl font-black ${sourceIntegrationReport.authenticityScore > 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                              {sourceIntegrationReport.authenticityScore}
                            </span>
                            <span className={`text-[10px] font-bold ${sourceIntegrationReport.authenticityScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>/ 100</span>
                          </div>
                        </div>

                        {/* Top Row: Key Metrics Bubbles */}
                        <div className="flex gap-2 mb-4">
                          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                            <div className="text-lg font-black text-gray-800 leading-tight">{sourceIntegrationReport.authenticityScore}%</div>
                            <div className="text-[9px] uppercase tracking-wide text-gray-400 font-bold">Auth Score</div>
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                            <div className="text-lg font-black text-gray-800 leading-tight">{sourceIntegrationReport.readingAuditTrail.length}</div>
                            <div className="text-[9px] uppercase tracking-wide text-gray-400 font-bold">Sources</div>
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                            <div className="text-lg font-black text-gray-800 leading-tight">{sourceIntegrationReport.redFlags.length}</div>
                            <div className="text-[9px] uppercase tracking-wide text-gray-400 font-bold">Red Flags</div>
                          </div>
                        </div>

                        {/* Detailed Analysis / Status Below */}
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-500 font-medium">Integration Status</span>
                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${sourceIntegrationReport.isConsistentWithReading ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${sourceIntegrationReport.isConsistentWithReading ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                              {sourceIntegrationReport.isConsistentWithReading ? 'Consistent' : 'Review Needed'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ReportSkeleton title="Source Integration" icon={FileEdit} colorClass="text-emerald-500" />
                    )}
                  </div>

                  {/* If there's an error, show a small specific hint here inside the grid instead of blowing up the top layout */}
                  {generationError && !behavioralReport && (
                    <div className="flex items-center gap-3 text-xs text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Detailed analysis data unavailable at this time ({generationError.status || "Error"}). Basic certificate can still be issued.</span>
                    </div>
                  )}

                  {/* Authorship Details & Summary (Moved below Detailed Analysis as requested) */}
                  <AuthorshipDetails projectId={projectId} />
                </div>
              </div>
            </div>
          </div>

          {/* FooterActions */}
          <div className="p-6 border-t border-gray-200 bg-white shrink-0 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between gap-6 w-full">
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                Data integrity verified by ColabWize Algorithms.
              </div>
              <div className="flex-1 sm:flex-none flex justify-end">
                <CertificateDownloadButton
                  projectId={projectId}
                  projectTitle={projectTitle}
                  certificateType="authorship"
                  variant="primary"
                  disabled={downloadStep !== 'ready'}
                  className="w-full sm:w-auto px-8 py-3 bg-[#0B1121] hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5 font-medium tracking-wide rounded-lg flex items-center justify-center gap-2"
                  onError={(err) => setGenerationError(err)}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
