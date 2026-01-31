
import React, { useState } from "react";
import { useCitationAuditStore } from "../../stores/useCitationAuditStore";
import { VerificationResultsPanel } from "./VerificationResultsPanel";
import { X, BadgeCheck } from "lucide-react";

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
    const [viewMode, setViewMode] = useState<"report" | "graph">("report");
    const [activeTab, setActiveTab] = useState<"ALL" | "VER" | "REF" | "STY">("ALL");

    if (!isOpen || !auditResult) return null;

    const violationStats: Record<string, number> = {};
    auditResult.violations?.forEach((v: any) => {
        const { code } = getRuleInfo(v.ruleId);
        violationStats[code] = (violationStats[code] || 0) + 1;
    });

    const formattingCount = (violationStats['STY'] || 0);
    const unresolvedCount = violationStats['REF'] || 0;
    const unverifiableCount = auditResult.verificationResults?.filter((v: any) => v.existenceStatus === "NOT_FOUND").length || 0;
    const totalIssues = formattingCount + unresolvedCount + unverifiableCount;

    // Simple Scoring
    const integrityScore = Math.max(0, 100 - (totalIssues * 5));
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

    const renderViolations = (filterCode: string) => {
        if (filterCode === "ALL") {
            return (
                <div className="space-y-10">
                    {unverifiableCount > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-[#6b7280] mb-4">Verification Findings</h4>
                            <div className="mt-4">
                                {auditResult.verificationResults && <VerificationResultsPanel results={auditResult.verificationResults} editor={editor} onAddSource={onAddSource} />}
                            </div>
                        </div>
                    )}

                    {unresolvedCount > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-[#6b7280] mb-4">Reference Analysis</h4>
                            {renderViolations("REF")}
                        </div>
                    )}

                    {formattingCount > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-[#6b7280] mb-4">Style & Formatting</h4>
                            {renderViolations("STY")}
                        </div>
                    )}

                    {totalIssues === 0 && (
                        <div className="p-12 text-center border-dashed border border-[#e5e7eb] rounded-xl">
                            <BadgeCheck className="w-10 h-10 mx-auto mb-3 text-[#16a34a]" />
                            <h3 className="text-lg font-semibold text-[#111827]">Compliance Verified</h3>
                            <p className="text-[#6b7280]">No citation anomalies detected.</p>
                        </div>
                    )}
                </div>
            );
        }

        const relevant = auditResult.violations?.filter((v: any) => getRuleInfo(v.ruleId).code === filterCode) || [];

        if (filterCode === "VER") {
            return (
                <div className="mt-4">
                    {auditResult.verificationResults && <VerificationResultsPanel results={auditResult.verificationResults} editor={editor} />}
                </div>
            );
        }

        if (relevant.length === 0) {
            return (
                <div className="p-8 text-center text-[#6b7280] bg-[#f8fafc] rounded-xl border border-[#e5e7eb]">
                    No findings in this category.
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {relevant.map((v: any, i: number) => {
                    const info = getRuleInfo(v.ruleId);
                    return (
                        <div key={i} className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                            {/* UARS Rule: Severity Inside, Not Around */}
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-sm font-semibold ${info.colorClass}`}>
                                    {info.label}
                                </span>
                            </div>

                            <p className="text-sm text-[#374151] leading-relaxed mb-3">
                                {v.message}
                            </p>

                            {v.expected && (
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#f1f5f9]">
                                    <div className="text-xs text-[#6b7280] font-mono flex-1">
                                        Expected: <span className="font-semibold text-[#111827]">{v.expected}</span>
                                    </div>
                                    <button
                                        onClick={() => handleApplyFix(v)}
                                        className="px-3 py-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#e5e7eb] text-xs font-medium text-[#111827] rounded-lg transition-colors"
                                    >
                                        Apply Fix
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
            <div className="bg-[#f8fafc] rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col font-sans border border-[#e5e7eb]">
                {/* Header: Academic Tone */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e5e7eb] z-10">
                    <div>
                        <h2 className="text-lg font-bold text-[#111827]">Citation Audit Report</h2>
                        <p className="text-[#6b7280] text-xs mt-0.5">Automated compliance verification</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-[#f1f5f9] p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode("report")}
                                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "report" ? "bg-white text-[#111827] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"}`}
                            >
                                Report
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-[#f1f5f9] rounded-lg text-[#6b7280]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Canvas */}
                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Left Panel: Deep Summary (Report Mode) */}
                    <div className="w-full lg:w-80 bg-white border-r border-[#e5e7eb] p-6 overflow-y-auto shrink-0 z-0">
                        <div className="mb-8 p-6 bg-[#f8fafc] rounded-xl border border-[#e5e7eb] text-center">
                            <div className="text-4xl font-bold text-[#111827] mb-2">{integrityScore}%</div>
                            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium border"
                                style={{
                                    color: integrityColor,
                                    borderColor: integrityScore === 100 ? '#bbf7d0' : integrityScore > 80 ? '#fde68a' : '#fecaca',
                                    backgroundColor: integrityScore === 100 ? '#f0fdf4' : integrityScore > 80 ? '#fffbeb' : '#fef2f2'
                                }}>
                                {integrityStatus}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-3 px-2">Sections</h3>
                            {[
                                { id: "ALL", label: "Full Report", count: totalIssues },
                                { id: "VER", label: "Verification", count: unverifiableCount },
                                { id: "REF", label: "References", count: unresolvedCount },
                                { id: "STY", label: "Formatting", count: formattingCount }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex justify-between items-center px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === tab.id
                                        ? "bg-[#f1f5f9] text-[#111827] font-semibold"
                                        : "text-[#6b7280] hover:bg-[#f8fafc] hover:text-[#111827]"
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && <span className="text-xs text-[#6b7280] bg-white px-1.5 py-0.5 rounded border border-[#e5e7eb]">{tab.count}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Evidence Stream */}
                    <div className="flex-1 bg-[#f8fafc] p-8 overflow-y-auto">
                        <div className="max-w-3xl mx-auto">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-[#111827]">
                                    {activeTab === "ALL" ? "Comprehensive Findings" :
                                        activeTab === "VER" ? "Source Verification" :
                                            activeTab === "REF" ? "Reference Resolution" : "Formatting Rules"}
                                </h3>
                                <p className="text-sm text-[#6b7280] mt-1">
                                    {activeTab === "ALL" && "Detailed breakdown of all citation and integrity checks."}
                                    {activeTab === "VER" && "Cross-referencing citations against academic databases."}
                                    {activeTab === "REF" && "Matching in-text citations to bibliography entries."}
                                    {activeTab === "STY" && "Checking adherence to selected citation style guidelines."}
                                </p>
                            </div>
                            {renderViolations(activeTab)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
