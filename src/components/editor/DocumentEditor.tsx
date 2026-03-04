// BOM_FIX_FORCE
import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
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
import { OriginalityScan } from "../../services/originalityService";
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
import Link from "@tiptap/extension-link";
import { CitationLifecycleExtension } from "../../extensions/CitationLifecycleExtension";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { formatContentForTiptap } from "../../utils/editorUtils";
import { detectAndNormalizeCitations } from "./utils/normalization";
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
  Save,
  PenTool,
  Loader2,
  History,
  MessageSquare,
} from "lucide-react";
import { Button } from "../ui/button";

// Synchronous helper: safely check if editor's view is mounted.
// This is CRITICAL for collaborative mode where isEditorMounted state can be
// STALE after editor recreation. React batches state updates, so effects may
// run with isEditorMounted=true against a new unmounted editor.
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
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  // --- FIX: Use refs for provider/ydoc to prevent useEditor re-creation ---
  // Storing these as refs ensures the editor is only created ONCE per project
  // in collab mode, after the Y.Doc is synced. Previously, using useState caused
  // useEditor to re-fire when provider/ydoc went from null → initialized,
  // which duplicated the document content.
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const [collabReady, setCollabReady] = useState(false);
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

    // Fetch the token directly from local storage or supabase session
    const getSupabaseToken = () => {
      // First try standard auth token
      const auth_token = localStorage.getItem("auth_token");
      if (auth_token) return auth_token;

      // Try to extract from Supabase session if auth_token is missing
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

    // Create a fresh Y.Doc for THIS project instance
    const freshYdoc = new Y.Doc();
    ydocRef.current = freshYdoc;

    const newProvider = new HocuspocusProvider({
      url: process.env.REACT_APP_HOCUSPOCUS_URL || "ws://localhost:9081",
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
        // --- KEY FIX: Only flip collabReady ONCE after sync ---
        // This is the single state change that triggers useEditor to create
        // the editor with the Collaboration extension. The Y.Doc already has
        // server content at this point, so no duplication occurs.
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

  // Handle Connection Timeout
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

  // Dialog States
  const [isComparisonSelectorOpen, setIsComparisonSelectorOpen] =
    useState(false);
  const [isExportWorkflowOpen, setIsExportWorkflowOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [lastScanResult] = useState<OriginalityScan | null>(null);
  // const [lastAIScanResult, setLastAIScanResult] = useState<AIScanResult | null>(null);

  const [citationSuggestions] = useState<any>(null);
  const [editCount, setEditCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0); // in seconds
  const startTimeRef = useRef<Date | null>(null);
  const hasInitializedContentRef = useRef(false);
  const currentProjectIdRef = useRef<string | null>(null);

  // Layout State

  // Sync state when project changes
  useEffect(() => {
    setTitle(project.title);
    setDescription(project.description || "");
  }, [project.id, project.title, project.description]);

  // Scored matching function for bibliography navigation
  const scrollToReference = (citationId: string) => {
    // Note: Using project.citations to match component data structure
    const citation = project.citations?.find((c) => c.id === citationId);
    if (!citation) return;

    // Extract search terms
    const author =
      (citation.authors?.[0] as any)?.lastName ||
      citation.authors?.[0] ||
      citation.author ||
      "";
    const authorLastName = author.includes(",")
      ? author.split(",")[0].trim()
      : author;
    const year = citation.year?.toString() || "";

    // Get editor element
    const editorElement = document.querySelector(".ProseMirror") as HTMLElement;
    if (!editorElement) return;

    // Find references section
    const headings = editorElement.querySelectorAll("h1, h2, h3, h4");
    let refSectionTop = Infinity;
    for (const heading of Array.from(headings)) {
      const text = heading.textContent?.toLowerCase() || "";
      if (
        text.includes("reference") ||
        text.includes("bibliography") ||
        text.includes("works cited")
      ) {
        refSectionTop = heading.getBoundingClientRect().top;
        break;
      }
    }

    // Score each paragraph
    const paragraphs = editorElement.querySelectorAll(
      'p, div[data-type="paragraph"]',
    );
    let bestMatch: HTMLElement | null = null;
    let bestScore = 0;

    for (const para of Array.from(paragraphs)) {
      const element = para as HTMLElement;
      const text = element.textContent || "";
      const trimmedText = text.trim();

      if (trimmedText.length < 5) continue;

      let score = 0;

      // SCORING RULES
      if (
        authorLastName &&
        trimmedText.toLowerCase().startsWith(authorLastName.toLowerCase())
      )
        score += 0.6;
      if (
        authorLastName &&
        text.toLowerCase().includes(authorLastName.toLowerCase())
      )
        score += 0.3;
      if (year && text.includes(year)) score += 0.2;
      if (element.getBoundingClientRect().top > refSectionTop) score += 0.1;

      if (score > bestScore && score >= 0.4) {
        bestScore = score;
        bestMatch = element;
      }
    }

    // Scroll to best match
    if (bestMatch) {
      console.log(
        `[ScrollToRef] Found match with score ${bestScore.toFixed(2)}`,
      );
      bestMatch.scrollIntoView({ behavior: "smooth", block: "center" });
      bestMatch.classList.add("highlight-reference-flash");
      setTimeout(
        () => bestMatch?.classList.remove("highlight-reference-flash"),
        2000,
      );

      toast({
        title: "Reference Found",
        description: "Jumped to bibliography entry.",
      });
    } else {
      console.warn(
        `[ScrollToRef] No match found for: ${authorLastName} (${year}). Score: ${bestScore}`,
      );
      toast({
        title: "Reference Not Found",
        description: "Could not locate the bibliography entry.",
        variant: "destructive",
      });
    }
  };

  // Initialize editor with project content or create empty content
  // Since we created 'ydoc' and 'provider' synchronously on initial render via useState,
  // we can safely add the Collaboration extensions immediately without crashing.
  const editor = useEditor(
    {
      immediatelyRender: false, // Defer view creation until EditorContent mounts the DOM
      editable: !isReadOnly, // Lock editor for viewer-role collaborators
      extensions: [
        StarterKit.configure({
          history: !isCollaborative, // Disable history in collab mode (handled by Yjs)
          link: false, // Prevent duplicate extension names error if StarterKit includes it
        } as any),
        ...(isCollaborative &&
          collabReady &&
          providerRef.current &&
          ydocRef.current
          ? [
            Collaboration.configure({
              document: ydocRef.current, // Bind directly to the stable Y.Doc (ref)
            }),
            CollaborationCursor.configure({
              provider: providerRef.current, // Bind directly to the Hocuspocus provider (ref)
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
        HighlightExtension,
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
        // Custom Extensions
        AuthorBlockExtension,
        AuthorExtension,
        CalloutBlockExtension,
        CoverPageExtension,
        CustomCodeBlockExtension,
        AuthorshipExtension.configure({
          user: {
            id: user?.id,
            name: user?.user_metadata?.full_name || user?.email || "Anonymous",
            color: cursorColor,
          },
        } as any),
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
        BibliographyEntry,
        CitationLifecycleExtension,
        AutoNumbering, // Enable automatic figure and table numbering
        GrammarExtension, // AI Grammar Checker
      ],
      // Only load initial content if NOT collaborative (Collab loads from Yjs)
      content: isCollaborative
        ? undefined
        : formatContentForTiptap(project.content),
      // NOTE: In collab mode, content is loaded from Yjs (Hocuspocus server) not here.
      onUpdate: ({ editor, transaction }) => {
        // Prevent infinite loops from internal normalization/audit updates
        if (
          transaction.getMeta("normalization") ||
          transaction.getMeta("integrity-check")
        ) {
          return;
        }

        // Increment edit count when content changes
        setEditCount((prev) => prev + 1);
      },
      editorProps: {
        attributes: {
          class: `focus:outline-none min-h-full prose-table:w-full prose-img:rounded-md prose-img:shadow-md`,
          spellcheck: "false",
        },
        // Citation click handling (must be done in ProseMirror to prevent default navigation before React sees it)
        handleClick: (view, pos, event) => {
          const target = event.target as HTMLElement;

          // --- Handle clicks on bibliography URL decorations (blue underlined URLs) ---
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

          // --- Handle clicks on in-text citation pills ---
          const citation = target.closest(
            "a.citation-node",
          ) as HTMLAnchorElement;
          if (citation) {
            event.preventDefault();
            event.stopPropagation();

            // data-url = external source URL (DOI etc); href = internal #bib-xxx anchor
            const externalUrl = citation.getAttribute("data-url");
            const anchorHref = citation.getAttribute("href");
            const isModifierClick =
              event.ctrlKey || event.metaKey || event.shiftKey;

            if (isModifierClick && externalUrl) {
              // Ctrl/Cmd+Click → open external source
              window.open(externalUrl, "_blank", "noopener,noreferrer");
            } else if (anchorHref && anchorHref.startsWith("#")) {
              // Normal click → scroll to bibliography entry and flash it
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

            // Select the citation atom node so user can Backspace/Delete to remove it
            try {
              const sel = NodeSelection.create(view.state.doc, pos);
              view.dispatch(view.state.tr.setSelection(sel));
            } catch (e) {
              // pos might not resolve to a node — not a critical failure
            }
            return true;
          }

          return false;
        },
      },
      // Dependencies check: since `ydoc` and `provider` are stable state objects initialized
      // exactly once per component lifecycle, using them here is safe and effectively
      // binds the editor to them persistently until the component unmounts.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    // --- FIX: Use collabReady (not provider/ydoc objects) to prevent double editor creation ---
    // collabReady only becomes true ONCE after onSynced, so the editor is created exactly once
    // per project with the Y.Doc already containing server content. No duplication.
    [project.id, isCollaborative, collabReady],
  );

  // --- Sync read-only state reactively ---
  // `editable` in useEditor options only applies at creation time.
  // Since `isReadOnly` is derived from async permissions, we must call
  // `setEditable` once permissions resolve so the editor reflects the true state.
  useEffect(() => {
    if (!editor) return;
    const shouldBeEditable = !isReadOnly;
    if (editor.isEditable !== shouldBeEditable) {
      editor.setEditable(shouldBeEditable);
    }
  }, [editor, isReadOnly]);

  // --- Detect when EditorContent has mounted the editor view into the DOM ---
  // We can't use `onCreate` (fires in the Editor constructor before EditorContent renders).
  // Instead, poll with requestAnimationFrame until editor.view.dom is available.
  useEffect(() => {
    if (!editor) {
      setIsEditorMounted(false);
      return;
    }

    // Helper: check if view is truly mounted
    const checkView = (): boolean => {
      try {
        return !!(editor.view && editor.view.dom);
      } catch {
        return false;
      }
    };

    // Already mounted (e.g. non-collab mode where editor is reused)
    if (checkView()) {
      setIsEditorMounted(true);
      return;
    }

    // Poll until EditorContent renders and mounts the view
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

  // Load project content only once per document (Non-Collaborative Mode)
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
      !isCollaborative // Skip manual setContent in collaborative mode
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
            // Expose current project ID globally so CitationNode can trigger async registry lookups
            (window as any).__currentProjectId__ = project.id;
            console.log(
              "✅ Citation registry initialized from backend successfully",
            );

            editor.commands.setContent(formatContentForTiptap(project.content));
            hasInitializedContentRef.current = true;
            currentProjectIdRef.current = project.id;

            // --- Silent Normalization on Load ---
            // Convert plain text citations to blue interactive nodes
            // Use timeout to ensure editor is stable and we don't conflict with initial render transactions
            setTimeout(async () => {
              if (editor && !editor.isDestroyed) {
                await detectAndNormalizeCitations(editor, project.id, project.citations || []);
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
    project,
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

          await detectAndNormalizeCitations(editor, project.id, project.citations || []);
        } catch (e) {
          console.error("Collab Normalization Failed:", e);
        }
      };

      initCollabRegistry();
    }
  }, [isCollaborative, editor, isSynced, project.id, project.citations]);

  // --- Background Normalization (Debounced Loop) ---
  // Periodically scans for new plain text citations to convert them to pills
  useEffect(() => {
    if (!editor || !isEditorMounted || !isViewReady(editor)) return;
    if (editCount === 0) return; // Wait for first user edit

    const timer = setTimeout(async () => {
      console.log("ðŸ“  Running debounced normalization (post-edit)...");
      await detectAndNormalizeCitations(editor, project.id, project.citations || []);
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

    // Don't check strictly empty or very short docs
    let text = "";
    try {
      text = editor.getText();
    } catch (e) {
      return; // editor view not available yet
    }
    if (text.length < 10) return;

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

        // Get the current block (paragraph) range
        const start = $from.start();
        const end = $from.end();

        // Get text of the current block
        // We use textBetween to ensure we get clean text for the node
        const textToCheck = state.doc.textBetween(start, end, " ", " ");

        // Don't check strictly empty or very short blocks
        if (!textToCheck || textToCheck.length < 5) return;

        console.log("ðŸ“  Background Grammar Check (Block Scoped)...");
        const { GrammarCheckService } =
          await import("../../services/grammarCheckService");

        // Silent check
        const errors = await GrammarCheckService.checkText(textToCheck);

        if (!editor || editor.isDestroyed) return;

        // --- STALENESS CHECK ---
        // Verify if the text at this range is still the same.
        // If the user typed while we were checking, abort to prevent applying marks to wrong offsets.
        const currentText = editor.state.doc.textBetween(start, end, " ", " ");
        if (currentText !== textToCheck) {
          console.log(
            "⚠️ Text changed during check, aborting grammar highlight.",
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
      const currentAiEditCount =
        (editor?.storage as any)?.aiTracking?.aiEditCount || 0;

      // Calculate Deltas
      const timeDelta =
        currentStats.timeSpent - lastSyncStatsRef.current.timeSpent;
      const editDelta =
        currentStats.editCount - lastSyncStatsRef.current.editCount;
      const aiEditDelta =
        currentAiEditCount - lastSyncStatsRef.current.aiEditCount;

      // Only save if there's been NEW activity
      if (project.id && (timeDelta > 0 || editDelta > 0 || aiEditDelta > 0)) {
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
      // Remove all highlight marks (Citation/Originality) AND Grammar errors
      editor.chain().focus().clearAllHighlights().clearAllGrammarErrors().run();
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

  // FIX 5: Remove duplicate timer effect — the timer above (line ~747) already handles this.

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
          // Use semantic citation node — pass text + url so node doesn't fall back to raw registry title
          editor.commands.insertCitation({
            citationId,
            text: text || undefined,
            url: url || undefined,
          });
        } else {
          // Fallback to text insertion if no ID (should not happen with new logic)
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
      // In non-collab mode: save everything (content + title + description)
      // Hocuspocus onStoreDocument handles content persistence in collab mode
      if (editCount > 0 && !isCollaborative) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [editCount, handleSave, isCollaborative]);

  // --- FIX 4: In collab mode, save title/description changes on a debounce ---
  // Content is handled by Hocuspocus, but title & description are NOT synced via Yjs.
  const prevTitleRef = useRef(title);
  const prevDescriptionRef = useRef(description);
  useEffect(() => {
    if (!isCollaborative) return; // Non-collab mode handled by handleSave above
    if (
      title === prevTitleRef.current &&
      description === prevDescriptionRef.current
    )
      return;

    const timeoutId = setTimeout(async () => {
      try {
        // Save only title/description — pass the existing project.content to avoid overwriting
        await documentService.updateProject(
          project.id,
          title,
          description,
          undefined, // IMPORTANT: Do not send content in collab mode to avoid overwriting real-time state
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

  // --- FIX 2: Show loading until provider is synced (not just connected) ---
  // isSynced becomes true only after onSynced fires, meaning the Yjs doc has
  // arrived from the server. This prevents a blank editor flash.
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
                  onClick={() => setIsExportWorkflowOpen(true)}>
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
                // Skip focus-on-click for read-only viewers
                if (isReadOnly) return;
                // When clicking the empty space around the editor (not the content itself),
                // focus the editor at the end so the user can start typing immediately
                if (editor && !editor.isDestroyed && isViewReady(editor)) {
                  const target = e.target as HTMLElement;
                  // Only handle clicks on the wrapper itself or the EditorContent container,
                  // NOT on actual editor content (ProseMirror handles those)
                  const isProseMirror = target.closest(".ProseMirror");
                  if (!isProseMirror) {
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
              <span>ðŸ›¡ï¸ Reality Check</span>
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

        <VersionHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          projectId={project.id}
          onRestore={(restoredProject) => {
            if (editor) {
              editor.commands.setContent(restoredProject.content);
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
