import { Mark, mergeAttributes } from "@tiptap/core";

export interface GrammarOptions {
    HTMLAttributes: Record<string, any>;
}

export interface GrammarAttributes {
    suggestion?: string;
    explanation?: string;
    type?: "spelling" | "grammar" | "style" | "capitalization" | "punctuation";
    original?: string;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        grammar: {
            setGrammarError: (attributes: GrammarAttributes) => ReturnType;
            unsetGrammarError: () => ReturnType;
            clearAllGrammarErrors: () => ReturnType;
        };
    }
}

export const GrammarExtension = Mark.create<GrammarOptions>({
    name: "grammar-error",

    addOptions() {
        return {
            HTMLAttributes: {
                class: "grammar-error",
            },
        };
    },

    addAttributes() {
        return {
            suggestion: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-suggestion"),
                renderHTML: (attributes) => {
                    if (!attributes.suggestion) return {};
                    return { "data-suggestion": attributes.suggestion };
                },
            },
            explanation: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-explanation"),
                renderHTML: (attributes) => {
                    if (!attributes.explanation) return {};
                    return { "data-explanation": attributes.explanation };
                },
            },
            type: {
                default: "grammar",
                parseHTML: (element) => element.getAttribute("data-type"),
                renderHTML: (attributes) => {
                    if (!attributes.type) return {};
                    return {
                        "data-type": attributes.type,
                        "class": `grammar-error grammar-error-${attributes.type}`
                    };
                },
            },
            original: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-original"),
                renderHTML: (attributes) => {
                    if (!attributes.original) return {};
                    return { "data-original": attributes.original };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "span",
                getAttrs: (node) => {
                    const element = node as HTMLElement;
                    return element.classList.contains("grammar-error") && null;
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setGrammarError: (attributes) => ({ commands }) => {
                return commands.setMark(this.name, attributes);
            },
            unsetGrammarError: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
            clearAllGrammarErrors: () => ({ state, dispatch }) => {
                const { doc } = state;
                const transaction = state.tr;

                doc.descendants((node, pos) => {
                    if (node.marks) {
                        const mark = node.marks.find(m => m.type.name === this.name);
                        if (mark) {
                            transaction.removeMark(pos, pos + node.nodeSize, this.type);
                        }
                    }
                    return true;
                });

                if (dispatch) dispatch(transaction);
                return true;
            },
        };
    },
});
