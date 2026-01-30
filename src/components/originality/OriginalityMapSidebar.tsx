import React, { useState } from "react";
import { OriginalityScan, SimilarityMatch } from "../../services/originalityService";
import { SimilarityMatchCard } from "./SimilarityMatchCard";
import { SafetyBadge } from "./SafetyBadge";
import { Shield, AlertCircle, CheckCircle, Clock, FileText } from "lucide-react";
import { OriginalityReportModal } from "./OriginalityReportModal";
import { Button } from "../ui/button";

interface OriginalityMapSidebarProps {
    results: OriginalityScan;
    documentContent?: string;
}

export const OriginalityMapSidebar: React.FC<OriginalityMapSidebarProps> = ({ results, documentContent = "" }) => {
    const [showFullReport, setShowFullReport] = useState(false);
    const score = results.overallScore ?? 0;
    const matchCount = results.matchCount ?? 0;
    const matches = results.matches || [];

    // Determine safety level
    let safetyLevel: "safe" | "moderate" | "high" = "safe";
    if (score < 50) safetyLevel = "high";
    else if (score < 80) safetyLevel = "moderate";

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Purple Gradient Header with Score */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white p-6 shadow-md z-10">
                {/* Title */}
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Originality Report
                </h2>

                {/* Large Score Display - No Box */}
                <div className="mb-6">
                    <div className="text-sm font-medium text-purple-100 mb-2">Overall Score</div>
                    <div className="flex items-center gap-4">
                        <div className="text-7xl font-bold tracking-tighter">{Math.round(score)}%</div>
                        {score < 70 ? (
                            <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Review Needed
                            </div>
                        ) : (
                            <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Original
                            </div>
                        )}
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                    {/* Matches Found */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="text-xs text-purple-100 mb-1">Matches Found</div>
                        <div className="text-2xl font-bold">{matchCount}</div>
                    </div>

                    {/* Words Scanned */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                        <div className="text-xs text-purple-100 mb-1">Words Scanned</div>
                        <div className="text-2xl font-bold">{results.wordsScanned || 0}</div>
                    </div>
                </div>

                {/* Warning Message */}
                {matchCount > 0 && (
                    <div className="mt-4 flex items-start gap-2 text-xs bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/5 text-purple-50">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>Some similar content detected. Review flagged sections.</span>
                    </div>
                )}

                {/* Timestamp */}
                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-purple-200/70">
                    <Clock className="w-3 h-3" />
                    <span>Scanned {new Date().toLocaleTimeString()} • {new Date().toLocaleDateString()}</span>
                </div>
            </div>

            {/* Matched Content Section */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {matchCount === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Matches Found</h3>
                        <p className="text-sm text-gray-500">
                            Your content appears to be original. No significant similarities were detected.
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
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
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
            />
        </div>
    );
};
