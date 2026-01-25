import React, { useState, useMemo } from "react";
import {
    Quote,
    Search,
    FileText,
    Filter,
    Plus,
    Unlock,
    MoreHorizontal,
    Check,
    Bookmark,
    Trash2
} from "lucide-react";
import { CitationStyleFloatingPanel } from "./CitationStyleFloatingPanel";

import { CitationStyle } from "../../utils/citationFormatter";
import { CitationStylePopover } from "./CitationStylePopover";
import { SourceDetailPanel } from "./SourceDetailPanel";
import { StoredCitation } from "../../services/citationService";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../ui/alert-dialog";

interface SourcesLibraryPanelProps {
    citations: any[]; // The raw citations from the project object
    projectId?: string; // Added
    citationStyle?: string | null; // Added
    onInsertCitation?: (text: string, trackingInfo?: any) => void;
    onFindMore?: () => void; // Callback to open the search side panel (right)
    onStyleSet?: (style: string) => void; // Added
}

export const SourcesLibraryPanel: React.FC<SourcesLibraryPanelProps> = ({
    citations = [],
    projectId,
    citationStyle,
    onInsertCitation,
    onFindMore,
    onStyleSet
}) => {
    const [selectedSource, setSelectedSource] = useState<StoredCitation | null>(null);
    const [filterQuery, setFilterQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"sources" | "collections">("sources");
    const [showStylePanel, setShowStylePanel] = useState(false);
    const [isSavingStyle, setIsSavingStyle] = useState(false);
    const [collectionSet, setCollectionSet] = useState<Set<string>>(new Set());

    // Helper to generate unique key
    const getCitationKey = (c: StoredCitation) => {
        if (c.doi) return c.doi;
        const titlePart = c.title?.toLowerCase().trim() || "";
        const yearPart = c.year || "";
        const authorPart = (typeof c.author === 'string' ? c.author : c.authors?.[0] || "").toLowerCase().trim();
        return `${titlePart}-${yearPart}-${authorPart}`;
    };

    // Track which source triggered the style selection (to auto-cite after selection - optional)
    // For now we just set the style.

    // Deduplicate and process citations
    const processedCitations = useMemo(() => {
        const uniqueMap = new Map<string, StoredCitation>();

        citations.forEach((c) => {
            const key = getCitationKey(c);

            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, c);
            }
        });

        return Array.from(uniqueMap.values());
    }, [citations]);

    // Filter
    const filteredCitations = useMemo(() => {
        if (!filterQuery && activeTab === 'sources') return processedCitations;

        let baseList = processedCitations;

        // Filter by tab
        if (activeTab === 'collections') {
            baseList = processedCitations.filter(c => collectionSet.has(getCitationKey(c)));
        }

        if (!filterQuery) return baseList;

        const q = filterQuery.toLowerCase();
        return baseList.filter((c) =>
            c.title?.toLowerCase().includes(q) ||
            (typeof c.author === 'string' && c.author.toLowerCase().includes(q)) ||
            (Array.isArray(c.authors) && c.authors.some((a: string) => a.toLowerCase().includes(q)))
        );
    }, [processedCitations, filterQuery, activeTab, collectionSet]);

    const handleToggleCollection = (source: StoredCitation) => {
        const key = getCitationKey(source);
        const newSet = new Set(collectionSet);
        if (newSet.has(key)) {
            newSet.delete(key);
        } else {
            newSet.add(key);
        }
        setCollectionSet(newSet);
    };

    const handleVisitSource = (source: StoredCitation, e: React.MouseEvent) => {
        e.stopPropagation();
        if (source.url || source.doi) {
            const targetUrl = source.url || `https://doi.org/${source.doi}`;
            window.open(targetUrl, "_blank", "noopener,noreferrer");
        }
    };

    const handleStyleConfirm = async (style: CitationStyle) => {
        if (!projectId) return;
        setIsSavingStyle(true);
        try {
            // We need to fetch the current project state to avoid overwriting other fields?
            // documentService.updateProject takes all fields.
            // Ideally backend should support partial updates or we fetch first.
            // Assuming we accept the risk or use a dedicated method if available. 
            // Since updateProject requires all fields in the signature, we might need to fetch or trust parent to handle updateProject.
            // BUT: DocumentService frontend definition shows updateProject takes (id, title, desc, content, wordcount, style).
            // We don't have title/desc/content here.

            // Workaround: Call a new method "setCitationStyle" if it existed, or rely on parent callback to do the save.
            // If onStyleSet is provided, we delegate.
            if (onStyleSet) {
                // We trust parent to save. Detailed implementation checks:
                // EditorWorkspacePage has "handleProjectUpdate".
                // BUT EditorWorkspacePage needs to know to save to backend.

                // Let's assume onStyleSet handles the backend call.
                onStyleSet(style);
                setShowStylePanel(false);
            } else {
                // Fallback: try update if we had data, but we don't.
                console.warn("No handler for style set");
            }
        } catch (error) {
            console.error("Failed to set style", error);
        } finally {
            setIsSavingStyle(false);
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
        <>
            {/* Floating Citation Style Panel - positioned beside sidebar */}
            <CitationStyleFloatingPanel
                isOpen={showStylePanel}
                onConfirm={handleStyleConfirm}
                onClose={() => setShowStylePanel(false)}
                isSaving={isSavingStyle}
            />

            <div className="flex flex-col h-full bg-white relative">
                {/* Header */}
                <div className="p-5 pb-0">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Library</h2>

                        <div className="flex items-center gap-2">
                            {/* Current Style Indicator / Change Button */}
                            {citationStyle && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                                            title="Change Citation Style"
                                        >
                                            Style: {citationStyle}
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Change citation style?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Changing the citation style may cause inconsistencies in existing citations and references.
                                                A citation audit will be required before export.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => setShowStylePanel(true)}>
                                                Proceed
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}

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
                </div >

                {/* List Content */}
                < div className="flex-1 overflow-y-auto px-5 pb-5" >
                    {
                        filteredCitations.length === 0 ? (
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
                                {filteredCitations.map((source, idx) => {
                                    const isCollected = collectionSet.has(getCitationKey(source));
                                    return (
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
                                            {/* Add to Collection Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleCollection(source);
                                                }}
                                                className={`w-full sm:w-auto mb-4 px-3 py-1.5 border rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${isCollected
                                                    ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 group/btn"
                                                    : "border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {isCollected ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 group-hover/btn:hidden" />
                                                        <Trash2 className="w-3.5 h-3.5 hidden group-hover/btn:block" />
                                                        <span className="group-hover/btn:hidden">Added to collection</span>
                                                        <span className="hidden group-hover/btn:inline">Remove from collection</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-3.5 h-3.5" />
                                                        Add to collection
                                                    </>
                                                )}
                                            </button>

                                            {/* Action Footer */}
                                            <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
                                                {/* Interactive Cite Button Logic */}
                                                {!citationStyle ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowStylePanel(true);
                                                        }}
                                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors"
                                                    >
                                                        <Quote className="w-3.5 h-3.5 fill-current" />
                                                        Cite
                                                    </button>
                                                ) : (
                                                    <CitationStylePopover
                                                        source={source}
                                                        fixedStyle={citationStyle as CitationStyle}
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
                                                )}

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
                                    );
                                })}
                            </div>
                        )
                    }
                </div >
            </div>
        </>
    );
};
