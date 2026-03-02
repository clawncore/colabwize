import { apiClient } from "./apiClient";
import { CitationService, StoredCitation } from "./citationService";

export interface RegistryEntry {
    ref_key: string;
    raw_reference_text: string;
    url?: string;
    sourceTitle?: string;
    authors?: string[];
    year?: number | string;
    doi?: string;
    csl_data?: any;
    metadata?: Partial<StoredCitation>;
}

export class CitationRegistryService {
    private static cache: Map<string, RegistryEntry> = new Map();
    private static currentProjectId: string | null = null;
    private static initPromise: Promise<void> | null = null;

    static async initializeFromBackend(projectId: string): Promise<void> {
        if (this.currentProjectId === projectId && this.cache.size > 0) {
            return;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            if (this.currentProjectId !== projectId) {
                this.cache.clear();
                this.currentProjectId = projectId;
            }

            try {
                const citations = await CitationService.getProjectCitations(projectId);

                citations.forEach(citation => {
                    if (!citation.id) return;

                    this.cache.set(citation.id, {
                        ref_key: citation.id,
                        raw_reference_text: citation.raw_reference_text || citation.title,
                        url: citation.url || (citation.doi ? `https://doi.org/${citation.doi}` : undefined),
                        sourceTitle: citation.title,
                        authors: citation.authors,
                        year: typeof citation.year === 'number' ? citation.year : parseInt(String(citation.year) || '0'),
                        doi: citation.doi,
                        metadata: citation
                    });
                });

                console.log(`✅ Loaded ${citations.length} citations from backend for project ${projectId}`);
            } catch (error) {
                console.error('❌ Failed to load citations:', error);
                throw error;
            } finally {
                this.initPromise = null;
            }
        })();

        return this.initPromise;
    }

    // Backwards compatibility for loadRegistry locally if citations passed directly 
    static loadRegistry(projectId: string, existingCitations: any[]) {
        if (this.currentProjectId !== projectId) {
            this.cache.clear();
            this.currentProjectId = projectId;
        }
        existingCitations.forEach(citation => {
            if (!citation.id) return;
            this.cache.set(citation.id, {
                ref_key: citation.id,
                raw_reference_text: citation.raw_reference_text || citation.title,
                url: citation.url || (citation.doi ? `https://doi.org/${citation.doi}` : undefined),
                sourceTitle: citation.title,
                authors: citation.authors,
                year: typeof citation.year === 'number' ? citation.year : parseInt(String(citation.year) || '0'),
                doi: citation.doi,
                metadata: citation
            });
        });
    }

    static async registerCitation(
        projectId: string,
        citationText: string,
        metadata?: Partial<StoredCitation>
    ): Promise<RegistryEntry> {

        // Check cache first
        const existing = Array.from(this.cache.values()).find(
            entry => entry.raw_reference_text === citationText
        );

        if (existing) {
            return existing;
        }

        try {
            const response = await CitationService.addCitation(projectId, {
                title: metadata?.title || citationText.substring(0, 30) + '...',
                authors: metadata?.authors || [],
                year: typeof metadata?.year === 'number' ? metadata?.year : parseInt(String(metadata?.year) || '0'),
                url: metadata?.url,
                doi: metadata?.doi,
                source: (metadata as any)?.source || "manual-ingest",
                tags: ["auto-imported"]
            });

            // API client returns data property, or object directly depending on interceptor
            const savedData = response?.data || response;

            if (!savedData || !savedData.id) {
                throw new Error('Backend did not return citation ID');
            }

            const entry: RegistryEntry = {
                ref_key: savedData.id,
                raw_reference_text: citationText,
                url: savedData.url || (savedData.doi ? `https://doi.org/${savedData.doi}` : undefined),
                sourceTitle: savedData.title,
                authors: savedData.authors,
                year: typeof savedData.year === 'number' ? savedData.year : parseInt(String(savedData.year) || '0'),
                doi: savedData.doi,
                metadata: savedData
            };

            this.cache.set(savedData.id, entry);
            console.log('✅ Registered citation:', savedData.id);
            return entry;

        } catch (error) {
            console.error('❌ Failed to register citation, using fallback temp entry:', error);
            return this.registerTempCitation(citationText, metadata);
        }
    }

    // Synchronous method for paste handler
    static registerTempCitation(
        citationText: string,
        metadata?: Partial<StoredCitation>
    ): RegistryEntry {
        const existing = Array.from(this.cache.values()).find(
            entry => entry.raw_reference_text === citationText
        );

        if (existing) {
            return existing;
        }

        const tempId = metadata?.id || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tempEntry: RegistryEntry = {
            ref_key: tempId,
            raw_reference_text: citationText,
            url: metadata?.url,
            sourceTitle: metadata?.title,
            ...metadata
        };

        this.cache.set(tempEntry.ref_key, tempEntry);
        return tempEntry;
    }

    static getCitation(citationId: string): RegistryEntry | undefined {
        return this.cache.get(citationId);
    }

    static getEntry(projectId: string, citationId: string): RegistryEntry | undefined {
        return this.cache.get(citationId);
    }

    static getAllCitations(): RegistryEntry[] {
        return Array.from(this.cache.values());
    }

    static clear(): void {
        this.cache.clear();
        this.currentProjectId = null;
    }

    static removeCitation(citationId: string): void {
        this.cache.delete(citationId);
        console.log(`🗑️ Removed citation ${citationId} from registry cache`);
    }
}
