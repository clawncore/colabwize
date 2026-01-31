import { apiClient } from "./apiClient";

export interface SimilarityMatch {
  id: string;
  sentenceText: string;
  matchedSource: string;
  sourceUrl?: string;
  viewUrl?: string;
  matchedWords?: number;
  sourceWords?: number;
  matchPercent?: number;
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
  wordsScanned?: number;
  costAmount?: number;
  matchCount?: number;
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
   * Helper to normalize backend response (handles snake_case -> camelCase migration)
   */
  private static normalizeResponse(data: any): OriginalityScan {
    if (!data) return data;

    // Check if we need to map snake_case
    const isSnakeCase = data.overall_score !== undefined || data.scan_status !== undefined;

    if (!isSnakeCase) {
      return data as OriginalityScan;
    }

    return {
      id: data.id,
      projectId: data.project_id || data.projectId,
      userId: data.user_id || data.userId,
      overallScore: data.overall_score ?? data.overallScore,
      classification: data.classification,
      scanStatus: data.scan_status || data.scanStatus,
      matches: (data.matches || []).map((m: any) => ({
        id: m.id,
        sentenceText: m.sentence_text || m.sentenceText,
        matchedSource: m.matched_source || m.matchedSource,
        sourceUrl: m.source_url || m.sourceUrl,
        viewUrl: m.view_url || m.viewUrl,
        matchedWords: m.matched_words ?? m.matchedWords,
        sourceWords: m.source_words ?? m.sourceWords,
        matchPercent: m.match_percent ?? m.matchPercent,
        similarityScore: m.similarity_score ?? m.similarityScore,
        positionStart: m.position_start ?? m.positionStart,
        positionEnd: m.position_end ?? m.positionEnd,
        classification: m.classification
      })),
      scannedAt: data.scanned_at || data.scannedAt,
      wordsScanned: data.words_scanned ?? data.wordsScanned,
      costAmount: data.cost_amount ?? data.costAmount,
      matchCount: data.match_count ?? data.matchCount
    };
  }

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

      return this.normalizeResponse(response.data);
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

      return this.normalizeResponse(response.data);
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

      return (response.data || []).map((item: any) => this.normalizeResponse(item));
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

      return response;
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
  static async humanizeText(content: string): Promise<{ variations: string[]; provider: "anthropic" | "openai" }> {
    try {
      const response = await apiClient.post("/api/originality/humanize", {
        content,
      });
      return response.data;
    } catch (error: any) {
      console.error("Error humanizing text:", error);
      throw new Error(error.message || "Failed to humanize text");
    }
  }

  /**
   * Real-time section check for "Active Defense"
   */
  static async checkSectionRisk(
    projectId: string,
    content: string
  ): Promise<{ riskScore: number; flags: string[]; isAiSuspected: boolean }> {
    try {
      const response = await apiClient.post("/api/originality/section-check", {
        projectId,
        content
      });
      return response.data;
    } catch (e: any) {
      console.error("Error checking section risk", e);
      // Return safe default if check fails to not block UI
      return { riskScore: 0, flags: [], isAiSuspected: false };
    }
  }

  /**
   * In-line rewrite for editor selection
   */
  static async rewriteSelection(
    selection: string,
    mode: "QUICK" | "ACADEMIC" | "DEEP" = "ACADEMIC",
    context?: string
  ): Promise<{ variations: string[]; provider: string }> {
    try {
      const response = await apiClient.post("/api/originality/rewrite-selection", {
        selection,
        mode,
        context
      });
      return response.data;
    } catch (e: any) {
      console.error("Error rewriting selection", e);
      throw e;
    }
  }

  /**
   * PROMPT 4: Get forensic risk explanation
   */
  static async explainRisk(
    matchText: string,
    sourceText: string,
    riskLevel: string
  ): Promise<string> {
    try {
      const response = await apiClient.post("/api/originality/explain-risk", {
        matchText,
        sourceText,
        riskLevel
      });
      return response.data?.explanation || "No explanation available.";
    } catch (e: any) {
      console.error("Error getting risk explanation", e);
      throw new Error(e.message || "Failed to explain risk");
    }
  }
}
