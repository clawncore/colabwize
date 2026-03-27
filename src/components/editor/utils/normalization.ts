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
  if (cleanText.length < 40) return false;
  if (!cleanText.includes("(") && !cleanText.includes("[") && !cleanText.match(/\d{4}/)) return false;

  if (/^(?:\[\d+\]|\d+\.)\s/.test(cleanText)) return true;

  if (
    /^[A-Z][a-zÀ-ÿ-]+,\s*(?:[A-Z]\.\s*)+(?:(?:&|and)\s*[A-Z][a-zÀ-ÿ-]+,\s*(?:[A-Z]\.\s*)+)*\(\d{4}[a-z]?\)/.test(cleanText.substring(0, 100)) ||
    /^[A-Z][a-zÀ-ÿ-]+.*?\(\d{4}\)/.test(cleanText.substring(0, 100)) ||
    /^[A-Z][a-zÀ-ÿ-]+.*?\([^0-9]+\)/.test(cleanText.substring(0, 100))
  ) return true;

  const keywords = ["doi.org", "et al.", "vol.", "journal", "http", "pp.", "press", "pmid"];
  let matches = 0;
  for (const kw of keywords) if (cleanText.toLowerCase().includes(kw)) matches++;
  return matches >= 2;
}

function parseInTextCitation(text: string): { author: string; year: string } | null {
  const clean = text.trim();
  const match = clean.match(/[([](.*)[,\s]+(\d{4})[a-z]?\s*[)\]]$/);
  if (match) {
    const authorPart = match[1].trim();
    const year = match[2];
    const surname = authorPart.split(/\s+/)[0].replace(/[.,]/g, "").toLowerCase();
    if (surname.length >= 2 && isNaN(Number(surname))) return { author: surname, year };
  }
  return null;
}

function findRegistryMatchForInText(inTextRaw: string, allEntries: any[]): any | null {
  const parsed = parseInTextCitation(inTextRaw.trim());
  if (!parsed) return null;
  const { author, year } = parsed;

  return allEntries.find((entry) => {
    const raw = (entry.raw_reference_text || "").toLowerCase();
    const entryYear = String(entry.year || "");
    const entryTitle = (entry.sourceTitle || entry.title || "").toLowerCase();
    const yearMatch = entryYear === year || raw.includes(`(${year})`) || raw.includes(` ${year}`) || raw.endsWith(year);
    if (!yearMatch) return false;
    const authorMatch = raw.includes(author) || entryTitle.includes(author) || (entry.authors && entry.authors.some((a: string) => a.toLowerCase().includes(author)));
    return authorMatch;
  }) || null;
}

