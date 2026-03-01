import { Node, mergeAttributes } from "@tiptap/core";
import { CitationRegistryService } from "../services/CitationRegistryService";

export interface CitationNodeOptions {
    HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        citation: {
            insertCitation: (attributes: { citationId: string, text?: string, url?: string }) => ReturnType;
        };
    }
}

export const CitationNode = Node.create<CitationNodeOptions>({
    name: "citation",
    group: "inline",
    inline: true,
    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {
                class: "citation-node citation-pill",
            },
        };
    },

    addAttributes() {
        return {
            citationId: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-citation-id") || element.getAttribute("data-cite"),
                renderHTML: (attributes) => ({ "data-citation-id": attributes.citationId }),
            },
            status: {
                default: "unresolved",
                parseHTML: (element) => element.getAttribute("data-status"),
                renderHTML: (attributes) => ({ "data-status": attributes.status }),
            },
            text: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-text") || element.textContent,
                renderHTML: (attributes) => ({ "data-text": attributes.text }),
            },
            url: {
                default: null,
                parseHTML: (element) => element.getAttribute("data-url") || element.getAttribute("href"),
                renderHTML: (attributes) => ({ "data-url": attributes.url }),
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: "a.citation-node",
            },
            {
                tag: "span[data-citation-id]",
            },
            {
                tag: "span[data-cite]",
            },
        ];
    },

    // Deterministic rendering for export and in-editor display
    renderHTML({ HTMLAttributes, node }) {
        const { citationId, status, text, url } = node.attrs;

        // Fallback for legacy nodes that only have citationId saved
        let displayText = text;
        let extUrl = url;

        if (!displayText || !extUrl) {
            const entry = CitationRegistryService.getCitation(citationId);
            if (entry) {
                if (!displayText) displayText = formatInTextCitation(entry);
                if (!extUrl) extUrl = entry.url || (entry.doi ? `https://doi.org/${entry.doi}` : null);
            } else {
                if (!displayText) displayText = "[citation]";
            }
        }

        const STATUS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
            verified: { color: "#15803d", bg: "#f0fdf4", border: "#4ade80" },
            resolved: { color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd" },
            warning: { color: "#92400e", bg: "#fffbeb", border: "#fbbf24" },
            invalid: { color: "#b91c1c", bg: "#fef2f2", border: "#f87171" },
            unresolved: { color: "#1d4ed8", bg: "rgba(239,246,255,0.6)", border: "#93c5fd" },
        };

        const s = STATUS_STYLES[status] || STATUS_STYLES.unresolved;

        return [
            "a",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                href: `#bib-${citationId}`,
                "data-citation-id": citationId,
                "data-status": status || "unresolved",
                "data-url": extUrl,
                "data-text": displayText,
                // Inline styles mirror exactly what was previously in the DOM injected node
                style: `display:inline; padding:1px 4px; border-radius:3px; border-bottom:1.5px solid ${s.border}; cursor:pointer; font-weight:500; color:${s.color}; background:${s.bg}; text-decoration:underline; text-decoration-color:rgba(59,130,246,0.35); user-select:none;`,
                title: extUrl ? "Ctrl+Click to open external link" : "Click to scroll to bibliography"
            }),
            displayText
        ];
    },

    addCommands() {
        return {
            insertCitation:
                (attributes) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                citationId: attributes.citationId,
                                text: attributes.text,
                                url: attributes.url
                            },
                        });
                    },
        };
    },
});

function formatInTextCitation(entry: any): string {
    const authors: string[] = entry.authors || [];
    const rawYear = entry.year;
    // year=0 means unset (default DB value), treat as null
    const year = rawYear && rawYear !== 0 ? String(rawYear) : null;
    const raw: string = entry.raw_reference_text || entry.sourceTitle || '';

    // --- Case 1: Already a formatted in-text citation (e.g. from text normalization) ---
    // Matches "(Smith, 2023)" or "(Smith et al., 2023)" or "[1]"
    if (raw.match(/^\(.*\d{4}.*\)$/) || raw.match(/^\[\d+(?:-\d+)?\]$/)) {
        return raw;
    }

    // --- Case 2: We have structured authors array ---
    if (authors.length > 0) {
        const name1 = authors[0].split(',')[0].trim();
        const y = year || extractYearFromText(raw) || '????';
        if (authors.length === 1) return `(${name1}, ${y})`;
        if (authors.length === 2) {
            const name2 = authors[1].split(',')[0].trim();
            return `(${name1} & ${name2}, ${y})`;
        }
        return `(${name1} et al., ${y})`;
    }

    // --- Case 3: Parse from raw bibliography text ---
    // Common formats: "Smith, J. (2023)...", "Smith et al. (2023)...", "Smith and Jones (2023)..."
    const parsedYear = year || extractYearFromText(raw);
    const parsedAuthor = extractFirstAuthorFromText(raw);

    if (parsedAuthor && parsedYear) {
        return `(${parsedAuthor}, ${parsedYear})`;
    }
    if (parsedAuthor) return `(${parsedAuthor})`;
    if (parsedYear) return `(Unknown, ${parsedYear})`;

    return `[citation]`;
}

function extractYearFromText(text: string): string | null {
    const match = text.match(/\((\d{4})\)/) || text.match(/\b(19|20)\d{2}\b/);
    return match ? match[1] || match[0] : null;
}

function extractFirstAuthorFromText(text: string): string | null {
    // Try "LastName, F." format → take the part before the first comma
    const lastFirstMatch = text.match(/^([A-Z][a-zÀ-ÿ'\-]+(?:\s[A-Z]\.)?),/);
    if (lastFirstMatch) return lastFirstMatch[1].trim();

    // Try "FirstName LastName (" format
    const firstLastMatch = text.match(/^([A-Z][a-zÀ-ÿ]+\s+[A-Z][a-zÀ-ÿ]+)\s*[\(,]/);
    if (firstLastMatch) return firstLastMatch[1].split(' ').pop() || null;

    // Try first capitalized word that looks like a last name
    const wordMatch = text.match(/^([A-Z][a-zÀ-ÿ]{2,})/);
    if (wordMatch) return wordMatch[1];

    return null;
}

export default CitationNode;
