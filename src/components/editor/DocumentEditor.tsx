import * as React from "react";
import { useState, useEffect, useRef, useMemo, memo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorProvider } from "./EditorContext";
import StarterKit from "@tiptap/starter-kit";
import { CharacterCount } from "@tiptap/extension-character-count";
import { HighlightExtension } from "../../extensions/HighlightExtension";
import { UserHighlightExtension } from "../../extensions/UserHighlightExtension";
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
import { AuthorshipExtension } from "../../extensions/AuthorshipExtension";
import { ImageExtension } from "../../extensions/AdvancedImageExtension";
import { AITrackingExtension } from "../../extensions/AITrackingExtension";
import { PlaceholderMarkExtension } from "../../extensions/PlaceholderMarkExtension";
import { MathExtension } from "../../extensions/MathExtension";
import { ConsensusPinExtension } from "../../extensions/ConsensusPinExtension";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import { BibliographyEntry } from "../../extensions/BibliographyNode";
import { NodeSelection } from "@tiptap/pm/state";
import { documentService, Project } from "../../services/documentService";
import { AuthorshipService } from "../../services/authorshipService";
import "../../styles/highlight-styles.css";
import "../../styles/image-styles.css";
import "../../styles/column-styles.css";
import { useToast } from "../../hooks/use-toast";
import { TableBubbleMenu } from "./TableBubbleMenu";
import {
  AuthorshipCertificateAdapter,
  RephraseAdapter,
  CitationAuditAdapter,
} from "./adapters";
import { CitationNode } from "../../extensions/CitationNode";
import { UpgradeModal } from "../subscription/UpgradeModal";
import { CitationStyleDialog } from "../citations/CitationStyleDialog";
import { SubscriptionService } from "../../services/subscriptionService";
import { DraftComparisonSelector } from "../originality/DraftComparisonSelector";
import { RightPanelType } from "./EditorWorkspacePage";
import BehavioralTracker from "./BehavioralTracker";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import { CitationLifecycleExtension } from "../../extensions/CitationLifecycleExtension";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { CitationScannerExtension } from "../../extensions/CitationScannerExtension";
import { formatContentForTiptap } from "../../utils/editorUtils";
import { GrammarExtension } from "../../extensions/GrammarExtension";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Link from "@tiptap/extension-link";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { useAuth } from "../../hooks/useAuth";
import { useSubscriptionStore } from "../../stores/useSubscriptionStore";
import { GrammarBubbleMenu } from "./GrammarBubbleMenu";
import { AuditReportModal } from "../audit/AuditReportModal";
import { EditorToolbar } from "./editor-toolbar";
import { ExportWorkflowModal } from "../export/ExportWorkflowModal";
import { VersionHistoryModal } from "./VersionHistoryModal";
import { ConsensusBubbleMenu } from "./ConsensusBubbleMenu";
import {
  BookOpen,
  Eye,
  Save,
  PenTool,
  Loader2,
  History,
  ShieldAlert,
  ShieldCheck,
  Minimize2,
  Maximize2,
  MessageSquare,
  Eraser,
  Download,
  Bot,
  GitCompare,
  Lock,
  HelpCircle,
} from "lucide-react";
import { EditorHelpDialog } from "./EditorHelpDialog";
import { Button } from "../ui/button";
import ConfigService from "../../services/ConfigService";
import { loadRecaptchaScript } from "../../lib/recaptcha";

const RECAPTCHA_SITE_KEY = ConfigService.getRecaptchaSiteKey();

function isViewReady(ed: any): boolean {
  if (!ed) return false;
  try {
    return !!(ed.view && ed.view.dom);
  } catch {
    return false;
  }
}

