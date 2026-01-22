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

      return response.data.suggestions;
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
      citationCount?: number;
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
        formatted_citations: formattedCitations,
        added_at: new Date().toISOString(),
      });

      return response;
    } catch (error: any) {
      console.error("Error adding citation:", error);
      throw new Error(error.message || "Failed to add citation");
    }
  }

  /**
   * Scan content for missing citations
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
  }> {
    try {
      const response = await apiClient.post("/api/citations/content-scan", {
        content,
        projectId,
      });

      return response.data;
    } catch (error: any) {
      console.error("Error scanning content:", error);
      throw new Error(error.message || "Failed to scan content");
    }
  }
}
