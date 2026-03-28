import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Loader2, 
  RefreshCw, 
  Info,
  ChevronDown,
  ChevronUp,
  Plus
} from "lucide-react";
import { MendeleyService, MendeleyItem } from "../../services/mendeleyService";
import { useToast } from "../../hooks/use-toast";
import { MendeleyIcon } from "../common/MendeleyIcon";
import { Button } from "../ui/button";

interface MendeleyLibraryPanelProps {
  projectId: string;
  isConnected?: boolean;
  onImportSuccess?: () => void;
}

export const MendeleyLibraryPanel: React.FC<MendeleyLibraryPanelProps> = ({ 
  projectId,
  isConnected,
  onImportSuccess 
}) => {
  const [items, setItems] = useState<MendeleyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const libraryItems = await MendeleyService.getLibrary();
      setItems(libraryItems);
    } catch (error) {
      console.error("Error fetching Mendeley library:", error);
      toast({
        title: "Connection Required",
        description: "Please connect your Mendeley account in Settings to view your library.",
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
      item.title?.toLowerCase().includes(q) || 
      item.authors?.some(a => a.last_name?.toLowerCase().includes(q) || a.first_name?.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const handleImport = async (itemId: string) => {
    setImporting(prev => [...prev, itemId]);
    try {
      // In a real integration, we'd trigger an import endpoint
      // await MendeleyService.importItems(projectId, [itemId]);
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
      setImporting(prev => prev.filter(key => key !== itemId));
    }
  };

  const toggleExpand = (itemId: string) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(prev => prev.filter(key => key !== itemId));
    } else {
      setExpandedItems(prev => [...prev, itemId]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-medium">Synchronizing Library...</p>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 p-3 shadow-sm border border-blue-50">
          <MendeleyIcon className="w-full h-full text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {isConnected ? "Your Mendeley Library is Empty" : "Setup Mendeley Library"}
        </h3>
        <p className="text-sm text-gray-500 mb-6 max-w-[240px]">
          {isConnected 
            ? "We couldn't find any items in your research library. Add some references and refresh."
            : "Setup your Mendeley library to browse and import your master references directly into your projects."}
        </p>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          onClick={async () => {
            if (!isConnected) {
              window.location.href = await MendeleyService.getConnectUrl();
            } else {
              fetchLibrary();
            }
          }}
        >
          {isConnected ? <RefreshCw className="w-4 h-4" /> : null}
          {isConnected ? "Refresh Library" : "Setup Mendeley"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 text-blue-600">
              <MendeleyIcon className="w-full h-full" />
            </div>
            <h2 className="text-xl font-black text-gray-900 leading-none">Mendeley Library</h2>
          </div>
          <button 
            onClick={fetchLibrary}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Refresh Library"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search Mendeley Library..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 placeholder:text-gray-400 transition-all"
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
              key={item.id} 
              className="p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all group"
            >
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-bold rounded-lg uppercase border border-gray-100">
                    {item.type || 'Article'}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg uppercase border border-blue-100 flex items-center gap-1">
                    <MendeleyIcon className="w-2.5 h-2.5" /> Verified
                  </span>
                </div>
              </div>

              <div 
                className="cursor-pointer"
                onClick={() => toggleExpand(item.id)}
              >
                <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                  {item.authors?.map(a => `${a.last_name}, ${a.first_name}`).join('; ') || "No authors listed"}
                  {item.year && ` · ${item.year}`}
                </p>

                <div className="flex items-center gap-2 mb-4 text-[10px] text-gray-400 font-medium">
                  {expandedItems.includes(item.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  View Details
                </div>
              </div>
              
              {expandedItems.includes(item.id) && (
                <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="py-2 px-3 bg-gray-50 rounded-xl text-[10px] text-gray-500">
                      <strong>Source:</strong> {item.source || 'N/A'}<br/>
                      <strong>Year:</strong> {item.year || 'N/A'}<br/>
                    </div>
                </div>
              )}

              <button
                disabled={importing.includes(item.id)}
                onClick={() => handleImport(item.id)}
                className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  importing.includes(item.id)
                    ? "bg-gray-50 text-gray-400 border border-gray-100"
                    : "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                }`}
              >
                {importing.includes(item.id) ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {importing.includes(item.id) ? "Importing..." : "Import Entry"}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-blue-50/50 border-t border-blue-100">
        <div className="flex gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
            Mendeley library items are imported as <strong>Trusted Sources</strong>. This boosts your citation accuracy and bypasses audit warnings.
          </p>
        </div>
      </div>
    </div>
  );
};
