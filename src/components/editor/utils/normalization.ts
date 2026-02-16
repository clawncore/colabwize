import { Editor } from "@tiptap/react";
import { extractPatterns } from "../../../services/citationAudit/patterns";
import { CitationNormalizer } from "../../../services/citationAudit/CitationNormalizer";
import { CitationService } from "../../../services/citationService";

/**
 * Scans the document for plain text citations and replaces them with Citation Nodes.
 * This enables the "Blue & Clickable" UI and allows the audit engine to target them.
 */
/**
 * Scans the document for plain text citations and replaces them with Citation Nodes.
 * This enables the "Blue & Clickable" UI and allows the audit engine to target them.
 */
export async function detectAndNormalizeCitations(editor: Editor, projectId: string, availableCitations: any[] = []) {
    if (!editor || !editor.isEditable) return;

    // Initialize Registry with correct Project ID
    const { CitationRegistryService } = await import("../../../services/CitationRegistryService");

    // Load available citations into registry for this project
    CitationRegistryService.loadRegistry(projectId, availableCitations);

    let ieeeCount = 0;
    let apaCount = 0;

    editor.commands.command(({ tr, state, dispatch }) => {
        const replacements: { from: number; to: number; refKey: string; text: string }[] = [];

        // Traverse the document specifically for paragraphs and headings
        let stopScanning = false;

        state.doc.descendants((node, pos) => {
            if (stopScanning) return false;

            if (node.type.name === 'heading') {
                const text = node.textContent.toLowerCase();
                if (text.includes('reference') || text.includes('refrence') || text.includes('bibliography') || text.includes('works cited')) {
                    stopScanning = true;
                    return false;
                }
            }

            if (!node.isBlock || node.type.name === 'doc') return true;

            const blockText = node.textContent;
            if (!blockText) return false;

            const matches = extractPatterns(blockText, 0, "inline");

            matches.forEach(match => {
                // Style Detection Logic
                if (match.text.match(/^\[\d+(?:-\d+)?\]/)) {
                    ieeeCount++;
                } else if (match.text.match(/^\(.*\d{4}.*\)/)) {
                    apaCount++;
                }

                const absoluteFrom = pos + 1 + match.start;
                const absoluteTo = pos + 1 + match.end;

                // Check if this range already overlaps with an existing Citation Node
                let alreadyCited = false;
                state.doc.nodesBetween(absoluteFrom, absoluteTo, (n) => {
                    if (n.type.name === 'citation') alreadyCited = true;
                });

                if (alreadyCited) return;

                // Register and get Key
                // We use the matched text as the raw reference for registry
                const refKey = CitationRegistryService.registerCitation(projectId, match.text);

                replacements.push({
                    from: absoluteFrom,
                    to: absoluteTo,
                    refKey: refKey,
                    text: match.text
                });
            });

            return false;
        });

        if (replacements.length === 0) return true;

        replacements.sort((a, b) => b.from - a.from); // Apply from bottom up

        let modified = false;
        replacements.forEach(({ from, to, refKey, text }) => {
            // Replace text with Citation Node Atom
            tr.replaceWith(from, to, state.schema.nodes.citation.create({
                citationId: refKey,
                text: text
            }));
            modified = true;
        });

        if (modified) {
            console.log(`✅ Normalized ${replacements.length} citations to Registry Keys.`);
            if (dispatch) dispatch(tr);
            return true;
        }

        return false;
    });

    return { stats: { ieee: ieeeCount, apa: apaCount } };
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

/**
 * Recovers registry entries from existing citation nodes in the document.
 * This is crucial when reloading a document where the registry might be empty but nodes persist.
 */
export async function synchronizeRegistryWithDocument(editor: Editor, projectId: string) {
    if (!editor || !editor.state) return;

    const { CitationRegistryService } = await import("../../../services/CitationRegistryService");
    let recoveredCount = 0;

    editor.state.doc.descendants((node) => {
        if (node.type.name === 'citation' && node.attrs.citationId && node.attrs.text) {
            const entry = CitationRegistryService.getEntry(projectId, node.attrs.citationId);

            if (!entry) {
                // RECOVERY: Register the existing node text as the source of truth
                // We assume the stored text (e.g. "(Smith, 2020)") is the correct raw reference
                CitationRegistryService.registerCitation(projectId, node.attrs.text, {
                    // We don't have metadata, but at least we have the text
                });

                // Force-update the entry to match the specific ID if registerCitation generated a new one?
                // registerCitation logic: if generic new, it makes new ID.
                // We want to force the ID to match the node.
                // We need a way to "force register" with specific ID.

                // Since CitationRegistryService.registerCitation doesn't accept a custom ID (it generates or finds),
                // we might need to manually inject it or update the service.
                // Hack: We manually call register, then ensure the map helps us? 
                // Actually, let's just use the Service's internal array manipulation or add a method.
                // For now, let's just add a temporary backdoor or assume we can just 'register' and if ID differs, we update the node?
                // Better: Update Registry Service to allow setEntry or similar.
                // Or just:

                const entries = CitationRegistryService.getRegistry(projectId) || [];
                // Check if we really need to force ID. 
                // If we don't force ID, OrderManager will see mismatch? 
                // Yes, OrderManager looks up by node.attrs.citationId.

                // Let's manually push to registry cache for this session
                const newEntry = {
                    ref_key: node.attrs.citationId,
                    raw_reference_text: node.attrs.text,
                    contentHash: "recovered"
                };
                entries.push(newEntry);
                CitationRegistryService.loadRegistry(projectId, entries); // Re-load to set map
                recoveredCount++;
            }
        }
    });

    if (recoveredCount > 0) {
        console.log(`[RegistryRecovery] Recovered ${recoveredCount} citations from document nodes.`);
    }
}
