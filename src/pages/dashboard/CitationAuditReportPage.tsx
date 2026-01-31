
import React, { useState, useMemo } from "react";
import { useCitationAuditStore } from "../../stores/useCitationAuditStore";
import { VerificationResultsPanel } from "../../components/citations/VerificationResultsPanel";
import { ShieldAlert, ChevronDown, BadgeCheck, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

// --- Helper Components ---

const ScoreBar = ({ label, score, weight }: any) => (
    <div className="text-sm">
        <div className="flex justify-between mb-1">
            <span className="text-slate-500 font-medium">{label} <span className="text-slate-400 text-xs">({weight})</span></span>
            <span className={`font-mono font-bold ${score > 80 ? 'text-green-600' : score > 50 ? 'text-amber-600' : 'text-slate-400'}`}>{score}</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${score > 80 ? 'bg-green-500' : score > 50 ? 'bg-amber-500' : 'bg-slate-400'}`}
                style={{ width: `${score}%` }}
            />
        </div>
    </div>
);

const mapRuleToCodeAndColor = (ruleId: string): { code: string, color: string, label: string } => {
    const r = ruleId.toUpperCase();
    if (r.includes("VERIFICATION")) return { code: "VER", color: "red", label: "Source Verification" };
    if (r.includes("REF") || r.includes("MISMATCH") || r.includes("LIST")) return { code: "REF", color: "blue", label: "Reference Match" };
    if (r.includes("MIXED") || r.includes("CONSISTENCY")) return { code: "MIX", color: "amber", label: "Style Inconsistency" };
    return { code: "STY", color: "amber", label: "Style Rule" };
};

const filterViolationsByCode = (violations: any[], targetCode: string) => {
    if (!violations) return [];
    return violations.filter((v: any) => mapRuleToCodeAndColor(v.ruleId).code === targetCode);
};

const AuditReportCard = ({ title, code, count, passed, onClick, expanded, children }: any) => (
    <div
        className={`flex flex-col p-6 rounded-xl border transition-all bg-white shadow-sm hover:shadow-md ${expanded ? 'ring-1 ring-offset-2' : ''} ${passed ? 'border-gray-200' :
            code === 'VER' ? 'border-red-100' :
                code === 'REF' ? 'border-blue-100' :
                    'border-amber-100'
            } `}
    >
        <div
            onClick={onClick}
            className="flex items-center justify-between cursor-pointer"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${passed ? 'bg-green-100 text-green-700' :
                    code === 'VER' ? 'bg-red-100 text-red-700' :
                        code === 'REF' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-900'
                    } `}>
                    {code}
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{title}</h4>
                    <p className="text-sm text-gray-500">
                        {passed ? 'All checks passed' : `${count} issue${count !== 1 ? 's' : ''} require attention`}
                    </p>
                </div>
            </div>
            <div className={`transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
        </div>

        {expanded && (
            <div className="animate-in slide-in-from-top-2 duration-200">
                {children}
            </div>
        )}
    </div>
);

// --- Main Page Component ---

const CitationAuditReportPage = () => {
    const navigate = useNavigate();
    const { auditResult, timestamp } = useCitationAuditStore();
    const [activeDetail, setActiveDetail] = useState<string | null>("STY");
    const [viewMode, setViewMode] = useState<"report" | "graph">("report");

    const violationStats = useMemo(() => {
        if (!auditResult || !auditResult.violations) return {};
        const stats: Record<string, number> = {};
        auditResult.violations.forEach((v: any) => {
            const { code } = mapRuleToCodeAndColor(v.ruleId);
            stats[code] = (stats[code] || 0) + 1;
        });
        return stats;
    }, [auditResult]);

    const toggleDetail = (code: string) => {
        setActiveDetail(prev => prev === code ? null : code);
    };

    if (!auditResult) {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-full text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <ShieldAlert className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">No Audit Results Found</h2>
                <p className="text-gray-500 mt-2 mb-6 max-w-md">
                    Please run a citation audit from the document editor first to generate this report.
                </p>
                <Button onClick={() => navigate("/dashboard/editor")}>
                    Go to Editor
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                Citation Audit Report
                                {auditResult.integrityIndex?.confidence && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${auditResult.integrityIndex.confidence === "HIGH" ? "bg-green-50 text-green-700 border-green-200" :
                                        "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}>
                                        {auditResult.integrityIndex.confidence} Confidence
                                    </span>
                                )}
                            </h1>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Generated on {timestamp ? new Date(timestamp).toLocaleString() : 'Just now'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode("report")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "report" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                Report View
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">

                {/* Top Section: CII Score & Graph Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* CII Score Card */}
                    {auditResult.integrityIndex && (
                        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 bg-slate-900 text-white flex-1 flex flex-col justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            Citation Integrity Index
                                        </h3>
                                        <BadgeCheck className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div className="text-5xl font-black mb-2 tracking-tight">
                                        {auditResult.integrityIndex.totalScore}%
                                    </div>
                                    <p className="text-slate-400 text-sm">
                                        Based on style adherence, reference checking, and verification.
                                    </p>
                                </div>

                                <div className="mt-8 space-y-4">
                                    <ScoreBar label="Style Adherence" score={auditResult.integrityIndex.components.styleScore} weight="30%" />
                                    <ScoreBar label="Reference Check" score={auditResult.integrityIndex.components.referenceScore} weight="20%" />
                                    <ScoreBar label="Existence Verification" score={auditResult.integrityIndex.components.verificationScore} weight="30%" />
                                    <ScoreBar label="Semantic Alignment" score={auditResult.integrityIndex.components.semanticScore} weight="20%" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="lg:col-span-2 space-y-4">
                        {/* Verification Summary Card */}
                        <AuditReportCard
                            title="Source Verification"
                            code="VER"
                            count={violationStats['VER'] || 0}
                            passed={(violationStats['VER'] || 0) === 0}
                            expanded={activeDetail === 'VER'}
                            onClick={() => toggleDetail('VER')}
                        >
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                {auditResult?.verificationResults && (
                                    <VerificationResultsPanel
                                        results={auditResult.verificationResults}
                                        editor={null} // Read-only mode
                                    />
                                )}
                            </div>
                        </AuditReportCard>

                        {/* Reference List Card */}
                        <AuditReportCard
                            title="Reference List"
                            code="REF"
                            count={violationStats['REF'] || 0}
                            passed={(violationStats['REF'] || 0) === 0}
                            expanded={activeDetail === 'REF'}
                            onClick={() => toggleDetail('REF')}
                        >
                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                {filterViolationsByCode(auditResult?.violations, 'REF').map((v: any, i: number) => (
                                    <div key={i} className="p-4 border rounded-lg bg-blue-50/50 border-blue-100">
                                        <div className="flex justify-between font-bold text-blue-900 text-sm mb-1">
                                            <span>Missing Reference</span>
                                        </div>
                                        <p className="text-sm text-gray-700">{v.message}</p>
                                    </div>
                                ))}
                                {filterViolationsByCode(auditResult?.violations, 'REF').length === 0 && (
                                    <p className="text-gray-500 italic">No reference mismatches found.</p>
                                )}
                            </div>
                        </AuditReportCard>

                        {/* Style Card */}
                        <AuditReportCard
                            title="Citation Style"
                            code="STY"
                            count={violationStats['STY'] || 0}
                            passed={(violationStats['STY'] || 0) === 0}
                            expanded={activeDetail === 'STY'}
                            onClick={() => toggleDetail('STY')}
                        >
                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                                {filterViolationsByCode(auditResult?.violations, 'STY').map((v: any, i: number) => (
                                    <div key={i} className="p-4 border rounded-lg bg-amber-50/50 border-amber-100">
                                        <div className="flex justify-between font-bold text-amber-900 text-sm mb-1">
                                            <span>Formatting Rule</span>
                                        </div>
                                        <p className="text-sm text-gray-700">{v.message}</p>
                                        <div className="mt-2 text-xs text-amber-700/70 font-mono bg-amber-100/50 inline-block px-2 py-1 rounded">
                                            Expected: {v.expected || 'Correct format'}
                                        </div>
                                    </div>
                                ))}
                                {filterViolationsByCode(auditResult?.violations, 'STY').length === 0 && (
                                    <p className="text-gray-500 italic">No style violations found.</p>
                                )}
                            </div>
                        </AuditReportCard>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default CitationAuditReportPage;
