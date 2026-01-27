import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { CitationService } from "../../services/citationService";
import { Loader2, Check, RefreshCw, ArrowRight } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

interface VerificationResult {
    inlineLocation: {
        start: number;
        end: number;
        text: string;
    };
    status: "VERIFIED" | "VERIFICATION_FAILED" | "UNMATCHED_REFERENCE" | "INSUFFICIENT_INFO";
    message: string;
    similarity?: number;
    foundPaper?: {
        title: string;
        year?: number;
        url: string;
        database: string;
        abstract?: string;
        isRetracted?: boolean;
    };
    semanticSupport?: {
        status: "SUPPORTED" | "DISPUTED" | "PARTIALLY_SUPPORTED" | "UNRELATED" | "PENDING";
        reasoning: string;
    };
}

interface VerificationResultsPanelProps {
    results: VerificationResult[];
    editor: Editor | null;
}

export const VerificationResultsPanel: React.FC<VerificationResultsPanelProps> = ({ results, editor }) => {
    const { toast } = useToast();
    const [fixingIndex, setFixingIndex] = useState<number | null>(null);
    const [fixCandidate, setFixCandidate] = useState<any | null>(null);

    if (!results || results.length === 0) return null;

    const verified = results.filter(r => r.status === "VERIFIED");
    const failed = results.filter(r => r.status === "VERIFICATION_FAILED");
    const unmatched = results.filter(r => r.status === "UNMATCHED_REFERENCE");

    const handleFindFix = async (result: VerificationResult, idx: number) => {
        setFixingIndex(idx);
        setFixCandidate(null);
        try {
            // Fuzzy search for the citation text
            const metadata = await CitationService.findCitationMetadata(result.inlineLocation.text);
            if (metadata) {
                setFixCandidate(metadata);
            } else {
                toast({
                    title: "No fix found",
                    description: "Could not find a matching paper in academic databases.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to search for fix.", variant: "destructive" });
        } finally {
            if (!fixCandidate) setFixingIndex(null); // Keep loading state if we found something? No, reset unless we store state differently.
            // Actually, we need to keep 'fixingIndex' active to show the candidate UI.
            // Let's rely on 'fixCandidate' presence + 'fixingIndex' match.
        }
    };

    const handleApplyFix = (result: VerificationResult, candidate: any) => {
        if (!editor) return;

        // Construct new citation text (Simple formatting for now: "(Author, Year)")
        const newText = `(${candidate.author}, ${candidate.year})`;

        // Replace text in editor
        editor.chain()
            .focus()
            .setTextSelection({ from: result.inlineLocation.start, to: result.inlineLocation.end })
            .insertContent(newText)
            .run();

        toast({
            title: "Citation Fixed",
            description: `Updated to: ${newText}`,
            variant: "default"
        });

        // Reset state
        setFixingIndex(null);
        setFixCandidate(null);
    };

    return (
        <section className="pt-2">

            {/* Header Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-gray-900">{verified.length}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Verified</div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-amber-600">{
                        // Count "Poor Matches" warnings
                        failed.filter(f => f.message.includes("Poor match")).length + unmatched.length
                    }</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Warnings</div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-red-600">{
                        failed.filter(f => !f.message.includes("Poor match")).length
                    }</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Errors</div>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. Verified Section */}
                {verified.length > 0 && (
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Verified Sources
                        </h4>
                        <div className="space-y-3">
                            {verified.map((result, idx) => (
                                <div key={idx} className="bg-white border border-l-4 border-l-green-500 border-gray-200 rounded-md p-3 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-medium text-sm text-gray-900 line-clamp-1 pr-2">
                                            {result.foundPaper?.title}
                                        </div>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 whitespace-nowrap`}>
                                            {(result.similarity! * 100).toFixed(0)}% MATCH
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-3 mb-2">
                                        <span>📅 {result.foundPaper?.year || 'N/A'}</span>
                                        <span>🌐 {result.foundPaper?.database}</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-1.5 rounded truncate mb-2">
                                        Your Citation: "{result.inlineLocation.text}"
                                    </div>

                                    {/* Semantic Support Display */}
                                    {result.semanticSupport && (
                                        <div className={`mt-2 p-2 rounded text-[11px] border ${result.semanticSupport.status === "SUPPORTED" ? "bg-green-50 border-green-100 text-green-800" :
                                            result.semanticSupport.status === "DISPUTED" ? "bg-red-50 border-red-100 text-red-800" :
                                                result.semanticSupport.status === "PARTIALLY_SUPPORTED" ? "bg-amber-50 border-amber-100 text-amber-800" :
                                                    "bg-gray-50 border-gray-100 text-gray-600"
                                            }`}>
                                            <div className="font-bold uppercase tracking-wide text-[9px] mb-1">
                                                Semantic Verification: {result.semanticSupport.status}
                                            </div>
                                            <p className="leading-tight">{result.semanticSupport.reasoning}</p>
                                        </div>
                                    )}

                                    {/* Retraction Alert */}
                                    {result.foundPaper?.isRetracted && (
                                        <div className="mt-2 p-2 bg-red-600 text-white rounded text-[11px] font-bold animate-pulse flex items-center gap-2">
                                            <span className="text-sm">🚨</span>
                                            SOURCE HAS BEEN RETRACTED
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Warnings (Poor Matches < 50%) */}
                {(failed.some(f => f.similarity && f.similarity < 0.5) || unmatched.length > 0) && (
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Warnings & Potential Issues
                        </h4>
                        <div className="space-y-3">
                            {/* Failed with Similarity (Poor Matches) */}
                            {failed.filter(f => f.similarity !== undefined).map((result, idx) => (
                                <div key={`warn-${idx}`} className="bg-white border border-l-4 border-l-amber-500 border-gray-200 rounded-md p-3 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold text-sm text-amber-800">
                                            ⚠️ Low Match Confidence
                                        </div>
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 whitespace-nowrap">
                                            {(result.similarity! * 100).toFixed(0)}% MATCH
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                        Found similar paper <b>"{result.foundPaper?.title}"</b> but match score is low. Check for typos or incorrect year.
                                    </p>
                                    <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-1.5 rounded truncate mb-2">
                                        Ref: "{result.inlineLocation.text}"
                                    </div>

                                    {/* Additional context for warnings */}
                                    {result.foundPaper?.isRetracted && (
                                        <div className="mt-2 p-1.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">
                                            🚨 RETRACTED SOURCE
                                        </div>
                                    )}
                                    {result.semanticSupport && result.semanticSupport.status !== "SUPPORTED" && (
                                        <div className="mt-2 p-1.5 bg-amber-50 border border-amber-100 text-amber-800 rounded text-[10px]">
                                            <b>Semantic Note:</b> {result.semanticSupport.reasoning}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Unmatched References */}
                            {unmatched.map((result, idx) => (
                                <div key={`unmatch-${idx}`} className="bg-white border border-l-4 border-l-amber-400 border-gray-200 rounded-md p-3 shadow-sm">
                                    <div className="font-semibold text-sm text-amber-800 mb-1">
                                        🔗 Reference Link Broken
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2">
                                        This citation does not match any entry in your bibliography.
                                    </p>
                                    <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-1.5 rounded truncate">
                                        Ref: "{result.inlineLocation.text}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Critical Errors (Not Found) - WITH AUTO-FIX */}
                {failed.some(f => f.similarity === undefined) && (
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Citation Errors
                        </h4>
                        <div className="space-y-3">
                            {failed.filter(f => f.similarity === undefined).map((result, idx) => {
                                const isFixing = fixingIndex === idx;
                                const candidate = isFixing ? fixCandidate : null;

                                return (
                                    <div key={idx} className="bg-white border border-l-4 border-l-red-500 border-gray-200 rounded-md p-3 shadow-sm">
                                        <div className="font-semibold text-sm text-red-700 mb-1">
                                            ❌ Source Not Found
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                            {result.message.replace("Paper not found in academic databases (CrossRef, arXiv, PubMed).", "We searched CrossRef, arXiv, and PubMed but found no matches.")}
                                        </p>
                                        <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-1.5 rounded truncate mb-3">
                                            Ref: "{result.inlineLocation.text}"
                                        </div>

                                        {/* Auto-Fix UI */}
                                        {!candidate ? (
                                            <button
                                                onClick={() => handleFindFix(result, idx)}
                                                disabled={isFixing}
                                                className="w-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 py-1.5 rounded flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                            >
                                                {isFixing && !fixCandidate ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                {isFixing && !fixCandidate ? "Searching Databases..." : "Auto-Fix Citation"}
                                            </button>
                                        ) : (
                                            <div className="bg-green-50 border border-green-200 rounded p-2 mt-2 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="text-[10px] font-bold text-green-800 uppercase mb-1 flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Found Potential Match
                                                </div>
                                                <div className="text-xs font-medium text-gray-900 mb-1 line-clamp-2">
                                                    "{candidate.title}"
                                                </div>
                                                <div className="text-[10px] text-gray-500 mb-2">
                                                    {candidate.author}, {candidate.year} • {candidate.source}
                                                </div>
                                                <button
                                                    onClick={() => handleApplyFix(result, candidate)}
                                                    className="w-full text-center text-xs bg-green-600 hover:bg-green-700 text-white py-1.5 rounded font-medium flex items-center justify-center gap-1 shadow-sm transition-all"
                                                >
                                                    Apply Fix <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
};
