import { Editor } from "@tiptap/react";
import { extractPatterns } from "../../../services/citationAudit/patterns";
import { CitationNormalizer } from "../../../services/citationAudit/CitationNormalizer";
import { CitationService } from "../../../services/citationService";

/**
 * Scans the document for plain text citations and replaces them with Citation Nodes.
 * This enables the "Blue & Clickable" UI and allows the audit engine to target them.
 */
export async function detectAndNormalizeCitations(editor: Editor, availableCitations: any[] = []) {
    if (!editor || !editor.isEditable) return;

    // Use a custom command to ensure atomicity.
    // The command callback receives the *current* state and dispatch function.
    // This prevents "mismatched transaction" errors caused by state drift between analysis and dispatch.
    editor.commands.command(({ tr, state, dispatch }) => {
        const replacements: { from: number; to: number; id: string }[] = [];

        // Traverse the document specifically for paragraphs and headings (block containers for text)
        state.doc.descendants((node, pos) => {
            if (!node.isBlock || node.type.name === 'doc') return true;

            // Get full text of the block (joins all text nodes, including formatted ones)
            const blockText = node.textContent;
            if (!blockText) return false;

            // Find all citation patterns in this block's text
            const matches = extractPatterns(blockText, 0, "inline");

            matches.forEach(match => {
                // We need to map the relative offsets (match.start, match.end) 
                // from the textContent string back to absolute ProseMirror positions.
                // Note: pos + 1 is the start of the block's content.
                const absoluteFrom = pos + 1 + match.start;
                const absoluteTo = pos + 1 + match.end;

                const matchedId = `auto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                // Fuzzy resolution logic
                let resolvedId = matchedId;
                if (availableCitations.length > 0) {
                    const found = availableCitations.find(c => {
                        return match.text.includes(c.author_last_name || "")
                            || (c.id && match.text.includes(c.id));
                    });
                    if (found) resolvedId = found.id;
                }

                replacements.push({
                    from: absoluteFrom,
                    to: absoluteTo,
                    id: resolvedId
                });
            });

            return false; // Don't descend into block content children individually for this pass
        });

        if (replacements.length === 0) return true;

        // Filter overlaps: prioritizing longest matches
        replacements.sort((a, b) => (b.to - b.from) - (a.to - a.from));

        const finalReplacements: typeof replacements = [];
        const claimedRanges: { from: number; to: number }[] = [];

        for (const r of replacements) {
            const isOverlapping = claimedRanges.some(claimed =>
                (r.from >= claimed.from && r.from < claimed.to) ||
                (r.to > claimed.from && r.to <= claimed.to) ||
                (r.from <= claimed.from && r.to >= claimed.to)
            );

            if (!isOverlapping) {
                finalReplacements.push(r);
                claimedRanges.push({ from: r.from, to: r.to });
            }
        }

        // Apply Marks
        finalReplacements.sort((a, b) => b.from - a.from);

        let modified = false;
        finalReplacements.forEach(({ from, to, id }) => {
            if (to > tr.doc.content.size) return;

            tr.addMark(from, to, state.schema.marks.citation.create({
                citationId: id
            }));
            modified = true;
        });

        if (modified) {
            console.log(`✅ Normalized ${replacements.length} citations.`);
            if (dispatch) dispatch(tr);
            return true;
        }

        return false;
    });
}

/**
 * Scans the "References" section and adds missing citations to the library.
 * This runs periodically to keep the library in sync with the text.
 */
export async function scanAndIngestReferences(
    editor: Editor,
    projectId: string,
    existingCitations: any[]
): Promise<any[]> {
    if (!editor) return [];

    const newCitations: any[] = [];
    const existingIds = new Set(existingCitations.map(c => c.id));
    // Also track rough titles to avoid duplicates with different IDs
    const existingTitles = new Set(existingCitations.map(c => c.title?.toLowerCase().slice(0, 30)));

    let inRefSection = false;

    // We scan the doc node structure to find the "References" header
    editor.state.doc.descendants((node) => {
        if (node.type.name === 'heading') {
            const text = node.textContent.toLowerCase().trim();
            if (text === 'references' || text === 'works cited' || text === 'bibliography') {
                inRefSection = true;
                return;
            } else {
                if (inRefSection) inRefSection = false;
            }
        }

        if (inRefSection && (node.type.name === 'paragraph' || node.type.name === 'listItem')) {
            const text = node.textContent.trim();
            if (text.length > 20) {
                // Parse the reference line
                const record = CitationNormalizer.parseReference(text);

                if (record) {
                    // Check if exists in library
                    // 1. Check if ID exists (weak check, IDs might differ)
                    // 2. Check title similarity or author+year uniqueness
                    const roughTitle = record.title?.toLowerCase().slice(0, 30);

                    if (!existingIds.has(record.id) && (!roughTitle || !existingTitles.has(roughTitle))) {
                        // FOUND NEW CITATION!
                        console.log("Found new reference to ingest:", record);

                        // Prepare payload for CitationService
                        const newCitation = {
                            title: record.title || "Unknown Title",
                            authors: record.authors,
                            year: record.year,
                            type: "journal-article", // Default assumption
                            source: "manual-ingest",
                            tags: ["auto-imported"]
                        };

                        newCitations.push(newCitation);

                        // Add to Sets to prevent duplicates within this loop
                        existingIds.add(record.id);
                        if (roughTitle) existingTitles.add(roughTitle);

                        // Async Add to DB (Fire and Forget or await?)
                        // We await to prevent race conditions if called frequently
                        CitationService.createCitation(projectId, newCitation)
                            .then(res => console.log("Auto-ingested citation:", res))
                            .catch(err => console.error("Failed to ingest citation:", err));
                    }
                }
            }
        }
    });

    return newCitations;
}
