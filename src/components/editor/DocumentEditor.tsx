import React, { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorProvider } from "./EditorContext";
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
import { ColumnLayoutExtension } from "../../extensions/ColumnLayoutExtension";
import { ImageExtension } from "../../extensions/AdvancedImageExtension";
import { AITrackingExtension } from "../../extensions/AITrackingExtension";
import { PlaceholderMarkExtension } from "../../extensions/PlaceholderMarkExtension";
import { MathExtension } from "../../extensions/MathExtension";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import { documentService, Project } from "../../services/documentService";
import {
  OriginalityScan,
  SimilarityMatch,
} from "../../services/originalityService";
import { AuthorshipService } from "../../services/authorshipService";
import "../../styles/highlight-styles.css";
import "../../styles/image-styles.css";
import "../../styles/column-styles.css";
import { useToast } from "../../hooks/use-toast";
import { TableBubbleMenu } from "./TableBubbleMenu";
import {
  OriginalityMapAdapter,
  // CitationConfidenceAdapter, // Removed/Replaced
  AuthorshipCertificateAdapter,
  RephraseAdapter,
  AIDetectionAdapter,
} from "./adapters";
import { CitationAuditAdapter } from "./adapters/CitationAuditAdapter";
import { UpgradeModal } from "../subscription/UpgradeModal";
import { SubscriptionService } from "../../services/subscriptionService";
import { DraftComparisonSelector } from "../originality/DraftComparisonSelector";
import { RightPanelType } from "./EditorWorkspacePage";
import { AIScanResult } from "../../services/aiDetectionService";
import BehavioralTracker from "./BehavioralTracker";
// import Image from "@tiptap/extension-image"; // Replaced
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { formatContentForTiptap } from "../../utils/editorUtils";
import { findTextRange } from "../../utils/searchUtils";
import { EditorToolbar } from "./editor-toolbar";
import { ExportWorkflowModal } from "../export/ExportWorkflowModal";
import {
  Download,
  GitCompare,
  Eraser,
  BookOpen,
  ShieldAlert,
  Bot,
  ShieldCheck,
  Maximize2,
  Minimize2
} from "lucide-react";



