
import React, { useState, useCallback, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { ArrowLeft, ShieldAlert, BadgeCheck, FileText, ChevronRight } from "lucide-react";
import { runCitationAudit } from "../../services/citationAudit/citationAuditEngine";
import { useToast } from "../../hooks/use-toast";
import { useCitationAuditStore } from "../../stores/useCitationAuditStore";
// import { useSubscriptionStore } from "../../stores/useSubscriptionStore";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface CitationAuditSidebarProps {
    projectId: string;
    editor: Editor | null;
    onClose: () => void;
    onFindPapers: (keywords: string[]) => void;
    initialResults?: any;
    citationStyle?: string | null;
}

export const CitationAuditSidebar: React.FC<CitationAuditSidebarProps> = ({
    editor,
    onClose,
    citationStyle
}) => {
    const navigate = useNavigate();
    const [localLoading, setLocalLoading] = useState(false);
    const { setAuditResult, setLoading, auditResult } = useCitationAuditStore();
    const selectedStyle = citationStyle || "APA";
    const { toast } = useToast();
    // const { plan, status: subStatus } = useSubscriptionStore(); // Unused variables removed for build

    // Helper: Map Rule IDs to Badge Codes and Colors for Highlighting
    const mapRuleToCodeAndColor = (ruleId: string): { code: string, color: string, label: string } => {
        const r = ruleId.toUpperCase();
        if (r.includes("VERIFICATION")) return { code: "VER", color: "red", label: "Source Verification" };
        if (r.includes("REF") || r.includes("MISMATCH") || r.includes("LIST")) return { code: "REF", color: "blue", label: "Reference Match" };
        if (r.includes("MIXED") || r.includes("CONSISTENCY")) return { code: "MIX", color: "amber", label: "Style Inconsistency" };
        return { code: "STY", color: "amber", label: "Style Rule" };
    };

    const handleRunStyleAudit = useCallback(async () => {
        if (!editor) return;

        try {
            setLocalLoading(true);
            setLoading(true);

            // Clear existing headers/highlights
            editor.commands.clearAllHighlights();

            // Run Audit
            const result = await runCitationAudit(editor.getJSON(), selectedStyle);

            // SAVE TO STORE (This powers the full report page)
            setAuditResult(result);

            if (result.state === "COMPLETED_SUCCESS" && result.violations.length > 0) {
                // Apply highlights
                result.violations.forEach((flag: any) => {
                    if (flag.anchor) {
                        const { code, color, label } = mapRuleToCodeAndColor(flag.ruleId);
                        const docSize = editor.state.doc.content.size;
                        const start = Math.max(0, Math.min(flag.anchor.start, docSize));
                        const end = Math.max(start, Math.min(flag.anchor.end, docSize));

                        if (start < end) {
                            editor.chain().highlightRange(start, end, {
                                type: label,
                                color: color,
                                message: flag.message,
                                ruleId: flag.ruleId,
                                expected: flag.expected,
                                badgeCode: code
                            }).run();
                        }
                    }
                });

                toast({
                    title: "⚠️ Citation issues detected",
                    description: "Review highlighted markers or view full report.",
                    variant: "default"
                });
            } else if (result.state === "COMPLETED_SUCCESS") {
                toast({
                    title: "✅ Citation audit completed",
                    description: "No issues found.",
                    variant: "default"
                });
            } else if (result.state === "FAILED_QUOTA_EXCEEDED" || result.state === "FAILED_SUBSCRIPTION_ERROR") {
                // UI handles this
            } else {
                toast({
                    title: "⚠️ Citation audit failed",
                    description: result.errorMessage || "Unknown error",
                    variant: "destructive"
                });
            }

            // Apply Verified Highlights
            if (result.verificationResults) {
                result.verificationResults.forEach((ver: any) => {
                    if (ver.existenceStatus === "CONFIRMED" && ver.inlineLocation) {
                        editor.chain().highlightRange(ver.inlineLocation.start, ver.inlineLocation.end, {
                            type: "Verified Citation",
                            color: "citation-blue",
                            message: `Verified: ${ver.title || 'Source confirmed'}`,
                            badgeCode: "VER"
                        }).run();
                    }
                });
            }

        } catch (error: any) {
            console.error("Audit failed", error);
            // Handle Limit Errors
            const isLimitError =
                error?.message?.includes("limit reached") ||
                error?.code === "PLAN_LIMIT_REACHED" ||
                error?.response?.data?.code === "PLAN_LIMIT_REACHED" ||
                error?.response?.data?.code === "INSUFFICIENT_CREDITS";

            if (isLimitError) {
                setAuditResult({
                    state: "FAILED_QUOTA_EXCEEDED",
                    violations: [],
                    errorMessage: error.message
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "⚠️ Citation audit could not be completed",
                    description: error.message
                });
            }
        } finally {
            setLocalLoading(false);
            setLoading(false);
        }
    }, [editor, selectedStyle, toast, setAuditResult, setLoading]);

    // Auto-run on mount if no result
    useEffect(() => {
        if (!auditResult && !localLoading) {
            handleRunStyleAudit();
        }
    }, [auditResult, localLoading, handleRunStyleAudit]);


    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="mr-1 p-1 hover:bg-gray-200 rounded text-gray-500">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-gray-700" />
                        Citation Audit
                    </h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Status Section */}
                {localLoading ? (
                    <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg animate-pulse">
                        <ShieldAlert className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        Running deep analysis...
                    </div>
                ) : auditResult ? (
                    <>
                        {/* 1. Limit Block */}
                        {(auditResult.state === "FAILED_QUOTA_EXCEEDED" || auditResult.state === "FAILED_SUBSCRIPTION_ERROR") ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-bold text-red-900 text-sm mb-1">Limit Reached</h4>
                                <p className="text-xs text-red-800 mb-4">
                                    You have run out of plan usage for auditing.
                                </p>
                                <Button size="sm" onClick={() => window.open("/pricing", "_blank")} className="w-full text-xs">
                                    Upgrade / Add Credits
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* 2. Pass/Fail Status */}
                                {auditResult.violations && auditResult.violations.length > 0 ? (
                                    <div className="text-amber-800 bg-amber-50 p-5 rounded-lg border border-amber-200 text-center">
                                        <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                                        <h3 className="font-bold text-lg">{auditResult.violations.length} Issues Found</h3>
                                        <p className="text-xs mt-1 opacity-80">Review highlighted markers in your document.</p>
                                    </div>
                                ) : (
                                    <div className="text-green-800 bg-green-50 p-5 rounded-lg border border-green-200 text-center">
                                        <BadgeCheck className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                        <h3 className="font-bold text-lg">All Checks Passed</h3>
                                        <p className="text-xs mt-1 opacity-80">Your citations strictly follow {selectedStyle}.</p>
                                    </div>
                                )}

                                {/* 3. Integrity Score Summary */}
                                {auditResult.integrityIndex && (
                                    <div className="bg-slate-900 rounded-lg p-4 text-white">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                            Citation Integrity Index
                                        </div>
                                        <div className="text-3xl font-black text-white">
                                            {auditResult.integrityIndex.totalScore}%
                                        </div>
                                        <div className={`text-[10px] font-bold mt-1 inline-block px-1.5 py-0.5 rounded ${auditResult.integrityIndex.confidence === "HIGH" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                                            {auditResult.integrityIndex.confidence} CONFIDENCE
                                        </div>
                                    </div>
                                )}

                                {/* 4. Full Report Call-to-Action */}
                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        onClick={() => navigate("/dashboard/citation-audit")}
                                        className="w-full justify-between group"
                                        variant="outline"
                                    >
                                        <span className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            View Full Report
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                    <p className="text-[10px] text-gray-400 text-center mt-2 px-4">
                                        Open the full report to see detailed breakdowns, verification links, and knowledge graphs.
                                    </p>
                                </div>
                            </>
                        )}

                        <div className="pt-2">
                            <button onClick={handleRunStyleAudit} className="w-full text-xs text-gray-500 hover:text-gray-900 underline py-2">
                                Rerun Audit
                            </button>
                        </div>
                    </>
                ) : null}

            </div>
        </div>
    );
};
