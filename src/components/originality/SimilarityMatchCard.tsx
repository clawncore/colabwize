
import React from "react";
import { SimilarityMatch } from "../../services/originalityService";
import { ExternalLink, Globe } from "lucide-react";

interface SimilarityMatchCardProps {
  match: SimilarityMatch;
  onGetRephrase: (match: SimilarityMatch) => void;
  onViewComparison: (url: string) => void;
  isLoadingRephrase?: boolean;
  onAskAI?: (prompt: string, hiddenCtx: string) => void;
}

export const SimilarityMatchCard: React.FC<SimilarityMatchCardProps> = ({
  match,
  onViewComparison,
  onAskAI
}) => {
  const [explanation, setExplanation] = React.useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = React.useState(false);

  const handleExplainRisk = async () => {
    if (onAskAI) {
      const prompt = `Explain why the following text was flagged as ${match.similarityScore}% similar to "${match.sourceUrl || "External Source"}". \n\nFlagged Text: "${match.sentenceText}"\n\nIs this a problem?`;
      const hiddenCtx = `The user is asking about a specific similarity match. Analyzer classification: ${match.classification}. Source words: ${match.sourceWords}. Overlap: ${match.matchedWords}.`;
      onAskAI(prompt, hiddenCtx);
      return;
    }

    if (explanation) {
      setExplanation(null);
      return;
    }

    setLoadingExplanation(true);
    try {
      const { OriginalityService } = await import("../../services/originalityService");
      const result = await OriginalityService.explainRisk(
        match.sentenceText,
        match.matchedSource,
        match.similarityScore >= 80 ? "High" : match.similarityScore >= 60 ? "Moderate" : "Low"
      );
      setExplanation(result);
    } catch (error) {
      console.error(error);
      setExplanation("Could not generate explanation.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  const score = match.similarityScore || 0;

  // UARS: Evidence Record Style
  return (
    <div className="bg-white rounded-[10px] border border-[#e5e7eb] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:border-[#cbd5e1] transition-colors group">

      {/* Record Header - Textual Severity */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-bold text-[#111827]">
            Similarity: {Math.round(score)}%
            <span className="ml-2 font-normal text-[#6b7280]">
              ({score >= 80 ? 'High' : score >= 60 ? 'Moderate' : 'Low'})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#4f46e5] mt-0.5">
            <Globe className="w-3 h-3" />
            <span className="truncate max-w-[200px] hover:underline">
              {match.sourceUrl ? new URL(match.sourceUrl).hostname : 'External Source'}
            </span>
          </div>
        </div>
      </div>

      {/* Data Grid (Forensic) */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-[#6b7280] mb-4 bg-[#f8fafc] p-3 rounded-lg border border-[#f1f5f9]">
        <div>
          <span className="block text-[10px] uppercase font-bold text-[#9ca3af]">Overlap</span>
          <span className="text-[#111827] font-medium">{match.matchedWords} / {match.sourceWords} words</span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-[#9ca3af]">Classification</span>
          <span className="text-[#111827] font-medium">{score > 90 ? "Verbatim" : "Paraphrased"}</span>
        </div>
      </div>

      {/* Snippet Context */}
      <div className="text-xs text-[#374151] italic line-clamp-2 leading-relaxed opacity-80 pl-2 border-l-2 border-[#e5e7eb]">
        "{match.sentenceText}"
      </div>

      {/* Actions */}
      <div className="mt-4 pt-3 border-t border-[#f1f5f9]">
        <button
          onClick={handleExplainRisk}
          disabled={loadingExplanation}
          className="flex items-center justify-center w-full py-1.5 px-3 text-xs font-medium text-[#374151] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f8fafc] transition-colors disabled:opacity-50"
        >
          {loadingExplanation ? "..." : explanation ? "Close" : "Explain"}
        </button>
      </div>

      {/* Explanation Result */}
      {explanation && (
        <div className="mt-3 p-3 bg-[#f8fafc] border border-[#e5e7eb] rounded-lg text-xs text-[#4b5563] leading-relaxed animate-in fade-in slide-in-from-top-1">
          <span className="font-bold text-[#111827] block mb-1 text-[10px] uppercase">Forensic Context</span>
          {explanation}
        </div>
      )}
    </div>
  );
};
