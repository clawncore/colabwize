


export interface RegistryEntry {
    ref_key: string;
    raw_reference_text: string;
    all_texts?: string[]; // To track multiple ways this is cited
    sourceTitle?: string;
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
        const entries: RegistryEntry[] = existingCitations.map((c, index) => {
            const entry: RegistryEntry = {
                ref_key: c.ref_key || c.id || `ref_${String(index + 1).padStart(3, '0')}`,
                raw_reference_text: c.raw_reference_text || c.title || "Unknown Reference",
                doi: c.doi,
                url: c.url,
                csl_data: c.csl_data
            };

            // ALWAYS generate hash for deduplication, even if csl_data is missing
            if (c.csl_data) {
                entry.contentHash = this.generateContentHash(c.csl_data);
            } else {
                // Generate a temporary CSL to get a hash for the existing entry
                const tempCsl = this.normalizeToCSL(entry.ref_key, entry.raw_reference_text, { doi: entry.doi, url: entry.url });
                entry.contentHash = this.generateContentHash(tempCsl);
                entry.csl_data = tempCsl; // Cache it
            }
            return entry;
        });
        this.registry.set(projectId, entries);
    }

    /**
     * Get or create a reference key for a given citation text.
     * Keeps keys stable for the same text.
     */
    static registerCitation(projectId: string, text: string, metadata?: { doi?: string, url?: string, preferredKey?: string, sourceTitle?: string }): RegistryEntry {
        if (!projectId || projectId === 'current-project') {
            console.warn(`[Registry] Potential ID Mismatch: registerCitation called with projectId="${projectId}"`);
        }

        let entries = this.registry.get(projectId) || [];

        // 1. Generate CSL first to get normalized data for hashing
        const tempCsl = this.normalizeToCSL("temp", text, metadata);
        const hash = this.generateContentHash(tempCsl);

        // 2. Check for existing match (Exact text OR Content Hash OR Preferred Key)
        const existing = entries.find(e =>
            (metadata?.preferredKey && e.ref_key === metadata.preferredKey) ||
            e.all_texts?.includes(text) || // Multi-text match support
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
            if (metadata?.sourceTitle && !existing.sourceTitle) {
                existing.sourceTitle = metadata.sourceTitle;
            }
            return existing;
        }

        // 3. Fallback: Author-Year Fuzzy Match (Special for inline citations)
        if (tempCsl.author?.[0]?.family && tempCsl.author[0].family !== "Unknown" && tempCsl.issued?.['date-parts']?.[0]?.[0]) {
            const author = tempCsl.author[0].family.toLowerCase();
            const year = tempCsl.issued['date-parts'][0][0];

            const fuzzyMatch = entries.find(e => {
                const entryAuthor = (e.csl_data?.author?.[0]?.family || "").toLowerCase();
                const entryYear = e.csl_data?.issued?.['date-parts']?.[0]?.[0];
                return entryAuthor === author && entryYear === year;
            });

            if (fuzzyMatch) {
                return fuzzyMatch;
            }
        }

        // 3. Generate new key OR use preferred key
        let refKey = metadata?.preferredKey;
        if (!refKey) {
            const nextIndex = entries.length + 1;
            refKey = `ref_${String(nextIndex).padStart(3, '0')}`;
        }

        // Update ID in CSL
        tempCsl.id = refKey;

        const newEntry: RegistryEntry = {
            ref_key: refKey,
            raw_reference_text: text,
            doi: tempCsl.DOI,
            url: tempCsl.URL,
            sourceTitle: metadata?.sourceTitle,
            csl_data: tempCsl,
            contentHash: hash
        };

        entries.push(newEntry);
        this.registry.set(projectId, entries);

        return newEntry;
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
        const doiMatch = text.match(/10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/);
        const urlMatch = text.match(/https?:\/\/[^\s]+|www\.[^\s]+/);

        // CLEAN TEXT for author extraction (Strip parens, "et al", and digits)
        const cleanText = text.replace(/[()]/g, '')
            .replace(/et al\.?/gi, '')
            .replace(/\d{4}/g, '')
            .replace(/[,.]/g, ' ')
            .trim();

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

                // Parse Authors
                // If it's an inline citation like (Smith et al, 2023), cleanText is just "Smith"
                // If it's a full reference, cleanText is the whole preamble.
                const rawAuthors = cleanText.split(/&|\band\b|;/);

                authors = rawAuthors.map(a => {
                    const parts = a.trim().split(/\s+/);
                    if (parts.length === 0 || parts[0] === "") return null;

                    // Heuristic: If it has a comma, it's "Family, Given"
                    if (a.includes(',')) {
                        const [family, given] = a.split(',');
                        return { family: family.trim(), given: given?.trim() };
                    }

                    // Otherwise, assume the last segment is the family name
                    return { family: parts[parts.length - 1], given: parts.slice(0, -1).join(' ') };
                }).filter(Boolean);
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
