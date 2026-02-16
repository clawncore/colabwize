import { PatternType, RawExtractedPattern } from "./types";
import { EditorContent } from "./types";

/**
 * Strict Regex Patterns for Citation Signals
 * These are style-agnostic detectors.
 * Note: NORMALIZED citations don't use regex (they're extracted from Tiptap nodes)
 */
const PATTERNS: Record<Exclude<PatternType, "NORMALIZED">, RegExp> = {
    // [1], [12], [1, 2], [1-3]
    "NUMERIC_BRACKET": /\[\s*\d+(?:[\s,-]+\d+)*\s*\]/g,

    // (Smith, 2023) or (Smith et al., 2023) or (Agency & Dept, 2023)
    // Anchored by a 4-digit year at the end.
    // MODIFIED: Requires at least one character before the year to avoid matching (2020)
    "AUTHOR_YEAR": /\((?:[^)]+,?\s+)+(?:19|20)\d{2}[a-z]?\)/g,

    // (Smith 24) or (Smith et al. 24) or (Smith, 24)
    "AUTHOR_PAGE": /\((?:[A-Z][a-zA-Z\s.'-']+(?:,\s+)?)\d+(?:-\d+)?\)/g,

    // et al NOT followed by period
    "et_al_no_period": /\bet\s+al(?!\.)/g,

    // et al. (correct)
    "et_al_with_period": /\bet\s+al\./g,

    // (Smith & Jones) - Ampersand inside parens
    "AMPERSAND_IN_PAREN": /\([^)]*[A-Z][a-z]+\s+&\s+[A-Z][a-z]+[^)]*\)/g,

    // (Smith and Jones) - "and" inside parens
    "AND_IN_PAREN": /\([^)]*[A-Z][a-z]+\s+and\s+[A-Z][a-z]+[^)]*\)/g
};

/**
 * Extract all citation patterns from a given text block
 */
export function extractPatterns(text: string, offset: number, context: "inline" | "ref_list_entry" = "inline"): RawExtractedPattern[] {
    const findings: RawExtractedPattern[] = [];

    Object.entries(PATTERNS).forEach(([type, regex]) => {
        // Reset regex state
        regex.lastIndex = 0;

        let match;
        while ((match = regex.exec(text)) !== null) {
            // Extract surrounding context (sentence)
            const matchIndex = match.index;
            const matchText = match[0];

            // Find start of sentence (backward search for . ! ? or start of string)
            let sentenceStart = 0;
            const beforeMatch = text.substring(0, matchIndex);
            const sentenceStartMatch = beforeMatch.match(/[.!?]\s+[^.!?]*$/);
            if (sentenceStartMatch) {
                sentenceStart = sentenceStartMatch.index! + sentenceStartMatch[0].indexOf(sentenceStartMatch[0].trim().substring(0, 1)) + 1;
            }

            // Find end of sentence (forward search for . ! ? or end of string)
            let sentenceEnd = text.length;
            const afterMatch = text.substring(matchIndex + matchText.length);
            const sentenceEndMatch = afterMatch.match(/[.!?]/);
            if (sentenceEndMatch) {
                sentenceEnd = matchIndex + matchText.length + sentenceEndMatch.index! + 1;
            }

            const context = text.substring(sentenceStart, sentenceEnd).trim();

            findings.push({
                patternType: type as PatternType,
                text: matchText,
                start: offset + matchIndex,
                end: offset + matchIndex + matchText.length,
                context: context
            });
        }
    });

    return findings;
}

/**
 * Helper to traverse Tiptap JSON and extract text with absolute offsets
 */
export function extractTextWithOffsets(node: EditorContent, currentOffset = 0): { text: string; offset: number; type: string }[] {
    const results: { text: string; offset: number; type: string }[] = [];

    if (node.text) {
        results.push({ text: node.text, offset: currentOffset, type: 'text' });
        // Tiptap text nodes: length of text
        currentOffset += node.text.length;
    } else {
        currentOffset += 1; // Open tag
        if (node.content) {
            node.content.forEach(child => {
                const childRes = extractTextWithOffsets(child, currentOffset);
                results.push(...childRes);
                const childSize = calculateNodeSize(child);
                currentOffset += childSize;
            });
        }
        currentOffset += 1; // Close tag
    }
    return results;
}

function calculateNodeSize(node: EditorContent): number {
    if (node.text) {
        return node.text.length;
    }
    let size = 2; // Open + Close
    if (node.content) {
        node.content.forEach(child => {
            size += calculateNodeSize(child);
        });
    }
    return size;
}
