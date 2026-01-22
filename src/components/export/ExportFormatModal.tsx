import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Download, Loader2, AlertTriangle } from "lucide-react";
import { apiClient } from "../../services/apiClient";
import { Project } from "../../services/documentService";
import { useToast } from "../../hooks/use-toast";
import { OriginalityService } from "../../services/originalityService";

interface ExportFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  currentContent: any; // TipTap content
}

type ExportFormat = "docx" | "latex" | "rtf" | "txt";

export const ExportFormatModal: React.FC<ExportFormatModalProps> = ({
  isOpen,
  onClose,
  project,
  currentContent,
}) => {
  const [downloading, setDownloading] = useState<ExportFormat | null>(null);
  const { toast } = useToast();

  const handleDownload = async (format: ExportFormat) => {
    try {
      setDownloading(format);

      // Check for self-plagiarism before export
      const contentText =
        typeof currentContent === "string"
          ? currentContent
          : JSON.stringify(currentContent);

      const selfPlagiarismResults =
        await OriginalityService.checkSelfPlagiarism(contentText, project.id);

      // Check if any results indicate potential self-plagiarism
      const hasSelfPlagiarismRisk = selfPlagiarismResults.some(
        (result) =>
          result.isSelfPlagiarismInternal && result.similarityScore > 20
      );

      if (hasSelfPlagiarismRisk) {
        const confirmExport = window.confirm(
          `Warning: Potential self-plagiarism detected. Some content matches your previous work. Are you sure you want to export this document?\n\nClick OK to continue with export, or Cancel to review.`
        );

        if (!confirmExport) {
          setDownloading(null);
          return; // User cancelled export
        }
      }

      const userId = localStorage.getItem("user_id") || "";
      const response = await apiClient.download("/api/files", {
        fileData: {
          id: project.id,
          title: project.title,
          content: currentContent,
          citations: project.citations || [],
        },
        fileType: `export-${format}`, // Mapped to backend options
        userId: userId,
        format: format, //Explicit format pass
      });

      // Parse JSON response to get download URL
      const data = await response.json();

      if (!data.success || !data.result?.downloadUrl) {
        throw new Error(data.message || "Failed to generate download URL");
      }

      // Fetch the actual file content from the signed/public URL
      const fileResponse = await fetch(data.result.downloadUrl);

      if (!fileResponse.ok) {
        throw new Error("Failed to download file from storage");
      }

      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const extensionMap = {
        docx: "docx",
        latex: "tex",
        rtf: "rtf",
        txt: "txt",
      };

      a.download = `${project.title.replace(/\s+/g, "_")}.${extensionMap[format]}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: `Your ${format.toUpperCase()} file is ready.`,
        variant: "default",
      });

      setDownloading(null);
      onClose(); // Close modal on success
    } catch (error) {
      console.error("Download failed", error);
      toast({
        title: "Download Failed",
        description:
          "There was an error generating your file. Please try again.",
        variant: "destructive",
      });
      setDownloading(null);
    }
  };

  // Function to run self-plagiarism check manually
  const runSelfPlagiarismCheck = async () => {
    try {
      const contentText =
        typeof currentContent === "string"
          ? currentContent
          : JSON.stringify(currentContent);

      const results = await OriginalityService.checkSelfPlagiarism(
        contentText,
        project.id
      );

      if (results.length > 0) {
        const riskyMatches = results.filter(
          (r) => r.isSelfPlagiarismInternal && r.similarityScore > 20
        );
        if (riskyMatches.length > 0) {
          toast({
            title: "Self-Plagiarism Risk Detected",
            description: `${riskyMatches.length} sections match your previous work. Consider revising before submission.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "No Self-Plagiarism Risk",
            description:
              "No significant matches found with your previous work.",
            variant: "default",
          });
        }
      } else {
        toast({
          title: "No Self-Plagiarism Risk",
          description: "No matches found with your previous work.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Self-plagiarism check failed", error);
      toast({
        title: "Check Failed",
        description: "Could not run self-plagiarism check. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formats = [
    {
      id: "docx",
      label: "Microsoft Word (.docx)",
      description: "Best for submission and editing.",
      icon: "W",
      color: "bg-blue-600",
    },

    {
      id: "latex",
      label: "LaTeX Source (.tex)",
      description: "Best for scientific/academic layouts.",
      icon: "T",
      color: "bg-green-600",
    },
    {
      id: "rtf",
      label: "Rich Text Format (.rtf)",
      description: "Universal compatibility.",
      icon: "R",
      color: "bg-purple-600",
    },
    {
      id: "txt",
      label: "Plain Text (.txt)",
      description: "Simple text content.",
      icon: "T",
      color: "bg-gray-600",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Download className="w-5 h-5" />
            Select Export Format
          </DialogTitle>
        </DialogHeader>

        {/* Self-Plagiarism Guard */}
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 mb-1">
              Draft Comparison Guard
            </p>
            <p className="text-xs text-amber-700 mb-2">
              This will check your document against your recent submissions for
              self-plagiarism.
            </p>
            <button
              onClick={runSelfPlagiarismCheck}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded transition-colors">
              Run Self-Plagiarism Check
            </button>
          </div>
        </div>

        <div className="grid gap-3 py-6">
          {formats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => handleDownload(fmt.id as ExportFormat)}
              disabled={downloading !== null}
              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-gray-50 transition-all text-left group disabled:opacity-50">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${fmt.color} text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0`}>
                {downloading === fmt.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  fmt.icon
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{fmt.label}</p>
                <p className="text-sm text-gray-500">{fmt.description}</p>
              </div>
              <Download className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
