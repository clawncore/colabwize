import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { CitationRegistryService } from "../services/CitationRegistryService";

export const CitationLifecycleExtension = Extension.create({
    name: "citationLifecycle",

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("citationLifecycle"),
                appendTransaction(transactions, oldState, newState) {
                    // Only append a transaction if the document actually changed
                    const docChanged = transactions.some((tr) => tr.docChanged);
                    if (!docChanged) return;

                    // Prevent infinite loops if our own cleanup transaction triggered this
                    if (transactions.some((tr) => tr.getMeta("canonical-citation-sync"))) {
                        return;
                    }

                    const citationIds = new Set<string>();
                    const bibliographyIds = new Set<string>();

                    // 1. Collect all current IDs
                    newState.doc.descendants((node) => {
                        if (node.type.name === "citation" && node.attrs.citationId) {
                            citationIds.add(node.attrs.citationId);
                        }
                        if (node.type.name === "bibliographyEntry" && node.attrs.citationId) {
                            bibliographyIds.add(node.attrs.citationId);
                        }
                    });

                    const deletePositions: { from: number; to: number }[] = [];
                    const idsToRemoveFromRegistry = new Set<string>();

                    // 2. Identify violations of the linking rules (DISABLED AGGRESSIVE AUTO-DELETE)
                    // The Citation Audit Tool is responsible for warning users about uncited references
                    // or missing citations. Auto-deleting them immediately breaks user expectations when
                    // pasting reference lists or typing out bibliographies prior to citing them.

                    /*
                    newState.doc.descendants((node, pos) => {
                        const id = node.attrs.citationId;
                        if (!id) return;

                        // Rule 1: Delete Bibliography if no in-text Citations exist
                        if (node.type.name === "bibliographyEntry" && !citationIds.has(id)) {
                            // IGNORE PROVISIONAL NODES added by fast-sync normalization
                            if (id && (id.startsWith("temp-") || id.startsWith("temp_"))) return;
                            deletePositions.push({ from: pos, to: pos + node.nodeSize });
                            idsToRemoveFromRegistry.add(id);
                        }

                        // Rule 2: Delete Citations if their Bibliography entry was deleted
                        if (node.type.name === "citation" && !bibliographyIds.has(id)) {
                            if (id.startsWith("temp-")) return;
                            deletePositions.push({ from: pos, to: pos + node.nodeSize });
                        }
                    });

                    // 3. Clear orphaned IDs from memory registry state safely
                    if (idsToRemoveFromRegistry.size > 0) {
                        idsToRemoveFromRegistry.forEach(id => {
                            CitationRegistryService.removeCitation(id);
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
