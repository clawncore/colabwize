/* eslint-disable */
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { ArrowLeft, FileText, RefreshCw, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { CitationService } from "../../services/citationService";
import { ConfigService } from "../../services/ConfigService";
import { supabase } from "../../lib/supabase/client";

interface CitationAuditSidebarProps {
  projectId: string;
  editor: Editor | null;
  onClose: () => void;
  onFindPapers?: (keywords: string[]) => void;
  initialResults?: any;
  citationStyle?: string | null;
  citationLibrary?: any[];
  onUpgrade?: () => void;
}

type AuditStatus = "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";
type IssueSeverity = "CRITICAL" | "MAJOR" | "MINOR" | "INFO";

const STAGE_LABELS: Record<string, string> = {
  INITIALIZING: "Initializing...",
  EXTRACTION: "Extracting Citations",
  CROSS_REFERENCE_MAPPING: "Mapping Cross-References",
  DUPLICATE_DETECTION: "Checking for Duplicates",
  URL_VALIDATION: "Validating Hyperlinks",
  STYLE_COMPLIANCE: "Checking Style Formatting",
  SCORE_GENERATION: "Calculating Score",
  DONE: "Complete",
};

const SEVERITY_CONFIG: Record<IssueSeverity, { label: string; color: string; bg: string; icon: React.FC<any> }> = {
  CRITICAL: { label: "Critical", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: XCircle },
  MAJOR: { label: "Major", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: AlertTriangle },
  MINOR: { label: "Minor", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", icon: AlertTriangle },
  INFO: { label: "Info", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: Info },
};

export const CitationAuditSidebar: React.FC<CitationAuditSidebarProps> = ({
  projectId,
  editor,
  onClose,
  citationStyle,
  onUpgrade,
}) => {
  const { toast } = useToast();

  // Async audit state
  const [auditStatus, setAuditStatus] = useState<AuditStatus>("IDLE");
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("INITIALIZING");
  const [auditReport, setAuditReport] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sseRef = useRef<EventSource | null>(null);

  // Cleanup SSE on unmount
  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  // ── Highlight helpers ──────────────────────────────────────────────────────
  const applyHighlights = useCallback((report: any) => {
    if (!editor || !report?.issues?.length) return;
    editor.commands.clearAllHighlights?.();

    const docSize = editor.state.doc.content.size;
    report.issues.forEach((issue: any) => {
      if (!issue.location?.startPos) return;
      const start = Math.max(0, Math.min(issue.location.startPos, docSize));
      const end = Math.max(start, Math.min(issue.location.endPos ?? start + 1, docSize));
      if (start >= end) return;

      const colorMap: Record<IssueSeverity, string> = {
        CRITICAL: "rgba(220, 38, 38, 0.22)",
        MAJOR: "rgba(234, 88, 12, 0.22)",
        MINOR: "rgba(250, 204, 21, 0.28)",
        INFO: "rgba(59, 130, 246, 0.18)",
      };
      const color = colorMap[issue.severity as IssueSeverity] ?? colorMap.INFO;

      editor.chain().highlightRange?.(start, end, {
        color,
        message: issue.message,
        ruleId: issue.type,
        expected: issue.suggestedFix,
      }).run();
    });
  }, [editor]);

  // ── Start the async backend audit ─────────────────────────────────────────
  const handleRunAudit = useCallback(async () => {
    if (!editor) return;

    // Close any old SSE stream
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    setAuditStatus("RUNNING");
    setProgress(0);
    setCurrentStage("INITIALIZING");
    setAuditReport(null);
    setErrorMessage(null);
    editor.commands.clearAllHighlights?.();

    try {
      // 1. Get the document's Prosemirror JSON
      const docState = editor.state.doc.toJSON();
      const documentId = (editor.state.doc as any).attrs?.id || projectId;

      // 2. POST to /api/audit/start → get auditId back immediately
      const auditId = await CitationService.startAudit(documentId, projectId, docState);

      // 3. Open SSE stream — token from Supabase session (EventSource doesn't support headers)
      const baseUrl = ConfigService.getApiUrl();
      const sessionResult = await supabase.auth.getSession();
      const token = sessionResult.data.session?.access_token ?? "";
      const sseUrl = `${baseUrl}/api/audit/progress/${auditId}`;

      const sse = new EventSource(`${sseUrl}?token=${encodeURIComponent(token)}`);
      sseRef.current = sse;

      sse.onmessage = (event) => {
        if (event.data === "connected") return;

        try {
          const payload = JSON.parse(event.data);

          if (payload.error) {
            setAuditStatus("FAILED");
            setErrorMessage(payload.error);
            sse.close();
            return;
          }

          setProgress(payload.progress ?? 0);
          setCurrentStage(payload.currentStage ?? "RUNNING");

          if (payload.status === "COMPLETED" && payload.report) {
            setAuditStatus("COMPLETED");
            setAuditReport(payload.report);
            applyHighlights(payload.report);
            sse.close();
          } else if (payload.status === "FAILED") {
            setAuditStatus("FAILED");
            setErrorMessage("The audit encountered an internal error.");
            sse.close();
          }
        } catch {
          // Ignore parse errors for transient SSE messages
        }
      };

      sse.onerror = () => {
        // Suppress error if we completed cleanly
        if (auditStatus === "COMPLETED") return;
        setAuditStatus("FAILED");
        setErrorMessage("Lost connection to audit server. Please retry.");
        sse.close();
      };

    } catch (err: any) {
      setAuditStatus("FAILED");
      setErrorMessage(err.message || "Failed to start audit.");
      toast({ title: "Audit Failed", description: err.message, variant: "destructive" });
    }
  }, [editor, projectId, applyHighlights, toast, setAuditStatus]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const criticalCount = auditReport?.issues?.filter((i: any) => i.severity === "CRITICAL").length ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const majorCount = auditReport?.issues?.filter((i: any) => i.severity === "MAJOR").length ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const minorCount = auditReport?.issues?.filter((i: any) => i.severity === "MINOR").length ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const infoCount = auditReport?.issues?.filter((i: any) => i.severity === "INFO").length ?? 0;
  const score = auditReport?.summary?.complianceScore ?? null;
  const isExportBlocked = criticalCount > 0;

  // ── Stage label ────────────────────────────────────────────────────────────
  const stageLabel = STAGE_LABELS[currentStage] ?? currentStage;

  // ── Score color ────────────────────────────────────────────────────────────
  const scoreColor = score === null ? "text-slate-400"
    : score >= 85 ? "text-emerald-600"
      : score >= 65 ? "text-orange-500"
        : "text-red-600";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#f8fafc] border-r border-[#e5e7eb]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb] bg-white">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-1 hover:bg-[#f1f5f9] rounded text-[#6b7280]">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-semibold text-[#111827]">Citation Audit</h2>
        </div>
        {auditStatus === "COMPLETED" || auditStatus === "FAILED" ? (
          <button
            onClick={handleRunAudit}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"
            title="Re-run Audit"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── IDLE STATE ── */}
        {auditStatus === "IDLE" && (
          <div className="text-center py-12 px-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <FileText className="w-8 h-8 text-blue-400 opacity-60" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Ready to Audit</h3>
            <p className="text-sm text-gray-500 mb-8">
              Click below to run a full citation integrity audit on your document.
            </p>
            <button
              onClick={handleRunAudit}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              Run Citation Audit
            </button>
          </div>
        )}

        {/* ── RUNNING STATE ── */}
        {auditStatus === "RUNNING" && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 mb-1">Auditing…</p>
              <p className="text-xs text-slate-400">{stageLabel}</p>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-xs text-slate-500 font-medium">{progress}%</p>
          </div>
        )}

        {/* ── FAILED STATE ── */}
        {auditStatus === "FAILED" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-red-800 mb-1">Audit Failed</h3>
            <p className="text-xs text-red-600 mb-3">{errorMessage || "An unexpected error occurred."}</p>
            <button
              onClick={handleRunAudit}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── COMPLETED STATE ── */}
        {auditStatus === "COMPLETED" && auditReport && (
          <div className="space-y-4">

            {/* Score Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                  Compliance Score
                </p>
                <span className={`text-4xl font-black ${scoreColor}`}>{score}</span>
                <span className="text-slate-400 text-lg font-semibold">/100</span>
              </div>
              <div className="text-right">
                {isExportBlocked ? (
                  <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                    <XCircle className="w-3 h-3" /> Export Blocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Ready to Export
                  </span>
                )}
              </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "In-Text Citations", value: auditReport.summary.totalInTextCitations },
                { label: "Bibliography Entries", value: auditReport.summary.uniqueBibliographyEntries },
                { label: "Broken Citations", value: auditReport.summary.brokenCitations, danger: auditReport.summary.brokenCitations > 0 },
                { label: "Uncited References", value: auditReport.summary.uncitedReferences },
                { label: "Duplicate Entries", value: auditReport.summary.duplicatesDetected, danger: auditReport.summary.duplicatesDetected > 0 },
                { label: "Invalid / HTTP URLs", value: auditReport.summary.invalidUrls, danger: auditReport.summary.invalidUrls > 0 },
              ].map(({ label, value, danger }) => (
                <div key={label} className={`bg-white border rounded-lg p-3 ${danger ? "border-red-200" : "border-slate-200"}`}>
                  <p className={`text-xl font-black ${danger ? "text-red-600" : "text-slate-800"}`}>{value}</p>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Issues List */}
            {auditReport.issues && auditReport.issues.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Issues</h4>
                {(["CRITICAL", "MAJOR", "MINOR", "INFO"] as IssueSeverity[]).map(sev => {
                  const sevIssues = auditReport.issues.filter((i: any) => i.severity === sev);
                  if (!sevIssues.length) return null;
                  const cfg = SEVERITY_CONFIG[sev];
                  const Icon = cfg.icon;
                  return (
                    <div key={sev}>
                      <p className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${cfg.color}`}>
                        {cfg.label} ({sevIssues.length})
                      </p>
                      <div className="space-y-1.5">
                        {sevIssues.map((issue: any) => (
                          <div key={issue.id} className={`flex gap-2 p-2.5 rounded-lg border text-xs ${cfg.bg}`}>
                            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold ${cfg.color} truncate`}>{issue.type.replace(/_/g, " ")}</p>
                              <p className="text-slate-600 mt-0.5 leading-snug">{issue.message}</p>
                              {issue.suggestedFix && (
                                <p className="mt-1.5 text-slate-500 italic leading-snug">
                                  💡 {issue.suggestedFix}
                                </p>
                              )}
                              {issue.autoFixAvailable && (
                                <span className="mt-1.5 inline-block text-[10px] bg-white border border-emerald-200 text-emerald-700 font-semibold px-1.5 py-0.5 rounded-full">
                                  Auto-fixable
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                No issues found. Citations look good!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
