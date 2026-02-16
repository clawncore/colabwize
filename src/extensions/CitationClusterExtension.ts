
import { Mark, mergeAttributes } from '@tiptap/core';

export interface CitationClusterOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        citationCluster: {
            setCitationCluster: (attributes: { id: string }) => ReturnType;
            unsetCitationCluster: () => ReturnType;
        };
    }
}

export const CitationClusterExtension = Mark.create<CitationClusterOptions>({
    name: 'citationCluster',

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            id: {
                default: null,
                parseHTML: element => element.getAttribute('data-cite-cluster'),
                renderHTML: attributes => {
                    if (!attributes.id) {
                        return {};
                    }
                    return {
                        'data-cite-cluster': attributes.id,
                    };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-cite-cluster]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
    },

    addCommands() {
        return {
            setCitationCluster:
                attributes =>
                    ({ commands }) => {
                        return commands.setMark(this.name, attributes);
                    },
            unsetCitationCluster:
                () =>
                    ({ commands }) => {
                        return commands.unsetMark(this.name);
                    },
        };
    },
});
