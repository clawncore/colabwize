import { apiClient } from "./apiClient";

export interface OnboardingStatus {
  completed: boolean;
  skipped: boolean;
  hasUploaded: boolean;
  shouldShowTour: boolean;
  editorTourCompleted?: boolean;
  shouldShowEditorTour?: boolean;
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

  /**
   * Mark editor tour as completed
   */
  static async completeEditorTour(): Promise<void> {
    await apiClient.post("/api/onboarding/editor-tour/complete", {});
  }

  /**
   * Mark editor tour as skipped
   */
  static async skipEditorTour(): Promise<void> {
    await apiClient.post("/api/onboarding/editor-tour/skip", {});
  }

  /**
   * Get editor tour status from localStorage (fallback if backend not available)
   */
  static getEditorTourStatusLocal(): boolean {
    return localStorage.getItem("editor_tour_completed") === "true";
  }

  /**
   * Mark editor tour as completed locally
   */
  static completeEditorTourLocal(): void {
    localStorage.setItem("editor_tour_completed", "true");
  }
}
