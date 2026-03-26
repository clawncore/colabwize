import { getErrorMessage } from "../../utils/errorHandler";
import React, { useEffect, useState } from "react";
import {
  X,
  Clock,
  RotateCcw,
  Loader2,
  Calendar,
  FileText,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { documentService } from "../../services/documentService";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";

interface Version {
  id: string;
  version: number;
  created_at: string;
  word_count: number;
  user?: {
    full_name: string;
    email: string;
  } | null;
}

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onRestore: (project: any) => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onRestore,
}) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVersions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await documentService.getDocumentVersions(projectId);
      setVersions(data || []);
    } catch (error) {
      console.error("Failed to fetch versions:", error);
      toast({
        title: "Error",
        description: "Failed to load version history.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, fetchVersions]);

  const handleRestore = async (version: Version) => {
    setIsRestoring(version.id);
    try {
      toast({
        title: "Restoring...",
        description: `Restoring to version ${version.version}.`,
      });

      const updatedProject = await documentService.restoreDocumentVersion(
        projectId,
        version.id,
      );

      if (updatedProject && updatedProject.content) {
        onRestore(updatedProject);
        toast({
          title: "Success",
          description: "Document restored successfully.",
        });
        onClose();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Failed to restore version:", error);
      toast({
        title: "Error",
        description: "Failed to restore version.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(null);
    }
  };

  const handleDelete = async (version: Version) => {
    setIsDeletingId(version.id);
    setConfirmDeleteId(null);
    try {
      await documentService.deleteDocumentVersion(projectId, version.id);
      setVersions((prev) => prev.filter((v) => v.id !== version.id));
      toast({
        title: "Deleted",
        description: `Version ${version.version} has been deleted.`,
      });
    } catch (error: any) {
      console.error("Failed to delete version:", error);
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to delete version."),
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 z-[101]">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Version History
              </h3>
              <p className="text-sm text-gray-500">
                View, restore, or delete previous document states
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-gray-500 font-medium">Loading history...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
              <FileText className="w-12 h-12 opacity-20" />
              <p>No versions found for this document.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => {
                const isCurrent = index === 0;
                const isBeingDeleted = isDeletingId === version.id;
                const isConfirming = confirmDeleteId === version.id;
                const isBusy = isRestoring !== null || isDeletingId !== null;

                return (
                  <div key={version.id} className="space-y-0">
                    <div
                      className={`flex items-center justify-between p-4 border rounded-xl transition-all group
                        ${isCurrent ? "border-indigo-200 bg-indigo-50/40" : "border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/20"}
                        ${isConfirming ? "border-red-200 bg-red-50/30" : ""}
                      `}>
                      {/* Left info */}
                      <div className="flex items-start gap-4">
                        <div className="mt-1 p-2 bg-white border border-gray-100 rounded-lg shadow-sm group-hover:border-indigo-100">
                          <Clock
                            className={`w-4 h-4 ${isCurrent ? "text-indigo-500" : "text-gray-400 group-hover:text-indigo-500"}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">
                              Version {version.version}
                            </span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase font-semibold rounded-full tracking-wider">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(
                                new Date(version.created_at),
                                "MMM d, yyyy • h:mm a",
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {version.word_count} words
                            </div>
                            {version.user && (
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                {version.user.full_name || version.user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {/* Restore button */}
                        <Button
                          disabled={isCurrent || isBusy}
                          onClick={() => handleRestore(version)}
                          className="gap-1.5 border-gray-200 group-hover:border-indigo-200 group-hover:text-indigo-700 text-xs">
                          {isRestoring === version.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3" />
                          )}
                          Restore
                        </Button>

                        {/* Delete button — hidden for current version */}
                        {!isCurrent && (
                          <Button
                            disabled={isBusy}
                            onClick={() =>
                              setConfirmDeleteId(
                                isConfirming ? null : version.id,
                              )
                            }
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 px-2">
                            {isBeingDeleted ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Inline confirmation strip */}
                    {isConfirming && (
                      <div className="flex items-center justify-between bg-red-50 border border-red-200 border-t-0 rounded-b-xl px-4 py-2.5 animate-in slide-in-from-top-1 duration-150">
                        <p className="text-xs text-red-700 font-medium">
                          Delete Version {version.version}? This cannot be
                          undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors">
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(version)}
                            className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded font-medium transition-colors">
                            Yes, delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <Button onClick={onClose} className="text-gray-500">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
