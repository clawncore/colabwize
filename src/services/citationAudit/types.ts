export type FindingType = "error" | "warning";

export interface AuditFinding {
    type: FindingType;
    code: string;
    message: string;
    location?: {
        blockId?: string; // Tiptap block ID if available
        textSnippet?: string; // Context text
        startIndex?: number;
        endIndex?: number;
    };
    suggestion?: string;
}

export interface AuditResult {
    style: string;
    findings: AuditFinding[];
    timestamp: string;
}

// Minimal representation of editor content for audit
export interface EditorContent {
    type: string;
    content?: EditorContent[];
    text?: string;
    attrs?: Record<string, any>;
}

export interface AuditRule {
    id: string;
    description: string;
    validate: (content: EditorContent, allText: string) => AuditFinding[];
}