interface DocumentEditorProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
  onOpenPanel?: (panelType: RightPanelType, data?: any) => void;
  onOpenLeftPanel?: (panelType: "documents" | "audit", data?: any) => void;
  onEditorReady?: (editor: any) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  project,
  onProjectUpdate,
  onOpenPanel,
  onOpenLeftPanel,
  onEditorReady,
  isFocusMode = false,
  onToggleFocusMode,
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
  const [isExportWorkflowOpen, setIsExportWorkflowOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [lastScanResult, setLastScanResult] = useState<OriginalityScan | null>(
    null
  );
  const [, setLastAIScanResult] = useState<AIScanResult | null>(
    null
  );
  const [aiSentenceCache, setAiSentenceCache] = useState<Map<string, number>>(new Map());
  const [citationSuggestions] = useState<any>(null);
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
      // Image.configure({ ... }), // Replaced by ImageExtension
      MathExtension,
      Table.configure({
        resizable: true,
        // resizable: true, // Duplicate property removed
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextStyle,
      FontFamily,
      // Custom Extensions
      AuthorBlockExtension,
      AuthorExtension,
      CalloutBlockExtension,
      CoverPageExtension,
      CustomCodeBlockExtension,
      FigureExtension,
      KeywordsExtension,
      AITrackingExtension, // Add Custom AI Tracking Extension
      PricingTableExtension,
      SectionExtension,
      VisualElementExtension,
      ImageExtension,
      ColumnLayoutExtension,
      PlaceholderMarkExtension,
      Superscript,
      Subscript,
    ],
    content: formatContentForTiptap(project.content),
    onUpdate: () => {
      // Increment edit count when content changes
      setEditCount((prev) => prev + 1);
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none min-h-full prose-table:w-full prose-img:rounded-md prose-img:shadow-md`,
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

  const lastSyncStatsRef = useRef({
    timeSpent: 0,
    editCount: 0,
    aiEditCount: 0,
  });

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
      const currentStats = statsRef.current; // Current cumulative

      // Get AI stats from extension storage if available
      const currentAiEditCount = (editor?.storage as any).aiTracking?.aiEditCount || 0;

      // Calculate Deltas
      const timeDelta = currentStats.timeSpent - lastSyncStatsRef.current.timeSpent;
      const editDelta = currentStats.editCount - lastSyncStatsRef.current.editCount;
      const aiEditDelta = currentAiEditCount - lastSyncStatsRef.current.aiEditCount;

      // Only save if there's been NEW activity
      if (
        project.id &&
        (timeDelta > 0 || editDelta > 0 || aiEditDelta > 0)
      ) {
        try {
          // Update sync ref immediately to avoid double sending
          lastSyncStatsRef.current = {
            timeSpent: currentStats.timeSpent,
            editCount: currentStats.editCount,
            aiEditCount: currentAiEditCount,
          };

          await AuthorshipService.recordActivity({
            projectId: project.id,
            timeSpent: timeDelta, // SENDING DELTA
            editCount: editDelta, // SENDING DELTA
            wordCount: currentStats.wordCount, // Absolute is fine for word count (state)
            manualEdits: editDelta, // SENDING DELTA
            aiAssistedEdits: aiEditDelta, // SENDING DELTA
            isDelta: true, // Flag for backend
          } as any);

          console.log("Activity delta recorded:", {
            timeAdded: timeDelta,
            editsAdded: editDelta,
          });
        } catch (error) {
          console.error("Failed to record activity:", error);
          // Note: If fail, we technically "lost" this delta unless we revert the ref.
          // For simplicity/safety vs infinite loops, we accept minor loss on net error.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Import the utility dynamically or assumption it's available
    // We added it to src/utils/searchUtils.ts
    // For now we assume imports are handled or we need to add the import at top.
    const doc = editor.state.doc;
    let searchPos = 0;

    // Sort matches by position to ensure sequential search works best
    const sortedMatches = [...results.matches].sort(
      (a, b) => a.positionStart - b.positionStart
    );

    sortedMatches.forEach((match: SimilarityMatch) => {
      if (!match.sentenceText) return;

      // Use robust search from utility
      const range = findTextRange(doc, match.sentenceText, searchPos);

      if (!range) {
        // Match not found (possibly content changed significantly since scan)
        console.warn("Could not find match text in document", match.sentenceText);
        return;
      }

      // Advance search position to avoid re-matching the same text earlier in doc
      searchPos = range.to;

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
        // Use the specific range command
        editor.chain().highlightRange(range.from, range.to, {
          color,
          type: "originality",
          similarity: match.similarityScore,
          message: message,
        }).run();

      } catch (err) {
        console.error("Failed to highlight match:", match, err);
      }
    });
  };

  // Function to highlight AI detection results with persistent mapping
  const highlightAIResults = (results: AIScanResult) => {
    if (!editor || !results || !results.sentences) return;

    // Update the persistent cache
    const newCache = new Map(aiSentenceCache);
    results.sentences.forEach(s => {
      if (s.text && s.score !== undefined) {
        newCache.set(s.text.trim(), s.score);
      }
    });
    setAiSentenceCache(newCache);
    setLastAIScanResult(results);

    syncAIHighlights(newCache);
  };

  const syncAIHighlights = (cache: Map<string, number> = aiSentenceCache) => {
    if (!editor || cache.size === 0) return;

    const doc = editor.state.doc;

    // Efficiently apply highlights to all matching sentences in the document
    editor.chain().setMeta("addToHistory", false); // Don't clutter history

    cache.forEach((score, sentenceText) => {
      let lastPos = 0;
      // Find ALL occurrences of this sentence in the document
      while (true) {
        const range = findTextRange(doc, sentenceText, lastPos);
        if (!range) break;

        if (score >= 30) {
          editor.chain().highlightRange(range.from, range.to, {
            color: "purple",
            type: "ai",
            aiProbability: score,
            message: `AI Probability: ${Math.round(score)}%`,
          });
        }

        lastPos = range.to;
        if (lastPos >= doc.content.size) break;
      }
    });

    editor.chain().run();
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

  // Add Escape key listener for Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFocusMode && onToggleFocusMode) {
        onToggleFocusMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusMode, onToggleFocusMode]);




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


        // Auto-save happens silently - no need to notify user
      } else {
        console.error("Failed to save document:", result.error);
      }

      // setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving document:", error);
    } finally {
      // setIsSaving(false);
    }
  }, [editor, project.id, title, description, onProjectUpdate]);

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
    <EditorProvider editor={editor}>
      <div className={`flex flex-col h-full bg-white transition-all duration-500 ${isFocusMode ? "fixed inset-0 z-[100] p-0" : ""}`}>
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Draft Comparison"
          title="Premium Feature"
          message="Draft Comparison is available on paid plans. Upgrade to unlock accurate version comparison."
        />
        {/* Editor Header - Hidden in Focus Mode */}
        {!isFocusMode && (
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
                  onClick={() => setIsExportWorkflowOpen(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  title="Export Document">
                  <Download className="w-4 h-4" />
                  Export
                </button>

                <button
                  onClick={onToggleFocusMode}
                  className={`px-4 py-2 border rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isFocusMode
                    ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                >
                  {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  {isFocusMode ? "Exit Focus" : "Focus Mode"}
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
        )}

        {/* Editor Toolbar - Hidden in Focus Mode */}
        {!isFocusMode && <EditorToolbar editor={editor} />}

        {/* Editor Content & Sidebar Container */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
            {/* Main Editor Area */}
            <div className={`flex-1 overflow-auto transition-all duration-500 ${isFocusMode ? "p-12 md:p-24" : "p-8"}`}>
              {editor && <TableBubbleMenu editor={editor} />}
              <EditorContent
                editor={editor}
                className={`${isFocusMode ? "max-w-[900px]" : "max-w-[816px]"} mx-auto prose prose-lg min-h-full focus:outline-none p-8 bg-white rounded-lg shadow-sm`}
              />
              {/* Behavioral Tracker */}
              <BehavioralTracker projectId={project.id} userId={project.user_id} />
            </div>
          </div>
        </div>

        {/* Floating Exit Button - Visible ONLY in Focus Mode */}
        {isFocusMode && onToggleFocusMode && (
          <button
            onClick={onToggleFocusMode}
            className="fixed top-6 right-6 z-[110] px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2 opacity-50 hover:opacity-100"
            title="Exit Focus Mode (Esc)"
          >
            <Minimize2 className="w-4 h-4" />
            Exit Focus (Esc)
          </button>
        )}

        {/* Editor Footer with Stats - Hidden in Focus Mode */}
        {!isFocusMode && (
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

            <CitationAuditAdapter
              projectId={project.id}
              editor={editor}
              onScanComplete={(results) => {
                if (onOpenLeftPanel) {
                  onOpenLeftPanel("audit", results);
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

            {/*<AIDetectionAdapter
              projectId={project.id}
              editor={editor}
              onScanComplete={(results) => {
                setLastAIScanResult(results);
                highlightAIResults(results);
                if (onOpenPanel) {
                  onOpenPanel("ai-results", results);
                }
              }}
            /> */}

            <AuthorshipCertificateAdapter
              projectId={project.id}
              projectTitle={title}
              editor={editor}
            />
          </div>
        )}

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

        <ExportWorkflowModal
          isOpen={isExportWorkflowOpen}
          onClose={() => setIsExportWorkflowOpen(false)}
          project={{ ...project, title }}
          currentContent={editor?.getJSON()}
          currentHtmlContent={editor?.getHTML()}
        />
      </div>
    </EditorProvider>
  );
};
