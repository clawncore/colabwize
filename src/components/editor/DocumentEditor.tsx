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

import { EnhancedFigureNode } from "../../extensions/EnhancedFigureNode";
import { AutoNumbering } from "../../extensions/AutoNumbering";
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
} from "../../services/originalityService";

import { AuthorshipService } from "../../services/authorshipService";
import "../../styles/highlight-styles.css";
import "../../styles/image-styles.css";
import "../../styles/column-styles.css";
import { useToast } from "../../hooks/use-toast";
import { TableBubbleMenu } from "./TableBubbleMenu";
import {
  // AIDetectionAdapter,
  OriginalityMapAdapter,
  // CitationConfidenceAdapter, // Removed/Replaced
  AuthorshipCertificateAdapter,
  RephraseAdapter,

} from "./adapters";
import { CitationNode } from "../../extensions/CitationNode";
import { PasteCitationExtension } from "../../extensions/PasteCitationExtension";
import { CitationAuditAdapter } from "./adapters/CitationAuditAdapter";
import { UpgradeModal } from "../subscription/UpgradeModal";
import { CitationStyleDialog } from "../citations/CitationStyleDialog";
import { SubscriptionService } from "../../services/subscriptionService";
import { DraftComparisonSelector } from "../originality/DraftComparisonSelector";
import { RightPanelType } from "./EditorWorkspacePage";

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
import { GrammarExtension } from "../../extensions/GrammarExtension";

import { GrammarBubbleMenu } from "./GrammarBubbleMenu";
import { AuditReportModal } from "../audit/AuditReportModal";

