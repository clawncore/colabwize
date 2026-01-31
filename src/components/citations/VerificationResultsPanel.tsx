
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
    onAddSource?: (source: any) => Promise<void>;
}

export const VerificationResultsPanel: React.FC<VerificationResultsPanelProps> = ({ results, editor, onAddSource }) => {
    const { toast } = useToast();
    const [fixingIndex, setFixingIndex] = useState<number | null>(null);
    const [fixCandidate, setFixCandidate] = useState<any | null>(null);

    if (!results || results.length === 0) return null;

    const confirmed = results.filter(r => r.existenceStatus === "CONFIRMED");
    const issues = results.filter(r => r.existenceStatus !== "CONFIRMED");
    const notFound = issues.filter(r => r.existenceStatus === "NOT_FOUND");

    const handleFindFix = async (result: VerificationResult, idx: number) => {
        setFixingIndex(idx);
        setFixCandidate(null);
        try {
            const metadata = await CitationService.findCitationMetadata(result.inlineLocation.text);
            if (metadata) {
                setFixCandidate(metadata);
                // Keep fixingIndex active to show the result
            } else {
                toast({
                    title: "No fix found",
                    description: "Could not find a matching paper in academic databases.",
                    variant: "destructive"
                });
                setFixingIndex(null); // Reset only on failure
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to search for fix.", variant: "destructive" });
            setFixingIndex(null); // Reset on error
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
        <section className="space-y-8">
            {/* 1. Confirmed Sources */}
            {confirmed.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5e7eb]">
                        <h4 className="text-sm font-bold text-[#111827]">High Confidence Sources</h4>
                        <span className="bg-[#f0fdf4] text-[#16a34a] text-xs font-medium px-2 py-0.5 rounded-full border border-[#bbf7d0]">
                            {confirmed.length} Found
                        </span>
                    </div>

                    <div className="space-y-4">
                        {confirmed.map((result, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 pr-4">
                                        <div className="text-xs font-bold text-[#16a34a] mb-1">VERIFIED SOURCE</div>
                                        <div className="font-semibold text-sm text-[#111827] line-clamp-2 leading-relaxed">
                                            {result.foundPaper?.title}
                                        </div>
                                    </div>
                                    {result.similarity !== undefined && (
                                        <div className="bg-[#f0fdf4] text-[#15803d] text-xs font-bold px-2 py-1 rounded border border-[#bbf7d0]">
                                            {(result.similarity * 100).toFixed(0)}% MATCH
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 mb-3 text-xs text-[#6b7280]">
                                    <span>{result.foundPaper?.year || 'N/A'}</span>
                                    <span>•</span>
                                    <span>{result.foundPaper?.database}</span>
                                    {result.foundPaper?.doi && (
                                        <>
                                            <span>•</span>
                                            <span className="font-mono text-[10px]">{result.foundPaper.doi}</span>
                                        </>
                                    )}
                                </div>

                                <div className="text-xs font-mono text-[#6b7280] bg-[#f8fafc] p-2 rounded-lg border border-[#e5e7eb] mb-3">
                                    "{result.inlineLocation.text}"
                                </div>

                                {/* Semantic Support - Subtle */}
                                {result.supportStatus !== "NOT_EVALUATED" && (
                                    <div className={`mt-3 p-3 rounded-lg text-sm border flex gap-3 items-start ${result.supportStatus === "SUPPORTED" ? "bg-[#f0fdf4] border-[#dcfce7]" :
                                        result.supportStatus === "CONTRADICTORY" ? "bg-[#fef2f2] border-[#fecaca]" :
                                            "bg-[#fffbeb] border-[#fde68a]"
                                        }`}>
                                        <div className="mt-0.5">
                                            {result.supportStatus === "SUPPORTED" && <ShieldCheck className="w-4 h-4 text-[#16a34a]" />}
                                            {result.supportStatus === "CONTRADICTORY" && <ShieldAlert className="w-4 h-4 text-[#dc2626]" />}
                                            {result.supportStatus === "PLAUSIBLE" && <FileQuestion className="w-4 h-4 text-[#d97706]" />}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wide opacity-80 mb-0.5" style={{
                                                color:
                                                    result.supportStatus === "SUPPORTED" ? "#166534" :
                                                        result.supportStatus === "CONTRADICTORY" ? "#991b1b" : "#92400e"
                                            }}>
                                                {result.supportStatus.replace('_', ' ')}
                                            </div>
                                            <p className="text-[#374151] text-xs leading-relaxed">{result.semanticAnalysis?.reasoning}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Retraction Alert */}
                                {result.foundPaper?.isRetracted && (
                                    <div className="mt-3 p-3 bg-[#fee2e2] text-[#991b1b] rounded-lg text-xs font-bold flex items-center gap-2 border border-[#fca5a5]">
                                        <ShieldAlert className="w-4 h-4" />
                                        SOURCE RETRACTED
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Unverifiable Sources */}
            {notFound.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5e7eb]">
                        <h4 className="text-sm font-bold text-[#111827]">Unverifiable Sources</h4>
                        <span className="bg-[#fef2f2] text-[#dc2626] text-xs font-medium px-2 py-0.5 rounded-full border border-[#fecaca]">
                            {notFound.length} Issue{notFound.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {notFound.map((result, idx) => {
                            const isFixing = fixingIndex === idx;
                            const candidate = isFixing ? fixCandidate : null;

                            return (
                                <div key={idx} className="bg-white rounded-xl border border-[#e5e7eb] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="text-xs font-bold text-[#dc2626] mb-1 flex items-center gap-1">
                                                <ShieldAlert className="w-3 h-3" /> SOURCE NOT FOUND
                                            </div>
                                            <p className="text-sm text-[#374151] leading-relaxed">
                                                {result.message}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="font-mono text-xs text-[#6b7280] bg-[#f8fafc] p-2 rounded-lg border border-[#e5e7eb] mt-3 mb-4">
                                        Ref: "{result.inlineLocation.text}"
                                    </div>

                                    {/* Quiet Action Button */}
                                    {!candidate ? (
                                        <button
                                            onClick={() => handleFindFix(result, idx)}
                                            disabled={isFixing}
                                            className="w-full py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] border border-[#e5e7eb] rounded-lg text-sm font-medium text-[#111827] flex items-center justify-center gap-2 transition-colors"
                                        >
                                            {isFixing && !fixCandidate ? <Loader2 className="w-4 h-4 animate-spin text-[#6b7280]" /> : <RefreshCw className="w-4 h-4" />}
                                            {isFixing && !fixCandidate ? "Searching..." : "Search Academic Databases"}
                                        </button>
                                    ) : (
                                        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="text-xs font-bold text-[#15803d] uppercase mb-1 flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Potential Match
                                            </div>
                                            <div className="text-sm font-medium text-[#111827] mb-1">
                                                "{candidate.title}"
                                            </div>
                                            <div className="text-xs text-[#6b7280] mb-3">
                                                {candidate.author}, {candidate.year} • {candidate.source}
                                            </div>
                                            <div className="flex flex-col gap-2 mt-2">
                                                {onAddSource ? (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await onAddSource(candidate);
                                                                setFixingIndex(null);
                                                                setFixCandidate(null);
                                                                toast({
                                                                    title: "Added to Library",
                                                                    description: "Source saved to 'Audit Results' collection.",
                                                                    variant: "default"
                                                                });
                                                            } catch (e) {
                                                                toast({
                                                                    title: "Error",
                                                                    description: "Failed to add source.",
                                                                    variant: "destructive"
                                                                });
                                                            }
                                                        }}
                                                        className="w-full py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
                                                    >
                                                        <BadgeCheck className="w-4 h-4" /> Add to Library
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleApplyFix(result, candidate)}
                                                        className="w-full py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1 shadow-sm transition-colors"
                                                    >
                                                        Apply Correction <ArrowRight className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </section>
    );
};
