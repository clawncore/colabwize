import { Editor } from "@tiptap/react";
import { CitationService } from "../../../services/citationService";

export function isLikelyCitation(text: string): boolean {
    const cleanText = text.trim();
    // Bibliography entries are generally dense and long. 
    // Minimum 40 characters ensures we don't accidentally match tiny in-text pills or short sentences.
    if (cleanText.length < 40) return false;

    // Explicitly reject single sentences that just happen to contain an in-text citation at the end.
    // e.g., "This is a test sentence (Smith, 2021)."
    if (cleanText.split('.').length <= 2 && cleanText.endsWith('.')) {
        // Look for typical sentence starts. Bibliography chunks don't look like generic sentences.
        if (cleanText.includes("This") || cleanText.includes("The") || cleanText.includes("In ")) {
            return false; // Heuristic bailout
        }
    }

    // IEEE style check: starts with [1], 1., 1), etc.
    if (/^\[\d+\]|^\d+\./.test(cleanText)) return true;

    // APA/Harvard style check: 
    // Must be Author Name, Initials. (Year). 
    // e.g. Smith, J. (2020)
    if (/^[A-Z][a-zÀ-ÿ\-]+,\s*(?:[A-Z]\.\s*)+(?:(?:&|and)\s*[A-Z][a-zÀ-ÿ\-]+,\s*(?:[A-Z]\.\s*)+)*\(\d{4}[a-z]?\)/.test(cleanText.substring(0, 100))) return true;

    // Looser APA fallback: Author Last Name (Year) IF there are multiple bibliographic indicators
    // but avoid matching normal English sentences like "Since the discovery (2010)"
    if (/^[A-Z][a-zÀ-ÿ\-]+.*?\(\d{4}\)/.test(cleanText.substring(0, 100))) {
        // If it starts with a common English word, it's a sentence, not an author name.
        const firstWord = cleanText.split(' ')[0].toLowerCase();
        const commonWords = ['the', 'this', 'in', 'a', 'an', 'to', 'for', 'it', 'since', 'as', 'when'];
        if (!commonWords.includes(firstWord) && cleanText.includes('vol') || cleanText.includes('journal') || cleanText.includes('doi')) {
            return true;
        }
    }

    // Fallback keyword clustering check (dense academic identifiers)
    const keywords = ['doi.org', 'et al.', 'vol.', 'journal', 'http', 'pp.', 'press', 'pmid'];
    let matches = 0;
    for (const kw of keywords) {
        if (cleanText.toLowerCase().includes(kw)) matches++;
    }

    // If it has at least 2 strong academic keywords, it's very likely a reference
    return matches >= 2;
}

/**
 * Parse author and year from an in-text citation like "(Smith, 2023)" or "(Smith et al., 2023)".
 */
