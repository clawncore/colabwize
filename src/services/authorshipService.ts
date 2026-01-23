import { apiClient } from "./apiClient";

export interface AuthorshipStats {
  projectId: string;
  userId: string;
  projectTitle: string;
  wordCount: number;
  totalTimeInvestedMinutes: number;
  firstEditDate: Date;
  lastEditDate: Date;
  activeDays: number;
  totalSessions: number;
  manualEditsCount: number;
  totalCharacterChanges: number;
  averageEditSize: number;
  aiAssistedPercentage: number;
  aiRequestCount: number;
  sessionFrequency: string;
  peakEditingHours: number[];
}

export interface QuickStats {
  wordCount: number;
  totalTimeHours: number;
  manualEditsCount: number;
  aiAssistedPercentage: number;
}

export class AuthorshipService {
  /**
   * Generate and download authorship certificate
   */
  static async generateCertificate(
    projectId: string,
    projectTitle: string,
    certificateType: "authorship" | "originality" | "completion" = "authorship",
    includeQRCode: boolean = true
  ): Promise<Blob> {
    try {
      const response = await apiClient.download("/api/authorship/generate", {
        projectId,
        projectTitle,
        certificateType,
        includeQRCode,
      });

      return await response.blob();
    } catch (error: any) {
      console.error("Error generating certificate:", error);
      throw error;
    }
  }

  /**
   * Get full authorship statistics
   */
  static async getStats(projectId: string): Promise<AuthorshipStats> {
    try {
      const response = await apiClient.get(
        `/api/authorship/stats/${projectId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error getting authorship stats:", error);
      throw new Error(error.message || "Failed to get statistics");
    }
  }

  /**
   * Get quick statistics (lighter version)
   */
  static async getQuickStats(projectId: string): Promise<QuickStats> {
    try {
      const response = await apiClient.get(
        `/api/authorship/quick-stats/${projectId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error getting quick stats:", error);
      throw new Error(error.message || "Failed to get quick statistics");
    }
  }

  /**
   * Record user activity for authorship tracking
   */
  static async recordActivity(activityData: {
    projectId: string;
    timeSpent: number;
    editCount: number;
    wordCount: number;
    manualEdits?: number;
    aiAssistedEdits?: number;
    isDelta?: boolean;
  }): Promise<void> {
    try {
      await apiClient.post("/api/authorship/record-activity", activityData);
    } catch (error: any) {
      console.error("Error recording activity:", error);
      // Don't throw here - we don't want activity tracking to break the editor
      // Just log the error and continue
    }
  }

  /**
   * Get detailed granular activity tracking for a project
   */
  static async getDetailedActivityTracking(
    projectId: string,
    timeFrameDays: number = 30
  ): Promise<any> {
    try {
      const response = await apiClient.get(
        `/api/authorship/detailed-tracking/${projectId}?timeFrameDays=${timeFrameDays}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error getting detailed activity tracking:", error);
      throw new Error(
        error.message || "Failed to get detailed activity tracking"
      );
    }
  }

  /**
   * Download certificate as PDF file
   */
  static downloadCertificatePDF(blob: Blob, projectTitle: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `authorship-certificate-${projectTitle.replace(/\s+/g, "-")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
