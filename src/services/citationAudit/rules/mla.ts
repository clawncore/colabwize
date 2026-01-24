import { AuditRule, AuditFinding, EditorContent } from "../types";

export const mlaRules: AuditRule[] = [
    {
        id: "mla-numeric-citations",
        description: "Detects numeric citations [1] which are invalid in MLA",
        validate: (content: EditorContent, allText: string): AuditFinding[] => {
            const findings: AuditFinding[] = [];
            const numericRegex = /\[\d+(?:,\s*\d+)*\]/g;

            let match;
            while ((match = numericRegex.exec(allText)) !== null) {
                findings.push({
                    type: "error",
                    code: "MLA_INVALID_NUMERIC",
                    message: "MLA uses parenthetical citations (Author Page), not numeric brackets like [1].",
                    location: {
                        start: match.index,
                        end: match.index + match[0].length,
                        textSnippet: match[0]
                    },
                    suggestion: "Convert to (Author Page) format."
                });
            }
            return findings;
        }
    },
    {
        id: "mla-year-in-parenthesis",
        description: "Detects year in parenthetical citations (likely APA style)",
        validate: (content: EditorContent, allText: string): AuditFinding[] => {
            const findings: AuditFinding[] = [];
            // Regex: (Name, 1999) or (Name 1999) - Crude heuristic
            const yearRegex = /\([A-Z][a-z]+,?\s+(19|20)\d{2}\)/g;

            let match;
            while ((match = yearRegex.exec(allText)) !== null) {
                findings.push({
                    type: "warning",
                    code: "MLA_YEAR_IN_CITATION",
                    message: "MLA internal citations typically include Author and Page Number, but NOT the Year.",
                    location: {
                        start: match.index,
                        end: match.index + match[0].length,
                        textSnippet: match[0]
                    },
                    suggestion: "Remove the year."
                });
            }
            return findings;
        }
    },
    {
        id: "mla-comma-separator",
        description: "Detects comma between author and page number",
        validate: (content: EditorContent, allText: string): AuditFinding[] => {
            const findings: AuditFinding[] = [];
            // (Smith, 23) -> Should be (Smith 23)
            // Regex: (Word, digits)
            const commaRegex = /\([A-Z][a-z]+,\s+\d+\)/g;

            let match;
            while ((match = commaRegex.exec(allText)) !== null) {
                // Ensure the digits are not a year (already caught above potentially, but nice to be sure)
                const inside = match[0];
                if (!/\b(19|20)\d{2}\b/.test(inside)) {
                    findings.push({
                        type: "warning",
                        code: "MLA_COMMA_SEPARATOR",
                        message: "MLA citations do not use a comma between Author and Page Number.",
                        location: {
                            start: match.index,
                            end: match.index + match[0].length,
                            textSnippet: match[0]
                        },
                        suggestion: inside.replace(",", "")
                    });
                }
            }
            return findings;
        }
    }
];
