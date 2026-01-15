import React, { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  SuggestedPaper,
  CitationService,
} from "../../services/citationService";
import { documentService } from "../../services/documentService";

interface PaperSuggestionsPanelProps {
  projectId: string;
  onClose: () => void;
  // Optional pre-loaded suggestions
  initialSuggestions?: SuggestedPaper[];
  // Context keywords if we want to auto-search
  contextKeywords?: string[];
  onInsertCitation?: (text: string) => void;
}

export const PaperSuggestionsPanel: React.FC<PaperSuggestionsPanelProps> = ({
  projectId,
  onClose,
  initialSuggestions = [],
  contextKeywords = [],
  onInsertCitation,
}) => {
  const [suggestedPapers, setSuggestedPapers] =
    useState<SuggestedPaper[]>(initialSuggestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);

  // Auto-search based on document content when panel opens
  useEffect(() => {
    const fetchAndSearch = async () => {
      // Skip if we already have initial suggestions
      if (initialSuggestions.length > 0) {
        setIsLoadingInitial(false);
        return;
      }

      try {
        setIsLoadingInitial(true);

        // Fetch project to get document content
        const projectResult = await documentService.getProjectById(projectId);

        if (projectResult.success && projectResult.data) {
          const content = projectResult.data.content;

          // Extract text from JSON content (Tiptap format)
          let documentText = "";
          if (typeof content === "object" && content !== null) {
            // Simple extraction - get text from nodes
            const extractText = (node: any): string => {
              if (node.text) return node.text;
              if (node.content) {
                return node.content.map(extractText).join(" ");
              }
              return "";
            };
            documentText = extractText(content);
          } else if (typeof content === "string") {
            documentText = content;
          }

          // Extract keywords from document (simple approach: get meaningful words)
          const words = documentText
            .split(/\s+/)
            .filter((w) => w.length > 4) // Words longer than 4 chars
            .filter(
              (w) =>
                !/^(that|this|with|from|have|about|would|their|there|which|these|those|been|were|when|what|where)$/i.test(
                  w
                )
            )
            .slice(0, 20)
            .join(" ");

          // Use context keywords if provided, otherwise use extracted words
          let query = words || "academic research";
          if (contextKeywords && contextKeywords.length > 0) {
            query = contextKeywords.join(" ");
          }

          // Search for papers
          if (query.trim()) {
            const results = await CitationService.searchPapers(query);
            setSuggestedPapers(results || []);
            setSearchQuery(query.split(" ").slice(0, 5).join(" ")); // Show shortened query
          }
        }
      } catch (error) {
        console.error("Auto-search failed:", error);
      } finally {
        setIsLoadingInitial(false);
      }
    };

    fetchAndSearch();
  }, [projectId]); // Re-run if projectId changes

  const handleManualSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await CitationService.searchPapers(searchQuery);
      setSuggestedPapers(results || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCitation = async (paper: SuggestedPaper) => {
    try {
      await CitationService.addCitation(projectId, paper);

      // Insert in-text citation if callback provided
      if (onInsertCitation) {
        const authorText =
          paper.authors.length > 0
            ? paper.authors[0] + (paper.authors.length > 1 ? " et al." : "")
            : "Unknown";
        const citationText = ` (${authorText}, ${paper.year}) `;
        onInsertCitation(citationText);
      }

      // Remove from suggestions list to indicate success/prevent duplicates
      setSuggestedPapers((prev) => prev.filter((p) => p.title !== paper.title));
    } catch (error) {
      console.error("Failed to add citation", error);
      alert("Failed to add citation. Please try again.");
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
            <h2 className="text-lg font-bold text-white">Suggested Papers</h2>
            <p className="text-blue-100 text-xs mt-1">
              Boost your citation confidence
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search for papers
          </label>
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
        {isLoadingInitial ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-gray-600 text-sm">
              Analyzing your document and finding relevant papers...
            </p>
          </div>
        ) : hasSuggestions ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Found {suggestedPapers!.length} Papers
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
                      </p>

                      {paper.abstract && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {paper.abstract}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium uppercase">
                          {paper.source}
                        </span>
                        <span className="text-green-600 font-medium">
                          {Math.round(paper.relevanceScore || 0)}% Match
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddCitation(paper)}
                      className="w-full py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100 transition-colors">
                      + Add to Project
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              No suggestions yet. Click specific text or use the search button
              above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
