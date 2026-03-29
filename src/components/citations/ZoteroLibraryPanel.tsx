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
  Folder
} from "lucide-react";
import { ZoteroService, ZoteroItem } from "../../services/zoteroService";
import { useToast } from "../../hooks/use-toast";
import { ZoteroIcon } from "../common/ZoteroIcon";
import { Button } from "../ui/button";

interface ZoteroLibraryPanelProps {
  projectId: string;
  isConnected?: boolean;
  onImportSuccess: () => void;
  onSourceSelect?: (source: any) => void;
}

export const ZoteroLibraryPanel: React.FC<ZoteroLibraryPanelProps> = ({ 
  projectId,
  isConnected,
  onImportSuccess,
  onSourceSelect
}) => {
  const [items, setItems] = useState<ZoteroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionKey, setSelectedCollectionKey] = useState<string | null>(null);
  const [isCollectionsLoading, setIsCollectionsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCollections = async () => {
    setIsCollectionsLoading(true);
    try {
      const colls = await ZoteroService.getCollections();
      setCollections(colls);
    } catch (error) {
      console.error("Error fetching Zotero collections:", error);
    } finally {
      setIsCollectionsLoading(false);
    }
  };

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      let libraryItems;
      if (selectedCollectionKey) {
        libraryItems = await ZoteroService.getCollectionItems(selectedCollectionKey);
      } else {
        libraryItems = await ZoteroService.getLibrary();
      }
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
    if (isConnected) {
      fetchCollections();
      fetchLibrary();
    }
  }, [isConnected, selectedCollectionKey]);

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
      const itemToImport = items.find(i => i.key === itemKey);
      if (!itemToImport) throw new Error("Item not found");
      
      await ZoteroService.importItems(projectId, [itemToImport]);
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

  const toggleExpand = (itemKey: string) => {
    if (expandedItems.includes(itemKey)) {
      setExpandedItems(prev => prev.filter(key => key !== itemKey));
    } else {
      setExpandedItems(prev => [...prev, itemKey]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-medium">Synchronizing Zotero...</p>
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
            ? "We couldn't find any items in your Zotero library. Add some references and refresh."
            : "Setup your Zotero library to browse and import your master references directly into your projects."}
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
          {isConnected ? "Refresh Zotero" : "Setup Zotero"}
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
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-red-100 placeholder:text-gray-400 transition-all mb-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isConnected && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCollectionKey(null)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                selectedCollectionKey === null
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-gray-500 border-gray-100 hover:border-red-200"
              }`}
            >
              All Items
            </button>
            {collections.map((coll) => (
              <button
                key={coll.key}
                onClick={() => setSelectedCollectionKey(coll.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                  selectedCollectionKey === coll.key
                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                    : "bg-white text-gray-500 border-gray-100 hover:border-red-200"
                }`}
              >
                <Folder className="w-3 h-3" />
                {coll.data.name}
              </button>
            ))}
          </div>
        )}
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
                  View Details
                </div>
              </div>

              {expandedItems.includes(item.key) && (
                <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="py-2 px-3 bg-gray-50 rounded-xl text-[10px] text-gray-500">
                      <strong>Journal:</strong> {item.data.publicationTitle || 'N/A'}<br/>
                      <strong>Volume:</strong> {item.data.volume || 'N/A'} <strong>Issue:</strong> {item.data.issue || 'N/A'}<br/>
                      <strong>DOI:</strong> {item.data.DOI || 'N/A'}
                    </div>
                </div>
              )}

                <div className="flex gap-2">
                  <button
                    disabled={importing.includes(item.key)}
                    onClick={() => handleImport(item.key)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
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
                  
                  {onSourceSelect && (
                    <button
                      onClick={() => onSourceSelect(item)}
                      className="px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Details
                    </button>
                  )}
                </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-red-50/50 border-t border-red-100">
        <div className="flex gap-2.5">
          <Info className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-800 leading-relaxed font-medium">
            Zotero items are imported as <strong>Trusted Sources</strong>. This boosts your citation accuracy and bypasses audit warnings.
          </p>
        </div>
      </div>
    </div>
  );
};
