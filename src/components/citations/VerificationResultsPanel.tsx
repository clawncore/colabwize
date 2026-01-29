import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { CitationService } from "../../services/citationService";
import { Loader2, Check, RefreshCw, ArrowRight, ShieldCheck, ShieldAlert, BadgeCheck, FileQuestion } from "lucide-react";
import { useToast } from "../../hooks/use-toast";

// Updated Interface matching Backend
interface VerificationResult {
    inlineLocation: {
        start: number;
        end: number;
        text: string;
    };
    // AXIS 1: EXISTENCE
    existenceStatus: "CONFIRMED" | "NOT_FOUND" | "SERVICE_ERROR" | "PENDING";

    // AXIS 2: SUPPORT
    supportStatus: "SUPPORTED" | "PLAUSIBLE" | "UNRELATED" | "CONTRADICTORY" | "NOT_EVALUATED";

    provenance: { source: string; status: string }[];
    message: string;
    similarity?: number;

    foundPaper?: {
        title: string;
        year?: number;
        url: string;
        database: string;
        doi?: string;
        abstract?: string;
        isRetracted?: boolean;
    };
    semanticAnalysis?: {
        reasoning: string;
        confidence: number;
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

    // Filter Logic
    const confirmed = results.filter(r => r.existenceStatus === "CONFIRMED");
    const issues = results.filter(r => r.existenceStatus !== "CONFIRMED");

    // Grouping for Issues (Not Found vs Service Error)
    const notFound = issues.filter(r => r.existenceStatus === "NOT_FOUND");
    const otherIssues = issues.filter(r => r.existenceStatus !== "NOT_FOUND"); // Pending, Error

    const handleFindFix = async (result: VerificationResult, idx: number) => {
        setFixingIndex(idx);
        setFixCandidate(null);
        try {
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
            if (!fixCandidate) setFixingIndex(null);
        }
    };

    const handleApplyFix = (result: VerificationResult, candidate: any) => {
        if (!editor) return;
        const newText = `(${candidate.author}, ${candidate.year})`;
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
        setFixingIndex(null);
        setFixCandidate(null);
    };

    return (
        <section className="pt-2">
            {/* Header Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-gray-900">{confirmed.length}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">High Confidence</div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-amber-600">{
                        confirmed.filter(r => r.supportStatus === "PLAUSIBLE" || r.supportStatus === "UNRELATED").length
                    }</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Medium Confidence</div>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
                    <div className="text-2xl font-bold text-red-600">{
                        notFound.length + confirmed.filter(r => r.supportStatus === "CONTRADICTORY").length
                    }</div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Verification Limits</div>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. Confirmed Sources */}
                {confirmed.length > 0 && (
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                            <BadgeCheck className="w-4 h-4 text-green-600" />
                            High Confidence Sources
                        </h4>
                        <div className="space-y-3">
                            {confirmed.map((result, idx) => (
                                <div key={idx} className="bg-white border border-l-4 border-l-green-500 border-gray-200 rounded-md p-3 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-medium text-sm text-gray-900 line-clamp-1 pr-2">
                                            {result.foundPaper?.title}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {result.similarity !== undefined && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 whitespace-nowrap`}>
                                                    {(result.similarity * 100).toFixed(0)}% MATCH
                                                </span>
                                            )}
                                            {/* Provenance Badge */}
                                            {result.provenance && result.provenance.length > 0 && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 bg-gray-50">
                                                    via {result.provenance.map(p => p.source).join(", ")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-3 mb-2">
                                        <span>📅 {result.foundPaper?.year || 'N/A'}</span>
                                        <span>🌐 {result.foundPaper?.database}</span>
                                        {result.foundPaper?.doi && <span className="font-mono text-[9px]">DOI: {result.foundPaper.doi}</span>}
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-1.5 rounded truncate mb-2">
                                        Context: "{result.inlineLocation.text}"
                                    </div>

                                    {/* Semantic Support Badge - Key Upgrade */}
                                    {result.supportStatus !== "NOT_EVALUATED" && (
                                        <div className={`mt-2 p-2 rounded text-[11px] border flex flex-col gap-1 ${result.supportStatus === "SUPPORTED" ? "bg-green-50 border-green-100 text-green-800" :
                                            result.supportStatus === "CONTRADICTORY" ? "bg-red-50 border-red-100 text-red-800" :
                                                result.supportStatus === "UNRELATED" ? "bg-gray-50 border-gray-200 text-gray-600" :
                                                    "bg-amber-50 border-amber-100 text-amber-800"
                                            }`}>
                                            <div className="flex items-center gap-2 font-bold uppercase tracking-wide text-[9px]">
                                                {result.supportStatus === "SUPPORTED" && <ShieldCheck className="w-3 h-3" />}
                                                {result.supportStatus === "CONTRADICTORY" && <ShieldAlert className="w-3 h-3" />}
                                                {result.supportStatus === "PLAUSIBLE" && <FileQuestion className="w-3 h-3" />}
                                                SEMANTIC CHECK: {result.supportStatus.replace('_', ' ')}
                                            </div>
                                            <p className="leading-tight">{result.semanticAnalysis?.reasoning}</p>
                                            {result.semanticAnalysis?.confidence && (
                                                <div className="w-full bg-black/5 h-0.5 rounded-full mt-1 overflow-hidden">
                                                    <div className="bg-current h-full" style={{ width: `${result.semanticAnalysis.confidence * 100}%` }}></div>
                                                </div>
                                            )}
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

                {/* 2. Critical Errors (Not Found) */}
                {notFound.length > 0 && (
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Unverifiable Sources
                        </h4>
                        <div className="space-y-3">
                            {notFound.map((result, idx) => {
                                const isFixing = fixingIndex === idx;
                                const candidate = isFixing ? fixCandidate : null;

                                return (
                                    <div key={idx} className="bg-white border border-l-4 border-l-red-500 border-gray-200 rounded-md p-3 shadow-sm">
                                        <div className="font-semibold text-sm text-red-700 mb-1">
                                            ❌ Source Not Found
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                            {result.message}
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
                                                {isFixing && !fixCandidate ? "Searching..." : "Try Auto-Fix"}
                                            </button>
                                        ) : (
                                            <div className="bg-green-50 border border-green-200 rounded p-2 mt-2 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="text-[10px] font-bold text-green-800 uppercase mb-1 flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Potential Match Found
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
