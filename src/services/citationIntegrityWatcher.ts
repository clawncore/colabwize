import { Editor } from "@tiptap/react";
import { CitationRegistryService } from "./CitationRegistryService";

export type CitationStatus = 'verified' | 'warning' | 'invalid' | 'unresolved';

export class CitationIntegrityWatcher {
    private static statusMap: Map<string, CitationStatus> = new Map();
    private static pendingChecks: Set<string> = new Set();
    private static debounceTimer: NodeJS.Timeout | null = null;

    /**
     * Set explicit status for keys (e.g. from initial load or backend response)
     */
    static setStatus(statusUpdates: Record<string, CitationStatus>) {
        Object.entries(statusUpdates).forEach(([key, status]) => {
            this.statusMap.set(key, status);
        });
    }

    /**
     * Get current status for a key
     */
    static getStatus(key: string): CitationStatus {
        return this.statusMap.get(key) || 'unresolved';
    }

    /**
     * Scan editor for citations and trigger checks for new/unknown ones.
     * Also updates visual attributes of citation nodes.
     */
    static async processUpdates(editor: Editor, projectId: string) {
        if (!editor || !editor.state) return;

        const currentIds = new Set<string>();
        const nodesToUpdate: { pos: number, id: string, currentStatus: string }[] = [];

        // 1. Scan doc
        editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'citation') {
                const id = node.attrs.citationId;
                if (id) {
                    currentIds.add(id);
                    const status = this.getStatus(id);
                    // Check if node needs visual update
                    if (node.attrs.status !== status) {
                        nodesToUpdate.push({ pos, id, currentStatus: status });
                    }
                }
            }
        });

        // 2. Identify keys needing check
        const toCheck: string[] = [];
        currentIds.forEach(id => {
            if (!this.statusMap.has(id) || this.statusMap.get(id) === 'unresolved') {
                if (!this.pendingChecks.has(id)) {
                    toCheck.push(id);
                    this.pendingChecks.add(id);
                }
            }
        });

        // 3. Trigger Audit (Debounced/Batched)
        if (toCheck.length > 0) {
            this.scheduleAudit(toCheck, projectId, editor);
        }

        // 4. Update Visuals immediately for known statuses
        if (nodesToUpdate.length > 0) {
            const tr = editor.state.tr;
            nodesToUpdate.forEach(({ pos, id, currentStatus }) => {
                // Ensure we are still looking at a citation node (though pos should be stable in this sync tick)
                // Using setNodeMarkup to update attributes
                tr.setNodeMarkup(pos, null, {
                    ...editor.state.doc.nodeAt(pos)?.attrs,
                    status: currentStatus
                });
            });
            if (tr.docChanged) {
                editor.view.dispatch(tr);
            }
        }
    }

    private static scheduleAudit(keys: string[], projectId: string, editor: Editor) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);

        this.debounceTimer = setTimeout(async () => {
            await this.performAudit(Array.from(this.pendingChecks), projectId, editor);
            this.pendingChecks.clear();
        }, 1000); // 1s debounce
    }

    private static async performAudit(keys: string[], projectId: string, editor: Editor) {
        console.log("🔍 Auditing citations:", keys);

        // Simulate Backend Call or use CitationAuditAdapter
        // For now, we simulate basic validation logic based on Registry data

        const updates: Record<string, CitationStatus> = {};

        keys.forEach(key => {
            const entry = CitationRegistryService.getEntry(projectId, key);
            if (!entry) {
                updates[key] = 'invalid'; // Not in registry?
            } else {
                // Rudimentary check: has title and (author or year)?
                // Or check if DOI/URL exists for "verified"
                if (entry.doi || entry.url) {
                    updates[key] = 'verified';
                } else if (entry.csl_data?.title && entry.csl_data?.author) {
                    updates[key] = 'verified'; // Good enough structure
                } else {
                    updates[key] = 'warning'; // Missing critical metadata
                }
            }
        });

        this.setStatus(updates);

        // Re-run processUpdates to apply new statuses visually
        // (We can pass editor from closure)
        if (editor && !editor.isDestroyed) {
            this.processUpdates(editor, projectId);
        }
    }
}
