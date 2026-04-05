import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Quote,
  Search,
  FileText,
  Plus,
  Unlock,
  MoreHorizontal,
  Check,
  Trash2,
  BookOpen,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { CitationStyleFloatingPanel } from "./CitationStyleFloatingPanel";
import { CitationStyle } from "../../utils/citationFormatter";
import { StoredCitation } from "../../services/citationService";
import { PDFAnnotator } from "../research/PDFAnnotator";
import { PDFService } from "../../services/pdfService";
import { ConfigService } from "../../services/ConfigService";
import { LiteratureMatrix } from "./LiteratureMatrix";
import { ZoteroLibraryPanel } from "./ZoteroLibraryPanel";
import { MendeleyLibraryPanel } from "./MendeleyLibraryPanel";
import { ZoteroIcon } from "../common/ZoteroIcon";
import { useAuth } from "../../hooks/useAuth";
import AccountService, { ActualUserAccount } from "../../services/accountService";
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
  onStyleSet?: (style: string) => void;
  activeTab: "sources" | "collections" | "matrix" | "zotero" | "mendeley";
  onSourceSelect: (source: StoredCitation | null) => void;
  selectedLibrarySource: StoredCitation | null;
  viewMode?: "split" | "full";
  onToggleViewMode?: () => void;
  onUpdateCitations?: (updatedCitations: any[]) => void;
  userPlan?: string;
}

