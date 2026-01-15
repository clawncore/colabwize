import React from "react";

interface ResultsSummaryProps {
  originalityScore?: number;
  citationStatus?: "strong" | "good" | "weak" | "poor";

  authorshipVerified?: boolean;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  originalityScore,
  citationStatus,

  authorshipVerified,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Originality Score */}
      <div className="bg-[#FFFAFA] rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="text-sm font-medium text-gray-600 mb-2">
          Originality Score
        </div>
        {originalityScore !== undefined ? (
          <>
            <div className="text-4xl font-bold text-gray-900">
              {Math.round(originalityScore)}%
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {originalityScore >= 75
                ? "✓ Safe"
                : originalityScore >= 50
                  ? "⚠ Review"
                  : "⚠ Action Required"}
            </div>
          </>
        ) : (
          <div className="text-2xl text-gray-500">Not scanned</div>
        )}
      </div>

      {/* Citation Confidence */}
      <div className="bg-[#FFFAFA] rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="text-sm font-medium text-gray-600 mb-2">
          Citation Confidence
        </div>
        {citationStatus ? (
          <>
            <div className="text-3xl font-bold capitalize text-gray-900">
              {citationStatus}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {citationStatus === "strong" || citationStatus === "good"
                ? "✓ Well cited"
                : "⚠ Needs improvement"}
            </div>
          </>
        ) : (
          <div className="text-2xl text-gray-500">Not checked</div>
        )}
      </div>

      {/* Authorship */}
      <div className="bg-[#FFFAFA] rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="text-sm font-medium text-gray-600 mb-2">Authorship</div>
        {authorshipVerified !== undefined ? (
          <>
            <div className="text-3xl font-bold text-gray-900">
              {authorshipVerified ? "Verified" : "Pending"}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {authorshipVerified ? "✓ Certificate ready" : "⏳ Tracking..."}
            </div>
          </>
        ) : (
          <div className="text-2xl text-gray-500">Not verified</div>
        )}
      </div>
    </div>
  );
};