export async function detectAndNormalizeCitations(
  editor: Editor,
  projectId: string,
  availableCitations: any[] = [],
): Promise<CitationNormalizationResult> {
  if (!editor || !editor.isEditable) return { stats: { ieee: 0, apa: 0, mla: 0, chicago: 0 }, replacements: 0 };

  const { CitationRegistryService } = await import("../../../services/CitationRegistryService");
  CitationRegistryService.loadRegistry(projectId, availableCitations);

  const uniqueCitationTexts = new Set<string>();
  let stopScanningPhase1 = false;
  editor.state.doc.descendants((node) => {
    if (stopScanningPhase1) return false;
    if (node.type.name === "heading" || node.type.name === "paragraph" || node.type.name === "bibliographyEntry") {
      const text = node.textContent.toLowerCase().trim();
      if (/references|bibliography|works cited|reference list/i.test(text)) { stopScanningPhase1 = true; return false; }
    }
    if (node.isText) {
      if (!node.text || (!node.text.includes("(") && !node.text.includes("["))) return true;
      if (/^\[\d+\]/.test(node.text.trim())) return true;
      const matches = extractPatterns(node.text, 0, "structural");
      matches.forEach((match) => uniqueCitationTexts.add(match.text));
    }
    return true;
  });

  if (uniqueCitationTexts.size === 0) return { stats: { ieee: 0, apa: 0, mla: 0, chicago: 0 }, replacements: 0 };

  const allRegistryEntries = CitationRegistryService.getAllCitations();
  const registrationMap = new Map<string, any>();
  for (const text of uniqueCitationTexts) {
    const matched = findRegistryMatchForInText(text, allRegistryEntries);
    if (matched) registrationMap.set(text, matched);
    else {
      try {
        const entry = await CitationRegistryService.registerCitation(projectId, text);
        registrationMap.set(text, entry);
      } catch (err) { console.error(`Failed to register: ${text}`, err); }
    }
  }

  let ieeeCount = 0, apaCount = 0, mlaCount = 0, chicagoCount = 0;
  const currentDoc = editor.state.doc;
  const citationsToReplace: Array<{ from: number; to: number; text: string }> = [];

  let stopScanningPhase3 = false;
  currentDoc.descendants((node, pos) => {
    if (stopScanningPhase3) return false;
    if (node.type.name === "heading" || node.type.name === "paragraph" || node.type.name === "bibliographyEntry") {
      if (/references|bibliography|works cited|reference list/i.test(node.textContent.toLowerCase().trim())) { stopScanningPhase3 = true; return false; }
    }
    if (node.isText) {
      if (!node.text || (!node.text.includes("(") && !node.text.includes("["))) return true;
      const isParaStart = pos === 0 || currentDoc.resolve(pos).parentOffset === 0;
      const matches = extractPatterns(node.text, 0, "structural");
      matches.forEach((match) => {
        if (isParaStart && match.start === 0 && match.text.match(/^\[\d+\]/)) return;
        
        // Secondary Safety Check
        const innerLower = match.text.replace(/[()\[\]]/g, "").trim().toLowerCase();
        const blacklist = ["prep", "art", "hiv", "aids", "u=u", "table", "figure", "fig."];
        if (blacklist.includes(innerLower) && !match.text.match(/\d{4}/)) return;

        if (match.text.match(/^\[\d+(?:-\d+)?\]/)) ieeeCount++;
        else if (match.text.match(/^\(.*\d{4}[a-z]?.*\)/)) { if (match.text.includes(",")) apaCount++; else chicagoCount++; }
        else if (match.text.match(/^\([^0-9]+\)$/)) mlaCount++;

        const absoluteFrom = pos + match.start;
        const absoluteTo = pos + match.end;
        let alreadyCited = false;
        currentDoc.nodesBetween(absoluteFrom, absoluteTo, (n) => { if (n.type.name === "citation") alreadyCited = true; });
        if (!alreadyCited && !citationsToReplace.some(c => Math.max(absoluteFrom, c.from) < Math.min(absoluteTo, c.to)) && registrationMap.has(match.text)) {
          citationsToReplace.push({ from: absoluteFrom, to: absoluteTo, text: match.text });
        }
      });
    }
    return true;
  });

  const tr = editor.state.tr;
  let hasChanges = false;
  
  // Combine all changes (normalization and de-normalization) into one list for a single reverse pass
  const allChanges: Array<{ from: number; to: number; type: "normalize" | "denormalize"; text: string; entry?: any }> = [];

  // 1. Collect Normalization Changes
  for (const citation of citationsToReplace) {
    const entry = registrationMap.get(citation.text);
    if (entry) {
      allChanges.push({ 
        from: citation.from, 
        to: citation.to, 
        type: "normalize", 
        text: citation.text, 
        entry 
      });
    }
  }

  // 2. Collect De-normalization Changes
  currentDoc.descendants((node, pos) => {
    if (node.type.name === "citation") {
      const text = node.attrs.text || "";
      const innerLower = text.replace(/[()\[\]]/g, "").trim().toLowerCase();
      const blacklist = ["prep", "art", "hiv", "aids", "u=u", "table", "figure", "fig."];
      
      if (blacklist.includes(innerLower) && !text.match(/\d{4}/)) {
        allChanges.push({ 
          from: pos, 
          to: pos + node.nodeSize, 
          type: "denormalize", 
          text 
        });
      }
    }
  });

  // 3. Apply ALL changes in REVERSE order across the document
  // Sort by 'from' position descending to maintain offset validity
  allChanges.sort((a, b) => b.from - a.from);

  for (const change of allChanges) {
    if (change.type === "normalize") {
      tr.replaceWith(
        change.from, 
        change.to, 
        editor.state.schema.nodes.citation.create({ 
          citationId: change.entry.ref_key || change.entry.id, 
          status: "resolved", 
          text: change.text 
        })
      );
    } else {
      tr.insertText(change.text, change.from, change.to);
    }
    hasChanges = true;
  }

  if (hasChanges) {
    tr.setMeta("normalization", true);
    try { if (editor.view && editor.view.dom) editor.view.dispatch(tr); } catch (e) {}
  }

  return { stats: { ieee: ieeeCount, apa: apaCount, mla: mlaCount, chicago: chicagoCount }, replacements: citationsToReplace.length };
}

