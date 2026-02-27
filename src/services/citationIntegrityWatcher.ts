import { Editor } from "@tiptap/react";
import { CitationRegistryService } from "./CitationRegistryService";

export type CitationStatus = 'verified' | 'resolved' | 'warning' | 'invalid' | 'unresolved';

export class CitationIntegrityWatcher {
    private static statusMap: Map<string, CitationStatus> = new Map();
    private static pendingChecks: Set<string> = new Set();
    private static debounceTimer: NodeJS.Timeout | null = null;

    /**
     * Set explicit status for keys
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
     * Also updates visual attributes and metadata of citation nodes.
     */
    static async processUpdates(editor: Editor, projectId: string, explicitUpdates?: Record<string, any>) {
        if (!editor || !editor.state) return;

        const currentIds = new Set<string>();
        const nodesToUpdate: { pos: number, id: string, attrs: any }[] = [];

        // 1. Scan doc
        editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'citation') {
                const id = node.attrs.citationId;
                if (id) {
                    currentIds.add(id);

                    const update = explicitUpdates?.[id];
                    const targetStatus = update?.status || this.getStatus(id);
                    const targetUrl = update?.url || node.attrs.url;
                    const targetTitle = update?.sourceTitle || node.attrs.sourceTitle;

                    // Check if node needs visual or metadata update
                    if (node.attrs.status !== targetStatus || node.attrs.url !== targetUrl || node.attrs.sourceTitle !== targetTitle) {
                        nodesToUpdate.push({
                            pos,
                            id,
                            attrs: { ...node.attrs, status: targetStatus, url: targetUrl, sourceTitle: targetTitle }
                        });
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

        // 4. Update Visuals & Metadata immediately
        if (nodesToUpdate.length > 0) {
            const tr = editor.state.tr;
            tr.setMeta('integrity-check', true); // Prevent infinite loops
            nodesToUpdate.forEach(({ pos, attrs }) => {
                tr.setNodeMarkup(pos, null, attrs);
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

        const updates: Record<string, { status: CitationStatus, url?: string, sourceTitle?: string }> = {};

        keys.forEach(key => {
            const entry = CitationRegistryService.getEntry(projectId, key);
            if (!entry) {
                updates[key] = { status: 'invalid' };
            } else {
                let status: CitationStatus = 'resolved'; // Found in bibliography = blue (resolved)
                let url = entry.url;

                // If no URL but has DOI, construct link
                if (!url && entry.doi) {
                    url = entry.doi.startsWith('http') ? entry.doi : `https://doi.org/${entry.doi}`;
                }

                if (url) {
                    status = 'verified'; // Has link = green (verified)
                } else if (!entry.csl_data?.title && !entry.raw_reference_text) {
                    status = 'warning'; // Found but seems empty or weird
                }

                updates[key] = {
                    status,
                    url: url,
                    sourceTitle: entry.sourceTitle || entry.csl_data?.title || entry.raw_reference_text
                };
            }
        });

        // Store status for next check loop
        Object.entries(updates).forEach(([key, val]) => {
            this.statusMap.set(key, val.status);
        });

        // Re-run processUpdates to apply new statuses and metadata visually
        if (editor && !editor.isDestroyed) {
            this.processUpdates(editor, projectId, updates);
        }
    }
}
