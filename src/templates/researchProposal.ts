import { Template } from "./types";

/**
 * Research Proposal Template
 * 
 * Structure-only template for research proposals.
 * Contains ONLY headings and placeholder text - NO sample content, NO citations.
 */
export const researchProposalTemplate: Template = {
    id: "research-proposal",
    name: "Research Proposal",
    description: "Outline your proposed research project and methodology.",
    type: "research-proposal",
    content: {
        type: "doc",
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: "Title of Proposed Study" }],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Problem Statement" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What specific problem or gap in knowledge will your study address? Why hasn't this been solved yet?",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Research Questions" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What exact questions will your study answer? Be specific—avoid vague or unfocused questions.",
                        marks: [{ type: "italic" }],
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
                        text: "What have others already tried? Why is your approach different or better?",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Proposed Methodology" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "How will you actually do this research? What data will you collect, and how will you analyze it?",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Expected Outcomes" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "What results do you anticipate? How will this contribute to the field?",
                        marks: [{ type: "italic" }],
                    },
                ],
            },
            {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Timeline" }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: "Break down your project into phases. How long will each stage take?",
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
        ],
    },
};
