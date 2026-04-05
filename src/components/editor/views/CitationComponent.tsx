import React, { useEffect, useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import {
  CitationRegistryService,
  RegistryEntry,
} from "../../../services/CitationRegistryService";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../ui/hover-card";
import { Edit2, RefreshCw, FileText as FileTextIcon } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

export const CitationComponent = (props: NodeViewProps) => {
  const { node, editor } = props;
  const { citationId, text } = node.attrs;
  const [metadata, setMetadata] = useState<RegistryEntry | null>(null);

  useEffect(() => {
    const updateMetadata = () => {
      if (citationId) {
        const meta = CitationRegistryService.getCitation(citationId);
        if (meta) setMetadata({ ...meta });
      }
    };

    updateMetadata();
    CitationRegistryService.addListener(updateMetadata);
    return () => {
      CitationRegistryService.removeListener(updateMetadata);
    };
  }, [citationId]);

  // Calculate how many times this citation appears in the entire document
  const [docCitationCount, setDocCitationCount] = useState(0);

  useEffect(() => {
    if (!editor || !citationId) return;

    const calculateDocCount = () => {
      let count = 0;
      editor.state.doc.descendants((node) => {
        if (
          node.type.name === "citation" &&
          node.attrs.citationId === citationId
        ) {
          count++;
        }
      });
      setDocCitationCount(count);
    };

    calculateDocCount();
    // Re-calculate when the document changes (transaction)
    editor.on("transaction", calculateDocCount);
    return () => {
      editor.off("transaction", calculateDocCount);
    };
  }, [editor, citationId]);

  const worldCitationCount =
    metadata?.metadata?.citationCount ||
    (metadata?.metadata as any)?.citation_count;
  const abstract = metadata?.metadata?.abstract;
  const displayText = text || "[citation]";

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Future analytics logging
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const event = new CustomEvent("openSidebarPanel", {
      detail: { panelType: "citations" },
    });
    window.dispatchEvent(event);
  };

  const handleOpenPdf = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (metadata?.url) {
      window.open(metadata.url, "_blank");
    }
  };

  const handleToggleNarrative = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!editor || !citationId) return;

    let newText = displayText;

    // 1. Numeric (IEEE)
    const numericMatch = displayText.match(/^\[(\d+)\]$/);
    if (numericMatch) {
      if (metadata?.authors && metadata.authors.length > 0) {
        const primaryAuthor = metadata.authors[0].split(",")[0].trim();
        const etAl = metadata.authors.length > 1 ? " et al." : "";
        newText = `${primaryAuthor}${etAl} [${numericMatch[1]}]`;
      }
    } else if (displayText.match(/^.+?\s*\[\d+\]$/)) {
      const revertMatch = displayText.match(/\[(\d+)\]$/);
      if (revertMatch) newText = `[${revertMatch[1]}]`;
    }
    // 2. APA (Author, Year)
    else if (displayText.match(/^\((.+),\s*(\d{4}[a-z]?)\)$/)) {
      const m = displayText.match(/^\((.+),\s*(\d{4}[a-z]?)\)$/);
      if (m) newText = `${m[1].trim()} (${m[2]})`;
    } else if (displayText.match(/^(.+?)\s*\((\d{4}[a-z]?)\)$/)) {
      const m = displayText.match(/^(.+?)\s*\((\d{4}[a-z]?)\)$/);
      if (m) newText = `(${m[1].trim()}, ${m[2]})`;
    }
    // 3. Chicago (Author Year)
    else if (displayText.match(/^\((.+?)\s+(\d{4}[a-z]?)\)$/)) {
      const m = displayText.match(/^\((.+?)\s+(\d{4}[a-z]?)\)$/);
      if (m) newText = `${m[1].trim()} (${m[2]})`;
    }
    // 4. MLA (Author)
    else if (displayText.match(/^\(([^,0-9]+)\)$/)) {
      const m = displayText.match(/^\(([^,0-9]+)\)$/);
      if (m) newText = m[1].trim();
    } else if (displayText.match(/^([^,0-9()]+)$/)) {
      const m = displayText.match(/^([^,0-9()]+)$/);
      if (m) newText = `(${m[1].trim()})`;
    }

    if (newText !== displayText) {
      const { state, dispatch } = editor.view;
      const tr = state.tr;
      let pos = -1;
      state.doc.descendants((child, childPos) => {
        if (
          child.type.name === "citation" &&
          child.attrs.citationId === citationId &&
          child === node
        ) {
          pos = childPos;
          return false;
        }
      });

      if (pos !== -1) {
        tr.setNodeMarkup(pos, null, { ...node.attrs, text: newText });
        dispatch(tr);
      }
    }
  };

  const scrollToRef = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!citationId) return;

    let target = document.getElementById(`bib-${citationId}`);
    if (!target) {
      target = document.querySelector(
        `[data-bibliography-entry][data-citation-id="${citationId}"]`,
      );
    }

    if (!target) {
      const entries = document.querySelectorAll("[data-bibliography-entry]");
      for (const entry of Array.from(entries)) {
        if (
          entry.textContent?.includes(citationId) ||
          entry.getAttribute("data-citation-id") === citationId
        ) {
          target = entry as HTMLElement;
          break;
        }
      }
    }

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      const originalBg = (target as HTMLElement).style.backgroundColor;
      (target as HTMLElement).style.backgroundColor = "rgba(59, 130, 246, 0.1)";
      (target as HTMLElement).style.transition = "background-color 0.5s ease";
      setTimeout(() => {
        (target as HTMLElement).style.backgroundColor =
          originalBg || "transparent";
      }, 2000);
    } else if (metadata) {
      const author = metadata.authors?.[0]?.split(",")[0].trim().toLowerCase();
      const year = String(metadata.year || "");
      if (author) {
        const allPotentialRefs = document.querySelectorAll(
          "[data-bibliography-entry], p, li",
        );
        let fallbackTarget: HTMLElement | null = null;
        for (const el of Array.from(allPotentialRefs)) {
          const textContent = el.textContent?.toLowerCase() || "";
          if (
            textContent.includes(author) &&
            (!year || textContent.includes(year))
          ) {
            const rect = el.getBoundingClientRect();
            if (rect.top + window.scrollY > document.body.scrollHeight * 0.3) {
              fallbackTarget = el as HTMLElement;
              break;
            }
          }
        }
        if (fallbackTarget) {
          fallbackTarget.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          const originalBg = fallbackTarget.style.backgroundColor;
          fallbackTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
          setTimeout(() => {
            if (fallbackTarget)
              fallbackTarget.style.backgroundColor =
                originalBg || "transparent";
          }, 2000);
        }
      }
    }
  };

  return (
    <NodeViewWrapper className="inline-block" as="span">
      <HoverCard
        openDelay={200}
        closeDelay={200}
        onOpenChange={handleOpenChange}>
        <HoverCardTrigger asChild>
          <a
            className="citation-node citation-pill"
            data-citation-id={citationId}
            href={`#bib-${citationId}`}
            onClick={scrollToRef}>
            {displayText}
          </a>
        </HoverCardTrigger>
        <HoverCardContent
          className="w-[500px] p-3 !bg-white !opacity-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] rounded-xl border border-gray-100 z-[100] flex flex-col gap-2.5"
          side="bottom"
          align="start">
          {/* Top Header Section */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {(metadata?.metadata as any)?.source === 'Zotero' && (
                  <Badge className="px-1.5 py-0 rounded flex items-center justify-center bg-red-600 hover:bg-red-600 text-white text-[8px] font-black uppercase tracking-widest shadow-sm border-0 h-4">
                    Zotero
                  </Badge>
                )}
                {(metadata?.metadata as any)?.source === 'Mendeley' && (
                  <Badge className="px-1.5 py-0 rounded flex items-center justify-center bg-blue-600 hover:bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest shadow-sm border-0 h-4">
                    Mendeley
                  </Badge>
                )}
                <h4 className="text-[15px] font-bold text-gray-900 leading-tight line-clamp-2">
                  {metadata?.sourceTitle || "Reference Title Unavailable"}
                </h4>
              </div>
              <p className="text-[12px] text-gray-500 font-medium truncate mt-0.5">
                {metadata?.authors?.join(", ") || "No Authors Found"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {worldCitationCount !== undefined &&
                Number(worldCitationCount) > 0 && (
                  <Badge className="px-1.5 py-0 text-[9px] text-green-600 bg-green-50/50 border-green-100 shadow-none font-bold">
                    {worldCitationCount} WORLD CITES
                  </Badge>
                )}
              {docCitationCount > 0 && (
                <Badge className="px-1.5 py-0 text-[9px] text-blue-600 bg-blue-50/50 border-blue-100 shadow-none font-bold">
                  {docCitationCount} DOC CITES
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="px-1.5 py-0 text-[9px] bg-gray-50 text-gray-400 border-0 flex items-center gap-1 font-bold">
                REVIEW
              </Badge>
            </div>
          </div>

          {/* Abstract Section */}
          {abstract && (
            <p className="text-[12px] text-gray-600 leading-snug line-clamp-3 mt-1 italic border-l-2 border-gray-200 pl-2">
              "{abstract}"
            </p>
          )}

          {/* Compact Meta Row */}
          <div className="flex items-center justify-between text-[11px] py-1.5 border-y border-gray-50">
            <div className="flex items-center gap-4 text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="text-[9px] text-gray-300 font-black uppercase tracking-tighter">
                  Pub
                </span>
                <span className="text-gray-700 truncate max-w-[150px]">
                  {(metadata?.metadata as any)?.journal ||
                    (metadata?.metadata as any)?.publisher ||
                    "Academic Publication"}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-[9px] text-gray-300 font-black uppercase tracking-tighter">
                  Year
                </span>
                <span className="text-gray-700">{metadata?.year || "N/A"}</span>
              </span>
            </div>
            <Badge className="text-[9px] font-black text-orange-600 border-orange-100 bg-orange-50/50 px-1.5 py-0 h-4 uppercase">
              Open Access
            </Badge>
          </div>

          {/* Compact Action Footer */}
          <div className="flex items-center gap-1.5 mt-1">
            <Button
              className="flex-1 h-8 rounded-lg font-bold text-[11px] text-gray-900 hover:bg-gray-50 border-gray-200 shadow-sm"
              onClick={handleOpenPdf}
              disabled={!metadata?.url}>
              <FileTextIcon
                className="w-3.5 h-3.5 mr-2 text-red-500"
                strokeWidth={2.5}
              />
              Read Article
            </Button>
            <div className="flex gap-1 shrink-0">
              <Button
                className="h-8 w-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                onClick={handleEdit}
                title="Edit Source">
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                className="h-8 w-8 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                onClick={handleToggleNarrative}
                title="Toggle Narrative Style">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </NodeViewWrapper>
  );
};
