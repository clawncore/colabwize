import { useState, useCallback } from "react";

export type UpgradeFeature =
  | "originality_scan"
  | "ai_detection"
  | "citation_check"
  | "certificate";

interface UseUpgradePromptReturn {
  isOpen: boolean;
  feature: UpgradeFeature | null;
  openUpgradePrompt: (feature: UpgradeFeature) => void;
  closeUpgradePrompt: () => void;
}

export function useUpgradePrompt(): UseUpgradePromptReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [feature, setFeature] = useState<UpgradeFeature | null>(null);

  const openUpgradePrompt = useCallback((newFeature: UpgradeFeature) => {
    setFeature(newFeature);
    setIsOpen(true);

    // Optional: Track analytics
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "upgrade_prompt_shown", {
        feature: newFeature,
      });
    }
  }, []);

  const closeUpgradePrompt = useCallback(() => {
    setIsOpen(false);

    // Optional: Track dismissals
    if (feature && typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "upgrade_prompt_dismissed", {
        feature,
      });
    }

    // Reset feature after animation completes
    setTimeout(() => setFeature(null), 300);
  }, [feature]);

  return {
    isOpen,
    feature,
    openUpgradePrompt,
    closeUpgradePrompt,
  };
}