import { EditorToolbar } from "./editor-toolbar";
import { ExportWorkflowModal } from "../export/ExportWorkflowModal";
import { detectAndNormalizeCitations, synchronizeRegistryWithDocument } from "./utils/normalization";
import {
  Download,
  GitCompare,
  Eraser,
  BookOpen,
  ShieldAlert,
  Bot,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Eye,
  PenTool
} from "lucide-react";
import { Button } from "../ui/button";



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
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);

  const [lastScanResult] = useState<OriginalityScan | null>(
    null
  );
  // const [lastAIScanResult, setLastAIScanResult] = useState<AIScanResult | null>(null);

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

  // Handle Citation Clicks (Scroll to Reference)
  const scrollToReference = (citationId: string) => {
    // 1. Get Citation Data from Registry
    // We need to look up the citation text/metadata to find it in the bibliography
    // accessing the registry directly or via project citations
    const citation = project.citations?.find(c => c.id === citationId);
    if (!citation) return;

    // Construct search strings (Author Last Name or Title or Number)
    // Heuristic: "Smith" or "The Art of Testing"
    const authorLast = citation.authors?.[0]?.lastName || (typeof citation.authors?.[0] === 'string' ? citation.authors[0] : "");
    const searchTerms = [
      citation.id, // If we have IDs in bibliography
      authorLast,
      citation.title
    ].filter(Boolean) as string[];

    if (searchTerms.length === 0) return;

    // 2. Find "References" or "Bibliography" Heading
    // We scan paragraphs in the editor DOM to find the section
    const editorDom = document.querySelector('.ProseMirror');
    if (!editorDom) return;

    const children = Array.from(editorDom.children) as HTMLElement[];
    let refSectionFound = false;
    let targetElement: HTMLElement | null = null;

    for (const child of children) {
      const text = child.innerText?.toLowerCase() || "";

      // Detect Section Header
      if (['h1', 'h2', 'h3'].includes(child.tagName.toLowerCase())) {
        if (text.includes('references') || text.includes('bibliography')) {
          refSectionFound = true;
          continue;
        }
      }

      // If we are in references section, search for the citation
      if (refSectionFound) {
        // Check if paragraph contains author AND year? Or just author?
        // Using simple includes for now.
        const matches = searchTerms.some(term =>
          child.innerText?.includes(term)
        );

        if (matches) {
          targetElement = child;
          break;
        }
      }
    }

    // 3. Scroll and Highlight
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Add highlight class
      targetElement.classList.add('highlight-reference-flash');
      setTimeout(() => {
        targetElement?.classList.remove('highlight-reference-flash');
      }, 2000);

      toast({
        title: "Reference Found",
        description: `Jumped to citation by ${authorLast || "Unknown"}.`,
      });
    } else {
      toast({
        title: "Reference Not Found",
        description: "Could not locate the bibliography entry.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // This useEffect is likely intended to check for external project updates
    // and would require `lastSaved` to be uncommented and managed.
    // For now, it's added as per instruction, assuming `lastSaved` will be handled elsewhere.
    // if (project.updated_at && lastSaved && new Date(project.updated_at).getTime() > lastSaved.getTime()) {
    //   toast({
    //     title: "Project Updated",
    //     description: "The project has been updated externally.",
    //   });
    //   // onProjectUpdate?.(project); // Infinite loop risk if not careful
    // }
  }, [project.updated_at, project, onProjectUpdate, toast]);

  const scrollToReferenceByText = (citationText: string) => {
    // Search for reference by the citation text (e.g., "[3]")
    const editorDom = document.querySelector('.ProseMirror');
    if (!editorDom) return;

    const children = Array.from(editorDom.children) as HTMLElement[];
    let refSectionFound = false;
    let targetElement: HTMLElement | null = null;

    for (const child of children) {
      const text = child.innerText?.toLowerCase() || "";

      // Detect Section Header
      if (['h1', 'h2', 'h3'].includes(child.tagName.toLowerCase())) {
        if (text.includes('references') || text.includes('bibliography')) {
          refSectionFound = true;
          continue;
        }
      }

      // If we are in references section, search for the citation text
      if (refSectionFound) {
        // For IEEE style like "[3]", look for entries starting with that
        if (child.innerText?.trim().startsWith(citationText)) {
          targetElement = child;
          break;
        }
      }
    }

    // Scroll and Highlight
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('highlight-reference-flash');
      setTimeout(() => {
        targetElement?.classList.remove('highlight-reference-flash');
      }, 2000);

      toast({
        title: "Reference Found",
        description: `Jumped to citation ${citationText}.`,
      });
    } else {
      console.warn('[ScrollToRef] Reference not found for:', citationText);
      console.warn('[ScrollToRef] refSectionFound:', refSectionFound);
      toast({
        title: "Reference Not Found",
        description: `Could not locate bibliography entry for ${citationText}.`,
        variant: "destructive"
      });
    }
  };

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
      EnhancedFigureNode, // Replaces FigureExtension with auto-numbering
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
      CitationNode,
      PasteCitationExtension.configure({
        projectId: project.id
      }),
      AutoNumbering, // Enable automatic figure and table numbering
      GrammarExtension, // AI Grammar Checker
    ],
    content: formatContentForTiptap(project.content),
    onUpdate: () => {
      // Increment edit count when content changes
      setEditCount((prev) => prev + 1);
    },
    editorProps: {
      attributes: {
        class: `focus:outline-none min-h-full prose-table:w-full prose-img:rounded-md prose-img:shadow-md`,
        spellcheck: "false",
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        console.log('[CitationClick] Click detected, target:', target);

        // Find citation element by class since citationId might be null
        const citationElement = target.closest('.citation-pill');
        console.log('[CitationClick] Citation element:', citationElement);

        if (citationElement) {
          // Try to get citation ID, fall back to text
          const citationId = citationElement.getAttribute('data-cite');
          const citationText = citationElement.getAttribute('data-text') || citationElement.textContent;

          console.log('[CitationClick] Citation ID:', citationId);
          console.log('[CitationClick] Citation text:', citationText);

          if (citationId) {
            scrollToReference(citationId);
          } else if (citationText) {
            // Use text to find reference (e.g., "[3]" → search for entry starting with "[3]")
            scrollToReferenceByText(citationText.trim());
          }
          return true; // Stop propagation
        }
        return false;
      }
    },
  });



  // Load project content only once per document
  useEffect(() => {
    if (editor) {
      if (onEditorReady) {
        onEditorReady(editor);
      }
    }

    if (
      editor &&
      project.content &&
      currentProjectIdRef.current !== project.id
    ) {
      if (
        currentProjectIdRef.current &&
        currentProjectIdRef.current !== project.id
      ) {
        hasInitializedContentRef.current = false;
      }

      if (!hasInitializedContentRef.current) {
        editor.commands.setContent(formatContentForTiptap(project.content));
        hasInitializedContentRef.current = true;
        currentProjectIdRef.current = project.id;

        // --- Silent Normalization on Load ---
        // Convert plain text citations to blue interactive nodes
        // Use timeout to ensure editor is stable and we don't conflict with initial render transactions
        setTimeout(async () => {
          if (editor && !editor.isDestroyed) {
            const result = await detectAndNormalizeCitations(editor, project.id, project.citations || []);

            // Recover any existing nodes that were lost from registry
            await synchronizeRegistryWithDocument(editor, project.id);

            // AUTO-DETECT STYLE Logic (70% Threshold)
            if (result && result.stats) {
              const { ieee, apa } = result.stats;
              const total = ieee + apa;

              if (total > 0) {
                const currentStyle = project.citation_style || 'apa';
                let detectedStyle = null;

                if (ieee / total >= 0.7) detectedStyle = 'ieee';
                else if (apa / total >= 0.7) detectedStyle = 'apa'; // or 'mla' depending on default

                if (detectedStyle && detectedStyle !== currentStyle) {
                  console.log(`[AutoStyle] Switching from ${currentStyle} to ${detectedStyle} (Confidence: ${Math.round((detectedStyle === 'ieee' ? ieee : apa) / total * 100)}%)`);

                  // Update Project
                  const updatedProject = { ...project, citation_style: detectedStyle };
                  if (onProjectUpdate) onProjectUpdate(updatedProject);

                  // Notify User
                  toast({
                    title: "Citation Style Optimized",
                    description: `Switched to ${detectedStyle.toUpperCase()} based on your content.`,
                    duration: 3000
                  });
                }
              }
            }
          }
        }, 500);
      }
    }
  }, [project, editor, onEditorReady, onProjectUpdate, toast]);

  // --- Preview Mode (Read-Only) ---
  const [isPreviewMode, setIsPreviewMode] = useState(false);



  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!isPreviewMode);
    }
  }, [editor, isPreviewMode]);

  // --- Periodic Normalization & Ordering (Debounced) ---
  useEffect(() => {
    if (!editor || !project.citations) return;

    // Stress Guard: Increase debounce for large documents
    const citationCount = project.citations.length;
    const debounceTime = citationCount > 80 ? 5000 : 2000;

    if (citationCount > 80 && editCount % 5 === 0) {
      console.warn(`[StressGuard] Large document detected (${citationCount} refs). Debounce set to ${debounceTime}ms.`);
    }

    const timeoutId = setTimeout(() => {
      // 1. Run normalization (text -> blue pills)
      detectAndNormalizeCitations(editor, project.id, project.citations || []);

      // 2. Orchestrated Update (Ordering + Integrity)
      // This manages locks to prevent race conditions with Exports
      import("../../services/CitationOrchestrator").then(({ CitationOrchestrator }) => {
        // @ts-ignore - Project interface might be strict
        const style = project.citation_style || "apa";
        CitationOrchestrator.scheduleUpdate(editor, project.id, style);
      });

    }, debounceTime);

    return () => clearTimeout(timeoutId);
  }, [editCount, editor, project.citations, project.id, project.citation_style]); // Added project.citation_style to trigger style updates

  // --- Background Grammar Check (Debounced) ---
  useEffect(() => {
    if (!editor) return;

    // Don't check strictly empty or very short docs
    const text = editor.getText();
    if (text.length < 10) return;

    const checkGrammar = async () => {
      try {
        if (!editor || editor.isDestroyed) return;

        // --- Feature Gate: Check if user has access (Paid Feature) ---
        const hasAccess = await SubscriptionService.hasFeatureAccess("grammar_check");
        if (!hasAccess) {
          // Optional: console.log("Grammar check skipped (Free plan)");
          return;
        }

        // --- Optimization: Check only current paragraph ---
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // CRITICAL FIX: Only run grammar check on text blocks (headings, paragraphs)
        // This prevents crash when selection is inside a table structure or other non-text node
        if (!$from.parent.isTextblock) return;

        // Ancestor Check: Verify we are not inside a table or figure caption
        // The user explicitly requested to disable checks in tables/pictures to prevent crashes
        let invalidContext = false;
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d);
          if (['table', 'table_row', 'table_cell', 'image', 'figure', 'figcaption'].includes(node.type.name)) {
            invalidContext = true;
            break;
          }
        }
        if (invalidContext) return;

        // Get the current block (paragraph) range
        const start = $from.start();
        const end = $from.end();

        // Get text of the current block
        // We use textBetween to ensure we get clean text for the node
        const textToCheck = state.doc.textBetween(start, end, " ", " ");

        // Don't check strictly empty or very short blocks
        if (!textToCheck || textToCheck.length < 5) return;

        console.log("ðŸ“  Background Grammar Check (Block Scoped)...");
        const { GrammarCheckService } = await import("../../services/grammarCheckService");

        // Silent check
        const errors = await GrammarCheckService.checkText(textToCheck);

        if (!editor || editor.isDestroyed) return;

        // --- STALENESS CHECK ---
        // Verify if the text at this range is still the same.
        // If the user typed while we were checking, abort to prevent applying marks to wrong offsets.
        const currentText = editor.state.doc.textBetween(start, end, " ", " ");
        if (currentText !== textToCheck) {
          console.log("âš ï¸  Text changed during check, aborting grammar highlight.");
          return;
        }

        if (!editor || editor.isDestroyed) return;

        // Transaction to update marks
        const tr = editor.state.tr;
        const schema = editor.state.schema;
        const markType = schema.marks['grammar-error'];

        if (!markType) return;

        // 1. Clear existing grammar errors ONLY in this block
        tr.removeMark(start, end, markType);

        if (errors.length === 0) {
          editor.view.dispatch(tr); // Dispatch clear
          console.log("âœ… No grammar issues in block.");
          return;
        }

        // 2. Apply new errors mapped to this block's offset
        let matchCount = 0;
        errors.forEach(err => {
          try {
            const escaped = err.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped, 'g');
            const matches = Array.from(textToCheck.matchAll(regex));

            matches.forEach(match => {
              if (match.index !== undefined) {
                // Calculate absolute position in doc
                const matchStart = start + match.index;
                const matchEnd = matchStart + match[0].length;

                tr.addMark(matchStart, matchEnd, markType.create({
                  ...err,
                  original: err.original
                }));
                matchCount++;
              }
            });
          } catch (e) {
            console.warn("âš ï¸  Grammar highlight error:", e);
          }
        });

        if (matchCount > 0 || errors.length === 0) {
          editor.view.dispatch(tr);
          console.log(`âœ… Applied ${matchCount} grammar highlights to block.`);
        }
      } catch (error) {
        console.error("â Œ Background grammar check failed:", error);
      }
    };

    const timeoutId = setTimeout(checkGrammar, 2000); // 2s debounce
    return () => clearTimeout(timeoutId);
  }, [editCount, editor]); // Re-run on editCount change

  // --- Citation Click Navigation ---
  // Global click listener to handle clicks on citation pills
  useEffect(() => {
    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if clicked element is a citation pill
      const citationPill = target.closest('[data-type="citation"]');

      if (citationPill) {
        const text = citationPill.textContent || "";
        // Extract probable author from "(Smith, 2020)" -> "Smith"
        // Regex looks for words before comma or year
        const match = text.match(/\(([^,0-9]+)/);
        const author = match ? match[1].trim() : text.replace(/[()]/g, "").trim();

        if (author) {
          // Find References section in the DOM
          // We assume standard APA/MLA "References" or "Works Cited" heading
          // This is a DOM search, not Tiptap node search, for scrolling simplicity
          const headings = document.querySelectorAll("h1, h2, h3, h4");
          let referencesHeader: Element | null = null;

          for (const h of Array.from(headings)) {
            if (/References|Works Cited|Bibliography/i.test(h.textContent || "")) {
              referencesHeader = h;
              break;
            }
          }

          if (referencesHeader) {
            // Search siblings after header for the author
            let current = referencesHeader.nextElementSibling;
            while (current) {
              if (current.textContent?.includes(author)) {
                // Found it! Scroll to it.
                // Found it! Scroll to it.
                const targetElement = current as HTMLElement;
                targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
                // Add temporary highlight effect
                const originalBg = targetElement.style.backgroundColor;
                targetElement.style.backgroundColor = "#FEF3C7"; // yellow-100
                targetElement.style.transition = "background-color 0.5s";
                setTimeout(() => {
                  targetElement.style.backgroundColor = originalBg;
                }, 2000);
                return;
              }
              current = current.nextElementSibling;
            }
            // If specific author not found, at least scroll to References
            referencesHeader.scrollIntoView({ behavior: "smooth", block: "start" });
          } else {
            // Fallback: Try to find text anywhere? No, too risky.
            console.warn("References section not found");
          }
        }
      }
    };

    // Attach to the editor's container or document
    // Document is safest to catch bubbles from shadow DOM or editor container
    document.addEventListener("click", handleEditorClick);

    return () => {
      document.removeEventListener("click", handleEditorClick);
    };
  }, []);

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
  // Function to clear all highlights
  const clearHighlights = () => {
    if (editor) {
      // Remove all highlight marks (Citation/Originality) AND Grammar errors
      editor.chain()
        .focus()
        .clearAllHighlights()
        .clearAllGrammarErrors()
        .run();
    }
  };

  // Function to highlight AI detection results
  /*
  const highlightAIResults = (results: AIScanResult) => {
    if (!editor || !results || !results.sentences) return;
  
    // Clear existing highlights
    clearHighlights();
  
    const doc = editor.state.doc;
    let searchPos = 0;
  
    // Sort sentences by position
    const sortedSentences = [...results.sentences].sort(
      (a, b) => a.positionStart - b.positionStart
    );
  
    sortedSentences.forEach((sentence: AISentenceResult) => {
      // Only highlight if AI or Likely AI
      if (sentence.classification === "human" || sentence.classification === "likely_human") return;
  
    if (!sentence.text) return;
  
    const range = findTextRange(doc, sentence.text, searchPos);
  
    if (!range) {
      console.warn("Could not find sentence text in document", sentence.text);
    return;
      }
  
    searchPos = range.to;
  
    let color = "purple"; // Default for AI
    let message = "";
  
    switch (sentence.classification) {
        case "ai":
    color = "purple";
    message = `ðŸ¤– High AI probability detected (${Math.round(sentence.score * 100)}%)`;
    break;
    case "likely_ai":
    color = "yellow";
    message = `âš ï¸  Possible AI content (${Math.round(sentence.score * 100)}%)`;
    break;
    default:
    return;
      }
  
    try {
      editor.chain().highlightRange(range.from, range.to, {
        color,
        type: "ai_detection",
        similarity: sentence.score * 100,
        message: message,
      }).run();
      } catch (err) {
      console.error("Failed to highlight AI match:", err);
      }
    });
  };
    */




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

  // Listen for citation insertion events
  useEffect(() => {
    const handleInsertCitation = (e: CustomEvent) => {
      if (editor && e.detail) {
        const { citationId, text } = e.detail;

        if (citationId) {
          // Use semantic citation node
          editor.commands.insertCitation({
            citationId,
            text, // fallback property was renamed to text in command definition
          });
        } else {
          // Fallback to text insertion if no ID (should not happen with new logic)
          editor.commands.insertContent(text);
        }
      }
    };

    window.addEventListener("insert-citation", handleInsertCitation as EventListener);
    return () => {
      window.removeEventListener("insert-citation", handleInsertCitation as EventListener);
    };
  }, [editor]);




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

  const [auditReport, setAuditReport] = useState<any>(null);

  return (
    <EditorProvider editor={editor}>
      {editor && <GrammarBubbleMenu editor={editor} />}
      <AuditReportModal
        isOpen={!!auditReport}
        onClose={() => setAuditReport(null)}
        report={auditReport}
      />
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
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold border-none focus:outline-none focus:ring-0 pl-0 text-gray-900 min-w-[200px] max-w-[400px]"
                  placeholder="Untitled Document"
                />
              </div>
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                  onClick={() => setIsExportWorkflowOpen(true)}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStyleDialogOpen(true)}
                  className="gap-2 h-9 border-blue-400 text-blue-800 bg-white hover:bg-blue-50 hover:text-blue-900 transition-colors shadow-sm px-3"
                  title={`Current Style: ${project.citation_style || 'APA'} - Click to change`}
                >
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs">
                      {project.citation_style || "APA"}
                    </span>
                  </div>
                </Button>

                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`p-2 border rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isPreviewMode
                    ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  title={isPreviewMode ? "Switch to Edit Mode" : "Switch to Preview Mode"}
                >
                  {isPreviewMode ? <PenTool className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {isPreviewMode ? "Edit" : "Preview"}
                </button>

                <button
                  onClick={onToggleFocusMode}
                  className={`p-2 border rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isFocusMode
                    ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                >
                  {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isFocusMode ? "Exit" : "Focus"}</span>
                </button>

                {/* Grammar Check Button Removed for Background Check */}
                {/* Originality Scan Pipeline (Plagiarism Detection) */}
                <button
                  title="Clear Highlights"
                  className="p-2 border border-gray-200 text-gray-500 rounded-md hover:bg-gray-50 hover:text-red-500 transition-colors"
                  onClick={() => {
                    clearHighlights();
                    toast({
                      title: "Highlights Cleared",
                      description: "All highlights have been cleared",
                      variant: "default",
                    });
                  }}>
                  <Eraser className="w-4 h-4" />
                </button>

                {/* Originality Scan Pipeline (Plagiarism Detection) */}
                <OriginalityMapAdapter
                  projectId={project.id}
                  editor={editor}
                  onScanComplete={(results) => {
                    if (onOpenPanel) {
                      onOpenPanel("originality-results", results);
                    }
                  }}
                />

                <button
                  onClick={handleCompareClick}
                  className="p-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  title="Compare with Previous">
                  <GitCompare className="w-4 h-4" />
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
              citationStyle={project.citation_style || "APA"}
              citationLibrary={project.citations}
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
                  aiScanResult: null,
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
              <span>ðŸ›¡ï¸  Reality Check</span>
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
          editor={editor} // Pass editor instance for live normalization
          onProjectUpdate={onProjectUpdate}
        />
      </div>
      <CitationStyleDialog
        open={isStyleDialogOpen}
        onOpenChange={setIsStyleDialogOpen}
        currentStyle={project.citation_style}
        onSave={(style) => {
          if (onProjectUpdate) {
            onProjectUpdate({
              ...project,
              citation_style: style
            });
            toast({
              title: "Citation Style Updated",
              description: `Default style set to ${style}. Run an audit to enforce rules.`,
            });
          }
        }}
      />
    </EditorProvider >
  );
};
