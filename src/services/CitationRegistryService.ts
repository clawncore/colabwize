


export interface RegistryEntry {
    ref_key: string;
    raw_reference_text: string;
    doi?: string;
    url?: string;
    csl_data?: any; // Placeholder for future CSL JSON
    contentHash?: string;
}

export class CitationRegistryService {
    private static registry: Map<string, RegistryEntry[]> = new Map();

    /**
     * Initialize registry from project data
     */
    static loadRegistry(projectId: string, existingCitations: any[]) {
        // Convert existing citations to RegistryEntry format if needed
        // For now, we assume existingCitations might match the structure or be empty
        const entries: RegistryEntry[] = existingCitations.map((c, index) => {
            const entry: RegistryEntry = {
                ref_key: c.ref_key || `ref_${String(index + 1).padStart(3, '0')}`,
                raw_reference_text: c.raw_reference_text || c.title || "Unknown Reference",
                doi: c.doi,
                url: c.url,
                csl_data: c.csl_data
            };
            // Generate hash for existing entries to enable dedupe against new ones
            if (c.csl_data) {
                entry.contentHash = this.generateContentHash(c.csl_data);
            }
            return entry;
        });
        this.registry.set(projectId, entries);
    }

    /**
     * Get or create a reference key for a given citation text.
     * Keeps keys stable for the same text.
     */
    static registerCitation(projectId: string, text: string, metadata?: { doi?: string, url?: string }): string {
        let entries = this.registry.get(projectId) || [];

        // 1. Generate CSL first to get normalized data for hashing
        // We use a temporary ID for normalization
        const tempCsl = this.normalizeToCSL("temp", text, metadata);
        const hash = this.generateContentHash(tempCsl);

        // 2. Check for existing match (Exact text OR Content Hash)
        const existing = entries.find(e =>
            e.raw_reference_text === text || // Exact text match
            (e.contentHash && e.contentHash === hash) // Semantic match
        );

        if (existing) {
            // MERGE METADATA: If new one has DOI/URL and existing doesn't, update existing.
            if (metadata?.doi && !existing.doi) {
                existing.doi = metadata.doi;
                if (existing.csl_data) existing.csl_data.DOI = metadata.doi;
            }
            if (metadata?.url && !existing.url) {
                existing.url = metadata.url;
                if (existing.csl_data) existing.csl_data.URL = metadata.url;
            }
            // console.log(`[Registry] Hit: ${projectId} | ${text} -> ${existing.ref_key}`);
            return existing.ref_key;
        }

        // 3. Generate new key
        const nextIndex = entries.length + 1;
        const refKey = `ref_${String(nextIndex).padStart(3, '0')}`;

        // Update ID in CSL
        tempCsl.id = refKey;

        const newEntry: RegistryEntry = {
            ref_key: refKey,
            raw_reference_text: text,
            doi: tempCsl.DOI,
            url: tempCsl.URL,
            csl_data: tempCsl,
            contentHash: hash
        };

        entries.push(newEntry);
        this.registry.set(projectId, entries);

        console.log(`[Registry] New Entry: ${projectId} | ${refKey} | "${text.substring(0, 30)}..."`);
        return refKey;
    }

    /**
     * Generate a deterministic hash based on content.
     * Format: author|year|title_slug
     */
    private static generateContentHash(csl: any): string {
        try {
            const author = csl.author?.[0]?.family?.toLowerCase().trim() ||
                csl.author?.[0]?.literal?.toLowerCase().trim() ||
                "unknown";

            const year = csl.issued?.['date-parts']?.[0]?.[0] || "0000";

            const title = csl.title || "";
            const titleSlug = title.substring(0, 20).toLowerCase().replace(/[^a-z0-9]/g, '');

            return `${author}|${year}|${titleSlug}`;
        } catch (e) {
            return `unknown|0000|${Math.random()}`; // Fallback (should not happen with valid CSL)
        }
    }

    /**
     * Deterministic CSL-JSON Normalization
     */
    private static normalizeToCSL(id: string, text: string, metadata?: { doi?: string, url?: string }): any {
        // 1. Basic Extraction (Regex-based fallbacks)
        const doiMatch = text.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/);
        const urlMatch = text.match(/https?:\/\/[^\s]+|www\.[^\s]+/);

        const doi = metadata?.doi || (doiMatch ? doiMatch[0] : undefined);
        const url = metadata?.url || (urlMatch ? urlMatch[0] : undefined);

        // 2. Author/Year Parsing (Simple Heuristic for basic formats)
        // "(Smith, 2023)" or "Smith, J. (2023). Title..."

        let authors: any[] = [];
        let issued: any = { "date-parts": [[]] };
        let title = text; // Default title is full text if parsing fails
        let type = "article-journal"; // Default type

        try {
            // Try to find Year (YYYY)
            // Look for (YYYY) or . YYYY .
            const yearMatch = text.match(/\((\d{4})\)[.]?/) || text.match(/[.]\s+(\d{4})[.]/);

            if (yearMatch) {
                const year = parseInt(yearMatch[1]);
                issued = { "date-parts": [[year]] };

                // Content before year is likely authors
                const preYear = text.substring(0, yearMatch.index).trim();

                // Content after year is likely title + source
                // Remove trailing dot from year match if present
                const postYear = text.substring(yearMatch.index! + yearMatch[0].length).trim();

                // Simple Title Extraction: Take everything up to the next period?
                // Or just use the whole post-year string for safe keeping
                title = postYear;

                // Parse Authors (Smith, J. & Doe, B.)
                // Split by '&', 'and', or semicolon if multiple
                // This is very rudimentary but sufficient for "Step 2" requirements covering basic structure
                const rawAuthors = preYear.split(/&|\band\b|;/);

                authors = rawAuthors.map(a => {
                    const cleanName = a.trim().replace(/,$/, '').replace(/\.$/, '');
                    // Heuristic: "Smith, John" vs "John Smith"
                    if (cleanName.includes(',')) {
                        const parts = cleanName.split(',');
                        return { family: parts[0].trim(), given: parts[1]?.trim() };
                    } else {
                        const parts = cleanName.split(' ');
                        return { family: parts[parts.length - 1], given: parts.slice(0, -1).join(' ') };
                    }
                }).filter(a => a.family); // Filter empty
            }
        } catch (e) {
            console.warn("CSL parsing failed, falling back to basic CSL", e);
        }

        // 3. Construct CSL Object
        return {
            id: id,
            type: type,
            title: title || text.substring(0, 50) + "...",
            author: authors.length > 0 ? authors : [{ literal: "Unknown" }],
            issued: issued,
            DOI: doi,
            URL: url,
            _raw: text // Custom field for debugging
        };
    }

    /**
     * Get all registry entries for saving
     */
    static getRegistry(projectId: string): RegistryEntry[] {
        return this.registry.get(projectId) || [];
    }

    /**
     * Lookup entry by key
     */
    static getEntry(projectId: string, key: string): RegistryEntry | undefined {
        return this.registry.get(projectId)?.find(e => e.ref_key === key);
    }
}
