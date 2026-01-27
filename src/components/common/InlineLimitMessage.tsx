import React from "react";
import { AlertCircle, Lock, Coins } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export type LimitMessageType =
    | "PLAN_LIMIT_REACHED"
    | "INSUFFICIENT_CREDITS"
    | "FEATURE_NOT_ALLOWED"
    | "SYSTEM_ERROR";

interface InlineLimitMessageProps {
    type: LimitMessageType | string;
    title?: string;
    message: string;
    onAction?: () => void;
    actionLabel?: string;
    className?: string;
    compact?: boolean;
}

export const InlineLimitMessage: React.FC<InlineLimitMessageProps> = ({
    type,
    title,
    message,
    onAction,
    actionLabel,
    className,
    compact = false
}) => {
    let styles = {
        bg: "bg-gray-50",
        border: "border-gray-200",
        iconColor: "text-gray-500",
        textColor: "text-gray-700",
        icon: Lock
    };

    // Determine styles based on type
    if (type === "PLAN_LIMIT_REACHED") {
        styles = {
            bg: "bg-amber-50",
            border: "border-amber-200",
            iconColor: "text-amber-600",
            textColor: "text-amber-800",
            icon: AlertCircle
        };
    } else if (type === "INSUFFICIENT_CREDITS") {
        styles = {
            bg: "bg-purple-50",
            border: "border-purple-200",
            iconColor: "text-purple-600",
            textColor: "text-purple-800",
            icon: Coins
        };
    } else if (type === "SYSTEM_ERROR") {
        styles = {
            bg: "bg-red-50",
            border: "border-red-200",
            iconColor: "text-red-600",
            textColor: "text-red-800",
            icon: AlertCircle
        };
    }

    const Icon = styles.icon;

    return (
        <div className={cn(
            "rounded-lg border p-4 flex flex-col gap-3",
            styles.bg,
            styles.border,
            className
        )}>
            <div className="flex items-start gap-3">
                <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", styles.iconColor)} />
                <div className="flex-1">
                    {title && (
                        <h4 className={cn("font-medium text-sm mb-1", styles.textColor)}>
                            {title}
                        </h4>
                    )}
                    <p className={cn("text-sm leading-relaxed", styles.textColor)}>
                        {message}
                    </p>
                </div>
            </div>

            {onAction && actionLabel && (
                <div className="flex justify-end">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onAction}
                        className={cn(
                            "bg-white hover:bg-white/80 border-current font-medium h-8 text-xs",
                            styles.iconColor // Use the main theme color for text
                        )}
                    >
                        {actionLabel}
                    </Button>
                </div>
            )}
        </div>
    );
};
