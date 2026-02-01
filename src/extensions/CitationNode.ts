import { Mark, mergeAttributes } from "@tiptap/core";

export interface CitationMarkOptions {
    HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        citation: {
            /**
             * Set a citation mark
             */
            setCitationMark: (attributes: { citationId: string }) => ReturnType;
            /**
             * Unset a citation mark
             */
            unsetCitationMark: () => ReturnType;
            /**
             * Insert a citation with fallback text
             */
            insertCitation: (attributes: { citationId: string; fallback: string }) => ReturnType;
        };
    }
}

export const CitationNode = Mark.create<CitationMarkOptions>({
    name: "citation", // Keep name 'citation' for compatibility with existing detection if possible

    addOptions() {
        return {
            HTMLAttributes: {
                class: "citation-pill",
            },
        };
    },

    addAttributes() {
        return {
            citationId: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-citation-id"),
                renderHTML: (attributes) => {
                    if (!attributes.citationId) {
                        return {};
                    }
                    return {
                        "data-citation-id": attributes.citationId,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "span[data-type='citation']",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "span",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                "data-type": "citation",
                // Premium editable style: subtle blue background, colored text, slightly rounded
                class: "px-[2px] py-[1px] rounded-[2px] bg-blue-50/50 text-blue-700 border-b border-blue-200 cursor-pointer hover:bg-blue-100/70 transition-colors",
                style: "font-family: inherit;", // Ensure it blends with surrounding text
            }),
            0,
        ];
    },

    addCommands() {
        return {
            setCitationMark:
                (attributes) =>
                    ({ commands }) => {
                        return commands.setMark(this.name, attributes);
                    },
            unsetCitationMark:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
            insertCitation:
                (attributes) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: "text",
                            text: attributes.fallback,
                            marks: [
                                {
                                    type: this.name,
                                    attrs: { citationId: attributes.citationId },
                                },
                            ],
                        });
                    },
        };
    },
});

export default CitationNode;
