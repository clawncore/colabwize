import React, { useState, useMemo } from "react";
import {
    Quote,
    Search,
    FileText,
    Filter,
    Plus,
    Unlock,
    MoreHorizontal
} from "lucide-react";
import { StoredCitation, SourceDetailPanel } from "./SourceDetailPanel";
import { CitationStylePopover } from "./CitationStylePopover";
import { CitationStyle } from "../../utils/citationFormatter";

interface SourcesLibraryPanelProps {
    citations: any[]; // The raw citations from the project object
    onInsertCitation?: (text: string, trackingInfo?: any) => void;
    onFindMore?: () => void; // Callback to open the search side panel (right)
}

export const SourcesLibraryPanel: React.FC<SourcesLibraryPanelProps> = ({
    citations = [],
    onInsertCitation,
    onFindMore,
}) => {
    const [selectedSource, setSelectedSource] = useState<StoredCitation | null>(null);
    const [filterQuery, setFilterQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"sources" | "collections">("sources");

    // Deduplicate and process citations
    const processedCitations = useMemo(() => {
        const uniqueMap = new Map<string, StoredCitation>();

        citations.forEach((c) => {
            // Create a unique key: DOI or Title+Year+FirstAuthor
            let key = c.doi;
            if (!key) {
                const titlePart = c.title?.toLowerCase().trim() || "";
                const yearPart = c.year || "";
                const authorPart = (typeof c.author === 'string' ? c.author : c.authors?.[0] || "").toLowerCase().trim();
                key = `${titlePart}-${yearPart}-${authorPart}`;
            }

            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, c);
            }
        });

        return Array.from(uniqueMap.values());
    }, [citations]);

    // Filter
    const filteredCitations = useMemo(() => {
        if (!filterQuery) return processedCitations;
        const q = filterQuery.toLowerCase();
        return processedCitations.filter((c) =>
            c.title?.toLowerCase().includes(q) ||
            (typeof c.author === 'string' && c.author.toLowerCase().includes(q)) ||
            (Array.isArray(c.authors) && c.authors.some((a: string) => a.toLowerCase().includes(q)))
        );
    }, [processedCitations, filterQuery]);

    const handleVisitSource = (source: StoredCitation, e: React.MouseEvent) => {
        e.stopPropagation();
        if (source.url || source.doi) {
            const targetUrl = source.url || `https://doi.org/${source.doi}`;
            window.open(targetUrl, "_blank", "noopener,noreferrer");
        }
    };

    // If a source is selected for DETAILS, show details
    if (selectedSource) {
        return (
            <SourceDetailPanel
                source={selectedSource}
                onBack={() => setSelectedSource(null)}
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="p-5 pb-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Library</h2>
                    {onFindMore && (
                        <button
                            onClick={onFindMore}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            title="Find and Add Sources"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search sources..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none bg-white"
                        value={filterQuery}
                        onChange={(e) => setFilterQuery(e.target.value)}
                    />
                </div>

                {/* Tabs & Filters */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex bg-gray-100/50 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab("sources")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "sources"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Sources
                        </button>
                        <button
                            onClick={() => setActiveTab("collections")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "collections"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Collections
                        </button>
                    </div>

                    <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-5">
                {filteredCitations.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">No sources found</h3>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                            {filterQuery ? "Try adjusting your search terms." : "Your library is empty. Start by adding references."}
                        </p>
                        {onFindMore && !filterQuery && (
                            <button
                                onClick={onFindMore}
                                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Find Sources
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredCitations.map((source, idx) => (
                            <div
                                key={idx}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 transition-all group"
                            >
                                {/* Card Header: Checkbox, Review, Badges */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-100" />
                                        <span className="text-xs font-medium text-gray-400">Review</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {source.impactFactor && (
                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                                                IF {source.impactFactor}
                                            </span>
                                        )}
                                        {(source.openAccess !== false) && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded uppercase border border-orange-100">
                                                <Unlock className="w-3 h-3" />
                                                Open Access
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <h3
                                    onClick={() => setSelectedSource(source)}
                                    className="text-base font-bold text-gray-900 mb-1 leading-snug cursor-pointer hover:text-blue-600 transition-colors"
                                >
                                    {source.title}
                                </h3>

                                {/* Authors */}
                                <p className="text-sm text-gray-500 mb-1 truncate">
                                    {Array.isArray(source.authors) ? source.authors.join(", ") : (source.author || "Unknown")}
                                </p>

                                {/* Journal / Year */}
                                <p className="text-sm font-medium text-teal-700 mb-4">
                                    {source.journal || "Source"} · {source.year}
                                </p>

                                {/* Add to Collection Button */}
                                <button className="w-full sm:w-auto mb-4 px-3 py-1.5 border border-dashed border-gray-300 rounded text-xs font-medium text-gray-600 flex items-center justify-center gap-1.5 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                                    <Plus className="w-3.5 h-3.5" />
                                    Add to collection
                                </button>

                                {/* Action Footer */}
                                <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                                    <CitationStylePopover
                                        source={source}
                                        onInsert={(inText, fullRef, style) => {
                                            if (onInsertCitation) {
                                                onInsertCitation(inText, {
                                                    eventId: "citation_inserted",
                                                    sourceId: source.doi || source.title,
                                                    style: style,
                                                    timestamp: new Date().toISOString(),
                                                    fullReferenceEntry: fullRef
                                                });
                                            }
                                        }}
                                    >
                                        <button
                                            onClick={(e) => e.stopPropagation()} // Prevent card click
                                            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors"
                                        >
                                            <Quote className="w-3.5 h-3.5 fill-current" />
                                            Cite
                                        </button>
                                    </CitationStylePopover>

                                    <button
                                        onClick={() => setSelectedSource(source)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors"
                                    >
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                        Details
                                    </button>

                                    <button
                                        onClick={(e) => handleVisitSource(source, e)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors ml-auto"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        Visit Source
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
