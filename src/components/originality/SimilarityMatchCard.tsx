import React from "react";
import { SimilarityMatch } from "../../services/originalityService";
import { SafetyBadge } from "./SafetyBadge";

interface SimilarityMatchCardProps {
  match: SimilarityMatch;
  onGetRephrase: (match: SimilarityMatch) => void;
  isLoadingRephrase?: boolean;
}

export const SimilarityMatchCard: React.FC<SimilarityMatchCardProps> = ({
  match,
  onGetRephrase,
  isLoadingRephrase = false,
}) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header with classification badge */}
      <div className="flex items-start justify-between mb-3">
        <SafetyBadge classification={match.classification} score={match.similarityScore} />
        <span className="text-xs text-gray-500">
          {Math.round(match.similarityScore)}% similar
        </span>
      </div>

      {/* Flagged sentence */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-600 mb-1">Your Text:</p>
        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border-l-4 border-gray-300">
          {match.sentenceText}
        </p>
      </div>

      {/* Matched source */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-600 mb-1">Similar Content Found:</p>
        <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded border-l-4 border-blue-300">
          {match.matchedSource}
        </p>
      </div>

      {/* Source URL */}
      {match.sourceUrl && (
        <div className="mb-3">
          <a
            href={match.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <span>🔗</span>
            <span className="truncate">{match.sourceUrl}</span>
          </a>
        </div>
      )}

      {/* Rephrase button */}
      <button
        onClick={() => onGetRephrase(match)}
        disabled={isLoadingRephrase}
        className="w-full mt-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoadingRephrase ? "Loading suggestions..." : "Get Rephrase Suggestions"}
      </button>
    </div>
  );
};
