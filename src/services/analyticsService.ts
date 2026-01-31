import { apiClient } from "./apiClient";

interface AnalyticsSummary {
  originality_scans_count?: number;
  citation_checks_count?: number;

  certificates_downloaded_count?: number;
  total_documents_uploaded?: number;
  total_time_spent_minutes?: number;
  features_used?: string[];
  is_paid_user?: boolean;
}

interface DashboardData {
  originalityScore?: number;
  citationStatus?: "strong" | "good" | "weak" | "poor";
  authorshipVerified?: boolean;
  projects?: any[]; // Array of user's projects/documents
}

export class AnalyticsService {
  /**
   * Get analytics summary for the current user
   */
  static async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    try {
      const response = await apiClient.get("/api/analytics/summary");
      return response.data;
    } catch (error) {
      console.error("Error fetching analytics summary:", error);
      throw error;
    }
  }

  /**
   * Get dashboard data with transformed metrics
   */
  static async getDashboardData(): Promise<DashboardData> {
    try {
      // Fetch the dashboard-specific analytics data from the backend
      const response = await apiClient.get("/api/analytics/dashboard");
      const dashboardData = response.data;

      // Return the actual dashboard metrics from the backend
      return {
        originalityScore: dashboardData.originality_score || undefined,
        citationStatus: dashboardData.citation_status || undefined,

        authorshipVerified: dashboardData.authorship_verified || undefined,
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);

      // Fallback: try to get the summary data and derive metrics if dashboard endpoint fails
      try {
        const summary = await this.getAnalyticsSummary();

        // Determine authorship verification based on certificates downloaded
        const authorshipVerified =
          summary.certificates_downloaded_count &&
            summary.certificates_downloaded_count > 0
            ? true
            : false;

        return {
          originalityScore: undefined,
          citationStatus: undefined,

          authorshipVerified,
        };
      } catch (fallbackError) {
        console.error("Error in fallback analytics:", fallbackError);

        // Return empty dashboard data if both primary and fallback methods fail
        return {
          originalityScore: undefined,
          citationStatus: undefined,

          authorshipVerified: undefined,
        };
      }
    }
  }
}

export default AnalyticsService;
export type { DashboardData };
