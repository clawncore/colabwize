import { Node, Editor, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { CitationRegistryService } from '../services/CitationRegistryService';

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
                class: 'bibliography-entry p-3 my-2 rounded-md hover:bg-blue-50 transition-all border-l-4 border-transparent hover:border-blue-500 text-gray-800 leading-relaxed',
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
                            const urlRegex = /(https?:\/\/[^\s)>\]]+)/g;
                            let match;
                            while ((match = urlRegex.exec(text)) !== null) {
                                // Strip trailing punctuation that may have been captured
                                let url = match[0].replace(/[.,;:!?]+$/, '');
                                const start = pos + 1 + offset + match.index;
                                const end = start + url.length;
                                decorations.push(
                                    Decoration.inline(start, end, {
                                        class: 'bibliography-url-link',
                                        // Global CSS rule now handles styling since Tiptap strips inline styles
                                        'data-url': url
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

function countInTextCitations(editor: Editor, citationId: string): number {
    if (!editor || !citationId) return 0;
    let count = 0;
    try {
        editor.state.doc.descendants((node) => {
            if (node.type.name === 'citation' && node.attrs.citationId === citationId) {
                count++;
            }
        });
    } catch (e) {
        console.warn("Could not count citations", e);
    }
    return count;
}
