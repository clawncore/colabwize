/* eslint-disable */
import { Editor } from "@tiptap/core";
import { extractPatterns } from "./patterns";
import { parseReferenceText } from "../../utils/citationFormatter";

export interface ReferenceRecord {
  id: string; // "greenberg2009"
  authors: string[];
  year: number;
  title?: string;
  url?: string;
  rawText: string;
  organization?: string;
}

export interface CitationCandidate {
  text: string;
  start: number;
  end: number;
  year: number;
  authors?: string[];
  organization?: string;
  isAmbiguous: boolean;
}

export interface NormalizationIssue {
  text: string;
  reason: string;
  candidates: string[];
  status: "needs_review";
}

export interface NormalizationResult {
  issues: NormalizationIssue[];
  normalizedCount: number;
}

/**
 * Silent Citation Normalizer
 * Implements the protocol for converting raw text citations into structured CitationNodes.
 */
export class CitationNormalizer {
  private referenceIndex: Map<string, ReferenceRecord> = new Map();
  private issues: NormalizationIssue[] = [];

  /**
   * Main entry point
   */
  public async normalize(
    editor: Editor,
    projectId: string,
  ): Promise<NormalizationResult> {
    // 1. We extract reference section linearly first for the index to be useful
    // But wait, the standard way in AuditEngine is decomposeAndExtract.
    // We will just do a quick scan to get a mocked ReferenceListExtraction format
    const entries: any[] = [];
    let inRefSection = false;

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        const text = node.textContent.toLowerCase().trim();
        if (
          text === "references" ||
          text === "works cited" ||
          text === "bibliography"
        ) {
          inRefSection = true;
          return;
        } else {
          if (inRefSection) inRefSection = false;
        }
      }
      if (
        inRefSection &&
        (node.type.name === "paragraph" || node.type.name === "listItem")
      ) {
        const text = node.textContent.trim();
        if (text.length > 20) {
          entries.push({ rawText: text, start: pos, end: pos + node.nodeSize });
        }
      }
    });

    // Build Index asynchronously
    await this.buildReferenceIndex(
      { sectionTitle: "References", entries } as any,
      projectId,
    );

    // 2. Scan & Match
    const replacements: {
      start: number;
      end: number;
      id: string;
      text: string;
      url?: string;
      title?: string;
    }[] = [];

    editor.state.doc.descendants((node, pos) => {
      if (node.isText) {
        const text = node.text!;
        const candidates = this.detectCandidates(text, pos);

        for (const candidate of candidates) {
          const matchResult = this.matchCandidate(candidate);

          if (matchResult && matchResult.score >= 0.8) {
            replacements.push({
              start: candidate.start,
              end: candidate.end,
              id: matchResult.id,
              text: candidate.text,
              url: matchResult.record.url,
              title: matchResult.record.title,
            });
          } else {
            // Candidate found but score too low -> Ambiguous/Issue
            this.issues.push({
              text: candidate.text,
              reason: matchResult
                ? `Low confidence (${matchResult.score})`
                : "No matching reference found",
              candidates: matchResult ? [matchResult.record.rawText] : [],
              status: "needs_review",
            });
          }
        }
      }
    });

    // 3. Apply Transformations
    if (replacements.length > 0) {
      let tr = editor.state.tr;
      replacements.sort((a, b) => b.start - a.start);

      for (const rep of replacements) {
        tr = tr.replaceWith(
          rep.start,
          rep.end,
          editor.schema.nodes.citation.create({
            citationId: rep.id,
          }),
        );
      }

      try {
        if (editor.view && editor.view.dom) editor.view.dispatch(tr);
      } catch (e) {}
    }

    return {
      issues: this.issues,
      normalizedCount: replacements.length,
    };
  }

  /**
   * Step 1: Reference Index Construction
   */
  private async buildReferenceIndex(
    referenceList: any,
    projectId: string,
  ): Promise<void> {
    this.referenceIndex.clear();
    const { CitationRegistryService } =
      await import("../CitationRegistryService");

    for (const ref of referenceList.entries) {
      const parsed = parseReferenceText(ref.rawText);
      if (!parsed) continue;

      try {
        // Register with backend to get real ID
        const entry = await CitationRegistryService.registerCitation(
          projectId,
          ref.rawText,
          {
            authors: parsed.authors,
            year: parsed.year,
            title: parsed.title,
          },
        );

        const record: ReferenceRecord = {
          id: entry.ref_key, // Use backend ID
          authors: parsed.authors,
          year: parsed.year,
          title: parsed.title,
          url: entry.url,
          rawText: ref.rawText,
        };

        this.referenceIndex.set(entry.ref_key, record);
      } catch (error) {
        console.error("Failed to index reference:", ref.rawText, error);
      }
    }
  }

  /**
   * Step 2: Detect Candidates (Refined)
   */
  private detectCandidates(
    text: string,
    absolutePos: number,
  ): CitationCandidate[] {
    const candidates: CitationCandidate[] = [];

    // Use existing patterns library
    const patterns = extractPatterns(text, absolutePos);

    for (const pattern of patterns) {
      const textStr = pattern.text;

      if (pattern.patternType === "NUMERIC") {
        // IEEE Match
        const numMatch = textStr.match(/\d+/);
        if (numMatch) {
          candidates.push({
            text: textStr,
            start: pattern.start,
            end: pattern.end,
            year: 0, // Year not needed for numeric matching by ID
            authors: [numMatch[0]], // Use number as "author" for matching logic
            isAmbiguous: false,
          });
        }
      } else {
        // APA, MLA, Chicago
        const yearMatch = textStr.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : 0;

        // Clean text to get author: "(Greenberg, 2009)" -> "Greenberg" or "(Smith)" -> "Smith"
        let authorText = textStr
          .replace(/[()\[\]]/g, "") // remove parens/brackets
          .replace(/\d{4}/g, "") // remove year
          .replace(/,/g, "") // remove commas
          .replace(/et al\.?/g, "") // remove et al
          .trim();

        if (authorText) {
          candidates.push({
            text: textStr,
            start: pattern.start,
            end: pattern.end,
            year: year,
            authors: [authorText],
            isAmbiguous: false,
          });
        }
      }
    }

    return candidates;
  }

  /**
   * Step 3 & 4: Candidate -> Reference Matching & Scoring
   */
  private matchCandidate(
    candidate: CitationCandidate,
  ): { id: string; score: number; record: ReferenceRecord } | null {
    if (!candidate.authors || candidate.authors.length === 0) return null;

    const candidateAuthor = candidate.authors[0].toLowerCase();
    const year = candidate.year;

    // 1. Numeric Match (IEEE)
    if (year === 0 && /^\d+$/.test(candidateAuthor)) {
      const record = this.referenceIndex.get(candidateAuthor);
      if (record) return { id: record.id, score: 1.0, record };
    }

    // 2. Author-Year or Author Match
    const potentialMatches = Array.from(this.referenceIndex.values()).filter(
      (r) => year === 0 || r.year === year || r.year === 0,
    );

    let bestMatch: ReferenceRecord | null = null;
    let bestScore = 0;

    for (const record of potentialMatches) {
      const recordAuthor = record.authors[0].toLowerCase();
      let score = 0;

      // 1. Exact Author Match
      if (recordAuthor === candidateAuthor) {
        score = 1.0;
      }
      // 2. Contains Match (e.g. "Greenberg" in "Greenberg, S.")
      else if (
        recordAuthor.includes(candidateAuthor) ||
        candidateAuthor.includes(recordAuthor)
      ) {
        score = 0.9;
      }
      // 3. Organization Acronym (Simple heuristic)
      else if (
        candidateAuthor === "apa" &&
        recordAuthor.includes("american psychological")
      ) {
        score = 0.8;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = record;
      }
    }

    // Threshold check (e.g. 0.8)
    if (bestMatch && bestScore >= 0.8) {
      return { id: bestMatch.id, score: bestScore, record: bestMatch };
    }

    return null; // Ambiguous or No Match
  }
}
