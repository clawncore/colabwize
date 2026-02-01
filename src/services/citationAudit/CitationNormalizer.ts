import { Editor } from "@tiptap/core";
import { extractPatterns } from "./patterns";

export interface ReferenceRecord {
    id: string; // "greenberg2009"
    authors: string[];
    year: number;
    title?: string;
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
    public normalize(editor: Editor): NormalizationResult {
        // 1. Build Index
        this.buildReferenceIndex(editor);

        // 2. Scan & Match
        const replacements: { start: number; end: number; id: string; text: string }[] = [];

        // We traverse the document to find text nodes and scan them
        editor.state.doc.descendants((node, pos) => {
            if (node.isText) {
                const text = node.text!;
                const candidates = this.detectCandidates(text, pos);

                for (const candidate of candidates) {
                    const matchResult = this.matchCandidate(candidate); // Returns object with score

                    if (matchResult && matchResult.score >= 0.8) {
                        // Overlap check?
                        // Ideally we check if this range overlaps with existing replacements.
                        // For now, assume extractPatterns returns non-overlapping.

                        replacements.push({
                            start: candidate.start,
                            end: candidate.end,
                            id: matchResult.id,
                            text: candidate.text
                        });
                    } else {
                        // Candidate found but score too low -> Ambiguous/Issue
                        this.issues.push({
                            text: candidate.text,
                            reason: matchResult ? `Low confidence (${matchResult.score})` : "No matching reference found",
                            candidates: matchResult ? [matchResult.record.rawText] : [],
                            status: "needs_review"
                        });
                    }
                }
            }
        });

        // 3. Apply Transformations (Reverse order to preserve offsets)
        // We need to execute a transaction
        if (replacements.length > 0) {
            let tr = editor.state.tr;
            // Sort replacements descending by start position
            replacements.sort((a, b) => b.start - a.start);

            for (const rep of replacements) {
                // Double check we aren't splitting logic
                tr = tr.replaceWith(rep.start, rep.end,
                    editor.schema.nodes.citation.create({
                        citationId: rep.id,
                        fallback: rep.text
                    })
                );
            }

            // Dispatch transaction
            editor.view.dispatch(tr);
        }

        return {
            issues: this.issues,
            normalizedCount: replacements.length
        };
    }

    /**
     * Step 1: Reference Index Construction
     */
    private buildReferenceIndex(editor: Editor) {
        // Identify References section
        // Simple heuristic: Look for heading "References" and parse subsequent paragraphs
        // For robustness, we'll scan the whole doc looking for the header pattern first

        let inRefSection = false;

        editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'heading') {
                const text = node.textContent.toLowerCase().trim();
                if (text === 'references' || text === 'works cited' || text === 'bibliography') {
                    inRefSection = true;
                    return; // Skip the header itself
                } else {
                    if (inRefSection) inRefSection = false; // End of section
                }
            }

            if (inRefSection && (node.type.name === 'paragraph' || node.type.name === 'listItem')) {
                const text = node.textContent.trim();
                if (text.length > 20) { // simple noise filter
                    const record = CitationNormalizer.parseReference(text);
                    if (record) {
                        this.referenceIndex.set(record.id, record);
                    }
                }
            }
        });
    }

    /**
     * Parse a single reference string into a record
     */
    public static parseReference(text: string): ReferenceRecord | null {
        // Simple extraction logic (can be enhanced with an external parser)
        // Goal: Extract Author(s) and Year

        // Pattern: Start of string -> Authors -> (Year) or Year.
        // Example: "Greenberg, S. A. (2009). Title..."

        const yearMatch = text.match(/\((\d{4})\)/) || text.match(/\b(\d{4})\./);
        if (!yearMatch) return null;

        const year = parseInt(yearMatch[1]);
        const preYearText = text.substring(0, yearMatch.index).trim();

        // Extract first author surname
        // "Greenberg, S. A." -> "Greenberg"
        // "Higgins, J. P., & Green, S." -> "Higgins"
        // "American Psychological Association" -> entire string

        let primaryAuthor = "";
        const authorMatch = preYearText.split(/,|\.|&/)[0].trim();
        if (authorMatch) {
            primaryAuthor = authorMatch;
        } else {
            return null; // Can't identify
        }

        // Generate ID
        const id = `${primaryAuthor.toLowerCase().replace(/\s/g, '')}${year}`;

        return {
            id,
            authors: [primaryAuthor], // Simplify for now
            year,
            rawText: text,
            title: text.substring(yearMatch.index! + yearMatch[0].length).trim() // Rough title extraction
        };
    }

    /**
     * Step 2: Detect Candidates (Refined)
     */
    private detectCandidates(text: string, absolutePos: number): CitationCandidate[] {
        const candidates: CitationCandidate[] = [];

        // Use existing patterns library
        const patterns = extractPatterns(text, absolutePos);

        for (const pattern of patterns) {
            // Only process AUTHOR_YEAR or similar patterns, skip NUMERIC if not relevant (or handle appropriately)
            if (pattern.patternType === "AUTHOR_YEAR" || pattern.patternType === "et_al_with_period" || pattern.patternType === "et_al_no_period") {

                // Extract Year and Author from the matched text
                const textStr = pattern.text;
                const yearMatch = textStr.match(/(\d{4})/);

                if (yearMatch) {
                    const year = parseInt(yearMatch[1]);
                    // Clean text to get author: "(Greenberg, 2009)" -> "Greenberg"
                    let authorText = textStr.replace(/[()]/g, "") // remove parens
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
                        isAmbiguous: false
                    });
                }
            }
        }

        return candidates;
    }

    /**
     * Step 3 & 4: Candidate -> Reference Matching & Scoring
     */
    private matchCandidate(candidate: CitationCandidate): { id: string, score: number, record: ReferenceRecord } | null {
        if (!candidate.authors || candidate.authors.length === 0) return null;

        const candidateAuthor = candidate.authors[0].toLowerCase();
        const year = candidate.year;

        // Find all records matching the year
        const potentialMatches = Array.from(this.referenceIndex.values()).filter(r => r.year === year);

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
            else if (recordAuthor.includes(candidateAuthor) || candidateAuthor.includes(recordAuthor)) {
                score = 0.9;
            }
            // 3. Organization Acronym (Simple heuristic)
            else if (candidateAuthor === "apa" && recordAuthor.includes("american psychological")) {
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