// EditorContent wrapper that DEFERS rendering to avoid flushSync in React 18
// CRITICAL: We NEVER render EditorContent on first mount or when editor changes.
// We always defer using setTimeout(0) to move out of React's render phase.
const DeferredEditorContent = ({ editor, className }: { editor: any; className: string }) => {
  // Start with NULL - never render EditorContent synchronously
  const [renderedEditor, setRenderedEditor] = useState<any>(null);
  const pendingEditorRef = useRef(editor);

  useEffect(() => {
    // Always update the pending ref
    pendingEditorRef.current = editor;

    // If no editor, clear immediately
    if (!editor) {
      setRenderedEditor(null);
      return;
    }

    // ALWAYS defer, even on initial mount
    // setTimeout(0) pushes to next tick, after React's render phase completes
    const timer = setTimeout(() => {
      if (editor === pendingEditorRef.current && isViewReady(editor)) {
        setRenderedEditor(editor);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [editor]);

  // NEVER render EditorContent during React's render phase
  // Only render after setTimeout has fired (next tick)
  if (!renderedEditor || !isViewReady(renderedEditor)) {
    return <div className={className} style={{ minHeight: "500px" }} />;
  }

  return <EditorContent editor={renderedEditor} className={className} />;
};

interface DocumentEditorProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
  onOpenPanel?: (panelType: RightPanelType, data?: any) => void;
  onOpenLeftPanel?: (panelType: "documents" | "audit", data?: any) => void;
  onEditorReady?: (editor: any) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
  isCollaborative?: boolean;
  isReadOnly?: boolean;
  lastAuditReport?: any;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  project,
  onProjectUpdate,
  onOpenPanel,
  onOpenLeftPanel,
  onEditorReady,
  isFocusMode = false,
  onToggleFocusMode,
  isCollaborative = false,
  isReadOnly = false,
  lastAuditReport,
}) => {
  const { toast } = useToast();
  const { user, token } = useAuth();
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  // NOTE: collabReady removed - using isSynced instead to prevent editor recreation
  const [isEditorMounted, setIsEditorMounted] = useState(false);
  const [collabStatus, setCollabStatus] = useState<string>("disconnected");
  const [isSynced, setIsSynced] = useState(false);
  const [collabError, setCollabError] = useState<string | null>(null);
  const isSyncedRef = useRef(false);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (RECAPTCHA_SITE_KEY) {
      loadRecaptchaScript(RECAPTCHA_SITE_KEY).catch(() => {
        /* silent */
      });
    }
  }, []);

  // Hide reCAPTCHA badge in the editor for a cleaner UI
  useEffect(() => {
    document.body.classList.add("hide-recaptcha");
    return () => {
      document.body.classList.remove("hide-recaptcha");
    };
  }, []);

  const { plan: rawPlan } = useSubscriptionStore();
  const userPlanName = rawPlan?.toLowerCase() || "free";
  const isFreePlan = userPlanName.includes("free");

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const cursorColor = useMemo(() => {
    if (!user?.id)
      return (
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
      );

    // Hash the user ID to a color
    let hash = 0;
    for (let i = 0; i < user.id.length; i++) {
      hash = user.id.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash) % 360;
    return hslToHex(h, 70, 50);
  }, [user?.id]);
  // Create Yjs document synchronously when entering collaborative mode
  // This ensures the editor is created with Collaboration extension from the start
  if (isCollaborative && !ydocRef.current) {
    ydocRef.current = new Y.Doc();
    console.log("[HP] Created Yjs document synchronously");
  }

  // Handle Hocuspocus Lifecycle
  useEffect(() => {
    if (!isCollaborative || !project.id || !token) {
      if (!isCollaborative || !project.id) {
        providerRef.current?.destroy();
        ydocRef.current?.destroy();
        providerRef.current = null;
        ydocRef.current = null;
        setIsSynced(false);
        isSyncedRef.current = false;
      }
      return;
    }

    console.log(
      `[HP Lifecycle] Initializing provider for project: ${project.id}`,
      { isCollaborative, projectId: project.id },
    );
    setCollabStatus("connecting");
    setIsSynced(false);
    isSyncedRef.current = false;
    setCollabError(null);

    console.log(
      `[HP Auth] Initializing with token length: ${token?.length || 0}`,
    );

    // Use existing Yjs doc or create fresh one
    const freshYdoc = ydocRef.current || new Y.Doc();
    if (!ydocRef.current) {
      ydocRef.current = freshYdoc;
    }

    const newProvider = new HocuspocusProvider({
      url: ConfigService.getCollabUrl(),
      name: `project-${project.id}`,
      document: freshYdoc,
      token: token,
      parameters: { token }, // Fix: Pass token in URL parameters to ensure backend receives it immediately during connect
      onStatus: (item) => {
        console.log(`[HP Status] Project ${project.id}:`, item.status);
        setCollabStatus(item.status);
        if (item.status === "connected") {
          setCollabError(null);
        }
      },
      onSynced: () => {
        console.log(`[HP Sync] Project ${project.id} ready`);
        setIsSynced(true);
        isSyncedRef.current = true;
        setCollabError(null);
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      },
      onDisconnect: () => {
        console.log(`[HP Disconnect] Project ${project.id}`);
        setCollabStatus("disconnected");
      },
      onConnect: () => {
        console.log(`[HP Connect] Project ${project.id} success`);
        setCollabError(null);
      },
      onAuthenticationFailed: ({ reason }) => {
        console.error(`[HP Auth Failed] Project ${project.id}:`, reason);
        setCollabStatus("disconnected");
        setCollabError("Authentication failed: " + reason);
      },
    });

    // COMPATIBILITY FIX: CollaborationCursor v2 reads provider.doc
    // @ts-ignore
    if (!newProvider.doc) {
      Object.defineProperty(newProvider, "doc", {
        get: () => newProvider.document,
      });
    }

    providerRef.current = newProvider;

    return () => {
      console.log(
        `[HP Cleanup] Destroying provider and ydoc for project: ${project.id}`,
      );
      newProvider.destroy();
      freshYdoc.destroy();
      providerRef.current = null;
      ydocRef.current = null;
    };
  }, [project.id, isCollaborative, retryCount, token]);

  useEffect(() => {
    if (isCollaborative && !isSynced) {
      console.log("[HP Timeout] Starting 30-second safety timer");
      connectionTimeoutRef.current = setTimeout(() => {
        if (!isSyncedRef.current) {
          console.warn("[HP Timeout] Triggered after 30 seconds");
          setCollabError(
            "Connection timed out. The server might be unreachable or highly congested. Please check your internet or retry.",
          );
        }
      }, 30000);
    }

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    };
  }, [isCollaborative, isSynced]);

  // Sync user identity when user profile is loaded
  useEffect(() => {
    if (providerRef.current && user && isSynced) {
      console.log("Syncing user identity to Hocuspocus awareness", user);
      providerRef.current.setAwarenessField("user", {
        name: user?.user_metadata?.full_name || user?.email || "Anonymous",
        color: cursorColor,
      });
    }
  }, [user, isSynced, cursorColor]);

  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description || "");

  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Stats and usage tracking
  const [timeSpent, setTimeSpent] = useState((project as any).time_spent || 0);
  const startTimeRef = useRef<Date>(new Date());

  // Pipeline results state
  const [lastScanResult, setLastScanResult] = useState<any>(
    lastAuditReport || null,
  );
  const [citationSuggestions] = useState<any[]>([]);

  // Dialog / Modal States
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showUpgradeDraftModal, setShowUpgradeDraftModal] = useState(false);
  const [isComparisonSelectorOpen, setIsComparisonSelectorOpen] =
    useState(false);
  const [isExportWorkflowOpen, setIsExportWorkflowOpen] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const hasInitializedContentRef = useRef(false);
  const currentProjectIdRef = useRef<string | null>(null);
  const isNormalizingRef = useRef(false); // Guard to prevent concurrent normalization

  // Reset initialization flag when collaboration mode or project changes
  useEffect(() => {
    console.log("[Collab] Mode or Project changed, resetting init flag", {
      isCollaborative,
      projectId: project.id,
    });
    hasInitializedContentRef.current = false;
  }, [isCollaborative, project.id]);

  // Layout State

  // Sync state when project changes
  useEffect(() => {
    setTitle(project.title);
    setDescription(project.description || "");
  }, [project.id, project.title, project.description]);

  // Sync scan results when prop changes
  useEffect(() => {
    if (lastAuditReport) {
      setLastScanResult(lastAuditReport);
    }
  }, [lastAuditReport]);

  const editor = useEditor(
    {
      editable: !isReadOnly,
      extensions: [
        StarterKit.configure({
          // @ts-ignore — `history` exists at runtime but is missing from this version's StarterKitOptions types
          history: isCollaborative ? false : {},
        }),
        ...(isCollaborative && ydocRef.current
          ? [
            Collaboration.configure({
              document: ydocRef.current,
            }),
          ]
          : []),
        ...(isCollaborative && providerRef.current
          ? [
            CollaborationCursor.configure({
              provider: providerRef.current,
              user: {
                name:
                  user?.user_metadata?.full_name ||
                  user?.email ||
                  "Anonymous",
                color: cursorColor,
              },
            }),
          ]
          : []),
        AuthorshipExtension.configure({
          user: {
            id: user?.id || "local-user",
            name: user?.user_metadata?.full_name || user?.email || "Anonymous",
            color: cursorColor,
          },
        } as any),
        HighlightExtension,
        UserHighlightExtension,
        CharacterCount,
        MathExtension,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "editor-link",
          },
        }),
        Table.configure({
          resizable: true,
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
        AuthorBlockExtension,
        AuthorExtension,
        CalloutBlockExtension,
        CoverPageExtension,
        CustomCodeBlockExtension,
        EnhancedFigureNode,
        KeywordsExtension,
        AITrackingExtension,
        PricingTableExtension,
        SectionExtension,
        VisualElementExtension,
        ImageExtension,
        ColumnLayoutExtension,
        PlaceholderMarkExtension,
        Superscript,
        Subscript,
        Blockquote,
        ListItem,
        OrderedList,
        BulletList,
        CitationNode,
        BibliographyEntry,
        CitationLifecycleExtension,
        AutoNumbering, // Enable automatic figure and table numbering
        GrammarExtension, // AI Grammar Checker
        CitationScannerExtension,
        ConsensusPinExtension,
      ],
      content: isCollaborative
        ? undefined
        : formatContentForTiptap(project.content),
      onUpdate: ({ editor, transaction }) => {
        if (
          transaction.getMeta("normalization") ||
          transaction.getMeta("integrity-check")
        ) {
          return;
        }

        setEditCount((prev) => prev + 1);
      },
      editorProps: {
        attributes: {
          class: `focus:outline-none min-h-full prose-table:w-full prose-img:rounded-md prose-img:shadow-md`,
          spellcheck: "false",
        },
        handleClick: (view, pos, event) => {
          const target = event.target as HTMLElement;

          const bibUrlLink = target.closest(
            ".bibliography-url-link",
          ) as HTMLElement;
          if (bibUrlLink) {
            event.preventDefault();
            event.stopPropagation();
            const url = bibUrlLink.getAttribute("data-url");
            if (url) window.open(url, "_blank", "noopener,noreferrer");
            return true;
          }

          const citation = target.closest(
            "a.citation-node",
          ) as HTMLAnchorElement;
          if (citation) {
            event.preventDefault();
            event.stopPropagation();

            const externalUrl = citation.getAttribute("data-url");
            const anchorHref = citation.getAttribute("href");
            const isModifierClick =
              event.ctrlKey || event.metaKey || event.shiftKey;

            if (isModifierClick && externalUrl) {
              window.open(externalUrl, "_blank", "noopener,noreferrer");
            } else if (anchorHref && anchorHref.startsWith("#")) {
              const targetId = anchorHref.substring(1);
              const targetElement = document.getElementById(targetId);
              if (targetElement) {
                targetElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
                targetElement.style.transition = "background-color 0.5s ease";
                targetElement.style.backgroundColor = "#eff6ff";
                setTimeout(() => {
                  targetElement.style.backgroundColor = "transparent";
                }, 2000);
              }
            }

            try {
              const sel = NodeSelection.create(view.state.doc, pos);
              view.dispatch(view.state.tr.setSelection(sel));
            } catch (e) { }
            return true;
          }

          return false;
        },
      },
    },
    [project.id, isCollaborative],
  );

  useEffect(() => {
    if (!editor) return;
    const shouldBeEditable = !isReadOnly;
    if (editor.isEditable !== shouldBeEditable) {
      editor.setEditable(shouldBeEditable);
    }
  }, [editor, isReadOnly]);

  useEffect(() => {
    if (!editor) {
      setIsEditorMounted(false);
      return;
    }

    const checkView = (): boolean => {
      try {
        return !!(editor.view && editor.view.dom);
      } catch {
        return false;
      }
    };

    if (checkView()) {
      setIsEditorMounted(true);
      return;
    }
    let rafId: number;
    const poll = () => {
      if (checkView()) {
        setIsEditorMounted(true);
      } else {
        rafId = requestAnimationFrame(poll);
      }
    };
    rafId = requestAnimationFrame(poll);

    return () => cancelAnimationFrame(rafId);
  }, [editor]);

  useEffect(() => {
    // CRITICAL: Never run this effect in collaborative mode
    if (isCollaborative) {
      return;
    }

    if (editor && isEditorMounted && isViewReady(editor)) {
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
        const initDocumentWithRegistry = async () => {
          try {
            const { CitationRegistryService } =
              await import("../../services/CitationRegistryService");
            await CitationRegistryService.initializeFromBackend(project.id);
            (window as any).__currentProjectId__ = project.id;
            console.log(
              "✅ Citation registry initialized from backend successfully",
            );

            editor.commands.setContent(formatContentForTiptap(project.content));
            hasInitializedContentRef.current = true;
            currentProjectIdRef.current = project.id;

            setTimeout(async () => {
              if (editor && !editor.isDestroyed) {
                try {
                  // MUST BE STRICTLY SEQUENTIAL!
                  // If run concurrently, they cache positions, transaction #1 shifts the document,
                  // and transaction #2 overwrites/deletes wrong text based on stale positions.
                  const {
                    detectAndNormalizeBibliography,
                    detectAndNormalizeCitations,
                  } = await import("./utils/normalization");
                  await detectAndNormalizeBibliography(editor, project.id);
                  await detectAndNormalizeCitations(
                    editor,
                    project.id,
                    project.citations || [],
                  );
                } catch (e) {
                  console.error("Normalization error:", e);
                }
              }
            }, 500);
          } catch (error) {
            console.error(
              "Failed to initialize document with registry:",
              error,
            );
          }
        };

        // Fire initialization sequence
        initDocumentWithRegistry();
      }
    }
  }, [
    project.id,
    project.content,
    project.citations,
    editor,
    isEditorMounted,
    onEditorReady,
    onProjectUpdate,
    toast,
    isCollaborative,
  ]);

  // Load Normalization for Collaborative Mode once initial sync is complete
  useEffect(() => {
    if (
      isCollaborative &&
      editor &&
      isSynced &&
      !hasInitializedContentRef.current &&
      !isNormalizingRef.current // GUARD: Prevent concurrent normalization
    ) {
      // CRITICAL DIAGNOSTIC: Log document structure to detect duplication
      const docJson = editor.getJSON();
      const contentStr = JSON.stringify(docJson);
      const contentLength = contentStr.length;
      const paragraphCount = docJson.content?.length || 0;

      // DETECT: Check for potential duplicate content by comparing consecutive paragraphs
      let duplicatePatterns = 0;
      const duplicateTexts: string[] = [];
      if (docJson.content && docJson.content.length > 1) {
        for (let i = 0; i < docJson.content.length - 1; i++) {
          const currentText = JSON.stringify(docJson.content[i]);
          const nextText = JSON.stringify(docJson.content[i + 1]);
          if (currentText === nextText && currentText.length > 20) {
            duplicatePatterns++;
            duplicateTexts.push(docJson.content[i].content?.[0]?.text?.substring(0, 100) || "empty");
          }
        }
      }

      // CRITICAL: Check if entire document appears duplicated (same content repeated)
      let fullDocumentDuplicate = false;
      if (docJson.content && docJson.content.length > 3) {
        const firstHalf = docJson.content.slice(0, Math.floor(docJson.content.length / 2));
        const secondHalf = docJson.content.slice(Math.floor(docJson.content.length / 2));
        // If first half matches second half, the entire doc is duplicated
        if (JSON.stringify(firstHalf) === JSON.stringify(secondHalf)) {
          fullDocumentDuplicate = true;
        }
      }

      if (duplicatePatterns > 0 || fullDocumentDuplicate) {
        console.error(
          `[Collab] CRITICAL: Content duplication detected!`,
          {
            duplicatePatterns,
            duplicateTexts: duplicateTexts.slice(0, 3),
            fullDocumentDuplicate,
            paragraphCount,
            projectId: project.id,
          }
        );

        // AUTOMATIC FIX: Detect and remove ANY number of full-document repetitions (2x, 3x, 4x, etc.)
        if (fullDocumentDuplicate && docJson.content && docJson.content.length > 3) {
          // Find the smallest repeating unit
          const paragraphs = docJson.content;
          let repeatingUnitLength = 0;

          // Try to find the smallest N where paragraphs[0..N-1] === paragraphs[N..2N-1] === paragraphs[2N..3N-1] etc.
          for (let candidateLength = 1; candidateLength <= Math.floor(paragraphs.length / 2); candidateLength++) {
            const firstChunk = paragraphs.slice(0, candidateLength);
            let isRepeating = true;

            // Check if this pattern repeats throughout the entire document
            for (let i = candidateLength; i < paragraphs.length; i += candidateLength) {
              const nextChunk = paragraphs.slice(i, Math.min(i + candidateLength, paragraphs.length));
              // Allow last chunk to be partial (might be cut off)
              if (nextChunk.length === candidateLength) {
                if (JSON.stringify(firstChunk) !== JSON.stringify(nextChunk)) {
                  isRepeating = false;
                  break;
                }
              }
            }

            if (isRepeating) {
              repeatingUnitLength = candidateLength;
              break; // Found the smallest repeating unit
            }
          }

          // If we found a repeating pattern, keep only one instance
          if (repeatingUnitLength > 0) {
            const uniqueContent = paragraphs.slice(0, repeatingUnitLength);
            const removed = paragraphs.length - repeatingUnitLength;
            const repetitionCount = Math.round(paragraphs.length / repeatingUnitLength);

            console.log(`[Collab] AUTO-FIX: Document repeated ${repetitionCount}x. Keeping ${repeatingUnitLength} unique paragraphs, removing ${removed}.`);

            const cleanedContent = {
              type: "doc",
              content: uniqueContent,
            };

            editor.commands.setContent(cleanedContent, false, {
              preserveWhitespace: false,
            });

            toast({
              title: "Document Cleaned",
              description: `Detected ${repetitionCount}x repetition. Removed ${removed} duplicate paragraphs. Please save the document.`,
              variant: "default",
            });

            console.log(`[Collab] AUTO-FIX: Document deduplicated successfully`,
              { originalParagraphs: paragraphs.length, kept: repeatingUnitLength, removed }
            );

            // Skip normalization on this first load since we just modified content
            hasInitializedContentRef.current = true;
            isNormalizingRef.current = false;
            return;
          }

          // Fallback: simple 2x split (original logic)
          const mid = Math.floor(paragraphs.length / 2);
          console.log(`[Collab] AUTO-FIX: Simple 2x split fallback - keeping ${mid} paragraphs`);

          const cleanedContent = {
            type: "doc",
            content: paragraphs.slice(0, mid),
          };

          editor.commands.setContent(cleanedContent, false, {
            preserveWhitespace: false,
          });

          toast({
            title: "Document Cleaned",
            description: `Removed ${paragraphCount - mid} duplicate paragraphs. Please save the document.`,
            variant: "default",
          });

          hasInitializedContentRef.current = true;
          isNormalizingRef.current = false;
          return;
        }

        // Alert user to the issue (only if not auto-fixed)
        toast({
          title: "Document Issue Detected",
          description: "Duplicate content found. Please contact support if this persists.",
          variant: "destructive",
        });
      }

      console.log(
        `[Collab] Initial Sync Complete - Document stats:`,
        {
          contentLength,
          paragraphCount,
          duplicatePatterns,
          fullDocumentDuplicate,
          firstParagraphs: docJson.content?.slice(0, 3).map((p: any) =>
            p.content?.[0]?.text?.substring(0, 50) || "empty"
          ),
          projectId: project.id,
        }
      );

      console.log(
        "[Collab] Initial Sync Complete, triggering normalization...",
      );
      hasInitializedContentRef.current = true;
      isNormalizingRef.current = true; // Set guard
      currentProjectIdRef.current = project.id;

      const initCollabRegistry = async () => {
        console.log("[Collab] initCollabRegistry starting...", {
          isSynced,
          hasInitialized: hasInitializedContentRef.current,
          projectId: project.id,
        });
        try {
          const { CitationRegistryService } =
            await import("../../services/CitationRegistryService");
          await CitationRegistryService.initializeFromBackend(project.id);
          (window as any).__currentProjectId__ = project.id;

          import("./utils/normalization").then(
            async ({
              detectAndNormalizeBibliography,
              detectAndNormalizeCitations,
            }) => {
              try {
                // Await sequentially instead of Promise.all to avoid conflicting offset math
                await detectAndNormalizeBibliography(editor, project.id);
                await detectAndNormalizeCitations(
                  editor,
                  project.id,
                  project.citations || [],
                );
              } catch (e) {
                console.error("Collab Normalization Failed:", e);
              } finally {
                isNormalizingRef.current = false; // Release guard
              }
            },
          );
        } catch (e) {
          console.error("Collab init registry failed:", e);
          isNormalizingRef.current = false; // Release guard on error
        }
      };

      initCollabRegistry();
    }
  }, [isCollaborative, editor, isSynced, project.id, project.citations]);

  // Periodically scans for new plain text citations to convert them to pills
  useEffect(() => {
    if (!editor || !isEditorMounted || !isViewReady(editor)) return;
    if (editCount === 0) return; // Wait for first user edit
    // In collaborative mode, wait for sync before running normalization
    if (isCollaborative && !isSynced) return;

    const timer = setTimeout(async () => {
      // GUARD: Prevent concurrent normalization that can cause content duplication
      if (isNormalizingRef.current) {
        console.log("[Normalization] Skipping: already in progress");
        return;
      }
      isNormalizingRef.current = true;

      console.log("📚 Running debounced normalization (post-edit)...");
      try {
        const { detectAndNormalizeBibliography, detectAndNormalizeCitations } =
          await import("./utils/normalization");
        // MUST BE SEQUENTIAL — running concurrently causes position-shift conflicts
        // where one transaction invalidates the other's calculated positions,
        // potentially leading to duplicated or misplaced nodes.
        await detectAndNormalizeBibliography(editor, project.id);
        await detectAndNormalizeCitations(
          editor,
          project.id,
          project.citations || [],
        );
      } catch (err) {
        console.error("Debounced normalization failed", err);
      } finally {
        isNormalizingRef.current = false;
      }
    }, 4500); // 4.5s debounce: long enough to not be annoying while typing

    return () => clearTimeout(timer);
  }, [editor, editCount, isEditorMounted, project.id, project.citations, isCollaborative, isSynced]);

  // --- Preview Mode (Read-Only) ---
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (
      editor &&
      !editor.isDestroyed &&
      isEditorMounted &&
      isViewReady(editor)
    ) {
      editor.setEditable(!isPreviewMode);
    }
  }, [editor, isPreviewMode, isEditorMounted]);

  // --- Background Grammar Check (Debounced) ---
  useEffect(() => {
    if (!editor || !isEditorMounted || !isViewReady(editor)) return;

    const checkGrammar = async () => {
      try {
        if (!editor || editor.isDestroyed) return;

        // --- Feature Gate: Check if user has access (Paid Feature) ---
        const hasAccess =
          await SubscriptionService.hasFeatureAccess("grammar_check");
        if (!hasAccess) {
          // Optional: console.log("Grammar check skipped (Free plan)");
          return;
        }

        // --- Optimization: Check only current paragraph ---
        const { state } = editor;
        const { $from } = state.selection;

        if (!$from.parent.isTextblock) return;

        let invalidContext = false;
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d);
          if (
            [
              "table",
              "table_row",
              "table_cell",
              "image",
              "figure",
              "figcaption",
            ].includes(node.type.name)
          ) {
            invalidContext = true;
            break;
          }
        }
        if (invalidContext) return;

        const start = $from.start();
        const end = $from.end();

        // Get text of the current block
        const textToCheck = state.doc.textBetween(start, end, " ", " ");

        if (!textToCheck || textToCheck.length < 5) return;

        console.log("ðŸ“  Background Grammar Check (Block Scoped)...");
        const { GrammarCheckService } =
          await import("../../services/grammarCheckService");

        // Silent check
        const errors = await GrammarCheckService.checkText(textToCheck);

        if (!editor || editor.isDestroyed) return;

        // --- STALENESS CHECK ---
        const currentText = editor.state.doc.textBetween(start, end, " ", " ");
        if (currentText !== textToCheck) {
          console.log(
            "âš ï¸  Text changed during check, aborting grammar highlight.",
          );
          return;
        }

        if (!editor || editor.isDestroyed) return;

        // Transaction to update marks
        const tr = editor.state.tr;
        const schema = editor.state.schema;
        const markType = schema.marks["grammar-error"];

        if (!markType) return;

        // 1. Clear existing grammar errors ONLY in this block
        tr.removeMark(start, end, markType);

        if (errors.length === 0) {
          try {
            if (editor.view && editor.view.dom) editor.view.dispatch(tr);
          } catch (e) { } // Dispatch clear
          console.log("âœ… No grammar issues in block.");
          return;
        }

        // 2. Apply new errors mapped to this block's offset
        let matchCount = 0;
        errors.forEach((err) => {
          try {
            const escaped = err.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "g");
            const matches = Array.from(textToCheck.matchAll(regex));

            matches.forEach((match) => {
              if (match.index !== undefined) {
                // Calculate absolute position in doc
                const matchStart = start + match.index;
                const matchEnd = matchStart + match[0].length;

                tr.addMark(
                  matchStart,
                  matchEnd,
                  markType.create({
                    ...err,
                    original: err.original,
                  }),
                );
                matchCount++;
              }
            });
          } catch (e) {
            console.warn("âš ï¸  Grammar highlight error:", e);
          }
        });

        if (matchCount > 0 || errors.length === 0) {
          try {
            if (editor.view && editor.view.dom) editor.view.dispatch(tr);
          } catch (e) { }
          console.log(`âœ… Applied ${matchCount} grammar highlights to block.`);
        }
      } catch (error) {
        console.error("â Œ Background grammar check failed:", error);
      }
    };

    const timeoutId = setTimeout(checkGrammar, 2000); // 2s debounce
    return () => clearTimeout(timeoutId);
  }, [editCount, editor, isEditorMounted]); // Re-run on editCount change

  // --- Automatic Citation Style Detection ---
  useEffect(() => {
    if (!editor || !isEditorMounted) return;

    const interval = setInterval(() => {
      try {
        const citationPlugin = editor.state.plugins.find((p) =>
          (p as any).key?.startsWith("citationScanner"),
        );
        const state = citationPlugin?.getState(editor.state);

        if (
          state?.stats?.majorityStyle &&
          state.stats.majorityStyle !== project.citation_style
        ) {
          console.log(
            `[AutoStyle] Detected style change: ${state.stats.majorityStyle}`,
          );
          onProjectUpdate?.({
            ...project,
            citation_style: state.stats.majorityStyle,
          });
          toast({
            title: "Style Detected",
            description: `We've detected you're using ${state.stats.majorityStyle} formatting and updated your settings.`,
          });
        }
      } catch (err) { }
    }, 5000);

    return () => clearInterval(interval);
  }, [editor, isEditorMounted, project.citation_style, project, onProjectUpdate, toast]);

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

  useEffect(() => {
    startTimeRef.current = new Date();

    const timeInterval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    const activityInterval = setInterval(async () => {
      const currentStats = statsRef.current;

      const currentAiEditCount =
        (editor?.storage as any)?.aiTracking?.aiEditCount || 0;

      const timeDelta =
        currentStats.timeSpent - lastSyncStatsRef.current.timeSpent;
      const editDelta =
        currentStats.editCount - lastSyncStatsRef.current.editCount;
      const aiEditDelta =
        currentAiEditCount - lastSyncStatsRef.current.aiEditCount;

      if (project.id && (timeDelta > 0 || editDelta > 0 || aiEditDelta > 0)) {
        try {
          lastSyncStatsRef.current = {
            timeSpent: currentStats.timeSpent,
            editCount: currentStats.editCount,
            aiEditCount: currentAiEditCount,
          };

          await AuthorshipService.recordActivity({
            projectId: project.id,
            timeSpent: timeDelta,
            editCount: editDelta,
            wordCount: currentStats.wordCount,
            manualEdits: editDelta,
            aiAssistedEdits: aiEditDelta,
            isDelta: true,
          } as any);

          console.log("Activity delta recorded:", {
            timeAdded: timeDelta,
            editsAdded: editDelta,
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
  }, [project.id, editor?.storage]);

  // Function to clear all highlights
  const clearHighlights = () => {
    if (editor) {
      editor.chain().focus().clearAllHighlights().clearAllGrammarErrors().run();
    }
  };

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
        const { citationId, text, url } = e.detail;

        if (citationId) {
          editor.commands.insertCitation({
            citationId,
            text: text || undefined,
            url: url || undefined,
          });
        } else {
          editor.commands.insertContent(text);
        }
      }
    };

    window.addEventListener(
      "insert-citation",
      handleInsertCitation as EventListener,
    );
    return () => {
      window.removeEventListener(
        "insert-citation",
        handleInsertCitation as EventListener,
      );
    };
  }, [editor]);

  // Listen for consensus highlight events from the configured Details Sidebar
  useEffect(() => {
    const handleApplyConsensus = (e: CustomEvent) => {
      if (editor && e.detail) {
        const { claim, result } = e.detail;

        const highlightAttrs = {
          claim: claim,
          consensusLevel: result.consensusLevel,
          consensusScore: result.agreementPercentage,
          evidenceConvergent: result.evidenceConvergent,
          dissentAcknowledged: result.dissentAcknowledged,
          biasCheckStatus: result.biasCheckStatus,
          methodologyScore: result.methodologyScore,
          extraordinaryEvidenceRequired: result.extraordinaryEvidenceRequired,
        };

        // Insert the red pin node into the editor
        editor
          .chain()
          .focus()
          .insertContent({
            type: "consensusPin",
            attrs: highlightAttrs,
          })
          .run();
      }
    };

    window.addEventListener(
      "apply-consensus-highlight",
      handleApplyConsensus as EventListener,
    );
    return () => {
      window.removeEventListener(
        "apply-consensus-highlight",
        handleApplyConsensus as EventListener,
      );
    };
  }, [editor]);

  const handleSave = React.useCallback(async () => {
    if (!editor) return;

    // setIsSaving(true);

    try {
      // Get the current content from the editor
      const content = editor.getJSON();

      // Update the project via API
      const result = await documentService.updateProject(
        project.id,
        title,
        description,
        content,
        editor.storage.characterCount.words(),
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

  // Auto-save every 30 seconds if there are changes (non-collaborative mode)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (editCount > 0 && !isCollaborative) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [editCount, handleSave, isCollaborative]);

  const prevTitleRef = useRef(title);
  const prevDescriptionRef = useRef(description);
  useEffect(() => {
    if (!isCollaborative) return;
    if (
      title === prevTitleRef.current &&
      description === prevDescriptionRef.current
    )
      return;

    const timeoutId = setTimeout(async () => {
      try {
        await documentService.updateProject(
          project.id,
          title,
          description,
          undefined,
          project.word_count,
          project.citation_style,
        );
        prevTitleRef.current = title;
        prevDescriptionRef.current = description;
        console.log("[CollabMode] Title/description saved:", title);
      } catch (err) {
        console.error("[CollabMode] Failed to save title/description:", err);
      }
    }, 2000); // 2s debounce

    return () => clearTimeout(timeoutId);
  }, [
    title,
    description,
    isCollaborative,
    project.id,
    project.content,
    project.word_count,
    project.citation_style,
  ]);

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
        setShowUpgradeDraftModal(true);
      }
    } catch (error) {
      console.error("Failed to check feature access", error);
      setShowUpgradeDraftModal(true);
    }
  };

  const [auditReport, setAuditReport] = useState<any>(null);

  if (isCollaborative && (!isSynced || collabStatus === "connecting")) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-8 text-center">
        {collabError ? (
          <>
            <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Connection Problem
            </h3>
            <p className="text-sm text-gray-500 mt-2 mb-6 max-w-xs">
              {collabError}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setRetryCount((prev) => prev + 1)}>
                Retry Connection
              </Button>
              <Button
                onClick={() => {
                  setIsSynced(true);
                  setCollabStatus("offline");
                }} // Fallback to local-only (dangerous but allows viewing)
              >
                Work Offline
              </Button>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Connecting to Workspace...
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              {collabStatus === "connecting"
                ? "Establishing secure connection for real-time collaboration..."
                : "Syncing document content..."}
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <EditorProvider editor={editor}>
      {editor && isEditorMounted && <GrammarBubbleMenu editor={editor} />}
      {editor && isEditorMounted && (
        <ConsensusBubbleMenu editor={editor} projectId={project.id} />
      )}
      <AuditReportModal
        isOpen={!!auditReport}
        onClose={() => setAuditReport(null)}
        report={auditReport}
      />
      <div
        className={`flex flex-col h-full bg-white transition-all duration-500 ${isFocusMode ? "fixed inset-0 z-[100] p-0" : ""}`}>
        {/* View-Only Banner */}
        {isReadOnly && (
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-medium flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>
              You have <strong>view-only</strong> access to this document.
              Contact an admin to request editing permissions.
            </span>
          </div>
        )}

        <UpgradeModal
          isOpen={showUpgradeDraftModal}
          onClose={() => setShowUpgradeDraftModal(false)}
          feature="Draft Comparison"
          title="Premium Feature"
          message="Draft Comparison is available on paid plans. Upgrade to unlock accurate version comparison."
        />

        {/* Editor Header - Hidden in Focus Mode */}
        {!isFocusMode && (
          <div className="border-b border-gray-200 p-4 bg-white z-10 flex-shrink-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-bold border-none focus:outline-none focus:ring-0 pl-0 text-gray-900 min-w-[200px] max-w-[400px]"
                  placeholder="Untitled Document"
                />
              </div>
              <div className="flex items-center space-x-2 flex-nowrap overflow-x-auto pb-1 custom-scrollbar min-w-0 flex-1 md:justify-center justify-start max-md:mt-2">
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`p-2 border rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isPreviewMode
                    ? "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  title={
                    isPreviewMode
                      ? "Switch to Edit Mode"
                      : "Switch to Preview Mode"
                  }>
                  {isPreviewMode ? (
                    <PenTool className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                  {isPreviewMode ? "Edit" : "Preview"}
                </button>

                <button
                  onClick={onToggleFocusMode}
                  className={`p-2 border rounded-md text-sm font-medium transition-all flex items-center gap-2 ${isFocusMode
                    ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}>
                  {isFocusMode ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {isFocusMode ? "Exit" : "Focus"}
                  </span>
                </button>

                {isCollaborative && (
                  <Button
                    onClick={async () => {
                      if (isFreePlan) {
                        setShowUpgradeModal(true);
                        return;
                      }
                      if (!editor || !project.id) return;
                      try {
                        try {
                          toast({
                            title: "Saving new version...",
                            description: "Please wait.",
                          });
                          await documentService.createDocumentVersion(
                            project.id,
                            editor.getJSON(),
                            editor.storage.characterCount.words(),
                          );
                          toast({
                            title: "Version saved successfully!",
                            variant: "default",
                          });
                        } catch (error) {
                          console.error("Failed to save version:", error);
                          toast({
                            title: "Failed to save version",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        console.error("Failed to save version:", error);
                      }
                    }}
                    className={`gap-2 h-9 px-4 py-2 border border-green-200 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100 transition-colors flex items-center gap-2 ${isFreePlan ? "opacity-70" : ""}`}
                    title={
                      isFreePlan
                        ? "Available on Plus Plan"
                        : "Create a named version checkpoint"
                    }>
                    <div className="relative">
                      <Save className="w-4 h-4 text-green-600" />
                      {isFreePlan && (
                        <Lock className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 text-red-600" />
                      )}
                    </div>
                    <span className="font-bold text-xs">Save Version</span>
                    {isFreePlan && (
                      <span className="ml-1 text-[10px] bg-green-50 text-green-600 px-1 rounded font-bold uppercase tracking-wider">
                        PLUS
                      </span>
                    )}
                  </Button>
                )}

                {isCollaborative && (
                  <Button
                    onClick={() => {
                      if (isFreePlan) {
                        setShowUpgradeModal(true);
                        return;
                      }
                      setIsHistoryModalOpen(true);
                    }}
                    className="gap-2 h-9 px-4 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2"
                    title={
                      isFreePlan
                        ? "Available on Plus Plan"
                        : "View version history"
                    }>
                    <div className="relative">
                      <History className="w-4 h-4 text-indigo-600" />
                      {isFreePlan && (
                        <Lock className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 text-red-600" />
                      )}
                    </div>
                    <span className="font-bold text-xs">History</span>
                    {isFreePlan && (
                      <span className="ml-1 text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded font-bold uppercase tracking-wider">
                        PLUS
                      </span>
                    )}
                  </Button>
                )}

                <Button
                  onClick={() => setIsStyleDialogOpen(true)}
                  className="gap-2 h-9 px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
                  title={`Current Style: ${project.citation_style || "APA"} - Click to change`}>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                    <span className="font-bold text-xs">
                      {project.citation_style || "APA"}
                    </span>
                  </div>
                </Button>

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

                <button
                  className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                  onClick={() => setIsExportWorkflowOpen(true)}
                  data-tour="export-menu">
                  <Download className="w-4 h-4" />
                  Export
                </button>

                {lastScanResult?.realityCheck && (
                  <button
                    onClick={() =>
                      onOpenPanel?.(
                        "reality-check",
                        lastScanResult.realityCheck,
                      )
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
                    <span>
                      Score: {Math.round(lastScanResult.overallScore)}%
                    </span>
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
              </div>
            </div>
          </div>
        )}

        {/* Editor Toolbar - Hidden in Focus Mode and read-only mode */}
        {!isFocusMode && isEditorMounted && !isReadOnly && (
          <EditorToolbar editor={editor} />
        )}

        {/* Editor Content & Sidebar Container */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
            {/* Main Editor Area */}
            <div
              className={`flex-1 overflow-auto transition-all duration-500 ${isReadOnly ? "cursor-default" : "cursor-text"} ${isFocusMode ? "p-12 md:p-24" : "p-8"}`}
              onClick={(e) => {
                if (isReadOnly) return;
                if (editor && !editor.isDestroyed && isViewReady(editor)) {
                  const target = e.target as HTMLElement;
                  const isProseMirror = target.closest(".ProseMirror");
                  if (!isProseMirror && editor.isEmpty) {
                    e.preventDefault();
                    editor.commands.focus("end");
                  }
                }
              }}>
              {editor && isEditorMounted && <TableBubbleMenu editor={editor} />}
              {/* CSS-level read-only enforcement — bulletproof regardless of Tiptap editable state */}
              <div
                style={
                  isReadOnly
                    ? { pointerEvents: "none", userSelect: "none" }
                    : undefined
                }>
                <DeferredEditorContent
                  editor={editor}
                  className={`${isFocusMode ? "max-w-[900px]" : "max-w-[816px]"} mx-auto prose prose-lg min-h-full focus:outline-none p-8 bg-white rounded-lg shadow-sm`}
                />
              </div>
              {/* Behavioral Tracker */}
              {isEditorMounted && (
                <BehavioralTracker
                  projectId={project.id}
                  userId={project.user_id}
                />
              )}
            </div>
          </div>
        </div>

        {/* Floating Exit Button - Visible ONLY in Focus Mode */}
        {isFocusMode && onToggleFocusMode && (
          <button
            onClick={onToggleFocusMode}
            className="fixed top-6 right-6 z-[110] px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2 opacity-50 hover:opacity-100"
            title="Exit Focus Mode (Esc)">
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
              title="AI Integrity Assistant"
              data-tour="ai-copilot">
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

            <button
              onClick={handleCompareClick}
              className="p-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              title="Compare with Previous">
              <GitCompare className="w-4 h-4" />
              Compare
            </button>

            {/* Team Chat Button */}
            {isCollaborative && onOpenPanel && (
              <button
                onClick={() => {
                  onOpenPanel("team-chat");
                }}
                className="px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-md text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center gap-2"
                title="Open Team Chat">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Chat</span>
              </button>
            )}

            <EditorHelpDialog
              open={showHelpDialog}
              onOpenChange={setShowHelpDialog}
            />

            {/* Floating Help Button */}
            <button
              onClick={() => setShowHelpDialog(true)}
              className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-110"
              title="Help & Tutorials"
              aria-label="Help">
              <HelpCircle className="w-6 h-6" />
            </button>

            <AuthorshipCertificateAdapter
              projectId={project.id}
              projectTitle={title}
              editor={editor}
            />
          </div>
        )}

        {/* Reality Check Manual Trigger */}
        {lastScanResult?.realityCheck && (
          <div className="fixed top-20 right-4 z-50">
            <button
              onClick={() => {
                if (onOpenPanel && lastScanResult.realityCheck) {
                  onOpenPanel("reality-check", lastScanResult.realityCheck);
                }
              }}
              className="bg-white/90 backdrop-blur border border-indigo-100 shadow-sm px-3 py-1.5 rounded-full text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1.5">
              <span>Reality Check</span>
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

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="citations"
        />

        <ExportWorkflowModal
          isOpen={isExportWorkflowOpen}
          onClose={() => setIsExportWorkflowOpen(false)}
          project={{ ...project, title }}
          currentContent={editor?.getJSON()}
          currentHtmlContent={editor?.getHTML()}
          editor={editor}
          onProjectUpdate={onProjectUpdate}
          initialAuditReport={lastAuditReport}
        />

        <VersionHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          projectId={project.id}
          onRestore={(restoredProject) => {
            if (editor) {
              // Parse the JSON content into a ProseMirror document
              const newDoc = editor.schema.nodeFromJSON(
                restoredProject.content,
              );

              // Create a transaction that heavily replaces the document
              const tr = editor.state.tr.replaceWith(
                0,
                editor.state.doc.content.size,
                newDoc.content,
              );

              // By setting this flag, AuthorshipExtension will ignore this update, preserving historical authorship marks
              tr.setMeta("skipAuthorship", true);

              // Dispatch the new state
              editor.view.dispatch(tr);
            }
            if (onProjectUpdate) {
              onProjectUpdate(restoredProject);
            }
          }}
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
              citation_style: style,
            });
            toast({
              title: "Citation Style Updated",
              description: `Default style set to ${style}. Run an audit to enforce rules.`,
            });
          }
        }}
      />
    </EditorProvider>
  );
};
