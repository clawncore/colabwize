
import React, { useState } from "react";
import { useCitationAuditStore } from "../../stores/useCitationAuditStore";
import { VerificationResultsPanel } from "./VerificationResultsPanel";
import { X, BadgeCheck, AlertCircle } from "lucide-react";

interface CitationAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    editor: any;
    onAddSource?: (source: any) => Promise<void>;
}

// UARS: Universal Color & Label Logic
const getRuleInfo = (ruleId: string) => {
    const r = ruleId.toUpperCase();
    if (r.includes("VERIFICATION") || r.includes("REF") || r.includes("MISMATCH")) {
        return { label: "High Risk", colorClass: "text-[#dc2626]", bgClass: "bg-red-50", code: "REF" };
    }
    if (r.includes("MIXED") || r.includes("CONSISTENCY") || r.includes("STYLE")) {
        return { label: "Formatting", colorClass: "text-[#f59e0b]", bgClass: "bg-amber-50", code: "STY" };
    }
    return { label: "Notice", colorClass: "text-[#6b7280]", bgClass: "bg-slate-50", code: "INFO" };
};

export const CitationAuditModal: React.FC<CitationAuditModalProps> = ({ isOpen, onClose, editor, onAddSource }) => {
    const { auditResult } = useCitationAuditStore();
    const [activeTab, setActiveTab] = useState<"ALL" | "VER" | "REF" | "STY">("ALL");

    if (!isOpen || !auditResult) return null;

    // 🛡️ FAILURE STATE HANDLER (Prevent "Silent Falloff")
    const isError = auditResult.state.startsWith("FAILED");
    if (isError) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#e5e7eb] animate-in zoom-in-95 duration-200">
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-[#111827] mb-2">Audit Incomplete</h3>
                        <p className="text-[#6b7280] text-sm mb-6 leading-relaxed">
                            {auditResult.errorMessage || "The citation audit could not be completed."}
                        </p>
                        <div className="space-y-3">
                            {auditResult.state === "FAILED_QUOTA_EXCEEDED" ? (
                                <button className="w-full py-2.5 bg-[#111827] text-white rounded-xl font-bold text-sm hover:bg-[#1f2937] transition-colors"
                                    onClick={() => window.location.href = "/pricing"}>
                                    Upgrade Plan
                                </button>
                            ) : (
                                <button className="w-full py-2.5 bg-[#111827] text-white rounded-xl font-bold text-sm hover:bg-[#1f2937] transition-colors"
                                    onClick={onClose}>
                                    Dismiss
                                </button>
                            )}
                            <button onClick={onClose} className="w-full py-2.5 text-[#6b7280] font-bold text-sm hover:bg-[#f8fafc] rounded-xl transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate detailed stats for the sidebar
    const violationStats: Record<string, number> = {};
    auditResult.violations?.forEach((v: any) => {
        const { code } = getRuleInfo(v.ruleId);
        violationStats[code] = (violationStats[code] || 0) + 1;
    });

    const formattingCount = (violationStats['STY'] || 0);
    const unresolvedCount = violationStats['REF'] || 0;
    const unverifiableCount = auditResult.verificationResults?.filter((v: any) => v.existenceStatus === "NOT_FOUND").length || 0;
    const totalIssues = formattingCount + unresolvedCount + unverifiableCount;

    // Scoring & Status
    const integrityScore = auditResult.integrityIndex || Math.max(0, 100 - (totalIssues * 5));
    const integrityStatus = integrityScore === 100 ? "Secure" : integrityScore > 80 ? "Acceptable" : "Requires Revision";
    const integrityColor = integrityScore === 100 ? "#16a34a" : integrityScore > 80 ? "#f59e0b" : "#dc2626";

    const handleApplyFix = (violation: any) => {
        if (!editor || !violation.anchor || !violation.expected) return;
        editor.chain()
            .focus()
            .setTextSelection({ from: violation.anchor.start, to: violation.anchor.end })
            .insertContent(violation.expected)
            .run();
    };

    const renderIssueStream = () => {
        // Debug logging
        console.log("🔍 [Modal] Rendering findings:", {
            totalViolations: auditResult.violations?.length || 0,
            unresolvedCount,
            formattingCount,
            unverifiableCount,
            activeTab,
            violations: auditResult.violations
        });

        return (
            <div className="space-y-10">
                {/* 1. Verification Section (Tier 2/3) */}
                {(activeTab === "ALL" || activeTab === "VER") && (
                    <div>
                        <div className="flex items-baseline gap-2 mb-6 border-b border-[#e5e7eb] pb-3">
                            <h4 className="text-sm font-bold text-[#111827]">Verification Findings</h4>
                        </div>

                        {unverifiableCount > 0 ? (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <h5 className="text-xs font-bold text-[#111827] uppercase tracking-wider">Unverifiable Sources</h5>
                                    <span className="bg-[#fef2f2] text-[#dc2626] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#fecaca]">{unverifiableCount} Issues</span>
                                </div>
                                <VerificationResultsPanel results={auditResult.verificationResults} editor={editor} onAddSource={onAddSource} />
                            </div>
                        ) : (
                            <div className="p-5 text-sm text-[#15803d] bg-[#f0fdf4] rounded-xl border border-[#bbf7d0] italic">
                                No semantic verification issues found. All claims are supported by academic sources.
                            </div>
                        )}
                    </div>
                )}

                {/* 2. References Section (Tier 1) */}
                {(activeTab === "ALL" || activeTab === "REF") && unresolvedCount > 0 && (
                    <div>
                        <div className="flex items-baseline gap-2 mb-6 border-b border-[#e5e7eb] pb-3">
                            <h4 className="text-sm font-bold text-[#111827]">Reference Analysis</h4>
                        </div>
                        <div className="space-y-4">
                            {auditResult.violations?.filter((v: any) => getRuleInfo(v.ruleId).code === "REF").map((v: any, i: number) => (
                                <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                    <div className="text-xs font-bold text-[#dc2626] mb-2 uppercase flex items-center gap-1">
                                        SOURCE NOT FOUND
                                    </div>
                                    <p className="text-sm text-[#374151] leading-relaxed mb-4">{v.message}</p>
                                    <div className="font-mono text-xs text-[#6b7280] bg-[#f8fafc] p-3 rounded-lg border border-[#e5e7eb]">
                                        Ref: "{v.anchor?.text || v.message}"
                                    </div>
                                    <button className="w-full mt-4 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#e5e7eb] rounded-lg text-sm font-medium text-[#111827] flex items-center justify-center gap-2 transition-colors">
                                        Search Academic Databases
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Formatting Section (Tier 1) */}
                {(activeTab === "ALL" || activeTab === "STY") && formattingCount > 0 && (
                    <div>
                        <div className="flex items-baseline gap-2 mb-6 border-b border-[#e5e7eb] pb-3">
                            <h4 className="text-sm font-bold text-[#111827]">Style Compliance</h4>
                        </div>
                        <div className="space-y-4">
                            {auditResult.violations?.filter((v: any) => getRuleInfo(v.ruleId).code === "STY").map((v: any, i: number) => (
                                <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                    <div className="text-xs font-bold text-[#f59e0b] mb-2 uppercase">STYLE VIOLATION</div>
                                    <p className="text-sm text-[#374151] leading-relaxed mb-4">{v.message}</p>
                                    {v.expected && (
                                        <div className="flex items-center justify-between pt-4 border-t border-[#f1f5f9]">
                                            <div className="text-xs text-[#6b7280] font-mono">
                                                Expected: <span className="font-bold text-[#111827]">{v.expected}</span>
                                            </div>
                                            <button
                                                onClick={() => handleApplyFix(v)}
                                                className="px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#e5e7eb] text-xs font-bold text-[#111827] rounded-lg transition-colors"
                                            >
                                                Apply Fix
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 4. FALLBACK: Show all violations if none matched the above categories */}
                {activeTab === "ALL" && (auditResult.violations?.length || 0) > 0 && unresolvedCount === 0 && formattingCount === 0 && (
                    <div>
                        <div className="flex items-baseline gap-2 mb-6 border-b border-[#e5e7eb] pb-3">
                            <h4 className="text-sm font-bold text-[#111827]">All Issues</h4>
                            <span className="text-xs text-[#6b7280]">({auditResult.violations?.length} found)</span>
                        </div>
                        <div className="space-y-4">
                            {auditResult.violations?.map((v: any, i: number) => {
                                const info = getRuleInfo(v.ruleId || "");
                                return (
                                    <div key={i} className={`rounded-xl border border-[#e5e7eb] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${info.bgClass}`}>
                                        <div className={`text-xs font-bold mb-2 uppercase ${info.colorClass}`}>
                                            {v.ruleId || "ISSUE"} - {v.type || info.label}
                                        </div>
                                        <p className="text-sm text-[#374151] leading-relaxed mb-4">{v.message}</p>
                                        {v.anchor && (
                                            <div className="font-mono text-xs text-[#6b7280] bg-white p-3 rounded-lg border border-[#e5e7eb]">
                                                "{v.anchor.text || 'N/A'}"
                                            </div>
                                        )}
                                        {v.expected && (
                                            <button
                                                onClick={() => handleApplyFix(v)}
                                                className="mt-3 px-3 py-1.5 bg-white hover:bg-[#f8fafc] border border-[#e5e7eb] text-xs font-bold text-[#111827] rounded-lg transition-colors"
                                            >
                                                Apply Fix: {v.expected}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 5. No Issues State */}
                {activeTab === "ALL" && (auditResult.violations?.length || 0) === 0 && unverifiableCount === 0 && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BadgeCheck className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="text-lg font-bold text-[#111827] mb-2">No Issues Found</h4>
                        <p className="text-sm text-[#6b7280]">Your citations are properly formatted and linked!</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col font-sans border border-[#e5e7eb]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e5e7eb] shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-[#111827]">Citation Audit Report</h2>
                        <p className="text-[#6b7280] text-xs mt-0.5 font-medium">Automated compliance verification</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-5 py-1.5 text-xs font-bold text-[#111827] border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc] transition-colors shadow-sm">
                            Report
                        </button>
                        <button onClick={onClose} className="p-1.5 hover:bg-[#f1f5f9] rounded-lg text-[#6b7280]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Sidebar */}
                    <div className="w-full lg:w-72 border-r border-[#e5e7eb] flex flex-col shrink-0">
                        {/* Score Box */}
                        <div className="p-6 border-b border-[#e5e7eb]">
                            <div className="p-8 bg-[#f8fafc] rounded-2xl border border-[#e5e7eb] text-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                <div className="text-5xl font-black text-[#111827] mb-3 tracking-tight">{integrityScore}%</div>
                                <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide"
                                    style={{
                                        color: integrityColor,
                                        borderColor: integrityScore === 100 ? '#bbf7d0' : integrityScore > 80 ? '#fde68a' : '#fecaca',
                                        backgroundColor: integrityScore === 100 ? '#f0fdf4' : integrityScore > 80 ? '#fffbeb' : '#fef2f2'
                                    }}>
                                    {integrityStatus}
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="p-4 space-y-1 flex-1 overflow-y-auto">
                            <h3 className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-[0.15em] mb-4 px-3">Sections</h3>
                            {[
                                { id: "ALL", label: "Full Report", count: totalIssues },
                                { id: "VER", label: "Verification", count: unverifiableCount },
                                { id: "REF", label: "References", count: unresolvedCount },
                                { id: "STY", label: "Formatting", count: formattingCount }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex justify-between items-center px-4 py-2.5 text-sm transition-all rounded-xl ${activeTab === tab.id
                                        ? "bg-[#f1f5f9] text-[#111827] font-bold shadow-sm"
                                        : "text-[#6b7280] hover:bg-[#f8fafc] hover:text-[#111827] font-medium"
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span className="text-[10px] font-bold text-[#6b7280] bg-white px-2 py-0.5 rounded-md border border-[#e5e7eb] shadow-sm">
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Stream */}
                    <div className="flex-1 bg-[#f8fafc] overflow-y-auto p-10">
                        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="mb-10">
                                <h3 className="text-2xl font-black text-[#111827] tracking-tight">Comprehensive Findings</h3>
                                <p className="text-sm text-[#6b7280] mt-2 font-medium">Detailed breakdown of all citation and integrity checks.</p>
                            </div>

                            {renderIssueStream()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
