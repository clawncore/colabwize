import React, { useState } from "react";
import { useCitationAuditStore } from "../../stores/useCitationAuditStore";
import { VerificationResultsPanel } from "./VerificationResultsPanel";
import { CitationGraph } from "./CitationGraph";
import { ShieldAlert, X, Network, BadgeCheck, FileText } from "lucide-react";


interface CitationAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const mapRuleToCodeAndColor = (ruleId: string): { code: string, color: string, label: string } => {
    const r = ruleId.toUpperCase();
    if (r.includes("VERIFICATION")) return { code: "VER", color: "red", label: "Source Verification" };
    if (r.includes("REF") || r.includes("MISMATCH") || r.includes("LIST")) return { code: "REF", color: "blue", label: "Reference Match" };
    if (r.includes("MIXED") || r.includes("CONSISTENCY")) return { code: "MIX", color: "amber", label: "Style Inconsistency" };
    return { code: "STY", color: "amber", label: "Style Rule" };
};

export const CitationAuditModal: React.FC<CitationAuditModalProps> = ({ isOpen, onClose }) => {
    const { auditResult } = useCitationAuditStore();
    const [viewMode, setViewMode] = useState<"report" | "graph">("report");
    const [activeTab, setActiveTab] = useState<"VER" | "REF" | "STY">("STY");

    if (!isOpen || !auditResult) return null;

    const score = auditResult.integrityIndex?.totalScore || 0;
    let config = {
        gradient: "from-emerald-500 via-teal-600 to-green-700",
        label: "Excellent Integrity",
        desc: "Sources appear verifiable and reliable."
    };

    if (score < 50) {
        config = {
            gradient: "from-red-600 via-rose-700 to-pink-800",
            label: "Critical Risk",
            desc: "Significant citation issues detected."
        };
    } else if (score < 80) {
        config = {
            gradient: "from-blue-500 via-indigo-600 to-purple-700",
            label: "Needs Improvement",
            desc: "Some sources may be unverified."
        };
    }

    const violationStats: Record<string, number> = {};
    auditResult.violations?.forEach((v: any) => {
        const { code } = mapRuleToCodeAndColor(v.ruleId);
        violationStats[code] = (violationStats[code] || 0) + 1;
    });

    const renderViolations = (code: string) => {
        const relevant = auditResult.violations?.filter((v: any) => mapRuleToCodeAndColor(v.ruleId).code === code) || [];

        if (code === "VER") {
            return (
                <div className="mt-4">
                    {auditResult.verificationResults && <VerificationResultsPanel results={auditResult.verificationResults} editor={null} />}
                </div>
            );
        }

        if (relevant.length === 0) {
            return (
                <div className="p-8 text-center text-gray-500 italic bg-gray-50 rounded-lg">
                    <BadgeCheck className="w-8 h-8 mx-auto mb-2 text-green-500 opacity-50" />
                    No issues found in this category.
                </div>
            );
        }

        return (
            <div className="space-y-3 mt-4">
                {relevant.map((v: any, i: number) => (
                    <div key={i} className="p-4 border rounded-lg bg-white shadow-sm border-l-4" style={{ borderLeftColor: code === 'REF' ? '#3b82f6' : '#f59e0b' }}>
                        <div className="flex justify-between font-bold text-gray-900 text-sm mb-1">
                            <span>{code === 'REF' ? "Missing Reference" : "Formatting Rule"}</span>
                        </div>
                        <p className="text-sm text-gray-700">{v.message}</p>
                        {v.expected && (
                            <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
                                Expected: {v.expected}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ShieldAlert className="w-6 h-6 text-gray-700" />
                            Citation Audit Report
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Comprehensive analysis of your document's integrity and style adherence.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode("report")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "report" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                <FileText className="w-4 h-4 inline mr-2" />
                                Report
                            </button>
                            <button
                                onClick={() => setViewMode("graph")}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === "graph" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                            >
                                <Network className="w-4 h-4 inline mr-2" />
                                Graph
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    {viewMode === "graph" ? (
                        <div className="h-full p-6 bg-gray-50 overflow-auto">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[600px]">
                                <CitationGraph />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full grid grid-cols-1 lg:grid-cols-12">
                            {/* Left Column: Stats */}
                            <div className="lg:col-span-4 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
                                {/* Score Card */}
                                <div className={`rounded-xl p-6 text-white bg-gradient-to-br ${config.gradient} shadow-lg mb-6 relative overflow-hidden`}>
                                    <div className="absolute inset-0 opacity-10">
                                        <img
                                            src="/logo.svg"
                                            alt="Logo"
                                            className="w-full h-full object-contain scale-150 rotate-12 blur-sm"
                                            style={{ filter: 'brightness(0) invert(1)' }}
                                        />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-xs font-bold text-white/80 uppercase tracking-widest mb-2">Integrity Index</div>
                                        <div className="text-5xl font-black tracking-tight mb-2">{score}%</div>
                                        <div className="font-bold text-lg mb-1">{config.label}</div>
                                        <p className="text-xs text-white/90">{config.desc}</p>
                                    </div>
                                </div>

                                {/* Navigation Tabs */}
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab("STY")}
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${activeTab === "STY" ? "bg-white border-amber-500 shadow-md ring-1 ring-amber-500" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">Citation Style</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${violationStats['STY'] ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                                                {violationStats['STY'] || 0} Issues
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Formatting and consistency checks</p>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("REF")}
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${activeTab === "REF" ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">Reference List</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${violationStats['REF'] ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                                                {violationStats['REF'] || 0} Issues
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Missing or mismatched references</p>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab("VER")}
                                        className={`w-full text-left p-4 rounded-lg border transition-all ${activeTab === "VER" ? "bg-white border-red-500 shadow-md ring-1 ring-red-500" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-900">Verification</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${violationStats['VER'] ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                                                {violationStats['VER'] || 0} Issues
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Source existence and URL checks</p>
                                    </button>
                                </div>
                            </div>

                            {/* Right Column: Details */}
                            <div className="lg:col-span-8 bg-white p-8 overflow-y-auto">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {activeTab === "STY" && "Style Violations"}
                                        {activeTab === "REF" && "Reference Mismatches"}
                                        {activeTab === "VER" && "Verification Status"}
                                    </h3>
                                    <div className="text-sm text-gray-500">
                                        Showing {activeTab === "VER" ? (auditResult.verificationResults?.length || 0) : (violationStats[activeTab] || 0)} items
                                    </div>
                                </div>
                                {renderViolations(activeTab)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
