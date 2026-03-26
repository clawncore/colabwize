/* eslint-disable */
import { Editor } from "@tiptap/react";
import { extractPatterns } from "../../../services/citationAudit/patterns";

export interface CitationNormalizationStats {
  ieee: number;
  apa: number;
  mla: number;
  chicago: number;
}

export interface CitationNormalizationResult {
  stats: CitationNormalizationStats;
  replacements: number;
}

export interface BibliographyNormalizationResult {
  normalizedCount: number;
}

export function isLikelyCitation(text: string): boolean {
  const cleanText = text.trim();
  // Bibliography entries are generally dense and long.
  // Minimum 40 characters ensures we don't accidentally match tiny in-text pills or short sentences.
  if (cleanText.length < 40) return false;

  // FAST BAILOUT: If it doesn't contain a citation year pattern or typical citation characters, skip it
  if (
    !cleanText.includes("(") &&
    !cleanText.includes("[") &&
    !cleanText.match(/\d{4}/)
  ) {
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

  // Numbered list style: "1. Author" or "[1] Author"
  if (/^(?:\[\d+\]|\d+\.)\s/.test(cleanText)) return true;

  // APA/Harvard/Chicago style check:
  // Must be Author Name, Initials. (Year). or Author (Year)
  if (
    /^[A-Z][a-zÀ-ÿ-]+,\s*(?:[A-Z]\.\s*)+(?:(?:&|and)\s*[A-Z][a-zÀ-ÿ-]+,\s*(?:[A-Z]\.\s*)+)*\(\d{4}[a-z]?\)/.test(
      cleanText.substring(0, 100),
    ) ||
    /^[A-Z][a-zÀ-ÿ-]+.*?\(\d{4}\)/.test(cleanText.substring(0, 100)) ||
    /^[A-Z][a-zÀ-ÿ-]+.*?\([^0-9]+\)/.test(cleanText.substring(0, 100))
  )
    return true;

  // Looser APA fallback: Author Last Name (Year) IF there are multiple bibliographic indicators
  // but avoid matching normal English sentences like "Since the discovery (2010)"
  if (/^[A-Z][a-zÀ-ÿ-]+.*?\(\d{4}\)/.test(cleanText.substring(0, 100))) {
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
      "o",
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
    const surname = authorPart
      .split(/\s+/)[0]
      .replace(/[.,]/g, "")
      .toLowerCase();

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
      const yearMatch =
        entryYear === year ||
        raw.includes(`(${year})`) ||
        raw.includes(` ${year}`) ||
        raw.endsWith(year);
      if (!yearMatch) return false;

      // Check author surname
      const authorMatch =
        raw.includes(author) ||
        entryTitle.includes(author) ||
        (entry.authors &&
          entry.authors.some((a: string) => a.toLowerCase().includes(author)));

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
): Promise<CitationNormalizationResult> {
  if (!editor || !editor.isEditable)
    return {
      stats: { ieee: 0, apa: 0, mla: 0, chicago: 0 },
      replacements: 0,
    };

  const { CitationRegistryService } =
    await import("../../../services/CitationRegistryService");
  CitationRegistryService.loadRegistry(projectId, availableCitations);

  // --- Phase 1: Collect unique citation texts (Allows document positions to shift while we wait) ---
  const uniqueCitationTexts = new Set<string>();
  let stopScanningPhase1 = false;
  editor.state.doc.descendants((node) => {
    if (stopScanningPhase1) return false;

    if (node.type.name === "heading" || node.type.name === "paragraph" || node.type.name === "bibliographyEntry") {
      const text = node.textContent.toLowerCase().trim();
      const isRefBoundary = 
        node.type.name === "bibliographyEntry" || 
        /references|bibliography|works cited|reference list/i.test(text);

      if (isRefBoundary) {
        stopScanningPhase1 = true;
        return false;
      }
    }

    if (node.isText) {
      if (!node.text) return true;
      if (!node.text.includes("(") && !node.text.includes("[")) return true;

      // SKIP leading IEEE markers in scan phase as well
      const cleanText = node.text.trim();
      if (/^\[\d+\]/.test(cleanText)) return true;

      const matches = extractPatterns(node.text, 0, "structural");
      matches.forEach((match) => uniqueCitationTexts.add(match.text));
    }
    return true;
  });

  if (uniqueCitationTexts.size === 0)
    return {
      stats: { ieee: 0, apa: 0, mla: 0, chicago: 0 },
      replacements: 0,
    };

  // --- Phase 2: Async Resolution. User can continue typing during this await. ---
  const allRegistryEntries = CitationRegistryService.getAllCitations();
  const registrationMap = new Map<string, any>();
  for (const text of uniqueCitationTexts) {
    const matched = findRegistryMatchForInText(text, allRegistryEntries);
    if (matched) {
      registrationMap.set(text, matched);
    } else {
      try {
        const entry = await CitationRegistryService.registerCitation(
          projectId,
          text,
        );
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
  let mlaCount = 0;
  let chicagoCount = 0;

  const currentDoc = editor.state.doc;
  const citationsToReplace: Array<{ from: number; to: number; text: string }> =
    [];

  let stopScanningPhase3 = false;
  currentDoc.descendants((node, pos) => {
    if (stopScanningPhase3) return false;

    if (node.type.name === "heading" || node.type.name === "paragraph" || node.type.name === "bibliographyEntry") {
      const text = node.textContent.toLowerCase().trim();
      const isRefBoundary = 
        node.type.name === "bibliographyEntry" || 
        /references|bibliography|works cited|reference list/i.test(text);

      if (isRefBoundary) {
        stopScanningPhase3 = true;
        return false;
      }
    }

    if (node.isText) {
      if (!node.text) return true;
      if (!node.text.includes("(") && !node.text.includes("[")) return true;

      // CRITICAL: Skip leading IEEE markers like [1] at the start of a paragraph
      // These are reference definitions, not in-text citations.
      const isParaStart = pos === 0 || currentDoc.resolve(pos).parentOffset === 0;
      const text = node.text;
      
      const matches = extractPatterns(text, 0, "structural");
      matches.forEach((match) => {
        // Special Case: If it's the very first thing in the paragraph and matches [1], skip it
        if (isParaStart && match.start === 0 && match.text.match(/^\[\d+\]/)) return;

        if (match.text.match(/^\[\d+(?:-\d+)?\]/)) ieeeCount++;
        else if (match.text.match(/^\(.*\d{4}[a-z]?.*\)/)) {
          if (match.text.includes(",")) apaCount++;
          else chicagoCount++;
        } else if (match.text.match(/^\([^0-9]+\)$/)) mlaCount++;

        const absoluteFrom = pos + match.start;
        const absoluteTo = pos + match.end;

        let alreadyCited = false;
        currentDoc.nodesBetween(absoluteFrom, absoluteTo, (n) => {
          if (n.type.name === "citation") alreadyCited = true;
        });

        // Prevent duplicate matching if multiple regex patterns caught the exact same string
        const isOverlapping = citationsToReplace.some(
          (c) => Math.max(absoluteFrom, c.from) < Math.min(absoluteTo, c.to),
        );

        if (
          !alreadyCited &&
          !isOverlapping &&
          registrationMap.has(match.text)
        ) {
          citationsToReplace.push({
            from: absoluteFrom,
            to: absoluteTo,
            text: match.text,
          });
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
        console.log(
          `✅ Atomic Normalization: ${citationsToReplace.length} items.`,
        );
      }
    } catch (e) {
      console.error("Atomic transaction failed", e);
    }
  }

  return {
    stats: {
      ieee: ieeeCount,
      apa: apaCount,
      mla: mlaCount,
      chicago: chicagoCount,
    },
    replacements: citationsToReplace.length,
  };
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
    // Better metadata detection for manual ingest (IEEE and APA)
    // IEEE: [1] Author, "Title", Journal, Year.
    // APA: Author, A. A. (Year). Title. Journal.
    const ieeeMatch = text.match(/^\[\d+\]\s+([^,"]+)/);
    const apaMatch = text.match(/^([A-Z][a-zÀ-ÿ-]+(?:,\s*[A-Z]\.)*)/);

    const authorMatch = ieeeMatch || apaMatch;
    const roughYearMatch =
      text.match(/\((\d{4}[a-z]?)\)/) ||
      text.match(/,\s*(\d{4})\./) ||
      text.match(/\s(\d{4})$/);
    const roughTitleMatch =
      text.match(/"([^"]+)"/) ||
      text.match(/\)\.\s*(.+?)(?=\.\s*[A-Z]|\.\s*https?|$)/);

    const record = {
      id: `manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: roughTitleMatch
        ? (roughTitleMatch[1] || roughTitleMatch[0]).trim().replace(/\.$/, "")
        : text.substring(0, 50),
      authors: authorMatch ? [authorMatch[1].trim()] : ["Unknown"],
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
      } catch (err) {}
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

  // --- Phase 1: Collect un-normalized bibliography paragraphs asynchronously ---
  // Returns them in REVERSE order so replacing later positions first doesn't invalidate earlier ones.
  const collectEntries = () => {
    const { doc } = editor.state;
    let inRefSection = false;
    const entries: Array<{ pos: number; node: any; text: string }> = [];
    const allParagraphs: Array<{ pos: number; node: any; text: string }> = [];

    doc.descendants((node, pos) => {
      if (node.type.name === "heading" || node.type.name === "paragraph") {
        const t = node.textContent.toLowerCase().trim();
        if (/references|bibliography|works cited|reference list/i.test(t)) {
          inRefSection = true;
          return;
        } else if (inRefSection && node.type.name === "heading") {
          inRefSection = false;
        }
      }

      const isTextNode =
        node.type.name === "paragraph" || node.type.name === "listItem";
      if (isTextNode) {
        allParagraphs.push({ pos, node, text: node.textContent.trim() });
      }

      if (inRefSection && isTextNode) {
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
      if (node.type.name === "bibliographyEntry") return false;
    });

    // Smart heuristic fallback if no specific heading was found
    if (!inRefSection && entries.length === 0) {
      let consecutiveCitations = 0;
      const heuristicEntries: Array<{ pos: number; node: any; text: string }> =
        [];

      // Scan bottom-up
      for (let i = allParagraphs.length - 1; i >= 0; i--) {
        const p = allParagraphs[i];
        if (!p.text) continue;

        if (isLikelyCitation(p.text)) {
          heuristicEntries.push(p);
          consecutiveCitations++;
        } else if (consecutiveCitations > 0) {
          if (consecutiveCitations >= 2) break; // Found a block of at least 2 citations
          heuristicEntries.length = 0;
          consecutiveCitations = 0;
        }
      }

      if (heuristicEntries.length >= 2) {
        // Reverse them back since we collected bottom-up, but we want the outer return to also reverse it correctly.
        // Wait, the outer return reverses it. So if we just push them in normal order, it gets reversed below.
        entries.push(...heuristicEntries.reverse());
      }
    }

    return entries.reverse();
  };

  const firstPass = collectEntries();
  if (firstPass.length === 0) {
    console.log("[BibNormalize] No plain-text bibliography entries found.");
    return;
  }

  // --- Phase 2: Async Resolution and Replacement per Node ---
  let normalizedCount = 0;

  for (const item of firstPass) {
    try {
      let instUrl: string | null = null;
      let instDoi: string | null = null;

      // Instantly extract URL/DOI from raw text to avoid blocking UI
      // Robust URL extraction that allows parentheses but strips trailing non-url punctuation
      const urlRegex = /(https?:\/\/[^\s>\]]+)/;
      const urlMatch = item.text.match(urlRegex);
      if (urlMatch) {
        let url = urlMatch[0];
        url = url.replace(/[.,;:!?]+$/, "");

        // Handle balanced parentheses
        if (url.endsWith(")")) {
          const openCount = (url.match(/\(/g) || []).length;
          const closeCount = (url.match(/\)/g) || []).length;
          if (closeCount > openCount) {
            url = url.substring(0, url.length - (closeCount - openCount));
          }
        }
        instUrl = url;
      }

      const doiMatch = item.text.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
      if (doiMatch) {
        instDoi = doiMatch[0];
        if (!instUrl) instUrl = `https://doi.org/${instDoi}`;
      }

      // Re-fetch the current node at the expected position to guarantee freshness
      const currentDoc = editor.state.doc;
      const currentNode = currentDoc.nodeAt(item.pos);

      if (!currentNode) continue; // node moved or deleted while awaiting
      if (currentNode.type.name === "bibliographyEntry") continue; // already converted

      const schema = editor.state.schema;
      if (!schema.nodes.bibliographyEntry) break;

      const childNodes: any[] = [];
      currentNode.content.forEach((n: any) => childNodes.push(n));

      // Append clickable link if URL/DOI exists and is not already visibly printed in the text
      const entryUrl =
        instUrl || (instDoi ? `https://doi.org/${instDoi}` : null);
      if (entryUrl && !item.text.includes("http")) {
        childNodes.push(schema.text(" "));
        const linkMarks = schema.marks.link
          ? [schema.marks.link.create({ href: entryUrl, target: "_blank" })]
          : undefined;
        childNodes.push(schema.text(entryUrl, linkMarks));
      }

      // First try to find if we already know the real UUID for this text
      const allCitations = CitationRegistryService.getAllCitations();
      let matched = allCitations.find(
        (c) => c.raw_reference_text === item.text,
      );
      if (!matched) {
        matched = CitationRegistryService.registerTempCitation(item.text);
      }
      const tempCitationId = matched.ref_key || (matched as any).id;

      const bibNode = schema.nodes.bibliographyEntry.create(
        {
          citationId: tempCitationId,
          url: instUrl,
          doi: instDoi,
          refText: item.text,
        },
        childNodes,
      );

      const tr = editor.state.tr;
      tr.replaceWith(item.pos, item.pos + currentNode.nodeSize, bibNode);
      tr.setMeta("normalization", true);
      tr.setMeta("addToHistory", false);

      if (editor.view && editor.view.dom) {
        editor.view.dispatch(tr);
        normalizedCount++;
      }
    } catch (err) {
      console.error("[BibNormalize] Error normalizing entry:", err);
    }
  }

  if (normalizedCount > 0) {
    console.log(`✅ Normalized ${normalizedCount} bibliography entries.`);
  }
}
