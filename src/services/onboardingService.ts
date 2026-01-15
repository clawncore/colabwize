import { apiClient } from "./apiClient";

export interface OnboardingStatus {
  completed: boolean;
  skipped: boolean;
  hasUploaded: boolean;
  shouldShowTour: boolean;
}

export class OnboardingService {
  /**
   * Get user's onboarding status
   */
  static async getStatus(): Promise<OnboardingStatus> {
    const response = await apiClient.get("/api/onboarding/status");
    return response.data;
  }

  /**
   * Mark onboarding as completed
   */
  static async completeOnboarding(): Promise<void> {
    await apiClient.post("/api/onboarding/complete", {});
  }

  /**
   * Mark onboarding as skipped
   */
  static async skipOnboarding(): Promise<void> {
    await apiClient.post("/api/onboarding/skip", {});
  }
}
