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
                    handlePaste: (view, event) => {
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
                        const projectId = this.options.projectId || 'current-project';

                        // Because Prosemirror handlePaste must be synchronous returning true/false
                        // We intercept, return true to stop default behavior, then dispatch async transaction
                        event.preventDefault();

                        const processPasteAsync = async () => {
                            const { CitationRegistryService } = await import('../services/CitationRegistryService');
                            const schema = view.state.schema;
                            const nodes = [];
                            let lastIndex = 0;

                            for (const match of matches) {
                                const matchStart = match.index || 0;
                                const matchText = match[0];

                                if (matchStart > lastIndex) {
                                    const textBefore = text.slice(lastIndex, matchStart);
                                    nodes.push(schema.text(textBefore));
                                }

                                try {
                                    // Use Registry to get a stable ID for this text.
                                    const entry = await CitationRegistryService.registerCitation(projectId, matchText);

                                    const citationNode = schema.nodes.citation.create({
                                        citationId: entry.ref_key,
                                        status: 'unresolved', // Force new paste to be audited
                                        text: matchText
                                    });
                                    nodes.push(citationNode);
                                } catch (error) {
                                    console.error("Paste citation error:", error);
                                    // Fallback to text if registry breaks
                                    nodes.push(schema.text(matchText));
                                }

                                lastIndex = matchStart + matchText.length;
                            }

                            if (lastIndex < text!.length) {
                                nodes.push(schema.text(text!.slice(lastIndex)));
                            }

                            const fragment = Fragment.fromArray(nodes);
                            const tr = view.state.tr.replaceSelection(new Slice(fragment, 0, 0));
                            view.dispatch(tr);
                        };

                        processPasteAsync();
                        return true; // We handled the paste
                    }
                }
            })
        ];
    }
});
