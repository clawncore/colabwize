
import React, { useState } from "react";
import { OriginalityScan, SimilarityMatch } from "../../services/originalityService";

import { X, Shield, ExternalLink, CheckCircle, Globe } from "lucide-react";


interface OriginalityReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: OriginalityScan;
    documentContent: string;
    onAskAI?: (prompt: string, hiddenCtx: string) => void;
}

export const OriginalityReportModal: React.FC<OriginalityReportModalProps> = ({
    isOpen,
    onClose,
    results,
    documentContent,
    onAskAI
}) => {
    const [selectedMatch, setSelectedMatch] = useState<SimilarityMatch | null>(null);

    if (!isOpen) return null;

    const score = results.overallScore ?? 0;
    const matchCount = results.matchCount ?? 0;
    const matches = results.matches || [];

    // Helper to get highlighted content
    const getHighlightedContent = () => {
        if (!documentContent || matches.length === 0) return documentContent;

        const sortedMatches = [...matches].sort((a, b) => a.positionStart - b.positionStart);

        let highlightedHTML = "";
        let lastIndex = 0;

        sortedMatches.forEach((match) => {
            const start = match.positionStart || 0;
            const end = match.positionEnd || start;

            highlightedHTML += escapeHtml(documentContent.substring(lastIndex, start));

            const similarityScore = match.similarityScore || 0;

            // UARS: Tinted Highlights (No borders)
            let bgClass = "bg-[#f1f5f9]"; // Low
            if (similarityScore >= 80) bgClass = "bg-[rgba(220,38,38,0.15)]"; // High
            else if (similarityScore >= 60) bgClass = "bg-[rgba(245,158,11,0.18)]"; // Medium

            highlightedHTML += `<mark class="${bgClass} rounded-[2px] cursor-pointer hover:bg-opacity-100 transition-colors" data-match-id="${match.id || ''}" title="${similarityScore}% similar">${escapeHtml(documentContent.substring(start, end))}</mark>`;

            lastIndex = end;
        });

        highlightedHTML += escapeHtml(documentContent.substring(lastIndex));
        return highlightedHTML;
    };

    const escapeHtml = (text: string) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] font-sans">
            <div className="w-full h-full max-w-[95vw] max-h-[95vh] bg-[#f8fafc] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#e5e7eb]">
                {/* Header: Forensic Masthead */}
                <div className="bg-gradient-to-r from-slate-50 to-white border-b border-[#e5e7eb] px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h1 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#4f46e5]" />
                            Forensic Originality Report
                        </h1>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[#6b7280] uppercase tracking-wide font-medium">
                            <span>{new Date().toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Forensic Mode</span>
                            <span>•</span>
                            <span>ID: {results.id || 'SCAN-001'}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors text-[#6b7280]"
                        title="Close">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Highlighted Document (Archival View) */}
                    <div className="flex-1 border-r border-[#e5e7eb] flex flex-col bg-white relative">
                        {/* Watermark/Background Feel */}
                        <div className="absolute inset-0 bg-white pointer-events-none z-0" />

                        {/* Document Content */}
                        <div className="flex-1 overflow-y-auto p-12 font-serif leading-loose text-[16px] text-[#111827] z-10 max-w-4xl mx-auto w-full shadow-[0_0_40px_rgba(0,0,0,0.02)] my-4 bg-white">
                            <div
                                className="whitespace-pre-wrap select-text selection:bg-[#cbd5e1]"
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
                    </div>

                    {/* Right: Evidence Panel */}
                    <div className="w-[420px] flex flex-col bg-[#f8fafc] border-l border-[#e5e7eb]">

                        {/* Summary & Legend */}
                        <div className="p-6 border-b border-[#e5e7eb] bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-[#111827]">Scan Summary</h2>
                                <span className={`text-lg font-bold`} style={{ color: score < 80 ? '#dc2626' : '#16a34a' }}>
                                    {Math.round(100 - score)}% Similarity
                                </span>
                            </div>

                            {/* Simple Bar */}
                            <div className="h-2 w-full bg-[#f1f5f9] rounded-full overflow-hidden mb-6">
                                <div className="h-full bg-[#dc2626]" style={{ width: `${100 - score}%` }}></div>
                            </div>

                            {/* Legend (Moved Here) */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-[2px] bg-[rgba(220,38,38,0.15)] ring-1 ring-[#dc2626]/20"></div>
                                    <span className="text-xs font-medium text-[#374151]">High Criticality</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-[2px] bg-[rgba(245,158,11,0.18)] ring-1 ring-[#f59e0b]/20"></div>
                                    <span className="text-xs font-medium text-[#374151]">Moderate Risk</span>
                                </div>
                            </div>
                        </div>

                        {/* Evidence Stream */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
                            <h3 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-4">Evidence Records ({matchCount})</h3>

                            <div className="space-y-4">
                                {matchCount === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-[#e5e7eb] rounded-xl bg-white/50">
                                        <CheckCircle className="w-10 h-10 text-[#16a34a] mx-auto mb-3 opacity-50" />
                                        <p className="text-[#374151] font-medium text-sm">No Evidence Found</p>
                                        <p className="text-[#9ca3af] text-xs mt-1">Document appears to be original.</p>
                                    </div>
                                ) : (
                                    matches.map((match, index) => (
                                        <div
                                            key={match.id || index}
                                            className={`p-5 rounded-[10px] border transition-all cursor-pointer bg-white group ${selectedMatch?.id === match.id
                                                ? 'border-[#4f46e5] shadow-md'
                                                : 'border-[#e5e7eb] shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-[#cbd5e1]'
                                                }`}
                                            onClick={() => setSelectedMatch(match)}>

                                            {/* Record Header - Textual Severity */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <div className="text-sm font-bold text-[#111827]">
                                                        Similarity: {Math.round(match.similarityScore || 0)}%
                                                        <span className="ml-2 font-normal text-[#6b7280]">
                                                            ({(match.similarityScore || 0) >= 80 ? 'High' : (match.similarityScore || 0) >= 60 ? 'Moderate' : 'Low'})
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-[#4f46e5] mt-0.5">
                                                        <Globe className="w-3 h-3" />
                                                        <span className="truncate max-w-[200px] hover:underline">
                                                            {match.sourceUrl ? new URL(match.sourceUrl).hostname : 'External Source'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Data Grid */}
                                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-[#6b7280] mb-4 bg-[#f8fafc] p-3 rounded-lg border border-[#f1f5f9]">
                                                <div>
                                                    <span className="block text-[10px] uppercase font-bold text-[#9ca3af]">Overlap</span>
                                                    <span className="text-[#111827] font-medium">{match.matchedWords} / {match.sourceWords} words</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] uppercase font-bold text-[#9ca3af]">Classification</span>
                                                    <span className="text-[#111827] font-medium">{(match.similarityScore || 0) > 90 ? "Verbatim" : "Paraphrased"}</span>
                                                </div>
                                            </div>

                                            {/* Detailed Context (Only if Selected or High) */}
                                            <div className="text-xs text-[#374151] italic line-clamp-2 leading-relaxed opacity-80 pl-2 border-l-2 border-[#e5e7eb]">
                                                "{match.sentenceText}"
                                            </div>

                                            {/* Actions */}
                                            {(match.sourceUrl || match.viewUrl) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(match.sourceUrl || match.viewUrl, '_blank');
                                                    }}
                                                    className="mt-4 w-full py-2 bg-white border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#374151] hover:bg-[#f8fafc] flex items-center justify-center gap-2 transition-colors shadow-sm"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> View Evidence
                                                </button>
                                            )}

                                            {/* AI Explain Button */}
                                            {onAskAI && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const prompt = `Explain why the following text was flagged as ${match.similarityScore}% similar to "${match.sourceUrl || "External Source"}". \n\nFlagged Text: "${match.sentenceText}"\n\nIs this a problem?`;
                                                        const hiddenCtx = `The user is asking about a specific similarity match. Analyzer classification: ${match.classification}. Source words: ${match.sourceWords}. Overlap: ${match.matchedWords}.`;
                                                        onAskAI(prompt, hiddenCtx);
                                                        onClose(); // Close modal so they see the chat
                                                    }}
                                                    className="mt-2 w-full py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-medium text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-2 transition-colors shadow-sm"
                                                >
                                                    <Shield className="w-3 h-3" /> Explain with AI
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
