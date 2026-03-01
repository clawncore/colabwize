import { Editor } from '@tiptap/core';
import { CitationRegistryService } from '../../../services/CitationRegistryService';

export interface BibliographyItem {
    text: string;
    startPos: number;
    endPos: number;
    authors: string[];
    year: number | string | null;
    title: string | null;
    doi: string | null;
    url: string | null;
}

/**
 * Extract bibliography section from document
 */
export function findBibliographySection(text: string): { start: number; end: number } | null {
    const lines = text.split('\n');
    let startLine = -1;
    let startPos = 0;

    // Find "References" or "Bibliography" heading
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase();
        if (line === 'references' || line === 'bibliography' || line === 'works cited') {
            startLine = i;
            startPos = lines.slice(0, i + 1).join('\n').length;
            break;
        }
    }

    if (startLine === -1) return null;

    return {
        start: startPos,
        end: text.length // Bibliography goes to end of document
    };
}

/**
 * Parse individual bibliography entries
 */
export function parseBibliographyEntries(text: string): BibliographyItem[] {
    const entries: BibliographyItem[] = [];
    const lines = text.split('\n');

    let currentEntry = '';
    let entryStartLine = 0;
    let charPosition = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) {
            charPosition += lines[i].length + 1; // +1 for newline
            continue;
        }

        // Check if this is a new entry (starts with capital letter or number or bracketed number)
        const isNewEntry = /^[A-Z]/.test(line) || /^\d+\./.test(line) || /^\[\d+\]/.test(line);

        if (isNewEntry && currentEntry) {
            // Process previous entry
            const parsed = parseReference(currentEntry);
            if (parsed) {
                entries.push({
                    text: currentEntry,
                    startPos: entryStartLine,
                    endPos: charPosition - 1,
                    ...parsed
                });
            }

            // Start new entry
            currentEntry = line;
            entryStartLine = charPosition;
        } else if (isNewEntry) {
            // First entry
            currentEntry = line;
            entryStartLine = charPosition;
        } else {
            // Continuation of current entry
            currentEntry += (currentEntry ? ' ' : '') + line;
        }

        charPosition += lines[i].length + 1;
    }

    // Process last entry
    if (currentEntry) {
        const parsed = parseReference(currentEntry);
        if (parsed) {
            entries.push({
                text: currentEntry,
                startPos: entryStartLine,
                endPos: charPosition,
                ...parsed
            });
        }
    }

    return entries;
}

/**
 * Parse a single reference string
 */
function parseReference(refText: string): {
    authors: string[];
    year: number | string | null;
    title: string | null;
    doi: string | null;
    url: string | null;
} | null {

    // Extract authors (before the year in parentheses)
    const authorMatch = refText.match(/^([^(]+?)\s*\((\d{4})/);
    const authors = authorMatch
        ? authorMatch[1].split(/,|&|and/).map(a => a.trim()).filter(Boolean)
        : [];

    // Extract year
    const yearMatch = refText.match(/\((\d{4}[a-z]?)\)/);
    const year = yearMatch ? yearMatch[1] : null;

    // Extract title (text after year, before journal/source)
    const titleMatch = refText.match(/\(\d{4}[a-z]?\)\.\s*([^.]+)/);
    const title = titleMatch ? titleMatch[1].trim() : null;

    // Extract DOI
    const doiMatch = refText.match(/(?:https?:\/\/)?(?:dx\.)?doi\.org\/(10\.\d+\/[^\s]+)/i);
    const doi = doiMatch ? doiMatch[1] : null;

    // Extract URL
    const urlMatch = refText.match(/https?:\/\/[^\s]+/);
    let url = urlMatch ? urlMatch[0] : null;

    // If DOI exists but no URL, create DOI URL
    if (doi && !url) {
        url = `https://doi.org/${doi}`;
    }

    return { authors, year, title, doi, url };
}

/**
 * Main function: Normalize bibliography in the editor
 */
export async function detectAndNormalizeBibliography(
    editor: Editor,
    projectId: string
): Promise<void> {

    const text = editor.getText();
    const bibSection = findBibliographySection(text);

    if (!bibSection) {
        console.log('No bibliography section found');
        return;
    }

    console.log('📚 Found bibliography section');

    // Get bibliography text
    const bibText = text.substring(bibSection.start, bibSection.end);
    const entries = parseBibliographyEntries(bibText);

    console.log(`Found ${entries.length} bibliography entries`);

    if (entries.length === 0) return;

    // Prepare transaction
    const tr = editor.state.tr;
    let modificationsMade = false;

    // Process each entry (in reverse to preserve positions during replacements)
    for (const entry of entries.reverse()) {
        try {
            // Register citation with backend
            const registryEntry = await CitationRegistryService.registerCitation(
                projectId,
                entry.text,
                {
                    authors: entry.authors,
                    year: entry.year || undefined,
                    title: entry.title || undefined,
                    doi: entry.doi || undefined,
                    url: entry.url || undefined,
                }
            );

            if (!registryEntry) continue;

            // Calculate absolute position in document
            // Note: Prosemirror text positions don't strictly align with plain text indices if there are node boundaries.
            // A more robust approach searches for exactly the bibliography paragraph within the trailing boundaries.

            // Find the paragraph node containing this entry
            let targetPos: number | null = null;
            let targetNode: any = null;

            editor.state.doc.descendants((node, pos) => {
                if (node.isBlock && node.textContent && node.textContent.includes(entry.text)) {
                    // Verify it's in the actual references section by position
                    // Using a rough heuristic: if we're near the end of the doc.
                    if (pos > editor.state.doc.content.size * 0.5) {
                        targetPos = pos;
                        targetNode = node;
                        return false; // Stop searching
                    }
                }
            });

            if (targetPos === null) {
                // fallback exact search via text
                const exactTextPos = text.lastIndexOf(entry.text);
                if (exactTextPos !== -1) {
                    editor.state.doc.descendants((node, pos) => {
                        if (node.isTextblock && node.textContent === entry.text) {
                            targetPos = pos;
                            targetNode = node;
                            return false;
                        }
                    });
                }
            }

            if (targetPos !== null && targetNode) {
                const bibNode = editor.state.schema.nodes.bibliographyEntry.create(
                    {
                        citationId: registryEntry.ref_key,
                        url: registryEntry.url || registryEntry.doi ? `https://doi.org/${registryEntry.doi}` : null,
                        doi: entry.doi,
                        refText: entry.text
                    },
                    editor.state.schema.text(entry.text)
                );

                tr.replaceWith(
                    targetPos,
                    targetPos + targetNode.nodeSize,
                    bibNode
                );
                modificationsMade = true;
                console.log(`✅ Normalized bibliography entry: ${entry.authors[0] || 'Unknown Author'}`);
            }

        } catch (error) {
            console.error('Failed to normalize bibliography entry:', error);
        }
    }

    if (modificationsMade) {
        editor.view.dispatch(tr);
        console.log('✅ Bibliography normalization complete');
    }
}
