"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  FileText,
  Sparkles,
  LayoutList,
  Share2,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ResearchChatSidebar } from "../../research/ResearchChatSidebar";
import { ResearchService } from "../../../services/researchService";
import { supabase } from "../../../lib/supabase/client";

export default function PdfChatViewerPage() {
  const { pdfId } = useParams();
  const [searchParams] = useSearchParams();
  const sourceType = (searchParams.get("type") || "pdf") as "pdf" | "project";

  const [activeTab, setActiveTab] = useState<"view" | "summary" | "related">(
    "view",
  );
  const [showChat, setShowChat] = useState(true);
  const [pdfData, setPdfData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [projectContent, setProjectContent] = useState<any | null>(null); // raw Tiptap JSON
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [relatedPapers, setRelatedPapers] = useState<any[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Text selection → chat
  const [selectedText, setSelectedText] = useState("");
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [selectionQuery, setSelectionQuery] = useState<string | null>(null);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Small delay so selection is finalised
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";
      if (text.length > 5) {
        setSelectedText(text);
        setTooltipPos({ x: e.clientX, y: e.clientY });
      } else {
        setTooltipPos(null);
      }
    }, 50);
  }, []);

  // Hide tooltip when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const tooltip = document.getElementById("sel-chat-tooltip");
      if (tooltip && !tooltip.contains(e.target as Node)) {
        setTooltipPos(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAskAboutSelection = () => {
    const msg = `I've selected the following passage:\n\n"${selectedText}"\n\nCan you explain or elaborate on this?`;
    setSelectionQuery(msg);
    setShowChat(true);
    setTooltipPos(null);
    window.getSelection()?.removeAllRanges();
  };

  React.useEffect(() => {
    if (!pdfId) return;

    const fetchPdf = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          console.error("No auth token found");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch Metadata based on source type
        if (sourceType === "pdf") {
          const res = await fetch(`/api/pdf/${pdfId}`, { headers });
          if (res.ok) {
            const data = await res.json();
            setPdfData(data);
          } else {
            console.error("Failed to fetch PDF data");
          }
        } else {
          // For projects, fetch from documents API
          const res = await fetch(`/api/documents/${pdfId}`, { headers });
          if (res.ok) {
            const data = await res.json();
            const projectData = data.data;
            setPdfData(projectData);

            // Store raw Tiptap JSON for structured rendering
            if (projectData?.content) {
              setProjectContent(projectData.content);
            }
          } else {
            console.error("Failed to fetch project data");
          }
        }

        // Fetch PDF Blob for Viewer (only for PDFs, not projects)
        if (sourceType === "pdf") {
          try {
            const blobRes = await fetch(`/api/pdf/${pdfId}/download`, {
              headers,
            });
            if (blobRes.ok) {
              const blob = await blobRes.blob();
              const url = URL.createObjectURL(blob);
              setPdfBlobUrl(url);
            } else {
              console.error("Failed to download PDF file");
            }
          } catch (downloadErr) {
            console.error("Error downloading PDF:", downloadErr);
          }
        }
      } catch (error) {
        console.error("Error fetching PDF:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPdf();

    // Cleanup blob URL
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfId, pdfBlobUrl, sourceType]);

  // Fetch summary when tab is active
  React.useEffect(() => {
    if (activeTab === "summary" && !summary && !loadingSummary && pdfId) {
      const fetchSummary = async () => {
        setLoadingSummary(true);
        try {
          const chatMethod =
            sourceType === "pdf"
              ? ResearchService.chatWithPdf
              : ResearchService.chatWithProject;

          const result = await chatMethod(
            "Please provide a comprehensive summary of this document, highlighting the main objectives, methodology, key results, and conclusions.",
            pdfId as string,
          );
          setSummary(result);
        } catch (err) {
          console.error("Failed to generate summary:", err);
        } finally {
          setLoadingSummary(false);
        }
      };
      fetchSummary();
    }
  }, [activeTab, pdfId, summary, loadingSummary, sourceType]);

  // Fetch related papers when tab is active
  React.useEffect(() => {
    if (
      activeTab === "related" &&
      relatedPapers.length === 0 &&
      !loadingRelated &&
      pdfId
    ) {
      setLoadingRelated(true);
      const fetchRelated = async () => {
        try {
          // We need token for authorized request
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const token = session?.access_token;

          // Related papers is only supported for PDFs (uses filename-based search)
          // Projects don't have a dedicated related endpoint
          if (sourceType !== "pdf") {
            setRelatedPapers([]);
            return;
          }

          const res = await fetch(`/api/pdf/${pdfId}/related`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (res.ok) {
            const data = await res.json();
            setRelatedPapers(data);
          }
        } catch (err) {
          console.error("Error fetching related papers:", err);
        } finally {
          setLoadingRelated(false);
        }
      };
      fetchRelated();
    }
  }, [activeTab, pdfId, relatedPapers.length, loadingRelated, sourceType]);

  const filename =
    (sourceType === "project" ? pdfData?.title : pdfData?.filename) ||
    searchParams.get("name") ||
    "Document";

  // Renders a Tiptap JSON node tree into styled React elements
  const renderTiptapNode = (
    node: any,
    key: string | number,
  ): React.ReactNode => {
    if (!node) return null;

    // Inline text with marks
    if (node.type === "text") {
      let el: React.ReactNode = node.text || "";
      const marks: string[] = (node.marks || []).map((m: any) => m.type);
      if (marks.includes("bold")) el = <strong key={key}>{el}</strong>;
      if (marks.includes("italic")) el = <em key={key}>{el}</em>;
      if (marks.includes("underline")) el = <u key={key}>{el}</u>;
      if (marks.includes("strike")) el = <s key={key}>{el}</s>;
      if (marks.includes("code"))
        el = (
          <code key={key} className="bg-muted px-1 rounded text-xs font-mono">
            {el}
          </code>
        );
      return el;
    }

    const children = node.content?.map((child: any, i: number) =>
      renderTiptapNode(child, i),
    );

    switch (node.type) {
      case "doc":
        return (
          <div key={key} className="space-y-4">
            {children}
          </div>
        );
      case "heading": {
        const level = node.attrs?.level || 1;
        const cls = [
          "font-bold text-foreground mt-6 mb-2",
          level === 1
            ? "text-2xl"
            : level === 2
              ? "text-xl"
              : level === 3
                ? "text-lg"
                : "text-base",
        ].join(" ");
        const Tag = `h${level}` as any;
        return (
          <Tag key={key} className={cls}>
            {children}
          </Tag>
        );
      }
      case "paragraph":
        return (
          <p key={key} className="text-sm leading-relaxed text-foreground mb-3">
            {children?.length ? children : <br />}
          </p>
        );
      case "bulletList":
        return (
          <ul
            key={key}
            className="list-disc list-inside space-y-1 mb-3 text-sm text-foreground">
            {children}
          </ul>
        );
      case "orderedList":
        return (
          <ol
            key={key}
            className="list-decimal list-inside space-y-1 mb-3 text-sm text-foreground">
            {children}
          </ol>
        );
      case "listItem":
        return (
          <li key={key} className="leading-relaxed">
            {children}
          </li>
        );
      case "blockquote":
        return (
          <blockquote
            key={key}
            className="border-l-4 border-primary/40 pl-4 italic text-muted-foreground text-sm mb-3">
            {children}
          </blockquote>
        );
      case "codeBlock":
        return (
          <pre
            key={key}
            className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto mb-3">
            <code>{children}</code>
          </pre>
        );
      case "horizontalRule":
        return <hr key={key} className="border-border my-4" />;
      default:
        return <div key={key}>{children}</div>;
    }
  };

  // Real paper object for chat context
  const paperContext = pdfData
    ? {
        externalId: pdfData.id,
        title: sourceType === "project" ? pdfData.title : pdfData.filename,
        source: "pdf_upload" as const,
        documentType: sourceType,
        abstract: summary || "PDF Upload",
        authors: [{ name: "User Uploaded" }],
        year: new Date(pdfData.created_at).getFullYear(),
      }
    : {
        // Fallback/Loading context to preventing crashing before load
        externalId: pdfId as string,
        title: filename,
        source: "pdf_upload" as const,
        documentType: sourceType,
        abstract: "Loading...",
        authors: [],
        year: new Date().getFullYear(),
      };

  return (
    <div className="flex w-full h-[calc(100vh-4rem)] bg-background overflow-hidden relative">
      {/* Floating selection tooltip */}
      {tooltipPos && (
        <div
          id="sel-chat-tooltip"
          style={{
            position: "fixed",
            top: tooltipPos.y - 48,
            left: tooltipPos.x - 60,
            zIndex: 9999,
          }}
          className="flex items-center gap-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-xl border border-white/10 animate-in fade-in zoom-in-95 duration-150">
          <MessageCircle className="w-3.5 h-3.5 text-violet-300" />
          <button
            onClick={handleAskAboutSelection}
            className="hover:text-violet-300 transition-colors whitespace-nowrap">
            Ask AI about this
          </button>
          {/* Caret */}
          <span
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-gray-900 dark:bg-gray-800"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
          />
        </div>
      )}

      {/* Main Content Column */}
      <div
        className="flex-1 flex flex-col min-w-0 h-full"
        onMouseUp={handleMouseUp}>
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-border shrink-0 bg-background z-10">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              to="/dashboard/pdf-upload"
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-foreground truncate max-w-[300px] sm:max-w-md">
                {filename}
              </h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-1.5 py-0.5 rounded font-medium">
                  {sourceType === "project" ? "Document" : "PDF"}
                </span>
                <span>•</span>
                <span>Ready to chat</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tabs (Desktop) */}
            <div className="hidden md:flex items-center p-1 bg-muted/50 border border-border/50 rounded-xl backdrop-blur-sm mr-2">
              {[
                {
                  id: "view",
                  label:
                    sourceType === "project" ? "View Document" : "View PDF",
                  icon: FileText,
                },
                { id: "summary", label: "Summary", icon: LayoutList },
                ...(sourceType !== "project"
                  ? [{ id: "related", label: "Related Papers", icon: Share2 }]
                  : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 group ${
                    activeTab === tab.id
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-200" />
                  )}
                  <tab.icon
                    className={`w-3.5 h-3.5 relative z-10 ${
                      activeTab === tab.id
                        ? "text-white"
                        : "group-hover:scale-110 transition-transform"
                    }`}
                  />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Ask AI Button */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-md ${
                showChat
                  ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-violet-500/25 ring-2 ring-violet-500/20"
                  : "bg-background border border-border text-muted-foreground hover:border-violet-500/50 hover:text-foreground hover:shadow-lg hover:shadow-violet-500/10"
              }`}>
              {showChat && (
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
              )}
              <Sparkles
                className={`w-4 h-4 transition-transform duration-300 ${
                  showChat
                    ? "text-white animate-pulse"
                    : "text-muted-foreground group-hover:text-violet-500 group-hover:rotate-12"
                }`}
              />
              <span className="hidden sm:inline">Ask AI</span>
              {showChat && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Tabs (Visible on small screens) */}
        <div className="flex md:hidden bg-background border-b border-border overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("view")}
            className={`flex-1 min-w-[100px] px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === "view"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <FileText className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex-1 min-w-[100px] px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === "summary"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <LayoutList className="w-4 h-4" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab("related")}
            className={`flex-1 min-w-[100px] px-4 py-3 text-xs font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === "related"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <Share2 className="w-4 h-4" />
            Related
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 bg-muted/30 overflow-hidden relative w-full h-full">
          {activeTab === "view" && (
            <div className="w-full h-full flex flex-col items-center justify-center p-0">
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Loading document...
                  </span>
                </div>
              ) : pdfBlobUrl ? (
                <iframe
                  src={pdfBlobUrl}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              ) : sourceType === "project" && projectContent ? (
                <div className="w-full h-full overflow-y-auto p-6 md:p-10 flex justify-center bg-muted/20">
                  <div className="w-full max-w-3xl bg-card rounded-2xl shadow-sm border border-border p-8 md:p-10 self-start">
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                      {filename}
                    </h1>
                    <p className="text-xs text-muted-foreground mb-6 border-b border-border pb-4">
                      {pdfData?.word_count?.toLocaleString() || ""} words
                    </p>
                    <div className="prose-sm max-w-none">
                      {renderTiptapNode(projectContent, "root")}
                    </div>
                  </div>
                </div>
              ) : sourceType === "project" ? (
                <div className="w-full max-w-4xl h-full bg-card shadow-sm border border-border rounded-xl overflow-hidden flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="w-16 h-16 mb-4 opacity-20" />
                  <p>This project has no content yet.</p>
                </div>
              ) : (
                <div className="w-full max-w-4xl h-full bg-card shadow-sm border border-border rounded-xl overflow-hidden flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="w-16 h-16 mb-4 opacity-20" />
                  <p>Document not available</p>
                  <p className="text-xs mt-2 text-muted-foreground">
                    Could not load the PDF file.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "summary" && (
            <div className="w-full h-full overflow-y-auto p-8 flex justify-center">
              <div className="w-full max-w-3xl bg-card rounded-2xl p-8 shadow-sm border border-border min-h-[500px]">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  <h2 className="text-xl font-bold text-foreground">
                    Document Summary
                  </h2>
                </div>

                {loadingSummary ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ) : summary ? (
                  <div className="prose prose-blue dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                    {summary}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Failed to generate summary. Please try again.</p>
                    <button
                      onClick={() => {
                        setSummary(null);
                        setLoadingSummary(false);
                      }} // Retry logic could be better
                      className="mt-4 text-primary hover:underline">
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "related" && (
            <div className="w-full h-full overflow-y-auto p-4 md:p-8 flex justify-center">
              <div className="w-full max-w-4xl bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border min-h-[500px]">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                  <Share2 className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-bold text-foreground">
                    Related Research
                  </h2>
                </div>

                {loadingRelated ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="p-4 border border-border rounded-xl animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : relatedPapers && relatedPapers.length > 0 ? (
                  <div className="grid gap-4">
                    {relatedPapers.map((paper: any) => (
                      <div
                        key={paper.paperId || paper.externalId || paper.url}
                        className="group relative p-5 border border-border rounded-xl hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all bg-card">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="font-semibold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
                              <a
                                href={paper.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline">
                                {paper.title}
                              </a>
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {paper.abstract}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>{paper.year}</span>
                              <span>•</span>
                              <span>
                                {paper.authors
                                  ?.map((a: any) => a.name)
                                  .slice(0, 3)
                                  .join(", ")}
                              </span>
                              {paper.citationCount > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600 font-medium">
                                    {paper.citationCount} Citations
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-muted text-muted-foreground rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            <Share2 className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Share2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p>No related papers found.</p>
                    <p className="text-xs mt-2">
                      Try uploading a document with a clear title.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar (Right) */}
      <div
        className={`transition-all duration-300 ease-in-out border-l border-border bg-background ${
          showChat
            ? "w-[400px] translate-x-0"
            : "w-0 translate-x-full opacity-0"
        } overflow-hidden h-full shadow-lg z-20 shrink-0`}>
        <div className="w-[400px] h-full">
          {paperContext.externalId && (
            <ResearchChatSidebar
              isOpen={showChat}
              onClose={() => setShowChat(false)}
              papers={[paperContext]}
              pendingMessage={selectionQuery}
              onQueryConsumed={() => setSelectionQuery(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
