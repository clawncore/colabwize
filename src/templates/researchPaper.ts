import { Template } from "./types";

/**
 * Research Paper Template
 * 
 * Structure-only template for academic research papers.
 * Contains ONLY headings and placeholder text - NO sample content, NO citations.
 */
export const researchPaperTemplate: Template = {
    id: "research-paper",
    name: "Research Paper",
    description: "Standard structure for academic research.",
    type: "research-paper",
    content: {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "Title of Your Study", marks: [{ type: "placeholder" }] }],
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
                        text: "What problem did you investigate? What methods did you use? What did you find? Why does it matter?",
                        marks: [{ type: "placeholder" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Introduction" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What is the issue or gap in knowledge you're addressing? Why should readers care about this problem?",
                        marks: [{ type: "placeholder" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Literature Review" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What have other researchers already discovered about this topic? Where are the gaps or disagreements?",
                        marks: [{ type: "placeholder" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Methodology" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "How exactly did you conduct this study? What tools, participants, or data did you use? Could someone replicate your work?",
                        marks: [{ type: "placeholder" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Results" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What patterns, numbers, or observations did you find? (Just the facts—no interpretation yet.)",
                        marks: [{ type: "placeholder" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Discussion" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What do your results actually mean? How do they compare to what others found? What are the limitations?",
                        marks: [{ type: "placeholder" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Conclusion" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What's the main takeaway? What should researchers investigate next?",
                        marks: [{ type: "placeholder" }],
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
        ],
    },
};
