import React, { useEffect, useState } from "react";
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

    useEffect(() => {
        fetchGaps();
    }, [projectId]);

    const fetchGaps = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/api/citations/${projectId}/gaps`);
            setGaps(response.gaps || []);
        } catch (error) {
            console.error("Failed to fetch research gaps", error);
        } finally {
            setLoading(false);
        }
    };

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

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high":
                return "bg-red-50 border-red-200 text-red-800";
            case "medium":
                return "bg-yellow-50 border-yellow-200 text-yellow-800";
            case "low":
                return "bg-blue-50 border-blue-200 text-blue-800";
            default:
                return "bg-gray-50 border-gray-200 text-gray-800";
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
        <div className="h-full w-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Research Gaps & Opportunities</h1>
                    <p className="text-sm text-gray-600">AI-detected opportunities for deeper exploration in your literature</p>

                    {/* Filters */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setFilterType(null)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === null
                                ? "bg-indigo-600 text-white shadow-md"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                }`}
                        >
                            All Gaps ({gaps.length})
                        </button>
                        <button
                            onClick={() => setFilterType("temporal")}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === "temporal"
                                ? "bg-purple-600 text-white shadow-md"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                }`}
                        >
                            🕐 Temporal
                        </button>
                        <button
                            onClick={() => setFilterType("topical")}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === "topical"
                                ? "bg-emerald-600 text-white shadow-md"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                }`}
                        >
                            📚 Topical
                        </button>
                        <button
                            onClick={() => setFilterType("methodological")}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filterType === "methodological"
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                }`}
                        >
                            🔬 Methodological
                        </button>
                    </div>
                </div>
            </div>

            {/* Gap Cards */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredGaps.map((gap, index) => (
                        <div
                            key={index}
                            className={`border rounded-xl p-6 transition-all hover:shadow-lg bg-white ${gap.severity === "high" ? "border-red-300 hover:border-red-400" :
                                    gap.severity === "medium" ? "border-yellow-300 hover:border-yellow-400" :
                                        "border-blue-300 hover:border-blue-400"
                                }`}
                        >
                            {/* Header */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`p-3 rounded-xl ${getTypeColor(gap.type)}`}>
                                    {getIcon(gap.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-base text-gray-900">{gap.title}</h3>
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${gap.severity === "high" ? "bg-red-100 text-red-700" :
                                                gap.severity === "medium" ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-blue-100 text-blue-700"
                                            }`}>
                                            {gap.severity.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{gap.description}</p>
                                </div>
                            </div>

                            {/* Suggested Keywords */}
                            {gap.suggestedKeywords.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">📌 Suggested keywords:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {gap.suggestedKeywords.map((kw, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1.5 text-xs bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-200 transition-colors"
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
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Explore Papers for this Gap
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
