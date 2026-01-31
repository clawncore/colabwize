
import React, { useState } from "react";
import { OriginalityScan, SimilarityMatch } from "../../services/originalityService";
import { SimilarityMatchCard } from "./SimilarityMatchCard";

import { Shield, AlertCircle, Clock, FileText } from "lucide-react";
import { OriginalityReportModal } from "./OriginalityReportModal";


interface OriginalityMapSidebarProps {
    results: OriginalityScan;
    documentContent?: string;
    onAskAI?: (prompt: string, hiddenCtx: string) => void;
}

export const OriginalityMapSidebar: React.FC<OriginalityMapSidebarProps> = ({ results, documentContent = "", onAskAI }) => {
    const [showFullReport, setShowFullReport] = useState(false);
    const score = results.overallScore ?? 0;
    const matchCount = results.matchCount ?? 0;
    const matches = results.matches || [];

    // Determine safety level


    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header with Originality Summary */}
            <div className="bg-white p-6 border-b border-gray-200">
                {/* Title */}
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-900">
                    <Shield className="w-5 h-5 text-gray-600" />
                    Originality Report
                </h2>

                {/* Originality Summary - Forensic Design */}
                <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Originality Summary</div>

                    <div className="space-y-4">
                        {/* Similarity Exposure */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Similarity Exposure</span>
                            <span className="text-lg font-bold text-slate-900">{Math.round(100 - (score || 100))}%</span>
                        </div>

                        {/* High-Risk Matches */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                                <span className="text-sm font-medium text-slate-600">High-Risk Matches</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                                {matches.filter(m => (m.similarityScore || 0) >= 80).length}
                            </span>
                        </div>

                        {/* Moderate Matches */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="text-sm font-medium text-slate-600">Moderate Matches</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">
                                {matches.filter(m => (m.similarityScore || 0) >= 60 && (m.similarityScore || 0) < 80).length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Metrics Row - Simplified */}
            <div className="px-6 py-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 shadow-sm flex items-center justify-between">
                    <div className="text-xs text-slate-500 font-medium">Words Scanned</div>
                    <div className="text-lg font-bold text-slate-900">{results.wordsScanned || 0}</div>
                </div>
            </div>

            {/* Warning Message - Policy Tone */}
            {matchCount > 0 && (
                <div className="mt-4 mx-6 flex items-start gap-3 text-xs bg-[#fef2f2] text-[#991b1b] rounded-lg p-3 border border-[#fecaca]">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-80" />
                    <span className="leading-relaxed">
                        Detected overlap with external sources. Paraphrased content may require citation or revision to meet originality standards.
                    </span>
                </div>
            )}

            {/* Timestamp */}
            <div className="mt-4 px-6 flex items-center gap-1.5 text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                <Clock className="w-3 h-3" />
                <span>Scanned {new Date().toLocaleTimeString()} • {new Date().toLocaleDateString()}</span>
            </div>


            {/* Matched Content Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {matchCount === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Significant Overlap</h3>
                        <p className="text-sm text-slate-500">
                            Scan did not detect matches with external sources.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Show first 3 matches only */}
                        {matches.slice(0, 3).map((match: SimilarityMatch, index: number) => (
                            <SimilarityMatchCard
                                key={match.id || index}
                                match={match}
                                onGetRephrase={(m) => {
                                    console.log("Rephrase requested for match:", m);
                                }}
                                onViewComparison={(url) => {
                                    window.open(url, "_blank");
                                }}
                                onAskAI={onAskAI}
                            />
                        ))}

                        {/* Show More Button - if more than 3 */}
                        {matchCount > 3 && (
                            <button
                                onClick={() => setShowFullReport(true)}
                                className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-all border border-gray-200 flex items-center justify-center gap-2">
                                <span>Show {matchCount - 3} More {matchCount - 3 === 1 ? 'Match' : 'Matches'}</span>
                            </button>
                        )}

                        {/* Full Report Button */}
                        <button
                            onClick={() => setShowFullReport(true)}
                            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
                        >
                            <FileText className="w-4 h-4" />
                            View Full Report
                        </button>
                    </>
                )}
            </div>

            {/* Full Report Modal */}
            <OriginalityReportModal
                isOpen={showFullReport}
                onClose={() => setShowFullReport(false)}
                results={results}
                documentContent={documentContent}
                onAskAI={onAskAI}
            />
        </div >
    );
};
