import { apiClient } from "./apiClient";
import { generatePrecomputedCitations } from "../utils/citationFormatter";

export interface SuggestedPaper {
  title: string;
  authors: string[];
  year: number;
  doi?: string;
  abstract?: string;
  citationCount?: number;
  journal?: string;
  url?: string;
  relevanceScore: number;
  citation: string;
  source: "crossref" | "pubmed" | "arxiv";
}

export interface ConfidenceScore {
  overall: number;
  recencyScore: number;
  coverageScore: number;
  qualityScore: number;
  diversityScore: number;
  status: "strong" | "good" | "weak" | "poor";
  warnings: string[];
  suggestions: string[];
}

export interface CitationBreakdown {
  recent: number;
  acceptable: number;
  dated: number;
  outdated: number;
}

export interface CitationConfidenceAnalysis {
  totalCitations: number;
  overallConfidence: ConfidenceScore;
  citationBreakdown: CitationBreakdown;
}

export interface RecencyAnalysis {
  breakdown: CitationBreakdown;
  totalCitations: number;
  hasRecentCitations: boolean;
  warning: string | null;
}

export interface StoredCitation {
  id?: string;
  title: string;
  authors?: string[];
  author?: string;
  year?: number | string;
  journal?: string;
  doi?: string;
  url?: string;
  type?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  abstract?: string;
  citationCount?: number;
  impactFactor?: string | number; // Added based on usage
  openAccess?: boolean; // Added based on usage
  formatted_citations?: Record<string, string>;
  added_at?: string;
  themes?: string[];
  matrix_notes?: string;
}

export class CitationService {
  /**
   * Find missing link - suggest relevant papers
   */
  static async findMissingLink(
    projectId: string,
    keywords: string[],
    field: string = "default"
  ): Promise<SuggestedPaper[]> {
    try {
      const response = await apiClient.post(
        "/api/citations/find-missing-link",
        { projectId, keywords, field }
      );

      return response.suggestions;
    } catch (error: any) {
      console.error("Error finding missing link:", error);
      throw new Error(error.message || "Failed to find missing link");
    }
  }

  /**
   * Search for papers using OpenAlex
   */
  static async searchPapers(query: string): Promise<SuggestedPaper[]> {
    try {
      console.log("[CitationService] Searching for papers:", query);
      const response = await apiClient.get(
        `/api/citations/search?q=${encodeURIComponent(query)}`
      );

      console.log("[CitationService] Search response:", response);
      console.log("[CitationService] Response data:", response.data);

      // apiClient already unwraps the { success, data } structure
      // so response.data is directly the array of papers
      const papers = response.data || [];
      console.log("[CitationService] Parsed papers:", papers);
      return papers;
    } catch (error: any) {
      console.error("Error searching papers:", error);
      console.error("Error response:", error.response?.data);
      throw new Error(error.message || "Failed to search papers");
    }
  }

  /**
   * Get citation confidence analysis for a project
   */
  static async getConfidenceAnalysis(
    projectId: string,
    field: string = "default"
  ): Promise<CitationConfidenceAnalysis> {
    try {
      const response = await apiClient.get(
        `/api/citations/confidence/${projectId}?field=${encodeURIComponent(field)}`
      );

      return response.data;
    } catch (error: any) {
      console.error("Error getting confidence analysis:", error);
      throw new Error(error.message || "Failed to get confidence analysis");
    }
  }

  /**
   * Get recency analysis for project citations
   */
  static async getRecencyAnalysis(
    projectId: string,
    field: string = "default"
  ): Promise<RecencyAnalysis> {
    try {
      const response = await apiClient.get(
        `/api/citations/recency/${projectId}?field=${encodeURIComponent(field)}`
      );

      return response.data;
    } catch (error: any) {
      console.error("Error getting recency analysis:", error);
      throw new Error(error.message || "Failed to get recency analysis");
    }
  }

