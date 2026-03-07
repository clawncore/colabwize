import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const citationScannerKey = new PluginKey("citationScanner");

export interface CitationScannerState {
    decorations: DecorationSet;
    stats: {
        ieeeCount: number;
        apaCount: number;
        majorityStyle: "IEEE" | "APA" | null;
    };
}

export const CitationScannerExtension = Extension.create({
    name: "citationScanner",

    addProseMirrorPlugins() {
        return [
            new Plugin<CitationScannerState>({
                key: citationScannerKey,
                state: {
                    init() {
                        return {
                            decorations: DecorationSet.empty,
                            stats: { ieeeCount: 0, apaCount: 0, majorityStyle: null }
                        };
                    },
                    apply(tr, oldState) {
                        if (!tr.docChanged && oldState.decorations !== DecorationSet.empty) {
                            return {
                                ...oldState,
                                decorations: oldState.decorations.map(tr.mapping, tr.doc)
                            };
                        }

                        const doc = tr.doc;
                        const decorations: Decoration[] = [];
                        let ieeeCount = 0;
                        let apaCount = 0;

                        // ── 1. Pass 1: Gather Bibliography Metadata & Detect Boundaries ─────
                        let inReferences = false;
                        const referenceSet = new Set<string>();
                        const ieeeRefNumbers = new Set<string>();
                        
                        let referenceSectionStart = Infinity;

                        // Robust Regex for section headers
                        const bibHeaderRegex = /references|bibliography|works cited|reference list/i;

                        doc.descendants((node, pos) => {
                            const nodeType = node.type.name;
                            
                            // Check for reference section boundary
                            if (nodeType === "heading" || nodeType === "paragraph") {
                                const text = node.textContent.trim();
                                if (bibHeaderRegex.test(text)) {
                                    inReferences = true;
                                    if (pos < referenceSectionStart) referenceSectionStart = pos;
                                    return false; // Skip checking children of the header
                                } else if (inReferences && nodeType === "heading") {
                                    // If we hit a new heading that DOES NOT match our regex, we are officially out
                                    inReferences = false;
                                }
                            }

                            if (inReferences) {
                                if (nodeType === "paragraph" || nodeType === "listItem") {
                                    const fullLineText = node.textContent.trim();
                                    // Match [1] or 1. at beginning of line
                                    const ieeeNumMatch = fullLineText.match(/^\[?(\d+)\]?[\.\s]/);
                                    if (ieeeNumMatch) {
                                        ieeeRefNumbers.add(ieeeNumMatch[1]);
                                    }

                                    // Author capture for APA
                                    const authorMatch = fullLineText.match(/^([A-Z][a-zA-Z\s\-']+)(?:,|\.)/);
                                    if (authorMatch) {
                                        referenceSet.add(authorMatch[1].trim().toLowerCase());
                                    }
                                }

                                // URL/DOI Decorations in bibliography
                                if (node.isText) {
                                    const text = node.text!;
                                    const urlRegex = /(https?:\/\/[^\s<\]"]+)/g;
                                    let match;
                                    while ((match = urlRegex.exec(text)) !== null) {
                                        decorations.push(Decoration.inline(pos + match.index, pos + match.index + match[0].length, {
                                            class: "citation-scan-url",
                                            title: match[0]
                                        }));
                                    }
                                }
                            }
                        });

                        // ── 2. Pass 2: Decorate In-Text Citations ───────────────────────────
                        const apaRegex = /\(([A-Z][a-zA-Z\s\-']+)(?: et al\.?)?,?\s*(19|20)\d{2}[a-z]?\)/g;
                        const ieeeRegex = /\[(\d+(?:\s*[,\-]\s*\d+)*)\]/g;
                        const narrativeRegex = /\b([A-Z][a-zA-Z\-']+(?:\s+(?:and|&)\s+[A-Z][a-zA-Z\-']+)*(?:\s+et\s+al\.?)?)\s*\((19|20)\d{2}[a-z]?\)/g;

                        doc.descendants((node, pos) => {
                            // SKIP scanning bibliography section for citations decoration
                            if (pos >= referenceSectionStart) return false;
                            if (!node.isText) return;

                            const text = node.text!;
                            const parentOffset = doc.resolve(pos).parentOffset;

                            // 1. APA Parenthetical
                            for (const m of text.matchAll(apaRegex)) {
                                apaCount++;
                                const author = m[1].trim().toLowerCase();
                                const isLinked = Array.from(referenceSet).some(r => r.includes(author) || author.includes(r));
                                decorations.push(Decoration.inline(pos + m.index!, pos + m.index! + m[0].length, {
                                    class: isLinked ? "citation-scan-linked" : "citation-scan-orphan",
                                    "data-citation-status": isLinked ? "linked" : "orphan",
                                    title: isLinked ? "Linked to Reference" : "Orphan citation"
                                }));
                            }

                            // 2. IEEE Bracketed
                            for (const m of text.matchAll(ieeeRegex)) {
                                // CRITICAL: Skip decoration if the match is at the very beginning of the paragraph.
                                // In a bibliography, the marker [1] starts at offset 0-5.
                                // In-text citations almost never start a paragraph.
                                if (parentOffset + m.index! < 5) continue;

                                ieeeCount++;
                                const nums = m[1].split(/[\s,\-]+/).map(n => n.trim()).filter(Boolean);
                                const isLinked = ieeeRefNumbers.size === 0 || nums.some(n => ieeeRefNumbers.has(n));
                                decorations.push(Decoration.inline(pos + m.index!, pos + m.index! + m[0].length, {
                                    class: isLinked ? "citation-scan-linked" : "citation-scan-orphan",
                                    "data-citation-status": isLinked ? "linked" : "orphan",
                                    "data-citation-style": "ieee",
                                    title: isLinked ? `IEEE [${m[1]}] — Linked` : `IEEE [${m[1]}] — Orphan`
                                }));
                            }

                            // 3. Narrative
                            for (const m of text.matchAll(narrativeRegex)) {
                                if (m[0].startsWith("(")) continue;
                                apaCount++;
                                const author = m[1].trim().toLowerCase();
                                const isLinked = Array.from(referenceSet).some(r => r.includes(author) || author.includes(r));
                                decorations.push(Decoration.inline(pos + m.index!, pos + m.index! + m[0].length, {
                                    class: isLinked ? "citation-scan-linked" : "citation-scan-orphan",
                                    "data-citation-status": isLinked ? "linked" : "orphan",
                                    title: isLinked ? "Linked to Reference" : "Orphan citation"
                                }));
                            }
                        });

                        const majority = ieeeCount > apaCount ? "IEEE" : (apaCount > ieeeCount ? "APA" : null);

                        return {
                            decorations: DecorationSet.create(doc, decorations),
                            stats: { ieeeCount, apaCount, majorityStyle: majority }
                        };
                    }
                },
                props: {
                    decorations(state) {
                        return this.getState(state)?.decorations;
                    }
                }
            })
        ];
    }
});
