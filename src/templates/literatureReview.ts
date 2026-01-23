import { Template } from "./types";

/**
 * Literature Review Template
 * 
 * Structure-only template for literature reviews.
 * Contains ONLY headings and placeholder text - NO sample content, NO citations.
 */
export const literatureReviewTemplate: Template = {
    id: "literature-review",
    name: "Literature Review",
    description: "Analyze and synthesize existing research on a topic.",
    type: "literature-review",
    content: {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "Title of Your Review", marks: [{ type: "placeholder" }] }],
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
                        text: "What topic or question are you reviewing? Why is this review important right now?",
                        marks: [{ type: "placeholder" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Major Theme or Debate", marks: [{ type: "placeholder" }] }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What's the main conversation happening in the literature? Who agrees with whom? Who disagrees?",
                        marks: [{ type: "placeholder" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 3 },
                content: [{ type: "text", text: "Perspective A", marks: [{ type: "placeholder" }] }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What do researchers in this camp argue? What evidence supports their view?",
                        marks: [{ type: "placeholder" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 3 },
                content: [{ type: "text", text: "Perspective B", marks: [{ type: "placeholder" }] }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What's the counter-argument or alternative approach? What's their evidence?",
                        marks: [{ type: "placeholder" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Synthesis" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What patterns emerge across all these studies? What's still unresolved or contradictory?",
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
                        text: "What's missing from the current research? What should future studies tackle?",
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
