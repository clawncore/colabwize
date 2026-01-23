/**
 * Template Type Definitions
 * 
 * Defines TypeScript interfaces for frontend-only template system.
 * Templates are static, version-controlled structures that live in the frontend.
 */

// Tiptap JSON content node types
export interface TextNode {
    type: "text";
    text: string;
    marks?: Array<{ type: string; attrs?: Record<string, any> }>;
}

export interface ParagraphNode {
    type: "paragraph";
    content?: ContentNode[];
}

export interface HeadingNode {
    type: "heading";
    attrs: { level: 1 | 2 | 3 | 4 | 5 | 6 };
    content?: ContentNode[];
}

// Union type for all possible content nodes
export type ContentNode = TextNode | ParagraphNode | HeadingNode;

// Template content structure (compatible with Tiptap)
export interface TemplateContent {
    type: "doc";
    content: ContentNode[];
}

// Template metadata
export interface Template {
    id: string;
    name: string;
    description: string;
    type: TemplateType;
    content: TemplateContent;
}

// Supported template types
export type TemplateType =
    | "research-paper"
    | "literature-review"
    | "research-proposal"
    | "thesis"
    | "blank";
