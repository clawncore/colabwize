import React from "react";

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
    };
}

interface VerificationResultsPanelProps {
    results: VerificationResult[];
}

export const VerificationResultsPanel: React.FC<VerificationResultsPanelProps> = ({ results }) => {
    if (!results || results.length === 0) return null;

    const verified = results.filter(r => r.status === "VERIFIED");
    const failed = results.filter(r => r.status === "VERIFICATION_FAILED");
    const unmatched = results.filter(r => r.status === "UNMATCHED_REFERENCE");
    const insufficient = results.filter(r => r.status === "INSUFFICIENT_INFO");

    const getStatusColor = (status: string) => {
        switch (status) {
            case "VERIFIED": return "bg-green-100 border-green-300 text-green-800";
            case "VERIFICATION_FAILED": return "bg-red-100 border-red-300 text-red-800";
            case "UNMATCHED_REFERENCE": return "bg-yellow-100 border-yellow-300 text-yellow-800";
            case "INSUFFICIENT_INFO": return "bg-gray-100 border-gray-300 text-gray-700";
            default: return "bg-gray-100 border-gray-300";
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return "text-green-600 bg-green-50";
        if (score >= 50) return "text-yellow-600 bg-yellow-50";
        return "text-red-600 bg-red-50";
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
                                    <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-1.5 rounded truncate">
                                        Your Citation: "{result.inlineLocation.text}"
                                    </div>
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
                                    <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-1.5 rounded truncate">
                                        Ref: "{result.inlineLocation.text}"
                                    </div>
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

                {/* 3. Critical Errors (Not Found) */}
                {failed.some(f => f.similarity === undefined) && (
                    <div>
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Citation Errors
                        </h4>
                        <div className="space-y-3">
                            {failed.filter(f => f.similarity === undefined).map((result, idx) => (
                                <div key={idx} className="bg-white border border-l-4 border-l-red-500 border-gray-200 rounded-md p-3 shadow-sm">
                                    <div className="font-semibold text-sm text-red-700 mb-1">
                                        ❌ Source Not Found
                                    </div>
                                    <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                                        {result.message.replace("Paper not found in academic databases (CrossRef, arXiv, PubMed).", "We searched CrossRef, arXiv, and PubMed but found no matches.")}
                                    </p>
                                    <div className="text-[10px] font-mono text-gray-400 bg-gray-50 p-1.5 rounded truncate">
                                        Ref: "{result.inlineLocation.text}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
};
