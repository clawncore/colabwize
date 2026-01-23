import { Template } from "./types";

/**
 * Thesis/Dissertation Template
 * 
 * Structure-only template for master's thesis or doctoral dissertation.
 * Contains ONLY headings and placeholder text - NO sample content, NO citations.
 */
export const thesisTemplate: Template = {
    id: "thesis",
    name: "Thesis",
    description: "Full structure for a master's thesis or dissertation.",
    type: "thesis",
    content: {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "Thesis Title" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Your Name | Department | University | Date",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Abstract" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What's the core argument? What methods did you use? What's the main finding? (250-350 words)",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Acknowledgments" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Who helped make this work possible?",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Table of Contents" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "List chapters and major sections with page numbers.",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Chapter 1: Introduction" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What's the big problem you're tackling? Why does it matter? What will this thesis argue?",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Chapter 2: Literature Review" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What's already known? What debates exist? Where's the gap your work fills?",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Chapter 3: Methodology" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "How did you design and conduct your research? What data did you collect? How did you analyze it?",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Chapter 4: Findings" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What did you discover? Present your data and key patterns.",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Chapter 5: Analysis & Discussion" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What do your findings mean? How do they compare to existing research? What are the implications?",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Chapter 6: Conclusion" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What's your main contribution? What limitations exist? What should future research explore?",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "References" }],
            },
            {
                type: "paragraph",
                content: [],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Appendices" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Include supplementary materials: raw data, survey instruments, interview protocols, etc.",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
        ],
    },
};
