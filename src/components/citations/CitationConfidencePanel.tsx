import React, { useState, useEffect } from "react";
import {
  CitationService,
  ConfidenceScore,
  CitationBreakdown,
} from "../../services/citationService";
import {
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import { UpgradeModal } from "../subscription/UpgradeModal";

interface CitationConfidencePanelProps {
  projectId: string;
  field?: string;
}

export const CitationConfidencePanel: React.FC<
  CitationConfidencePanelProps
> = ({ projectId, field = "default" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceScore | null>(null);
  const [breakdown, setBreakdown] = useState<CitationBreakdown | null>(null);
  const [totalCitations, setTotalCitations] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchConfidence = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const analysis = await CitationService.getConfidenceAnalysis(
          projectId,
          field
        );
        setConfidence(analysis.overallConfidence);
        setBreakdown(analysis.citationBreakdown);
        setTotalCitations(analysis.totalCitations);
      } catch (err: any) {
        console.error("Error fetching citation confidence:", err);
        const errorMessage =
          err.message || "Failed to load citation confidence";

        // Check for usage limit or plan restriction errors
        if (
          errorMessage.includes("not available on your current plan") ||
          errorMessage.includes("Usage limit reached")
        ) {
          setShowUpgradeModal(true);
          // Set a user-friendly error message to show behind the modal
          setError("Feature limit reached. Please upgrade to continue.");
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      fetchConfidence();
    }
  }, [projectId, field]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      strong: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      weak: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || colors.poor;
  };

  return (
    <>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Check Limit Reached"
        message="You have reached the limit for citation confidence checks on your current plan."
        feature="Citation Confidence Checks"
      />

      {isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Analyzing citations...</span>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!isLoading && !error && confidence && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              Citation Confidence Score
            </h3>
            <p className="text-indigo-100 text-sm mt-1">
              {totalCitations} citations analyzed
            </p>
          </div>

          {/* Overall Score */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">
                  Overall Score
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`text-4xl font-bold ${getScoreColor(confidence.overall).split(" ")[0]}`}>
                    {confidence.overall}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(confidence.status)}`}>
                    {confidence.status.toUpperCase()}
                  </span>
                </div>
              </div>
              {confidence.status === "strong" ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <AlertCircle className="w-12 h-12 text-yellow-500" />
              )}
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Recency</p>
                <div
                  className={`px-3 py-2 rounded ${getScoreColor(confidence.recencyScore)}`}>
                  <span className="font-bold">{confidence.recencyScore}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Coverage</p>
                <div
                  className={`px-3 py-2 rounded ${getScoreColor(confidence.coverageScore)}`}>
                  <span className="font-bold">{confidence.coverageScore}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Quality</p>
                <div
                  className={`px-3 py-2 rounded ${getScoreColor(confidence.qualityScore)}`}>
                  <span className="font-bold">{confidence.qualityScore}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Diversity</p>
                <div
                  className={`px-3 py-2 rounded ${getScoreColor(confidence.diversityScore)}`}>
                  <span className="font-bold">{confidence.diversityScore}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Citation Age Breakdown */}
          {breakdown && (
            <div className="p-6 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Citation Recency
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    Recent (≤3 years)
                  </span>
                  <span className="font-semibold text-green-600">
                    {breakdown.recent}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />
                    Acceptable
                  </span>
                  <span className="font-semibold text-blue-600">
                    {breakdown.acceptable}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Info className="w-4 h-4 mr-2 text-yellow-600" />
                    Dated
                  </span>
                  <span className="font-semibold text-yellow-600">
                    {breakdown.dated}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                    Outdated
                  </span>
                  <span className="font-semibold text-red-600">
                    {breakdown.outdated}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {/* Warnings & Suggestions */}
          {(confidence.warnings.length > 0 ||
            confidence.suggestions.length > 0) && (
              <div className="p-6 bg-orange-50 border-t border-orange-100">
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  Analysis & Recommendations
                </p>
                {confidence.warnings.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-orange-800 mb-2">
                    <span className="mt-0.5">⚠️</span>
                    <span className="text-sm">{w}</span>
                  </div>
                ))}
                {confidence.suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-blue-800 mt-2">
                    <span className="mt-0.5">💡</span>
                    <span className="text-sm">{s}</span>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </>
  );
};
