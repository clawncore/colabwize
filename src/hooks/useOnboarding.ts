import { useState, useEffect } from "react";
import { OnboardingService } from "../services/onboardingService";

export const useOnboarding = () => {
  const [shouldShowTour, setShouldShowTour] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const status = await OnboardingService.getStatus();
      setShouldShowTour(status.shouldShowTour);
    } catch (error) {
      console.error("Failed to get onboarding status:", error);
      // Default to not showing tour on error
      setShouldShowTour(false);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await OnboardingService.completeOnboarding();
      setShouldShowTour(false);
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const skipOnboarding = async () => {
    try {
      await OnboardingService.skipOnboarding();
      setShouldShowTour(false);
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
