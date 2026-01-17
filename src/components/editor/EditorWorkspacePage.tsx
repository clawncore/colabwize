import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DocumentList } from "../documents/DocumentList";
import { DocumentEditor } from "./DocumentEditor";
import { PaperSuggestionsPanel } from "../citations/PaperSuggestionsPanel";
import { RephraseSuggestionsPanel } from "../originality/RephraseSuggestionsPanel";
import { AnxietyRealityCheckPanel } from "../originality/AnxietyRealityCheckPanel";
import { DraftComparisonPanel } from "../originality/DraftComparisonPanel";
import { CitationConfidencePanel } from "../citations/CitationConfidencePanel";
import { AIChatPanel } from "../aichat/AIChatPanel";
import { Project, documentService } from "../../services/documentService";
import { SubscriptionService } from "../../services/subscriptionService";
import { UsageMeter } from "../../components/subscription/UsageMeter";
import { useAuth } from "../../hooks/useAuth";

// Define panel types
export type RightPanelType =
  | "citations"
  | "rephrase"
  | "reality-check"
  | "draft-comparison"
  | "citation-confidence"
  | "ai-chat"
  | null;

const EditorWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  // const [projects, setProjects] = useState<Project[]>([]);

  // Collapsible state
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Right panel type state
  const [activePanelType, setActivePanelType] =
    useState<RightPanelType>("ai-chat");
  const [panelData, setPanelData] = useState<any>(null);

  // Resizable widths
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(340);

  // Subscription state
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [userPlan, setUserPlan] = useState<string>("Free Plan");
  const { user } = useAuth();

  // Resize state
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
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
        newProject.content!
      );

      if (result.success && result.data) {
        setSelectedProject(result.data);
        // setProjects((prev) => [result.data!, ...prev]);
      }
    } catch (error) {
      console.error("Failed to create new document:", error);
    }
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    setSelectedProject(updatedProject);
    // setProjects((prev) =>
    //   prev.map((p) => (p.id === updatedProject.id ? updatedProject : p))
    // );
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
        try {
          const result = await documentService.getProjectById(id);
          if (result.success && result.data) {
            setSelectedProject(result.data);
          }
        } catch (error) {
          console.error("Failed to load project by ID:", error);
        }
      }
    };

    loadProjectById();
  }, [id]);

  // Fetch subscription data for credits
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { subscription, creditBalance } = await SubscriptionService.getCurrentSubscription();
        setCreditBalance(creditBalance || 0);

        // Get plan usage name logic
        let planName = "Free Plan";
        if (subscription?.plan) {
          const planId = typeof subscription.plan === 'object' ? subscription.plan.id : subscription.plan;
          if (planId === 'student') planName = "Student Pro";
          else if (planId === 'researcher') planName = "Researcher";
          else if (planId === 'payg') planName = "Pay As You Go";
        }
        setUserPlan(planName);

      } catch (error) {
        console.error("Failed to fetch subscription:", error);
      }
    };

    if (user) {
      fetchSubscription();
    }
  }, [user]);

  // Handle mouse move for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingLeft && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        if (newWidth >= 200 && newWidth <= 500) {
          setLeftSidebarWidth(newWidth);
        }
      }

      if (isResizingRight && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX;
        if (newWidth >= 250 && newWidth <= 600) {
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
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizingLeft, isResizingRight]);

  // Get panel title based on active type
  const getPanelTitle = () => {
    switch (activePanelType) {
      case "citations":
        return "Paper Suggestions";
      case "rephrase":
        return "Rephrase Suggestions";
      case "reality-check":
        return "Reality Check";
      case "draft-comparison":
        return "Draft Comparison";
      case "ai-chat":
        return "AI Assistant";
      default:
        return "Suggestions";
    }
  };

  const [editorInstance, setEditorInstance] = useState<any>(null);

  const handleInsertCitation = (text: string) => {
    if (editorInstance) {
      editorInstance.chain().focus().insertContent(text).run();
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-screen w-full flex overflow-hidden bg-white">
      {/* Left Sidebar - Documents List */}
      {isLeftSidebarOpen && (
        <>
          <div
            style={{ width: `${leftSidebarWidth}px` }}
            className="flex-shrink-0 h-full border-r border-gray-200 transition-all relative">
            <DocumentList
              onProjectSelect={handleProjectSelect}
              onCreateNew={handleCreateNew}
              selectedProjectId={selectedProject?.id}
              displayMode="list"
              showActions={false}
            />

            {/* Credit Meter Fixed at Bottom */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-10 transition-all">
              <UsageMeter
                current={creditBalance}
                limit={0}
                planName={userPlan}
                featureName="credits"
                mode="credits"
              />
            </div>
          </div>
          {/* Left Resize Handle */}
          <div
            onMouseDown={() => setIsResizingLeft(true)}
            className="w-1 h-full bg-gray-200 hover:bg-purple-400 cursor-col-resize flex-shrink-0 transition-colors"
          />
        </>
      )
      }

      {/* Toggle Left Sidebar Button */}
      <button
        onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        className={`absolute top-4 z-20 p-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-all duration-300`}
        style={{
          left: isLeftSidebarOpen ? `${leftSidebarWidth - 16}px` : "16px",
        }}
        title={isLeftSidebarOpen ? "Hide Documents" : "Show Documents"}>
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
      </button>

      {/* Center Panel - Document Editor */}
      <div className="flex-1 h-full overflow-hidden min-w-0">
        {selectedProject ? (
          <DocumentEditor
            project={selectedProject}
            onProjectUpdate={handleProjectUpdate}
            onOpenPanel={openPanel}
            onEditorReady={setEditorInstance}
          />
        ) : (
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

      {/* Toggle Right Sidebar Button */}
      <button
        onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        className={`absolute top-4 z-10 p-2 bg-white border border-gray-300 rounded-md shadow-md hover:bg-gray-50 transition-all`}
        style={{
          right: isRightSidebarOpen ? `${rightSidebarWidth + 8}px` : "16px",
        }}
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
      </button>

      {/* Right Sidebar - Feature-Specific Panels */}
      {
        isRightSidebarOpen && activePanelType && (
          <>
            {/* Right Resize Handle */}
            <div
              onMouseDown={() => setIsResizingRight(true)}
              className="w-1 h-full bg-gray-200 hover:bg-purple-400 cursor-col-resize flex-shrink-0 transition-colors"
            />
            <div
              style={{ width: `${rightSidebarWidth}px` }}
              className="flex-shrink-0 h-full transition-all border-l border-gray-200">
              {/* Render appropriate panel based on type */}
              {activePanelType === "citations" && selectedProject && (
                <PaperSuggestionsPanel
                  projectId={selectedProject.id}
                  onClose={() => setIsRightSidebarOpen(false)}
                  onInsertCitation={handleInsertCitation}
                  contextKeywords={panelData?.contextKeywords}
                />
              )}
              {activePanelType === "rephrase" && (
                <RephraseSuggestionsPanel
                  projectId={selectedProject?.id}
                  panelData={panelData}
                  onClose={() => setIsRightSidebarOpen(false)}
                />
              )}
              {activePanelType === "reality-check" && panelData && (
                <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                  <AnxietyRealityCheckPanel stats={panelData} />
                </div>
              )}
              {activePanelType === "draft-comparison" && panelData && (
                <DraftComparisonPanel
                  result={panelData}
                  onClose={() => setIsRightSidebarOpen(false)}
                />
              )}
              {activePanelType === "citation-confidence" && selectedProject && (
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
                  onClose={() => setIsRightSidebarOpen(false)}
                />
              )}
            </div>
          </>
        )
      }
    </div >
  );
};

export default EditorWorkspacePage;
