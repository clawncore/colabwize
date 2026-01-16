import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { documentService, Project } from "../../services/documentService";
import { ArrowLeftIcon } from "lucide-react";
import { RenameProjectModal } from "../dashboard/RenameProjectModal";

type DisplayMode = "grid" | "list";

interface DocumentListProps {
  onProjectSelect?: (project: Project) => void;
  onCreateNew?: () => void;
  selectedProjectId?: string;
  displayMode?: DisplayMode;
  showActions?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onProjectSelect,
  onCreateNew,
  selectedProjectId,
  displayMode = "grid",
  showActions = true,
}) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [projectToRename, setProjectToRename] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const result = await documentService.getProjects();

      if (result.success && result.data) {
        setProjects(result.data);
      } else {
        setError(result.error || "Failed to fetch projects");
      }
    } catch (err) {
      setError("An error occurred while fetching projects");
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = (project: Project) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    } else {
      // Navigate to editor with project ID
      navigate(`/dashboard/editor/${project.id}`);
    }
  };

  const handleListProjectClick = (project: Project) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    }
    // In list mode, we don't navigate, just call the onProjectSelect callback
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBackButton = () => {
    navigate(-1);
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / 60000);

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60)
      return `Opened ${diffInMins} minute${diffInMins > 1 ? "s" : ""} ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24)
      return `Opened ${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Opened ${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  const handleRenameClick = (project: Project) => {
    setProjectToRename(project);
    setRenameModalOpen(true);
  };

  const handleRenameSubmit = async (newTitle: string): Promise<boolean> => {
    if (!projectToRename) return false;

    try {
      const result = await documentService.updateProject(
        projectToRename.id,
        newTitle,
        projectToRename.description || "",
        projectToRename.content,
        projectToRename.word_count
      );

      if (result.success) {
        fetchProjects(); // Refresh the list
        return true;
      } else {
        alert(result.error || "Failed to rename project");
        return false;
      }
    } catch (error) {
      console.error("Rename error:", error);
      alert("An error occurred while renaming the project");
      return false;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackButton}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors">
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
          </div>
          <button
            onClick={onCreateNew}
            className="p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            title="Create new document">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Document List/Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {error ? (
          <div className="p-4">
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              Error: {error}
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500">
              {searchQuery
                ? "No documents found matching your search."
                : "No documents yet. Create your first document to get started."}
            </p>
          </div>
        ) : displayMode === "grid" ? (
          // Grid mode - for DocumentManagementPage
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer border ${selectedProjectId === project.id
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200"
                  }`}
                onClick={() => handleProjectClick(project)}>
                {/* Menu Icon */}
                {showActions && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="relative">
                      <button
                        className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                        title="Document options"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle dropdown menu
                          const menu = document.getElementById(
                            `menu-${project.id}`
                          );
                          if (menu) {
                            menu.classList.toggle("hidden");
                          }
                        }}>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 5a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4z"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      <div
                        id={`menu-${project.id}`}
                        className="hidden absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="py-1">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              // Edit functionality - navigate to editor
                              navigate(`/dashboard/editor/${project.id}`);
                            }}>
                            Edit
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              const menu = document.getElementById(
                                `menu-${project.id}`
                              );
                              if (menu) menu.classList.add("hidden");
                              handleRenameClick(project);
                            }}>
                            Rename
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={async (e) => {
                              e.stopPropagation(); // Prevent card click event

                              let contentToUse = project.content;
                              // Lazy load content if missing (performance optimization)
                              if (!contentToUse) {
                                try {
                                  const res = await documentService.getProjectById(project.id);
                                  if (res.success && res.data) {
                                    contentToUse = res.data.content;
                                  }
                                } catch (err) {
                                  console.error("Failed to fetch content for duplication", err);
                                  alert("Failed to fetch project content. Please try again.");
                                  return;
                                }
                              }

                              // Duplicate functionality - create a new project with same content
                              documentService
                                .duplicateProject(
                                  project.id,
                                  `${project.title} (Copy)`,
                                  project.description || "",
                                  contentToUse
                                )
                                .then((result) => {
                                  if (result.success) {
                                    fetchProjects(); // Refresh the list
                                  }
                                });
                            }}>
                            Duplicate
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click event
                              // Delete functionality
                              if (
                                window.confirm(
                                  `Are you sure you want to delete "${project.title}"?`
                                )
                              ) {
                                documentService
                                  .deleteProject(project.id)
                                  .then((result) => {
                                    if (result.success) {
                                      fetchProjects(); // Refresh the list
                                    }
                                  });
                              }
                            }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Preview */}
                <div className="mt-6 mb-4">
                  <div className="bg-gray-100 border border-gray-200 rounded-md p-3 h-32 overflow-hidden">
                    <div className="text-xs text-gray-600 h-28 overflow-hidden">
                      {project.content &&
                        project.content.type === "doc" &&
                        project.content.content
                        ? (() => {
                          // Extract text from content for preview
                          const paragraphs = project.content.content;
                          let textPreview = "";

                          for (const node of paragraphs) {
                            if (node.type === "paragraph" && node.content) {
                              for (const content of node.content) {
                                if (content.type === "text" && content.text) {
                                  textPreview += content.text + " ";
                                }
                              }
                            }

                            if (textPreview.length > 100) {
                              break;
                            }
                          }

                          return textPreview.length > 0
                            ? textPreview.substring(0, 100) +
                            (textPreview.length > 100 ? "..." : "")
                            : project.description || "No content available";
                        })()
                        : project.description || "No content available"}
                    </div>
                  </div>
                </div>

                {/* Document Title and Description */}
                <h3 className="font-semibold text-gray-900 truncate mb-1">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {project.description || "No description provided"}
                </p>

                {/* Document Info */}
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <span>
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{getRelativeTime(project.updated_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List mode - for EditorWorkspacePage
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${selectedProjectId === project.id
                  ? "bg-purple-100 border border-purple-300"
                  : "hover:bg-gray-100 border border-gray-200"
                  }`}
                onClick={() => handleListProjectClick(project)}>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {project.title}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {project.description || "No description provided"}
                  </p>
                  <div className="mt-1 text-xs text-gray-500 flex items-center space-x-2">
                    <span>
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>{getRelativeTime(project.updated_at)}</span>
                  </div>
                </div>

                {/* Menu Icon */}
                {showActions && (
                  <div className="ml-2 relative">
                    <div className="relative">
                      <button
                        className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        title="Document options"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle dropdown menu
                          const menu = document.getElementById(
                            `list-menu-${project.id}`
                          );
                          if (menu) {
                            menu.classList.toggle("hidden");
                          }
                        }}>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 5a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4z"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      <div
                        id={`list-menu-${project.id}`}
                        className="hidden absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-20 border border-gray-200"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="py-1">
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              // Edit functionality - navigate to editor
                              navigate(`/dashboard/editor/${project.id}`);
                            }}>
                            Edit
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              const menu = document.getElementById(
                                `list-menu-${project.id}`
                              );
                              if (menu) menu.classList.add("hidden");
                              handleRenameClick(project);
                            }}>
                            Rename
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={async (e) => {
                              e.stopPropagation(); // Prevent card click event

                              let contentToUse = project.content;
                              // Lazy load content if missing
                              if (!contentToUse) {
                                try {
                                  const res = await documentService.getProjectById(project.id);
                                  if (res.success && res.data) {
                                    contentToUse = res.data.content;
                                  }
                                } catch (err) {
                                  console.error("Failed to fetch content for duplication", err);
                                  return;
                                }
                              }

                              // Duplicate functionality - create a new project with same content
                              documentService
                                .duplicateProject(
                                  project.id,
                                  `${project.title} (Copy)`,
                                  project.description || "",
                                  contentToUse
                                )
                                .then((result) => {
                                  if (result.success) {
                                    fetchProjects(); // Refresh the list
                                  }
                                });
                            }}>
                            Duplicate
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click event
                              // Delete functionality
                              if (
                                window.confirm(
                                  `Are you sure you want to delete "${project.title}"?`
                                )
                              ) {
                                documentService
                                  .deleteProject(project.id)
                                  .then((result) => {
                                    if (result.success) {
                                      fetchProjects(); // Refresh the list
                                    }
                                  });
                              }
                            }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {projectToRename && (
        <RenameProjectModal
          isOpen={renameModalOpen}
          onClose={() => {
            setRenameModalOpen(false);
            setProjectToRename(null);
          }}
          currentTitle={projectToRename.title}
          onRename={handleRenameSubmit}
        />
      )}
    </div>
  );
};