export async function scanAndIngestReferences(editor: Editor, projectId: string, existingCitations: any[], syncOnly: boolean = false): Promise<any[]> {
  if (!editor) return [];
  const newCitations: any[] = [];
  const existingIds = new Set(existingCitations.map((c) => c.id));
  const existingTitles = new Set(existingCitations.map((c) => c.title?.toLowerCase().slice(0, 30)));
  const { CitationRegistryService } = await import("../../../services/CitationRegistryService");

  let inRefSection = false;
  const refLines: string[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading" || node.type.name === "paragraph") {
      const text = node.textContent.toLowerCase().trim().replace(/[:.]$/, "");
      if (["references", "works cited", "bibliography", "reference list", "refrences"].includes(text)) { inRefSection = true; return; }
      else if (inRefSection && node.type.name === "heading") inRefSection = false;
    }
    if (inRefSection && (node.type.name === "paragraph" || node.type.name === "listItem")) {
      const text = node.textContent.trim();
      if (text.length > 20) refLines.push(text);
    }
  });

  for (const text of refLines) {
    const roughYearMatch = text.match(/\((\d{4}[a-z]?)\)/) || text.match(/,\s*(\d{4})\./) || text.match(/\s(\d{4})$/);
    const roughTitleMatch = text.match(/"([^"]+)"/) || text.match(/\)\.\s*(.+?)(?=\.\s*[A-Z]|\.\s*https?|$)/);
    const record = {
      id: `manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: roughTitleMatch ? (roughTitleMatch[1] || roughTitleMatch[0]).trim().replace(/\.$/, "") : text.substring(0, 50),
      authors: ["Unknown"],
      year: roughYearMatch ? parseInt(roughYearMatch[1], 10) : new Date().getFullYear(),
    };
    const roughTitle = record.title?.toLowerCase().slice(0, 30);
    if (!existingIds.has(record.id) && (!roughTitle || !existingTitles.has(roughTitle))) {
      const newCitation = { title: record.title || "Unknown Title", authors: record.authors, year: record.year, type: "journal-article", source: "manual-ingest", tags: ["auto-imported"] };
      try { await CitationRegistryService.registerCitation(projectId, text, newCitation); newCitations.push(newCitation); existingIds.add(record.id); if (roughTitle) existingTitles.add(roughTitle); } catch (err) {}
    } else await CitationRegistryService.registerCitation(projectId, text);
  }
  return newCitations;
}

export async function synchronizeRegistryWithDocument(editor: Editor, projectId: string) {
  if (!editor || !editor.state) return;
  const { CitationRegistryService } = await import("../../../services/CitationRegistryService");
  let recoveredCount = 0;
  const nodesToHeal: any[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "citation") {
      const { citationId } = node.attrs;
      if (citationId) {
        const entry = CitationRegistryService.getEntry(projectId, citationId);
        if (!entry) nodesToHeal.push({ pos, citationId, text: node.attrs.text || "", attrs: node.attrs });
        else if (node.attrs.status === "invalid" || node.attrs.status === "unresolved") {
          editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, status: "resolved" }).setMeta("normalization", true));
        }
      }
    }
  });

  if (nodesToHeal.length === 0) return;

  nodesToHeal.reverse();
  const tr = editor.state.tr;
  for (const item of nodesToHeal) {
    const entry = await CitationRegistryService.registerCitation(projectId, item.text, { id: item.citationId, url: item.attrs.url, title: item.attrs.sourceTitle });
    tr.setNodeMarkup(item.pos, undefined, { ...item.attrs, status: "resolved", citationId: entry.ref_key });
    recoveredCount++;
  }
  
  tr.setMeta("normalization", true);
  if (editor.view && editor.view.dom) editor.view.dispatch(tr);
}

export async function detectAndNormalizeBibliography(editor: Editor, projectId: string) {
  if (!editor || !editor.isEditable) return;
  const { CitationRegistryService } = await import("../../../services/CitationRegistryService");
  
  const doc = editor.state.doc;
  let inRefSection = false;
  const entries: any[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === "heading" || node.type.name === "paragraph") {
      if (/references|bibliography|works cited|reference list/i.test(node.textContent.toLowerCase().trim())) { inRefSection = true; return; }
      else if (inRefSection && node.type.name === "heading") inRefSection = false;
    }
    if (inRefSection && (node.type.name === "paragraph" || node.type.name === "listItem")) {
      let hasBibNode = false;
      node.descendants((child: any) => { if (child.type.name === "bibliographyEntry") hasBibNode = true; });
      if (!hasBibNode && node.textContent.trim().length > 20) entries.push({ pos, node, text: node.textContent.trim() });
      return false;
    }
  });

  if (entries.length === 0) return;
  entries.reverse();

  const tr = editor.state.tr;
  for (const item of entries) {
    try {
      const currentNode = editor.state.doc.nodeAt(item.pos);
      if (!currentNode || currentNode.type.name === "bibliographyEntry") continue;
      const schema = editor.state.schema;
      const childNodes: any[] = [];
      currentNode.content.forEach((n: any) => childNodes.push(n));
      const matched = CitationRegistryService.getAllCitations().find(c => c.raw_reference_text === item.text) || CitationRegistryService.registerTempCitation(item.text);
      const bibNode = schema.nodes.bibliographyEntry.create({ citationId: matched.ref_key || (matched as any).id, refText: item.text }, childNodes);
      tr.replaceWith(item.pos, item.pos + currentNode.nodeSize, bibNode);
    } catch (err) {}
  }
  
  tr.setMeta("normalization", true);
  tr.setMeta("addToHistory", false);
  if (editor.view && editor.view.dom) editor.view.dispatch(tr);
}
