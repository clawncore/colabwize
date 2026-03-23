import React, { useState, useRef, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Document, Page, pdfjs } from "react-pdf";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Highlighter,
  StickyNote,
  Save,
  Trash2,
  Loader2,
  Download,
  Printer,
  Search,
  RotateCw,
  MessageSquare,
  Pen,
  AlignLeft,
  Check,
  Sparkles,
  PanelLeft,
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ResearchChatSidebar } from "./ResearchChatSidebar";
import { ResearchService } from "../../services/researchService";
import { cn } from "../../lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Annotation {
  id?: string;
  type: "highlight" | "note" | "comment";
  content?: string;
  color?: string;
  authorName?: string;
  authorId?: string;
  createdAt?: string;
  coordinates: {
    page: number;
    area: { x: number; y: number; w: number; h: number }[];
  };
}

interface StickyNoteMarker {
  page: number;
  x: number;
  y: number;
}

interface PDFAnnotatorProps {
  fileUrl: string;
  fileId: string;
  title: string;
  onClose: () => void;
  onSaveAnnotations?: (annotations: Annotation[]) => Promise<void>;
  initialAnnotations?: Annotation[];
  authToken?: string;
}

const ANNOTATION_COLORS = [
  {
    name: "Yellow",
    value: "rgba(255, 220, 0, 0.45)",
    class: "bg-yellow-400",
    dot: "#FACC15",
  },
  {
    name: "Green",
    value: "rgba(34, 197, 94, 0.45)",
    class: "bg-green-400",
    dot: "#4ADE80",
  },
  {
    name: "Cyan",
    value: "rgba(6, 182, 212, 0.45)",
    class: "bg-cyan-400",
    dot: "#22D3EE",
  },
  {
    name: "Pink",
    value: "rgba(236, 72, 153, 0.45)",
    class: "bg-pink-400",
    dot: "#F472B6",
  },
  {
    name: "Orange",
    value: "rgba(251, 146, 60, 0.45)",
    class: "bg-orange-400",
    dot: "#FB923C",
  },
];

