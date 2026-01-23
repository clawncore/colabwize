import { EditorContent, AuditResult, AuditFinding, AuditRule } from "./types";
import { apaRules } from "./rules/apa";
import { mlaRules } from "./rules/mla";
import { ieeeRules } from "./rules/ieee";
import { chicagoRules } from "./rules/chicago";

const RULE_SETS: Record<string, AuditRule[]> = {
    "APA": apaRules,
    "MLA": mlaRules,
    "IEEE": ieeeRules,
    "Chicago": chicagoRules,
    // Add variations if needed
    // "Harvard": ...
};

/**
 * Helper to extract all text from Tiptap JSON content
 */
function extractTextFromContent(content: EditorContent): string {
    let text = "";
    if (content.text) {
        text += content.text;
    }
    if (content.content) {
        content.content.forEach(child => {
            text += extractTextFromContent(child) + " ";
        });
    }
    // Block separation
    if (content.type === "paragraph" || content.type === "heading") {
        text += "\n";
    }
    return text;
}

export function runCitationAudit(
    content: EditorContent,
    citationStyle: string
): AuditResult {
    const findings: AuditFinding[] = [];

    // Normalize style key
    // Map common names to keys
    let styleKey = citationStyle;
    if (!RULE_SETS[styleKey]) {
        // Fallback or fuzzy match could go here
        // For now, if style logic not found, return empty or error
        // But let's handle case insensitive
        const key = Object.keys(RULE_SETS).find(k => k.toLowerCase() === citationStyle.toLowerCase());
        if (key) styleKey = key;
    }

    const rules = RULE_SETS[styleKey];

    if (!rules) {
        return {
            style: citationStyle,
            findings: [{
                type: "warning",
                code: "UNKNOWN_STYLE",
                message: `Audit rules for style '${citationStyle}' are not defined yet.`
            }],
            timestamp: new Date().toISOString()
        };
    }

    // Extract text once for this pass
    const fullText = extractTextFromContent(content);

    // Run rules
    rules.forEach(rule => {
        try {
            const ruleFindings = rule.validate(content, fullText);
            findings.push(...ruleFindings);
        } catch (err) {
            console.error(`Error running audit rule ${rule.id}:`, err);
        }
    });

    return {
        style: styleKey,
        findings,
        timestamp: new Date().toISOString()
    };
}
