
import React, { useState, useCallback, useEffect } from "react";
import { Editor } from "@tiptap/react";
import { ArrowLeft, FileText, Clock } from "lucide-react";
import { runCitationAudit } from "../../services/citationAudit/citationAuditEngine";
import { useToast } from "../../hooks/use-toast";
import { useCitationAuditStore } from "../../stores/useCitationAuditStore";
// import { useSubscriptionStore } from "../../stores/useSubscriptionStore";
import { CitationService } from "../../services/citationService";

import { CitationAuditModal } from "./CitationAuditModal";

interface CitationAuditSidebarProps {
    projectId: string;
    editor: Editor | null;
    onClose: () => void;
    onFindPapers: (keywords: string[]) => void;
    initialResults?: any;
    citationStyle?: string | null;
    citationLibrary?: any[];
}

export const CitationAuditSidebar: React.FC<CitationAuditSidebarProps> = ({
    projectId,
    editor,
    onClose,
    initialResults,
    citationStyle,
    citationLibrary
}) => {

    const [localLoading, setLocalLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { setAuditResult, setLoading, auditResult, reset } = useCitationAuditStore();
    const selectedStyle = citationStyle || "APA";
    const { toast } = useToast();

    // UARS: Universal Highlight Tokens
    const getHighlightColor = (ruleId: string): string => {
        const r = ruleId.toUpperCase();
        if (r.includes("VERIFICATION") || r.includes("REF") || r.includes("MISMATCH") || r.includes("UNMATCHED") || r.includes("ORPHAN")) {
            return "rgba(220, 38, 38, 0.25)"; // High Risk (Red Tint) - Increased from 0.15
        }
        if (r.includes("MIXED") || r.includes("CONSISTENCY") || r.includes("STYLE") || r.includes("INLINE")) {
            return "rgba(245, 158, 11, 0.28)"; // Medium Risk (Amber Tint) - Increased from 0.18
        }
        return "rgba(250, 204, 21, 0.3)"; // Low/Info (Yellow Tint) - Increased from 0.2
    };

    const handleRunStyleAudit = useCallback(async () => {
        if (!editor) return;

        try {
            // Clear any cached results to ensure fresh data
            reset();
            setLocalLoading(true);
            setLoading(true);
            editor.commands.clearAllHighlights();

            const result = await runCitationAudit(
                editor.getJSON(),
                selectedStyle,
                citationLibrary
            );
            setAuditResult(result);

            if (result.state === "COMPLETED_SUCCESS" && result.violations.length > 0) {
                // Apply UARS Highlights
                console.log(`🎨 Applying ${result.violations.length} citation highlights to editor`);
                let highlightsApplied = 0;

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
                            highlightsApplied++;
                        }
                    }
                });

                console.log(`✅ Applied ${highlightsApplied} highlights successfully`);

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
    }, [editor, selectedStyle, toast, setAuditResult, setLoading, reset]);

    // Clear cache and re-run when citation library changes
    useEffect(() => {
        if (citationLibrary && auditResult) {
            console.log("📚 Citation library changed - clearing audit cache for fresh results");
            reset();
        }
    }, [citationLibrary, reset]);

    // Auto-run audit when sidebar opens (triggered by green button)
    useEffect(() => {
        if (!auditResult && !localLoading) {
            handleRunStyleAudit();
        }
    }, [auditResult, localLoading, handleRunStyleAudit]);

    // Handle Clicks on Highlights
    useEffect(() => {
        if (!editor || !auditResult) return;

        const handleEditorClick = (e: any) => {
            // Tiptap specific pos retrieval
            // We use the editor instance to find the mark at the selection
            const { state, view } = editor;
            const pos = view.posAtCoords({ left: e.clientX, top: e.clientY });

            if (pos && pos.pos) {
                const node = state.doc.nodeAt(pos.pos);
                // Check for marks at this position
                // Note: nodeAt returns the node *after* the pos usually.
                // We better check attributes at resolved pos.
                const $pos = state.doc.resolve(pos.pos);
                const marks = $pos.marks();

                const highlightMark = marks.find(m => m.type.name === 'citation-highlight');
                if (highlightMark) {
                    const attrs = highlightMark.attrs;

                    // Show details toast or navigate
                    // User Request: "linked to reference or external url"

                    // 1. If we have coordinates, we can try to find the matching Verification Result
                    // BUT attrs has limited data (message, ruleId).

                    // We can match by ruleId or message
                    // OR we can perform a quick lookup in auditResult results.

                    const verResult = auditResult.verificationResults?.find((v: any) => {
                        // Fuzzy match message or check range if we had it in attributes
                        return v.message === attrs.message || (v.inlineLocation && v.inlineLocation.text === attrs.text);
                    });

                    // Construct Actionable Toast
                    let description = attrs.message;
                    let action = undefined;

                    if (verResult && verResult.foundPaper?.url) {
                        description = `Source: ${verResult.foundPaper.title}`;
                        action = <a href={verResult.foundPaper.url} target="_blank" rel="noopener noreferrer" className="font-bold underline ml-2">Open Link</a>;
                    }

                    toast({
                        title: attrs.ruleId || "Citation Info",
                        description: <div className="flex flex-col">{description} {action}</div>,
                        duration: 5000,
                    });
                }
            }
        };

        // Attach listener to the editor's DOM element
        // Note: Tiptap doesn't expose a clean 'onClick' event on the editor object directly in this context without extension.
        // But we can attach to the view's dom if accessible, or just the parent if we are careful.
        // Actually, DocumentEditor passes `editor` instance. `editor.view.dom` is accessible.

        editor.view.dom.addEventListener('click', handleEditorClick);

        return () => {
            editor.view.dom.removeEventListener('click', handleEditorClick);
        };
    }, [editor, auditResult, toast]);


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
                        {/* Improved Tier-Aware Findings Overview */}
                        <div className="space-y-3">
                            {/* Tier 1: Structural (Always Runs) */}
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-1 h-full bg-slate-300"></div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-tight">Tier 1: Formatting & Structure</h4>
                                    <span className="text-[10px] text-slate-400 font-mono">UNIVERSAL</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase">Total</span>
                                        <span className="font-medium text-slate-900">{auditResult.tierMetadata?.STRUCTURAL?.stats?.totalCitations || 0} Citations</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase">Matched</span>
                                        <span className="font-medium text-slate-900">{auditResult.tierMetadata?.STRUCTURAL?.stats?.matched || 0} Linked</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase">Issues</span>
                                        {/* Sum of formatting + orphans */}
                                        <span className="font-medium text-amber-600">
                                            {(auditResult.violations?.filter((v: any) => !v.ruleId?.includes("VERIFICATION")).length || 0)} Flags
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tier 2: Claim Verification (Conditional) */}
                            <div className={`bg-white p-3 rounded-lg border ${auditResult.tierMetadata?.CLAIM?.executed ? 'border-indigo-100 shadow-sm' : 'border-slate-100 bg-slate-50/50'} relative overflow-hidden`}>
                                <div className={`absolute top-0 right-0 w-1 h-full ${auditResult.tierMetadata?.CLAIM?.executed ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className={`text-xs font-bold uppercase tracking-tight ${auditResult.tierMetadata?.CLAIM?.executed ? 'text-indigo-900' : 'text-slate-400'}`}>Tier 2: Claim Verification</h4>
                                    {auditResult.tierMetadata?.CLAIM?.executed ? (
                                        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-medium">ACTIVE</span>
                                    ) : (
                                        <span className="text-[10px] text-slate-400">SKIPPED</span>
                                    )}
                                </div>

                                {auditResult.tierMetadata?.CLAIM?.executed ? (
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-indigo-400 uppercase">Claims Audited</span>
                                            <span className="font-bold text-indigo-700 text-lg">{auditResult.tierMetadata?.CLAIM?.stats?.candidates || 0}</span>
                                            <span className="text-[9px] text-slate-400 leading-tight">factual claims detected</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-indigo-400 uppercase">Verification Rate</span>
                                            <div className="flex items-baseline gap-1">
                                                <span className="font-bold text-indigo-700 text-lg">{auditResult.tierMetadata?.CLAIM?.stats?.verified || 0}</span>
                                                <span className="text-[10px] text-slate-500">/ {auditResult.tierMetadata?.CLAIM?.stats?.candidates || 0}</span>
                                            </div>
                                            <span className="text-[9px] text-slate-400 leading-tight">sources confirmed</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 italic">No factual claims detected in cited sentences.</p>
                                )}
                            </div>

                            {/* Tier 3: Risk Analysis (Conditional) */}
                            <div className={`bg-white p-3 rounded-lg border ${auditResult.tierMetadata?.RISK?.executed ? 'border-red-100 shadow-sm' : 'border-slate-100 bg-slate-50/50'} relative overflow-hidden`}>
                                <div className={`absolute top-0 right-0 w-1 h-full ${auditResult.tierMetadata?.RISK?.executed ? 'bg-red-500' : 'bg-slate-200'}`}></div>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className={`text-xs font-bold uppercase tracking-tight ${auditResult.tierMetadata?.RISK?.executed ? 'text-red-900' : 'text-slate-400'}`}>Tier 3: Risk Assessment</h4>
                                    {auditResult.tierMetadata?.RISK?.executed ? (
                                        <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium">ACTIVE</span>
                                    ) : (
                                        <span className="text-[10px] text-slate-400">SKIPPED</span>
                                    )}
                                </div>
                                {auditResult.tierMetadata?.RISK?.executed ? (
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-bold text-red-600">{auditResult.tierMetadata?.RISK?.stats?.risksFound || 0}</span>
                                        <span className="text-slate-600">Risk signals detected</span>
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 italic">No high-risk domains or topics detected.</p>
                                )}
                            </div>
                        </div>

                        {initialResults?.suggestions && initialResults.suggestions.length > 0 && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
                                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-tight">Missing Citations</h4>
                                <div className="space-y-2">
                                    {initialResults.suggestions.slice(0, 3).map((s: any, i: number) => (
                                        <div key={i} className="text-xs text-blue-700 bg-white/50 p-2 rounded border border-blue-100/50">
                                            "{s.sentence.substring(0, 60)}..."
                                        </div>
                                    ))}
                                    {initialResults.suggestions.length > 3 && (
                                        <div className="text-[10px] text-blue-500 text-center italic">
                                            + {initialResults.suggestions.length - 3} more suggestions
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Metadata Anchor */}
                        <div className="flex flex-col gap-2 mt-4">
                            <div className="flex items-center justify-between text-[10px] text-[#6b7280] uppercase tracking-wide font-medium bg-[#f1f5f9] px-3 py-1.5 rounded border border-[#e5e7eb]">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    <span>Last scanned: {new Date().toLocaleDateString()}</span>
                                </div>
                                <span>Mode: {auditResult.tiersExecuted?.includes("RISK") ? "Deep Audit" : auditResult.tiersExecuted?.includes("CLAIM") ? "Claim Check" : "Standard"}</span>
                            </div>

                            {/* Tier Breakdown (Mini Diagnostics) */}
                            {auditResult.tierMetadata && (
                                <div className="grid grid-cols-3 gap-1">
                                    {["STRUCTURAL", "CLAIM", "RISK"].map(tier => {
                                        const executed = auditResult.tierMetadata[tier]?.executed;
                                        return (
                                            <div key={tier} className={`text-[9px] text-center py-1 rounded border ${executed ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                {tier} {executed ? "✓" : "○"}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
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
                    <div className="text-center py-8 text-[#6b7280] text-sm animate-pulse">
                        Preparing audit...
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
