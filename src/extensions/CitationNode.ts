import { Node, mergeAttributes } from "@tiptap/core";
import { CitationRegistryService } from "../services/CitationRegistryService";

export interface CitationNodeOptions {
    HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        citation: {
            insertCitation: (attributes: { citationId: string, text?: string, url?: string }) => ReturnType;
        };
    }
}

export const CitationNode = Node.create<CitationNodeOptions>({
    name: "citation",
    group: "inline",
    inline: true,
    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {
                class: "citation-node citation-pill",
            },
        };
    },

    addAttributes() {
        return {
            citationId: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-citation-id") || element.getAttribute("data-cite"),
                renderHTML: (attributes) => ({ "data-citation-id": attributes.citationId }),
            },
            status: {
                default: "unresolved",
                parseHTML: (element) => element.getAttribute("data-status"),
                renderHTML: (attributes) => ({ "data-status": attributes.status }),
            },
            text: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-text") || element.textContent,
                renderHTML: (attributes) => ({ "data-text": attributes.text }),
            },
            url: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-url") || element.getAttribute("href"),
                renderHTML: (attributes) => ({ "data-url": attributes.url }),
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: "a.citation-node",
            },
            {
                tag: "span[data-citation-id]",
            },
            {
                tag: "span[data-cite]",
            },
        ];
    },

    // Deterministic rendering for export and in-editor display
    renderHTML({ HTMLAttributes, node }) {
        const { citationId, text } = node.attrs;

        // Strict canonical rendering: only render what the backend provided
        const displayText = text || "[citation]";

        return [
            "span",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                "data-citation-id": citationId,
                "data-text": displayText,
                style: `color:#2563eb; font-weight:500;`, // Simple blue text, no hyperlink
            }),
            displayText
        ];
    },

    addCommands() {
        return {
            insertCitation:
                (attributes) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                citationId: attributes.citationId,
                                text: attributes.text,
                            },
                        });
                    },
        };
    },
});



export default CitationNode;
