import React from "react";
import { AISentenceResult } from "../../services/aiDetectionService";

interface AIProbabilityHeatmapProps {
    content: string;
    results: AISentenceResult[];
    onSentenceClick?: (sentence: AISentenceResult) => void;
}

export const AIProbabilityHeatmap: React.FC<AIProbabilityHeatmapProps> = ({
    content,
    results,
    onSentenceClick,
}) => {
    const renderHighlightedText = () => {
        if (results.length === 0) {
            return <p className="text-gray-900 whitespace-pre-wrap">{content}</p>;
        }

        // Sort results by position
        const sortedResults = [...results].sort(
            (a, b) => a.positionStart - b.positionStart
        );

        const segments: React.ReactNode[] = [];
        let lastIndex = 0;

        sortedResults.forEach((result, index) => {
            // Add text before result
            if (result.positionStart > lastIndex) {
                segments.push(
                    <span key={`text-${index}`} className="text-gray-900">
                        {content.substring(lastIndex, result.positionStart)}
                    </span>
                );
            }

            // Add highlighted result
            // Colors from blueprint: Shades of purple/blue to distinguish from originality (red/yellow)
            let colorClass = "";
            switch (result.classification) {
                case "human":
                    colorClass = "bg-transparent";
                    break;
                case "likely_human":
                    colorClass = "bg-blue-50 border-b border-blue-200 hover:bg-blue-100";
                    break;
                case "likely_ai":
                    colorClass = "bg-purple-100 border-b-2 border-purple-300 hover:bg-purple-200";
                    break;
                case "ai":
                    colorClass = "bg-purple-200 border-b-2 border-purple-500 hover:bg-purple-300";
                    break;
                default:
                    colorClass = "bg-gray-100";
            }

            segments.push(
                <span
                    key={`ai-match-${index}`}
                    className={`${colorClass} cursor-pointer transition-colors rounded px-0.5`}
                    onClick={() => onSentenceClick?.(result)}
                    title={`AI Probability: ${Math.round(result.score)}%`}>
                    {content.substring(result.positionStart, result.positionEnd)}
                </span>
            );

            lastIndex = result.positionEnd;
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
                <span className="text-sm font-semibold text-gray-700">Legend (AI Prob):</span>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-purple-200 border border-purple-500 rounded"></span>
                    <span className="text-xs text-gray-600">High Prob ({">"}80%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-purple-100 border border-purple-300 rounded"></span>
                    <span className="text-xs text-gray-600">Likely AI ({">"}50%)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-blue-50 border border-blue-200 rounded"></span>
                    <span className="text-xs text-gray-600">Likely Human</span>
                </div>
            </div>

            {/* Highlighted content */}
            <div className="prose max-w-none">{renderHighlightedText()}</div>

            <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 italic">
                    💡 This heatmap shows the probability of each sentence being AI-generated.
                </p>
            </div>
        </div>
    );
};
