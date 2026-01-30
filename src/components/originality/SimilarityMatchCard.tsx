import React from "react";
import { SimilarityMatch } from "../../services/originalityService";


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
  const score = match.similarityScore || 0;

  // Determine color theme based on score
  let theme = {
    color: "text-green-700",
    bg: "bg-green-100",
    bar: "bg-green-500",
    border: "border-green-200",
    badge: "Original"
  };

  if (score >= 80) {
    theme = {
      color: "text-red-700",
      bg: "bg-red-100",
      bar: "bg-red-500",
      border: "border-red-200",
      badge: "Review Needed"
    };
  } else if (score >= 60) {
    theme = {
      color: "text-orange-700",
      bg: "bg-orange-100",
      bar: "bg-orange-500",
      border: "border-orange-200",
      badge: "Review Needed"
    };
  } else if (score >= 40) {
    theme = {
      color: "text-amber-700",
      bg: "bg-amber-100",
      bar: "bg-amber-500",
      border: "border-amber-200",
      badge: "Check Context"
    };
  }

  return (
    <div className={`border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-all ${theme.border} group`}>
      {/* Header with classification badge & Score */}
      <div className="flex items-center justify-between mb-2">
        <div className={`text-xs font-bold px-2 py-1 rounded-full ${theme.bg} ${theme.color} flex items-center gap-1.5`}>
          <span>{theme.badge}</span>
          <span>•</span>
          <span>{Math.round(score)}%</span>
        </div>

        {/* Source Hostname */}
        <div className="text-xs text-gray-400 font-medium truncate max-w-[120px]">
          {match.sourceUrl ? new URL(match.sourceUrl).hostname : 'Unknown Source'}
        </div>
      </div>

      {/* Copyscape-Style Color Bar */}
      <div className="mb-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${theme.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Matched Snippet */}
      <div className="mb-3">
        <p className="text-sm text-gray-800 leading-relaxed font-medium line-clamp-3">
          "...{match.sentenceText}..."
        </p>
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {match.sourceUrl && (
            <a
              href={match.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
              title="Open Source"
            >
              <span role="img" aria-label="link">🔗</span>
            </a>
          )}

          {match.viewUrl && (
            <button
              onClick={() => onViewComparison(match.viewUrl!)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
            >
              View Comparison
            </button>
          )}
        </div>

        <button
          onClick={() => onGetRephrase(match)}
          disabled={isLoadingRephrase}
          className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md font-medium transition-colors"
        >
          {isLoadingRephrase ? "..." : "Rephrase"}
        </button>
      </div>
    </div>
  );
};
