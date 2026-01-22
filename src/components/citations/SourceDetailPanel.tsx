import React from "react";
import { ArrowLeft, ExternalLink, BookOpen, Calendar, MapPin, Hash, ShieldCheck, Globe } from "lucide-react";

export interface StoredCitation {
    id?: string;
    title: string;
    author?: string; // Backend often stores as string
    authors?: string[]; // Frontend service uses array
    year?: number | string;
    journal?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    doi?: string;
    url?: string;
    source?: string;
    abstract?: string;
    citation_count?: number;
    impactFactor?: string | number;
    openAccess?: boolean;
    type?: string;
    formatted_citations?: any;
}

interface SourceDetailPanelProps {
    source: StoredCitation;
    onBack: () => void;
}

export const SourceDetailPanel: React.FC<SourceDetailPanelProps> = ({
    source,
    onBack,
}) => {
    // Normalize authors
    const getAuthors = () => {
        if (Array.isArray(source.authors)) return source.authors.join(", ");
        return source.author || "Unknown Author";
    };

    // Safe open link
    const handleVisitSource = () => {
        if (source.url || source.doi) {
            const targetUrl = source.url || `https://doi.org/${source.doi}`;
            window.open(targetUrl, "_blank", "noopener,noreferrer");
        }
    };


    const isOpenAccess = false; // We don't have this metadata explicitly yet, but could check type.

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                    onClick={onBack}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors"
                    title="Back to Library"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 truncate flex-1">
                    Source Details
                </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {/* Title & Provenance */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900 leading-snug mb-3">
                        {source.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 text-xs mb-4">
                        {/* Badges */}
                        {source.source === "arxiv" ? (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-medium border border-orange-200 uppercase tracking-wide">
                                Preprint
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium border border-blue-200 uppercase tracking-wide flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Peer-Reviewed
                            </span>
                        )}

                        {isOpenAccess && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-medium border border-green-200 uppercase tracking-wide flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Open Access
                            </span>
                        )}
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="space-y-4 mb-8">
                    <div className="flex gap-3">
                        <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Authors</span>
                            <p className="text-sm text-gray-800">{getAuthors()}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Year</span>
                            <p className="text-sm text-gray-800">{source.year || "N/A"}</p>
                        </div>
                    </div>

                    {(source.journal || source.source) && (
                        <div className="flex gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Venue / Source</span>
                                <p className="text-sm text-gray-800">
                                    {source.journal ? source.journal : (source.source || "Unknown")}
                                    {source.volume && `, Vol. ${source.volume}`}
                                    {source.issue && `, Issue ${source.issue}`}
                                    {source.pages && `, pp. ${source.pages}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {source.doi && (
                        <div className="flex gap-3">
                            <Hash className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">DOI</span>
                                <p className="text-sm text-gray-800 break-all font-mono">{source.doi}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Abstract Preview */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-900">Abstract preview</h3>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">(For verification only)</span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 relatiive group select-none">
                        {/* No select, no copy */}
                        <div className="select-none pointer-events-none">
                            <p className="text-sm text-gray-600 leading-relaxed font-serif relative">
                                {source.abstract ? (
                                    <>
                                        {source.abstract.slice(0, 400)}
                                        {source.abstract.length > 400 && "..."}
                                        {/* Fade effect overlay */}
                                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                                    </>
                                ) : (
                                    <span className="italic text-gray-400">No abstract available for this source.</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Reading and interpretation should be done at the source.
                    </p>
                </div>

                {/* External Action */}
                <button
                    onClick={handleVisitSource}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <ExternalLink className="w-4 h-4" />
                    Visit Source
                </button>
            </div>
        </div>
    );
};
