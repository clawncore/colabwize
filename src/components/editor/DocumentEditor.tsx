import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount } from "@tiptap/extension-character-count";
import { HighlightExtension } from "../../extensions/HighlightExtension";
import { AuthorBlockExtension } from "../../extensions/AuthorBlockExtension";
import { AuthorExtension } from "../../extensions/AuthorExtension";
import { CalloutBlockExtension } from "../../extensions/CalloutBlockExtension";
import { CoverPageExtension } from "../../extensions/CoverPageExtension";
import { CustomCodeBlockExtension } from "../../extensions/CustomCodeBlockExtension";
import { FigureExtension } from "../../extensions/FigureExtension";
import { KeywordsExtension } from "../../extensions/KeywordsExtension";
import { PricingTableExtension } from "../../extensions/PricingTableExtension";
import { SectionExtension } from "../../extensions/SectionExtension";
import { VisualElementExtension } from "../../extensions/VisualElementExtension";
import { documentService, Project } from "../../services/documentService";
import {
  OriginalityScan,
  SimilarityMatch,
} from "../../services/originalityService";
import { AuthorshipService } from "../../services/authorshipService";
import "../../styles/highlight-styles.css";
import { useToast } from "../../hooks/use-toast";
import {
  OriginalityMapAdapter,
  CitationConfidenceAdapter,
  AuthorshipCertificateAdapter,
  RephraseAdapter,
} from "./adapters";
import { UpgradeModal } from "../subscription/UpgradeModal";
import { SubscriptionService } from "../../services/subscriptionService";
import { DraftComparisonSelector } from "../originality/DraftComparisonSelector";
import { RightPanelType } from "./EditorWorkspacePage";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { formatContentForTiptap } from "../../utils/editorUtils";
import { EditorToolbar } from "./editor-toolbar";
import { ActionChecklistModal } from "../export/ActionChecklistModal";
import { ExportFormatModal } from "../export/ExportFormatModal";
import {
  Download,
  GitCompare,
  Eraser,
  BookOpen,
  ShieldAlert,
  Bot,
  ShieldCheck,
} from "lucide-react";

