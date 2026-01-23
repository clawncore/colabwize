import React, { useState } from "react";
import { useToast } from "../../hooks/use-toast";
import { Search, Loader2 } from "lucide-react";
import {
  SuggestedPaper,
  CitationService,
} from "../../services/citationService";


interface PaperSuggestionsPanelProps {
  projectId: string;
  onClose: () => void;
  // Optional pre-loaded suggestions
  initialSuggestions?: SuggestedPaper[];
  // Context keywords if we want to auto-search
  contextKeywords?: string[];
  onInsertCitation?: (text: string) => void;
  onSourceAdded?: () => void;
}

export const PaperSuggestionsPanel: React.FC<PaperSuggestionsPanelProps> = ({
  projectId,
  onClose,
  initialSuggestions = [],
  contextKeywords = [],
  onInsertCitation,
  onSourceAdded,
}) => {
  const { toast } = useToast();
  const [suggestedPapers, setSuggestedPapers] =
    useState<SuggestedPaper[]>(initialSuggestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [addedPaperIds, setAddedPaperIds] = useState<Set<string>>(new Set());

  // Removed auto-search useEffect and isLoadingInitial as per requirements to make this a passive "Sources" panel.

  const handleManualSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await CitationService.searchPapers(searchQuery);
      setSuggestedPapers(results || []);
    } catch (error: any) {
      console.error("Search failed:", error);

      const isLimitError = error.response?.status === 403 || error.message?.includes("limit");

      toast({
        title: isLimitError ? "Search Limit Reached" : "Search Failed",
        description: isLimitError
          ? "You have reached your monthly paper search limit. Please upgrade your plan or buy credits."
          : "Failed to search for papers. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddSource = async (paper: SuggestedPaper) => {
    try {
      // Use DOI as ID if available, else title
      const paperId = paper.doi || paper.title;

      await CitationService.addCitation(projectId, {
        ...paper,
        citationCount: paper.citationCount
      });

      // Mark as added
      setAddedPaperIds(prev => new Set(prev).add(paperId));

      if (onSourceAdded) {
        onSourceAdded();
      }

      // Source added silently - no need to confirm obvious actions

      // We do NOT remove it from the list, just mark as added.
      // We do NOT insert it into the text.
    } catch (error) {
      console.error("Failed to add citation", error);
      alert("Failed to add source. Please try again.");
    }
  };

  const hasSuggestions =
    Array.isArray(suggestedPapers) && suggestedPapers.length > 0;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-cyan-600 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Sources</h2>
            <p className="text-blue-100 text-xs mt-1">
              Manage and verify references used in this document.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold">
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Manual Search */}
        <form onSubmit={handleManualSearch} className="mb-6">
          <p className="text-xs text-gray-500 mb-2">
            Search scholarly databases to locate existing publications and store citation metadata.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Title, author, or keyword..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        {hasSuggestions ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Found {suggestedPapers!.length} Sources
            </h3>
            <div className="space-y-4">
              {suggestedPapers!.map((paper, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm leading-tight">
                        {paper.title}
                      </h4>
                      <p className="text-xs text-gray-500 mb-2">
                        {Array.isArray(paper.authors) &&
                          paper.authors.length > 0
                          ? paper.authors[0] +
                          (paper.authors.length > 1 ? " et al." : "")
                          : "Unknown"}{" "}
                        • {paper.year}
                        {paper.journal && ` • ${paper.journal}`}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                        {/* Allowed badges: Peer-reviewed / Preprint, Open Access */}
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium uppercase">
                          {paper.source === 'arxiv' ? 'Preprint' : 'Peer-Reviewed'}
                        </span>
                        {/* We don't have open access info in generic SuggestedPaper interface blindly, so omitting unless source implies it or we just stick to metadata available. 
                            If open access data isn't in SuggestedPaper, we can't display it purely. 
                            However, the previous code showed paper.source. I've updated it to be more descriptive based on the source 'type' usually associated (arxiv=preprint). */}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddSource(paper)}
                      disabled={addedPaperIds.has(paper.doi || paper.title)}
                      className={`w-full py-1.5 text-xs font-medium rounded transition-colors ${addedPaperIds.has(paper.doi || paper.title)
                        ? "bg-green-50 text-green-700 cursor-default"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}
                    >
                      {addedPaperIds.has(paper.doi || paper.title) ? "✓ In Sources" : "+ Add to Sources"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              No sources added yet. Search by title, author, or DOI to add reference metadata.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
