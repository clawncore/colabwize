import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { ArrowLeft, ShieldAlert, ChevronDown } from "lucide-react";
import { runCitationAudit } from "../../services/citationAudit/citationAuditEngine";
import { useToast } from "../../hooks/use-toast";
import { VerificationResultsPanel } from "./VerificationResultsPanel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";

interface CitationFlag {
    type: string;
    ruleId: string;
    message: string;
    anchor?: {
        start: number;
        end: number;
        text: string;
    };
    expected?: string;
}

interface CitationAuditSidebarProps {
    projectId: string;
    editor: Editor | null;
    onClose: () => void;
    onFindPapers: (keywords: string[]) => void;
    initialResults?: any;
    citationStyle?: string | null;
}

export const CitationAuditSidebar: React.FC<CitationAuditSidebarProps> = ({
    projectId,
    editor,
    onClose,
    onFindPapers,
    citationStyle
}) => {
    const [loading, setLoading] = useState(false);
    const [auditResult, setAuditResult] = useState<any>(null);
    const [activeDetail, setActiveDetail] = useState<string | null>(null);
    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const selectedStyle = citationStyle || "APA";
    const { toast } = useToast();

    // Auto-run audit on mount
    React.useEffect(() => {
        if (!auditResult && !loading) {
            handleRunStyleAudit();
        }
    }, []);

    // Helper to map Rule IDs to new Badge Codes and Colors
    const mapRuleToCodeAndColor = (ruleId: string): { code: string, color: string, label: string } => {
        const r = ruleId.toUpperCase();

        // Strict mapping logic
        if (r.includes("VERIFICATION")) return { code: "VER", color: "red", label: "Source Verification" };
        if (r.includes("REF") || r.includes("MISMATCH") || r.includes("LIST")) return { code: "REF", color: "blue", label: "Reference Match" };
        if (r.includes("MIXED") || r.includes("CONSISTENCY")) return { code: "MIX", color: "amber", label: "Style Inconsistency" };

        // Default to Style Violation
        return { code: "STY", color: "amber", label: "Style Rule" };
    };

    const filterViolationsByCode = (violations: any[], targetCode: string) => {
        if (!violations) return [];
        return violations.filter((v: any) => mapRuleToCodeAndColor(v.ruleId).code === targetCode);
    };

    const handleRunStyleAudit = async () => {
        if (!editor) return;

        try {
            setLoading(true);
            setAuditResult(null);

            // Clear existing headers/highlights
            editor.commands.clearAllHighlights();

            // Direct execution - No simulation/progress delays allowed by Strict Rules
            const result = await runCitationAudit(editor.getJSON(), selectedStyle);
            setAuditResult(result);

            if (result.state === "COMPLETED_SUCCESS" && result.violations.length > 0) {
                // Apply highlights with new Badge Codes
                result.violations.forEach((flag: any) => {
                    if (flag.anchor) {
                        const { code, color, label } = mapRuleToCodeAndColor(flag.ruleId);

                        // Validate range
                        const docSize = editor.state.doc.content.size;
                        const start = Math.max(0, Math.min(flag.anchor.start, docSize));
                        const end = Math.max(start, Math.min(flag.anchor.end, docSize));

                        if (start < end) {
                            editor.chain().highlightRange(start, end, {
                                type: label, // Use friendly label instead of "violation"
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
                    description: "Review highlighted markers in the document.",
                    variant: "default"
                });
            } else if (result.state === "COMPLETED_SUCCESS") {
                // Determine if we found ANY citations (even if no violations)
                const hasVerified = result.verificationResults && result.verificationResults.length > 0;

                if (hasVerified) {
                    toast({
                        title: "✅ Citations Verified",
                        description: `Found ${result.verificationResults.length} citations. All passed checks.`,
                        variant: "default"
                    });
                } else {
                    toast({
                        title: "✅ Citation audit completed",
                        description: "No citations found to check.",
                        variant: "default"
                    });
                }
            } else {
                toast({
                    title: "⚠️ Citation audit could not be completed",
                    description: result.errorMessage || "Unknown error",
                    variant: "destructive"
                });
            }

            // ALWAYS apply Blue Highlights for Verified Citations (if available)
            // This runs regardless of violations state
            if (result.verificationResults) {
                result.verificationResults.forEach((ver: any) => {
                    // Only highlight if verified (and presuming no overlap with major errors, OR overlay them)
                    // Logic: If status is PASSED or similar positive status
                    const isViolation = ver.status === "VERIFICATION_FAILED" || ver.status === "UNMATCHED_REFERENCE";

                    if (!isViolation && ver.inlineLocation) {
                        const start = ver.inlineLocation.start;
                        const end = ver.inlineLocation.end;

                        // Check if there is already a violation highlight at this position?
                        // Tiptap marks can stack. If we want blue text, we can apply it.
                        // If there is a violation (red/amber), it might have background color.
                        // Blue text (foreground) + Background color is fine.

                        editor.chain().highlightRange(start, end, {
                            type: "Verified Citation",
                            color: "citation-blue", // TEXT ONLY BLUE
                            message: `Verified: ${ver.title || 'Source confirmed'}`,
                            badgeCode: "VER"
                        }).run();
                    }
                });
            }

        } catch (error: any) {
            console.error("Audit failed", error);
            toast({
                variant: "destructive",
                title: "⚠️ Citation audit could not be completed",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats for navigation
    const getStats = () => {
        if (!auditResult || !auditResult.violations) return {};
        const stats: Record<string, number> = {};
        auditResult.violations.forEach((v: any) => {
            const { code } = mapRuleToCodeAndColor(v.ruleId);
            stats[code] = (stats[code] || 0) + 1;
        });
        return stats;
    };

    const violationStats = getStats();

    // Toggle expansion handler
    const toggleDetail = (code: string) => {
        if (activeDetail === code) {
            setActiveDetail(null);
        } else {
            setActiveDetail(code);
        }
    };

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

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">

                {/* Section 1: Audit Status */}
                <section>
                    <div className="mb-4">
                        {loading ? (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-center text-sm text-gray-600">
                                Running audit...
                            </div>
                        ) : !auditResult ? (
                            null
                        ) : auditResult.violations.length > 0 ? (
                            <div className="text-amber-800 bg-amber-50 p-4 rounded-md border border-amber-200">
                                <div className="flex items-center gap-2 font-bold mb-1">
                                    <ShieldAlert className="w-4 h-4" />
                                    <span>Citation issues detected</span>
                                </div>
                                <p className="text-sm">Review highlighted markers below.</p>
                                <button onClick={handleRunStyleAudit} className="mt-3 text-xs font-semibold uppercase tracking-wider hover:underline">
                                    Rerun Audit
                                </button>
                            </div>
                        ) : (
                            <div className="text-green-800 bg-green-50 p-4 rounded-md border border-green-200">
                                <div className="flex items-center gap-2 font-bold mb-1">
                                    <span>✅</span>
                                    <span>Citation audit completed</span>
                                </div>
                                <p className="text-sm">No issues found.</p>
                                <button onClick={handleRunStyleAudit} className="mt-3 text-xs font-semibold uppercase tracking-wider hover:underline">
                                    Rerun Audit
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 2: Accordion Reports */}
                {auditResult && (
                    <section className="border-t border-gray-100 pt-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Audit Reports
                        </h3>
                        <div className="space-y-3">
                            {/* Style Report Accordion */}
                            <AuditReportCard
                                title="Citation Style"
                                code="STY"
                                count={violationStats['STY'] || 0}
                                passed={(violationStats['STY'] || 0) === 0}
                                expanded={activeDetail === 'STY'}
                                onClick={() => toggleDetail('STY')}
                            >
                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                                    <p className="text-xs text-gray-500 mb-2">
                                        Reviewing formatting against {selectedStyle}.
                                    </p>
                                    {filterViolationsByCode(auditResult?.violations, 'STY').map((v: any, i: number) => (
                                        <div key={i} className="p-2 border rounded bg-white/50 border-amber-100 hover:border-amber-300 transition-colors">
                                            <div className="flex justify-between font-medium text-amber-900 text-xs">
                                                <span>Violation</span>
                                                <button className="text-xs text-amber-700 underline" onClick={(e) => {
                                                    e.stopPropagation();
                                                    editor?.commands.setTextSelection(v.anchor.start);
                                                    editor?.commands.scrollIntoView();
                                                }}>Jump</button>
                                            </div>
                                            <p className="text-xs mt-1 text-gray-700">{v.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </AuditReportCard>

                            {/* Reference Report Accordion */}
                            <AuditReportCard
                                title="Reference List"
                                code="REF"
                                count={violationStats['REF'] || 0}
                                passed={(violationStats['REF'] || 0) === 0}
                                expanded={activeDetail === 'REF'}
                                onClick={() => toggleDetail('REF')}
                            >
                                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                                    {filterViolationsByCode(auditResult?.violations, 'REF').map((v: any, i: number) => (
                                        <div key={i} className="p-2 border rounded bg-white/50 border-blue-100 hover:border-blue-300 transition-colors">
                                            <div className="flex justify-between font-medium text-blue-900 text-xs">
                                                <span>Missing Reference</span>
                                                <button className="text-xs text-blue-700 underline" onClick={(e) => {
                                                    e.stopPropagation();
                                                    editor?.commands.setTextSelection(v.anchor.start);
                                                    editor?.commands.scrollIntoView();
                                                }}>Jump</button>
                                            </div>
                                            <p className="text-xs mt-1 text-gray-700">{v.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </AuditReportCard>

                            {/* Verification Report Accordion */}
                            <AuditReportCard
                                title="Source Verification"
                                code="VER"
                                count={violationStats['VER'] || 0}
                                passed={(violationStats['VER'] || 0) === 0}
                                expanded={activeDetail === 'VER'}
                                onClick={() => toggleDetail('VER')}
                            >
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    {auditResult?.verificationResults && (
                                        <VerificationResultsPanel results={auditResult.verificationResults} />
                                    )}
                                </div>
                            </AuditReportCard>
                        </div>
                    </section>
                )}

                {/* Section 3: Marker Guide (Collapsible) */}
                <section className="border-t border-gray-100 pt-6">
                    <button
                        onClick={() => setIsLegendOpen(!isLegendOpen)}
                        className="w-full flex items-center justify-between group mb-4"
                    >
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-600 transition-colors">
                            Citation Marker Guide
                        </h3>
                        <div className={`transform transition-transform duration-200 ${isLegendOpen ? 'rotate-180' : ''}`}>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                    </button>

                    {isLegendOpen && (
                        <div className="space-y-3 text-sm text-gray-600 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white min-w-[28px]">STY</span>
                                <span>Citation style violation</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white min-w-[28px]">VER</span>
                                <span>Source could not be verified</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white min-w-[28px]">REF</span>
                                <span>Reference list mismatch</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold text-blue-600 min-w-[28px] border border-blue-200 bg-blue-50">Link</span>
                                <span>Verified Citation</span>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

// Expanded Helper Component with Accordion Support
const AuditReportCard = ({ title, code, count, passed, onClick, expanded, children }: any) => (
    <div
        className={`flex flex-col p-4 rounded-lg border transition-all ${passed ? 'bg-white border-gray-200' :
            code === 'VER' ? 'bg-red-50 border-red-200' :
                code === 'REF' ? 'bg-blue-50 border-blue-200' :
                    'bg-amber-50 border-amber-200'
            } `}
    >
        <div
            onClick={onClick}
            className="flex items-center justify-between cursor-pointer"
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${passed ? 'bg-green-100 text-green-700' :
                    code === 'VER' ? 'bg-red-100 text-red-700' :
                        code === 'REF' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-900'
                    } `}>
                    {code}
                </div>
                <div>
                    <h4 className="font-medium text-sm text-gray-900">{title}</h4>
                    <p className="text-xs text-gray-500">
                        {passed ? 'Passed check' : `${count} issue${count > 1 ? 's' : ''} found`}
                    </p>
                </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
        </div>

        {/* Accordion Content */}
        {expanded && (
            <div className="animate-in slide-in-from-top-2 duration-200">
                {children}
            </div>
        )}
    </div>
);
