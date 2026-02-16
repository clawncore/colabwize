
import { Editor } from "@tiptap/react";
import { CitationOrderManager } from "./citationOrderManager";
import { CitationIntegrityWatcher } from "./citationIntegrityWatcher";

type LockMode = 'update' | 'export' | 'none';

interface ProjectLock {
    mode: LockMode;
    timestamp: number;
    taskId?: string; // Optional ID for tracking specific operations
}

/**
 * Service to orchestrate citation operations and prevent race conditions.
 * Ensures that Exports do not happen while Updates are pending, and vice-versa.
 */
export class CitationOrchestrator {
    private static locks: Map<string, ProjectLock> = new Map();
    private static pendingUpdates: Map<string, NodeJS.Timeout> = new Map();

    /**
     * Check if a project is currently locked.
     */
    static isLocked(projectId: string): boolean {
        const lock = this.locks.get(projectId);
        if (!lock) return false;

        // Auto-release stale locks (older than 10 seconds)
        // This prevents infinite blocking if an operation crashes or fails to release.
        if (Date.now() - lock.timestamp > 10000) {
            console.warn(`[Orchestrator] Auto-releasing stale lock for ${projectId} (Mode: ${lock.mode})`);
            this.releaseLock(projectId);
            return false;
        }
        return true;
    }

    /**
     * Acquire a lock for a specific mode.
     * Returns true if successful, false if already locked.
     */
    private static acquireLock(projectId: string, mode: LockMode): boolean {
        if (this.isLocked(projectId)) {
            const current = this.locks.get(projectId)!;
            // 'update' mode can sometimes override another 'update' (debounce logic handles this mostly),
            // but 'export' is exclusive.
            // If we are exporting, we block everything.
            if (current.mode === 'export') {
                return false;
            }
            // If we are updating, we block export.
            if (mode === 'export' && current.mode === 'update') {
                return false;
            }
            // Overlapping updates are technically handled by debounce, so we can refresh the lock timestamp.
            if (mode === 'update' && current.mode === 'update') {
                current.timestamp = Date.now();
                return true;
            }
        }

        this.locks.set(projectId, { mode, timestamp: Date.now() });
        return true;
    }

    /**
     * Release the lock for a project.
     */
    static releaseLock(projectId: string) {
        this.locks.delete(projectId);
    }

    /**
     * Schedule a Citation Update (Ordering + Integrity Check).
     * Replaces direct calls in DocumentEditor.
     */
    static scheduleUpdate(editor: Editor, projectId: string, style: string = 'apa') {
        // Clear any pending update for this project (Debounce at Scheduler level)
        // Note: DocumentEditor has its own debounce, but centralizing it here is safer for the Lock check.

        if (this.pendingUpdates.has(projectId)) {
            clearTimeout(this.pendingUpdates.get(projectId)!);
        }

        const task = setTimeout(async () => {
            // Attempt to Run
            if (this.acquireLock(projectId, 'update')) {
                const startTime = Date.now();
                try {
                    // console.log(`[Orchestrator] Running Update for ${projectId}`);

                    // 1. Order & Style Update
                    await CitationOrderManager.updateCitationNodes(editor, projectId, style);

                    // 2. Integrity Check
                    await CitationIntegrityWatcher.processUpdates(editor, projectId);

                    const duration = Date.now() - startTime;
                    console.log(`[Orchestrator] Update Metrics`, {
                        projectId,
                        mode: 'update',
                        style,
                        citationCount: editor.state.doc.nodeSize, // Approximation or use manager stats if available
                        duration: `${duration}ms`,
                        status: 'success'
                    });

                } catch (error) {
                    const duration = Date.now() - startTime;
                    console.error("[Orchestrator] Update Failed:", {
                        projectId,
                        duration: `${duration}ms`,
                        error: error
                    });
                } finally {
                    this.releaseLock(projectId);
                    this.pendingUpdates.delete(projectId);
                }
            } else {
                console.warn(`[Orchestrator] Update skipped (Locked by Export) for ${projectId}`);
                // Retry? Ideally yes, but for now skipping one frame is okay as next edit triggers another.
            }
        }, 100); // Short delay to allow lock check/setup

        this.pendingUpdates.set(projectId, task);
    }

    /**
     * Run an Export Token Generation or Validation task.
     * Guaranteed to run exclusive of updates.
     */
    static async runExport<T>(projectId: string, task: () => Promise<T>): Promise<T> {
        // Wait for lock?
        // Simple spin-wait for a short duration if locked by 'update'
        let retries = 0;
        while (this.isLocked(projectId) && retries < 10) {
            await new Promise(r => setTimeout(r, 200));
            retries++;
        }

        if (!this.acquireLock(projectId, 'export')) {
            throw new Error("Project is busy with another operation. Please try again.");
        }

        const startTime = Date.now();
        try {
            // console.log(`[Orchestrator] Starting Export Task for ${projectId}`);
            // Ensure consistency before running
            // Use current style state as source of truth
            const consistency = CitationOrderManager.getConsistencyState();
            // console.log(`[Orchestrator] Export Snapshot: Style=${consistency.style}, V=${consistency.version}`);

            const result = await task();

            const duration = Date.now() - startTime;
            console.log(`[Orchestrator] Export Metrics`, {
                projectId,
                mode: 'export',
                style: consistency.style,
                version: consistency.version,
                duration: `${duration}ms`,
                status: 'success'
            });

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`[Orchestrator] Export Failed`, {
                projectId,
                duration: `${duration}ms`,
                error
            });
            throw error;
        } finally {
            this.releaseLock(projectId);
            // console.log(`[Orchestrator] Export Task Finished`);
        }
    }
}
