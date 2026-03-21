import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Lock, X, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export type UpgradeReason =
  | "PLAN_LIMIT_REACHED"
  | "INSUFFICIENT_CREDITS"
  | "FEATURE_NOT_ALLOWED"
  | string;

interface AIChatUpgradeModalProps {
  reason: UpgradeReason;
  message?: string;
  onDismiss?: () => void;
}

/**
 * Full-screen blocking overlay shown inside the AIChatPanel when a user
 * has exhausted their AI chat quota. It prevents further interaction and
 * prompts the user to upgrade their plan or purchase credits.
 */
export const AIChatUpgradeModal: React.FC<AIChatUpgradeModalProps> = ({
  reason,
  message,
  onDismiss,
}) => {
  const navigate = useNavigate();

  const isCredits = reason === "INSUFFICIENT_CREDITS";

  const config = isCredits
    ? {
        icon: <Zap className="w-8 h-8 text-violet-500" />,
        badge: "Credits Empty",
        badgeClass: "bg-violet-100 text-violet-700",
        title: "You've run out of credits",
        description:
          message ||
          "Purchase more credits to continue chatting with your AI Research Assistant.",
        primaryLabel: "Billing Dashboard",
        primaryPath: "/dashboard/billing/subscription",
        primaryClass: "bg-violet-600 hover:bg-violet-700 text-white",
        secondaryLabel: "View Plans",
        secondaryPath: "/pricing",
        gradient: "from-violet-50 to-fuchsia-50",
        ring: "ring-violet-200",
      }
    : {
        icon: <Sparkles className="w-8 h-8 text-indigo-500" />,
        badge: "Limit Reached",
        badgeClass: "bg-indigo-100 text-indigo-700",
        title: "Monthly AI chat limit reached",
        description:
          message ||
          "You've used all your AI chat messages for this month. Upgrade your plan to keep chatting.",
        primaryLabel: "Upgrade Plan",
        primaryPath: "/pricing",
        primaryClass: "bg-indigo-600 hover:bg-indigo-700 text-white",
        secondaryLabel: "Learn More",
        secondaryPath: "/pricing",
        gradient: "from-indigo-50 to-blue-50",
        ring: "ring-indigo-200",
      };

  return (
    // Absolute overlay covering the entire panel content area
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 dark:bg-gray-950/80 backdrop-blur-sm">
      <div
        className={cn(
          "relative mx-4 w-full max-w-sm rounded-2xl bg-gradient-to-br p-6 shadow-xl ring-1",
          config.gradient,
          config.ring,
        )}>
        {/* Optional dismiss (if a lighter block is desired) */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Icon + badge */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center ring-1 ring-gray-100">
            {config.icon}
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              config.badgeClass,
            )}>
            <Lock className="w-3 h-3" />
            {config.badge}
          </span>

          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {config.title}
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Plan highlights */}
        <div className="mt-5 rounded-xl bg-white/80 border border-gray-100 p-4 space-y-2">
          {[
            "Unlimited AI Research Assistant chats",
            "Advanced citation & originality analysis",
            "Priority access to all AI features",
          ].map((benefit) => (
            <div
              key={benefit}
              className="flex items-center gap-2 text-sm text-gray-700">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              {benefit}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2">
          <Button
            className={cn(
              "w-full gap-2 font-semibold rounded-xl py-5",
              config.primaryClass,
            )}
            onClick={() => navigate(config.primaryPath)}>
            {config.primaryLabel}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            className="w-full text-gray-500 hover:text-gray-700 text-sm"
            onClick={() => navigate(config.secondaryPath)}>
            {config.secondaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
