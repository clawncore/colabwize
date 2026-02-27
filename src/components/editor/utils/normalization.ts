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

    // --- NEW: Ingest from Bibliography Section FIRST ---
    // This handles references typed into the document but not yet in the official library
    await scanAndIngestReferences(editor, projectId, availableCitations, true); // true = syncOnly

    let ieeeCount = 0;
    let apaCount = 0;

    editor.commands.command(({ tr, state, dispatch }) => {
        const replacements: { from: number; to: number; refKey: string; text: string; url?: string | null; sourceTitle?: string | null }[] = [];

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
                const entry = CitationRegistryService.registerCitation(projectId, match.text);

                replacements.push({
                    from: absoluteFrom,
                    to: absoluteTo,
                    refKey: entry.ref_key,
                    text: match.text,
                    url: entry.url,
                    sourceTitle: entry.sourceTitle || entry.raw_reference_text || (entry.csl_data?.title)
                });
            });

            return false;
        });

        if (replacements.length === 0) return true;

        replacements.sort((a, b) => b.from - a.from); // Apply from bottom up

        let modified = false;
        replacements.forEach(({ from, to, refKey, text, url, sourceTitle }) => {
            // Replace text with Citation Node Atom
            tr.replaceWith(from, to, state.schema.nodes.citation.create({
                citationId: refKey,
                text: text,
                url: url,
                sourceTitle: sourceTitle
            }));
            modified = true;
        });

        if (modified) {
            tr.setMeta('normalization', true); // Prevent infinite loop
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
    existingCitations: any[],
    syncOnly: boolean = false
): Promise<any[]> {
    if (!editor) return [];

    const newCitations: any[] = [];
    const existingIds = new Set(existingCitations.map(c => c.id));
    // Also track rough titles to avoid duplicates with different IDs
    const existingTitles = new Set(existingCitations.map(c => c.title?.toLowerCase().slice(0, 30)));

    const { CitationRegistryService } = await import("../../../services/CitationRegistryService");

    let inRefSection = false;

    // We scan the doc node structure to find the "References" header
    editor.state.doc.descendants((node) => {
        if (node.type.name === 'heading') {
            const text = node.textContent.toLowerCase().trim().replace(/[:.]$/, '');
            if (text === 'references' || text === 'works cited' || text === 'bibliography' || text === 'reference list') {
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
                    // Always ensure it's in the REGISTRY for this session
                    // This is CRITICAL for matching nodes in the document
                    CitationRegistryService.registerCitation(projectId, text);

                    if (!syncOnly) {
                        // Check if exists in library
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

    editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'citation') {
            const { citationId, text } = node.attrs;

            if (citationId && text) {
                const entry = CitationRegistryService.getEntry(projectId, citationId);

                if (!entry) {
                    // RECOVERY: Register the existing node text as the source of truth
                    // Use the existing ID as the preferred key to keep IDs stable!
                    console.log(`[RegistryRecovery] Re-registering existing node ID: ${citationId} for "${text.substring(0, 20)}..."`);
                    CitationRegistryService.registerCitation(projectId, text, {
                        preferredKey: citationId,
                        url: node.attrs.url,
                        sourceTitle: node.attrs.sourceTitle
                    });

                    // Proactively clear 'invalid' status since we just restored it to registry
                    if (node.attrs.status === 'invalid' || node.attrs.status === 'unresolved') {
                        editor.commands.command(({ tr }) => {
                            tr.setMeta('normalization', true);
                            tr.setNodeMarkup(pos, undefined, {
                                ...node.attrs,
                                status: 'resolved'
                            });
                            return true;
                        });
                    }
                } else {
                    // Logic to clear 'red' (invalid) status if now in registry
                    if (node.attrs.status === 'invalid' || node.attrs.status === 'unresolved') {
                        editor.commands.command(({ tr }) => {
                            tr.setMeta('normalization', true);
                            tr.setNodeMarkup(pos, undefined, {
                                ...node.attrs,
                                status: 'resolved',
                                url: node.attrs.url || entry.url,
                                sourceTitle: node.attrs.sourceTitle || entry.sourceTitle || entry.raw_reference_text
                            });
                            return true;
                        });
                    }
                    // Update metadata if missing on node but present in registry
                    else if (!node.attrs.url && entry.url) {
                        editor.commands.command(({ tr }) => {
                            tr.setMeta('normalization', true);
                            tr.setNodeMarkup(pos, undefined, {
                                ...node.attrs,
                                url: entry.url,
                                sourceTitle: node.attrs.sourceTitle || entry.sourceTitle || entry.raw_reference_text
                            });
                            return true;
                        });
                    }
                }
            } else if (!citationId && text) {
                // HEALING: Node exists but ID is lost. Re-resolve it.
                console.log(`[RegistryHealing] Healing citation node with missing ID: "${text}"`);
                const healedEntry = CitationRegistryService.registerCitation(projectId, text);

                editor.commands.command(({ tr }) => {
                    tr.setMeta('normalization', true);
                    tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        citationId: healedEntry.ref_key,
                        url: healedEntry.url,
                        sourceTitle: healedEntry.sourceTitle || healedEntry.raw_reference_text,
                        status: 'resolved'
                    });
                    return true;
                });
                recoveredCount++;
            }
        }
    });

    if (recoveredCount > 0) {
        console.log(`[RegistryRecovery] Recovered ${recoveredCount} citations from document nodes.`);
    }
}
