import { Node, mergeAttributes } from "@tiptap/core";
import { CitationRegistryService } from "../services/CitationRegistryService";

export interface CitationNodeOptions {
    HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        citation: {
            insertCitation: (attributes: { citationId: string; text?: string }) => ReturnType;
        };
    }
}

export const CitationNode = Node.create<CitationNodeOptions>({
    name: "citation",
    group: "inline",
    inline: true,
    atom: true, // It is an atom, content is not directly editable text

    addOptions() {
        return {
            HTMLAttributes: {
                class: "citation-token",
            },
        };
    },

    addAttributes() {
        return {
            citationId: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-cite"),
                renderHTML: (attributes) => {
                    if (!attributes.citationId) {
                        return {};
                    }
                    return {
                        "data-cite": attributes.citationId,
                    };
                },
            },
            status: {
                default: "unresolved",
                parseHTML: (element) => element.getAttribute("data-status"),
                renderHTML: (attributes) => ({
                    "data-status": attributes.status
                }),
            },
            // Helper attribute to render text in Editor without storing it as document content
            text: {
                default: "Citation",
                parseHTML: (element) => element.textContent || element.getAttribute("data-text"),
                renderHTML: (attributes) => ({
                    "data-text": attributes.text
                }),
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: "span[data-cite]",
                getAttrs: (node) => {
                    if (typeof node === 'string') return {};
                    const element = node as HTMLElement;
                    return {
                        citationId: element.getAttribute("data-cite"),
                        status: element.getAttribute("data-status"),
                        text: element.textContent || element.getAttribute("data-text")
                    };
                }
            },
        ];
    },

    renderHTML({ HTMLAttributes, node }) {
        // Debug logging
        console.log('[CitationNode] renderHTML called');
        console.log('[CitationNode] node.attrs:', node.attrs);
        console.log('[CitationNode] HTMLAttributes:', HTMLAttributes);

        // Dynamic classes based on status
        const status = node.attrs.status || 'unresolved';
        let statusClass = "border-blue-200"; // Default

        switch (status) {
            case 'verified':
                statusClass = "border-green-400 bg-green-50 text-green-700";
                break;
            case 'warning':
                statusClass = "border-yellow-400 bg-yellow-50 text-yellow-700";
                break;
            case 'invalid':
                statusClass = "border-red-400 bg-red-50 text-red-700";
                break;
            default:
                statusClass = "border-blue-200 bg-blue-50/50 text-blue-700";
        }

        const merged = mergeAttributes(
            this.options.HTMLAttributes,
            HTMLAttributes, // This contains data-cite, data-status, data-text from addAttributes
            {
                class: `citation-pill px-[2px] py-[1px] rounded-[2px] border-b cursor-pointer hover:opacity-80 transition-colors ${statusClass}`,
            }
        );

        console.log('[CitationNode] Merged attributes:', merged);

        return [
            "span",
            merged,
            node.attrs.text || "Citation"
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
                                text: attributes.text
                            },
                        });
                    },
        };
    },
});

export default CitationNode;
