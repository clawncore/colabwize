import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  BookOpen, 
  Plus, 
  Loader2, 
  RefreshCw, 
  ExternalLink,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileIcon,
  Download
} from "lucide-react";
import { ZoteroService, ZoteroItem } from "../../services/zoteroService";
import { useToast } from "../../hooks/use-toast";
import { ZoteroIcon } from "../common/ZoteroIcon";
import { Button } from "../ui/button";

interface ZoteroLibraryPanelProps {
  projectId: string;
  isConnected?: boolean;
  onImportSuccess: () => void;
}

export const ZoteroLibraryPanel: React.FC<ZoteroLibraryPanelProps> = ({ 
  projectId,
  isConnected,
  onImportSuccess 
}) => {
  const [items, setItems] = useState<ZoteroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Record<string, any[]>>({});
  const [loadingAttachments, setLoadingAttachments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const libraryItems = await ZoteroService.getLibrary();
      setItems(libraryItems);
    } catch (error) {
      console.error("Error fetching Zotero library:", error);
      toast({
        title: "Connection Required",
        description: "Please connect your Zotero account in Settings to view your library.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(item => 
      item.data.title?.toLowerCase().includes(q) || 
      item.meta.creatorSummary?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const handleImport = async (itemKey: string) => {
    setImporting(prev => [...prev, itemKey]);
    try {
      await ZoteroService.importItems(projectId, [itemKey]);
      toast({
        title: "Success",
        description: "Reference imported to project library.",
      });
      if (onImportSuccess) onImportSuccess();
    } catch (error) {
      console.error("Import failed:", error);
      toast({
        title: "Import Failed",
        description: "Could not import reference. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(prev => prev.filter(key => key !== itemKey));
    }
  };

  const toggleExpand = async (itemKey: string) => {
    if (expandedItems.includes(itemKey)) {
      setExpandedItems(prev => prev.filter(key => key !== itemKey));
      return;
    }

    setExpandedItems(prev => [...prev, itemKey]);

    if (!attachments[itemKey]) {
      setLoadingAttachments(prev => [...prev, itemKey]);
      try {
        const itemAttachments = await ZoteroService.getAttachments(itemKey);
        setAttachments(prev => ({ ...prev, [itemKey]: itemAttachments }));
      } catch (error) {
        console.error("Failed to load attachments:", error);
      } finally {
        setLoadingAttachments(prev => prev.filter(key => key !== itemKey));
      }
    }
  };

  const handleImportPDF = async (attachment: any) => {
    setImporting(prev => [...prev, attachment.key]);
    try {
      // Logic to trigger backend PDF proxy and save to SourceLibrary
      // For now, we'll just open the proxy URL which triggers a download
      // In a real implementation, we'd use a dedicated import endpoint
      const apiUrl = process.env.REACT_APP_API_URL || "https://api.colabwize.com";
      window.open(`${apiUrl}/api/zotero/file/${attachment.key}`, '_blank');
      
      toast({
        title: "Download Started",
        description: "Your research PDF is being downloaded.",
      });
    } catch (error) {
      console.error("PDF import failed:", error);
    } finally {
      setImporting(prev => prev.filter(key => key !== attachment.key));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-medium">Synchronizing Vault...</p>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 p-3 shadow-sm border border-red-50">
          <ZoteroIcon className="w-full h-full" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {isConnected ? "Your Zotero Library is Empty" : "Setup Zotero Library"}
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-[240px]">
          {isConnected 
            ? "We couldn't find any items in your research vault. Add some references and refresh."
            : "Setup your research vault to browse and import your master references directly into your projects."}
        </p>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          onClick={async () => {
            if (!isConnected) {
              window.location.href = await ZoteroService.getConnectUrl();
            } else {
              fetchLibrary();
            }
          }}
        >
          {isConnected ? <RefreshCw className="w-4 h-4" /> : null}
          {isConnected ? "Refresh Vault" : "Setup Vault"}
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
              <ZoteroIcon className="w-full h-full" />
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-none">Zotero Library</h2>
          </div>
          <button 
            onClick={fetchLibrary}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Refresh Library"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Zotero Library..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-100 placeholder:text-gray-400 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-400">No matching references found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div 
              key={item.key} 
              className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-red-200 hover:shadow-sm transition-all group"
            >
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg uppercase border border-gray-100">
                    {item.data.itemType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-lg uppercase border border-red-100 flex items-center gap-1">
                    <ZoteroIcon className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>
                <a 
                  href={`https://www.zotero.org/items/${item.key}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-1 text-gray-300 hover:text-blue-500 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div 
                className="cursor-pointer"
                onClick={() => toggleExpand(item.key)}
              >
                <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-red-600 transition-colors line-clamp-2">
                  {item.data.title}
                </h3>
                
                <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                  {item.meta.creatorSummary || "No authors listed"}
                  {item.data.date && ` · ${item.data.date}`}
                </p>

                <div className="flex items-center gap-2 mb-4 text-[10px] text-gray-400 font-medium">
                  {expandedItems.includes(item.key) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {attachments[item.key]?.length ? `${attachments[item.key].length} attachments` : 'View Attachments'}
                </div>
              </div>
              
              {expandedItems.includes(item.key) && (
                <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {loadingAttachments.includes(item.key) ? (
                    <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-xl">
                      <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                      <span className="text-[10px] text-gray-400">Loading attachments...</span>
                    </div>
                  ) : attachments[item.key]?.length === 0 ? (
                    <div className="py-2 px-3 bg-gray-50 rounded-xl text-[10px] text-gray-400 italic">
                      No attachments found
                    </div>
                  ) : (
                    attachments[item.key]?.map((att) => (
                      <div key={att.key} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl group/att">
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <FileIcon className={`w-3 h-3 shrink-0 ${att.data.contentType?.includes('pdf') ? 'text-red-500' : 'text-blue-500'}`} />
                          <span className="text-[10px] text-gray-600 truncate font-medium">
                            {att.data.filename || att.data.title || 'Attachment'}
                          </span>
                        </div>
                        {att.data.itemType === 'attachment' && (
                          <button 
                            onClick={() => handleImportPDF(att)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                            title="Download PDF"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              <button
                disabled={importing.includes(item.key)}
                onClick={() => handleImport(item.key)}
                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  importing.includes(item.key)
                    ? "bg-gray-50 text-gray-400 border border-gray-100"
                    : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600"
                }`}
              >
                {importing.includes(item.key) ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {importing.includes(item.key) ? "Importing..." : "Import Entry"}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-red-50/50 border-t border-red-100">
        <div className="flex gap-2.5">
          <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-800 leading-relaxed font-medium">
            Vault items are imported as <strong>Trusted Sources</strong>. This boosts your citation accuracy and bypasses audit warnings.
          </p>
        </div>
      </div>
    </div>
  );
};
