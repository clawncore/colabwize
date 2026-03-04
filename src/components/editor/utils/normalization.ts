import { Editor } from "@tiptap/react";
import { CitationService } from "../../../services/citationService";
import { extractPatterns } from "../../../services/citationAudit/patterns";

export function isLikelyCitation(text: string): boolean {
  const cleanText = text.trim();
  // Bibliography entries are generally dense and long.
  // Minimum 40 characters ensures we don't accidentally match tiny in-text pills or short sentences.
  if (cleanText.length < 40) return false;

  // FAST BAILOUT: If it doesn't contain a citation year pattern or typical citation characters, skip it
  if (!cleanText.includes("(") && !cleanText.includes("[") && !cleanText.match(/\d{4}/)) {
    return false;
  }

  // Explicitly reject single sentences that just happen to contain an in-text citation at the end.
  // e.g., "This is a test sentence (Smith, 2021)."
  if (cleanText.split(".").length <= 2 && cleanText.endsWith(".")) {
    // Look for typical sentence starts. Bibliography chunks don't look like generic sentences.
    if (
      cleanText.includes("This") ||
      cleanText.includes("The") ||
      cleanText.includes("In ")
    ) {
      return false; // Heuristic bailout
    }
  }

  // IEEE style check: starts with [1]
  if (/^\[\d+\]\s/.test(cleanText)) return true;

  // APA/Harvard style check:
  // Must be Author Name, Initials. (Year).
  // e.g. Smith, J. (2020)
  if (
    /^[A-Z][a-zÀ-ÿ\-]+,\s*(?:[A-Z]\.\s*)+(?:(?:&|and)\s*[A-Z][a-zÀ-ÿ\-]+,\s*(?:[A-Z]\.\s*)+)*\(\d{4}[a-z]?\)/.test(
      cleanText.substring(0, 100),
    )
  )
    return true;

  // Looser APA fallback: Author Last Name (Year) IF there are multiple bibliographic indicators
  // but avoid matching normal English sentences like "Since the discovery (2010)"
  if (/^[A-Z][a-zÀ-ÿ\-]+.*?\(\d{4}\)/.test(cleanText.substring(0, 100))) {
    // If it starts with a common English word, it's a sentence, not an author name.
    const firstWord = cleanText.split(" ")[0].toLowerCase();
    const commonWords = [
      "the",
      "this",
      "in",
      "a",
      "an",
      "to",
      "for",
      "it",
      "since",
      "as",
      "when",
    ];
    if (
      (!commonWords.includes(firstWord) && cleanText.includes("vol")) ||
      cleanText.includes("journal") ||
      cleanText.includes("doi")
    ) {
      return true;
    }
  }

  // Fallback keyword clustering check (dense academic identifiers)
  const keywords = [
    "doi.org",
    "et al.",
    "vol.",
    "journal",
    "http",
    "pp.",
    "press",
    "pmid",
  ];
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
  const clean = text.trim();

  // Regex to find a 4-digit year near the end of a parenthesized or bracketed string
  // Handles: (Smith, 2023), (Smith 2023), (Smith et al., 2023), [Smith, 2023]
  const match = clean.match(/[([](.*)[,\s]+(\d{4})[a-z]?\s*[)\]]$/);

  if (match) {
    const authorPart = match[1].trim();
    const year = match[2];

    // Extract first logical word of author part (handle "Smith et al" -> "Smith")
    const surname = authorPart.split(/\s+/)[0].replace(/[.,]/g, "").toLowerCase();

    // Basic validation to avoid false positives (e.g. just a date range)
    if (surname.length >= 2 && isNaN(Number(surname))) {
      return { author: surname, year };
    }
  }
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
      const raw = (entry.raw_reference_text || "").toLowerCase();
      const entryYear = String(entry.year || "");
      const entryTitle = (entry.sourceTitle || entry.title || "").toLowerCase();

      // Check year first
      const yearMatch = entryYear === year || raw.includes(`(${year})`) || raw.includes(` ${year}`) || raw.endsWith(year);
      if (!yearMatch) return false;

      // Check author surname
      const authorMatch =
        raw.includes(author) ||
        entryTitle.includes(author) ||
        (entry.authors && entry.authors.some((a: string) => a.toLowerCase().includes(author)));

      return authorMatch;
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

  const { CitationRegistryService } = await import("../../../services/CitationRegistryService");
  CitationRegistryService.loadRegistry(projectId, availableCitations);
  await scanAndIngestReferences(editor, projectId, availableCitations, true);

  // --- Phase 1: Collect unique citation texts (Allows document positions to shift while we wait) ---
  const uniqueCitationTexts = new Set<string>();
  let stopScanningPhase1 = false;
  editor.state.doc.descendants((node) => {
    if (stopScanningPhase1) return false;

    if (node.type.name === "heading" || node.type.name === "bibliographyEntry") {
      const text = node.textContent.toLowerCase().trim();
      if (
        node.type.name === "bibliographyEntry" ||
        ["references", "works cited", "bibliography", "reference list"].includes(text)
      ) {
        stopScanningPhase1 = true;
        return false;
      }
    }

    if (node.isText) {
      if (!node.text) return true;
      if (!node.text.includes("(") && !node.text.includes("[")) return true;

      const matches = extractPatterns(node.text, 0, "structural");
      matches.forEach((match) => uniqueCitationTexts.add(match.text));
    }
    return true;
  });

  if (uniqueCitationTexts.size === 0) return { stats: { ieee: 0, apa: 0 } };

  // --- Phase 2: Async Resolution. User can continue typing during this await. ---
  const allRegistryEntries = CitationRegistryService.getAllCitations();
  const registrationMap = new Map<string, any>();
  for (const text of uniqueCitationTexts) {
    const matched = findRegistryMatchForInText(text, allRegistryEntries);
    if (matched) {
      registrationMap.set(text, matched);
    } else {
      try {
        const entry = await CitationRegistryService.registerCitation(projectId, text);
        registrationMap.set(text, entry);
      } catch (err) {
        console.error(`Failed to register: ${text}`, err);
      }
    }
  }

  // --- Phase 3: Synchronous Document Scan & Transaction (NO AWAITS HERE) ---
  // Re-scan from the *freshest* state to get perfectly accurate positions that haven't shifted.
  let ieeeCount = 0;
  let apaCount = 0;
  const currentDoc = editor.state.doc;
  const citationsToReplace: Array<{ from: number; to: number; text: string }> = [];

  let stopScanningPhase3 = false;
  currentDoc.descendants((node, pos) => {
    if (stopScanningPhase3) return false;

    if (node.type.name === "heading" || node.type.name === "bibliographyEntry") {
      const text = node.textContent.toLowerCase().trim();
      if (
        node.type.name === "bibliographyEntry" ||
        ["references", "works cited", "bibliography", "reference list"].includes(text)
      ) {
        stopScanningPhase3 = true;
        return false;
      }
    }

    if (node.isText) {
      if (!node.text) return true;
      if (!node.text.includes("(") && !node.text.includes("[")) return true;

      const matches = extractPatterns(node.text, 0, "structural");
      matches.forEach((match) => {
        if (match.text.match(/^\[\d+(?:-\d+)?\]/)) ieeeCount++;
        else if (match.text.match(/^\(.*\d{4}.*\)/)) apaCount++;

        const absoluteFrom = pos + match.start;
        const absoluteTo = pos + match.end;

        let alreadyCited = false;
        currentDoc.nodesBetween(absoluteFrom, absoluteTo, (n) => {
          if (n.type.name === "citation") alreadyCited = true;
        });

        // Prevent duplicate matching if multiple regex patterns caught the exact same string
        const isOverlapping = citationsToReplace.some(c =>
          Math.max(absoluteFrom, c.from) < Math.min(absoluteTo, c.to)
        );

        if (!alreadyCited && !isOverlapping && registrationMap.has(match.text)) {
          citationsToReplace.push({ from: absoluteFrom, to: absoluteTo, text: match.text });
        }
      });
    }
    return true;
  });

  const tr = editor.state.tr;
  let hasChanges = false;
  for (const citation of citationsToReplace.reverse()) {
    const entry = registrationMap.get(citation.text);
    if (!entry) continue;

    tr.replaceWith(
      citation.from,
      citation.to,
      editor.state.schema.nodes.citation.create({
        citationId: entry.ref_key || entry.id,
        status: "resolved",
        text: citation.text,
      }),
    );
    hasChanges = true;
  }

  if (hasChanges) {
    tr.setMeta("normalization", true);
    try {
      if (editor.view && editor.view.dom) {
        editor.view.dispatch(tr);
        console.log(`✅ Atomic Normalization: ${citationsToReplace.length} items.`);
      }
    } catch (e) {
      console.error("Atomic transaction failed", e);
    }
  }

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

  let inRefSection = false;
  const refLines: string[] = [];
  const headingsToConvert: Array<{ pos: number; nodeSize: number }> = [];

  editor.state.doc.descendants((node, pos) => {
    // Support both strict headings and plain paragraphs acting as headings
    if (node.type.name === "heading" || node.type.name === "paragraph") {
      const text = node.textContent.toLowerCase().trim().replace(/[:.]$/, "");
      if (
        [
          "references",
          "works cited",
          "bibliography",
          "reference list",
          "refrences",
        ].includes(text)
      ) {
        if (node.type.name === "paragraph") {
          headingsToConvert.push({ pos, nodeSize: node.nodeSize });
        }
        inRefSection = true;
        return;
      } else if (inRefSection && node.type.name === "heading") {
        inRefSection = false;
      }
    }

    if (
      inRefSection &&
      (node.type.name === "paragraph" || node.type.name === "listItem")
    ) {
      const text = node.textContent.trim();
      if (text.length > 20) refLines.push(text);
    }
  });

  // --- SMART HEURISTIC FALLBACK: Scan from bottom-up if no heading found ---
  if (!inRefSection && refLines.length === 0) {
    let consecutiveCitations = 0;
    const heuristicLines: string[] = [];
    const allParagraphs: string[] = [];

    editor.state.doc.descendants((node) => {
      if (node.type.name === "paragraph" || node.type.name === "listItem") {
        allParagraphs.push(node.textContent.trim());
      }
    });

    for (let i = allParagraphs.length - 1; i >= 0; i--) {
      const p = allParagraphs[i];
      if (!p.trim()) continue;

      if (isLikelyCitation(p)) {
        heuristicLines.push(p);
        consecutiveCitations++;
      } else if (consecutiveCitations > 0) {
        if (consecutiveCitations >= 2) break;
        heuristicLines.length = 0;
        consecutiveCitations = 0;
      }
    }
    if (heuristicLines.length >= 2) refLines.push(...heuristicLines.reverse());
  }

  // Removed headingsToConvert logic to prevent automatic heading distortion

  for (const text of refLines) {
    const roughYearMatch = text.match(/\((\d{4})\)/);
    const roughTitleMatch = text.match(/\)\.\s*([^.]+)/);

    const record = {
      id: `manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: roughTitleMatch
        ? roughTitleMatch[1].trim()
        : text.substring(0, 50),
      authors: ["Unknown"],
      year: roughYearMatch
        ? parseInt(roughYearMatch[1], 10)
        : new Date().getFullYear(),
    };

    const roughTitle = record.title?.toLowerCase().slice(0, 30);
    if (
      !existingIds.has(record.id) &&
      (!roughTitle || !existingTitles.has(roughTitle))
    ) {
      const newCitation = {
        title: record.title || "Unknown Title",
        authors: record.authors,
        year: record.year,
        type: "journal-article",
        source: "manual-ingest",
        tags: ["auto-imported"],
      };

      try {
        await CitationRegistryService.registerCitation(
          projectId,
          text,
          newCitation,
        );
        newCitations.push(newCitation);
        existingIds.add(record.id);
        if (roughTitle) existingTitles.add(roughTitle);
      } catch (err) { }
    } else {
      await CitationRegistryService.registerCitation(projectId, text);
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
    } catch (e) { }
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
    } catch (e) { }
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

  // --- Phase 1: Collect unique bibliography entry texts asynchronously ---
  const collectEntriesText = () => {
    const { doc } = editor.state;
    let inRefSection = false;
    const texts = new Set<string>();

    doc.descendants((node) => {
      // Support both strict headings and plain paragraphs acting as headings
      if (node.type.name === "heading" || node.type.name === "paragraph") {
        const t = node.textContent.toLowerCase().trim().replace(/[:.]$/, "");
        if (["references", "works cited", "bibliography", "reference list", "refrences"].includes(t)) {
          inRefSection = true;
          return;
        } else if (inRefSection && node.type.name === "heading") {
          inRefSection = false;
        }
      }

      if (inRefSection && (node.type.name === "paragraph" || node.type.name === "listItem")) {
        let hasBibNode = false;
        node.descendants((child: any) => {
          if (child.type.name === "bibliographyEntry") hasBibNode = true;
        });
        if (hasBibNode) return false;

        const text = node.textContent.trim();
        if (text.length > 20) {
          texts.add(text);
        }
        return false;
      }

      if (node.type.name === "bibliographyEntry") return false;
    });

    // Heuristics were stripped out to prevent corrupting regular paragraphs into bibliography formatting
    return Array.from(texts);
  };

  const textsToRegister = collectEntriesText();
  if (textsToRegister.length === 0) {
    console.log("[BibNormalize] No plain-text bibliography entries found.");
    return;
  }

  // --- Phase 2: Async Resolution. User can type during this phase. ---
  const registrationMap = new Map<string, any>();
  for (const text of textsToRegister) {
    try {
      const entry = await CitationRegistryService.registerCitation(projectId, text);
      registrationMap.set(text, entry);
    } catch (error) {
      console.error("[BibNormalize] Failed to register:", text.substring(0, 40));
    }
  }

  // --- Phase 3: Synchronous Prosemirror Document Parsing & Tr Replacement ---
  let normalizedCount = 0;
  const currentDoc = editor.state.doc;
  const schema = editor.state.schema;

  if (!schema.nodes.bibliographyEntry) {
    console.error("[BibNormalize] bibliographyEntry node type not found in schema");
    return;
  }

  const entriesToReplace: Array<{ pos: number; nodeSize: number; nodeContent: any; entry: any; text: string }> = [];
  let inRefSectionSync = false;

  currentDoc.descendants((node, pos) => {
    if (node.type.name === "heading" || node.type.name === "paragraph") {
      const t = node.textContent.toLowerCase().trim().replace(/[:.]$/, "");
      if (["references", "works cited", "bibliography", "reference list", "refrences"].includes(t)) {
        inRefSectionSync = true;
        return;
      } else if (inRefSectionSync && node.type.name === "heading") {
        inRefSectionSync = false;
      }
    }

    if (inRefSectionSync && (node.type.name === "paragraph" || node.type.name === "listItem")) {
      let hasBibNode = false;
      node.descendants((child: any) => {
        if (child.type.name === "bibliographyEntry") hasBibNode = true;
      });
      if (hasBibNode) return false;

      const text = node.textContent.trim();
      const entry = registrationMap.get(text);
      if (text.length > 20 && entry) {
        entriesToReplace.push({ pos, nodeSize: node.nodeSize, nodeContent: node.content, entry, text });
      }
      return false;
    }
    if (node.type.name === "bibliographyEntry") return false;
  });

  // Aggressive heuristic fallback was removed from here because it caused regular
  // paragraphs containing citations to be transformed into bold bibliography headings.

  if (entriesToReplace.length === 0) return;

  const tr = editor.state.tr;

  for (const item of entriesToReplace.reverse()) {
    const childNodes: any[] = [];
    item.nodeContent.forEach((n: any) => childNodes.push(n));

    const entryUrl = item.entry.url || (item.entry.doi ? `https://doi.org/${item.entry.doi}` : null);
    if (entryUrl && !item.text.includes("http")) {
      childNodes.push(schema.text(" "));

      const linkMarks = schema.marks.link ? [schema.marks.link.create({ href: entryUrl, target: '_blank' })] : undefined;
      childNodes.push(schema.text(entryUrl, linkMarks));
    }

    const bibNode = schema.nodes.bibliographyEntry.create(
      {
        citationId: item.entry.ref_key || item.entry.id,
        url: entryUrl,
        doi: item.entry.doi,
        refText: item.text,
      },
      childNodes
    );

    tr.replaceWith(item.pos, item.pos + item.nodeSize, bibNode);
    normalizedCount++;
  }

  if (normalizedCount > 0) {
    tr.setMeta("normalization", true);
    try {
      if (editor.view && editor.view.dom) {
        editor.view.dispatch(tr);
        console.log(`✅ [BibNormalize] Converted ${normalizedCount} bibliography entries.`);
      }
    } catch (e) {
      console.error("[BibNormalize] Transaction failed", e);
    }
  }
}
