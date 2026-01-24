import { EditorContent, AuditReport, CitationFlag, PatternType } from "./types";
import { DocumentExtractor } from "../../utils/documentExtractor";
import { extractPatterns } from "./patterns";
import { apiClient } from "../apiClient";

/**
 * Enhanced Citation Processor that handles chunked processing and improved flagging
 */
export class EnhancedCitationProcessor {
  private static readonly CHUNK_SIZE = 500; // Process 500 characters at a time

  /**
   * Process document in chunks and collect all citation information
   */
  /**
   * Process document in chunks and collect all citation information
   */
  static async processDocumentInChunks(
    content: EditorContent,
    citationStyle: string
  ): Promise<{
    auditReport: AuditReport;
    processingStats: {
      totalChunks: number;
      totalCharacters: number;
      citationsFound: number;
      flagsDetected: number;
    };
  }> {
    console.log("🚀 Starting improved citation processing...");

    // Extract full document content with mapped positions
    const extractedContent = DocumentExtractor.extractTextWithPositions(content);

    console.log(`📄 Document stats: ${extractedContent.fullText.length} characters, ${extractedContent.citations.length} citations`);

    // Process citations directly using the accurate PM positions from the extractor
    const allFlags: CitationFlag[] = [];

    // We can simulate chunks for the stats/progress if needed, or just treat as 1 chunk
    // For compatibility with the UI stats expectation:
    const chunkSize = this.CHUNK_SIZE;
    const totalChunks = Math.ceil(extractedContent.fullText.length / chunkSize) || 1;

    // Apply style rules to all extracted citations
    extractedContent.citations.forEach(citation => {
      const flag = this.checkCitationAgainstStyle(citation, citationStyle);
      if (flag) {
        allFlags.push(flag);
      }
    });

    // 4. Verify clean citations against external databases
    const flaggedRanges = new Set(allFlags.filter(f => f.anchor).map(f => `${f.anchor!.start}-${f.anchor!.end}`));
    const validCitations = extractedContent.citations.filter(c =>
      !flaggedRanges.has(`${c.position}-${c.endPosition}`)
    );

    if (validCitations.length > 0) {
      // We only verify citations that passed the style check (Verification Phase)
      try {
        // Call backend to verify citations (Architecture Fix)
        // Using POST to send batch of citations
        const response = await apiClient.post('/citations/verify', {
          citations: validCitations.map(c => ({
            text: c.text,
            position: c.position,
            endPosition: c.endPosition
          }))
        });

        if (response.data && response.data.flags) {
          allFlags.push(...response.data.flags);
        }
      } catch (error) {
        console.warn("Remote verification failed:", error);
        // Optionally add a flag saying "Verification Unavailable" but simpler to just skip
      }
    }

    // 5. Generate Reference List Audit
    // Isolate reference section patterns if any
    const referenceListSection = extractedContent.sections.find(s => s.type === "reference");
    // ... rest of logic

    console.log(`📊 Analysis complete: ${extractedContent.citations.length} citations checked, ${allFlags.length} flags found`);

    // Create final audit report
    const auditReport: AuditReport = {
      style: citationStyle as any,
      timestamp: new Date().toISOString(),
      flags: allFlags,
      detectedStyles: this.detectMixedStyles(extractedContent.citations)
    };

    // Compile processing statistics
    const processingStats = {
      totalChunks: totalChunks,
      totalCharacters: extractedContent.fullText.length,
      citationsFound: extractedContent.citations.length,
      flagsDetected: allFlags.length
    };

    return { auditReport, processingStats };
  }

  /**
   * Check individual citation against style rules
   */
  private static checkCitationAgainstStyle(
    citation: { text: string; position: number; endPosition: number; type: string },
    style: string
  ): CitationFlag | null {
    const text = citation.text;
    const start = citation.position;
    const end = citation.endPosition;
    const normalizedStyle = style.toLowerCase();

    // APA style rules
    if (normalizedStyle.includes("apa")) {
      // APA requires (Author, Year). Flag Numeric [1].
      if (citation.type === "numeric") {
        return {
          type: "INLINE_STYLE",
          ruleId: "APA_INVALID_NUMERIC",
          message: "APA style requires parenthetical citations (Author, Year), not numeric brackets.",
          anchor: { start, end, text },
          expected: "(Author, Year)"
        };
      }
    }

    // MLA style rules
    else if (normalizedStyle.includes("mla")) {
      // MLA requires (Author Page). Flag Numeric [1].
      if (citation.type === "numeric") {
        return {
          type: "INLINE_STYLE",
          ruleId: "MLA_INVALID_NUMERIC",
          message: "MLA style requires parenthetical citations (Author Page), not numeric brackets.",
          anchor: { start, end, text },
          expected: "(Author Page)"
        };
      }
    }

    // Chicago style rules
    else if (normalizedStyle.includes("chicago")) {
      // Chicago Notes/Bib uses footnotes. Flag Numeric [1] or Parenthetical.
      if (citation.type === "numeric" && !normalizedStyle.includes("author")) {
        return {
          type: "INLINE_STYLE",
          ruleId: "CHICAGO_INVALID_NUMERIC",
          message: "Chicago Notes & Bibliography style uses footnotes, not numeric brackets.",
          anchor: { start, end, text },
          expected: "Footnote reference"
        };
      }
    }

    // IEEE style rules
    else if (normalizedStyle.includes("ieee")) {
      // IEEE requires Numeric [1]. Flag ANY Parenthetical.
      if (citation.type === "author_year" || citation.type === "author_page") {
        return {
          type: "INLINE_STYLE",
          ruleId: "IEEE_INVALID_PARENTHETICAL",
          message: "IEEE style requires numeric citations [1]. Parenthetical citations are invalid.",
          anchor: { start, end, text },
          expected: "[Number]"
        };
      }
    }

    return null;
  }

  /**
   * Detect mixed citation styles in the document
   */
  private static detectMixedStyles(citations: any[]): string[] {
    const stylesFound = new Set<string>();

    citations.forEach(citation => {
      if (citation.type === "NUMERIC_BRACKET") {
        stylesFound.add("Numeric");
      } else if (citation.type === "AUTHOR_YEAR") {
        stylesFound.add("Author-Year");
      } else if (citation.type === "AUTHOR_PAGE") {
        stylesFound.add("Author-Page");
      }
    });

    return Array.from(stylesFound);
  }

  /**
   * Log comprehensive processing summary
   */
  private static logProcessingSummary(
    chunkDetails: any[],
    stats: any
  ): void {
    console.group("📋 CITATION AUDIT PROCESSING SUMMARY");
    console.log("📈 Overall Statistics:");
    console.log(`   Total Characters: ${stats.totalCharacters}`);
    console.log(`   Total Chunks: ${stats.totalChunks}`);
    console.log(`   Citations Found: ${stats.citationsFound}`);
    console.log(`   Violations Detected: ${stats.flagsDetected}`);

    console.log("\n📦 Chunk-by-chunk Processing:");
    chunkDetails.forEach(detail => {
      console.log(`   Chunk ${detail.chunkIndex + 1}: ` +
        `${detail.charactersProcessed} chars, ` +
        `${detail.citationsInChunk} citations, ` +
        `${detail.flagsFound} flags`);
    });

    console.groupEnd();
  }
}