import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Slice, Fragment } from 'prosemirror-model';
import { CitationRegistryService } from '../services/CitationRegistryService';

// Regex patterns for citation detection (simplified from patterns.ts for immediate use)
// We look for:
// 1. [1], [1-5], [1, 2] (IEEE)
// 2. (Author, 2023) or (Author & Author, 2023) (APA)
const IEEE_REGEX = /\[\s*\d+(?:[\s,-]+\d+)*\s*\]/g;
const APA_REGEX = /\((?:[^)]+,?\s+)+(?:19|20)\d{2}[a-z]?\)/g;

export const PasteCitationExtension = Extension.create({
    name: 'pasteCitation',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('pasteCitation'),
                props: {
                    handlePaste: (view, event, slice) => {
                        const items = Array.from(event.clipboardData?.items || []);
                        const hasText = items.some(item => item.type === 'text/plain');

                        if (!hasText) return false;

                        let text = event.clipboardData?.getData('text/plain');
                        if (!text) return false;

                        // Check for citation patterns
                        const ieeeMatches = Array.from(text.matchAll(IEEE_REGEX));
                        const apaMatches = Array.from(text.matchAll(APA_REGEX));

                        // Combine and sort matches by index
                        const matches = [...ieeeMatches, ...apaMatches].sort((a, b) => (a.index || 0) - (b.index || 0));

                        if (matches.length === 0) {
                            return false; // Let default handler work
                        }

                        // We have citations! Let's reconstruct the slice.
                        const schema = view.state.schema;
                        const nodes = [];
                        let lastIndex = 0;

                        // Identify Project ID (Assuming it's available in window or context?)
                        // For now, we'll try to get it from the editor storage or props if passed.
                        // Since this is a raw Extension, accessing external state context is tricky.
                        // We will assume a default or look up from a global/dependency injection if needed.
                        // However, `CitationRegistryService` is static.
                        // We need projectId. 
                        // Workaround: We will use a placeholder projectId or try to infer.
                        // In `DocumentEditor`, we might pass it to extension options?
                        // `this.options.projectId`.
                        const projectId = this.options.projectId || 'current-project';

                        matches.forEach(match => {
                            const matchStart = match.index || 0;
                            const matchText = match[0];

                            // Add preceding text
                            if (matchStart > lastIndex) {
                                const textBefore = text.slice(lastIndex, matchStart);
                                // We strictly create text nodes, processing newlines if needed
                                // Simple text node for now
                                nodes.push(schema.text(textBefore));
                            }

                            // Register/Identify Citation
                            // If it's a known citation, we get the ID.
                            // If it's new, we register it with `unresolved` (implied by default or logic)
                            // We use Registry to get a stable ID for this text.
                            const refKey = CitationRegistryService.registerCitation(projectId, matchText);

                            // Create Citation Node
                            const citationNode = schema.nodes.citation.create({
                                id: refKey,
                                text: matchText,
                                status: 'unresolved' // Force new paste to be audited
                            });
                            nodes.push(citationNode);

                            lastIndex = matchStart + matchText.length;
                        });

                        // Add remaining text
                        if (lastIndex < text.length) {
                            nodes.push(schema.text(text.slice(lastIndex)));
                        }

                        // Insert the constructed fragment
                        const fragment = Fragment.fromArray(nodes);
                        const tr = view.state.tr.replaceSelection(new Slice(fragment, 0, 0));
                        view.dispatch(tr);

                        return true; // We handled the paste
                    }
                }
            })
        ];
    }
});
