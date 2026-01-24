import { AuditRule, AuditFinding, EditorContent } from "../types";

export const apaRules: AuditRule[] = [
    {
        id: "apa-numeric-citations",
        description: "Detects numeric citations [1] which are invalid in APA",
        validate: (content: EditorContent, allText: string): AuditFinding[] => {
            const findings: AuditFinding[] = [];
            // Regex for [1], [12], [1, 2] patterns
            const numericRegex = /\[\d+(?:,\s*\d+)*\]/g;

            let match;
            while ((match = numericRegex.exec(allText)) !== null) {
                findings.push({
                    type: "error",
                    code: "APA_INVALID_NUMERIC",
                    message: "APA uses parenthetical citations (Author, Year), not numeric brackets like [1].",
                    location: {
                        start: match.index,
                        end: match.index + match[0].length,
                        textSnippet: match[0]
                    },
                    suggestion: "Convert to (Author, Year) format."
                });
            }
            return findings;
        }
    },
    {
        id: "apa-et-al-format",
        description: "Detects incorrect 'et al' usage (missing period)",
        validate: (content: EditorContent, allText: string): AuditFinding[] => {
            const findings: AuditFinding[] = [];
            // Look for "et al" not followed by "."
            const etAlRegex = /\b([A-Z][a-z]+)\s+et\s+al(?!\.)\b/g;

            let match;
            while ((match = etAlRegex.exec(allText)) !== null) {
                findings.push({
                    type: "warning",
                    code: "APA_ET_AL_PERIOD",
                    message: "'et al' should be followed by a period: 'et al.'",
                    location: {
                        start: match.index,
                        end: match.index + match[0].length,
                        textSnippet: match[0]
                    },
                    suggestion: `${match[1]} et al.`
                });
            }
            return findings;
        }
    },
    {
        id: "apa-ampersand-parenthetical",
        description: "Checks for 'and' instead of '&' inside parenthetical citations",
        validate: (content: EditorContent, allText: string): AuditFinding[] => {
            const findings: AuditFinding[] = [];
            // Naive check: (Smith and Jones, 2023) -> Should be (Smith & Jones, 2023)
            // Regex: parenthetical with Year, containing " and "
            const parenRegex = /\(([^)]+)\)/g;

            let match;
            while ((match = parenRegex.exec(allText)) !== null) {
                const inside = match[1];
                // Check if it looks like a citation (has year likely)
                if (/\b(19|20)\d{2}\b/.test(inside)) {
                    // Check for " and " between names
                    if (/\b[A-Z][a-z]+\s+and\s+[A-Z][a-z]+/.test(inside)) {
                        findings.push({
                            type: "warning",
                            code: "APA_AMPERSAND",
                            message: "Use '&' instead of 'and' inside parenthetical citations.",
                            location: {
                                start: match.index,
                                end: match.index + match[0].length,
                                textSnippet: match[0]
                            },
                            suggestion: match[0].replace(" and ", " & ")
                        });
                    }
                }
            }
            return findings;
        }
    }
];
