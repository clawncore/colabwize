import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface ValueMetricCardProps {
    value: number;
    label: string;
    percentageChange?: number;
    comparisonLabel?: string;
    isCurrency?: boolean;
    isDate?: boolean;
}

export const ValueMetricCard: React.FC<ValueMetricCardProps> = ({
    value,
    label,
    percentageChange,
    comparisonLabel = "vs last month",
    isCurrency = false,
    isDate = false,
}) => {
    const getTrendIcon = () => {
        if (!percentageChange) return null;
        if (percentageChange > 0) return <TrendingUp className="h-4 w-4" />;
        if (percentageChange < 0) return <TrendingDown className="h-4 w-4" />;
        return <Minus className="h-4 w-4" />;
    };

    const getTrendColor = () => {
        if (!percentageChange) return "text-gray-500";
        if (percentageChange > 0) return "text-green-600";
        if (percentageChange < 0) return "text-red-600";
        return "text-gray-500";
    };

    // Only show delta if it's a valid, defendable number (not NaN, not Infinity)
    const showDelta =
        percentageChange !== undefined &&
        percentageChange !== null &&
        !isNaN(percentageChange) &&
        isFinite(percentageChange);

    const formatValue = () => {
        if (isCurrency) {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        }
        if (isDate) {
            return value.toString(); // Date day or custom string
        }
        return value.toLocaleString();
    };

    return (
        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6 pb-5">
                <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                        {formatValue()}
                    </div>
                    <div className="text-sm text-gray-500 font-medium mt-1">
                        {label}
                    </div>
                    {showDelta && (
                        <div
                            className={`flex items-center justify-center gap-1 text-xs font-medium mt-3 ${getTrendColor()}`}
                        >
                            {getTrendIcon()}
                            <span>
                                {percentageChange > 0 ? "+" : ""}
                                {percentageChange}% {comparisonLabel}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
