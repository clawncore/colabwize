import { AuditRule, AuditFinding, EditorContent } from "../types";

export const ieeeRules: AuditRule[] = [
    {
        id: "ieee-authoryear-citations",
        description: "Detects parenthetical Author-Year citations (APA style)",
        validate: (content: EditorContent, allText: string): AuditFinding[] => {
            const findings: AuditFinding[] = [];
            // Regex: (Smith, 1999) or (Smith 1999) or (Smith et al., 1999)
            // Looks for parantheses containing a year
            const authorYearRegex = /\([A-Za-z\s&.]+,?\s*(19|20)\d{2}\)/g;

            let match;
            while ((match = authorYearRegex.exec(allText)) !== null) {
                findings.push({
                    type: "error",
                    code: "IEEE_INVALID_PARENTHETICAL",
                    message: "IEEE uses numeric citations [1], not parenthetical (Author, Year).",
                    location: {
                        startIndex: match.index,
                        endIndex: match.index + match[0].length,
                        textSnippet: match[0]
                    },
                    suggestion: "Convert to [Number] format."
                });
            }
            return findings;
        }
    },
    {
        id: "ieee-mla-style",
        description: "Detects parenthetical Author-Page citations (MLA style)",
        validate: (content: EditorContent, allText: string): AuditFinding[] => {
            const findings: AuditFinding[] = [];
            // Regex: (Smith 23) but skip (Smith, 2023)
            // Look for (Word Digits) without comma
            const mlaRegex = /\([A-Z][a-z]+\s+\d+\)/g;

            let match;
            while ((match = mlaRegex.exec(allText)) !== null) {
                findings.push({
                    type: "error",
                    code: "IEEE_INVALID_MLA",
                    message: "IEEE uses numeric citations [1], not parenthetical (Author Page).",
                    location: {
                        startIndex: match.index,
                        endIndex: match.index + match[0].length,
                        textSnippet: match[0]
                    },
                    suggestion: "Convert to [Number] format."
                });
            }
            return findings;
        }
    }
];