export const PDFAnnotator: React.FC<PDFAnnotatorProps> = ({
  fileUrl,
  fileId,
  title,
  onClose,
  onSaveAnnotations,
  initialAnnotations = [],
  authToken,
}) => {
  // Resolve the real current user name from auth session
  const { user } = useAuth();
  const currentUserName =
    (user as any)?.user_metadata?.full_name ||
    (user as any)?.full_name ||
    (user as any)?.email ||
    "Unknown";
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [annotations, setAnnotations] =
    useState<Annotation[]>(initialAnnotations);
  const [activeTool, setActiveTool] = useState<
    "view" | "highlight" | "note" | "comment"
  >("view");
  const [activeColor, setActiveColor] = useState(ANNOTATION_COLORS[0].value);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isFullscreen] = useState(false);
  const [pendingNotePos, setPendingNotePos] = useState<StickyNoteMarker | null>(
    null,
  );
  const [pendingNoteText, setPendingNoteText] = useState("");
  const [jumpPage, setJumpPage] = useState("");
  // Editing existing note/comment
  const [editingAnnotation, setEditingAnnotation] = useState<{
    idx: number;
    text: string;
  } | null>(null);
  // Search
  const [searchMatchPages, setSearchMatchPages] = useState<number[]>([]);
  const [searchMatchIdx, setSearchMatchIdx] = useState(0);
  const [isIndexing, setIsIndexing] = useState(false);
  const pdfDocRef = useRef<any>(null);
  const textIndexRef = useRef<string[]>([]); // index[i] = text of page i+1
  const indexingSessionRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [pendingAiQuery, setPendingAiQuery] = useState<string | null>(null);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [selectedText, setSelectedText] = useState("");

  // Memoize options to prevent unnecessary re-renders of the Document component
  const documentOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
    }),
    [],
  );

  // Aggressively memoize the file config for react-pdf to prevent unnecessary re-renders/heavy reloads
  const fileRef = React.useRef<any>(null);
  const documentFile = React.useMemo(() => {
    if (!fileUrl) return null;
    
    const config = authToken && typeof fileUrl === "string" 
      ? {
          url: fileUrl,
          httpHeaders: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        }
      : fileUrl;

    // Use JSON comparison to check if we really need to update the reference
    const currentConfigStr = JSON.stringify(config);
    const lastConfigStr = JSON.stringify(fileRef.current);
    
    if (currentConfigStr !== lastConfigStr) {
      fileRef.current = config;
    }
    
    return fileRef.current;
  }, [fileUrl, authToken]);

  const onDocumentLoadSuccess = useCallback(async (pdf: any) => {
    setNumPages(pdf.numPages);
    pdfDocRef.current = pdf;

    // Build text index in background
    const currentSession = ++indexingSessionRef.current;
    setIsIndexing(true);

    try {
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        // Stop if a new document has started loading
        if (currentSession !== indexingSessionRef.current) return;

        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        const pageText = tc.items
          .map((item: any) => item.str)
          .join(" ")
          .toLowerCase();
        pages.push(pageText);
      }

      if (currentSession === indexingSessionRef.current) {
        textIndexRef.current = pages;
      }
    } catch (err) {
      if (currentSession === indexingSessionRef.current) {
        console.warn("Failed to index PDF text:", err);
      }
    } finally {
      if (currentSession === indexingSessionRef.current) {
        setIsIndexing(false);
      }
    }
  }, []);

  const handlePrevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const handleNextPage = () =>
    setPageNumber((p) => Math.min(numPages || p, p + 1));
  const handleZoomIn = () =>
    setScale((s) => Math.min(3.0, +(s + 0.15).toFixed(2)));
  const handleZoomOut = () =>
    setScale((s) => Math.max(0.4, +(s - 0.15).toFixed(2)));
  const handleFitWidth = () => setScale(1.2);
  const handleFitPage = () => setScale(0.9);
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleJumpPage = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const page = parseInt(jumpPage);
      if (!isNaN(page) && page >= 1 && page <= (numPages || 1)) {
        setPageNumber(page);
      }
      setJumpPage("");
    }
  };

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // window.find is non-standard — cast to any to silence TypeScript
  const browserFind = (q: string, backwards = false) =>
    (window as any).find?.(q, false, backwards, true, false, true, false);

  const runSearch = (query: string) => {
    if (!query.trim() || textIndexRef.current.length === 0) {
      setSearchMatchPages([]);
      setSearchMatchIdx(0);
      return;
    }
    const q = query.toLowerCase();
    const matched: number[] = [];
    textIndexRef.current.forEach((text, i) => {
      if (text.includes(q)) matched.push(i + 1);
    });
    setSearchMatchPages(matched);
    setSearchMatchIdx(0);
    if (matched.length > 0) {
      setPageNumber(matched[0]);
      // After react re-renders the page, use browser find to highlight
      setTimeout(() => browserFind(query), 400);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchMatchPages.length === 0) {
        runSearch(searchQuery);
        return;
      }
      // Navigate to next match
      const next = (searchMatchIdx + 1) % searchMatchPages.length;
      setSearchMatchIdx(next);
      setPageNumber(searchMatchPages[next]);
      setTimeout(() => browserFind(searchQuery), 400);
    }
    if (e.key === "Escape") {
      setShowSearch(false);
      setSearchQuery("");
      setSearchMatchPages([]);
    }
  };

  const goToPrevMatch = () => {
    if (searchMatchPages.length === 0) return;
    const prev =
      (searchMatchIdx - 1 + searchMatchPages.length) % searchMatchPages.length;
    setSearchMatchIdx(prev);
    setPageNumber(searchMatchPages[prev]);
    setTimeout(() => browserFind(searchQuery, true), 400);
  };

  const goToNextMatch = () => {
    if (searchMatchPages.length === 0) return;
    const next = (searchMatchIdx + 1) % searchMatchPages.length;
    setSearchMatchIdx(next);
    setPageNumber(searchMatchPages[next]);
    setTimeout(() => browserFind(searchQuery), 400);
  };

  const handleSave = async () => {
    if (!onSaveAnnotations) return;
    setIsSaving(true);
    try {
      await onSaveAnnotations(annotations);
    } catch (err) {
      console.error("Failed to save annotations:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchBlob = async (): Promise<string | null> => {
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
      const res = await fetch(fileUrl, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error("Failed to fetch file blob:", err);
      return null;
    }
  };

  /**
   * Bake annotations into a new PDF using jsPDF and Canvas API
   */
  const generateAnnotatedPdf = async () => {
    if (!pdfDocRef.current || !numPages) return null;
    setIsExporting(true);
    setExportProgress(0);

    try {
      const { default: jsPDF } = await import("jspdf");
      // Use "p" for portrait, "pt" for points (matching PDF standard)
      const pdf = new jsPDF("p", "pt", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 1; i <= numPages; i++) {
        setExportProgress(Math.round((i / numPages) * 100));

        const page = await pdfDocRef.current.getPage(i);
        // Render at high scale for clarity
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // 1. Render original PDF page
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // 2. Draw annotations on top
        const pageAnns = annotations.filter(
          (ann) => ann.coordinates.page === i,
        );

        for (const ann of pageAnns) {
          if (ann.type === "highlight") {
            // Draw highlights
            context.globalAlpha = 0.4;
            context.fillStyle = ann.color || "rgba(255, 220, 0, 0.45)";

            for (const rect of ann.coordinates.area) {
              const x = (rect.x / 100) * canvas.width;
              const y = (rect.y / 100) * canvas.height;
              const w = (rect.w / 100) * canvas.width;
              const h = (rect.h / 100) * canvas.height;
              context.fillRect(x, y, w, h);
            }
          } else {
            // Draw note/comment pins
            const pos = ann.coordinates.area[0];
            const isComment = ann.type === "comment";
            const x = (pos.x / 100) * canvas.width;
            const y = (pos.y / 100) * canvas.height;

            // Draw shadow/outer circle
            context.globalAlpha = 1.0;
            context.beginPath();
            context.arc(x, y, 14, 0, 2 * Math.PI);
            context.fillStyle = "rgba(0,0,0,0.1)";
            context.fill();

            // Draw main circle
            context.beginPath();
            context.arc(x, y, 12, 0, 2 * Math.PI);
            context.fillStyle = isComment ? "#3B82F6" : "#F59E0B";
            context.fill();
            context.strokeStyle = "white";
            context.lineWidth = 2;
            context.stroke();

            // Draw letter (C/N)
            context.fillStyle = "white";
            context.font = "bold 12px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(isComment ? "C" : "N", x, y);
          }
        }

        // 3. Add to jsPDF
        // Calculate dimensions to fit A4 while maintaining aspect ratio
        const imgWidth = viewport.width;
        const imgHeight = viewport.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        if (i > 1) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, finalWidth, finalHeight);
      }

      return pdf;
    } catch (err) {
      console.error("Failed to generate annotated PDF:", err);
      return null;
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleDownload = async () => {
    const pdf = await generateAnnotatedPdf();
    if (pdf) {
      pdf.save(title.endsWith(".pdf") ? title : `${title}.pdf`);
    } else {
      // Fallback to original if baking fails
      const blobUrl = await fetchBlob();
      if (!blobUrl) return;
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handlePrint = async () => {
    const pdf = await generateAnnotatedPdf();
    if (pdf) {
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        };
      }
    } else {
      // Fallback
      const blobUrl = await fetchBlob();
      if (!blobUrl) return;
      window.open(blobUrl, "_blank");
    }
  };

  // Handle text selection for highlights and AI
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (
      !selection ||
      selection.rangeCount === 0 ||
      selection.toString().trim().length === 0
    ) {
      setSelectionRect(null);
      setSelectedText("");
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Update selection state for AI tooltip
    setSelectionRect(rect);
    setSelectedText(selection.toString().trim());

    if (activeTool !== "highlight") return;
    // commonAncestorContainer can be a text node which lacks .closest()
    const ancestor = range.commonAncestorContainer;
    const ancestorEl =
      ancestor.nodeType === Node.ELEMENT_NODE
        ? (ancestor as HTMLElement)
        : (ancestor.parentElement as HTMLElement);
    const pageElement = ancestorEl?.closest(".react-pdf__Page");
    if (!pageElement) return;

    const pageRect = pageElement.getBoundingClientRect();
    const rects = Array.from(range.getClientRects());

    const area = rects.map((rect) => ({
      x: ((rect.left - pageRect.left) / pageRect.width) * 100,
      y: ((rect.top - pageRect.top) / pageRect.height) * 100,
      w: (rect.width / pageRect.width) * 100,
      h: (rect.height / pageRect.height) * 100,
    }));

    const newHighlight: Annotation = {
      type: "highlight",
      color: activeColor,
      coordinates: { page: pageNumber, area },
      content: selection.toString(),
    };

    setAnnotations((prev) => [...prev, newHighlight]);
    selection.removeAllRanges();
  };

  // Handle click on the page area for note/comment placement
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== "note" && activeTool !== "comment") return;
    // If there's already a pending popup, dismiss it
    if (pendingNotePos) {
      setPendingNotePos(null);
      return;
    }
    // Find the actual rendered PDF page element
    const pageEl = (e.currentTarget as HTMLDivElement).querySelector(
      ".react-pdf__Page",
    ) as HTMLElement | null;
    if (!pageEl) return;
    const rect = pageEl.getBoundingClientRect();
    // Only register clicks that land inside the page area
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    )
      return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingNotePos({ page: pageNumber, x, y });
    setPendingNoteText("");
  };

  const confirmNote = () => {
    if (!pendingNotePos || !pendingNoteText.trim()) {
      setPendingNotePos(null);
      return;
    }

    const newNote: Annotation = {
      type: activeTool === "comment" ? "comment" : "note",
      color: activeColor,
      content: pendingNoteText.trim(),
      authorName: currentUserName,
      createdAt: new Date().toISOString(),
      coordinates: {
        page: pendingNotePos.page,
        area: [{ x: pendingNotePos.x, y: pendingNotePos.y, w: 3, h: 3 }],
      },
    };
    setAnnotations((prev) => [...prev, newNote]);
    setPendingNotePos(null);
    setPendingNoteText("");
  };

  /** Save edits to an existing note/comment */
  const saveAnnotationEdit = () => {
    if (!editingAnnotation) return;
    setAnnotations((prev) =>
      prev.map((ann, i) =>
        i === editingAnnotation.idx
          ? { ...ann, content: editingAnnotation.text }
          : ann,
      ),
    );
    setEditingAnnotation(null);
  };

  const deleteAnnotation = (idx: number) => {
    setAnnotations((prev) => prev.filter((_, i) => i !== idx));
    if (editingAnnotation?.idx === idx) setEditingAnnotation(null);
  };

  const jumpToAnnotation = (ann: Annotation) => {
    setPageNumber(ann.coordinates.page);
    // Auto-scroll the container to the top of the new page
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Render highlight overlays for current page
  const renderHighlights = () =>
    annotations
      .filter(
        (ann) =>
          ann.coordinates.page === pageNumber && ann.type === "highlight",
      )
      .map((ann, annIdx) => (
        <div key={annIdx} className="absolute inset-0 pointer-events-none">
          {ann.coordinates.area.map((rect, rectIdx) => (
            <div
              key={rectIdx}
              className="absolute"
              style={{
                left: `${rect.x}%`,
                top: `${rect.y}%`,
                width: `${rect.w}%`,
                height: `${rect.h}%`,
                backgroundColor: ann.color || "rgba(255, 220, 0, 0.45)",
                mixBlendMode: "multiply",
              }}
            />
          ))}
        </div>
      ));

  // Render sticky note / comment markers for current page
  const renderNoteMarkers = () => {
    // Get all notes/comments for this page with their global annotation index
    const markers = annotations
      .map((ann, globalIdx) => ({ ann, globalIdx }))
      .filter(
        ({ ann }) =>
          ann.coordinates.page === pageNumber &&
          (ann.type === "note" || ann.type === "comment"),
      );

    return markers.map(({ ann, globalIdx }) => {
      const pos = ann.coordinates.area[0];
      const isComment = ann.type === "comment";
      const isEditing = editingAnnotation?.idx === globalIdx;
      const authorInitial = (ann.authorName || "?")[0].toUpperCase();

      return (
        <div
          key={globalIdx}
          className="absolute pointer-events-auto"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            zIndex: isEditing ? 60 : 30,
          }}>
          {/* Clickable pin button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isEditing) {
                setEditingAnnotation(null);
              } else {
                setEditingAnnotation({
                  idx: globalIdx,
                  text: ann.content || "",
                });
              }
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all hover:scale-125 focus:outline-none ${
              isEditing ? "ring-2 ring-offset-1 ring-indigo-500 scale-125" : ""
            } ${isComment ? "bg-blue-500" : "bg-amber-400"}`}
            title={`${ann.authorName || "Unknown"} · Click to open`}>
            {isComment ? (
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            ) : (
              <StickyNote className="w-3.5 h-3.5 text-white" />
            )}
          </button>

          {/* Edit / Read popup */}
          {isEditing && (
            <div
              className="absolute left-10 top-0 z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-3"
              onClick={(e) => e.stopPropagation()}>
              {/* Author + meta */}
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${
                    isComment ? "bg-blue-500" : "bg-amber-400"
                  }`}>
                  {authorInitial}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-gray-800 truncate">
                    {ann.authorName || "Unknown"}
                  </p>
                  {ann.createdAt && (
                    <p className="text-[9px] text-gray-400">
                      {new Date(ann.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                <span
                  className={`ml-auto text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    isComment
                      ? "bg-blue-100 text-blue-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                  {ann.type}
                </span>
              </div>

              {/* Editable text */}
              <textarea
                value={editingAnnotation!.text}
                onChange={(e) =>
                  setEditingAnnotation({ idx: globalIdx, text: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    saveAnnotationEdit();
                  }
                  if (e.key === "Escape") setEditingAnnotation(null);
                }}
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 mb-2"
                autoFocus
              />

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={saveAnnotationEdit}
                  className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1">
                  <Check className="w-3 h-3" /> Save
                </button>
                <button
                  onClick={() => {
                    deleteAnnotation(globalIdx);
                  }}
                  className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-all">
                  <Trash2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditingAnnotation(null)}
                  className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg transition-all">
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  // Annotations count
  const currentPageAnns = annotations.filter(
    (a) => a.coordinates.page === pageNumber,
  ).length;

  const toolButtonClass = (tool: string, activeClass: string) =>
    `p-2 rounded-lg transition-all text-sm ${
      activeTool === tool
        ? activeClass
        : "text-gray-500 hover:text-gray-900 hover:bg-white"
    }`;

  return (
    <div
      className={`z-50 flex flex-col bg-gray-50 overflow-hidden font-sans ${
        isFullscreen ? "fixed inset-0" : "fixed inset-0"
      }`}>
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-100 shadow-sm z-10 gap-3">
        {/* Left: close + title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            className={cn(
              "p-1.5 rounded-lg transition-all flex-shrink-0",
              showLeftSidebar
                ? "bg-indigo-100 text-indigo-600"
                : "text-gray-400 hover:bg-gray-100",
            )}
            title={showLeftSidebar ? "Hide Annotations" : "Show Annotations"}>
            <PanelLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate max-w-xs">
              {title}
            </p>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
              PDF Annotator
            </p>
          </div>
        </div>

        {/* Center: Tool bar */}
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-sm flex-shrink-0">
          {/* View */}
          <button
            onClick={() => setActiveTool("view")}
            className={toolButtonClass(
              "view",
              "bg-indigo-600 text-white shadow-md",
            )}
            title="View Mode">
            <AlignLeft className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          {/* Highlight */}
          <button
            onClick={() => setActiveTool("highlight")}
            className={toolButtonClass(
              "highlight",
              "bg-yellow-400 text-yellow-950 shadow-md",
            )}
            title="Highlight (select text)">
            <Highlighter className="w-4 h-4" />
          </button>
          {/* Note pin */}
          <button
            onClick={() => setActiveTool("note")}
            className={toolButtonClass(
              "note",
              "bg-amber-400 text-white shadow-md",
            )}
            title="Pin Note (click on page)">
            <StickyNote className="w-4 h-4" />
          </button>
          {/* Comment */}
          <button
            onClick={() => setActiveTool("comment")}
            className={toolButtonClass(
              "comment",
              "bg-blue-500 text-white shadow-md",
            )}
            title="Pin Comment (click on page)">
            <MessageSquare className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-0.5" />

          {/* Ask AI */}
          <button
            onClick={() => setShowAiChat(!showAiChat)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-bold",
              showAiChat
                ? "bg-purple-600 text-white shadow-md"
                : "text-purple-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-200",
            )}
            title="Ask AI Assistant">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI</span>
          </button>

          {/* Color swatches */}
          <div className="flex items-center gap-1 ml-1 pl-2 border-l border-gray-200">
            {ANNOTATION_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setActiveColor(c.value)}
                className={`w-4.5 h-4.5 rounded-full border-2 transition-transform hover:scale-125 shadow-sm ${c.class} ${
                  activeColor === c.value
                    ? "border-gray-900 ring-2 ring-offset-1 ring-indigo-500"
                    : "border-white"
                }`}
                style={{ width: 18, height: 18 }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Right: zoom, rotate, search, download, print, save */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Find */}
          <button
            onClick={() => {
              setShowSearch((v) => !v);
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            title="Find in document">
            <Search className="w-4 h-4" />
          </button>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200 text-sm text-gray-700">
            <button
              onClick={handleZoomOut}
              className="hover:text-gray-900"
              title="Zoom out">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitWidth}
              className="min-w-[3rem] text-center font-bold hover:text-indigo-600 text-xs transition-colors"
              title="Click to fit width">
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="hover:text-gray-900"
              title="Zoom in">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom presets */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleFitPage}
              className="px-2 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-all border border-gray-200"
              title="Fit Page">
              Fit
            </button>
            <button
              onClick={() => setScale(1.0)}
              className="px-2 py-1 text-[10px] font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded transition-all border border-gray-200"
              title="100%">
              100%
            </button>
          </div>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Rotate 90°">
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
            title="Download">
            <Download className="w-4 h-4" />
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            title="Print">
            <Printer className="w-4 h-4" />
          </button>

          {/* Save */}
          {onSaveAnnotations && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50">
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save
            </button>
          )}
        </div>
      </div>

      {/* Search bar (collapsible) */}
      {showSearch && (
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={
              isIndexing ? "Indexing PDF text..." : "Find in document..."
            }
            disabled={isIndexing}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value.trim()) {
                setSearchMatchPages([]);
                setSearchMatchIdx(0);
              }
            }}
            onKeyDown={handleSearchKeyDown}
            className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 bg-transparent disabled:opacity-50"
            autoFocus
          />
          {/* Match count */}
          {searchQuery && (
            <span className="text-xs font-bold text-gray-500 flex-shrink-0">
              {searchMatchPages.length === 0
                ? "No matches"
                : `Page ${searchMatchIdx + 1} of ${searchMatchPages.length}`}
            </span>
          )}
          {/* Prev / Next */}
          <button
            onClick={goToPrevMatch}
            disabled={searchMatchPages.length === 0}
            className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 rounded"
            title="Previous match">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNextMatch}
            disabled={searchMatchPages.length === 0}
            className="p-1 text-gray-400 hover:text-indigo-600 disabled:opacity-30 rounded"
            title="Next match">
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* Search button */}
          <button
            onClick={() => runSearch(searchQuery)}
            disabled={isIndexing || !searchQuery.trim()}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg disabled:opacity-40 transition-colors">
            Search
          </button>
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery("");
              setSearchMatchPages([]);
            }}
            className="p-1 text-gray-400 hover:text-gray-700 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tool hint bar */}
      {activeTool !== "view" && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-1.5 flex items-center gap-2 text-xs text-indigo-700 font-medium">
          {activeTool === "highlight" && (
            <>
              <Highlighter className="w-3.5 h-3.5" /> Select text on the
              document to create a highlight
            </>
          )}
          {activeTool === "note" && (
            <>
              <StickyNote className="w-3.5 h-3.5" /> Click anywhere on the page
              to pin a note
            </>
          )}
          {activeTool === "comment" && (
            <>
              <MessageSquare className="w-3.5 h-3.5" /> Click anywhere on the
              page to add a comment
            </>
          )}
        </div>
      )}

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Annotations List (Conditional or fixed) */}
        {showLeftSidebar && (
          <div className="w-72 bg-white border-r border-gray-100 flex flex-col animate-in slide-in-from-left duration-200">
          {/* Sidebar header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Annotations
              </h2>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {annotations.length} total · {currentPageAnns} on this page
              </p>
            </div>
          </div>

          {/* Annotation list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {annotations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                  <Pen className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-xs font-semibold text-gray-500">
                  No annotations yet
                </p>
              </div>
            ) : (
              annotations.map((ann, idx) => (
                <div
                  key={idx}
                  onClick={() => jumpToAnnotation(ann)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all group hover:shadow-md ${
                    ann.coordinates.page === pageNumber
                      ? "border-indigo-200 bg-indigo-50/50"
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-gray-100">
                      {ann.type}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold">
                      Pg {ann.coordinates.page}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                    {ann.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
        )}

        {/* PDF Viewer Central Area */}
        <div
          ref={containerRef}
          onMouseUp={handleTextSelection}
          className="flex-1 overflow-auto p-8 flex justify-center relative bg-gray-200/50">
          {/* Selection Tooltip for AI */}
          {selectedText && selectionRect && (
            <div
              className="fixed z-[100] bg-white border border-purple-100 shadow-xl rounded-full px-3 py-1.5 flex items-center gap-2 animate-in fade-in zoom-in duration-200"
              style={{
                top: selectionRect.top - 50,
                left: selectionRect.left + selectionRect.width / 2,
                transform: "translateX(-50%)",
              }}>
              <button
                onClick={() => {
                  if (selectedText) {
                    setPendingAiQuery(
                      `Analyze this part of the document and perform additional research on this topic to provide a comprehensive explanation: "${selectedText}"`,
                    );
                    setShowAiChat(true);
                    window.getSelection()?.removeAllRanges();
                    setSelectedText("");
                    setSelectionRect(null);
                  }
                }}
                className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask AI</span>
              </button>
              <button
                onClick={() => {
                  setSelectedText("");
                  setSelectionRect(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="shadow-2xl shadow-gray-400/30 relative h-fit">
            {/* Pending note popup */}
            {pendingNotePos && (
              <div
                className="absolute z-50"
                style={{
                  left: `${pendingNotePos.x}%`,
                  top: `${pendingNotePos.y}%`,
                  transform: "translate(8px, -50%)",
                }}
                onClick={(e) => e.stopPropagation()}>
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-64">
                  <textarea
                    value={pendingNoteText}
                    onChange={(e) => setPendingNoteText(e.target.value)}
                    placeholder="Type your note..."
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-lg p-2 resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={confirmNote}
                      className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg">
                      Save
                    </button>
                    <button
                      onClick={() => setPendingNotePos(null)}
                      className="flex-1 py-1.5 bg-gray-100 text-xs font-bold rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div
              ref={pageRef}
              className="relative bg-white"
              onClick={handlePageClick}>
              <Document
                file={documentFile}
                options={documentOptions}
                loading={
                  <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                    <p className="text-slate-500 font-medium animate-pulse">
                      Preparing document...
                    </p>
                  </div>
                }
                onLoadSuccess={onDocumentLoadSuccess}>
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                  loading={
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                    </div>
                  }>
                  {renderHighlights()}
                  {renderNoteMarkers()}
                </Page>
              </Document>
            </div>
          </div>
        </div>

        {/* AI Chat Sidebar */}
        {showAiChat && (
          <div className="w-[400px] max-w-[80%] border-l border-gray-200 bg-white flex flex-col shadow-xl z-30 animate-in slide-in-from-right duration-300">
            <ResearchChatSidebar
              isOpen={showAiChat}
              onClose={() => setShowAiChat(false)}
              isAnnotatorMode={true}
              annotatorContext={{
                documentContent: textIndexRef.current.join("\n"),
                pdfAnnotations: annotations,
                projectTitle: title,
              }}
              papers={[
                {
                  id: fileId,
                  title: title,
                  source: "pdf_upload",
                  documentType: "pdf",
                },
              ]}
              pendingMessage={pendingAiQuery}
              onQueryConsumed={() => setPendingAiQuery(null)}
              onAnnotatorChat={async (messages, sessionId) => {
                return ResearchService.chatWithAnnotator(
                  messages,
                  {
                    documentContent: textIndexRef.current.join("\n"),
                    pdfAnnotations: annotations,
                    projectTitle: title,
                  },
                  sessionId,
                );
              }}
            />
          </div>
        )}
      </div>

      {/* Footer / Pagination */}
      <div className="h-12 flex items-center justify-between px-6 bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        {/* Page count */}
        <p className="text-xs text-gray-500 font-medium">
          {annotations.length} annotation{annotations.length !== 1 ? "s" : ""}
        </p>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
            className="p-1.5 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-20 text-gray-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
            <input
              type="number"
              min={1}
              max={numPages || 1}
              value={jumpPage || pageNumber}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={handleJumpPage}
              onBlur={() => setJumpPage("")}
              className="w-10 text-center border border-gray-200 rounded-md py-0.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <span className="text-gray-400 text-xs">/ {numPages || "?"}</span>
          </div>
          <button
            onClick={handleNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1.5 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-20 text-gray-500">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: keyboard hint */}
        <p className="text-[10px] text-gray-400">
          Press{" "}
          <kbd className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-mono">
            Esc
          </kbd>{" "}
          or click ✕ to close
        </p>
      </div>

      {/* Export loading overlay */}
      {isExporting && (
        <div className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center gap-4 max-w-sm w-full">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                {exportProgress}%
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Preparing Document
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Baking annotations into your PDF. This takes a few seconds...
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${exportProgress}%` }}
              />
            </div>

            <p className="text-[10px] text-gray-400 font-medium">
              Processing page{" "}
              {Math.ceil((exportProgress / 100) * (numPages || 1))} of{" "}
              {numPages}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
