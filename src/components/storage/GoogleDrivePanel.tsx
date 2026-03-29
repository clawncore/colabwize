import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  FileText, 
  Plus, 
  Loader2, 
  RefreshCw, 
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  FileIcon,
  Cloud
} from "lucide-react";
import { GoogleDriveService, GoogleDriveFile } from "../../services/googleDriveService";
import { useToast } from "../../hooks/use-toast";
import { GoogleDriveIcon } from "../common/GoogleDriveIcon";
import { Button } from "../ui/button";

interface GoogleDrivePanelProps {
  projectId: string;
  isConnected?: boolean;
  onImportSuccess: () => void;
}

export const GoogleDrivePanel: React.FC<GoogleDrivePanelProps> = ({ 
  projectId,
  isConnected,
  onImportSuccess 
}) => {
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const driveFiles = await GoogleDriveService.listFiles();
      setFiles(driveFiles);
    } catch (error) {
      console.error("Error fetching Google Drive files:", error);
      toast({
        title: "Connection Required",
        description: "Please connect your Google Drive account to browse files.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchFiles();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    const q = searchQuery.toLowerCase();
    return files.filter(file => 
      file.name.toLowerCase().includes(q)
    );
  }, [files, searchQuery]);

  const handleImport = async (fileId: string, fileName: string) => {
    setImporting(prev => [...prev, fileId]);
    try {
      await GoogleDriveService.importFile(projectId, fileId);
      toast({
        title: "Import Success",
        description: `${fileName} has been imported to your project.`,
      });
      if (onImportSuccess) onImportSuccess();
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        title: "Import Failed",
        description: "Could not import file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(prev => prev.filter(id => id !== fileId));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-medium">Accessing Google Drive...</p>
      </div>
    );
  }

  if (!isConnected || (files.length === 0 && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 p-3 shadow-sm border border-blue-50">
          <GoogleDriveIcon className="w-full h-full" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {isConnected ? "No Documents Found" : "Connect Google Drive"}
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-[240px]">
          {isConnected 
            ? "We couldn't find any PDF or Google Doc files in your Drive. Upload some files and refresh."
            : "Connect your Google Drive to browse and import your research papers directly into your projects."}
        </p>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          onClick={async () => {
            if (!isConnected) {
              window.location.href = await GoogleDriveService.getConnectUrl();
            } else {
              fetchFiles();
            }
          }}
        >
          {isConnected ? <RefreshCw className="w-4 h-4" /> : null}
          {isConnected ? "Refresh Drive" : "Connect Drive"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6">
              <GoogleDriveIcon className="w-full h-full" />
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-none">Google Drive</h2>
          </div>
          <button 
            onClick={fetchFiles}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Refresh Files"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search your Drive..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No matching files found</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div 
              key={file.id} 
              className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className={`w-4 h-4 shrink-0 ${file.mimeType.includes('pdf') ? 'text-red-500' : 'text-blue-500'}`} />
                  <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
                    {file.name}
                  </h3>
                </div>
                <a 
                  href={file.webViewLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-1 text-gray-300 hover:text-blue-500 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] text-gray-400">
                  Modified {new Date(file.modifiedTime).toLocaleDateString()}
                </span>
                {file.size && (
                  <span className="text-[10px] text-gray-400">
                    · {(parseInt(file.size) / (1024 * 1024)).toFixed(1)} MB
                  </span>
                )}
              </div>

              <button
                disabled={importing.includes(file.id)}
                onClick={() => handleImport(file.id, file.name)}
                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  importing.includes(file.id)
                    ? "bg-gray-50 text-gray-400 border border-gray-100"
                    : "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                }`}
              >
                {importing.includes(file.id) ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {importing.includes(file.id) ? "Importing..." : "Import Document"}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-blue-50/50 border-t border-blue-100">
        <div className="flex gap-2.5">
          <Cloud className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
            Files are imported into your project library for analysis. Google Docs will be automatically converted to PDF.
          </p>
        </div>
      </div>
    </div>
  );
};
