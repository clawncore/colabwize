import React, { useState } from "react";
import { CitationService, SuggestedPaper } from "../../services/citationService";

interface FindMissingLinkButtonProps {
  projectId: string;
  keywords: string[];
  field?: string;
  onSuggestionsFound: (papers: SuggestedPaper[]) => void;
}

export const FindMissingLinkButton: React.FC<FindMissingLinkButtonProps> = ({
  projectId,
  keywords,
  field = "default",
  onSuggestionsFound,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const papers = await CitationService.findMissingLink(projectId, keywords, field);
      onSuggestionsFound(papers);
    } catch (err: any) {
      setError(err.message || "Failed to find suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading || keywords.length === 0}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
      >
        {isLoading ? (
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
            Finding Papers...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span>🔍</span>
            Find Missing Link
          </span>
        )}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