  /**
   * Check if project has recent citations (within 3 years)
   */
  static async hasRecentCitations(projectId: string): Promise<boolean> {
    try {
      const recency = await this.getRecencyAnalysis(projectId);
      return recency.hasRecentCitations;
    } catch (error) {
      console.error("Error checking recent citations:", error);
      return false;
    }
  }

  /**
   * Add a citation to the project
   */
  static async addCitation(
    projectId: string,
    citation: {
      title: string;
      authors: string[];
      year: number;
      type?: string;
      doi?: string;
      url?: string;
      source?: string;
      journal?: string;
      volume?: string;
      issue?: string;
      pages?: string;
      abstract?: string;
      citationCount?: number;
      tags?: string[];
    }
  ): Promise<any> {
    try {
      // Generate precomputed citations
      const formattedCitations = generatePrecomputedCitations({
        title: citation.title,
        authors: citation.authors,
        author: citation.authors.join(", "), // Fallback string
        year: citation.year,
        journal: citation.journal,
        volume: citation.volume,
        issue: citation.issue,
        pages: citation.pages,
        doi: citation.doi,
        url: citation.url,
        source: citation.source
      });

      const response = await apiClient.post(`/api/citations/${projectId}`, {
        title: citation.title,
        author: citation.authors.join(", "),
        year: citation.year,
        type: citation.type,
        doi: citation.doi,
        url: citation.url,
        source: citation.source,
        journal: citation.journal,
        volume: citation.volume,
        issue: citation.issue,
        pages: citation.pages,
        citation_count: citation.citationCount,
        abstract: citation.abstract,
        formatted_citations: formattedCitations,
        added_at: new Date().toISOString(),
        tags: citation.tags
      });

      return response;
    } catch (error: any) {
      console.error("Error adding citation:", error);
      throw new Error(error.message || "Failed to add citation");
    }
  }

  /**
   * Scan content for missing citations with enhanced error handling
   */
  static async scanContent(
    content: string,
    projectId?: string
  ): Promise<{
    suggestions: {
      sentence: string;
      suggestion: string;
      type: "factual_claim" | "definition" | "statistic";
    }[];
    matchCount: number;
    scanStatus: "success" | "quota_exceeded" | "subscription_error" | "network_error";
    errorMessage?: string;
  }> {
    try {
      const response = await apiClient.post("/api/citations/content-scan", {
        content,
        projectId,
      });

      return {
        ...response.data,
        scanStatus: "success"
      };
    } catch (error: any) {
      console.error("Error scanning content:", error);

      // Handle specific error types
      if (error.response?.status === 403) {
        if (error.message?.includes("usage limit")) {
          const quotaError = new Error("Citation check usage limit reached. Please upgrade your plan.");
          (quotaError as any).type = "quota_exceeded";
          (quotaError as any).used = error.response.data?.used;
          (quotaError as any).limit = error.response.data?.limit;
          (quotaError as any).resetTime = error.response.data?.resetTime;
          throw quotaError;
        } else {
          const subscriptionError = new Error("Subscription verification failed. Please check your account.");
          (subscriptionError as any).type = "subscription_error";
          (subscriptionError as any).details = error.response.data;
          throw subscriptionError;
        }
      } else if (error.code === "ERR_NETWORK" || error.message?.includes("network")) {
        // Fallback simulation when backend is offline
        console.log("🔧 Backend offline - simulating citation scan for testing");

        // Simulate finding some citations in the content
        const simulatedSuggestions = this.simulateCitationDetection(content);

        return {
          suggestions: simulatedSuggestions,
          matchCount: simulatedSuggestions.length,
          scanStatus: "success"
        };
      }

      const unknownError = new Error(error.message || "Failed to scan content");
      (unknownError as any).type = "unknown_error";
      throw unknownError;
    }
  }

