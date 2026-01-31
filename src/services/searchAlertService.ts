import { apiClient } from "./apiClient";

export interface SearchAlert {
    id: string;
    user_id?: string;
    query: string;
    frequency: "daily" | "weekly" | "monthly";
    is_active: boolean;
    new_matches_count: number;
    last_checked: string | null;
    created_at?: string;
    updated_at?: string;
}

class SearchAlertService {
    /**
     * Get all search alerts for the current user
     */
    static async getAlerts(): Promise<SearchAlert[]> {
        try {
            const response = await apiClient.get("/api/search-alerts");
            return response || [];
        } catch (error: any) {
            console.error("Error fetching search alerts:", error);
            throw new Error(error.message || "Failed to fetch search alerts");
        }
    }

    /**
     * Create a new search alert
     */
    static async createAlert(
        query: string,
        frequency: "daily" | "weekly" | "monthly"
    ): Promise<SearchAlert> {
        try {
            const response = await apiClient.post("/api/search-alerts", {
                query,
                frequency,
            });
            return response;
        } catch (error: any) {
            console.error("Error creating search alert:", error);
            throw new Error(error.message || "Failed to create search alert");
        }
    }

    /**
     * Update a search alert
     */
    static async updateAlert(
        id: string,
        data: Partial<SearchAlert>
    ): Promise<SearchAlert> {
        try {
            const response = await apiClient.patch(`/api/search-alerts/${id}`, data);
            return response;
        } catch (error: any) {
            console.error("Error updating search alert:", error);
            throw new Error(error.message || "Failed to update search alert");
        }
    }

    /**
     * Delete a search alert
     */
    static async deleteAlert(id: string): Promise<void> {
        try {
            await apiClient.delete(`/api/search-alerts/${id}`);
        } catch (error: any) {
            console.error("Error deleting search alert:", error);
            throw new Error(error.message || "Failed to delete search alert");
        }
    }

    /**
     * Manually check a search alert for new matches
     */
    static async checkAlert(
        id: string
    ): Promise<{ alert: SearchAlert; results: any[] }> {
        try {
            const response = await apiClient.post(`/api/search-alerts/${id}/check`, {});
            return response;
        } catch (error: any) {
            console.error("Error checking search alert:", error);
            throw new Error(error.message || "Failed to check search alert");
        }
    }
}

export default SearchAlertService;