interface DocumentEditorProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
  onOpenPanel?: (panelType: RightPanelType, data?: any) => void;
  onEditorReady?: (editor: any) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  project,
  onProjectUpdate,
  onOpenPanel,
  onEditorReady,
}) => {
  const { toast } = useToast();
  // const [editorState, setEditorState] = useState(project.content);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");
  // const [isSaving, setIsSaving] = useState(false);
  // const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Dialog States
  const [isComparisonSelectorOpen, setIsComparisonSelectorOpen] =
    useState(false);
  const [isActionChecklistOpen, setIsActionChecklistOpen] = useState(false);
  const [isExportFormatOpen, setIsExportFormatOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [lastScanResult, setLastScanResult] = useState<OriginalityScan | null>(
    null
  );
  const [citationSuggestions, setCitationSuggestions] = useState<any>(null);
  const [editCount, setEditCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0); // in seconds
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedContentRef = useRef(false);
  const currentProjectIdRef = useRef<string | null>(null);

  // Layout State

  // Sync state when project changes
  useEffect(() => {
    setTitle(project.title);
    setDescription(project.description || "");
  }, [project.id, project.title, project.description]);

  // Initialize editor with project content or create empty content
  const editor = useEditor({
    extensions: [
      StarterKit,
      HighlightExtension,
      CharacterCount,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      // Custom Extensions
      AuthorBlockExtension,
      AuthorExtension,
      CalloutBlockExtension,
      CoverPageExtension,
      CustomCodeBlockExtension,
      FigureExtension,
      KeywordsExtension,

      PricingTableExtension,

      SectionExtension,
      VisualElementExtension,
    ],
    content: formatContentForTiptap(project.content),
    onUpdate: () => {
      // Increment edit count when content changes
      setEditCount((prev) => prev + 1);
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-full prose-table:w-full prose-img:rounded-md prose-img:shadow-md",
      },
    },
  });

  // Load project content only once per document
  useEffect(() => {
    if (editor) {
      // Notify parent that editor is ready
      if (onEditorReady) {
        onEditorReady(editor);
      }
    }

    if (
      editor &&
      project.content &&
      currentProjectIdRef.current !== project.id
    ) {
      // If we're switching to a different project, reset the initialization flag
      if (
        currentProjectIdRef.current &&
        currentProjectIdRef.current !== project.id
      ) {
        hasInitializedContentRef.current = false;
      }

      // Only set content if we haven't initialized for this project yet
      if (!hasInitializedContentRef.current) {
        editor.commands.setContent(formatContentForTiptap(project.content));
        hasInitializedContentRef.current = true;
        currentProjectIdRef.current = project.id;
      }
    }
  }, [project.id, project.content, editor, onEditorReady]);

  // Track time spent and periodically save activity
  // Refs to track current state without triggering re-renders in the interval
  const statsRef = useRef({
    timeSpent: 0,
    editCount: 0,
    wordCount: 0,
  });

  // Update refs when state changes
  useEffect(() => {
    statsRef.current = {
      timeSpent,
      editCount,
      wordCount: project.word_count || 0,
    };
  }, [timeSpent, editCount, project.word_count]);

  // Track time spent and periodically save activity
  useEffect(() => {
    // Start timer when component mounts
    startTimeRef.current = new Date();

    // Update time spent every second (UI only)
    const timeInterval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    // Save activity every 30 seconds (Backend sync)
    const activityInterval = setInterval(async () => {
      const currentStats = statsRef.current;

      // Only save if there's been some activity or if time has passed
      // We check if we have a project ID and data to save
      if (
        project.id &&
        (currentStats.editCount > 0 || currentStats.timeSpent > 0)
      ) {
        try {
          await AuthorshipService.recordActivity({
            projectId: project.id,
            timeSpent: currentStats.timeSpent,
            editCount: currentStats.editCount,
            wordCount: currentStats.wordCount,
          });
          console.log("Activity recorded (Auto-sync):", {
            timeSpent: currentStats.timeSpent,
            editCount: currentStats.editCount,
          });
        } catch (error) {
          console.error("Failed to record activity:", error);
        }
      }
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(timeInterval);
      clearInterval(activityInterval);

      // Save final activity on unmount
      const finalStats = statsRef.current;
      if (
        project.id &&
        (finalStats.editCount > 0 || finalStats.timeSpent > 0)
      ) {
        AuthorshipService.recordActivity({
          projectId: project.id,
          timeSpent: finalStats.timeSpent,
          editCount: finalStats.editCount,
          wordCount: finalStats.wordCount,
        }).catch(console.error);
      }
    };
  }, [project.id]); // Only re-run if project ID changes

  // Function to clear all highlights
  const clearHighlights = () => {
    if (editor) {
      // Remove all highlight marks from the entire document using custom command
      editor.commands.clearAllHighlights();
    }
  };

  // Function to highlight originality results
  const highlightOriginalityResults = (results: OriginalityScan) => {
    if (!editor || !results || !results.matches) return;

    // Clear existing highlights
    clearHighlights();

    // Use text search to find precise positions, as backend offsets may drift
    // due to differences in how block separators are counted (\n vs </p><p>)
    const doc = editor.state.doc;
    const docText = editor.getText(); // Get text representation with block separators
    let searchCursor = 0;

    // Sort matches by position to ensure sequential search works best
    const sortedMatches = [...results.matches].sort(
      (a, b) => a.positionStart - b.positionStart
    );

    sortedMatches.forEach((match: SimilarityMatch) => {
      if (!match.sentenceText) return;

      // Find the text in the document, starting near where we expect it
      // We look ahead from the last cursor position
      const foundIndex = docText.indexOf(match.sentenceText, searchCursor);

      if (foundIndex === -1) {
        // Fallback: simple position mapping if search fails (unlikely)
        return;
      }

      // Advance cursor to avoid re-matching the same text
      searchCursor = foundIndex + 1;

      // Map the Text Index to a ProseMirror Node Position
      // Tiptap's getText() usually separates blocks with \n\n (length 2)
      // ProseMirror blocks are separated by closing/opening tags (length 2)
      // So we just need to account for the initial position and ensure we map correctly across nodes
      const fromPos = mapTextIndexToPos(doc, foundIndex);
      const toPos = mapTextIndexToPos(
        doc,
        foundIndex + match.sentenceText.length
      );

      // Determine color based on classification
      let color = "yellow";
      switch (match.classification) {
        case "green":
        case "common_phrase":
          color = "green";
          break;
        case "red":
        case "needs_citation":
          color = "red";
          break;
        case "blue":
        case "quoted_correctly":
          color = "blue";
          break;
        case "yellow":
        case "close_paraphrase":
        default:
          color = "yellow";
      }

      // Create a descriptive message for the tooltip
      let message = `Similarity found: ${Math.round(match.similarityScore)}% match.`;
      if (match.matchedSource) {
        message += ` Source: ${match.matchedSource}`;
      }

      switch (match.classification) {
        case "red":
        case "needs_citation":
          message = `⚠️ Significant similarity detected (${Math.round(match.similarityScore)}%). ${match.matchedSource ? `Matches text from: ${match.matchedSource}` : "Consider rewriting or citing."}`;
          break;
        case "green":
        case "common_phrase":
          message = "Common phrase. Likely safe to ignore.";
          break;
        case "blue":
        case "quoted_correctly":
          message = "Correctly quoted text.";
          break;
      }

      // Apply the highlight mark
      try {
        editor.commands.setTextSelection({ from: fromPos, to: toPos });
        editor.commands.setHighlight({
          color,
          type: "originality",
          similarity: match.similarityScore,
          message: message,
        });
      } catch (err) {
        console.error("Failed to highlight match:", match, err);
      }
    });
  };

  // Helper to map a plain text index (from getText) to a ProseMirror position
  const mapTextIndexToPos = (doc: any, targetIndex: number): number => {
    // Tiptap's getText() usually separates blocks with \n\n (length 2)
    // ProseMirror positions jump by 2 for each block boundary (</p><p>)
    // Since getText() length aligns with Position length for block separators (2 chars vs 2 pos),
    // we generally just need to account for the initial block opening tag (+1)
    return targetIndex + 1;
  };

  // Function to highlight citation confidence signals
  const highlightCitationSignals = (results: {
    suggestions: {
      sentence: string;
      suggestion: string;
      type: "factual_claim" | "definition" | "statistic";
    }[];
  }) => {
    if (!editor || !results || !results.suggestions) return;

    // Clear existing highlights
    clearHighlights();

    // Get full document text to find positions
    const docText = editor.getText();

    results.suggestions.forEach((item) => {
      // Find position of sentence in document
      // Note: This is a simple verification implementation. In production, we'd want more robust fuzzy matching.
      const index = docText.indexOf(item.sentence);

      if (index >= 0) {
        const from = index + 1; // +1 to account for potential offset
        const to = index + item.sentence.length + 1;

        // Determine color based on type
        let color = "purple"; // Default for definitions
        if (item.type === "statistic") color = "orange";
        if (item.type === "factual_claim") color = "pink";

        editor.commands.setTextSelection({ from, to });
        editor.commands.setHighlight({
          color,
          type: "citation_signal",
          message: item.suggestion, // User requested output
        });
      }
    });
  };

  // Track time spent writing
  useEffect(() => {
    startTimeRef.current = new Date();

    // Start interval to track time
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const currentTime = new Date();
        const timeDiff = Math.floor(
          (currentTime.getTime() - startTimeRef.current.getTime()) / 1000
        );
        setTimeSpent(timeDiff);
      }
    }, 1000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!editor) return;

    // setIsSaving(true);

    try {
      // Get the current content from the editor
      const content = editor.getJSON();

      // Update the project in the database
      // const updatedProject = {
      //   ...project,
      //   title,
      //   description,
      //   content,
      //   word_count: editor.storage.characterCount.words(),
      // };

      // Update the project via API
      const result = await documentService.updateProject(
        project.id,
        title,
        description,
        content,
        editor.storage.characterCount.words()
      );

      if (result.success && result.data) {
        if (onProjectUpdate) {
          onProjectUpdate(result.data);
        }

        // Show simplified toast for user feedback
        toast({
          title: "Changes Saved",
          description: "Your work has been automatically saved.",
          duration: 2000,
        });
      } else {
        console.error("Failed to save document:", result.error);
      }

      // setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      // setIsSaving(false);
    }
  }, [editor, project.id, title, description, onProjectUpdate, toast]);

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (editCount > 0) {
        // Only save if there have been edits
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [editCount, handleSave]);

  // Format time spent into human-readable format
  const formatTimeSpent = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Callback handlers for adapter components
  const handleOriginalityScanComplete = (results: OriginalityScan) => {
    setLastScanResult(results);
    highlightOriginalityResults(results);
    toast({
      title: "Originality Scan Completed",
      description: `Overall score: ${results.overallScore}%`,
      variant: "default",
    });

    if (results.realityCheck && onOpenPanel) {
      onOpenPanel("reality-check", results.realityCheck);
    }
  };

  const handleCompareClick = async () => {
    try {
      const hasAccess =
        await SubscriptionService.hasFeatureAccess("draft_comparison");
      if (hasAccess) {
        setIsComparisonSelectorOpen(true);
      } else {
        setShowUpgradeModal(true);
      }
    } catch (error) {
      console.error("Failed to check feature access", error);
      setShowUpgradeModal(true);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan="free"
        usageStats={{ used: 1, limit: 1 }}
        featureName="Draft Comparison"
      />
      {/* Editor Header */}
      <div className="border-b border-gray-200 p-4 bg-white z-10 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold w-full border-none focus:outline-none focus:ring-0 pl-8 text-gray-900"
              placeholder="Untitled Document"
            />
          </div>
          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={() => setIsActionChecklistOpen(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Export Document">
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Clear Highlights"
              onClick={() => {
                clearHighlights();
                toast({
                  title: "Highlights Cleared",
                  description: "All highlights have been cleared",
                  variant: "default",
                });
              }}>
              <Eraser className="w-4 h-4" />
              Clear Highlights
            </button>

            {/* Feature Adapter Components */}
            <OriginalityMapAdapter
              projectId={project.id}
              editor={editor}
              onScanComplete={handleOriginalityScanComplete}
            />

            <button
              onClick={handleCompareClick}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Compare with Previous">
              <GitCompare className="w-4 h-4" />
              Compare
            </button>

            {lastScanResult?.realityCheck && (
              <button
                onClick={() =>
                  onOpenPanel?.("reality-check", lastScanResult.realityCheck)
                }
                className="px-4 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2"
                title="View Reality Check">
                <ShieldAlert className="w-4 h-4" />
                Reality Check
              </button>
            )}

            {/* Anxiety Reality Check Panel - Prominently featured */}
            {lastScanResult?.realityCheck && (
              <div className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-md text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Score: {Math.round(lastScanResult.overallScore)}%</span>
                <span className="text-xs bg-white px-2 py-1 rounded">
                  {lastScanResult.realityCheck.trustScore > 70
                    ? "Good"
                    : lastScanResult.realityCheck.trustScore > 40
                      ? "Review"
                      : "Attention"}
                </span>
              </div>
            )}

            <RephraseAdapter
              projectId={project.id}
              editor={editor}
              onOpenRephrasePanel={(suggestions, originalText) => {
                // Open the rephrase suggestions panel in the right sidebar
                if (onOpenPanel) {
                  onOpenPanel("rephrase", { suggestions, originalText });
                }
              }}
            />
            <button
              className="p-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              title="More Options">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Content & Sidebar Container */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
          {/* Main Editor Area */}
          <div className="flex-1 overflow-auto p-8">
            <EditorContent
              editor={editor}
              className="max-w-4xl mx-auto prose prose-lg min-h-full focus:outline-none p-4 bg-white rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Editor Footer with Stats */}
      <div className="border-t border-gray-200 px-8 py-3 bg-white text-sm text-gray-500 flex flex-wrap items-center justify-between gap-4 z-10 flex-shrink-0">
        <div className="flex items-center gap-6">
          {editor && (
            <span className="font-medium">
              {editor.storage.characterCount.words()} words
            </span>
          )}
          <span className="text-gray-600">
            Time: {formatTimeSpent(timeSpent)}
          </span>
          <span className="text-gray-600">Edits: {editCount}</span>
        </div>
        <div className="w-px h-6 bg-gray-300"></div>
        <CitationConfidenceAdapter
          projectId={project.id}
          editor={editor}
          onContentScanComplete={(result) => {
            highlightCitationSignals(result);
            setCitationSuggestions(result);
            // Open the confidence panel to show the score
            if (onOpenPanel) {
              onOpenPanel("citation-confidence");
            }
          }}
          onFindPapers={(keywords) => {
            if (onOpenPanel) {
              onOpenPanel("citations", { contextKeywords: keywords });
            }
          }}
        />

        <button
          onClick={() =>
            onOpenPanel?.("ai-chat", {
              selectedText: editor?.getAttributes("highlight")?.message,
              originalityResults: lastScanResult,
              citationSuggestions: citationSuggestions,
            })
          }
          className="px-4 py-2 border border-purple-200 bg-purple-50 text-purple-700 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors flex items-center gap-2"
          title="AI Integrity Assistant">
          <Bot className="w-4 h-4" />
          Ask Integrity AI
        </button>

        <button
          onClick={() => onOpenPanel?.("citations")}
          className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
          title="Find Missing Citations">
          <BookOpen className="w-4 h-4" />
          Find Papers
        </button>

        <AuthorshipCertificateAdapter
          projectId={project.id}
          projectTitle={title}
          editor={editor}
        />
      </div>
      {/* Reality Check Manual Trigger */}
      {lastScanResult && (
        <div className="fixed top-20 right-4 z-50">
          <button
            onClick={() => {
              if (onOpenPanel) {
                const stats = lastScanResult.realityCheck || {
                  referencePercent: 45,
                  commonPhrasePercent: 12,
                  trustScore: 85,
                  message: "Good citation practice detected.",
                };
                onOpenPanel("reality-check", stats);
              }
            }}
            className="bg-white/90 backdrop-blur border border-indigo-100 shadow-sm px-3 py-1.5 rounded-full text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1.5">
            <span>🛡️ Reality Check</span>
          </button>
        </div>
      )}

      {/* Comparison Selector Dialog */}
      <DraftComparisonSelector
        isOpen={isComparisonSelectorOpen}
        onClose={() => setIsComparisonSelectorOpen(false)}
        currentDraftContent={editor?.getText() || ""}
        onComparisonComplete={(result) => {
          if (onOpenPanel) {
            onOpenPanel("draft-comparison", result);
          }
        }}
        excludeProjectId={project.id}
      />

      <ActionChecklistModal
        isOpen={isActionChecklistOpen}
        onClose={() => setIsActionChecklistOpen(false)}
        onContinue={() => {
          setIsActionChecklistOpen(false);
          setIsExportFormatOpen(true);
        }}
      />

      <ExportFormatModal
        isOpen={isExportFormatOpen}
        onClose={() => setIsExportFormatOpen(false)}
        project={{ ...project, title }}
        currentContent={editor?.getJSON()}
      />
    </div>
  );
};
