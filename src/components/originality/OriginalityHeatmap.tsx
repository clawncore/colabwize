import React from "react";
import { SimilarityMatch } from "../../services/originalityService";

interface OriginalityHeatmapProps {
  content: string;
  matches: SimilarityMatch[];
  onMatchClick: (match: SimilarityMatch) => void;
}

export const OriginalityHeatmap: React.FC<OriginalityHeatmapProps> = ({
  content,
  matches,
  onMatchClick,
}) => {
  // Build highlighted text with color coding
  const renderHighlightedText = () => {
    if (matches.length === 0) {
      return <p className="text-gray-900 whitespace-pre-wrap">{content}</p>;
    }

    // Sort matches by position
    const sortedMatches = [...matches].sort(
      (a, b) => a.positionStart - b.positionStart
    );

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedMatches.forEach((match, index) => {
      // Add text before match
      if (match.positionStart > lastIndex) {
        segments.push(
          <span key={`text-${index}`} className="text-gray-900">
            {content.substring(lastIndex, match.positionStart)}
          </span>
        );
      }

      // Add highlighted match
      let colorClass = "";
      switch (match.classification) {
        case "common_phrase":
        case "green":
          colorClass =
            "bg-green-200 hover:bg-green-300 border-b-2 border-green-500";
          break;
        case "quoted_correctly":
          colorClass =
            "bg-blue-200 hover:bg-blue-300 border-b-2 border-blue-500";
          break;
        case "close_paraphrase":
        case "yellow":
          colorClass =
            "bg-yellow-200 hover:bg-yellow-300 border-b-2 border-yellow-500";
          break;
        case "needs_citation":
        case "red":
          colorClass = "bg-red-200 hover:bg-red-300 border-b-2 border-red-500";
          break;
        default:
          colorClass =
            "bg-gray-200 hover:bg-gray-300 border-b-2 border-gray-500";
      }

      const tooltipLabels: Record<string, string> = {
        common_phrase: "Common Phrase",
        quoted_correctly: "Properly Quoted",
        close_paraphrase: "Close Paraphrase",
        needs_citation: "Needs Citation",
        green: "Properly Quoted", // Map legacy codes if any
        yellow: "Close Paraphrase",
        red: "Needs Citation",
      };

      segments.push(
        <span
          key={`match-${match.id}`}
          className={`${colorClass} cursor-pointer transition-colors rounded px-0.5`}
          onClick={() => onMatchClick(match)}
          title={`${
            tooltipLabels[match.classification] || "Match"
          } - Click for details`}>
          {match.sentenceText}
        </span>
      );

      lastIndex = match.positionEnd;
    });

    // Add remaining text
    if (lastIndex < content.length) {
      segments.push(
        <span key="text-end" className="text-gray-900">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed">{segments}</div>
    );
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b">
        <span className="text-sm font-semibold text-gray-700">Legend:</span>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-green-200 border border-green-500 rounded"></span>
          <span className="text-xs text-gray-600">Common Phrase</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-blue-200 border border-blue-500 rounded"></span>
          <span className="text-xs text-gray-600">Properly Quoted</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-yellow-200 border border-yellow-500 rounded"></span>
          <span className="text-xs text-gray-600">Close Paraphrase</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-red-200 border border-red-500 rounded"></span>
          <span className="text-xs text-gray-600">Needs Citation</span>
        </div>
      </div>

      {/* Highlighted content */}
      <div className="prose max-w-none">{renderHighlightedText()}</div>

      {/* Click hint */}
      {matches.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500 italic">
            💡 Click on highlighted text to see match details and get rephrase
            suggestions
          </p>
        </div>
      )}
    </div>
  );
};
