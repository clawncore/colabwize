import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Project, documentService } from "../../services/documentService";
import { OriginalityService } from "../../services/originalityService";
import { FileText, Search, AlertCircle } from "lucide-react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { Image } from "@tiptap/extension-image";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { TextAlign } from "@tiptap/extension-text-align";

interface DraftComparisonSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentDraftContent: string;
  onComparisonComplete: (result: any) => void;
  excludeProjectId?: string;
}

export const DraftComparisonSelector: React.FC<
  DraftComparisonSelectorProps
> = ({
  isOpen,
  onClose,
  currentDraftContent,
  onComparisonComplete,
  excludeProjectId,
}) => {
    const [activeTab, setActiveTab] = useState<"projects" | "paste">("projects");
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [pastedText, setPastedText] = useState("");
    const [isComparing, setIsComparing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchProjects = async () => {
        setIsLoading(true);
        try {
          const result = await documentService.getProjects();
          if (result.success && result.data) {
            setProjects(
              result.data.filter((p) => p.id !== excludeProjectId) // Exclude current project
            );
          }
        } catch (err) {
          console.error("Failed to fetch projects", err);
          setError("Failed to load your documents.");
        } finally {
          setIsLoading(false);
        }
      };

      if (isOpen && activeTab === "projects") {
        fetchProjects();
      }
    }, [isOpen, activeTab, excludeProjectId]);

    const handleCompare = async (textToCompare: string) => {
      if (!textToCompare || textToCompare.trim().length < 50) {
        setError("Text is too short to compare (minimum 50 characters).");
        return;
      }

      setIsComparing(true);
      setError(null);

      try {
        const result = await OriginalityService.compareDrafts(
          currentDraftContent,
          textToCompare
        );
        onComparisonComplete(result);
        onClose();
      } catch (err: any) {
        setError(err.message || "Comparison failed. Please try again.");
      } finally {
        setIsComparing(false);
      }
    };

    const handleProjectSelect = (project: Project) => {
      // Extract text from project content (TipTap JSON)
      let text = "";
      try {
        // Simple text extraction from JSON content
        if (project.content && typeof project.content === "object") {
          // Use TipTap logic or detailed recursion if strict needed.
          // For now, let's use a quick traverse helper if available, or just JSON stringify for MVP
          // Ideally we want clean text.
          // Let's use Tiptap generateHTML then regex strip tags for robustness
          const html = generateHTML(project.content, [
            StarterKit,
            Table,
            TableCell,
            TableHeader,
            TableRow,
            Image,
            TaskList,
            TaskItem,
            Underline,
            Link,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
          ]);
          const div = document.createElement("div");
          div.innerHTML = html;
          text = div.textContent || div.innerText || "";
        }
      } catch (e) {
        console.warn("Failed to parse project content", e);
        setError("Could not read document content.");
        return;
      }

      if (!text) {
        setError("Selected document appears empty.");
        return;
      }

      handleCompare(text);
    };

    const filteredProjects = projects.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Compare Drafts</DialogTitle>
            <DialogDescription>
              Check for self-plagiarism by comparing against your previous work.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("projects")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "projects"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
              My Documents
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "paste"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
                }`}>
              Paste Text
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div className="h-64 overflow-y-auto border border-gray-100 rounded-lg bg-gray-50 p-2">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div className="space-y-2">
                    {filteredProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectSelect(project)}
                        disabled={isComparing}
                        className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {project.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {new Date(project.updated_at).toLocaleDateString()}{" "}
                              • {project.word_count} words
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-10">
                    <p>No other documents found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "paste" && (
            <div className="space-y-4">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the text of your previous draft here..."
                className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-sm"
              />
              <button
                onClick={() => handleCompare(pastedText)}
                disabled={isComparing || !pastedText.trim()}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                {isComparing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Comparing...
                  </>
                ) : (
                  "Compare Text"
                )}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };
