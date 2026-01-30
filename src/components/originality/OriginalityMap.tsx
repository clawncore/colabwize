import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  OriginalityService,
  OriginalityScan,
  SimilarityMatch,
  RephraseSuggestion,
} from "../../services/originalityService";
import { SafetyBadge } from "./SafetyBadge";
import { OriginalityHeatmap } from "./OriginalityHeatmap";
import { SimilarityMatchCard } from "./SimilarityMatchCard";
import { RephraseSuggestionsPanel } from "./RephraseSuggestionsPanel";
import { AnxietyRealityCheckPanel } from "./AnxietyRealityCheckPanel";
import { AnxietyRealityCheckBanner } from "./AnxietyRealityCheckBanner";
import { UpgradeModal } from "../subscription/UpgradeModal";
import { ComparisonModal } from "./ComparisonModal";
import { RescanSafetyModal } from "./RescanSafetyModal";

interface OriginalityMapProps {
  projectId: string;
  onScanComplete?: (results: OriginalityScan) => void;
}

export const OriginalityMap: React.FC<
  OriginalityMapProps & { initialContent?: string }
> = ({ projectId, initialContent = "", onScanComplete }) => {
  const [content, setContent] = useState(initialContent);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<OriginalityScan | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<SimilarityMatch | null>(
    null
  );
  const [rephrases, setRephrases] = useState<RephraseSuggestion[]>([]);
  const [isLoadingRephrases, setIsLoadingRephrases] = useState(false);
  const [showRephrasePanel, setShowRephrasePanel] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedViewUrl, setSelectedViewUrl] = useState<string | null>(null);

  // Hybrid Realtime State
  const [autoScanEnabled, setAutoScanEnabled] = useState(false); // Default to false to give user control
  const [scanStatus, setScanStatus] = useState<
    "idle" | "typing" | "listened" | "scanning" | "protected"
  >("idle");
  const lastScannedHashRef = React.useRef<string>("");
  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Rescan Safety State
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [similarityPercent, setSimilarityPercent] = useState(0);
  const lastScannedContentRef = React.useRef<string>("");

  // Simple hash function for client-side caching
  const simpleHash = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  // Jaccard Similarity Helper
  const calculateSimilarity = (text1: string, text2: string): number => {
    const set1 = new Set(text1.toLowerCase().split(/\s+/));
    const set2 = new Set(text2.toLowerCase().split(/\s+/));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return union.size === 0 ? 0 : Math.round((intersection.size / union.size) * 100);
  };

  // Initialize content from prop if provided
  useEffect(() => {
    if (initialContent && content !== initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // Handle Scan Logic
  const executeScan = async () => {
    setIsScanning(true);
    setScanStatus("scanning");
    setError(null);
    setShowSafetyModal(false);

    try {
      const result = await OriginalityService.scanDocument(projectId, content);
      setScanResult(result);
      if (onScanComplete) onScanComplete(result);

      // Update caches
      lastScannedHashRef.current = simpleHash(content);
      lastScannedContentRef.current = content;
      setScanStatus("protected");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to scan document";
      if (
        errorMessage.toLowerCase().includes("limit reached") ||
        errorMessage.toLowerCase().includes("upgrade") ||
        errorMessage.toLowerCase().includes("credits")
      ) {
        setShowUpgradeModal(true);
        setError(null);
      } else if (errorMessage.includes("SERVICE_MAINTENANCE")) {
        setError("Originality checks are temporarily running a bit slow. We are optimizing the service. Please check back in a few hours!");
      } else {
        setError(errorMessage);
      }
      setScanStatus("idle");
    } finally {
      setIsScanning(false);
    }
  };

  const handleScan = async () => {
    if (!content.trim()) {
      setError("Please enter some text to scan");
      return;
    }

    // 1. Smart Caching Check (Identical)
    const currentHash = simpleHash(content);
    if (currentHash === lastScannedHashRef.current && scanResult) {
      setScanStatus("protected");
      console.log("Smart Cache Hit: Skipping API call");
      if (onScanComplete) {
        onScanComplete(scanResult);
      }
      return;
    }

    // 2. Safety Check (Highly Similar)
    if (lastScannedContentRef.current && scanResult) {
      const sim = calculateSimilarity(content, lastScannedContentRef.current);
      if (sim > 85) { // 85% threshold
        setSimilarityPercent(sim);
        setShowSafetyModal(true);
        return;
      }
    }

    // 3. Proceed
    await executeScan();
  };

  // Auto-Scan Effect
  useEffect(() => {
    if (!autoScanEnabled) {
      if (scanStatus !== "idle" && scanStatus !== "scanning" && !scanResult) {
        setScanStatus("idle");
      }
      return;
    }

    if (!content.trim()) return;

    const currentHash = simpleHash(content);

    if (currentHash === lastScannedHashRef.current) {
      setScanStatus("protected");
      return;
    }

    setScanStatus("typing");

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      handleScan();
    }, 3000);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [content, autoScanEnabled]);

  // Handle match click
  const handleMatchClick = (match: SimilarityMatch) => {
    setSelectedMatch(match);
  };

  // Handle get rephrase
  const handleGetRephrase = async (match: SimilarityMatch) => {
    if (!scanResult) return;

    setIsLoadingRephrases(true);
    setSelectedMatch(match);

    try {
      const suggestions = await OriginalityService.getRephrases(
        scanResult.id,
        match.id,
        match.sentenceText
      );
      setRephrases(suggestions);
      setShowRephrasePanel(true);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to get rephrase suggestions";
      if (
        errorMessage.toLowerCase().includes("limit reached") ||
        errorMessage.toLowerCase().includes("upgrade") ||
        errorMessage.toLowerCase().includes("credits")
      ) {
        setShowUpgradeModal(true);
        setError(null);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoadingRephrases(false);
    }
  };

  const handleCloseRephrasePanel = () => {
    setShowRephrasePanel(false);
    setRephrases([]);
  };

  const handleViewComparison = (url: string) => {
    setSelectedViewUrl(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Originality Map
          </h2>
          <p className="text-gray-600">
            Scan your document for similarity with online sources. Get instant
            feedback and rephrase suggestions.
          </p>
        </div>

        {/* Auto-Scan Toggle & Status */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Auto-Scan</span>
            <button
              onClick={() => setAutoScanEnabled(!autoScanEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${autoScanEnabled ? "bg-indigo-600" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoScanEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>

          {/* Status Badge */}
          {autoScanEnabled && (
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${scanStatus === "scanning"
                ? "bg-blue-100 text-blue-800"
                : scanStatus === "typing"
                  ? "bg-yellow-100 text-yellow-800"
                  : scanStatus === "protected"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${scanStatus === "scanning"
                  ? "bg-blue-500 animate-pulse"
                  : scanStatus === "typing"
                    ? "bg-yellow-500"
                    : scanStatus === "protected"
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
              ></span>
              {scanStatus === "scanning"
                ? "Scanning..."
                : scanStatus === "typing"
                  ? "Waiting for pause..."
                  : scanStatus === "protected"
                    ? "Protected"
                    : "Idle"}
            </div>
          )}
        </div>
      </div>

      {/* Upload/Input Section */}
      {!scanResult && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Enter Your Text
          </h3>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your document text here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {content.length} characters
            </span>
            <button
              onClick={handleScan}
              disabled={isScanning || !content.trim()}
              className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Scanning...
                </span>
              ) : (
                "Scan for Originality"
              )}
            </button>
          </div>

          {error && (
            error.includes("temporarily running a bit slow") ? (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <div className="text-blue-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-800">Service Update</h4>
                  <p className="text-blue-700 text-sm mt-0.5">{error}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Results Section */}
      {scanResult && (
        <div className="space-y-6">
          {scanResult.realityCheck && (
            <AnxietyRealityCheckPanel stats={scanResult.realityCheck} />
          )}

          {/* Overall Score - Copyscape Style */}
          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-lg shadow-lg p-8 text-white">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <SafetyBadge classification={scanResult.classification} score={scanResult.overallScore} />
              Analysis Complete
            </h3>

            <div className="flex flex-col md:flex-row md:items-end gap-8">
              {/* Large Score Display - No Box */}
              <div>
                <div className="text-sm font-medium text-purple-100 mb-2">Overall Originality Score</div>
                <div className="flex items-center gap-4">
                  <div className="text-8xl font-bold tracking-tighter">{Math.round(scanResult.overallScore)}%</div>
                  {scanResult.overallScore < 70 ? (
                    <div className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm self-center">
                      <AlertCircle className="w-4 h-4" />
                      Review Needed
                    </div>
                  ) : (
                    <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-sm self-center">
                      <CheckCircle className="w-4 h-4" />
                      Original
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 min-w-[140px]">
                  <div className="text-xs text-purple-100 mb-1">Matches Found</div>
                  <div className="text-3xl font-bold">{scanResult.matches.length}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/10 min-w-[140px]">
                  <div className="text-xs text-purple-100 mb-1">Words Scanned</div>
                  <div className="text-3xl font-bold">{scanResult.wordsScanned?.toLocaleString() || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Anxiety Reality Check Banner */}
          {scanResult.realityCheck && (
            <div className="mb-6">
              <AnxietyRealityCheckBanner
                stats={scanResult.realityCheck}
                overallScore={scanResult.overallScore}
                onOpenPanel={() => {
                  /* Panel opening logic if needed, currently inline */
                }}
              />
            </div>
          )}

          {/* Heatmap */}
          <div>
            <h4 className="text-xl font-semibold text-gray-900 mb-4">
              Color-Coded Heatmap
            </h4>
            <OriginalityHeatmap
              content={content}
              matches={scanResult.matches}
              onMatchClick={handleMatchClick}
            />
          </div>

          {/* Matches List */}
          {scanResult.matches.length > 0 && (
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Source Matches ({scanResult.matches.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanResult.matches.map((match) => (
                  <SimilarityMatchCard
                    key={match.id}
                    match={match}
                    onGetRephrase={handleGetRephrase}
                    onViewComparison={handleViewComparison}
                    isLoadingRephrase={
                      isLoadingRephrases && selectedMatch?.id === match.id
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* No matches */}
          {scanResult.matches.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">✓</div>
              <h4 className="text-2xl font-bold text-green-800 mb-2">
                Great News!
              </h4>
              <p className="text-green-700">
                No significant matches detected. Your content appears to be
                original.
              </p>
            </div>
          )}

          {/* New Scan Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setScanResult(null);
                setRephrases([]);
                setError(null);
              }}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Start New Scan
            </button>
          </div>
        </div>
      )}

      {/* Rephrase Panel */}
      {showRephrasePanel && selectedMatch && (
        <RephraseSuggestionsPanel
          suggestions={rephrases}
          originalText={selectedMatch.sentenceText}
          onClose={handleCloseRephrasePanel}
          isLoading={isLoadingRephrases}
        />
      )}

      {/* Comparison Modal (Internal View) */}
      <ComparisonModal
        isOpen={!!selectedViewUrl}
        onClose={() => setSelectedViewUrl(null)}
        viewUrl={selectedViewUrl}
      />

      {/* Rescan Safety Warning Modal */}
      <RescanSafetyModal
        isOpen={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
        onConfirm={executeScan}
        similarityPercent={similarityPercent}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Scan Limit Reached"
        message="You've reached your plan's scan limit. Upgrade to Pro for unlimited scans or buy a credit pack to continue."
        feature="scans"
      />
    </div>
  );
};