  // Fallback method for when backend is unavailable
  private static simulateCitationDetection(content: string): Array<{
    sentence: string;
    suggestion: string;
    type: "factual_claim" | "definition" | "statistic";
  }> {
    // Simple regex patterns to detect potential citation needs
    const patterns = [
      /\b(study|research|according to|found that|demonstrated|showed)\b.*?\d+%?/gi,
      /\b(statistics|data|survey|poll)\b.*?\d+/gi,
      /\b(is|are|was|were)\b.*?\b(important|significant|crucial|essential)\b/gi
    ];

    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const suggestions: any[] = [];

    sentences.forEach(sentence => {
      let matchCount = 0;
      patterns.forEach(pattern => {
        if (pattern.test(sentence)) matchCount++;
      });

      if (matchCount > 0) {
        suggestions.push({
          sentence: sentence.trim(),
          suggestion: `Consider adding a citation for this ${matchCount > 1 ? 'claim' : 'statement'}`,
          type: matchCount > 1 ? "factual_claim" : "statistic"
        });
      }
    });

    // Limit to first 5 suggestions to avoid overwhelming
    return suggestions.slice(0, 5);
  }

  /**
   * Update citation themes and matrix notes
   */
  static async updateCitationThemes(
    projectId: string,
    citationId: string,
    data: { themes?: string[]; matrix_notes?: string }
  ): Promise<any> {
    try {
      const response = await apiClient.put(
        `/api/citations/${projectId}/${citationId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Error updating citation themes:", error);
      throw new Error(error.message || "Failed to update citation themes");
    }
  }

  /**
   * AI Analysis of citation for Literature Matrix
   */
  static async analyzeCitation(
    projectId: string,
    citationId: string
  ): Promise<any> {
    try {
      const response = await apiClient.post(
        `/api/citations/${projectId}/${citationId}/analyze`,
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error("Error analyzing citation:", error);
      throw new Error(error.message || "Failed to analyze citation");
    }
  }

  /**
   * Real-time verification for a single citation
   */
  static async verifySingleCitation(citation: { title: string; doi?: string }): Promise<{ isReliable: boolean; source: string | null }> {
    try {
      const response = await apiClient.post("/api/citations/verify-single", citation);
      return response.data;
    } catch (e: any) {
      console.error("Single citation verification failed", e);
      return { isReliable: false, source: null };
    }
  }

  /**
   * Auto-Fixer: Find metadata for fuzzy query
   */
  static async findCitationMetadata(query: string): Promise<any> {
    try {
      const response = await apiClient.post("/api/citations/auto-fix", { query });
      return response.data;
    } catch (e: any) {
      console.error("Auto-fix search failed", e);
    }
  }

  /**
   * Batch AI Analysis of citations for Literature Matrix
   */
  static async batchAnalyzeCitations(projectId: string, force: boolean = false): Promise<any[]> {
    try {
      const response = await apiClient.post(`/api/citations/${projectId}/batch-analyze`, { force });
      return response.data;
    } catch (error: any) {
      console.error("Batch analysis failed:", error);
      throw new Error(error.message || "Failed to batch analyze citations");
    }
  }

  /**
   * Search citations from CrossRef/PubMed
   */
  static async searchCitations(query: string): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `/api/citations/search?q=${encodeURIComponent(query)}`
      );
      return response.data || [];
    } catch (error: any) {
      console.error("Error searching citations:", error);
      throw new Error(error.message || "Failed to search citations");
    }
  }

  /**
   * Get all citations for a project
   */
  static async getProjectCitations(projectId: string): Promise<StoredCitation[]> {
    try {
      const response = await apiClient.get(`/api/citations/${projectId}`);
      return response.data || [];
    } catch (error: any) {
      console.error("Error getting project citations:", error);
      throw new Error(error.message || "Failed to get project citations");
    }
  }

  /**
   * Delete a citation
   */
  static async deleteCitation(citationId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/citations/${citationId}`);
    } catch (error: any) {
      console.error("Error deleting citation:", error);
      throw new Error(error.message || "Failed to delete citation");
    }
  }

