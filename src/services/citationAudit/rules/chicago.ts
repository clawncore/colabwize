import { AuditRule, AuditFinding, EditorContent } from "../types";

export const chicagoRules: AuditRule[] = [
    {
        id: "chicago-numeric-citations",
        description: "Detects numeric citations [1] which are invalid in Chicago Notes style",
        validate: (content: EditorContent, allText: string): AuditFinding[] => {
            const findings: AuditFinding[] = [];
            const numericRegex = /\[\d+(?:,\s*\d+)*\]/g;

            let match;
            while ((match = numericRegex.exec(allText)) !== null) {
                findings.push({
                    type: "error",
                    code: "CHICAGO_INVALID_NUMERIC",
                    message: "Chicago (Notes & Bibliography) uses footnotes, not numeric brackets like [1].",
                    location: {
                        startIndex: match.index,
                        endIndex: match.index + match[0].length,
                        textSnippet: match[0]
                    },
                    suggestion: "Convert to a footnote."
                });
            }
            return findings;
        }
    },
    {
        id: "chicago-parenthetical-check",
        description: "Warns about parenthetical citations if using Notes-Bibliography style",
        validate: (content: EditorContent, allText: string): AuditFinding[] => {
            const findings: AuditFinding[] = [];
            // Regex for (Smith, 2023)
            const authorYearRegex = /\([A-Za-z\s&\.]+,?\s*(19|20)\d{2}\)/g;

            let match;
            while ((match = authorYearRegex.exec(allText)) !== null) {
                findings.push({
                    type: "warning",
                    code: "CHICAGO_PARENTHETICAL_WARN",
                    message: "If using Chicago Notes & Bibliography style, parenthetical citations (Author, Year) are incorrect. Use footnotes.",
                    location: {
                        startIndex: match.index,
                        endIndex: match.index + match[0].length,
                        textSnippet: match[0]
                    },
                    suggestion: "Convert to a footnote."
                });
            }
            return findings;
        }
    }
];
