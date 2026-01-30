import React from "react";
import { SimilarityMatch } from "../../services/originalityService";
import { SafetyBadge } from "./SafetyBadge";

interface SimilarityMatchCardProps {
  match: SimilarityMatch;
  onGetRephrase: (match: SimilarityMatch) => void;
  onViewComparison: (url: string) => void;
  isLoadingRephrase?: boolean;
}

export const SimilarityMatchCard: React.FC<SimilarityMatchCardProps> = ({
  match,
  onGetRephrase,
  onViewComparison,
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

      {/* Source URL & View Comparison */}
      <div className="mb-3 flex flex-col gap-2">
        {match.sourceUrl && (
          <a
            href={match.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            <span>🔗</span>
            <span className="truncate max-w-[200px]">{match.sourceUrl}</span>
          </a>
        )}

        {match.viewUrl && (
          <button
            onClick={() => onViewComparison(match.viewUrl!)}
            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded border border-indigo-200 transition-colors mt-1 w-fit group"
          >
            <span>👁️</span> View Comparison Report
          </button>
        )}
      </div>

      {/* Stats row */}
      {match.matchedWords !== undefined && match.matchedWords > 0 && (
        <div className="mb-3 text-xs text-gray-500 font-medium">
          Matched {match.matchedWords} {match.sourceWords ? `/ ${match.sourceWords}` : ""} words
          {match.matchPercent ? ` (${match.matchPercent}% of source)` : ""}
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
