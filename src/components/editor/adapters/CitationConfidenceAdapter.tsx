import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { BarChart } from "lucide-react";
import { Dialog, DialogContent, VisuallyHidden } from "../../ui/dialog";
import {
  CitationService,
  CitationConfidenceAnalysis,
} from "../../../services/citationService";

interface CitationConfidenceAdapterProps {
  projectId: string;
  editor: Editor | null;
  onContentScanComplete?: (results: {
    suggestions: {
      sentence: string;
      suggestion: string;
      type: "factual_claim" | "definition" | "statistic";
    }[];
  }) => void;
  onFindPapers?: (keywords: string[]) => void;
}

/**
 * Adapter component that bridges DocumentEditor toolbar button with Citation components
 */
export const CitationConfidenceAdapter: React.FC<
  CitationConfidenceAdapterProps
> = ({ projectId, editor, onContentScanComplete, onFindPapers }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Removed local paper state since we redirect to main panel now
  // const [analysis, setAnalysis] = useState<CitationConfidenceAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanResults, setScanResults] = useState<{
    suggestions: {
      sentence: string;
      suggestion: string;
      type: "factual_claim" | "definition" | "statistic";
    }[];
  } | null>(null);
  // const [activeSignalSentence, setActiveSignalSentence] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const data = await CitationService.getConfidenceAnalysis(projectId);
      // setAnalysis(data);
    } catch (error) {
      console.error("Failed to fetch analysis", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // setActiveSignalSentence(null);
    } else {
      fetchAnalysis();
    }
  };

  const handleScanContent = async () => {
    try {
      setLoading(true);
      const content = editor?.getText() || "";
      if (!content) return;

      const results = await CitationService.scanContent(content, projectId);

      setScanResults(results);

      if (onContentScanComplete) {
        onContentScanComplete({ suggestions: results.suggestions });
      }

      await fetchAnalysis(); // Refresh analysis too
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setLoading(false);
    }
  };

  const extractKeywords = (sentence: string): string[] => {
    const stopWords = [
      "about",
      "above",
      "after",
      "again",
      "against",
      "all",
      "and",
      "any",
      "are",
      "aren't",
      "as",
      "at",
      "be",
      "because",
      "been",
      "before",
      "being",
      "below",
      "between",
      "both",
      "but",
      "by",
      "can't",
      "cannot",
      "could",
      "couldn't",
      "did",
      "didn't",
      "do",
      "does",
      "doesn't",
      "doing",
      "don't",
      "down",
      "during",
      "each",
      "few",
      "for",
      "from",
      "further",
      "had",
      "hadn't",
      "has",
      "hasn't",
      "have",
      "haven't",
      "having",
      "he",
      "he'd",
      "he'll",
      "he's",
      "her",
      "here",
      "here's",
      "hers",
      "herself",
      "him",
      "himself",
      "his",
      "how",
      "how's",
      "i",
      "i'd",
      "i'll",
      "i'm",
      "i've",
      "if",
      "in",
      "into",
      "is",
      "isn't",
      "it",
      "it's",
      "its",
      "itself",
      "let's",
      "me",
      "more",
      "most",
      "mustn't",
      "my",
      "myself",
      "no",
      "nor",
      "not",
      "of",
      "off",
      "on",
      "once",
      "only",
      "or",
      "other",
      "ought",
      "our",
      "ours",
      "ourselves",
      "out",
      "over",
      "own",
      "same",
      "shan't",
      "she",
      "she'd",
      "she'll",
      "she's",
      "should",
      "shouldn't",
      "so",
      "some",
      "such",
      "than",
      "that",
      "that's",
      "the",
      "their",
      "theirs",
      "them",
      "themselves",
      "then",
      "there",
      "there's",
      "these",
      "they",
      "they'd",
      "they'll",
      "they're",
      "they've",
      "this",
      "those",
      "through",
      "to",
      "too",
      "under",
      "until",
      "up",
      "very",
      "was",
      "wasn't",
      "we",
      "we'd",
      "we'll",
      "we're",
      "we've",
      "were",
      "weren't",
      "what",
      "what's",
      "when",
      "when's",
      "where",
      "where's",
      "which",
      "while",
      "who",
      "who's",
      "whom",
      "why",
      "why's",
      "with",
      "won't",
      "would",
      "wouldn't",
      "you",
      "you'd",
      "you'll",
      "you're",
      "you've",
      "your",
      "yours",
      "yourself",
      "yourselves",
    ];

    return sentence
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.includes(w.toLowerCase()))
      .slice(0, 8);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 border border-green-200 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-2"
        title="Citation Confidence">
        <BarChart className="w-4 h-4" />
        Citation Audit
      </button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <VisuallyHidden>Citation Confidence Analyzer</VisuallyHidden>

          <div className="p-6">
            {/* ... (existing analysis rendering) */}

            <hr className="my-6 border-gray-100" />

            <div className="bg-white rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                Find Missing Citations
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Scan your content for factual claims, definitions, and
                statistics that may need citations.
              </p>
              <button
                onClick={handleScanContent}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50">
                {loading ? "Scanning..." : "Scan Document for Signals"}
              </button>
            </div>

            {scanResults && scanResults.suggestions.length > 0 && (
              <div className="mt-6 bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
                  🔍 Missing Citation Signals ({scanResults.suggestions.length})
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {scanResults.suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded border border-purple-100 text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${item.type === "statistic"
                              ? "bg-orange-100 text-orange-700"
                              : item.type === "factual_claim"
                                ? "bg-pink-100 text-pink-700"
                                : "bg-blue-100 text-blue-700"
                              }`}>
                            {item.type.replace("_", " ")}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (onFindPapers) {
                              // Extract smart keywords
                              const keywords = extractKeywords(item.sentence);
                              // setActiveSignalSentence(item.sentence);
                              setIsOpen(false); // Close this modal
                              onFindPapers(keywords); // Open side panel
                            }
                          }}
                          className="text-xs px-2 py-1 bg-white border border-purple-200 text-purple-700 rounded hover:bg-purple-50 transition-colors flex items-center gap-1">
                          <span>🔎 Find Papers</span>
                        </button>
                      </div>
                      <p className="text-gray-800 font-medium mb-1">
                        "{item.sentence}"
                      </p>
                      <p className="text-gray-600 italic">
                        💡 {item.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Removed: Local FindMissingLinkButton and suggested papers modal logic */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
