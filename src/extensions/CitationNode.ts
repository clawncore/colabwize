import { Node, mergeAttributes } from "@tiptap/core";
import { CitationRegistryService } from "../services/CitationRegistryService";


export interface CitationNodeOptions {
    HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        citation: {
            insertCitation: (attributes: { citationId: string }) => ReturnType;
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
                class: "citation-token",
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
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: "span[data-citation-id]",
            },
            {
                tag: "span[data-cite]",
            },
        ];
    },

    // Kept for SSR / clipboard serialization
    renderHTML({ HTMLAttributes, node }) {
        return [
            "span",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                class: "citation-pill citation-node",
                "data-citation-id": node.attrs.citationId,
                "data-status": node.attrs.status || "unresolved",
            }),
            node.attrs.citationId || "Citation"
        ];
    },

    /**
     * addNodeView — attaches a REAL native DOM click listener.
     *
     * ProseMirror `atom` nodes have their events intercepted before they bubble to
     * Tiptap's `editorProps.handleClick`. A native addEventListener on the dom node
     * fires unconditionally and is the only reliable way to handle citation clicks.
     *
     * · Regular click  → dispatches a `citation:click` CustomEvent (bubbles up to
     *                    .ProseMirror where DocumentEditor listens via useEffect).
     * · Ctrl/Cmd+Click → opens the citation URL directly in a new tab.
     */
    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement("span");
            const citationId = node.attrs.citationId;

            const STATUS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
                verified: { color: "#15803d", bg: "#f0fdf4", border: "#4ade80" },
                resolved: { color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd" },
                warning: { color: "#92400e", bg: "#fffbeb", border: "#fbbf24" },
                invalid: { color: "#b91c1c", bg: "#fef2f2", border: "#f87171" },
                unresolved: { color: "#1d4ed8", bg: "rgba(239,246,255,0.6)", border: "#93c5fd" },
            };

            const applyStyle = (entry: any) => {
                const status = node.attrs.status || (entry ? "resolved" : "unresolved");
                const s = STATUS_STYLES[status] || STATUS_STYLES.unresolved;
                const displayText = entry ? formatInTextCitation(entry) : `(Loading...)`;

                dom.className = "citation-pill citation-node";
                dom.style.cssText = `
                    display:inline;
                    padding:1px 4px;
                    border-radius:3px;
                    border-bottom:1.5px solid ${s.border};
                    cursor:pointer;
                    font-weight:500;
                    color:${s.color};
                    background:${s.bg};
                    text-decoration:underline;
                    text-decoration-color:rgba(59,130,246,0.35);
                    transition:opacity .15s;
                    user-select:none;
                `;
                dom.textContent = displayText;
                dom.setAttribute("data-citation-id", citationId);
                dom.setAttribute("data-status", status);

                if (entry) {
                    dom.title = `${entry.sourceTitle || entry.raw_reference_text}\n${entry.url ? "Ctrl+Click to open" : "Click to scroll to bib"}`;
                }
            };

            const paint = () => {
                const entry = CitationRegistryService.getCitation(citationId);
                if (entry) {
                    applyStyle(entry);
                } else {
                    // Show a neutral placeholder while we fetch
                    applyStyle(null);
                    // Async fallback: try to fetch from backend and repaint
                    CitationRegistryService.initializeFromBackend(
                        (window as any).__currentProjectId__ || ''
                    ).then(() => {
                        const resolved = CitationRegistryService.getCitation(citationId);
                        if (resolved) applyStyle(resolved);
                        else applyStyle(null);
                    }).catch(() => applyStyle(null));
                }
            };

            paint();

            dom.addEventListener("mouseenter", () => { dom.style.opacity = "0.75"; });
            dom.addEventListener("mouseleave", () => { dom.style.opacity = "1"; });

            dom.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();

                const entry = CitationRegistryService.getCitation(citationId);
                const isExternal = (e as MouseEvent).ctrlKey || (e as MouseEvent).metaKey || (e as MouseEvent).shiftKey;

                if (isExternal && entry?.url) {
                    window.open(entry.url, "_blank", "noopener,noreferrer");
                } else {
                    const bibEntry = document.getElementById(`bib-${citationId}`);
                    if (bibEntry) {
                        bibEntry.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        bibEntry.classList.add('highlighted');
                        setTimeout(() => bibEntry.classList.remove('highlighted'), 2000);
                    } else {
                        if (entry?.url) {
                            window.open(entry.url, "_blank", "noopener,noreferrer");
                        }
                    }
                }
            });

            return {
                dom,
                update: (updatedNode) => {
                    if (updatedNode.type.name !== "citation") return false;
                    paint();
                    return true;
                },
            };
        };
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