export const SourcesLibraryPanel: React.FC<SourcesLibraryPanelProps> = ({
  citations = [],
  projectId,
  citationStyle,
  onInsertCitation,
  onFindMore,
  onStyleSet,
  activeTab,
  onSourceSelect,
  selectedLibrarySource,
  viewMode,
  onToggleViewMode,
  onUpdateCitations,
  userPlan,
}) => {
  const { user } = useAuth();
  const [extendedUser, setExtendedUser] = useState<ActualUserAccount | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title" | "impact">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [localCitations, setLocalCitations] =
    useState<StoredCitation[]>(citations); // Added for live sync
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [isSavingStyle, setIsSavingStyle] = useState(false);
  const [collectionSet, setCollectionSet] = useState<Set<string>>(new Set());
  const [viewerSource, setViewerSource] = useState<StoredCitation | null>(null);
  const [viewerAnnotations, setViewerAnnotations] = useState<any[]>([]);
  const [pendingCiteSource, setPendingCiteSource] =
    useState<StoredCitation | null>(null);

  // Sync local citations when prop changes
  useEffect(() => {
    setLocalCitations(citations);
  }, [citations]);

  // Fetch true database user profile for integration fields
  useEffect(() => {
    if (user) {
      AccountService.getUserAccount()
        .then((data) => setExtendedUser(data))
        .catch(console.error);
    }
  }, [user]);

  // Helper to generate unique key
  const getCitationKey = useCallback((c: StoredCitation) => {
    if (c.id) return c.id;
    if (c.doi) return c.doi;
    const titlePart = c.title?.toLowerCase().trim() || "";
    const yearPart = c.year || "";
    const authorPart = (
      typeof c.author === "string" ? c.author : c.authors?.[0] || ""
    )
      .toLowerCase()
      .trim();
    return `${titlePart}-${yearPart}-${authorPart}`;
  }, []);

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
  }, [citations, getCitationKey]);

  // Filter and Sort
  const filteredCitations = useMemo(() => {
    let baseList = processedCitations;

    // Filter by tab
    if (activeTab === "collections") {
      baseList = processedCitations.filter((c) =>
        collectionSet.has(getCitationKey(c)),
      );
    }

    let result = baseList;
    if (filterQuery) {
      const q = filterQuery.toLowerCase();
      result = baseList.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          (typeof c.author === "string" && c.author.toLowerCase().includes(q)) ||
          (Array.isArray(c.authors) &&
            c.authors.some((a: string) => a.toLowerCase().includes(q))),
      );
    }

    // Sort
    return [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = (a.title || "").localeCompare(b.title || "");
      } else if (sortBy === "impact") {
        const impactA = Number(a.impactFactor) || a.citationCount || 0;
        const impactB = Number(b.impactFactor) || b.citationCount || 0;
        comparison = impactB - impactA; // Descending natural
      } else {
        // "date" defaulting to newest first
        const tA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const tB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        if (tA && tB && tA !== tB) {
            comparison = tB - tA; // Descending natural
        } else {
            comparison = -1; // Reverse fallback: newer items are appended to the end, push them to top
        }
      }
      
      return sortOrder === "asc" ? -comparison : comparison;
    });
  }, [processedCitations, filterQuery, activeTab, collectionSet, getCitationKey, sortBy, sortOrder]);

  const handleToggleCollection = useCallback((source: StoredCitation) => {
    const key = getCitationKey(source);
    const newSet = new Set(collectionSet);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setCollectionSet(newSet);
  }, [collectionSet, getCitationKey]);

  const handleOpenViewer = useCallback(async (source: StoredCitation) => {
    setViewerSource(source);
    const id = source.doi || source.title;
    try {
      const annotations = await PDFService.getAnnotations(id);
      setViewerAnnotations(annotations);
    } catch (err) {
      setViewerAnnotations([]);
    }
  }, []);

  const handleStyleConfirm = useCallback(async (style: CitationStyle) => {
    if (!projectId) return;
    setIsSavingStyle(true);
    try {
      // Persist style to backend via parent callback
      if (onStyleSet) {
        onStyleSet(style);
        setShowStylePanel(false);

        // If we were waiting to cite a specific source, do it now
        if (pendingCiteSource && onInsertCitation) {
          const textToInsert =
            (pendingCiteSource as any)._formattedInText || "Citation";
          onInsertCitation(textToInsert, {
            eventId: "citation_inserted",
            sourceId:
              pendingCiteSource.id ||
              pendingCiteSource.doi ||
              pendingCiteSource.title,
            style: style,
            timestamp: new Date().toISOString(),
            fullReferenceEntry: pendingCiteSource,
          });
          setPendingCiteSource(null);
        }
      }
    } catch (error) {
      console.error("Failed to set style", error);
    } finally {
      setIsSavingStyle(false);
    }
  }, [projectId, onStyleSet, pendingCiteSource, onInsertCitation]);

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
        {/* Header - Hidden if Matrix or Integrations are active in split mode */}
        {activeTab !== "matrix" && activeTab !== "zotero" && activeTab !== "mendeley" && (
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
                        title="Change Citation Style">
                        Style: {citationStyle}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Change citation style?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Changing the citation style may cause inconsistencies
                          in existing citations and references. A citation audit
                          will be required before export.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => setShowStylePanel(true)}>
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
                    title="Find and Add Sources">
                    <Plus className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Bar & Sort */}
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sources..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none bg-white shadow-sm hover:border-blue-300"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2.5 text-sm font-medium border border-gray-200 rounded-lg outline-none bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all cursor-pointer shadow-sm appearance-none min-w-[130px]"
                title="Sort sources"
              >
                <option value="date">Date Added</option>
                <option value="title">Title A-Z</option>
                <option value="impact">Confidence / Impact</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                className="p-2.5 border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
                title={sortOrder === "desc" ? "Descending" : "Ascending"}
              >
                {sortOrder === "desc" ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* List Content */}
        <div
          className={`flex-1 overflow-y-auto ${activeTab === "matrix" ? "p-0" : "px-5 pb-5"}`}>
          {activeTab === "matrix" ? (
            viewMode === "full" ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Matrix in Full View
                </h3>
                <p className="text-sm text-gray-500">
                  The literature matrix is currently expanded to fill the
                  workspace for better visibility.
                </p>
              </div>
            ) : (
              <LiteratureMatrix
                sources={(localCitations as any) || []}
                projectId={projectId}
                onUpdateCitations={onUpdateCitations}
                userPlan={userPlan}
                viewMode={viewMode}
                onToggleViewMode={onToggleViewMode}
              />
            )
          ) : activeTab === "zotero" ? (
            <ZoteroLibraryPanel 
              projectId={projectId || ""} 
              isConnected={!!extendedUser?.zotero_user_id}
              onImportSuccess={() => {
                // Potential callback to parent to reload main library
                window.dispatchEvent(new CustomEvent('reloadProjectCitations'));
              }}
              onSourceSelect={onSourceSelect}
              citations={localCitations}
              onInsertCitation={onInsertCitation}
              citationStyle={citationStyle}
            />
            /* 
          ) : activeTab === "mendeley" ? (
            <MendeleyLibraryPanel 
              projectId={projectId || ""} 
              isConnected={!!extendedUser?.mendeley_access_token}
              onImportSuccess={() => {
                window.dispatchEvent(new CustomEvent('reloadProjectCitations'));
              }}
              onSourceSelect={onSourceSelect}
              citations={localCitations}
              onInsertCitation={onInsertCitation}
              citationStyle={citationStyle}
            />
            */
          ) : filteredCitations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                No sources found
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
                {filterQuery
                  ? "Try adjusting your search terms."
                  : "Your library is empty. Start by adding references."}
              </p>
              {onFindMore && !filterQuery && (
                <button
                  onClick={onFindMore}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
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
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 transition-all group">
                    {/* Card Header: Checkbox, Review, Badges */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-100"
                        />
                        <span className="text-xs font-medium text-gray-400">
                          Review
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Source Origin Icon Badge (icon-only, name on hover) */}
                        {(() => {
                          const src = (source as any).source || (source as any).metadata?.source || "";
                          if (src === "Zotero" || src === "zotero") return (
                            <span title="Zotero" className="flex items-center justify-center w-5 h-5 bg-red-50 border border-red-100 rounded p-0.5">
                              <ZoteroIcon className="w-full h-full" />
                            </span>
                          );
                          /* 
                          if (src === "Mendeley" || src === "mendeley") return (
                            <span title="Mendeley" className="flex items-center justify-center w-5 h-5 bg-blue-50 border border-blue-100 rounded text-blue-600 font-black text-[10px]">
                              M
                            </span>
                          );
                          */
                          if (src && src !== "") return (
                            <span title={src} className="flex items-center justify-center w-5 h-5 bg-teal-50 border border-teal-100 rounded text-teal-600">
                              <BookOpen className="w-3 h-3" />
                            </span>
                          );
                          return null;
                        })()}
                        {source.impactFactor && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                            IF {source.impactFactor}
                          </span>
                        )}
                        {source.openAccess !== false && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded uppercase border border-orange-100">
                            <Unlock className="w-3 h-3" />
                            Open Access
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSourceSelect(source)}
                      className="text-base font-bold text-gray-900 mb-1 leading-snug cursor-pointer hover:text-blue-600 transition-colors">
                      {source.title}
                    </h3>

                    {/* Authors */}
                    <p className="text-sm text-gray-500 mb-1 truncate">
                      {Array.isArray(source.authors)
                        ? source.authors.join(", ")
                        : source.author || "Unknown"}
                    </p>

                    {/* Journal / Year */}
                    <p className="text-sm font-medium text-teal-700 mb-4">
                      {source.journal || "Source"} · {source.year}
                    </p>

                    {/* Add to Collection Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCollection(source);
                      }}
                      className={`w-full sm:w-auto mb-4 px-3 py-1.5 border rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                        isCollected
                          ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 group/btn"
                          : "border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                      }`}>
                      {isCollected ? (
                        <>
                          <Check className="w-3.5 h-3.5 group-hover/btn:hidden" />
                          <Trash2 className="w-3.5 h-3.5 hidden group-hover/btn:block" />
                          <span className="group-hover/btn:hidden">
                            Added to collection
                          </span>
                          <span className="hidden group-hover/btn:inline">
                            Remove from collection
                          </span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Add to collection
                        </>
                      )}
                    </button>

                    {/* Action Footer */}
                    <div className="flex flex-wrap items-center gap-3 gap-y-2 pt-2 border-t border-gray-50">
                      {/* Interactive Cite Button Logic */}
                      {(() => {
                        const authors = Array.isArray(source.authors)
                          ? source.authors
                          : source.author
                            ? [source.author]
                            : [];
                        const getLastName = (a: any): string => {
                          let extracted = "Author";
                          if (typeof a === "string") {
                            const trimmed = a.trim();
                            if (trimmed.includes(","))
                              extracted = trimmed.split(",")[0].trim();
                            else {
                              const parts = trimmed.split(" ").filter(Boolean);
                              if (parts.length === 2) extracted = parts[1];
                              else extracted = trimmed;
                            }
                          } else if (typeof a === "object" && a !== null) {
                            extracted =
                              a.lastName ||
                              a.family ||
                              a.literal ||
                              a.name ||
                              a.firstName ||
                              a.given ||
                              "Author";
                          }

                          if (extracted.length > 25) {
                            extracted = extracted
                              .split(" ")[0]
                              .replace(/[^a-zA-Z-]/g, "");
                          }
                          return extracted || "Author";
                        };

                        let authorText = "Author";
                        if (authors.length === 1)
                          authorText = getLastName(authors[0]);
                        else if (authors.length === 2)
                          authorText = `${getLastName(authors[0])} & ${getLastName(authors[1])}`;
                        else if (authors.length > 2)
                          authorText = `${getLastName(authors[0])} et al.`;

                        const year = source.year || "n.d.";
                        const inTextText = `(${authorText}, ${year})`;
                        const activeStyle = citationStyle || "APA";

                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onInsertCitation) {
                                onInsertCitation(inTextText, {
                                  eventId: "citation_inserted",
                                  sourceId:
                                    source.id || source.doi || source.title,
                                  style: activeStyle,
                                  timestamp: new Date().toISOString(),
                                  fullReferenceEntry: source,
                                });
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap">
                            <Quote className="w-3.5 h-3.5 fill-current" />
                            Cite
                          </button>
                        );
                      })()}

                      <button
                        onClick={() => onSourceSelect(source)}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                        Details
                      </button>

                      {(() => {
                        const url = source.url || "";
                        const isPdf =
                          url.toLowerCase().endsWith(".pdf") ||
                          url.startsWith("blob:");

                        if (isPdf) {
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenViewer(source);
                              }}
                              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap">
                              <FileText className="w-3.5 h-3.5" />
                              Read Paper
                            </button>
                          );
                        } else if (url) {
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(url, "_blank");
                              }}
                              className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 transition-colors whitespace-nowrap">
                              <FileText className="w-3.5 h-3.5" />
                              Visit Website
                            </button>
                          );
                        } else {
                          // No URL available
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PDF Viewer Portal */}
        {viewerSource && (
          <PDFAnnotator
            // Use proxy for external URLs to avoid CORS
            fileUrl={(() => {
              const url = viewerSource.url || "";
              if (!url) return "";
              if (
                url.startsWith("blob:") ||
                url.includes(window.location.hostname)
              )
                return url;
              // Proxy external URLs through backend
              return `${ConfigService.getApiUrl()}/api/proxy/pdf?url=${encodeURIComponent(url)}`;
            })()}
            authToken={localStorage.getItem("auth_token") || undefined}
            fileId={viewerSource.doi || viewerSource.title}
            title={viewerSource.title}
            onClose={() => setViewerSource(null)}
            initialAnnotations={viewerAnnotations}
            onSaveAnnotations={async (anns) => {
              const fileId = viewerSource.doi || viewerSource.title;
              try {
                // For MVP, we save each annotation.
                // In production, we'd batch these.
                for (const ann of anns) {
                  if (!ann.id) {
                    // Only save new ones
                    await PDFService.saveAnnotation({
                      file_id: fileId,
                      type: ann.type,
                      content: ann.content,
                      color: ann.color,
                      coordinates: ann.coordinates,
                    });
                  }
                }
                // Refresh local state
                const fresh = await PDFService.getAnnotations(fileId);
                setViewerAnnotations(fresh);
              } catch (err) {
                console.error("Failed to persistent annotations", err);
              }
            }}
          />
        )}
      </div>
    </>
  );
};
