import React, { useEffect, useState, useCallback } from "react";
import { apiClient } from "../../services/apiClient";
import { AlertCircle, TrendingUp, BookOpen, Beaker, Loader2, ExternalLink } from "lucide-react";

interface ResearchGap {
    type: "temporal" | "topical" | "methodological";
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
    suggestedKeywords: string[];
    relatedCitations: string[];
}

interface ResearchGapsPanelProps {
    projectId: string;
    onSearchGap?: (keywords: string[]) => void;
}

export const ResearchGapsPanel: React.FC<ResearchGapsPanelProps> = ({ projectId, onSearchGap }) => {
    const [gaps, setGaps] = useState<ResearchGap[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string | null>(null);

    const fetchGaps = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/citations/${projectId}/gaps`);
            setGaps(response.gaps || []);
        } catch (error) {
            console.error("Failed to fetch research gaps", error);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchGaps();
    }, [fetchGaps]);

    const getIcon = (type: string) => {
        switch (type) {
            case "temporal":
                return <TrendingUp className="w-5 h-5" />;
            case "topical":
                return <BookOpen className="w-5 h-5" />;
            case "methodological":
                return <Beaker className="w-5 h-5" />;
            default:
                return <AlertCircle className="w-5 h-5" />;
        }
    };



    const getTypeColor = (type: string) => {
        switch (type) {
            case "temporal":
                return "text-purple-600 bg-purple-50 border-purple-200";
            case "topical":
                return "text-emerald-600 bg-emerald-50 border-emerald-200";
            case "methodological":
                return "text-blue-600 bg-blue-50 border-blue-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    const filteredGaps = filterType
        ? gaps.filter(g => g.type === filterType)
        : gaps;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (gaps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Coverage</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                    No significant research gaps detected. Your citations provide well-rounded coverage.
                </p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-gray-50/50">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
                <h1 className="text-lg font-bold text-gray-900 mb-1">Research Gaps</h1>
                <p className="text-xs text-gray-500 mb-3 leading-snug">
                    AI-detected opportunities for deeper exploration.
                </p>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterType(null)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === null
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType("temporal")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === "temporal"
                            ? "bg-purple-600 text-white shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                    >
                        Time
                    </button>
                    <button
                        onClick={() => setFilterType("topical")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === "topical"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                    >
                        Topic
                    </button>
                    <button
                        onClick={() => setFilterType("methodological")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterType === "methodological"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                            }`}
                    >
                        Method
                    </button>
                </div>
            </div>

            {/* Gap Cards */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <div className="flex flex-col gap-3">
                    {filteredGaps.map((gap, index) => (
                        <div
                            key={index}
                            className={`border rounded-lg p-4 transition-all bg-white hover:shadow-md ${gap.severity === "high" ? "border-red-200 hover:border-red-300" :
                                gap.severity === "medium" ? "border-yellow-200 hover:border-yellow-300" :
                                    "border-blue-200 hover:border-blue-300"
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`p-2 rounded-lg flex-shrink-0 ${getTypeColor(gap.type)}`}>
                                    {getIcon(gap.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <h3 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">
                                            {gap.title}
                                        </h3>
                                    </div>
                                    <span className={`inline-block px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wide rounded ${gap.severity === "high" ? "bg-red-50 text-red-700" :
                                        gap.severity === "medium" ? "bg-yellow-50 text-yellow-700" :
                                            "bg-blue-50 text-blue-700"
                                        }`}>
                                        {gap.severity} Priority
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                {gap.description}
                            </p>

                            {/* Suggested Keywords */}
                            {gap.suggestedKeywords.length > 0 && (
                                <div className="mb-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {gap.suggestedKeywords.slice(0, 3).map((kw, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 text-[10px] bg-gray-100 border border-gray-200 rounded text-gray-600 truncate max-w-full"
                                            >
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={() => onSearchGap?.(gap.suggestedKeywords)}
                                className="flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-medium transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Explore Papers
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
