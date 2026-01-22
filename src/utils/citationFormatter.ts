import { StoredCitation } from "../components/citations/SourceDetailPanel";

export type CitationStyle = "APA" | "MLA" | "Chicago" | "IEEE";
export type CitationType = "in-text" | "reference-entry";

export const formatCitation = (
    source: StoredCitation,
    style: CitationStyle,
    type: CitationType
): string => {
    // Ensure we have a proper list of authors
    let authors = source.authors || [];
    if (authors.length === 0 && source.author) {
        // Attempt to parse string "Name, Name, Name"
        // Heuristic: If contains comma, split.
        if (source.author.includes(",")) {
            authors = source.author.split(",").map(a => a.trim());
        } else {
            authors = [source.author];
        }
    }
    if (authors.length === 0) authors = ["Unknown"];

    const title = source.title;
    const year = source.year || "n.d.";
    const journal = source.journal;
    const doi = source.doi;

    // Helper to get author string for Reference Entries (Full list)
    const getAuthors = (s: CitationStyle) => {
        const list = authors;

        if (s === "APA") {
            // APA References: List up to 20 authors
            if (list.length === 1) return list[0];
            if (list.length === 2) return `${list[0]} & ${list[1]}`;
            if (list.length > 2 && list.length <= 20) {
                return list.slice(0, list.length - 1).join(", ") + ", & " + list[list.length - 1];
            }
            if (list.length > 20) {
                return list.slice(0, 19).join(", ") + ", ... " + list[list.length - 1];
            }
            return list.join(", ");
        }
        if (s === "MLA") {
            // MLA References: 3+ -> et al.
            if (list.length === 1) return list[0];
            if (list.length === 2) return `${list[0]} and ${list[1]}`;
            if (list.length >= 3) return `${list[0]} et al.`;
            return list[0];
        }
        if (s === "Chicago") {
            // Chicago References
            if (list.length === 1) return list[0];
            if (list.length === 2) return `${list[0]} and ${list[1]}`;
            if (list.length > 10) return list.slice(0, 7).join(", ") + ", et al.";
            return list.slice(0, list.length - 1).join(", ") + ", and " + list[list.length - 1];
        }
        if (s === "IEEE") {
            // IEEE References: Join with "and" for last author if possible, or just commas
            if (list.length === 1) return list[0];
            if (list.length === 2) return `${list[0]} and ${list[1]}`;
            return list.slice(0, list.length - 1).join(", ") + ", and " + list[list.length - 1];
        }
        return authors.join(", ");
    };

    // 1. In-Text Citations
    if (type === "in-text") {
        const first = authors[0];

        switch (style) {
            case "APA":
                // 1 author → (Author, Year)
                // 2 authors → (Author & Author, Year)
                // 3+ authors → (Author et al., Year)
                if (authors.length === 1) return `(${first}, ${year})`;
                if (authors.length === 2) return `(${first} & ${authors[1]}, ${year})`;
                return `(${first} et al., ${year})`;

            case "MLA":
                // 1 author → (Author)
                // 2 authors → (Author and Author)
                // 3+ authors → (Author et al.)
                if (authors.length === 1) return `(${first})`;
                if (authors.length === 2) return `(${first} and ${authors[1]})`;
                return `(${first} et al.)`;

            case "Chicago":
                // 1 author → (Author Year)
                // 2 authors → (Author and Author Year)
                // 3 authors → (Author, Author, and Author Year)
                // 4+ authors → (Author et al. Year)
                if (authors.length === 1) return `(${first} ${year})`;
                if (authors.length === 2) return `(${first} and ${authors[1]} ${year})`;
                if (authors.length === 3) return `(${first}, ${authors[1]}, and ${authors[2]} ${year})`;
                return `(${first} et al. ${year})`;

            case "IEEE":
                // Always numeric → [1]
                return `[1]`;

            default:
                return `(${first}, ${year})`;
        }
    }

    // 2. Reference List Entry
    switch (style) {
        case "APA":
            // Author, A. A. (Year). Title of article. Title of Journal, Volume(Issue), pages. https://doi.org/xx.xxx
            return `${getAuthors("APA")} (${year}). ${title}. ${journal ? `${journal}, ` : ""}${source.volume ? `${source.volume}` : ""}${source.issue ? `(${source.issue})` : ""}${source.pages ? `, ${source.pages}` : ""}.${doi ? ` https://doi.org/${doi}` : ""}`;

        case "MLA":
            // Author. "Title." Title of Journal, vol. x, no. x, Year, pp. x-x.
            return `${getAuthors("MLA")}. "${title}." ${journal ? `${journal}, ` : ""} ${source.volume ? `vol. ${source.volume}, ` : ""}${source.issue ? `no. ${source.issue}, ` : ""}${year}${source.pages ? `, pp. ${source.pages}` : ""}.`;

        case "Chicago":
            // Author. Year. "Title." Journal Volume (Issue): Pages.
            return `${getAuthors("Chicago")}. ${year}. "${title}." ${journal ? `${journal} ` : ""}${source.volume ? `${source.volume}` : ""}${source.issue ? ` (${source.issue})` : ""}${source.pages ? `: ${source.pages}` : ""}.`;

        case "IEEE":
            // [1] Author, "Title," Journal, vol. x, no. x, pp. x-x, Year.
            return `[1] ${getAuthors("IEEE")}, "${title}," ${journal ? `${journal}, ` : ""}${source.volume ? `vol. ${source.volume}, ` : ""}${source.issue ? `no. ${source.issue}, ` : ""}${source.pages ? `pp. ${source.pages}, ` : ""}${year}.`;

        default:
            return `${authors[0]}. (${year}). ${title}.`;
    }
};

export interface PrecomputedCitations {
    apa: { inText: string; reference: string };
    mla: { inText: string; reference: string };
    chicago: { inText: string; reference: string };
    ieee: { inText: string; reference: string };
}

export const generatePrecomputedCitations = (source: StoredCitation): PrecomputedCitations => {
    return {
        apa: {
            inText: formatCitation(source, "APA", "in-text"),
            reference: formatCitation(source, "APA", "reference-entry")
        },
        mla: {
            inText: formatCitation(source, "MLA", "in-text"),
            reference: formatCitation(source, "MLA", "reference-entry")
        },
        chicago: {
            inText: formatCitation(source, "Chicago", "in-text"),
            reference: formatCitation(source, "Chicago", "reference-entry")
        },
        ieee: {
            inText: formatCitation(source, "IEEE", "in-text"),
            reference: formatCitation(source, "IEEE", "reference-entry")
        }
    };
};
