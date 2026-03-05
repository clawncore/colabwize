import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';
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

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('bibliography-url-highlight'),
                props: {
                    decorations(state) {
                        const decorations: Decoration[] = [];
                        const urlRegex = /https?:\/\/[^\s)\].]+/g;

                        state.doc.descendants((node, pos) => {
                            if (node.type.name !== 'bibliographyEntry') return true;

                            // Scan all text nodes inside this bibliographyEntry
                            node.descendants((child, childPos) => {
                                if (!child.isText || !child.text) return;

                                const text = child.text;
                                let match: RegExpExecArray | null;
                                urlRegex.lastIndex = 0;

                                while ((match = urlRegex.exec(text)) !== null) {
                                    // Make sure we strip any trailing generic punctuation that got caught
                                    let url = match[0];
                                    if (url.endsWith('.') || url.endsWith(',')) url = url.slice(0, -1);

                                    const from = pos + 1 + childPos + match.index;
                                    const to = from + url.length;

                                    decorations.push(
                                        Decoration.inline(from, to, {
                                            class: 'bibliography-url-link',
                                            'data-url': url,
                                            style: 'color: #2563eb; text-decoration: underline; cursor: pointer;',
                                        })
                                    );
                                }
                            });
                        });

                        return DecorationSet.create(state.doc, decorations);
                    },
                },
            }),
        ];
    },
});
