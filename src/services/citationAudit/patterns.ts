import { PatternType, RawExtractedPattern } from "./types";
import { EditorContent } from "./types";

/**
 * Strict Regex Patterns for Citation Signals
 * These are style-agnostic detectors.
 * Note: NORMALIZED citations don't use regex (they're extracted from Tiptap nodes)
 */
/**
 * Strict Regex Patterns for Citation Signals
 */
export const CITATION_PATTERNS = {
    // [1], [12], [1, 2], [1-3]
    "NUMERIC_BRACKET": {
        regex: /\[\s*\d+(?:[\s,-]+\d+)*\s*\]/g,
        isStructural: true
    },

    // (Smith, 2023) or (Smith et al., 2023)
    "AUTHOR_YEAR": {
        regex: /\((?:[^)]+,?\s+)+(?:19|20)\d{2}[a-z]?\)/g,
        isStructural: true
    },

    // (Smith 24) or (Smith et al. 24)
    "AUTHOR_PAGE": {
        regex: /\((?:[A-Z][a-zA-Z\s.'-']+(?:,\s+)?)\d+(?:-\d+)?\)/g,
        isStructural: true
    },

    // Signal fragments (Used for audit, NOT for standalone normalization)
    "ET_AL_NO_PERIOD": {
        regex: /\bet\s+al(?!\.)/g,
        isStructural: false
    },
    "ET_AL_WITH_PERIOD": {
        regex: /\bet\s+al\./g,
        isStructural: false
    },
    "AMPERSAND_IN_PAREN": {
        regex: /\([^)]*[A-Z][a-z]+\s+&\s+[A-Z][a-z]+[^)]*\)/g,
        isStructural: false
    },
    "AND_IN_PAREN": {
        regex: /\([^)]*[A-Z][a-z]+\s+and\s+[A-Z][a-z]+[^)]*\)/g,
        isStructural: false
    }
};

/**
 * Extract all citation patterns from a given text block
 */
export function extractPatterns(
    text: string,
    offset: number,
    filter: "all" | "structural" = "all"
): RawExtractedPattern[] {
    const findings: RawExtractedPattern[] = [];

    Object.entries(CITATION_PATTERNS).forEach(([type, config]) => {
        // Skip non-structural if requested
        if (filter === "structural" && !config.isStructural) return;

        const regex = config.regex;
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

            const contextText = text.substring(sentenceStart, sentenceEnd).trim();

            findings.push({
                patternType: type as PatternType,
                text: matchText,
                start: offset + matchIndex,
                end: offset + matchIndex + matchText.length,
                context: contextText
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
