import React, { useEffect } from "react";
import {
  OriginalityService,
  RephraseSuggestion,
} from "../../services/originalityService";
import { InlineLimitMessage } from "../common/InlineLimitMessage";

interface RephraseSuggestionsPanelProps {
  // Mode 1: Auto-fetch from project (for Editor)
  projectId?: string;
  scanId?: string; // Optional: specific scan to get suggestions for
  matchId?: string; // Optional: specific match to get suggestions for

  // Mode 2: Direct suggestions (for OriginalityMap)
  suggestions?: RephraseSuggestion[];
  originalText?: string; // Text to rephrase
  isLoading?: boolean; // External loading state

  // Mode 3: Direct suggestions passed via panelData (for Editor adapter)
  panelData?: {
    suggestions: RephraseSuggestion[];
    originalText: string;
  };

  onClose: () => void;
}

export const RephraseSuggestionsPanel: React.FC<
  RephraseSuggestionsPanelProps
> = ({
  projectId,
  scanId,
  matchId,
  originalText: externalOriginalText,
  suggestions: externalSuggestions,
  isLoading: externalIsLoading,
  panelData,
  onClose,
}) => {
    const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [suggestions, setSuggestions] = React.useState<RephraseSuggestion[]>(
      []
    );
    const [displayText, setDisplayText] = React.useState<string>("");
    // Matches state for navigation
    const [matches, setMatches] = React.useState<any[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = React.useState(0);
    const [currentScanId, setCurrentScanId] = React.useState<string | null>(null);

    // If panelData is provided, use those suggestions immediately
    useEffect(() => {
      if (panelData) {
        setSuggestions(panelData.suggestions);
        setDisplayText(panelData.originalText);
        setMatches([]); // Direct mode doesn't support navigation yet
        return;
      }

      // If direct suggestions are provided, use them immediately
      if (externalSuggestions && externalOriginalText !== undefined) {
        setSuggestions(externalSuggestions);
        setDisplayText(externalOriginalText);
        setMatches([]);
        return;
      }
    }, [panelData, externalSuggestions, externalOriginalText]);

    // Helper to fetch suggestions for a specific match
    const fetchSuggestionsForMatch = async (scanId: string, match: any) => {
      setIsLoading(true);
      try {
        console.log("RephrasePanel: Fetching rephrases for match:", match);
        const rephraseSuggestions = await OriginalityService.getRephrases(
          scanId,
          match.id,
          match.sentenceText
        );
        setSuggestions(rephraseSuggestions);
        setDisplayText(match.sentenceText);
      } catch (err) {
        console.error("Failed to fetch suggestions for match", err);
        // Don't set error state here to avoid blocking UI, just show empty
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch scans and initialize matches
    useEffect(() => {
      const fetchScanAndMatches = async () => {
        // Skip fetching if direct suggestions are already provided
        if (externalSuggestions || panelData) {
          return;
        }

        if (!projectId) {
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          console.log(
            "RephrasePanel: Fetching suggestions for project:",
            projectId
          );
          const scans = await OriginalityService.getProjectScans(projectId);
          console.log("RephrasePanel: Scans retrieved:", scans);

          if (scans.length > 0) {
            const latestScan = scans[0];
            setCurrentScanId(latestScan.id); // Store scan ID for navigation

            // Get critical matches
            const highSimilarityMatches = latestScan.matches.filter(
              (m) =>
                m.classification === "red" ||
                m.classification === "yellow" ||
                m.classification === "needs_citation" ||
                m.classification === "close_paraphrase"
            );

            console.log(
              "RephrasePanel: High similarity matches found:",
              highSimilarityMatches
            );

            if (highSimilarityMatches.length > 0) {
              setMatches(highSimilarityMatches);
              setCurrentMatchIndex(0);

              // Fetch for first match immediately
              await fetchSuggestionsForMatch(
                latestScan.id,
                highSimilarityMatches[0]
              );
            } else {
              console.log(
                "RephrasePanel: No flagged content found in latest scan"
              );
              setMatches([]);
              setSuggestions([]);
              setDisplayText("");
            }
          } else {
            console.log("RephrasePanel: No scans found for project");
            setMatches([]);
            setSuggestions([]);
            setDisplayText("");
          }
        } catch (err: any) {
          console.error("Error fetching rephrase suggestions:", err);
          setError(err.message || "Failed to fetch rephrase suggestions");
        } finally {
          setIsLoading(false);
        }
      };

      fetchScanAndMatches();
    }, [projectId, externalSuggestions, panelData]);

    // Updated navigation handler using state
    const navigateMatch = async (direction: "next" | "prev") => {
      const newIndex =
        direction === "next" ? currentMatchIndex + 1 : currentMatchIndex - 1;

      if (newIndex >= 0 && newIndex < matches.length && currentScanId) {
        setCurrentMatchIndex(newIndex);
        await fetchSuggestionsForMatch(currentScanId, matches[newIndex]);
      }
    };

    const handleCopy = (text: string, index: number) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Rephrase Suggestions
              </h2>
              <p className="text-indigo-100 text-xs mt-1">Improve originality</p>
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
          {isLoading || externalIsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600 text-sm">Generating suggestions...</p>
            </div>
          ) : error ? (
            error.includes("limit reached") || error.includes("PLAN_LIMIT_REACHED") ? (
              <div className="p-4">
                <InlineLimitMessage
                  type="PLAN_LIMIT_REACHED"
                  message="You have reached your rephraser limit for this month."
                  actionLabel="Upgrade Plan"
                  onAction={() => window.open('/pricing', '_blank')}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-red-600 font-semibold">{error}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Please try again or check your connection
                </p>
              </div>
            )
          ) : !projectId && !externalSuggestions ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No document selected</p>
              <p className="text-gray-400 text-sm mt-2">
                Select a document to see rephrase suggestions
              </p>
            </div>
          ) : (
            <>
              {/* Navigation Controls */}
              {matches.length > 1 && (
                <div className="flex items-center justify-between mb-4 bg-gray-50 p-2 rounded border border-gray-200">
                  <button
                    onClick={() => navigateMatch("prev")}
                    disabled={currentMatchIndex === 0 || isLoading}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                    title="Previous Issue">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <span className="text-xs font-semibold text-gray-600">
                    Issue {currentMatchIndex + 1} of {matches.length}
                  </span>
                  <button
                    onClick={() => navigateMatch("next")}
                    disabled={
                      currentMatchIndex === matches.length - 1 || isLoading
                    }
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-30"
                    title="Next Issue">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              )}

              {/* Info */}
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                <p className="text-sm text-blue-900">
                  {suggestions.length > 0 ? (
                    <>
                      💡 <strong>Tip:</strong> These suggestions help rewrite
                      flagged content to improve originality.
                    </>
                  ) : matches.length > 0 ? (
                    <>⚠️ Flagged content found. Generating suggestions...</>
                  ) : (
                    <>
                      ✅ No flagged content found. Run an originality scan to get
                      suggestions.
                    </>
                  )}
                </p>
              </div>

              {/* Original Text */}
              {displayText && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Original Text:
                  </p>
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <p className="text-gray-900 text-sm">{displayText}</p>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Suggested Alternatives:
                  </p>
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      className="bg-green-50 border-l-4 border-green-400 p-3 rounded hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-green-700 mb-2">
                            Option {index + 1}
                          </p>
                          <p className="text-gray-900 text-sm">
                            {suggestion.suggestedText}
                          </p>
                        </div>
                        <div className="flex gap-2 shrinking-0">
                          <button
                            onClick={() =>
                              handleCopy(suggestion.suggestedText, index)
                            }
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors whitespace-nowrap">
                            {copiedIndex === index ? "✓ Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayText === "" && !isLoading && matches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No suggestions available</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Run an originality scan first to get rephrase suggestions
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-600 text-center">
            Click flagged text in the editor to get specific suggestions
          </p>
        </div>
      </div>
    );
  };
