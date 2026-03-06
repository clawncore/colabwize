/* eslint-disable */
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
        const getDecorations = (doc: any) => {
            const decorations: any[] = [];
            doc.descendants((node: any, pos: number) => {
                if (node.type.name === 'bibliographyEntry') {
                    node.descendants((child: any, offset: number) => {
                        if (child.isText) {
                            const text = child.text || '';
                            // Create a FRESH regex each time to avoid lastIndex sticking
                            // Improved regex to handle balanced parentheses in DOIs (e.g. 10.1016/(S01...) )
                            const urlRegex = /(https?:\/\/[^\s>\]]+)/g;
                            let match;
                            while ((match = urlRegex.exec(text)) !== null) {
                                // Robust extraction logic
                                let url = match[0];

                                // Strip common trailing punctuation
                                url = url.replace(/[.,;:!?]+$/, '');

                                // Handle balanced parentheses at the end
                                if (url.endsWith(')')) {
                                    const openCount = (url.match(/\(/g) || []).length;
                                    const closeCount = (url.match(/\)/g) || []).length;
                                    if (closeCount > openCount) {
                                        url = url.substring(0, url.length - (closeCount - openCount));
                                    }
                                }

                                const start = pos + 1 + offset + match.index;
                                const end = start + url.length;
                                decorations.push(
                                    Decoration.inline(start, end, {
                                        class: 'bibliography-url-link',
                                        'data-url': url,
                                        style: 'color:#2563eb;text-decoration:underline;font-style:italic;cursor:pointer;'
                                    })
                                );
                            }
                        }
                    });
                }
            });
            return DecorationSet.create(doc, decorations);
        };

        return [
            new Plugin({
                key: new PluginKey('bibliographyUrlDecorator'),
                state: {
                    init(_, { doc }) {
                        return getDecorations(doc);
                    },
                    apply(tr, old) {
                        if (!tr.docChanged) return old.map(tr.mapping, tr.doc);
                        return getDecorations(tr.doc);
                    }
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                    handleClick(view, pos, event) {
                        const target = event.target as HTMLElement;
                        if (target && target.classList.contains('bibliography-url-link')) {
                            const url = target.getAttribute('data-url');
                            if (url) {
                                window.open(url, '_blank', 'noopener,noreferrer');
                                return true; // Handled
                            }
                        }
                        return false;
                    }
                }
            })
        ];
    }
});
