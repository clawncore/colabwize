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
     * Scan content for AI-generated text
     */
    static async scanContent(content: string): Promise<AIScanResult> {
        try {
            const response = await apiClient.post("/api/ai-detection/scan", { content });
            return response.data;
        } catch (error: any) {
            console.error("AI detection scan failed:", error);
            throw new Error(error.message || "Failed to scan for AI content");
        }
    }
}