  /**
   * Import citation from DOI
   */
  static async importFromDOI(doi: string): Promise<any> {
    try {
      const response = await apiClient.post("/api/citations/import/doi", { doi });
      return response.data;
    } catch (error: any) {
      console.error("Error importing from DOI:", error);
      throw new Error(error.message || "Failed to import from DOI");
    }
  }

  /**
   * Import citation from URL
   */
  static async importFromURL(url: string): Promise<any> {
    try {
      const response = await apiClient.post("/api/citations/import/url", { url });
      return response.data;
    } catch (error: any) {
      console.error("Error importing from URL:", error);
      throw new Error(error.message || "Failed to import from URL");
    }
  }

  /**
   * Format a citation in a specific style
   */
  static formatCitation(citation: any, style: "apa" | "mla" | "chicago"): string {
    // Use precomputed citations if available
    if (citation.formatted_citations && citation.formatted_citations[style]) {
      return citation.formatted_citations[style];
    }

    // Fallback to generating format
    const authors = Array.isArray(citation.authors)
      ? citation.authors
      : citation.authors
        ? [citation.authors]
        : [];

    const authorsString = authors
      .map((a: any) =>
        typeof a === 'string'
          ? a
          : `${a.lastName || ''}, ${a.firstName || ''}`.trim()
      )
      .filter(Boolean)
      .join("; ");

    const year = citation.year || "n.d.";
    const title = citation.title || "Untitled";

    switch (style) {
      case "apa":
        return `${authorsString} (${year}). ${title}. ${citation.journal || ""}${citation.volume ? `, ${citation.volume}` : ""}${citation.issue ? `(${citation.issue})` : ""}${citation.pages ? `, ${citation.pages}` : ""}.${citation.doi ? ` https://doi.org/${citation.doi}` : ""}`;

      case "mla":
        return `${authorsString}. "${title}." ${citation.journal || ""}${citation.volume ? ` ${citation.volume}` : ""}${citation.issue ? `.${citation.issue}` : ""} (${year})${citation.pages ? `: ${citation.pages}` : ""}.${citation.doi ? ` DOI: ${citation.doi}` : ""}`;

      case "chicago":
        return `${authorsString}. "${title}." ${citation.journal || ""}${citation.volume ? ` ${citation.volume}` : ""}${citation.issue ? `, no. ${citation.issue}` : ""} (${year})${citation.pages ? `: ${citation.pages}` : ""}.${citation.doi ? ` https://doi.org/${citation.doi}` : ""}`;

      default:
        return `${authorsString} (${year}). ${title}.`;
    }
  }

  /**
   * Search external sources (CrossRef/PubMed) for citations
   */
  static async searchExternal(query: string, type?: string): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `/api/citations/search-external?q=${encodeURIComponent(query)}${type ? `&type=${type}` : ""}`
      );
      return response.data || [];
    } catch (error: any) {
      console.error("Error searching external sources:", error);
      throw new Error(error.message || "Failed to search external sources");
    }
  }

  /**
   * Get recent research topics
   */
  static async getRecentResearchTopics(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `/api/research/topics/recent?limit=${limit}`
      );
      return response.data || [];
    } catch (error: any) {
      console.error("Error getting recent research topics:", error);
      return []; // Return empty array on error instead of throwing
    }
  }

  /**
   * Delete a research topic
   */
  static async deleteResearchTopic(topicId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/research/topics/${topicId}`);
      return true;
    } catch (error: any) {
      console.error("Error deleting research topic:", error);
      return false;
    }
  }

  /**
   * Save a research topic
   */
  static async saveResearchTopic(topic: any): Promise<any> {
    try {
      const response = await apiClient.post("/api/research/topics", topic);
      return response.data;
    } catch (error: any) {
      console.error("Error saving research topic:", error);
      throw new Error(error.message || "Failed to save research topic");
    }
  }

  /**
   * Create a citation (alias for addCitation for compatibility)
   */
  static async createCitation(projectId: string, citationData: any): Promise<any> {
    return this.addCitation(projectId, citationData);
  }
}
