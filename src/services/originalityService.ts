import { apiClient } from "./apiClient";

export interface SimilarityMatch {
  id: string;
  sentenceText: string;
  matchedSource: string;
  sourceUrl?: string;
  similarityScore: number;
  positionStart: number;
  positionEnd: number;
  classification:
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "common_phrase"
  | "quoted_correctly"
  | "needs_citation"
  | "close_paraphrase";
}

export interface OriginalityScan {
  id: string;
  projectId: string;
  userId: string;
  overallScore: number;
  classification: "safe" | "review" | "action_required";
  scanStatus: "pending" | "processing" | "completed" | "failed";
  matches: SimilarityMatch[];
  scannedAt: Date;
  realityCheck?: RealityCheckStats;
}

export interface RealityCheckStats {
  referencePercent: number;
  commonPhrasePercent: number;
  trustScore: number;
  message: string;
}

export interface DraftComparisonResult {
  similarityScore: number;
  overlapPercentage: number;
  matchedSegments: {
    segment: string;
    similarity: number;
    sourceParams: { start: number; end: number };
    targetParams: { start: number; end: number };
  }[];
  analysis: string;
  isSelfPlagiarismInternal: boolean;
}

export interface RephraseSuggestion {
  id: string;
  originalText: string;
  suggestedText: string;
}

export class OriginalityService {
  /**
   * Scan a document for originality
   */
  static async scanDocument(
    projectId: string,
    content: string
  ): Promise<OriginalityScan> {
    try {
      const response = await apiClient.post("/api/originality/scan", {
        projectId,
        content,
      });

      return response.data;
    } catch (error: any) {
      console.error("Error scanning document:", error);

      // Check if it's a subscription limit error
      if (error.status === 403 && error.upgrade) {
        const upgradeError: any = new Error(
          error.message || "Scan limit reached"
        );
        upgradeError.needsUpgrade = true;
        upgradeError.feature = "originality_scan";
        throw upgradeError;
      }

      throw new Error(error.message || "Failed to scan document");
    }
  }

  /**
   * Get scan results by ID
   */
  static async getScanResults(scanId: string): Promise<OriginalityScan> {
    try {
      const response = await apiClient.get(`/api/originality/scan/${scanId}`);

      return response.data;
    } catch (error: any) {
      console.error("Error getting scan results:", error);
      throw new Error(error.message || "Failed to get scan results");
    }
  }

  /**
   * Get all scans for a project
   */
  static async getProjectScans(projectId: string): Promise<OriginalityScan[]> {
    try {
      const response = await apiClient.get(
        `/api/originality/project/${projectId}`
      );

      return response.data;
    } catch (error: any) {
      console.error("Error getting project scans:", error);
      throw new Error(error.message || "Failed to get project scans");
    }
  }

  /**
   * Get rephrase suggestions for flagged text
   */
  static async getRephrases(
    scanId: string,
    matchId: string,
    originalText: string
  ): Promise<RephraseSuggestion[]> {
    try {
      const response = await apiClient.post("/api/originality/rephrase", {
        scanId,
        matchId,
        originalText,
      });

      return response.data;
    } catch (error: any) {
      console.error("Error getting rephrase suggestions:", error);

      // Check if it's a subscription limit error
      if (error.status === 403 && error.upgrade) {
        const upgradeError: any = new Error(
          error.message || "Rephrase limit reached"
        );
        upgradeError.needsUpgrade = true;
        upgradeError.feature = "originality_scan";
        throw upgradeError;
      }

      throw new Error(error.message || "Failed to get rephrase suggestions");
    }
  }

  /**
   * Get all cached suggestions for a scan
   */
  static async getScanSuggestions(
    scanId: string
  ): Promise<RephraseSuggestion[]> {
    try {
      const response = await apiClient.get(
        `/api/originality/scan/${scanId}/suggestions`
      );

      return response.data;
    } catch (error: any) {
      console.error("Error getting scan suggestions:", error);
      throw new Error(error.message || "Failed to get scan suggestions");
    }
  }

  /**
   * Compare two drafts for self-plagiarism
   */
  static async compareDrafts(
    currentDraft: string,
    previousDraft: string
  ): Promise<DraftComparisonResult> {
    try {
      const response = await apiClient.post("/api/originality/compare", {
        currentDraft,
        previousDraft,
        comparisonType: "text",
      });
      return response.data;
    } catch (error: any) {
      console.error("Error comparing drafts:", error);
      throw new Error(error.message || "Failed to compare drafts");
    }
  }

  /**
   * Check for self-plagiarism against user's recent projects
   */
  static async checkSelfPlagiarism(
    currentContent: string,
    currentProjectId: string
  ): Promise<DraftComparisonResult[]> {
    try {
      const response = await apiClient.post(
        "/api/originality/check-self-plagiarism",
        {
          currentContent,
          currentProjectId,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error checking self-plagiarism:", error);
      throw new Error(error.message || "Failed to check self-plagiarism");
    }
  }

  /**
   * Humanize text using Adversarial AI (Auto-Humanizer)
   */
  static async humanizeText(content: string): Promise<{ text: string; provider: "anthropic" | "openai" }> {
    try {
      const response = await apiClient.post("/api/originality/humanize", {
        content,
      });
      return response.data.data;
    } catch (error: any) {
      console.error("Error humanizing text:", error);
      throw new Error(error.message || "Failed to humanize text");
    }
  }
}
