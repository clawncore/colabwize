
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useSubscriptionStore } from "../../stores/useSubscriptionStore";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { CitationService, SuggestedPaper } from "../../services/citationService";
import { apiClient } from "../../services/apiClient";
import { CredibilityBadge } from "./CredibilityBadge";



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
  const navigate = useNavigate();
  // Subscription State
  const {
    plan,
    limits: planLimits,
    usage: planUsage,
    creditBalance,
    fetchSubscription
  } = useSubscriptionStore();
  // const { user } = useAuth(); // Unused

  const [suggestedPapers, setSuggestedPapers] =
    useState<SuggestedPaper[]>(initialSuggestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [addedPaperIds, setAddedPaperIds] = useState<Set<string>>(new Set());

  // Dialog State
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  // Pagination
  const [displayCount, setDisplayCount] = useState(10);
  const PAPERS_PER_PAGE = 10;

  // Credibility scores
  const [credibilityScores, setCredibilityScores] = useState<Map<string, any>>(new Map());


  const calculateCredibilityScores = useCallback(async () => {
    try {
      const papers = suggestedPapers.map(p => ({
        title: p.title,
        year: p.year,
        citationCount: p.citationCount,
        journal: p.journal,
        url: p.url,
        isPeerReviewed: p.source !== 'arxiv'
      }));

      const response = await apiClient.post("/api/citations/batch-credibility", { papers });

      if (response.data.success) {
        const scores = new Map<string, any>();
        Object.entries(response.data.credibilityScores).forEach(([title, score]) => {
          scores.set(title, score);
        });
        setCredibilityScores(scores);
      }
    } catch (error) {
      console.error("Failed to calculate credibility scores", error);
    }
  }, [suggestedPapers]);

  // Calculate credibility when papers change
  useEffect(() => {
    if (suggestedPapers.length > 0) {
      calculateCredibilityScores();
    }
  }, [suggestedPapers, calculateCredibilityScores]);


  const performSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    setDisplayCount(10); // Reset
    try {
      const results = await CitationService.searchPapers(query);
      setSuggestedPapers(results || []);
      // Refresh subscription to update usage
      fetchSubscription(true);
    } catch (error: any) {
      console.error("Search failed:", error);
      const isLimitError = error.response?.status === 403 || error.message?.includes("limit");

      if (isLimitError) {
        // If we hit backend limit (e.g. no credits), show dialog
        setShowLimitDialog(true);
        return;
      }

      toast({
        title: "Search Failed",
        description: "Failed to search for papers. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSearching(false);
    }
  }, [fetchSubscription, toast]);

  const executeSearch = useCallback(async (query: string, force = false) => {
    if (!query.trim()) return;

    // Check Limits BEFORE searching (Client-side pre-check)
    const limit = planLimits?.paper_search ?? 3;
    const used = planUsage?.paper_search ?? 0;
    const isFree = plan?.toLowerCase().includes('free');

    // If free plan and limit reached/exceeded, and NOT forcing
    if (isFree && used >= limit && !force) {
      setPendingQuery(query);
      setShowLimitDialog(true);
      return;
    }

    await performSearch(query);
  }, [planLimits, planUsage, plan, performSearch]);

  const handleManualSearch = async (e?: React.FormEvent, searchStr?: string) => {
    if (e) e.preventDefault();
    const query = searchStr || searchQuery;
    executeSearch(query);
  };

  // Auto-search logic when contextKeywords are provided
  useEffect(() => {
    if (contextKeywords && contextKeywords.length > 0) {
      const query = contextKeywords.join(" ");
      setSearchQuery(query);
      executeSearch(query);
    }
  }, [contextKeywords, executeSearch]);

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
    } catch (error) {
      console.error("Failed to add citation", error);
      alert("Failed to add source. Please try again.");
    }
  };

  const hasSuggestions =
    Array.isArray(suggestedPapers) && suggestedPapers.length > 0;

  const displayedPapers = suggestedPapers.slice(0, displayCount);
  const hasMore = suggestedPapers.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + PAPERS_PER_PAGE);
  };

  // Dialog Actions
  const handleProceedWithCredits = () => {
    setShowLimitDialog(false);
    if (pendingQuery) {
      // Proceed logic: we assume backend will charge credits
      // We could explicitly check credit balance here
      if (creditBalance <= 0) {
        toast({
          title: "Insufficient Credits",
          description: "You don't have enough credits. Please top up.",
          variant: "destructive"
        });
        navigate("/pricing");
      } else {
        performSearch(pendingQuery);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
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
              Found {suggestedPapers!.length} Sources {displayCount < suggestedPapers.length && `(Showing ${displayCount})`}
            </h3>
            <div className="space-y-4">
              {displayedPapers.map((paper, index) => (
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

                      <div className="flex items-center gap-2 mb-2">
                        {/* Credibility Badge */}
                        {credibilityScores.has(paper.title) && (
                          <CredibilityBadge
                            level={credibilityScores.get(paper.title)?.level || "medium"}
                            score={credibilityScores.get(paper.title)?.score}
                            flags={credibilityScores.get(paper.title)?.flags}
                            size="sm"
                          />
                        )}

                        {/* Peer Review Badge */}
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-medium uppercase text-[10px]">
                          {paper.source === 'arxiv' ? 'Preprint' : 'Peer-Reviewed'}
                        </span>
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

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Load More Papers ({suggestedPapers.length - displayCount} remaining)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">
              No sources added yet. Search by title, author, or DOI to add reference metadata.
            </p>
          </div>
        )}
      </div>

      {/* Limit Reached Dialog */}
      <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <AlertDialogContent className="bg-white text-gray-900 border-gray-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Free Plan Limit Reached</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              You've used all 3 free searches for this month.
              {creditBalance > 0
                ? " Would you like to use 1 credit to perform this search?"
                : " You need credits to continue searching."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLimitDialog(false)} className="text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-200">Cancel</AlertDialogCancel>
            {creditBalance > 0 ? (
              <AlertDialogAction onClick={handleProceedWithCredits}>
                Use 1 Credit
              </AlertDialogAction>
            ) : (
              <AlertDialogAction onClick={() => navigate("/pricing")}>
                Upgrade / Top Up
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
