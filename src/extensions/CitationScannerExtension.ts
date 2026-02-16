import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const citationScannerKey = new PluginKey("citationScanner");

export const CitationScannerExtension = Extension.create({
    name: "citationScanner",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: citationScannerKey,
                state: {
                    init() {
                        return DecorationSet.empty;
                    },
                    apply(tr, oldState) {
                        // Only scan if doc changed
                        if (!tr.docChanged) return oldState.map(tr.mapping, tr.doc);

                        const doc = tr.doc;
                        const decorations: Decoration[] = [];

                        // 1. Identify Reference Section
                        let referenceText = "";
                        let inReferences = false;

                        doc.descendants((node, pos) => {
                            if (node.type.name === "heading") {
                                // Check if it's "References" or "Bibliography"
                                const text = node.textContent.toLowerCase();
                                if (text.includes("reference") || text.includes("bibliography") || text.includes("works cited")) {
                                    inReferences = true;
                                    return false; // Don't descend
                                } else {
                                    inReferences = false;
                                }
                            }

                            if (inReferences && node.isText) {
                                referenceText += node.text + "\n";
                            }
                        });

                        const referenceSet = new Set<string>();
                        // Simple parser: Authors regex
                        const refRegex = /^([A-Z][a-zA-Z\s]+)(?:,|\.)/gm;
                        let match;
                        while ((match = refRegex.exec(referenceText)) !== null) {
                            if (match[1]) referenceSet.add(match[1].trim().toLowerCase());
                        }

                        // 2. Scan for Inline Citations
                        // Pattern: (Name, Year) or [1] or Name (Year)
                        // Simplified Regex for MVP: (Name, 20XX)
                        // This regex matches (Smith, 2020) or (Smith et al., 2020)
                        const inlineRegex = /\(([A-Z][a-zA-Z\s]+)(?: et al\.?)?,?\s*(19|20)\d{2}\)/g;

                        doc.descendants((node, pos) => {
                            if (!node.isText) return;
                            if (inReferences) return; // Don't scan references section itself

                            const text = node.text!;
                            const matches = Array.from(text.matchAll(inlineRegex));

                            matches.forEach(m => {
                                const fullMatch = m[0];
                                const author = m[1].trim().toLowerCase();
                                const start = pos + m.index!;
                                const end = start + fullMatch.length;

                                // Check if author exists in references
                                // We check if our referenceSet has any entry that *contains* the author name
                                const isLinked = Array.from(referenceSet).some(refAuthor => refAuthor.includes(author) || author.includes(refAuthor));

                                const className = isLinked
                                    ? "citation-scan-linked"
                                    : "citation-scan-orphan";

                                decorations.push(
                                    Decoration.inline(start, end, {
                                        class: className,
                                        "data-citation-status": isLinked ? "linked" : "orphan",
                                        title: isLinked ? "Linked to Reference" : "Orphan: No matching reference found"
                                    })
                                );
                            });
                        });

                        return DecorationSet.create(doc, decorations);
                    }
                },
                props: {
                    decorations(state) {
                        return this.getState(state);
                    }
                }
            })
        ];
    }
});
