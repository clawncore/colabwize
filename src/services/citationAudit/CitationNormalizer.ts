import { Editor } from "@tiptap/core";
import { extractPatterns } from "./patterns";

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
      const parsed = CitationNormalizer.parseReference(ref.rawText);
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
   * Parse a single reference string into a record
   */
  public static parseReference(text: string): ReferenceRecord | null {
    // Pattern: Start of string -> Authors -> (Year) or Year.
    const yearMatch = text.match(/\((\d{4})\)/) || text.match(/\b(\d{4})\./);
    if (!yearMatch) return null;

    const year = parseInt(yearMatch[1]);
    const preYearText = text.substring(0, yearMatch.index).trim();
    const postYearText = text
      .substring(yearMatch.index! + yearMatch[0].length)
      .trim();

    // Extract DOI/URL
    const doiMatch = text.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/);
    const urlMatch = text.match(/https?:\/\/[^\s]+|www\.[^\s]+/);

    // Extract primary author for ID generation
    // "Ioannidis, J. P. A." -> "Ioannidis"
    let primaryAuthor = preYearText.split(/,|\.|&/)[0].trim();
    // Clean author name for ID (take only alpha part of first word)
    const authorIdPart = primaryAuthor
      .split(/\s/)[0]
      .replace(/[^a-zA-Z]/g, "")
      .toLowerCase();

    // Generate ID
    const id = `${authorIdPart}${year}`;

    return {
      id,
      authors: [primaryAuthor],
      year,
      rawText: text,
      title: postYearText.split(/\.|\?|!/)[0].trim() || "Untitled",
    };
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
      // Only process AUTHOR_YEAR or similar patterns, skip NUMERIC if not relevant (or handle appropriately)
      if (
        pattern.patternType === "AUTHOR_YEAR" ||
        pattern.patternType === "et_al_with_period" ||
        pattern.patternType === "et_al_no_period"
      ) {
        // Extract Year and Author from the matched text
        const textStr = pattern.text;
        const yearMatch = textStr.match(/(\d{4})/);

        if (yearMatch) {
          const year = parseInt(yearMatch[1]);
          // Clean text to get author: "(Greenberg, 2009)" -> "Greenberg"
          let authorText = textStr
            .replace(/[()]/g, "") // remove parens
            .replace(year.toString(), "") // remove year
            .replace(/,/g, "") // remove commas
            .trim();

          // Handle "et al"
          if (authorText.includes("et al")) {
            authorText = authorText.split("et al")[0].trim();
          }

          candidates.push({
            text: pattern.text, // The full match to replace
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

    // Find all records matching the year
    const potentialMatches = Array.from(this.referenceIndex.values()).filter(
      (r) => r.year === year,
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
