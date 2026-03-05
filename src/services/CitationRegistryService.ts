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
            // --- AUTO-ENRICHMENT ---
            // If this is an auto-imported citation from plain text, it likely lacks rich metadata.
            // We silently ping the search API (OpenAlex) to find a match and enrich the data before saving.
            let enrichedMetadata = metadata;
            if (!metadata?.journal && !metadata?.url) {
                try {
                    console.log("🔍 Auto-enriching citation metadata for:", citationText);
                    const query = metadata?.title || citationText.substring(0, 80);
                    const searchResults = await CitationService.searchPapers(query);

                    if (searchResults && searchResults.length > 0) {
                        const bestMatch = searchResults[0];
                        console.log("✅ Found enriched metadata match:", bestMatch.title);
                        enrichedMetadata = {
                            ...metadata,
                            title: bestMatch.title || metadata?.title,
                            authors: bestMatch.authors?.length ? bestMatch.authors : metadata?.authors,
                            year: bestMatch.year || metadata?.year,
                            journal: bestMatch.journal || metadata?.journal,
                            url: bestMatch.url || metadata?.url,
                            doi: bestMatch.doi || metadata?.doi,
                            citationCount: bestMatch.citationCount || metadata?.citationCount,
                            abstract: bestMatch.abstract || metadata?.abstract,
                        };
                    }
                } catch (e) {
                    console.warn("⚠️ Failed to enrich citation metadata on the fly:", e);
                }
            }

            const response = await CitationService.addCitation(projectId, {
                title: enrichedMetadata?.title || citationText.substring(0, 50) + '...',
                authors: enrichedMetadata?.authors?.length ? enrichedMetadata.authors : ["Unknown"],
                year: typeof enrichedMetadata?.year === 'number' && !isNaN(enrichedMetadata.year)
                    ? enrichedMetadata.year
                    : (parseInt(String(enrichedMetadata?.year)) || new Date().getFullYear()),
                url: enrichedMetadata?.url,
                doi: enrichedMetadata?.doi,
                journal: enrichedMetadata?.journal,
                citationCount: enrichedMetadata?.citationCount,
                abstract: enrichedMetadata?.abstract,
                source: (enrichedMetadata as any)?.source || "manual-ingest",
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
