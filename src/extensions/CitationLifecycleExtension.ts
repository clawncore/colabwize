import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const CitationLifecycleExtension = Extension.create({
    name: "citationLifecycle",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("citationLifecycle"),
                appendTransaction(transactions, _, newState) {
                    // Only append a transaction if the document actually changed
                    const docChanged = transactions.some((tr) => tr.docChanged);
                    if (!docChanged) return;

                    // Prevent infinite loops if our own cleanup transaction triggered this
                    if (transactions.some((tr) => tr.getMeta("canonical-citation-sync"))) {
                        return;
                    }

                    const citationIds = new Set<string>();

                    // 1. Collect all current IDs
                    newState.doc.descendants((node) => {
                        if (node.type.name === "citation" && node.attrs.citationId) {
                            citationIds.add(node.attrs.citationId);
                        }
                    });

                    const deletePositions: { from: number; to: number }[] = [];

                    // 2. Identify violations of the linking rules
                    newState.doc.descendants((node, pos) => {
                        const id = node.attrs.citationId;
                        if (!id) return;

                        // Rule 1: Delete Bibliography if no in-text Citations exist
                        // DISABLING AUTODELETE: This is too aggressive during normalization and causes data loss.
                        // We will rely on the Compliance Audit to flag orphaned bibliography entries instead.
                        /*
                        if (node.type.name === "bibliographyEntry" && !citationIds.has(id)) {
                            // IGNORE PROVISIONAL NODES added by fast-sync normalization
                            if (id && (id.startsWith("temp-") || id.startsWith("temp_"))) return;
                            
                            deletePositions.push({ from: pos, to: pos + node.nodeSize });
                            idsToRemoveFromRegistry.add(id);
                        }
                        */

                        // Rule 2: Delete Citations if their Bibliography entry was deleted
                        // DISABLING AUTODELETE: Same logic. If the user deletes the references section, 
                        // we shouldn't wipe out their entire document's in-text citations.
                        /*
                        if (node.type.name === "citation" && !bibliographyIds.has(id)) {
                            if (id.startsWith("temp-")) return;
                            deletePositions.push({ from: pos, to: pos + node.nodeSize });
                            idsToRemoveFromRegistry.add(id);
                        }
                        */
                    });

                    // 3. Clear orphaned IDs from memory registry state safely
                    // We DO keep this memory cleanup so the cache doesn't grow infinitely with deleted citations
                    /* Temporarily disabled registry aggressive clear, handled via Audit now
                    if (idsToRemoveFromRegistry.size > 0) {
                        import("../services/CitationRegistryService").then(({ CitationRegistryService }) => {
                            idsToRemoveFromRegistry.forEach(id => {
                                CitationRegistryService.removeCitation(id);
                            });
                        });
                    }
                    */

                    // 4. Append deterministic deletion transaction
                    if (deletePositions.length > 0) {
                        // Sort descending so deleting higher indexes doesn't shift lower ones
                        deletePositions.sort((a, b) => b.from - a.from);

                        const tr = newState.tr;
                        deletePositions.forEach(({ from, to }) => {
                            tr.delete(from, to);
                        });

                        // Mark the transaction to prevent infinite loops
                        tr.setMeta("canonical-citation-sync", true);
                        // Link to the user's action so it undoes together
                        tr.setMeta("addToHistory", false);

                        return tr;
                    }

                    return null;
                },
            }),

        ];
    },
});
