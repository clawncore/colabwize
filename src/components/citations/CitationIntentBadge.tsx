import React from "react";
import { ThumbsUp, ThumbsDown, BookOpen, Beaker } from "lucide-react"

    ;

export type CitationIntent = "supporting" | "contrasting" | "background" | "methodology";

interface CitationIntentBadgeProps {
    intent: CitationIntent;
    confidence?: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export const CitationIntentBadge: React.FC<CitationIntentBadgeProps> = ({
    intent,
    confidence,
    size = "md",
    showLabel = true
}) => {
    const getIntentConfig = () => {
        switch (intent) {
            case "supporting":
                return {
                    icon: ThumbsUp,
                    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
                    label: "Supporting",
                    emoji: "✓"
                };
            case "contrasting":
                return {
                    icon: ThumbsDown,
                    color: "bg-red-100 text-red-700 border-red-300",
                    label: "Contrasting",
                    emoji: "✗"
                };
            case "background":
                return {
                    icon: BookOpen,
                    color: "bg-blue-100 text-blue-700 border-blue-300",
                    label: "Background",
                    emoji: "ℹ"
                };
            case "methodology":
                return {
                    icon: Beaker,
                    color: "bg-purple-100 text-purple-700 border-purple-300",
                    label: "Methodology",
                    emoji: "⚙"
                };
        }
    };

    const config = getIntentConfig();
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

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
            title={confidence ? `${config.label} (${(confidence * 100).toFixed(0)}% confidence)` : config.label}
        >
            <Icon className={iconSizes[size]} />
            {showLabel && <span>{config.label}</span>}
        </span>
    );
};

interface IntentLegendProps {
    compact?: boolean;
}

export const IntentLegend: React.FC<IntentLegendProps> = ({ compact = false }) => {
    const intents: CitationIntent[] = ["supporting", "contrasting", "background", "methodology"];

    if (compact) {
        return (
            <div className="flex flex-wrap gap-2">
                {intents.map(intent => (
                    <CitationIntentBadge key={intent} intent={intent} size="sm" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Citation Intent</h4>
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                    <CitationIntentBadge intent="supporting" size="sm" showLabel={false} />
                    <span className="text-xs text-gray-600">Supports claim</span>
                </div>
                <div className="flex items-center gap-2">
                    <CitationIntentBadge intent="contrasting" size="sm" showLabel={false} />
                    <span className="text-xs text-gray-600">Opposes claim</span>
                </div>
                <div className="flex items-center gap-2">
                    <CitationIntentBadge intent="background" size="sm" showLabel={false} />
                    <span className="text-xs text-gray-600">Background info</span>
                </div>
                <div className="flex items-center gap-2">
                    <CitationIntentBadge intent="methodology" size="sm" showLabel={false} />
                    <span className="text-xs text-gray-600">Method/tool</span>
                </div>
            </div>
        </div>
    );
};
