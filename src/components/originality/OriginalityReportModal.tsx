import React, { useState } from "react";
import { OriginalityScan, SimilarityMatch } from "../../services/originalityService";
import { SimilarityMatchCard } from "./SimilarityMatchCard";
import { X, Shield, AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

interface OriginalityReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: OriginalityScan;
    documentContent: string;
}

export const OriginalityReportModal: React.FC<OriginalityReportModalProps> = ({
    isOpen,
    onClose,
    results,
    documentContent
}) => {
    const [selectedMatch, setSelectedMatch] = useState<SimilarityMatch | null>(null);

    if (!isOpen) return null;

    const score = results.overallScore ?? 0;
    const matchCount = results.matchCount ?? 0;
    const matches = results.matches || [];

    // Determine config based on score
    let config = {
        gradient: "from-emerald-500 via-teal-600 to-green-700",
        label: "Excellent Originality",
        desc: "Your document shows strong originality."
    };

    if (score < 50) {
        config = {
            gradient: "from-red-600 via-rose-700 to-pink-800",
            label: "High Risk",
            desc: "Significant similarities detected."
        };
    } else if (score < 80) {
        config = {
            gradient: "from-blue-600 via-indigo-600 to-purple-700",
            label: "Needs Improvement",
            desc: "Some similarities found - review recommended."
        };
    }

    // Helper to get highlighted content
    const getHighlightedContent = () => {
        if (!documentContent || matches.length === 0) return documentContent;

        const sortedMatches = [...matches].sort((a, b) => a.positionStart - b.positionStart);

        let highlightedHTML = "";
        let lastIndex = 0;

        sortedMatches.forEach((match) => {
            const start = match.positionStart || 0;
            const end = match.positionEnd || start;

            // Add text before this match
            highlightedHTML += escapeHtml(documentContent.substring(lastIndex, start));

            // Add highlighted match
            const similarityScore = match.similarityScore || 0;
            let colorClass = "bg-yellow-200 border-yellow-400";
            if (similarityScore >= 80) colorClass = "bg-red-200 border-red-400";
            else if (similarityScore >= 60) colorClass = "bg-orange-200 border-orange-400";

            highlightedHTML += `<mark class="${colorClass} border-b-2 cursor-pointer hover:bg-opacity-80 transition-colors" data-match-id=\"${match.id || ''}" title="${similarityScore}% similar to ${match.sourceUrl || 'unknown source'}">${escapeHtml(documentContent.substring(start, end))}</mark>`;

            lastIndex = end;
        });

        // Add remaining text
        highlightedHTML += escapeHtml(documentContent.substring(lastIndex));

        return highlightedHTML;
    };

    const escapeHtml = (text: string) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full h-full max-w-[95vw] max-h-[95vh] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6" />
                        <h1 className="text-2xl font-bold">Full Originality Report</h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        title="Close">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Content - Copyscape Style Split View */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Highlighted Document */}
                    <div className="flex-1 border-r border-gray-200 flex flex-col bg-gray-50">
                        {/* Document Header */}
                        <div className="bg-white border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-lg font-semibold text-gray-900">Your Document</h2>
                                <div className={`px-4 py-2 rounded-lg bg-gradient-to-br ${config.gradient} text-white font-bold text-xl`}>
                                    {Math.round(score)}% Original
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>📊 {matchCount} matches found</span>
                                <span>📝 {results.wordsScanned || 0} words scanned</span>
                                <span>💵 ${(results.costAmount || 0).toFixed(4)}</span>
                            </div>
                        </div>

                        {/* Highlighted Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div
                                className="prose max-w-none whitespace-pre-wrap font-mono text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: getHighlightedContent() }}
                                onClick={(e) => {
                                    const target = e.target as HTMLElement;
                                    if (target.tagName === 'MARK') {
                                        const matchId = target.getAttribute('data-match-id');
                                        const match = matches.find(m => m.id === matchId);
                                        if (match) setSelectedMatch(match);
                                    }
                                }}
                            />
                        </div>

                        {/* Legend */}
                        <div className="bg-white border-t border-gray-200 px-6 py-3">
                            <div className="flex items-center gap-6 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-200 border-b-2 border-red-400 rounded"></div>
                                    <span>80-100% Similar (High Risk)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-orange-200 border-b-2 border-orange-400 rounded"></div>
                                    <span>60-79% Similar (Moderate)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-yellow-200 border-b-2 border-yellow-400 rounded"></div>
                                    <span>0-59% Similar (Low Risk)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Match Results */}
                    <div className="w-[450px] flex flex-col bg-white">
                        {/* Results Header */}
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-bold text-gray-900">Matched Text</h2>
                                <span className="text-lg font-bold text-gray-900">{Math.round(100 - (score || 0))}%</span>
                            </div>

                            {/* "Simple Strip" - Multi-colored Progress Bar */}
                            <div className="h-3 w-full bg-orange-100 rounded-full flex overflow-hidden mb-4">
                                {/* Red - Identical */}
                                {matches.some(m => (m.similarityScore || 0) >= 95) && (
                                    <div
                                        className="h-full bg-red-400"
                                        style={{ width: `${(matches.filter(m => (m.similarityScore || 0) >= 95).length / Math.max(matchCount, 1)) * 100}%` }}
                                    />
                                )}
                                {/* Pink/Orange - Paraphrased */}
                                {matches.some(m => (m.similarityScore || 0) >= 70 && (m.similarityScore || 0) < 95) && (
                                    <div
                                        className="h-full bg-red-300"
                                        style={{ width: `${(matches.filter(m => (m.similarityScore || 0) >= 70 && (m.similarityScore || 0) < 95).length / Math.max(matchCount, 1)) * 100}%` }}
                                    />
                                )}
                                {/* Beige - Minor */}
                                {matches.some(m => (m.similarityScore || 0) >= 50 && (m.similarityScore || 0) < 70) && (
                                    <div
                                        className="h-full bg-orange-200"
                                        style={{ width: `${(matches.filter(m => (m.similarityScore || 0) >= 50 && (m.similarityScore || 0) < 70).length / Math.max(matchCount, 1)) * 100}%` }}
                                    />
                                )}
                            </div>

                            {/* Match Type Breakdown - Clean & Minimalistic */}
                            {matchCount > 0 && (
                                <div className="bg-white border-t border-gray-100 pt-3 mt-3">
                                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Match Type Breakdown</div>

                                    {/* Calculate stats */}
                                    {(() => {
                                        const identical = matches.filter(m => (m.similarityScore || 0) >= 95).length;
                                        const paraphrased = matches.filter(m => {
                                            const score = m.similarityScore || 0;
                                            return score >= 70 && score < 95;
                                        }).length;
                                        const minorChanges = matches.filter(m => {
                                            const score = m.similarityScore || 0;
                                            return score >= 50 && score < 70;
                                        }).length;

                                        return (
                                            <>
                                                {/* Identical */}
                                                <div className="flex items-center justify-between py-1.5">
                                                    <span className="text-xs text-gray-700 font-medium">Identical</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-blue-500 rounded-full transition-all"
                                                                style={{ width: `${(identical / matchCount) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-900 w-10 text-right tabular-nums">
                                                            {Math.round((identical / matchCount) * 100)}%
                                                        </span>
                                                        <span className="text-xs text-gray-400 w-6 text-right tabular-nums">{identical}</span>
                                                    </div>
                                                </div>

                                                {/* Paraphrased */}
                                                <div className="flex items-center justify-between py-1.5">
                                                    <span className="text-xs text-gray-700 font-medium">Paraphrased</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-orange-500 rounded-full transition-all"
                                                                style={{ width: `${(paraphrased / matchCount) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-900 w-10 text-right tabular-nums">
                                                            {Math.round((paraphrased / matchCount) * 100)}%
                                                        </span>
                                                        <span className="text-xs text-gray-400 w-6 text-right tabular-nums">{paraphrased}</span>
                                                    </div>
                                                </div>

                                                {/* Minor Changes */}
                                                <div className="flex items-center justify-between py-1.5">
                                                    <span className="text-xs text-gray-700 font-medium">Minor changes</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-amber-400 rounded-full transition-all"
                                                                style={{ width: `${(minorChanges / matchCount) * 100}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-semibold text-gray-900 w-10 text-right tabular-nums">
                                                            {Math.round((minorChanges / matchCount) * 100)}%
                                                        </span>
                                                        <span className="text-xs text-gray-400 w-6 text-right tabular-nums">{minorChanges}</span>
                                                    </div>
                                                </div>

                                                {/* Text Coverage - Subtle */}
                                                <div className="pt-3 mt-3 border-t border-gray-100">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Text Coverage</span>
                                                        <span className="text-sm font-bold text-gray-900 tabular-nums">
                                                            {Math.round(100 - score)}% Match
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-gray-500">Words Scanned</span>
                                                        <span className="text-xs font-medium text-gray-700 tabular-nums">{results.wordsScanned || 0}</span>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Matches List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {matchCount === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                    <p className="text-gray-600 font-medium">No matches found!</p>
                                    <p className="text-sm text-gray-500 mt-1">Your content appears original.</p>
                                </div>
                            ) : (
                                matches.map((match, index) => (
                                    <div
                                        key={match.id || index}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedMatch?.id === match.id
                                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                            }`}
                                        onClick={() => setSelectedMatch(match)}>
                                        {/* Match Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="text-xs text-gray-500 mb-1">Match #{index + 1}</div>
                                                <div className={`inline-block px-2 py-1 rounded text-xs font-bold ${(match.similarityScore || 0) >= 80
                                                    ? 'bg-red-100 text-red-700'
                                                    : (match.similarityScore || 0) >= 60
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {Math.round(match.similarityScore || 0)}% Similar
                                                </div>
                                            </div>
                                        </div>

                                        {/* Copyscape-Style Color Bar */}
                                        <div className="mb-3">
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${(match.similarityScore || 0) >= 80
                                                        ? 'bg-red-500'
                                                        : (match.similarityScore || 0) >= 60
                                                            ? 'bg-orange-500'
                                                            : 'bg-amber-400'
                                                        }`}
                                                    style={{ width: `${match.similarityScore || 0}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Match Preview */}
                                        <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                                            {match.sentenceText}
                                        </div>

                                        {/* Source */}
                                        <div className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 mb-2">
                                            <ExternalLink className="w-3 h-3" />
                                            <a href={match.sourceUrl} target="_blank" rel="noopener noreferrer" className="truncate">
                                                {new URL(match.sourceUrl || 'https://example.com').hostname}
                                            </a>
                                        </div>

                                        {/* Stats */}
                                        <div className="text-xs text-gray-500">
                                            {match.matchedWords} / {match.sourceWords} words ({match.matchPercent}% of source)
                                        </div>

                                        {/* Actions */}
                                        {match.viewUrl && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="w-full mt-3"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(match.viewUrl, '_blank');
                                                }}>
                                                <ExternalLink className="w-3 h-3 mr-2" />
                                                View Comparison
                                            </Button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        {config.label}: {config.desc}
                    </div>
                    <Button onClick={onClose}>Close Report</Button>
                </div>
            </div>
        </div>
    );
};
