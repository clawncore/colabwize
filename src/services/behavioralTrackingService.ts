import { apiClient } from "./apiClient";

export interface WritingPatternData {
    projectId: string;
    userId: string;
    typingSpeedVariations: number[]; // Words per minute over time
    pauseDurations: number[]; // Duration of pauses between keystrokes (in ms)
    deletionPatterns: number[]; // Frequency of deletions/bad edits
    correctionFrequency: number; // How often user corrects mistakes
    thinkPauseRatios: number[]; // Ratio of thinking time vs typing time
    revisionPatterns: number[]; // How often text is revised over time
    sentenceConstructionPatterns: number[]; // How sentences are built over time
    errorRate: number; // Typing error frequency
    averageThinkTime: number; // Average time spent thinking between phrases
    writingRhythmScore: number; // Overall measure of natural writing rhythm
}

export interface WritingDNAReport {
    averageTypingSpeed: number;
    thinkPauseRatio: number;
    errorCorrectionFrequency: number;
    revisionPatternComplexity: number;
    writingRhythmScore: number;
    humanAuthenticityScore: number; // 0-100 percentage
    isConsistentWithHumanWriting: boolean;
}

export class BehavioralTrackingService {
    /**
     * Track user's typing behavior patterns
     */
    static async trackTypingBehavior(
        projectId: string,
        behaviorData: Partial<WritingPatternData>
    ): Promise<void> {
        try {
            await apiClient.post("/api/behavioral-tracking", {
                ...behaviorData,
                projectId,
            });
        } catch (error: any) {
            console.error("Error tracking typing behavior:", error);
            // Don't throw here - we don't want behavioral tracking to break the editor
            // Just log the error and continue
        }
    }

    /**
     * Analyze writing patterns to detect human vs AI characteristics
     */
    static async analyzePatterns(
        projectId: string
    ): Promise<WritingDNAReport> {
        try {
            const response = await apiClient.get(
                `/api/behavioral-tracking/analyze/${projectId}`
            );
            return response.data;
        } catch (error: any) {
            console.error("Error analyzing writing patterns:", error);
            throw new Error(error.message || "Failed to analyze writing patterns");
        }
    }

    /**
     * Get comprehensive writing pattern data for a project
     */
    static async getWritingPatterns(
        projectId: string
    ): Promise<WritingPatternData> {
        try {
            const response = await apiClient.get(
                `/api/behavioral-tracking/patterns/${projectId}`
            );
            return response.data;
        } catch (error: any) {
            console.error("Error getting writing patterns:", error);
            throw new Error(error.message || "Failed to get writing patterns");
        }
    }

    /**
     * Calculate human authenticity score based on behavioral patterns
     */
    static calculateHumanAuthenticityScore(patternData: WritingPatternData): number {
        // Calculate various factors that indicate human vs AI writing
        const typingVariationScore = this.calculateTypingVariationScore(
            patternData.typingSpeedVariations
        );
        const pausePatternScore = this.calculatePausePatternScore(
            patternData.pauseDurations
        );
        const correctionScore = this.calculateCorrectionScore(
            patternData.correctionFrequency
        );
        const revisionScore = this.calculateRevisionScore(
            patternData.revisionPatterns
        );

        // Weighted average of all factors
        const weightedScore =
            0.25 * typingVariationScore +
            0.25 * pausePatternScore +
            0.25 * correctionScore +
            0.25 * revisionScore;

        // Convert to percentage (0-100)
        return Math.min(100, Math.max(0, Math.round(weightedScore)));
    }

    private static calculateTypingVariationScore(speeds: number[]): number {
        if (!speeds || speeds.length === 0) return 50; // Neutral score

        // Humans have more variation in typing speed than AI
        const avgSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
        const variance = speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;
        const stdDev = Math.sqrt(variance);

        // Higher variation indicates more human-like behavior
        // Normalize to 0-100 scale
        return Math.min(100, Math.max(0, Math.round((stdDev / 5) * 100))); // Adjust divisor as needed
    }

    private static calculatePausePatternScore(pauses: number[]): number {
        if (!pauses || pauses.length === 0) return 50; // Neutral score

        // Humans have irregular pause patterns, AI is more consistent
        const avgPause = pauses.reduce((sum, pause) => sum + pause, 0) / pauses.length;
        const variance = pauses.reduce((sum, pause) => sum + Math.pow(pause - avgPause, 2), 0) / pauses.length;
        const stdDev = Math.sqrt(variance);

        // Higher variation in pause durations indicates more human-like behavior
        return Math.min(100, Math.max(0, Math.round((stdDev / 100) * 100))); // Adjust divisor as needed
    }

    private static calculateCorrectionScore(corrections: number): number {
        // Humans make and correct more errors than AI
        // Normalize to 0-100 scale based on typical correction rates
        return Math.min(100, Math.max(0, Math.round(corrections * 10)));
    }

    private static calculateRevisionScore(revisions: number[]): number {
        if (!revisions || revisions.length === 0) return 50; // Neutral score

        // Calculate how much the text was revised over time
        const avgRevisions = revisions.reduce((sum, rev) => sum + rev, 0) / revisions.length;

        // Higher revision rates indicate more organic, human writing
        return Math.min(100, Math.max(0, Math.round(avgRevisions * 5))); // Adjust multiplier as needed
    }
}