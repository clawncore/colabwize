import React from "react";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";

export type CredibilityLevel = "high" | "medium" | "low";

interface CredibilityBadgeProps {
    level: CredibilityLevel;
    score?: number;
    flags?: string[];
    showDetails?: boolean;
    size?: "sm" | "md" | "lg";
}

export const CredibilityBadge: React.FC<CredibilityBadgeProps> = ({
    level,
    score,
    flags = [],
    showDetails = false,
    size = "md"
}) => {
    const getConfig = () => {
        switch (level) {
            case "high":
                return {
                    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    icon: CheckCircle,
                    label: "High Credibility",
                    bgColor: "bg-emerald-50"
                };
            case "medium":
                return {
                    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
                    icon: Shield,
                    label: "Moderate Credibility",
                    bgColor: "bg-yellow-50"
                };
            case "low":
                return {
                    color: "bg-red-100 text-red-800 border-red-300",
                    icon: AlertCircle,
                    label: "Low Credibility",
                    bgColor: "bg-red-50"
                };
        }
    };

    const config = getConfig();
    const Icon = config.icon;

    const sizeClasses = {
        sm: "text-xs px-1.5 py-0.5",
        md: "text-xs px-2 py-1",
        lg: "text-sm px-3 py-1.5"
    };

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-3.5 h-3.5",
        lg: "w-4 h-4"
    };

    if (!showDetails) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
                title={score ? `Credibility Score: ${score}/100` : config.label}
            >
                <Icon className={iconSizes[size]} />
                {score && <span>{score}</span>}
            </span>
        );
    }

    // Detailed view with flags
    return (
        <div className={`rounded-lg border ${config.color.replace('bg-', 'border-').replace('-100', '-200')} p-3 ${config.bgColor}`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className={iconSizes.lg} />
                <div className="flex-1">
                    <div className="font-semibold text-sm">{config.label}</div>
                    {score && <div className="text-xs opacity-75">Score: {score}/100</div>}
                </div>
            </div>

            {flags.length > 0 && (
                <div className="space-y-1 mt-2 pt-2 border-t border-current/10">
                    {flags.map((flag, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs">
                            <span className="opacity-50">•</span>
                            <span className="flex-1">{flag}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface CredibilityTooltipProps {
    level: CredibilityLevel;
    score: number;
    factors: {
        citationScore: number;
        recencyScore: number;
        peerReviewScore: number;
        journalScore: number;
    };
    flags: string[];
}

export const CredibilityTooltip: React.FC<CredibilityTooltipProps> = ({
    level,
    score,
    factors,
    flags
}) => {
    return (
        <div className="w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-200 text-sm">
            <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900">Credibility Analysis</span>
                <span className="text-2xl font-bold text-gray-700">{score}</span>
            </div>

            <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Citations</span>
                    <span className="font-medium">{factors.citationScore}/100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Recency</span>
                    <span className="font-medium">{factors.recencyScore}/100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Peer Review</span>
                    <span className="font-medium">{factors.peerReviewScore}/100</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Journal Quality</span>
                    <span className="font-medium">{factors.journalScore}/100</span>
                </div>
            </div>

            {flags.length > 0 && (
                <>
                    <div className="border-t border-gray-200 pt-2 mb-2" />
                    <div className="space-y-1">
                        {flags.map((flag, idx) => (
                            <div key={idx} className="flex items-start gap-1 text-xs text-gray-600">
                                <span>•</span>
                                <span className="flex-1">{flag}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
