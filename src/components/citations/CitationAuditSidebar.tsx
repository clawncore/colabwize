import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { BarChart, ArrowLeft, Search, AlertCircle, BookOpen } from "lucide-react";
import { CitationService } from "../../services/citationService";

interface CitationAuditSidebarProps {
    projectId: string;
    editor: Editor | null;
    onClose: () => void; // Function to switch back to document list
    onFindPapers: (keywords: string[]) => void;
    initialResults?: any;
}

export const CitationAuditSidebar: React.FC<CitationAuditSidebarProps> = ({
    projectId,
    editor,
    onClose,
    onFindPapers,
    initialResults
}) => {
    const [loading, setLoading] = useState(false);
    const [scanResults, setScanResults] = useState<{
        suggestions: {
            sentence: string;
            suggestion: string;
            type: "factual_claim" | "definition" | "statistic";
        }[];
    } | null>(initialResults || null);

    // Update results if initialResults changes (e.g. re-scan from outside)
    React.useEffect(() => {
        if (initialResults) {
            setScanResults(initialResults);
        }
    }, [initialResults]);

    const handleScanContent = async () => {
        try {
            setLoading(true);
            const content = editor?.getText() || "";
            if (!content) return;

            const results = await CitationService.scanContent(content, projectId);
            setScanResults(results);
        } catch (error) {
            console.error("Scan failed", error);
        } finally {
            setLoading(false);
        }
    };

    const extractKeywords = (sentence: string): string[] => {
        const stopWords = [
            "about", "above", "after", "again", "against", "all", "and", "any", "are", "aren't",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
            "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does",
            "doesn't", "doing", "don't", "down", "during", "each", "few", "for", "from", "further",
            "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll",
            "he's", "her", "here", "here's", "hers", "herself", "him", "himself", "his", "how",
            "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it",
            "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
            "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our",
            "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll",
            "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's", "the",
            "their", "theirs", "them", "themselves", "then", "there", "there's", "these", "they",
            "they'd", "they'll", "they're", "they've", "this", "those", "through", "to", "too",
            "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're",
            "we've", "were", "weren't", "what", "what's", "when", "when's", "where", "where's",
            "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
            "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself",
            "yourselves"
        ];

        return sentence
            .replace(/[^\w\s]/g, "")
            .split(/\s+/)
            .filter((w) => w.length > 3 && !stopWords.includes(w.toLowerCase()))
            .slice(0, 8);
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="mr-1 p-1 hover:bg-gray-200 rounded text-gray-500"
                        title="Back to Documents"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-purple-600" />
                        Citation Audit
                    </h2>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 mb-6">
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">
                        Find Missing Citations
                    </h3>
                    <p className="text-xs text-purple-700 mb-3">
                        Scan your content for factual claims, definitions, and statistics that may need citations.
                    </p>
                    <button
                        onClick={handleScanContent}
                        disabled={loading}
                        className="w-full py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? (
                            <>Scanning...</>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                Scan Document
                            </>
                        )}
                    </button>
                </div>

                {scanResults ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-900">
                                Audit Results ({scanResults.suggestions.length})
                            </h3>
                        </div>

                        {scanResults.suggestions.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                No missing citation signals found. Great job!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {scanResults.suggestions.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-sm">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide border ${item.type === "statistic"
                                                    ? "bg-orange-50 text-orange-700 border-orange-100"
                                                    : item.type === "factual_claim"
                                                        ? "bg-pink-50 text-pink-700 border-pink-100"
                                                        : "bg-blue-50 text-blue-700 border-blue-100"
                                                    }`}>
                                                {item.type.replace("_", " ")}
                                            </span>
                                        </div>

                                        <p className="text-gray-800 font-medium mb-2 leading-relaxed border-l-2 border-purple-300 pl-2">
                                            "{item.sentence}"
                                        </p>

                                        <div className="flex items-start gap-2 mb-3 bg-gray-50 p-2 rounded text-xs text-gray-600">
                                            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-500" />
                                            <span>{item.suggestion}</span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                const keywords = extractKeywords(item.sentence);
                                                onFindPapers(keywords);
                                            }}
                                            className="w-full py-1.5 bg-white border border-purple-200 text-purple-700 rounded text-xs font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-1.5">
                                            <BookOpen className="w-3 h-3" />
                                            Find Papers
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        Click "Scan Document" to analyze your text for potential missing citations.
                    </div>
                )}
            </div>
        </div>
    );
};
