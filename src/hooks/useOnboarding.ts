import { useState, useEffect } from "react";
import { OnboardingService } from "../services/onboardingService";

export const useOnboarding = () => {
  const [shouldShowTour, setShouldShowTour] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    // 🛡️ FRONTEND GUARD: If already seen in this session/browser, skip entirely.
    const localStatus = localStorage.getItem("cw_onboarding_seen");
    if (localStatus === "true") {
      setShouldShowTour(false);
      setLoading(false);
      return;
    }

    try {
      const status = await OnboardingService.getStatus();
      setShouldShowTour(status.shouldShowTour);

      // If server says no tour needed, sync local for future efficiency
      if (!status.shouldShowTour) {
        localStorage.setItem("cw_onboarding_seen", "true");
      }
    } catch (error) {
      console.error("Failed to get onboarding status:", error);
      setShouldShowTour(false);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    // Optimistic local update
    localStorage.setItem("cw_onboarding_seen", "true");
    setShouldShowTour(false);

    try {
      await OnboardingService.completeOnboarding();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const skipOnboarding = async () => {
    // Optimistic local update
    localStorage.setItem("cw_onboarding_seen", "true");
    setShouldShowTour(false);

    try {
      await OnboardingService.skipOnboarding();
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
    }
  };

  return {
    shouldShowTour,
    loading,
    completeOnboarding,
    skipOnboarding,
  };
};
