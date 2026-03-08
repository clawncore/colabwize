import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { extractPatterns } from "../services/citationAudit/patterns";

const citationScannerKey = new PluginKey("citationScanner");

export interface CitationScannerState {
  decorations: DecorationSet;
  stats: {
    ieeeCount: number;
    apaCount: number;
    mlaCount: number;
    chicagoCount: number;
    majorityStyle: "IEEE" | "APA" | "MLA" | "Chicago" | null;
  };
}

export const CitationScannerExtension = Extension.create({
  name: "citationScanner",

  addProseMirrorPlugins() {
    return [
      new Plugin<CitationScannerState>({
        key: citationScannerKey,
        state: {
          init() {
            return {
              decorations: DecorationSet.empty,
              stats: {
                ieeeCount: 0,
                apaCount: 0,
                mlaCount: 0,
                chicagoCount: 0,
                majorityStyle: null,
              },
            };
          },
          apply(tr, oldState) {
            if (
              !tr.docChanged &&
              oldState.decorations !== DecorationSet.empty
            ) {
              return {
                ...oldState,
                decorations: oldState.decorations.map(tr.mapping, tr.doc),
              };
            }

            const doc = tr.doc;
            const decorations: Decoration[] = [];
            let ieeeCount = 0;
            let apaCount = 0;
            let mlaCount = 0;
            let chicagoCount = 0;

            // ── 1. Pass 1: Gather Bibliography Metadata & Detect Boundaries ─────
            let inReferences = false;
            const referenceSet = new Set<string>();
            const ieeeMetadata = new Map<
              string,
              { text: string; url: string | null }
            >();

            let referenceSectionStart = Infinity;

            // Robust Regex for section headers
            const bibHeaderRegex =
              /references|bibliography|works cited|reference list/i;

            doc.descendants((node, pos) => {
              const nodeType = node.type.name;

              // Check for reference section boundary
              if (nodeType === "heading" || nodeType === "paragraph") {
                const text = node.textContent.trim();
                if (bibHeaderRegex.test(text)) {
                  inReferences = true;
                  if (pos < referenceSectionStart) referenceSectionStart = pos;
                  return false; // Skip checking children of the header
                } else if (inReferences && nodeType === "heading") {
                  // If we hit a new heading that DOES NOT match our regex, we are officially out
                  inReferences = false;
                }
              }

              if (inReferences) {
                if (
                  nodeType === "paragraph" ||
                  nodeType === "listItem" ||
                  nodeType === "bibliographyEntry"
                ) {
                  const fullLineText = node.textContent.trim();
                  // Match [1] or 1. at beginning of line
                  const ieeeNumMatch = fullLineText.match(/^\[?(\d+)\]?[\.\s]/);

                  // Extract URL/DOI for linking
                  const urlMatch = fullLineText.match(
                    /(https?:\/\/[^\s<\]"]+)/,
                  );
                  const url = urlMatch ? urlMatch[1] : null;

                  if (ieeeNumMatch) {
                    ieeeMetadata.set(ieeeNumMatch[1], {
                      text: fullLineText,
                      url: url,
                    });
                  }

                  // Author capture for APA/MLA/Chicago
                  const authorMatch = fullLineText.match(
                    /^([A-Z][a-zA-Z\s\-']+)(?:,|\.)/,
                  );
                  if (authorMatch) {
                    referenceSet.add(authorMatch[1].trim().toLowerCase());
                  }
                }

                // URL/DOI Decorations in bibliography
                if (node.isText) {
                  const text = node.text!;
                  const urlRegex = /(https?:\/\/[^\s<\]"]+)/g;
                  let match;
                  while ((match = urlRegex.exec(text)) !== null) {
                    decorations.push(
                      Decoration.inline(
                        pos + match.index,
                        pos + match.index + match[0].length,
                        {
                          class: "citation-scan-url",
                          title: match[0],
                        },
                      ),
                    );
                  }
                }
              }
            });

            // ── 2. Pass 2: Decorate In-Text Citations ───────────────────────────
            doc.descendants((node, pos) => {
              // SKIP scanning bibliography section for citations decoration
              if (pos >= referenceSectionStart) return false;
              if (!node.isText) return;

              const text = node.text!;
              const parentOffset = doc.resolve(pos).parentOffset;

              const patterns = extractPatterns(text, pos);

              patterns.forEach((p) => {
                let style: string = "";
                if (p.patternType === "NUMERIC") {
                  if (parentOffset + p.start < 5) return; // Skip if it looks like a bib entry start
                  ieeeCount++;
                  style = "ieee";
                } else if (p.patternType === "AUTHOR_YEAR") {
                  apaCount++;
                  style = "apa";
                } else if (p.patternType === "AUTHOR_ONLY") {
                  mlaCount++;
                  style = "mla";
                } else if (p.patternType === "AUTHOR_YEAR_SPACE") {
                  chicagoCount++;
                  style = "chicago";
                }

                if (!style) return;

                // Try to link
                let isLinked = false;
                let tooltipText = "";
                let firstUrl = "";

                if (style === "ieee") {
                  const nums = p.text
                    .replace(/[\[\]]/g, "")
                    .split(/[\s,\-]+/)
                    .map((n) => n.trim())
                    .filter(Boolean);
                  const metadataFound = nums
                    .map((n) => ieeeMetadata.get(n))
                    .filter(Boolean);
                  isLinked =
                    ieeeMetadata.size === 0 || metadataFound.length > 0;
                  tooltipText =
                    metadataFound.length > 0
                      ? metadataFound.map((m) => m!.text).join("\n---\n")
                      : isLinked
                        ? `IEEE [${p.text}] — Linked`
                        : `IEEE [${p.text}] — Orphan`;
                  firstUrl = metadataFound.find((m) => m!.url)?.url || "";
                } else {
                  const authorMatch = p.text.match(/[a-zA-ZÀ-ÿ-]+/);
                  const author = authorMatch
                    ? authorMatch[0].toLowerCase()
                    : "";
                  isLinked = Array.from(referenceSet).some(
                    (r) => r.includes(author) || author.includes(r),
                  );
                  tooltipText = isLinked
                    ? "Linked to Reference"
                    : "Orphan citation";
                }

                decorations.push(
                  Decoration.inline(pos + p.start, pos + p.end, {
                    class: isLinked
                      ? "citation-scan-linked"
                      : "citation-scan-orphan",
                    "data-citation-status": isLinked ? "linked" : "orphan",
                    "data-citation-style": style,
                    "data-url": firstUrl,
                    title: tooltipText,
                  }),
                );
              });
            });

            const statsMap = {
              IEEE: ieeeCount,
              APA: apaCount,
              MLA: mlaCount,
              Chicago: chicagoCount,
            };
            const majorityEntry = Object.entries(statsMap).sort(
              (a, b) => b[1] - a[1],
            )[0];
            const majority =
              majorityEntry[1] > 0 ? (majorityEntry[0] as any) : null;

            return {
              decorations: DecorationSet.create(doc, decorations),
              stats: {
                ieeeCount,
                apaCount,
                mlaCount,
                chicagoCount,
                majorityStyle: majority,
              },
            };
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)?.decorations;
          },
          handleClick(view, pos, event) {
            const target = event.target as HTMLElement;
            const decoration = target.closest(".citation-scan-linked");
            if (!decoration) return false;

            const text = decoration.textContent || "";
            const style = decoration.getAttribute("data-citation-style");

            let scrollTarget: HTMLElement | null = null;

            if (style === "ieee") {
              const num = text.replace(/[\[\]]/g, "").trim();
              scrollTarget =
                document.getElementById(`bib-${num}`) ||
                (document.querySelector(
                  `[data-bibliography-entry][data-citation-id="${num}"]`,
                ) as HTMLElement);

              if (!scrollTarget) {
                // Fallback: find bibliography entry starting with [num]
                const entries = document.querySelectorAll(
                  "[data-bibliography-entry]",
                );
                for (const entry of Array.from(entries)) {
                  if (
                    entry.textContent?.trim().startsWith(`[${num}]`) ||
                    entry.textContent?.trim().startsWith(`${num}.`)
                  ) {
                    scrollTarget = entry as HTMLElement;
                    break;
                  }
                }
              }
            } else {
              // APA/MLA/Chicago: search for author name in bibliography entries
              const authorMatch = text.match(/[a-zA-ZÀ-ÿ-]+/);
              if (authorMatch) {
                const author = authorMatch[0].toLowerCase();
                const entries = document.querySelectorAll(
                  "[data-bibliography-entry]",
                );
                for (const entry of Array.from(entries)) {
                  if (entry.textContent?.toLowerCase().includes(author)) {
                    scrollTarget = entry as HTMLElement;
                    break;
                  }
                }
              }
            }

            if (scrollTarget) {
              scrollTarget.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              const originalBg = scrollTarget.style.backgroundColor;
              scrollTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
              scrollTarget.style.transition = "background-color 0.5s ease";
              setTimeout(() => {
                if (scrollTarget)
                  scrollTarget.style.backgroundColor =
                    originalBg || "transparent";
              }, 2000);
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});
