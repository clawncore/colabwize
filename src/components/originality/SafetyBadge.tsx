import React from "react";

interface SafetyBadgeProps {
  classification:
    | "safe"
    | "review"
    | "action_required"
    | "green"
    | "yellow"
    | "red"
    | "common_phrase"
    | "quoted_correctly"
    | "needs_citation"
    | "close_paraphrase";
  score?: number;
  size?: "sm" | "md" | "lg";
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({
  classification,
  score,
  size = "md",
}) => {
  // Normalize classification
  const normalizedClass =
    classification === "green"
      ? "safe"
      : classification === "yellow"
        ? "review"
        : classification === "red"
          ? "action_required"
          : classification;

  // Color mapping
  const colors: Record<string, string> = {
    safe: "bg-green-100 text-green-800 border-green-300",
    review: "bg-yellow-100 text-yellow-800 border-yellow-300",
    action_required: "bg-red-100 text-red-800 border-red-300",
    common_phrase: "bg-green-100 text-green-800 border-green-300",
    quoted_correctly: "bg-blue-100 text-blue-800 border-blue-300",
    close_paraphrase: "bg-yellow-100 text-yellow-800 border-yellow-300",
    needs_citation: "bg-red-100 text-red-800 border-red-300",
  };

  // Size mapping
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  // Label mapping
  const labels: Record<string, string> = {
    safe: "Safe",
    review: "Potential Match",
    action_required: "Review Needed",
    common_phrase: "Common Phrase",
    quoted_correctly: "Properly Quoted",
    close_paraphrase: "Close Paraphrase",
    needs_citation: "Needs Citation",
  };

  // Icon mapping
  const icons: Record<string, string> = {
    safe: "✓",
    review: "⚠",
    action_required: "✕",
    common_phrase: "✅",
    quoted_correctly: "ℹ️",
    close_paraphrase: "⚠️",
    needs_citation: "❗",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${
        colors[normalizedClass]
      } ${sizes[size]}`}>
      <span className="font-bold">{icons[normalizedClass]}</span>
      <span>{labels[normalizedClass]}</span>
      {score !== undefined && (
        <span className="font-semibold">{Math.round(score)}%</span>
      )}
    </span>
  );
};
