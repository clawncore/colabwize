import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DocumentEditor } from "./DocumentEditor";
import { PaperSuggestionsPanel } from "../citations/PaperSuggestionsPanel";
import { RephraseSuggestionsPanel } from "../originality/RephraseSuggestionsPanel";
import { AnxietyRealityCheckPanel } from "../originality/AnxietyRealityCheckPanel";
import { DraftComparisonPanel } from "../originality/DraftComparisonPanel";
import { CitationConfidencePanel } from "../citations/CitationConfidencePanel";
import { SourcesLibraryPanel } from "../citations/SourcesLibraryPanel";
import { AIChatPanel } from "../aichat/AIChatPanel";
import TeamChat from "../workspace/chat/page";
import { SourceDetailPanel } from "../citations/SourceDetailPanel";
import { CitationAuditReportPanel } from "../audit/CitationAuditReportPanel";
import { ZoteroLibraryPanel } from "../citations/ZoteroLibraryPanel";
import { MendeleyLibraryPanel } from "../citations/MendeleyLibraryPanel";
import { MendeleyIcon } from "../common/MendeleyIcon";
import { ZoteroIcon } from "../common/ZoteroIcon";
import { Project, documentService } from "../../services/documentService";
// Custom hook usage instead of direct service
import { useSubscriptionStore } from "../../stores/useSubscriptionStore";
import { useAuth } from "../../hooks/useAuth";
import {
  ChevronLeft,
  ArrowLeft,
  Lightbulb,
  Bell,
  HelpCircle,
  Video,
  Microscope,
  PlusSquare,
  ChevronRight,
  FileText,
  BookOpen,
  PenTool,
  History,
  Map,
  Lock,
} from "lucide-react";
import { SearchAlertsPanel } from "./SearchAlertsPanel";
import { AIProbabilityHeatmap } from "../originality/AIProbabilityHeatmap";
import { OutlineBuilder } from "./OutlineBuilder";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { EditorOnboardingTour } from "../onboarding/EditorOnboardingTour";
import { OnboardingService } from "../../services/onboardingService";
import { OriginalityMapSidebar } from "../originality/OriginalityMapSidebar";
import AIResearchAssistant from "./ResearchAssistant";
import AddCitationModal from "../citations/AddCitationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

import { UpgradeModal } from "../../components/subscription/UpgradeModal";
import { CollaborationHistoryPanel } from "./CollaborationHistoryPanel";
import workspaceService, {
  WorkspaceMember,
} from "../../services/workspaceService";
import { useWorkspacePermissions } from "../../hooks/useWorkspacePermissions";
import { useToast } from "../../hooks/use-toast";
import { DocumentList } from "../documents/DocumentList";
import { CitationAuditSidebar } from "../citations/CitationAuditSidebar";
import { ResearchGapsPanel } from "../citations/ResearchGapsPanel";
import { LiteratureMatrix } from "../citations/LiteratureMatrix";
import { CitationGraph } from "../citations/CitationGraph";
import { CitationService } from "../../services/citationService";

// Define panel types
export type RightPanelType =
  | "citations"
  | "rephrase"
  | "reality-check"
  | "draft-comparison"
  | "citation-confidence"
  | "ai-chat"
  | "ai-results"
  | "originality-results"
  | "add-citation"
  | "collaboration-history"
  | "team-chat"
  | "source-detail"
  | null;

const EditorWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditorLoading, setIsEditorLoading] = useState(false);

  // Collapsible state - Start with both sidebars closed
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // Left Panel State
  const [activeLeftPanel, setActiveLeftPanel] = useState<
    | "documents"
    | "audit"
    | "sources"
    | "outline"
    | "visual-map"
    | "research-gaps"
    | "search-alerts"
    | "research-assistant"
    | "zotero"
    | "mendeley"
    | null
  >(null);
  const [leftPanelData, setLeftPanelData] = useState<any>(null);

  // Right panel type state
  const [activePanelType, setActivePanelType] = useState<RightPanelType>(null);
  const [panelData, setPanelData] = useState<any>(null);

  // Resizable widths
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(260); // Slightly tighter default width
  const [rightSidebarWidth, setRightSidebarWidth] = useState(300); // Reduced from 340 for better fit

  // Search Alerts notification state
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const prevUnreadCountRef = useRef(0);

  // Focus Mode state
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Workspace permission — resolves once selectedProject.workspace_id is known
  const { canEdit: canEditWorkspace } = useWorkspacePermissions(
    selectedProject?.workspace_id ?? undefined,
  );

  // Subscription state from global store
  const {
    creditBalance,
    plan: rawPlan,
    fetchSubscription,
    loading: subLoading,
    error: subError,
  } = useSubscriptionStore();

  // Computed user plan name
  const [userPlan, setUserPlan] = useState<string>("Free Plan");
  const isPremium = userPlan === "Premium";
  const isPlus = userPlan === "Plus" || isPremium;
  const { user } = useAuth();

  // Navigation Rail state (independently toggleable)
  const [isNavRailOpen, setIsNavRailOpen] = useState(false);
  const [isNavRailHovered, setIsNavRailHovered] = useState(false);

  const isNavRailExpanded = isNavRailOpen || isNavRailHovered;

  const [selectedAuditReport, setSelectedAuditReport] = useState<any>(null);
  const [lastAuditReport, setLastAuditReport] = useState<any>(null);

  // Source Library selection state for full-page view / full-screen view
  const [selectedLibrarySource, setSelectedLibrarySource] = useState<any>(null);

  // Source Library sub-tab state
  const [activeSourceTab, setActiveSourceTab] = useState<
    "sources" | "collections" | "matrix" | "zotero" | "mendeley"
  >("sources");

  // Editor onboarding tour state
  const [showEditorTour, setShowEditorTour] = useState(false);


  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Source & Research State
  const [matrixMode, setMatrixMode] = useState<"split" | "full">("split");
  const [visualMapMode, setVisualMapMode] = useState<
    "graph" | "heatmap" | "full" | "split"
  >("graph");

  const handleProjectSelect = async (project: Project) => {
    // 1. Set loading state to true immediately to clear content
    setIsEditorLoading(true);

    // Optimistically set selected project, but UI will show spinner
    setSelectedProject(project);

    // 2. Fetch full project content from backend
    try {
      const result = await documentService.getProjectById(project.id);
      if (result.success && result.data) {
        setSelectedProject(result.data);
      }
    } catch (error) {
      console.error("Failed to load full project content:", error);
    } finally {
      setIsEditorLoading(false);
    }
  };

  const handleCreateNew = async () => {
    // const userId = localStorage.getItem("user_id") || "";

    const newProject: Partial<Project> = {
      title: "Untitled Document",
      description: "",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "",
              },
            ],
          },
        ],
      },
      word_count: 0,
    };

    try {
      const result = await documentService.createProject(
        newProject.title!,
        newProject.description!,
        newProject.content!,
      );

      if (result.success && result.data) {
        setSelectedProject(result.data);
        // setProjects((prev) => [result.data!, ...prev]);
      }
    } catch (error) {
      console.error("Failed to create new document:", error);
    }
  };

  const handleProjectUpdate = React.useCallback((updatedProject: Project) => {
    setSelectedProject(updatedProject);
  }, []); // selectedProject was unnecessary here

  const reloadProjectCitations = React.useCallback(async () => {
    if (!selectedProject) return;
    try {
      const result = await documentService.getProjectById(selectedProject.id);
      if (result.success && result.data) {
        // We only want to update the citation data to avoid overwriting the editor's content state
        setSelectedProject((prev) => {
          if (!prev) return result.data!;
          return {
            ...result.data!,
          };
        });
      }
    } catch (error) {
      console.error("Failed to reload project citations:", error);
    }
  }, [selectedProject]); // Added full selectedProject to deps

  const handleStyleSet = async (style: string) => {
    if (!selectedProject) return;

    // Optimistic update
    const updatedProject = { ...selectedProject, citation_style: style };
    setSelectedProject(updatedProject);

    try {
      await documentService.updateProject(
        selectedProject.id,
        selectedProject.title,
        selectedProject.description || "",
        selectedProject.content,
        updatedProject.word_count,
        style,
      );
    } catch (error) {
      console.error("Failed to persist citation style:", error);
      // Revert if needed, but for now we keep optimistic state
    }
  };

  const handleSourceUpdate = async (updatedSource: any) => {
    if (!selectedProject) return;

    const updatedCitations = selectedProject.citations.map((c: any) =>
      (c.id && updatedSource.id && c.id === updatedSource.id) ||
      c.title === updatedSource.title
        ? updatedSource
        : c,
    );

    const updatedProject = { ...selectedProject, citations: updatedCitations };
    setSelectedProject(updatedProject);
    setSelectedLibrarySource(updatedSource);
  };

  const handleBatchSourceUpdate = async (updatedCitations: any[]) => {
    if (!selectedProject) return;

    // Merge updated citations into existing project citations
    const currentCitations = [...selectedProject.citations];
    const newCitations = currentCitations.map((c) => {
      const match = updatedCitations.find((uc) => uc.id === c.id);
      return match ? { ...c, ...match } : c;
    });

    const updatedProject = { ...selectedProject, citations: newCitations };
    setSelectedProject(updatedProject);

    // Persist to backend
    await documentService.updateProject(
      selectedProject.id,
      selectedProject.title,
      selectedProject.description || "",
      selectedProject.content,
      selectedProject.word_count,
      selectedProject.citation_style,
      selectedProject.outline,
    );
  };

  // Function to open right panel with specific type
  const openPanel = (panelType: RightPanelType, data?: any) => {
    setActivePanelType(panelType);
    if (data) setPanelData(data);
    setIsRightSidebarOpen(true);
  };

  // Load project by ID if provided in URL params
  useEffect(() => {
    const loadProjectById = async () => {
      if (id) {
        setIsEditorLoading(true);
        try {
          const result = await documentService.getProjectById(id);
          if (result.success && result.data) {
            // Editor simply loads what backend gives it
            // No template injection logic - content is already set at creation time
            setSelectedProject(result.data);

            // Fetch workspace members if project belongs to a workspace
            if (result.data.workspace_id) {
              setIsMembersLoading(true);
              try {
                const workspace = await workspaceService.getWorkspace(
                  result.data.workspace_id,
                );
                setWorkspaceMembers(workspace.members || []);
              } catch (err) {
                console.error("Failed to fetch workspace members:", err);
              } finally {
                setIsMembersLoading(false);
              }
            } else {
              setWorkspaceMembers([]);
            }
          }
        } catch (error) {
          console.error("Failed to load project by ID:", error);
        } finally {
          setIsEditorLoading(false);
        }
      }
    };

    loadProjectById();
  }, [id]);

  // Sync global store plan to local display state
  useEffect(() => {
    let planName = "Free Plan";
    if (rawPlan) {
      const planId =
        typeof rawPlan === "object" ? (rawPlan as any).id : rawPlan;
      if (planId === "plus") planName = "Plus";
      else if (planId === "premium") planName = "Premium";
      else if (planId === "payg") planName = "Pay As You Go";
    }
    setUserPlan(planName);
  }, [rawPlan]);

  // Trigger subscription fetch if not already loaded or stale
  useEffect(() => {
    if (user && !subLoading && !subError) {
      // Pass true for isAuthSettled
      fetchSubscription(true);
    }
  }, [user, fetchSubscription, subLoading, subError]);

  // Check if we should show the editor tour (first time the user opens the editor)
  useEffect(() => {
    const checkTourStatus = async () => {
      if (!selectedProject) return;

      // Strict Check: First check local, then check server to be sure
      const localCompleted = OnboardingService.getEditorTourStatusLocal();
      if (localCompleted) return; // Don't show if done locally

      try {
        const status = await OnboardingService.getStatus();
        if (status.editorTourCompleted) {
          // Was done on another device, sync local
          OnboardingService.completeEditorTourLocal();
        } else {
          // Not done anywhere, show it
          // 🛡️ Guard: Mark locally immediately to prevent re-trigger on rapid refresh
          OnboardingService.completeEditorTourLocal();

          // Short delay for UI render
          setTimeout(() => setShowEditorTour(true), 1000);
        }
      } catch (e) {
        console.error("Failed to sync tour status", e);
      }
    };
    checkTourStatus();
  }, [selectedProject]);

  const handleEditorTourComplete = () => {
    setShowEditorTour(false);
    OnboardingService.completeEditorTourLocal();
    // Optionally call backend
    OnboardingService.completeEditorTour().catch((err) =>
      console.error("Failed to mark editor tour complete:", err),
    );
  };

  const handleEditorTourSkip = () => {
    setShowEditorTour(false);
    OnboardingService.completeEditorTourLocal();
    // Optionally call backend
    OnboardingService.skipEditorTour().catch((err) =>
      console.error("Failed to mark editor tour skipped:", err),
    );
  };

  // Poll for search alerts
  useEffect(() => {
    if (!user) return;

    const checkAlerts = async () => {
      try {
        const { default: SearchAlertService } =
          await import("../../services/searchAlertService");
        const alerts = await SearchAlertService.getAlerts();
        const totalNew = alerts.reduce(
          (acc, alert) => acc + (alert.new_matches_count || 0),
          0,
        );

        if (totalNew > prevUnreadCountRef.current) {
          // Play notification sound
          const audio = new Audio(
            "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
          );
          audio.volume = 0.5;
          audio.play().catch((e) => console.log("Sound play failed:", e));
        }

        setUnreadAlertCount(totalNew);
        prevUnreadCountRef.current = totalNew;
      } catch (err) {
        // Silent fail for polling
      }
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user]);

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft && containerRef.current) {
        // Calculate the new content panel width by subtracting the rail width
        // Rail is now always visible: 240px (expanded) or 60px (collapsed)
        const railOffset = isNavRailOpen ? 240 : 60;
        const newWidth = e.clientX - railOffset;

        if (newWidth > 200 && newWidth < 600) {
          setLeftSidebarWidth(newWidth);
        }
      }
      if (isResizingRight && containerRef.current) {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 300 && newWidth < 600) {
          setRightSidebarWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    if (isResizingLeft || isResizingRight) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight, isNavRailOpen]);

  // Get panel title based on active type
  const getPanelTitle = () => {
    switch (activePanelType) {
      case "citations":
        return "Sources";
      case "rephrase":
        return "AI Writing Assistant";
      case "reality-check":
        return "Reality Check";
      case "draft-comparison":
        return "Draft Comparison";
      case "citation-confidence":
        return "Citation Confidence";
      case "ai-chat":
        return "AI Copilot";
      case "ai-results":
        return "AI Detection Results";
      case "originality-results":
        return "Originality Report";
      case "add-citation":
        return "Add Citation";
      case "team-chat":
        return "Team Chat";
      default:
        return "Suggestions";
    }
  };

  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(
    [],
  );
  const [isMembersLoading, setIsMembersLoading] = useState(false);

  // Global event listener to allow deep components (like Citation NodeView)
  // to open sidebar panels without direct prop drilling
  useEffect(() => {
    const handleOpenSidebarPanel = (e: Event) => {
      const customEvent = e as CustomEvent<{
        panelType: RightPanelType;
        data?: any;
      }>;
      if (customEvent.detail && customEvent.detail.panelType) {
        openPanel(customEvent.detail.panelType, customEvent.detail.data);
      }
    };

    window.addEventListener("openSidebarPanel", handleOpenSidebarPanel);
    
    const handleReloadCitations = () => {
      reloadProjectCitations();
    };
    window.addEventListener("reloadProjectCitations", handleReloadCitations);

    return () => {
      window.removeEventListener("openSidebarPanel", handleOpenSidebarPanel);
      window.removeEventListener("reloadProjectCitations", handleReloadCitations);
    };
  }, [openPanel, reloadProjectCitations]);

  const handleInsertCitation = React.useCallback(
    async (text: string, trackingInfo?: any) => {
      if (editorInstance) {
        const sourceId = trackingInfo?.sourceId;
        const source = trackingInfo?.fullReferenceEntry;

        // PRE-POPULATE REGISTRY: Ensure the citation is in the cache before the
        // CitationNode tries to render it. Without this, the node renders as (Unknown, ????)
        // because the async registry init hasn't returned yet.
        if (sourceId && source) {
          const { CitationRegistryService } =
            await import("../../services/CitationRegistryService");
          CitationRegistryService.registerTempCitation(
            source.raw_reference_text || source.title || text,
            {
              id: sourceId,
              title: source.title,
              authors: source.authors,
              year: source.year,
              url: source.url,
              doi: source.doi,
            },
          );
        }

        // 1. Insert in-text citation at cursor
        if (sourceId) {
          let citationUrl = undefined;
          if (source) {
            citationUrl =
              source.url ||
              (source.doi ? `https://doi.org/${source.doi}` : undefined);
          }
          editorInstance.commands.insertCitation({
            citationId: sourceId,
            text: text,
            url: citationUrl,
          });
        } else {
          editorInstance.chain().focus().insertContent(text).run();
        }

        // 2. Append reference entry if provided
        if (trackingInfo && trackingInfo.fullReferenceEntry) {
          const source = trackingInfo.fullReferenceEntry;
          const style = trackingInfo.style
            ? trackingInfo.style.toLowerCase()
            : "apa";

          let refText = text;

          // Always try to generate the correctly formatted citation string on the fly,
          // to ensure bibliography formatting is correct even for newly added/unprocessed sources.
          try {
            const formatStyle =
              style === "mla"
                ? "MLA"
                : style === "chicago"
                  ? "Chicago"
                  : style === "ieee"
                    ? "IEEE"
                    : "APA";

            const generatedRef = CitationService.formatCitation(
              source,
              formatStyle as any,
            );
            if (generatedRef) {
              refText = generatedRef;
            }
          } catch (err) {
            console.warn(
              "Failed to dynamically format citation, using fallback",
              err,
            );
            if (
              source.formatted_citations &&
              source.formatted_citations[style]
            ) {
              refText =
                source.formatted_citations[style].reference ||
                source.formatted_citations[style];
            } else if (source.raw_reference_text) {
              refText = source.raw_reference_text;
            } else if (source.title) {
              refText = source.title;
            }
          }

          const doc = editorInstance.state.doc;
          let isAlreadyListed = false;

          // Use robust citationId check to see if this source is already in the bibliography
          doc.descendants((node: any) => {
            if (
              node.type.name === "bibliographyEntry" &&
              node.attrs.citationId === sourceId
            ) {
              isAlreadyListed = true;
              return false;
            }
          });

          // Collab-aware re-check: wait briefly for Yjs sync then verify again
          // to avoid duplicate bibliography entries when two collaborators
          // insert the same citation at nearly the same time.
          if (!isAlreadyListed && selectedProject?.workspace_id) {
            await new Promise((r) => setTimeout(r, 300));
            // Re-scan the freshest document state after Yjs may have synced
            editorInstance.state.doc.descendants((node: any) => {
              if (
                node.type.name === "bibliographyEntry" &&
                node.attrs.citationId === sourceId
              ) {
                isAlreadyListed = true;
                return false;
              }
            });
          }

          if (!isAlreadyListed) {
            // Save current cursor position
            const currentPos = editorInstance.state.selection.anchor;

            // Move to end WITHOUT focusing (to avoid scroll jumping)
            const endPos = doc.content.size;
            let chain = editorInstance.chain().setTextSelection(endPos);

            const widthRef = editorInstance.getText();
            // Check if References header exists (heuristic)
            if (
              !widthRef.includes("References") &&
              !widthRef.includes("Bibliography") &&
              !widthRef.includes("Works Cited")
            ) {
              chain = chain.insertContent([
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "References" }],
                },
              ]);
            }

            // Build bibliography entry content with hyperlink if URL/DOI exists
            const content: any[] = [{ type: "text", text: refText }];
            const url =
              source.url ||
              (source.doi ? `https://doi.org/${source.doi}` : null);
            if (url) {
              content.push({ type: "text", text: " " });
              content.push({
                type: "text",
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: url,
                      target: "_blank",
                      class: "bibliography-url-link",
                    },
                  },
                ],
                text: url,
              });
            }

            // Insert directly as a bibliographyEntry node to prevent double-normalization flash
            chain
              .insertContent({
                type: "bibliographyEntry",
                attrs: {
                  citationId: sourceId,
                  url: url,
                  doi: source.doi,
                  refText: refText,
                },
                content: content,
              })
              .run();

            // Restore cursor position to where the citation was inserted
            // account for the citation node having size 1
            editorInstance.commands.setTextSelection(currentPos + 1);
          }
        }

        if (trackingInfo) {
          console.groupCollapsed("[Authorship] Citation Event");
          console.log("Metadata:", trackingInfo);
          console.log(
            "This event contributes to the Authorship Certificate verification.",
          );
          console.groupEnd();
          // Future: dispatch to Authorship Certificate service
        }

        // 3. Trigger immediate save to ensure persistence (Only in non-collab mode)
        // In collab mode, Hocuspocus handles the persistence of the content change
        if (selectedProject && !selectedProject.workspace_id) {
          setTimeout(async () => {
            const content = editorInstance.getJSON();
            const words = editorInstance.storage.characterCount.words();
            await documentService.updateProject(
              selectedProject.id,
              selectedProject.title,
              selectedProject.description || "",
              content,
              words,
              selectedProject.citation_style,
            );
            console.log("Immediate save complete after citation insertion");
          }, 500);
        }
      }
    },
    [editorInstance, selectedProject],
  );

  const handleSyncOutlineToEditor = (outline: any[]) => {
    if (!editorInstance) return;

    let chain = editorInstance.chain().focus();

    outline.forEach((item) => {
      chain = chain.insertContent([
        {
          type: "heading",
          attrs: { level: item.level },
          content: [{ type: "text", text: item.title }],
        },
        {
          type: "paragraph",
        },
      ]);
    });

    chain.run();
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-full flex overflow-hidden bg-white">
      {/* Left Sidebar - Documents List or Audit Panel - Hidden in Focus Mode */}
      {!isFocusMode && (
        <div
          className={`flex-shrink-0 bg-white border-r border-gray-100 flex flex-row z-30 shadow-sm relative overflow-hidden h-full`}>
          {/* Vertical Navigation Rail (The "Display" panel) */}
          <motion.div
            onMouseEnter={() => setIsNavRailHovered(true)}
            onMouseLeave={() => setIsNavRailHovered(false)}
            initial={false}
            animate={{ width: isNavRailExpanded ? 240 : 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full flex-shrink-0 border-r border-gray-100 flex flex-col bg-[#F9FAFB]/90 overflow-hidden absolute lg:relative z-40 shadow-xl lg:shadow-none">
            {/* Header */}
            <div
              className={`p-4 flex items-center ${isNavRailExpanded ? "justify-between" : "justify-center"} border-b border-gray-100 mb-2 h-[60px]`}>
              {isNavRailExpanded ? (
                <>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(-1)}
                      className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                      title="Back to Dashboard">
                      <ArrowLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap overflow-hidden transition-opacity duration-300">
                      Display
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowEditorTour(true)}
                      className="p-1.5 hover:bg-indigo-100 rounded-md transition-colors group"
                      title="Show Workspace Tour">
                      <Lightbulb className="w-4 h-4 text-gray-400 group-hover:text-amber-500" />
                    </button>
                    <button
                      onClick={() => setIsNavRailOpen(!isNavRailOpen)}
                      title={isNavRailOpen ? "Unpin Sidebar" : "Pin Sidebar"}
                      className={`cursor-pointer ${isNavRailOpen ? "bg-gray-200" : ""} hover:bg-gray-200 p-1 rounded-md transition-colors`}>
                      {isNavRailOpen ? (
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      ) : (
                        <svg
                          className="w-4 h-4 text-gray-400 hover:text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setIsNavRailOpen(true)}
                  className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                  title="Expand Sidebar">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 custom-scrollbar">
              <button
                data-tour="documents-panel"
                onClick={() => {
                  setActiveLeftPanel("documents");
                  setIsLeftSidebarOpen(true);
                }}
                className={`w-full flex items-center ${isNavRailExpanded ? "gap-3 px-3 justify-start" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeLeftPanel === "documents"
                    ? "bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                }`}
                title={!isNavRailExpanded ? "My Documents" : ""}>
                <FileText
                  className={`w-4 h-4 flex-shrink-0 ${activeLeftPanel === "documents" ? "text-[#6366F1]" : "text-gray-400"}`}
                />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isNavRailExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                  My Documents
                </span>
              </button>

              <button
                data-tour="source-library"
                onClick={() => {
                  setActiveLeftPanel("sources");
                  setActiveSourceTab("sources");
                  setIsLeftSidebarOpen(true);
                }}
                className={`w-full flex items-center ${isNavRailExpanded ? "gap-3 px-3 justify-start" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeLeftPanel === "sources"
                    ? "bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                }`}
                title={!isNavRailExpanded ? "Source Library" : ""}>
                <BookOpen
                  className={`w-4 h-4 flex-shrink-0 ${activeLeftPanel === "sources" ? "text-[#6366F1]" : "text-gray-400"}`}
                />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isNavRailExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                  Source Library
                </span>
              </button>

              {/* Sub-tabs for Source Library */}
              {activeLeftPanel === "sources" && isNavRailExpanded && (
                <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 pl-3 mb-4 transition-all overflow-hidden whitespace-nowrap">
                  <button
                    onClick={() => setActiveSourceTab("sources")}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                      activeSourceTab === "sources"
                        ? "text-[#6366F1] bg-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}>
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeSourceTab === "sources" ? "bg-[#6366F1]" : "bg-gray-300"}`}
                    />
                    Sources
                  </button>
                  <button
                    onClick={() => setActiveSourceTab("collections")}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                      activeSourceTab === "collections"
                        ? "text-[#6366F1] bg-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}>
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeSourceTab === "collections" ? "bg-[#6366F1]" : "bg-gray-300"}`}
                    />
                    Collections
                  </button>
                  <button
                    onClick={() => setActiveSourceTab("matrix")}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                      activeSourceTab === "matrix"
                        ? "text-[#6366F1] bg-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}>
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${activeSourceTab === "matrix" ? "bg-[#6366F1]" : "bg-gray-300"}`}
                    />
                    Matrix
                  </button>
                  <button
                    onClick={() => setActiveSourceTab("zotero")}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                      activeSourceTab === "zotero"
                        ? "text-[#6366F1] bg-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}>
                    <ZoteroIcon className={`w-3 h-3 flex-shrink-0 ${activeSourceTab === "zotero" ? "text-[#6366F1]" : "text-gray-400"}`} />
                    Zotero
                    {!user?.zotero_user_id && (
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveSourceTab("mendeley")}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${
                      activeSourceTab === "mendeley"
                        ? "text-[#6366F1] bg-white shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}>
                    <MendeleyIcon className={`w-3 h-3 flex-shrink-0 ${activeSourceTab === "mendeley" ? "text-[#6366F1]" : "text-gray-400"}`} />
                    Mendeley
                    {!user?.mendeley_access_token && (
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    )}
                  </button>
                </div>
              )}


              <button
                data-tour="outline-builder"
                onClick={() => {
                  setActiveLeftPanel("outline");
                  setIsLeftSidebarOpen(true);
                }}
                className={`w-full flex items-center ${isNavRailExpanded ? "gap-3 px-3 justify-start" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeLeftPanel === "outline"
                    ? "bg-[#F59E0B]/10 text-[#D97706] border border-[#F59E0B]/20"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                }`}
                title={!isNavRailExpanded ? "Outline" : ""}>
                <PenTool
                  className={`w-4 h-4 flex-shrink-0 ${activeLeftPanel === "outline" ? "text-[#D97706]" : "text-gray-400"}`}
                />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isNavRailExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                  Outline
                </span>
              </button>

              <button
                data-tour="add-citation"
                onClick={() => {
                  setActivePanelType("add-citation");
                  setIsRightSidebarOpen(true);
                }}
                className={`w-full flex items-center ${isNavRailExpanded ? "gap-3 px-3 justify-start" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activePanelType === "add-citation"
                    ? "bg-blue-100 text-blue-600 border border-blue-200"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                }`}
                title={!isNavRailExpanded ? "Add Citation" : ""}>
                <PlusSquare
                  className={`w-4 h-4 flex-shrink-0 ${activePanelType === "add-citation" ? "text-blue-600" : "text-gray-400"}`}
                />
                <span
                  className={`whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isNavRailExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                  Add Citation
                </span>
              </button>

              {selectedProject?.workspace_id && (
                <button
                  data-tour="collaboration-history"
                  onClick={() => {
                    if (!isPlus) {
                      setShowUpgradeModal(true);
                      return;
                    }
                    setActivePanelType("collaboration-history");
                    setIsRightSidebarOpen(true);
                  }}
                  className={`w-full flex items-center ${isNavRailExpanded ? "gap-3 px-3 justify-start" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activePanelType === "collaboration-history"
                      ? "bg-blue-100 text-blue-600 border border-blue-200"
                      : !isPlus
                        ? "opacity-60 text-gray-400 hover:bg-gray-50"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                  }`}
                  title={
                    !isPlus
                      ? "Available on Plus Plan"
                      : !isNavRailExpanded
                        ? "Edit History"
                        : ""
                  }>
                  <div className="relative">
                    <History
                      className={`w-4 h-4 flex-shrink-0 ${activePanelType === "collaboration-history" ? "text-blue-600" : "text-gray-400"}`}
                    />
                    {!isPlus && (
                      <Lock className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 text-gray-400" />
                    )}
                  </div>
                  <div
                    className={`flex items-center justify-between w-full whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isNavRailExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                    <span>Collaboration Log</span>
                    {!isPlus && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1 rounded flex-shrink-0 font-bold">
                        PLUS
                      </span>
                    )}
                  </div>
                </button>
              )}

              <button
                data-tour="visual-map"
                onClick={() => {
                  if (userPlan === "Free Plan") {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setActiveLeftPanel("visual-map");
                  setIsLeftSidebarOpen(true);
                }}
                className={`w-full flex items-center ${isNavRailExpanded ? "gap-3 px-3 justify-start" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeLeftPanel === "visual-map"
                    ? "bg-amber-100 text-amber-600 border border-amber-200"
                    : userPlan === "Free Plan"
                      ? "opacity-60 text-gray-400 hover:bg-gray-50"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                }`}
                title={
                  userPlan === "Free Plan"
                    ? "Available on Plus Plan"
                    : !isNavRailExpanded
                      ? "Visual Map"
                      : ""
                }>
                <div className="relative">
                  <Map
                    className={`w-4 h-4 flex-shrink-0 ${activeLeftPanel === "visual-map" ? "text-amber-600" : "text-gray-400"}`}
                  />
                  {userPlan === "Free Plan" && (
                    <Lock className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 text-gray-400" />
                  )}
                </div>
                <div
                  className={`flex items-center justify-between w-full whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isNavRailExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                  <span>Visual Map</span>
                  {userPlan === "Free Plan" && (
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-1 rounded flex-shrink-0 font-bold ml-1">
                      PLUS
                    </span>
                  )}
                </div>
              </button>

              <button
                data-tour="research-assistant"
                onClick={() => {
                  if (userPlan === "Free Plan") {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setActiveLeftPanel("research-assistant");
                  setIsLeftSidebarOpen(true);
                }}
                className={`w-full flex items-center ${isNavRailExpanded ? "gap-3 px-3 justify-start" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeLeftPanel === "research-assistant"
                    ? "bg-purple-100 text-purple-600 border border-purple-200"
                    : userPlan === "Free Plan"
                      ? "opacity-60 text-gray-400 hover:bg-gray-50"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                }`}
                title={
                  userPlan === "Free Plan"
                    ? "Available on Plus Plan"
                    : !isNavRailExpanded
                      ? "Research Assistant"
                      : ""
                }>
                <div className="relative">
                  <Microscope
                    className={`w-4 h-4 flex-shrink-0 ${activeLeftPanel === "research-assistant" ? "text-purple-600" : "text-gray-400"}`}
                  />
                  {userPlan === "Free Plan" && (
                    <Lock className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 text-gray-400" />
                  )}
                </div>
                <div
                  className={`flex items-center justify-between w-full whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isNavRailExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                  <span>Research Assistant</span>
                  {userPlan === "Free Plan" && (
                    <span className="text-[10px] bg-purple-50 text-purple-600 px-1 rounded flex-shrink-0 font-bold ml-1">
                      PLUS
                    </span>
                  )}
                </div>
              </button>

              <button
                data-tour="research-gaps"
                onClick={() => {
                  if (!isPremium) {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setActiveLeftPanel("research-gaps");
                  setIsLeftSidebarOpen(true);
                }}
                className={`w-full flex items-center ${isNavRailExpanded ? "gap-3 px-3 justify-start" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeLeftPanel === "research-gaps"
                    ? "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20"
                    : !isPremium
                      ? "opacity-60 text-gray-400 hover:bg-gray-50"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                }`}
                title={
                  !isPremium
                    ? "Available on Premium Plan"
                    : !isNavRailExpanded
                      ? "Research Gaps"
                      : ""
                }>
                <div className="relative">
                  <Lightbulb
                    className={`w-4 h-4 flex-shrink-0 ${activeLeftPanel === "research-gaps" ? "text-[#f59e0b]" : "text-gray-400"}`}
                  />
                  {!isPremium && (
                    <Lock className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 text-gray-400 line-clamp-1" />
                  )}
                </div>
                <div
                  className={`flex items-center justify-between w-full whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isNavRailExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                  <span>Research Gaps</span>
                  {!isPremium && (
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-1 rounded flex-shrink-0 font-bold ml-1">
                      PREMIUM
                    </span>
                  )}
                </div>
              </button>

              <button
                data-tour="search-alerts"
                onClick={() => {
                  if (!isPremium) {
                    setShowUpgradeModal(true);
                    return;
                  }
                  setActiveLeftPanel("search-alerts");
                  setIsLeftSidebarOpen(true);
                }}
                className={`w-full flex items-center ${isNavRailExpanded ? "gap-3 px-3 justify-start" : "justify-center px-0"} py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeLeftPanel === "search-alerts"
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    : !isPremium
                      ? "opacity-60 text-gray-400 hover:bg-gray-50"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent"
                }`}
                title={
                  !isPremium
                    ? "Available on Premium Plan"
                    : !isNavRailExpanded
                      ? "Search Alerts"
                      : ""
                }>
                <div className="relative">
                  <Bell
                    className={`w-4 h-4 flex-shrink-0 ${activeLeftPanel === "search-alerts" ? "text-indigo-600" : "text-gray-400"}`}
                  />
                  {!isPremium && (
                    <Lock className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 text-gray-400" />
                  )}
                  {unreadAlertCount > 0 && isPremium && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border-2 border-white">
                      {unreadAlertCount > 9 ? "9+" : unreadAlertCount}
                    </span>
                  )}
                </div>
                <div
                  className={`flex items-center justify-between w-full whitespace-nowrap overflow-hidden transition-opacity duration-300 ${isNavRailExpanded ? "opacity-100" : "opacity-0 w-0"}`}>
                  <span>Search Alerts</span>
                  {!isPremium && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded flex-shrink-0 font-bold ml-1 uppercase">
                      Premium
                    </span>
                  )}
                </div>
              </button>
            </div>
          </motion.div>

          {/* Sidebar Content Area */}
          <AnimatePresence mode="wait">
            {isLeftSidebarOpen &&
              activeLeftPanel &&
              activeLeftPanel !== "visual-map" && (
                <motion.div
                  key={activeLeftPanel}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: leftSidebarWidth }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex flex-col min-w-0 bg-white relative border-r border-gray-100 overflow-hidden h-full">
                  {activeLeftPanel === "documents" && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <DocumentList
                        onProjectSelect={handleProjectSelect}
                        onCreateNew={handleCreateNew}
                        selectedProjectId={selectedProject?.id}
                        displayMode="list"
                        showActions={false}
                        hideHeader={true}
                      />
                    </div>
                  )}

                  {activeLeftPanel === "sources" && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <SourcesLibraryPanel
                        citations={selectedProject?.citations || []}
                        onInsertCitation={handleInsertCitation}
                        onFindMore={() => openPanel("citations")}
                        projectId={selectedProject?.id}
                        citationStyle={selectedProject?.citation_style}
                        onStyleSet={handleStyleSet}
                        activeTab={activeSourceTab}
                        onSourceSelect={(source) => openPanel("source-detail", source)}
                        selectedLibrarySource={selectedLibrarySource}
                        viewMode={matrixMode}
                        onToggleViewMode={() =>
                          setMatrixMode(
                            matrixMode === "full" ? "split" : "full",
                          )
                        }
                        onUpdateCitations={handleBatchSourceUpdate}
                        userPlan={userPlan}
                      />
                    </div>
                  )}

                  {activeLeftPanel === "audit" && (
                    <CitationAuditSidebar
                      projectId={selectedProject?.id || ""}
                      editor={editorInstance}
                      onClose={() => setActiveLeftPanel("documents")}
                      onViewFullReport={(report) =>
                        setSelectedAuditReport(report)
                      }
                      onAuditComplete={(report) => setLastAuditReport(report)}
                      onFindPapers={(keywords) => {
                        openPanel("citations", { contextKeywords: keywords });
                      }}
                      initialResults={leftPanelData}
                      citationStyle={selectedProject?.citation_style}
                      citationLibrary={selectedProject?.citations}
                      onUpgrade={() => setShowUpgradeModal(true)}
                    />
                  )}

                  {activeLeftPanel === "research-gaps" && selectedProject && (
                    <div className="flex-1 overflow-hidden flex flex-col bg-white">
                      <ResearchGapsPanel
                        projectId={selectedProject.id}
                        onSearchGap={(keywords) => {
                          openPanel("citations", {
                            contextKeywords: keywords,
                          });
                        }}
                      />
                    </div>
                  )}

                  {activeLeftPanel === "outline" && selectedProject && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <OutlineBuilder
                        project={selectedProject}
                        onUpdate={async (outline) => {
                          const updatedProject = {
                            ...selectedProject,
                            outline,
                          };
                          handleProjectUpdate(updatedProject);
                          try {
                            await documentService.updateProject(
                              updatedProject.id,
                              updatedProject.title,
                              updatedProject.description || "",
                              updatedProject.content,
                              updatedProject.word_count,
                              updatedProject.citation_style,
                              outline,
                            );
                          } catch (err) {
                            console.error("Failed to auto-save outline:", err);
                          }
                        }}
                        onSyncToEditor={handleSyncOutlineToEditor}
                      />
                    </div>
                  )}

                  {activeLeftPanel === "search-alerts" && (
                    <div className="flex-1 overflow-hidden flex flex-col bg-white">
                      <SearchAlertsPanel projectId={selectedProject?.id} />
                    </div>
                  )}

                  {activeLeftPanel === "research-assistant" && (
                    <div className="flex-1 overflow-hidden flex flex-col bg-white">
                      <AIResearchAssistant
                        isOpen={true}
                        isPanel={true}
                        onClose={() => setIsLeftSidebarOpen(false)}
                        projectId={selectedProject?.id}
                        onInsertContent={(content) => {
                          if (editorInstance) {
                            editorInstance
                              .chain()
                              .focus()
                              .insertContent(content)
                              .run();
                          }
                        }}
                        onCitationAdded={() => {
                          reloadProjectCitations();
                        }}
                      />
                    </div>
                  )}


                  {/* Subtle shadow overlay to give depth to the opening panel */}
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
                </motion.div>
              )}

            {activeLeftPanel === "visual-map" &&
              isLeftSidebarOpen &&
              selectedProject && (
                <motion.div
                  key="visual-map"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: leftSidebarWidth }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex overflow-hidden flex-col bg-white">
                  {visualMapMode === "full" ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 bg-gray-50 h-[calc(100vh-60px)]">
                      <Map className="w-12 h-12 mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Visual Map is Full Screen
                      </h3>
                      <p className="text-sm">
                        Close the full screen view to interact with the map
                        here.
                      </p>
                      <button
                        onClick={() => setVisualMapMode("split")}
                        className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Exit Full Screen
                      </button>
                    </div>
                  ) : (
                    <CitationGraph
                      projectId={selectedProject.id}
                      project={selectedProject}
                      onTopicSelect={(topic) => {
                        openPanel("citations", { contextKeywords: [topic] });
                      }}
                      onAskAI={(topic) => {
                        const prompt = `Discuss what these sources say about "${topic}", in the larger context of "${selectedProject.title}". (Note: Provide a direct response only, without conversational filler or introductory text.)`;
                        openPanel("ai-chat", { initialInput: prompt });
                      }}
                      viewMode="split"
                      onToggleViewMode={() => setVisualMapMode("full")}
                      width={leftSidebarWidth}
                      height={window.innerHeight - 60}
                    />
                  )}
                </motion.div>
              )}
          </AnimatePresence>
        </div>
      )}
      {/* Left Resize Handle */}
      <div
        onMouseDown={() => setIsResizingLeft(true)}
        className="w-1 h-full bg-gray-200 hover:bg-purple-400 cursor-col-resize flex-shrink-0 transition-colors"
      />

      {/* Toggle Left Sidebar Button - Hidden in Focus Mode */}
      {!isFocusMode && (
        <motion.button
          layout
          onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
          className={`absolute top-4 z-40 p-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors duration-300`}
          animate={{
            left: `${(isNavRailExpanded ? 240 : 60) + (isLeftSidebarOpen ? leftSidebarWidth : 0) - 16}px`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          title={
            isLeftSidebarOpen ? "Hide Content Panel" : "Show Content Panel"
          }>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            {isLeftSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            )}
          </svg>
        </motion.button>
      )}

      {/* Center Panel */}
      <div className="flex-1 h-full overflow-hidden min-w-0 relative">
        {/* PERSISTENT EDITOR LAYER */}
        <motion.div
          animate={{
            opacity:
              selectedAuditReport ||
              selectedLibrarySource ||
              (activeLeftPanel === "sources" &&
                activeSourceTab === "matrix" &&
                matrixMode === "full") ||
              (activeLeftPanel === "visual-map" && visualMapMode === "full") ||
              isEditorLoading
                ? 0
                : 1,
            scale:
              selectedAuditReport ||
              selectedLibrarySource ||
              (activeLeftPanel === "sources" &&
                activeSourceTab === "matrix" &&
                matrixMode === "full") ||
              (activeLeftPanel === "visual-map" && visualMapMode === "full") ||
              isEditorLoading
                ? 0.98
                : 1,
            display:
              selectedAuditReport ||
              selectedLibrarySource ||
              (activeLeftPanel === "sources" &&
                activeSourceTab === "matrix" &&
                matrixMode === "full") ||
              (activeLeftPanel === "visual-map" && visualMapMode === "full") ||
              isEditorLoading
                ? "none"
                : "block",
          }}
          transition={{ duration: 0.3 }}
          className="h-full w-full">
          {selectedProject && (
            <DocumentEditor
              key={selectedProject.id}
              project={selectedProject}
              lastAuditReport={lastAuditReport}
              onProjectUpdate={handleProjectUpdate}
              onOpenPanel={openPanel}
              onOpenLeftPanel={(panel, data) => {
                setLeftPanelData(data);
                setActiveLeftPanel(panel);
                if (!isLeftSidebarOpen) setIsLeftSidebarOpen(true);
              }}
              onEditorReady={setEditorInstance}
              isFocusMode={isFocusMode}
              onToggleFocusMode={() => setIsFocusMode(!isFocusMode)}
              isCollaborative={!!selectedProject.workspace_id}
              isReadOnly={!!selectedProject.workspace_id && !canEditWorkspace}
            />
          )}
        </motion.div>

        {/* LOADING OVERLAY */}
        {isEditorLoading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading Document...</p>
            <p className="text-gray-400 text-sm mt-2">
              This may take up to a minute, please wait...
            </p>
          </div>
        )}

        {/* AUDIT REPORT OVERLAY */}
        <AnimatePresence>
          {selectedAuditReport && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute inset-0 z-40 bg-white">
              <CitationAuditReportPanel
                report={selectedAuditReport}
                onBack={() => setSelectedAuditReport(null)}
                onNavigateToIssue={(location) => {
                  setSelectedAuditReport(null);
                  setTimeout(() => {
                    if (editorInstance) {
                      editorInstance.commands.focus();
                      editorInstance.commands.clearAllHighlights?.();

                      // Highlight with Orange for navigation jump
                      editorInstance.commands.highlightRange?.(
                        location.startPos,
                        location.endPos,
                        {
                          color: "rgba(251, 146, 60, 0.4)",
                          message: "Issue Location",
                        },
                      );
                      editorInstance.commands.scrollIntoView();
                    }
                  }, 50);
                }}
                onExecuteFix={(issue) => {
                  if (editorInstance) {
                    if (issue.action === "REMOVE" && issue.location) {
                      editorInstance.commands.focus();
                      editorInstance.commands.deleteRange({
                        from: issue.location.startPos,
                        to: issue.location.endPos,
                      });
                      toast({
                        title: "Citation Removed",
                        description: `The redundant or broken citation has been removed from the document.`,
                      });
                    } else if (issue.action === "RESOLVE") {
                      toast({
                        title: "Source Linked",
                        description: `"${issue.selectedSource?.title}" has been successfully added.`,
                      });
                    } else if (issue.action === "SEARCH") {
                      let query =
                        issue.citationText ||
                        issue.metadata?.foundPaper?.title ||
                        issue.metadata?.extractedTitle ||
                        issue.message
                          .split("match)")[1]
                          ?.replace(/[".]/g, "")
                          .replace("Closest paper found:", "")
                          .trim() ||
                        issue.message.substring(0, 50);

                      // Final cleanup of the query
                      query = query.replace(/^[:\s-]+/, "").trim();

                      openPanel("citations", {
                        contextKeywords: [query],
                        autoSearch: true,
                      });
                      toast({
                        title: "Researching Source",
                        description: `Searching academic databases for matches...`,
                      });
                    }
                    setSelectedAuditReport(null);
                  } else {
                    toast({
                      title: "Fix Unavailable",
                      description:
                        "This issue cannot be automatically fixed yet.",
                      variant: "destructive",
                    });
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOURCE DETAIL OVERLAY REMOVED - NOW IN RIGHT SIDEBAR */}

        {/* LITERATURE MATRIX OVERLAY */}
        <AnimatePresence>
          {activeLeftPanel === "sources" &&
            activeSourceTab === "matrix" &&
            matrixMode === "full" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 z-40 bg-white">
                <LiteratureMatrix
                  sources={selectedProject?.citations || []}
                  projectId={selectedProject?.id}
                  onUpdateCitations={handleBatchSourceUpdate}
                  userPlan={userPlan}
                  viewMode={matrixMode}
                  onToggleViewMode={() => setMatrixMode("split")}
                />
              </motion.div>
            )}
        </AnimatePresence>

        {/* VISUAL MAP OVERLAY */}
        <AnimatePresence>
          {activeLeftPanel === "visual-map" &&
            selectedProject &&
            visualMapMode === "full" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 bg-white">
                <CitationGraph
                  projectId={selectedProject.id}
                  project={selectedProject}
                  onTopicSelect={(topic) => {
                    openPanel("citations", { contextKeywords: [topic] });
                  }}
                  onAskAI={(topic) => {
                    const prompt = `Discuss what these sources say about "${topic}", in the larger context of "${selectedProject.title}".`;
                    const hiddenInstruction =
                      "(Note: Provide a direct response only, without conversational filler or introductory text.)";
                    openPanel("ai-chat", {
                      initialInput: prompt,
                      initialHiddenInstruction: hiddenInstruction,
                    });
                  }}
                  viewMode="full"
                  onToggleViewMode={() => setVisualMapMode("split")}
                  onBack={() => setVisualMapMode("split")}
                  width={
                    typeof window !== "undefined" ? window.innerWidth : 1920
                  }
                  height={
                    typeof window !== "undefined" ? window.innerHeight : 1080
                  }
                />
              </motion.div>
            )}
        </AnimatePresence>

        {/* EMPTY STATE */}
        {!selectedProject && !isEditorLoading && (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center px-8 max-w-md">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Document Selected
              </h2>
              <p className="text-gray-500 mb-6">
                Select a document from the sidebar or upload a new one to start
                scanning.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Right Sidebar Button - Hidden in Focus Mode. ALLOWED in All display modes. */}
      {!isFocusMode && isRightSidebarOpen && (
        <motion.button
          layout
          onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
          className={`absolute top-4 z-[71] p-2 bg-white border border-gray-300 rounded-md shadow-md hover:bg-gray-50 transition-colors`}
          animate={{
            right: isRightSidebarOpen
              ? `${(activePanelType === "team-chat" ? 400 : rightSidebarWidth) + 8}px`
              : "16px",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          title={
            isRightSidebarOpen
              ? `Hide ${getPanelTitle()}`
              : `Show ${getPanelTitle()}`
          }>
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            {isRightSidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            )}
          </svg>
        </motion.button>
      )}
      {/* Right Sidebar - Feature-Specific Panels - Hidden in Focus Mode */}
      <AnimatePresence>
        {!isFocusMode && isRightSidebarOpen && activePanelType && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: activePanelType === "team-chat" ? 400 : rightSidebarWidth,
              opacity: 1,
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-row relative z-[72] h-full shadow-xl">
            <div
              onMouseDown={() => setIsResizingRight(true)}
              className="w-1 h-full bg-gray-200 hover:bg-purple-400 cursor-col-resize flex-shrink-0 transition-colors"
            />
            <div className="bg-white border-l border-gray-200 flex flex-col flex-1 relative min-w-0">
              {/* Panel Content */}
              <div className="flex-1 overflow-hidden relative min-w-0">
                {/* Universal Close Button for Panels that don't have their own */}
                <button
                  onClick={() => setIsRightSidebarOpen(false)}
                  className="absolute top-2 right-2 z-50 p-1.5 bg-white/80 backdrop-blur-md border border-gray-200 hover:bg-gray-100 rounded-lg transition-all text-gray-500 hover:text-gray-900 shadow-sm"
                  title="Close Panel">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                {activePanelType === "citations" && (
                  <PaperSuggestionsPanel
                    projectId={selectedProject?.id || ""}
                    onInsertCitation={handleInsertCitation}
                    contextKeywords={panelData?.contextKeywords}
                    onClose={() => setIsRightSidebarOpen(false)}
                  />
                )}
                {activePanelType === "rephrase" && (
                  <RephraseSuggestionsPanel
                    projectId={selectedProject?.id}
                    panelData={panelData}
                    onClose={() => setIsRightSidebarOpen(false)}
                  />
                )}

                {activePanelType === "reality-check" && (
                  <AnxietyRealityCheckPanel stats={panelData} />
                )}
                {activePanelType === "draft-comparison" && panelData && (
                  <DraftComparisonPanel
                    result={panelData}
                    onClose={() => setIsRightSidebarOpen(false)}
                  />
                )}
                {activePanelType === "citation-confidence" &&
                  selectedProject && (
                    <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                      <CitationConfidencePanel projectId={selectedProject.id} />
                    </div>
                  )}
                {activePanelType === "ai-chat" && selectedProject && (
                  <AIChatPanel
                    documentContent={JSON.stringify(selectedProject.content)}
                    selectedText={panelData?.selectedText}
                    projectId={selectedProject.id}
                    projectTitle={selectedProject.title}
                    projectDescription={selectedProject.description}
                    originalityResults={panelData?.originalityResults}
                    citationSuggestions={panelData?.citationSuggestions}
                    initialInput={panelData?.initialInput}
                    initialHiddenInstruction={
                      panelData?.initialHiddenInstruction
                    }
                    projectSources={selectedProject.citations}
                    onClose={() => setIsRightSidebarOpen(false)}
                  />
                )}
                {activePanelType === "ai-results" && panelData && (
                  <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                    <AIProbabilityHeatmap
                      content={editorInstance?.getText() || ""}
                      results={panelData.sentences}
                    />
                  </div>
                )}
                {activePanelType === "originality-results" && panelData && (
                  <div className="h-full overflow-y-auto custom-scrollbar bg-gray-50">
                    <OriginalityMapSidebar
                      results={panelData}
                      documentContent={editorInstance?.getText() || ""}
                      onAskAI={(prompt, hiddenCtx) => {
                        openPanel("ai-chat", {
                          initialInput: prompt,
                          initialHiddenInstruction: hiddenCtx,
                        });
                      }}
                    />
                  </div>
                )}
                {activePanelType === "add-citation" && (
                  <AddCitationModal
                    isOpen={true}
                    isPanel={true}
                    onClose={() => setIsRightSidebarOpen(false)}
                    projectId={selectedProject?.id}
                    citations={selectedProject?.citations || []}
                    onInsertCitation={handleInsertCitation}
                    onCitationAdded={() => {
                      reloadProjectCitations();
                    }}
                  />
                )}
                {activePanelType === "source-detail" && panelData && (
                  <SourceDetailPanel
                    source={panelData}
                    projectId={selectedProject?.id || ""}
                    onBack={() => setIsRightSidebarOpen(false)}
                    onUpdate={handleSourceUpdate}
                    isPremium={isPlus}
                  />
                )}
                {activePanelType === "collaboration-history" && (
                  <CollaborationHistoryPanel
                    editor={editorInstance}
                    members={workspaceMembers}
                    isLoading={isMembersLoading}
                    onClose={() => setIsRightSidebarOpen(false)}
                    initialAuthorId={panelData?.authorId}
                  />
                )}
                {activePanelType === "team-chat" &&
                  selectedProject?.workspace_id && (
                    <TeamChat
                      workspaceId={selectedProject.workspace_id}
                      projectId={selectedProject.id}
                      className="h-full"
                      isPanel={true}
                    />
                  )}
                {activePanelType === "team-chat" &&
                  !selectedProject?.workspace_id && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <p className="text-sm text-slate-500">
                        Team Chat is only available for workspace documents.
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Onboarding Tour */}
      <EditorOnboardingTour
        run={showEditorTour}
        onFinish={handleEditorTourComplete}
        onSkip={handleEditorTourSkip}
      />
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="citations"
      />
    </div>
  );
};

export default EditorWorkspacePage;
