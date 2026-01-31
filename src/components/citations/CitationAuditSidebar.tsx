
import React, { useState, useCallback, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { ArrowLeft, ShieldAlert, BadgeCheck, FileText, ChevronRight, Clock } from "lucide-react";
import { runCitationAudit } from "../../services/citationAudit/citationAuditEngine";
import { useToast } from "../../hooks/use-toast";
import { useCitationAuditStore } from "../../stores/useCitationAuditStore";
// import { useSubscriptionStore } from "../../stores/useSubscriptionStore";
import { Button } from "../ui/button";
import { CitationService } from "../../services/citationService";

import { CitationAuditModal } from "./CitationAuditModal";

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

    const [localLoading, setLocalLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { setAuditResult, setLoading, auditResult } = useCitationAuditStore();
    const selectedStyle = citationStyle || "APA";
    const { toast } = useToast();

    // UARS: Universal Highlight Tokens
    const getHighlightColor = (ruleId: string): string => {
        const r = ruleId.toUpperCase();
        if (r.includes("VERIFICATION") || r.includes("REF") || r.includes("MISMATCH")) {
            return "rgba(220, 38, 38, 0.15)"; // High Risk (Red Tint)
        }
        if (r.includes("MIXED") || r.includes("CONSISTENCY") || r.includes("STYLE")) {
            return "rgba(245, 158, 11, 0.18)"; // Medium Risk (Amber Tint)
        }
        return "rgba(250, 204, 21, 0.2)"; // Low/Info (Yellow Tint)
    };

    const handleRunStyleAudit = useCallback(async () => {
        if (!editor) return;

        try {
            setLocalLoading(true);
            setLoading(true);
            editor.commands.clearAllHighlights();

            const result = await runCitationAudit(editor.getJSON(), selectedStyle);
            setAuditResult(result);

            if (result.state === "COMPLETED_SUCCESS" && result.violations.length > 0) {
                // Apply UARS Highlights
                result.violations.forEach((flag: any) => {
                    if (flag.anchor) {
                        const color = getHighlightColor(flag.ruleId);
                        const docSize = editor.state.doc.content.size;
                        const start = Math.max(0, Math.min(flag.anchor.start, docSize));
                        const end = Math.max(start, Math.min(flag.anchor.end, docSize));

                        if (start < end) {
                            editor.chain().highlightRange(start, end, {
                                color: color, // Tiptap will apply this as background-color
                                message: flag.message,
                                ruleId: flag.ruleId,
                                expected: flag.expected
                            }).run();
                        }
                    }
                });

                toast({
                    title: "Audit Complete",
                    description: "Issues flagged for review.",
                    variant: "default"
                });
            } else if (result.state === "COMPLETED_SUCCESS") {
                toast({ title: "Audit Complete", description: "No issues found.", variant: "default" });
            }

            // Verified Citations - Green Tint
            if (result.verificationResults) {
                result.verificationResults.forEach((ver: any) => {
                    if (ver.existenceStatus === "CONFIRMED" && ver.inlineLocation) {
                        editor.chain().highlightRange(ver.inlineLocation.start, ver.inlineLocation.end, {
                            color: "rgba(22, 163, 74, 0.15)", // Success Green Tint
                            message: `Verified: ${ver.title || 'Source confirmed'}`
                        }).run();
                    }
                });
            }

        } catch (error: any) {
            console.error("Audit failed", error);
            setAuditResult({ state: "FAILED_QUOTA_EXCEEDED", violations: [], errorMessage: error.message });
        } finally {
            setLocalLoading(false);
            setLoading(false);
        }
    }, [editor, selectedStyle, toast, setAuditResult, setLoading]);

    useEffect(() => {
        if (!auditResult && !localLoading) handleRunStyleAudit();
    }, [auditResult, localLoading, handleRunStyleAudit]);


    const handleAddSource = async (source: any) => {
        if (!editor) return;
        try {
            const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const collectionName = `Audit Findings ${timeString}`; // "Audit Findings 10:45 PM"

            await CitationService.addCitation(editor.getAttributes('document')?.projectId || "default", {
                title: source.title,
                authors: source.author ? [source.author] : (source.authors || []),
                year: source.year || new Date().getFullYear(),
                doi: source.doi,
                url: source.url,
                source: source.source,
                type: source.type || "journal-article",
                abstract: source.abstract,
                tags: [collectionName, "audit-result"]
            });

            // Optional: trigger a refresh of sources list if we had access to it, 
            // but the toast in VerificationResultsPanel gives feedback.
        } catch (error) {
            console.error(error);
            throw error; // Let child component handle/toast error
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] border-r border-[#e5e7eb]">
            {/* Header: Minimal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb] bg-white">
                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="p-1 hover:bg-[#f1f5f9] rounded text-[#6b7280]">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-sm font-semibold text-[#111827]">Citation Audit</h2>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {localLoading ? (
                    <div className="text-center py-8 text-[#6b7280] text-sm animate-pulse">
                        Analyzing citations...
                    </div>
                ) : auditResult ? (
                    <>
                        {/* Sidebar = Counts Only (No Graphs, No Explanations) */}
                        <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm p-4">
                            <h3 className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-3">
                                Findings Overview
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#111827]">High Risk</span>
                                    <span className="font-semibold text-[#dc2626]">
                                        {auditResult.violations.filter((v: any) => v.ruleId?.includes("REF") || v.ruleId?.includes("VERIFICATION")).length +
                                            (auditResult.verificationResults?.filter((v: any) => v.existenceStatus === "NOT_FOUND").length || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#111827]">Formatting</span>
                                    <span className="font-semibold text-[#f59e0b]">
                                        {auditResult.violations.filter((v: any) => !v.ruleId?.includes("REF") && !v.ruleId?.includes("VERIFICATION")).length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#111827]">Verified</span>
                                    <span className="font-semibold text-[#16a34a]">
                                        {auditResult.verificationResults?.filter((v: any) => v.existenceStatus === "CONFIRMED").length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Metadata Anchor */}
                        <div className="flex items-center justify-center gap-2 text-[10px] text-[#6b7280] uppercase tracking-wide font-medium bg-[#f1f5f9] py-1.5 rounded border border-[#e5e7eb]">
                            <Clock className="w-3 h-3" />
                            <span>Last scanned: {new Date().toLocaleDateString()}</span>
                            <span>·</span>
                            <span>Mode: Audit</span>
                        </div>

                        {/* Stronger Action Button */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full py-2.5 px-3 bg-white hover:bg-[#f8fafc] border-2 border-[#cbd5e1] hover:border-[#94a3b8] rounded-lg text-sm font-semibold text-[#334155] hover:text-[#0f172a] shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                            <FileText className="w-4 h-4" />
                            Open Full Report
                        </button>

                        <div className="text-center pt-2">
                            <button onClick={handleRunStyleAudit} className="text-xs text-[#6b7280] hover:text-[#111827] underline">
                                Rerun Analysis
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <button onClick={handleRunStyleAudit} className="text-sm font-medium text-[#4f46e5]">
                            Start Analysis
                        </button>
                    </div>
                )}

                <CitationAuditModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    editor={editor}
                    onAddSource={handleAddSource}
                />
            </div>
        </div>
    );
};
