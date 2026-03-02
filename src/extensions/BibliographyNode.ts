import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Node, mergeAttributes } from '@tiptap/core';
export interface BibliographyEntryOptions {
    HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        bibliographyEntry: {
            insertBibliographyEntry: (options: { citationId: string; url?: string; doi?: string; refText?: string }) => ReturnType;
        }
    }
}

export const BibliographyEntry = Node.create<BibliographyEntryOptions>({
    name: 'bibliographyEntry',

    group: 'block',
    content: 'inline*',

    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            citationId: {
                default: null,
                parseHTML: element => element.getAttribute('data-citation-id'),
                renderHTML: attributes => ({
                    'data-citation-id': attributes.citationId,
                }),
            },
            url: {
                default: null,
                parseHTML: element => element.getAttribute('data-url'),
                renderHTML: attributes => ({
                    'data-url': attributes.url,
                }),
            },
            doi: {
                default: null,
                parseHTML: element => element.getAttribute('data-doi'),
                renderHTML: attributes => ({
                    'data-doi': attributes.doi,
                }),
            },
            refText: {
                default: '',
                parseHTML: element => element.getAttribute('data-ref-text'),
                renderHTML: attributes => ({
                    'data-ref-text': attributes.refText,
                }),
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-bibliography-entry]',
            },
        ];
    },

    renderHTML({ HTMLAttributes, node }) {
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-bibliography-entry': true,
                class: 'bibliography-entry mb-2 text-gray-900 leading-relaxed',
                id: `bib-${node.attrs.citationId || ''}`
            }),
            0, // content goes here
        ];
    },

    // Removed ProseMirror plugins to strip hyperlink clickability from bibliography entries as requested
});

