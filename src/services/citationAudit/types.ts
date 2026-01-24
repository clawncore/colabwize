// Frontend Types matching Backend Contract

export type CitationStyle = "APA" | "MLA" | "IEEE" | "Chicago";

export type PatternType =
    | "NUMERIC_BRACKET"   // [1]
    | "AUTHOR_YEAR"       // (Smith, 2023)
    | "AUTHOR_PAGE"       // (Smith 24)
    | "et_al_no_period"   // et al
    | "et_al_with_period" // et al.
    | "AMPERSAND_IN_PAREN" // (Smith & Jones)
    | "AND_IN_PAREN";      // (Smith and Jones)

export interface DocumentMeta {
    language: string;
    editor: string;
}

export type SectionType = "BODY" | "REFERENCE_SECTION";

export interface DocumentSection {
    title: string;
    type: SectionType;
    range?: { start: number; end: number };
}

export interface ExtractedPattern {
    patternType: PatternType;
    text: string;
    start: number;
    end: number;
    section: SectionType;
}

export interface RawExtractedPattern {
    patternType: PatternType;
    text: string;
    start: number;
    end: number;
}

export interface ReferenceEntry {
    index: number;
    rawText: string;
    start: number;
    end: number;
}

export interface ReferenceListExtraction {
    sectionTitle: string;
    entries: ReferenceEntry[];
}

// Backend Request Payload
export interface AuditRequest {
    declaredStyle: CitationStyle;
    documentMeta: DocumentMeta;
    sections: DocumentSection[];
    patterns: ExtractedPattern[];
    referenceList: ReferenceListExtraction | null;
}

export type CitationViolationType = "INLINE_STYLE" | "REF_LIST_ENTRY" | "STRUCTURAL";

export interface CitationFlag {
    type: CitationViolationType;
    ruleId: string;
    message: string;
    anchor?: {
        start: number;
        end: number;
        text: string;
    };
    section?: string;
    expected?: string;
}

export interface AuditReport {
    style: CitationStyle;
    timestamp: string;
    flags: CitationFlag[];
    detectedStyles?: string[];
}

// Editor Interface (Frontend only helper)
export interface EditorContent {
    type: string;
    content?: EditorContent[];
    text?: string;
    attrs?: Record<string, any>;
}

// LEGACY TYPES (To support old rule files until deletion)
export interface AuditRule {
    id: string;
    description: string;
    validate: (content: EditorContent, allText: string) => AuditFinding[];
}

export interface AuditFinding {
    type: "error" | "warning";
    code: string;
    message: string;
    location?: {
        start?: number;
        end?: number;
        textSnippet?: string;
    };
    suggestion?: string;
}
