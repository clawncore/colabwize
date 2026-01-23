import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { BarChart, ArrowLeft, Search, AlertCircle, BookOpen } from "lucide-react";
import { CitationService } from "../../services/citationService";
import { runCitationAudit } from "../../services/citationAudit/citationAuditEngine";
import { AuditResult } from "../../services/citationAudit/types";

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
    initialResults,
    citationStyle
}) => {
    const [loading, setLoading] = useState(false);
    const [styleAuditResults, setStyleAuditResults] = useState<AuditResult | null>(null);
    const [scanResults, setScanResults] = useState<{
        suggestions: {
            sentence: string;
            suggestion: string;
            type: "factual_claim" | "definition" | "statistic";
        }[];
    } | null>(initialResults || null);

    // Update results if initialResults changes
    React.useEffect(() => {
        if (initialResults) {
            setScanResults(initialResults);
        }
    }, [initialResults]);

    const handleRunStyleAudit = () => {
        if (!citationStyle) return;
        const jsonContent = editor?.getJSON();
        if (jsonContent) {
            console.group("🔍 Citation Style Audit");
            console.log(`Analyzing for style: ${citationStyle}`);
            const results = runCitationAudit(jsonContent, citationStyle);
            console.log("Findings:", results.findings);
            console.groupEnd();
            setStyleAuditResults(results);
        }
    };

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
        // Semantic Search engines (Semantic Scholar) work best with natural language queries.
        // We'll pass the sentence directly, truncated to ~200 chars.

        let query = sentence.trim();
        if (query.length > 200) {
            query = query.substring(0, 200) + "...";
        }

        // Remove very specific punctuation that might break search
        query = query.replace(/[()[\]]/g, "");

        return [query];
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* ... Header ... */}
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

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* --- STYLE AUDIT SECTION --- */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-blue-900">
                            Style Compliance
                        </h3>
                        {citationStyle && (
                            <span className="text-[10px] font-bold uppercase bg-blue-200 text-blue-800 px-2 py-0.5 rounded">
                                {citationStyle}
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-blue-700 mb-3">
                        Check for formatting errors and inconsistencies with the {citationStyle || "selected"} style.
                    </p>

                    <button
                        onClick={handleRunStyleAudit}
                        disabled={!citationStyle}
                        title={!citationStyle ? "Select a citation style first" : "Run check"}
                        className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Run Style Audit
                    </button>

                    {/* Findings Display */}
                    {styleAuditResults && (
                        <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between text-xs font-medium text-blue-900 border-b border-blue-200 pb-1 mb-2">
                                <span>Results</span>
                                <span>{styleAuditResults.findings.length} Issues</span>
                            </div>

                            {styleAuditResults.findings.length === 0 ? (
                                <div className="text-xs text-green-700 flex items-center gap-2 bg-green-50 p-2 rounded border border-green-100">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    No style issues found.
                                </div>
                            ) : (
                                styleAuditResults.findings.map((finding, idx) => (
                                    <div key={idx} className="bg-white p-2.5 rounded border border-red-100 shadow-sm text-xs">
                                        <div className="flex items-start gap-2">
                                            {finding.type === 'error' ? (
                                                <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5" title="Error">
                                                    <span className="font-bold">!</span>
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5" title="Warning">
                                                    <span className="font-bold">i</span>
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <p className="text-gray-900 font-medium leading-snug mb-1">
                                                    {finding.message}
                                                </p>
                                                {finding.location?.textSnippet && (
                                                    <div className="bg-gray-50 px-2 py-1 rounded text-gray-500 font-mono text-[10px] truncate max-w-[200px] mb-1">
                                                        "{finding.location.textSnippet}"
                                                    </div>
                                                )}
                                                {finding.suggestion && (
                                                    <p className="text-blue-600 italic">
                                                        Tip: {finding.suggestion}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* --- EXISTING MISSING CITATIONS SECTION --- */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 mb-6">
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">
                        Find Missing Citations
                    </h3>
                    {/* ... existing content ... */}

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
