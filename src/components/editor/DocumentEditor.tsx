import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
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
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
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
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { useAuth } from "../../hooks/useAuth";
import { GrammarBubbleMenu } from "./GrammarBubbleMenu";
import { AuditReportModal } from "../audit/AuditReportModal";
import { EditorToolbar } from "./editor-toolbar";
import { ExportWorkflowModal } from "../export/ExportWorkflowModal";
import { VersionHistoryModal } from "./VersionHistoryModal";
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
} from "lucide-react";
import { Button } from "../ui/button";
import ConfigService from "../../services/ConfigService";

function isViewReady(ed: any): boolean {
  if (!ed) return false;
  try {
    return !!(ed.view && ed.view.dom);
  } catch {
    return false;
  }
}

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
  const { user } = useAuth();
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const [collabReady, setCollabReady] = useState(false); // Collaboration State
  const [isEditorMounted, setIsEditorMounted] = useState(false);
  const [collabStatus, setCollabStatus] = useState<string>("disconnected");
  const [isSynced, setIsSynced] = useState(false);
  const [collabError, setCollabError] = useState<string | null>(null);
  const isSyncedRef = useRef(false);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle Hocuspocus Lifecycle
  useEffect(() => {
    if (!isCollaborative || !project.id) {
      providerRef.current = null;
      ydocRef.current = null;
      setCollabReady(false);
      setIsSynced(false);
      isSyncedRef.current = false;
      return;
    }

    console.log(
      `[HP Lifecycle] Initializing provider for project: ${project.id}`,
    );
    setCollabStatus("connecting");
    setIsSynced(false);
    setCollabReady(false);
    isSyncedRef.current = false;
    setCollabError(null);

    const getSupabaseToken = () => {
      const auth_token = localStorage.getItem("auth_token");
      if (auth_token) return auth_token;

      const supabaseKey = Object.keys(localStorage).find(
        (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
      );
      if (supabaseKey) {
        try {
          const sessionData = JSON.parse(
            localStorage.getItem(supabaseKey) || "{}",
          );
          return sessionData?.access_token || "";
        } catch (e) {
          console.error("Failed to parse Supabase session", e);
        }
      }
      return "";
    };

    const authToken = getSupabaseToken();
    console.log(
      `[HP Auth] Initializing with token length: ${authToken.length}`,
    );

    const freshYdoc = new Y.Doc();
    ydocRef.current = freshYdoc;

    const newProvider = new HocuspocusProvider({
      url: ConfigService.getCollabUrl(),
      name: `project-${project.id}`,
      document: freshYdoc,
      token: authToken,
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
        setCollabReady(true);
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
  }, [project.id, isCollaborative]);

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
  const [isComparisonSelectorOpen, setIsComparisonSelectorOpen] =
    useState(false);
  const [isExportWorkflowOpen, setIsExportWorkflowOpen] = useState(false);
  const [editCount, setEditCount] = useState(0);
  const hasInitializedContentRef = useRef(false);
  const currentProjectIdRef = useRef<string | null>(null);

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
        ...(isCollaborative &&
        collabReady &&
        providerRef.current &&
        ydocRef.current
          ? [
              Collaboration.configure({
                document: ydocRef.current,
              }),
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
              AuthorshipExtension.configure({
                user: {
                  id: user?.id,
                  name:
                    user?.user_metadata?.full_name ||
                    user?.email ||
                    "Anonymous",
                  color: cursorColor,
                },
              } as any),
            ]
          : []),
        HighlightExtension,
        UserHighlightExtension,
        CharacterCount,
        MathExtension,
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
        CitationNode,
        BibliographyEntry,
        CitationLifecycleExtension,
        AutoNumbering, // Enable automatic figure and table numbering
        GrammarExtension, // AI Grammar Checker
        CitationScannerExtension,
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
            } catch (e) {}
            return true;
          }

          return false;
        },
      },
    },
    [project.id, isCollaborative, collabReady],
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
    if (editor && isEditorMounted && isViewReady(editor)) {
      if (onEditorReady) {
        onEditorReady(editor);
      }
    }

    if (
      editor &&
      project.content &&
      currentProjectIdRef.current !== project.id &&
      !isCollaborative
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
      !hasInitializedContentRef.current
    ) {
      console.log(
        "[Collab] Initial Sync Complete, triggering normalization...",
      );
      hasInitializedContentRef.current = true;
      currentProjectIdRef.current = project.id;

      const initCollabRegistry = async () => {
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
              }
            },
          );
        } catch (e) {
          console.error("Collab init registry failed:", e);
        }
      };

      initCollabRegistry();
    }
  }, [isCollaborative, editor, isSynced, project.id, project.citations]);

  // Periodically scans for new plain text citations to convert them to pills
  useEffect(() => {
    if (!editor || !isEditorMounted || !isViewReady(editor)) return;
    if (editCount === 0) return; // Wait for first user edit

    const timer = setTimeout(async () => {
      console.log("ðŸ“  Running debounced normalization (post-edit)...");
      try {
        const { detectAndNormalizeBibliography, detectAndNormalizeCitations } =
          await import("./utils/normalization");
        await Promise.all([
          detectAndNormalizeCitations(
            editor,
            project.id,
            project.citations || [],
          ),
          detectAndNormalizeBibliography(editor, project.id),
        ]);
      } catch (err) {
        console.error("Debounced normalization failed", err);
      }
    }, 4500); // 4.5s debounce: long enough to not be annoying while typing

    return () => clearTimeout(timer);
  }, [editor, editCount, isEditorMounted, project.id, project.citations]);

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
        const { selection } = state;
        const { $from } = selection;

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
          } catch (e) {} // Dispatch clear
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
          } catch (e) {}
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
      } catch (err) {}
    }, 5000);

    return () => clearInterval(interval);
  }, [editor, isEditorMounted, project.citation_style, onProjectUpdate, toast]);

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
        setShowUpgradeModal(true);
      }
    } catch (error) {
      console.error("Failed to check feature access", error);
      setShowUpgradeModal(true);
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
              <Button
                variant="outline"
                onClick={() => window.location.reload()}>
                Retry Connection
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsSynced(true)} // Fallback to local-only (dangerous but allows viewing)
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
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
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
              <div className="flex items-center space-x-2 flex-wrap">
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`p-2 border rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    isPreviewMode
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
                  className={`p-2 border rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    isFocusMode
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
                    variant="outline"
                    size="sm"
                    onClick={async () => {
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
                    className="gap-2 h-9 border-green-400 text-green-800 bg-white hover:bg-green-50 hover:text-green-900 transition-colors shadow-sm px-3"
                    title="Create a named version checkpoint">
                    <Save className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-xs">Save Version</span>
                  </Button>
                )}

                {isCollaborative && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="gap-2 h-9 border-indigo-400 text-indigo-800 bg-white hover:bg-indigo-50 hover:text-indigo-900 transition-colors shadow-sm px-3"
                    title="View version history">
                    <History className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs">History</span>
                  </Button>
                )}

                {/* Team Chat Button */}
                {isCollaborative && onOpenPanel && (
                  <button
                    onClick={() => onOpenPanel("team-chat")}
                    className="p-2 border rounded-md text-sm font-medium transition-all flex items-center gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    title="Open Team Chat">
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Chat</span>
                  </button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStyleDialogOpen(true)}
                  className="gap-2 h-9 border-blue-400 text-blue-800 bg-white hover:bg-blue-50 hover:text-blue-900 transition-colors shadow-sm px-3"
                  title={`Current Style: ${project.citation_style || "APA"} - Click to change`}>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
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
                <EditorContent
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
