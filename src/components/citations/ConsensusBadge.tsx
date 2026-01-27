import React from "react";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

export type ConsensusLevel = "strong" | "emerging" | "divided" | "controversial";

interface ConsensusBadgeProps {
    consensusLevel: ConsensusLevel;
    agreementPercentage: number;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
}

export const ConsensusBadge: React.FC<ConsensusBadgeProps> = ({
    consensusLevel,
    agreementPercentage,
    showLabel = true,
    size = "md"
}) => {
    const getConfig = () => {
        switch (consensusLevel) {
            case "strong":
                return {
                    icon: TrendingUp,
                    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
                    label: "Strong Consensus",
                    emoji: "🟢"
                };
            case "emerging":
                return {
                    icon: TrendingUp,
                    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
                    label: "Emerging Consensus",
                    emoji: "🟡"
                };
            case "divided":
                return {
                    icon: Minus,
                    color: "bg-orange-100 text-orange-700 border-orange-300",
                    label: "Divided",
                    emoji: "🟠"
                };
            case "controversial":
                return {
                    icon: TrendingDown,
                    color: "bg-red-100 text-red-700 border-red-300",
                    label: "Controversial",
                    emoji: "🔴"
                };
        }
    };

    const config = getConfig();
    const Icon = config.icon;

    const sizeClasses = {
        sm: "text-xs px-2 py-0.5",
        md: "text-sm px-3 py-1",
        lg: "text-base px-4 py-2"
    };

    const iconSizes = {
        sm: 12,
        md: 14,
        lg: 16
    };

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-full border ${config.color} ${sizeClasses[size]} font-medium`}
        >
            <Icon size={iconSizes[size]} />
            {showLabel && (
                <>
                    <span>{config.label}</span>
                    <span className="font-bold">{agreementPercentage}%</span>
                </>
            )}
            {!showLabel && <span className="font-bold">{agreementPercentage}%</span>}
        </div>
    );
};