function parseInTextCitation(
  text: string,
): { author: string; year: string } | null {
  // APA style: (Author, Year) or (Author et al., Year) or (Author & Author, Year) or (Author, Author, & Author, Year)
  // Extract simply the first continuous word as the author, and the 4 digit year right before the parenthesis
  const match = text.match(/^\(([A-Za-zÀ-ÿ'\-]+).*,\s*(\d{4})\)$/);
  if (match) return { author: match[1].toLowerCase(), year: match[2] };
  // IEEE style: [1] or [1-3]
  return null;
}

/**
 * Find an existing registry entry that matches an in-text citation by author surname + year.
 */
function findRegistryMatchForInText(
  inTextRaw: string,
  allEntries: any[],
): any | null {
  const parsed = parseInTextCitation(inTextRaw.trim());
  if (!parsed) return null;

  const { author, year } = parsed;

  return (
    allEntries.find((entry) => {
      // Check if this bibliography entry's raw text contains the author surname and year
      const raw = (entry.raw_reference_text || "").toLowerCase();
      const entryYear = String(entry.year || "");

      const authorInRaw =
        raw.startsWith(author) ||
        raw.includes(author + ",") ||
        raw.includes(author + " ");
      const yearMatch = entryYear === year || raw.includes(`(${year})`);

      if (authorInRaw && yearMatch) return true;

      // Also check structured authors array
      const structuredAuthors: string[] = entry.authors || [];
      if (structuredAuthors.length > 0) {
        const firstLastName = structuredAuthors[0]
          .split(",")[0]
          .toLowerCase()
          .trim();
        if (firstLastName === author && yearMatch) return true;
      }

      return false;
    }) || null
  );
}

/**
 * Scans the document for plain text citations and replaces them with Citation Nodes.
 * This enables the "Blue & Clickable" UI and creates bidirectional links to bibliography.
 */
export async function detectAndNormalizeCitations(
  editor: Editor,
  projectId: string,
  availableCitations: any[] = [],
) {
  if (!editor || !editor.isEditable) return;

  // Load available citations into registry for this project
  const { CitationRegistryService } =
    await import("../../../services/CitationRegistryService");
  CitationRegistryService.loadRegistry(projectId, availableCitations);

  // Ingest from Bibliography Section FIRST so those IDs are available for matching
  await scanAndIngestReferences(editor, projectId, availableCitations, true);

  let ieeeCount = 0;
  let apaCount = 0;

  const { state } = editor;
  const { doc } = state;
  const citations: Array<{ from: number; to: number; text: string }> = [];

  // Traverse paragraphs only (stop at References heading)
  let stopScanning = false;

<<<<<<< Updated upstream
  doc.descendants((node, pos) => {
    if (stopScanning || !node.isBlock || node.type.name === "doc") return true;

    if (node.type.name === "heading") {
      const text = node.textContent.toLowerCase().trim();
      if (
        text === "references" ||
        text === "refrences" ||
        text === "bibliography" ||
        text === "works cited" ||
        text.endsWith(" reference list")
      ) {
        stopScanning = true;
        return false;
      }
=======
    doc.descendants((node, pos) => {
        if (stopScanning || !node.isBlock || node.type.name === 'doc') return true;

        if (node.type.name === 'heading') {
            const text = node.textContent.toLowerCase().trim();
            if (text === 'references' || text === 'refrences' || text === 'bibliography' || text === 'works cited' || text.endsWith(' reference list')) {
                stopScanning = true;
                return false;
            }
        }

        // --- NEW: Never scan inside bibliography entries, and stop scanning once we hit them ---
        if (node.type.name === 'bibliographyEntry') {
            stopScanning = true;
            return false;
        }

        const blockText = node.textContent;
        if (!blockText) return false;

        return false;
    });

    if (citations.length === 0) return { stats: { ieee: ieeeCount, apa: apaCount } };

    // Get all existing registry entries for smart matching
    const allRegistryEntries = CitationRegistryService.getAllCitations();

    // Process each citation (in reverse to preserve positions)
    for (const citation of citations.reverse()) {
        try {
            let entry: any;

            // SMART MATCH: Try to find an existing bibliography registry entry first
            const matched = findRegistryMatchForInText(citation.text, allRegistryEntries);
            if (matched) {
                console.log(`🔗 Matched "${citation.text}" → bibliography entry ${matched.ref_key}`);
                entry = matched;
            } else {
                // Create new entry only if no match found
                entry = await CitationRegistryService.registerCitation(projectId, citation.text);
            }

            // Replace text with citation node
            const tr = editor.state.tr;
            tr.replaceWith(
                citation.from,
                citation.to,
                editor.state.schema.nodes.citation.create({
                    citationId: entry.ref_key,
                    status: entry.metadata?.verified ? 'verified' : 'resolved',
                    text: citation.text
                })
            );
            tr.setMeta('normalization', true);
            editor.view.dispatch(tr);
        } catch (error) {
            console.error('Failed to normalize citation:', citation.text, error);
        }
>>>>>>> Stashed changes
    }

    // --- NEW: Never scan inside bibliography entries, and stop scanning once we hit them ---
    if (node.type.name === "bibliographyEntry") {
      stopScanning = true;
      return false;
    }

    const blockText = node.textContent;
    if (!blockText) return false;

    const matches = extractPatterns(blockText, 0, "structural");

    matches.forEach((match) => {
      if (match.text.match(/^\[\d+(?:-\d+)?\]/)) {
        ieeeCount++;
      } else if (match.text.match(/^\(.*\d{4}.*\)/)) {
        apaCount++;
      }

      const absoluteFrom = pos + 1 + match.start;
      const absoluteTo = pos + 1 + match.end;

      let alreadyCited = false;
      doc.nodesBetween(absoluteFrom, absoluteTo, (n) => {
        if (n.type.name === "citation") alreadyCited = true;
      });

      if (!alreadyCited) {
        citations.push({
          from: absoluteFrom,
          to: absoluteTo,
          text: match.text,
        });
      }
    });

    return false;
  });

  if (citations.length === 0)
    return { stats: { ieee: ieeeCount, apa: apaCount } };

  // Get all existing registry entries for smart matching
  const allRegistryEntries = CitationRegistryService.getAllCitations();

  // Process each citation (in reverse to preserve positions)
  for (const citation of citations.reverse()) {
    try {
      let entry: any;

      // SMART MATCH: Try to find an existing bibliography registry entry first
      const matched = findRegistryMatchForInText(
        citation.text,
        allRegistryEntries,
      );
      if (matched) {
        console.log(
          `🔗 Matched "${citation.text}" → bibliography entry ${matched.ref_key}`,
        );
        entry = matched;
      } else {
        // Create new entry only if no match found
        entry = await CitationRegistryService.registerCitation(
          projectId,
          citation.text,
        );
      }

      // Replace text with citation node
      const tr = editor.state.tr;
      tr.replaceWith(
        citation.from,
        citation.to,
        editor.state.schema.nodes.citation.create({
          citationId: entry.ref_key,
          status: entry.metadata?.verified ? "verified" : "resolved",
        }),
      );
      tr.setMeta("normalization", true);
      try {
        if (editor.view && editor.view.dom) editor.view.dispatch(tr);
      } catch (e) {}
    } catch (error) {
      console.error("Failed to normalize citation:", citation.text, error);
    }
  }

  console.log(
    `✅ Normalized ${citations.length} citations with bibliography matching.`,
  );
  return { stats: { ieee: ieeeCount, apa: apaCount } };
}

/**
 * Scans the "References" section and adds missing citations to the library.
 */
export async function scanAndIngestReferences(
  editor: Editor,
  projectId: string,
  existingCitations: any[],
  syncOnly: boolean = false,
): Promise<any[]> {
  if (!editor) return [];

  const newCitations: any[] = [];
  const existingIds = new Set(existingCitations.map((c) => c.id));
  const existingTitles = new Set(
    existingCitations.map((c) => c.title?.toLowerCase().slice(0, 30)),
  );

  const { CitationRegistryService } =
    await import("../../../services/CitationRegistryService");

<<<<<<< Updated upstream
  let inRefSection = false;
  const refLines: string[] = [];

  editor.state.doc.descendants((node) => {
    if (node.type.name === "heading") {
      const text = node.textContent.toLowerCase().trim().replace(/[:.]$/, "");
      if (
        text === "references" ||
        text === "works cited" ||
        text === "bibliography" ||
        text === "reference list"
      ) {
        inRefSection = true;
        return;
      } else {
        if (inRefSection) inRefSection = false;
      }
=======
    let inRefSection = false;
    const refLines: string[] = [];
    const headingsToConvert: Array<{ pos: number; nodeSize: number }> = [];

    editor.state.doc.descendants((node, pos) => {
        // Support both strict headings and plain paragraphs acting as headings
        if (node.type.name === 'heading' || node.type.name === 'paragraph') {
            const text = node.textContent.toLowerCase().trim().replace(/[:.]$/, '');
            // If it's a paragraph, it must be exactly these words with very little other text to be considered the header
            if (['references', 'works cited', 'bibliography', 'reference list', 'refrences'].includes(text)) {
                if (node.type.name === 'paragraph') {
                    headingsToConvert.push({ pos, nodeSize: node.nodeSize });
                }
                inRefSection = true;
                return;
            } else if (inRefSection && node.type.name === 'heading') {
                // Only new strict headings explicitly end the reference section.
                inRefSection = false;
            }
        }

        if (inRefSection && (node.type.name === 'paragraph' || node.type.name === 'listItem')) {
            const text = node.textContent.trim();
            if (text.length > 20) {
                refLines.push(text);
            }
        }
    });

    // --- SMART HEURISTIC FALLBACK: Scan from bottom-up if no heading found ---
    if (!inRefSection && refLines.length === 0) {
        let consecutiveCitations = 0;
        const heuristicLines: string[] = [];
        const allParagraphs: string[] = [];

        editor.state.doc.descendants((node) => {
            if (node.type.name === 'paragraph' || node.type.name === 'listItem') {
                allParagraphs.push(node.textContent.trim());
            }
        });

        for (let i = allParagraphs.length - 1; i >= 0; i--) {
            const p = allParagraphs[i];

            // Skip empty lines/paragraphs between citations so they don't break the consecutive chain
            if (!p.trim()) continue;

            const isCitation = isLikelyCitation(p);
            console.log(`[BibHeuristic Ingest] Evaluated (isCitation=${isCitation}, consecutive=${consecutiveCitations}):`, p.substring(0, 50));

            if (isCitation) {
                heuristicLines.push(p);
                consecutiveCitations++;
            } else if (consecutiveCitations > 0) {
                if (consecutiveCitations >= 2) {
                    console.log(`[BibHeuristic Ingest] Broke chain with ${consecutiveCitations} valid references.`);
                    break; // Found a solid block
                }
                // False alarm, reset
                console.log(`[BibHeuristic Ingest] False alarm chain broken at 1. Resetting.`);
                heuristicLines.length = 0;
                consecutiveCitations = 0;
            }
        }

        if (heuristicLines.length >= 2) {
            console.log(`[SmartScan] Recovered ${heuristicLines.length} references via bottom-up heuristics`);
            refLines.push(...heuristicLines.reverse());
        }
    }

    // Mutate paragraph headers into real headings so the UI looks correct
    if (headingsToConvert.length > 0) {
        const tr = editor.state.tr;
        const schema = editor.state.schema;
        // Iterate in reverse to avoid position shifts
        for (const { pos, nodeSize } of headingsToConvert.reverse()) {
            tr.setNodeMarkup(pos, schema.nodes.heading, { level: 1 });
        }
        tr.setMeta('normalization', true);
        editor.view.dispatch(tr);
    }

    // Process asynchronously outside of descendants loop
    for (const text of refLines) {
        // Simplified parsing for heuristic ingest without Normalizer
        // Fallback to minimal title/year extraction if possible, else skip
        const roughYearMatch = text.match(/\((\d{4})\)/);
        const roughTitleMatch = text.match(/\)\.\s*([^.]+)/);

        const record = {
            id: `manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: roughTitleMatch ? roughTitleMatch[1].trim() : text.substring(0, 50),
            authors: ["Unknown"],
            year: roughYearMatch ? parseInt(roughYearMatch[1]) : new Date().getFullYear(),
        };

        if (record) {
            const roughTitle = record.title?.toLowerCase().slice(0, 30);
            if (!existingIds.has(record.id) && (!roughTitle || !existingTitles.has(roughTitle))) {
                console.log("Found new reference to ingest:", record);

                const newCitation = {
                    title: record.title || "Unknown Title",
                    authors: record.authors,
                    year: record.year,
                    type: "journal-article",
                    source: "manual-ingest",
                    tags: ["auto-imported"]
                };

                try {
                    const entry = await CitationRegistryService.registerCitation(projectId, text, newCitation);
                    newCitations.push(newCitation);
                    existingIds.add(record.id);
                    if (roughTitle) existingTitles.add(roughTitle);
                } catch (err) {
                    console.error("Failed to sync reference", err);
                }
            } else {
                // Just register it in the session memory map if already exists
                await CitationRegistryService.registerCitation(projectId, text);
            }
        }
>>>>>>> Stashed changes
    }

    if (
      inRefSection &&
      (node.type.name === "paragraph" || node.type.name === "listItem")
    ) {
      const text = node.textContent.trim();
      if (text.length > 20) {
        refLines.push(text);
      }
    }
  });

  // Process asynchronously outside of descendants loop
  for (const text of refLines) {
    const record = CitationNormalizer.parseReference(text);

    if (record) {
      const roughTitle = record.title?.toLowerCase().slice(0, 30);
      if (
        !existingIds.has(record.id) &&
        (!roughTitle || !existingTitles.has(roughTitle))
      ) {
        console.log("Found new reference to ingest:", record);

        const newCitation = {
          title: record.title || "Unknown Title",
          authors: record.authors,
          year: record.year,
          type: "journal-article",
          source: "manual-ingest",
          tags: ["auto-imported"],
        };

        try {
          const entry = await CitationRegistryService.registerCitation(
            projectId,
            text,
            newCitation,
          );
          newCitations.push(newCitation);
          existingIds.add(record.id);
          if (roughTitle) existingTitles.add(roughTitle);
        } catch (err) {
          console.error("Failed to sync reference", err);
        }
      } else {
        // Just register it in the session memory map if already exists
        await CitationRegistryService.registerCitation(projectId, text);
      }
    }
  }

  return newCitations;
}

/**
 * Recovers registry entries from existing citation nodes in the document.
 * This is crucial when reloading a document where the registry might be empty but nodes persist.
 */
export async function synchronizeRegistryWithDocument(
  editor: Editor,
  projectId: string,
) {
  if (!editor || !editor.state) return;

  const { CitationRegistryService } =
    await import("../../../services/CitationRegistryService");
  let recoveredCount = 0;

  const nodesToHeal: {
    pos: number;
    citationId: string;
    text: string;
    attrs: any;
  }[] = [];
  const missingIdNodes: { pos: number; text: string; attrs: any }[] = [];

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "citation") {
      const { citationId } = node.attrs;

      if (citationId) {
        const entry = CitationRegistryService.getEntry(projectId, citationId);

        if (!entry) {
          // Node has an ID not in the registry — needs rehydration
          nodesToHeal.push({ pos, citationId, text: "", attrs: node.attrs });
        } else {
          // Logic to clear 'red' (invalid) status if now in registry
          if (
            node.attrs.status === "invalid" ||
            node.attrs.status === "unresolved"
          ) {
            editor.commands.command(({ tr }) => {
              tr.setMeta("normalization", true);
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                status: "resolved",
              });
              return true;
            });
          }
        }
      }
    }
  });

  // Process nodes that need healing (async)
  // Reverse order to avoid position shifting
  nodesToHeal.reverse();
  for (const item of nodesToHeal) {
    console.log(
      `[RegistryRecovery] Re-registering existing node ID: ${item.citationId} for "${item.text.substring(0, 20)}..."`,
    );
    // Here we use the backend to create if not exists
    const entry = await CitationRegistryService.registerCitation(
      projectId,
      item.text,
      {
        id: item.citationId, // prefer this ID
        url: item.attrs.url,
        title: item.attrs.sourceTitle,
      },
    );

    const statusToSet =
      item.attrs.status === "invalid" || item.attrs.status === "unresolved"
        ? "resolved"
        : item.attrs.status;

    const tr = editor.state.tr;
    tr.setNodeMarkup(item.pos, undefined, {
      ...item.attrs,
      status: statusToSet,
      citationId: entry.ref_key, // ensure it uses resolved backend key
    });
    tr.setMeta("normalization", true);
    try {
      if (editor.view && editor.view.dom) editor.view.dispatch(tr);
    } catch (e) {}
    recoveredCount++;
  }

  // Process nodes missing IDs
  missingIdNodes.reverse();
  for (const item of missingIdNodes) {
    console.log(
      `[RegistryHealing] Healing citation node with missing ID: "${item.text}"`,
    );
    const healedEntry = await CitationRegistryService.registerCitation(
      projectId,
      item.text,
    );

    const tr = editor.state.tr;
    tr.setNodeMarkup(item.pos, undefined, {
      ...item.attrs,
      citationId: healedEntry.ref_key,
      status: "resolved",
    });
    tr.setMeta("normalization", true);
    try {
      if (editor.view && editor.view.dom) editor.view.dispatch(tr);
    } catch (e) {}
    recoveredCount++;
  }

  if (recoveredCount > 0) {
    console.log(
      `[RegistryRecovery] Recovered ${recoveredCount} citations from document nodes.`,
    );
  }
}
/**
 * Detects the bibliography section and converts plain text entries into BibliographyEntry nodes.
 * Dispatches one transaction per replaced entry so positions never go stale.
 */
export async function detectAndNormalizeBibliography(
  editor: Editor,
  projectId: string,
) {
  if (!editor || !editor.isEditable) return;

  const { CitationRegistryService } =
    await import("../../../services/CitationRegistryService");

<<<<<<< Updated upstream
  /**
   * Scans the CURRENT editor state for un-normalized bibliography paragraphs.
   * Returns them in REVERSE order so replacing later positions first doesn't
   * invalidate the earlier ones.
   */
  const collectEntries = () => {
    const { doc, schema } = editor.state;
    let inRefSection = false;
    const entries: Array<{ pos: number; node: any; text: string }> = [];

    doc.descendants((node, pos) => {
      if (node.type.name === "heading") {
        const t = node.textContent.toLowerCase().trim().replace(/[:.]$/, "");
        if (
          [
            "references",
            "works cited",
            "bibliography",
            "reference list",
            "refrences",
          ].includes(t)
        ) {
          inRefSection = true;
          return; // descend into heading children
        } else if (inRefSection) {
          inRefSection = false;
=======
    /**
     * Scans the CURRENT editor state for un-normalized bibliography paragraphs.
     * Returns them in REVERSE order so replacing later positions first doesn't
     * invalidate the earlier ones.
     */
    const collectEntries = () => {
        const { doc, schema } = editor.state;
        let inRefSection = false;
        const entries: Array<{ pos: number; node: any; text: string }> = [];
        const headingsToConvert: Array<{ pos: number; nodeSize: number }> = [];

        doc.descendants((node, pos) => {
            // Support both strict headings and plain paragraphs acting as headings
            if (node.type.name === 'heading' || node.type.name === 'paragraph') {
                const t = node.textContent.toLowerCase().trim().replace(/[:.]$/, '');
                // If it's a paragraph, it must be exactly these words with very little other text to be considered the header
                if (['references', 'works cited', 'bibliography', 'reference list', 'refrences'].includes(t)) {
                    // Mark paragraph to be converted to heading
                    if (node.type.name === 'paragraph') {
                        headingsToConvert.push({ pos, nodeSize: node.nodeSize });
                    }
                    inRefSection = true;
                    return; // descend into heading children
                } else if (inRefSection && node.type.name === 'heading') {
                    // Only new strict headings explicitly end the reference section.
                    inRefSection = false;
                }
            }

            if (inRefSection && (node.type.name === 'paragraph' || node.type.name === 'listItem')) {
                // Check if children include a bibliographyEntry (shouldn't happen but guard anyway)
                let hasBibNode = false;
                node.descendants((child: any) => {
                    if (child.type.name === 'bibliographyEntry') hasBibNode = true;
                });
                if (hasBibNode) return false;

                const text = node.textContent.trim();
                if (text.length > 20) {
                    entries.push({ pos, node, text });
                }
                return false;
            }

            if (node.type.name === 'bibliographyEntry') return false; // already done
        });

        // --- SMART HEURISTIC FALLBACK ---
        if (!inRefSection && entries.length === 0) {
            let consecutiveCitations = 0;
            const heuristicEntries: Array<{ pos: number; node: any; text: string }> = [];
            const allParagraphs: Array<{ pos: number; node: any; text: string }> = [];

            doc.descendants((node, pos) => {
                if (node.type.name === 'paragraph' || node.type.name === 'listItem') {
                    allParagraphs.push({ pos, node, text: node.textContent.trim() });
                }
            });

            for (let i = allParagraphs.length - 1; i >= 0; i--) {
                const item = allParagraphs[i];

                // Skip empty lines/paragraphs between citations so they don't break the consecutive chain
                if (!item.text.trim()) continue;

                const isCitation = isLikelyCitation(item.text);
                console.log(`[BibHeuristic] Evaluated (isCitation=${isCitation}, consecutive=${consecutiveCitations}):`, item.text.substring(0, 50));

                if (isCitation) {
                    heuristicEntries.push(item);
                    consecutiveCitations++;
                } else if (consecutiveCitations > 0) {
                    if (consecutiveCitations >= 2) {
                        console.log(`[BibHeuristic] Broke chain with ${consecutiveCitations} valid references.`);
                        break;
                    }
                    // Reset if false alarm
                    console.log(`[BibHeuristic] False alarm chain broken at 1. Resetting.`);
                    heuristicEntries.length = 0;
                    consecutiveCitations = 0;
                }
            }

            if (heuristicEntries.length >= 2) {
                // heuristicEntries is collected bottom-up, reverse it before pushing 
                // because the outer return statement does an entries.reverse()
                entries.push(...heuristicEntries.reverse());
            }
        }

        // Mutate paragraph headers into real headings so the UI looks correct
        if (headingsToConvert.length > 0) {
            const tr = editor.state.tr;
            // Iterate in reverse to avoid position shifts
            for (const { pos, nodeSize } of headingsToConvert.reverse()) {
                tr.setNodeMarkup(pos, schema.nodes.heading, { level: 1 });
            }
            tr.setMeta('normalization', true);
            editor.view.dispatch(tr);
        }

        // Reverse so we replace from bottom to top (preserves positions)
        return entries.reverse();
    };

    const firstPass = collectEntries();
    if (firstPass.length === 0) {
        console.log('[BibNormalize] No plain-text bibliography entries found.');
        return;
    }

    let normalizedCount = 0;

    for (const item of firstPass) {
        try {
            // Get or create registry entry for this bibliography line
            const entry = await CitationRegistryService.registerCitation(projectId, item.text);

            // Re-find the node at this position in the CURRENT (possibly updated) state
            const currentDoc = editor.state.doc;
            const currentNode = currentDoc.nodeAt(item.pos);

            if (!currentNode) {
                console.warn('[BibNormalize] Node no longer at expected position, skipping:', item.pos);
                continue;
            }

            // Skip if it was already converted by a previous iteration
            if (currentNode.type.name === 'bibliographyEntry') continue;

            const schema = editor.state.schema;
            if (!schema.nodes.bibliographyEntry) {
                console.error('[BibNormalize] bibliographyEntry node type not found in schema');
                break;
            }

            const bibNode = schema.nodes.bibliographyEntry.create(
                {
                    citationId: entry.ref_key,
                    url: entry.url,
                    doi: entry.doi,
                    refText: item.text,
                },
                currentNode.content  // preserve original text content exactly
            );

            const tr = editor.state.tr;
            tr.replaceWith(item.pos, item.pos + currentNode.nodeSize, bibNode);
            tr.setMeta('normalization', true);
            editor.view.dispatch(tr);

            normalizedCount++;
        } catch (error) {
            console.error('[BibNormalize] Failed to convert entry:', item.text.substring(0, 40), error);
>>>>>>> Stashed changes
        }
      }

      if (
        inRefSection &&
        (node.type.name === "paragraph" || node.type.name === "listItem")
      ) {
        // Check if children include a bibliographyEntry (shouldn't happen but guard anyway)
        let hasBibNode = false;
        node.descendants((child: any) => {
          if (child.type.name === "bibliographyEntry") hasBibNode = true;
        });
        if (hasBibNode) return false;

        const text = node.textContent.trim();
        if (text.length > 20) {
          entries.push({ pos, node, text });
        }
        return false;
      }

      if (node.type.name === "bibliographyEntry") return false; // already done
    });

    // Reverse so we replace from bottom to top (preserves positions)
    return entries.reverse();
  };

  const firstPass = collectEntries();
  if (firstPass.length === 0) {
    console.log("[BibNormalize] No plain-text bibliography entries found.");
    return;
  }

  let normalizedCount = 0;

  for (const item of firstPass) {
    try {
      // Get or create registry entry for this bibliography line
      const entry = await CitationRegistryService.registerCitation(
        projectId,
        item.text,
      );

      // Re-find the node at this position in the CURRENT (possibly updated) state
      const currentDoc = editor.state.doc;
      const currentNode = currentDoc.nodeAt(item.pos);

      if (!currentNode) {
        console.warn(
          "[BibNormalize] Node no longer at expected position, skipping:",
          item.pos,
        );
        continue;
      }

      // Skip if it was already converted by a previous iteration
      if (currentNode.type.name === "bibliographyEntry") continue;

      const schema = editor.state.schema;
      if (!schema.nodes.bibliographyEntry) {
        console.error(
          "[BibNormalize] bibliographyEntry node type not found in schema",
        );
        break;
      }

      const bibNode = schema.nodes.bibliographyEntry.create(
        {
          citationId: entry.ref_key,
          url: entry.url,
          doi: entry.doi,
          refText: item.text,
        },
        currentNode.content, // preserve original text content exactly
      );

      const tr = editor.state.tr;
      tr.replaceWith(item.pos, item.pos + currentNode.nodeSize, bibNode);
      tr.setMeta("normalization", true);
      try {
        if (editor.view && editor.view.dom) editor.view.dispatch(tr);
      } catch (e) {}

      normalizedCount++;
    } catch (error) {
      console.error(
        "[BibNormalize] Failed to convert entry:",
        item.text.substring(0, 40),
        error,
      );
    }
  }

  console.log(
    `✅ [BibNormalize] Converted ${normalizedCount} bibliography entries to interactive nodes.`,
  );
}
