import { apiClient } from "./apiClient";

export interface AIScanResult {
    overallScore: number;
    classification: "human" | "mixed" | "ai";
    sentences: AISentenceResult[];
    scannedAt: string;
}

export interface AISentenceResult {
    text: string;
    score: number;
    classification: "human" | "likely_human" | "likely_ai" | "ai";
    positionStart: number;
    positionEnd: number;
}

export class AIDetectionService {
    /**
     * Scan content for AI-generated text using GPTZero API
     */
    static async scanContent(content: string): Promise<AIScanResult> {
        try {
            const response = await apiClient.post("/api/ai-detection/scan", { content });

            // Handle new response format with success/data structure
            if (response.success && response.data) {
                return response.data;
            }

            // Fallback for direct data response
            return response;
        } catch (error: any) {
            console.error("AI detection scan failed:", error);

            // Extract error message from response
            const errorMessage = error.message
                || "Failed to scan for AI content";

            throw new Error(errorMessage);
        }
    }
}
