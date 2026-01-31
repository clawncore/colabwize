"use client";

import { useState, useEffect } from "react";
import { X, Search, FileText, Plus, Quote, BookOpen } from "lucide-react";
import { CitationService } from "../../services/citationService";
import { ManualCitationForm, CitationData } from "./ManualCitationForm";
import { SearchCitationForm } from "./SearchCitationForm";
import { ImportCitationForm } from "./ImportCitationForm";



interface AddCitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  onCitationAdded: () => void;
  initialData?: any;
  isPanel?: boolean;
  citations?: any[];
  onInsertCitation?: (text: string, trackingInfo?: any) => void;
}

const AddCitationModal: React.FC<AddCitationModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onCitationAdded,
  initialData,
  isPanel = false,
  citations = [],
  onInsertCitation,
}) => {
  const [mainTab, setMainTab] = useState<"library" | "add-new">("library");
  const [activeTab, setActiveTab] = useState<"search" | "manual" | "import">(
    "search",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [citationData, setCitationData] = useState<CitationData>(
    initialData || {
      type: "article",
      title: "",
      authors: [{ firstName: "", lastName: "" }],
    },
  );
  const [importData, setImportData] = useState({
    doi: "",
    url: "",
    bibtex: "",
    ris: "",
  });
  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  // New state for Library Search
  const [librarySearchQuery, setLibrarySearchQuery] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("search");
      setSearchQuery("");
      setSearchResults([]);

      // If we're editing, use initialData, otherwise reset to empty form
      if (initialData) {
        setCitationData(initialData);
      } else {
        setCitationData({
          type: "article",
          title: "",
          authors: [{ firstName: "", lastName: "" }],
        });
      }

      setImportData({
        doi: "",
        url: "",
        bibtex: "",
        ris: "",
      });
      setImportResult(null);
      setError(null);
      setSuccess(null);
      setMainTab("library");
    }
  }, [isOpen, initialData]);


  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const results = await CitationService.searchCitations(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setError("No results found. Try adjusting your search terms.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to search citations");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleImportDOI = async () => {
    if (!importData.doi.trim()) {
      setError("Please enter a DOI");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const result = await CitationService.importFromDOI(importData.doi);
      setImportResult(result);
      setSuccess("Citation imported successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to import from DOI");
    } finally {
      setImporting(false);
    }
  };

  const handleImportURL = async () => {
    if (!importData.url.trim()) {
      setError("Please enter a URL");
      return;
    }

    setImporting(true);
    setError(null);

    try {
      const result = await CitationService.importFromURL(importData.url);
      setImportResult(result);
      setSuccess("Citation imported successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to import from URL");
    } finally {
      setImporting(false);
    }
  };

  const handleSaveCitation = async () => {
    try {
      setError(null);

      const citationToSave = importResult || citationData;

      if (!citationToSave.title) {
        setError("Title is required");
        return;
      }

      await CitationService.addCitation(projectId || "", citationToSave);

      setSuccess("Citation added successfully!");
      onCitationAdded();

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to save citation");
    }
  };

  const handleAddAuthor = () => {
    setCitationData({
      ...citationData,
      authors: [...citationData.authors, { firstName: "", lastName: "" }],
    });
  };

  const handleRemoveAuthor = (index: number) => {
    const newAuthors = citationData.authors.filter((_, i) => i !== index);
    setCitationData({ ...citationData, authors: newAuthors });
  };

  const handleAuthorChange = (
    index: number,
    field: "firstName" | "lastName",
    value: string,
  ) => {
    const newAuthors = [...citationData.authors];
    newAuthors[index][field] = value;
    setCitationData({ ...citationData, authors: newAuthors });
  };

  const isFormValid = () => {
    if (importResult) return true;

    if (!citationData.title) return false;

    switch (citationData.type) {
      case "article":
        return (
          citationData.authors.length > 0 &&
          citationData.authors.some(
            (author) => author.firstName || author.lastName,
          )
        );
      case "book":
        return citationData.publisher && citationData.year;
      case "website":
        return citationData.url;
      default:
        return citationData.title.length > 0;
    }
  };

  const handleSelectSearchResult = (result: any) => {
    setImportResult(result);
    setCitationData({
      type: result.type || "article",
      title: result.title || "",
      authors:
        result.authors && Array.isArray(result.authors)
          ? result.authors.map((author: any) => ({
            firstName: author.firstName || "",
            lastName: author.lastName || "",
          }))
          : [{ firstName: "", lastName: "" }],
      year: result.year,
      journal: result.journal,
      volume: result.volume,
      issue: result.issue,
      pages: result.pages,
      doi: result.doi,
      url: result.url,
      publisher: result.publisher,
      isbn: result.isbn,
      edition: result.edition,
      place: result.place,
      conference: result.conference,
      abstract: result.abstract,
      citationCount: result.citationCount,
      issn: result.issn,
      subjects: result.subjects,
      source: result.source,
    });
    setActiveTab("manual");
  };

  const renderContent = () => {
    return (
      <>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {activeTab === "search" && (
          <SearchCitationForm
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onSearch={(overrideQuery) => {
              if (overrideQuery) {
                setSearchQuery(overrideQuery);
              }
              handleSearch();
            }}
            searching={searching}
            results={searchResults}
            onSelect={handleSelectSearchResult}
          />
        )}

        {activeTab === "manual" && (
          <ManualCitationForm
            data={citationData}
            onChange={setCitationData}
            onAddAuthor={handleAddAuthor}
            onRemoveAuthor={handleRemoveAuthor}
            onAuthorChange={handleAuthorChange}
            isPanel={isPanel}
          />
        )}

        {activeTab === "import" && (
          <ImportCitationForm
            data={importData}
            onChange={setImportData}
            onImportDOI={handleImportDOI}
            onImportURL={handleImportURL}
            importing={importing}
            result={importResult}
          />
        )}
      </>
    );
  };

  if (!isOpen) return null;



  // Panel mode rendering
  if (isPanel) {
    const filteredCitations = citations.filter(c =>
      c.title?.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
      (Array.isArray(c.authors) && c.authors.some((a: any) =>
        (typeof a === 'string' ? a : `${a.firstName} ${a.lastName}`).toLowerCase().includes(librarySearchQuery.toLowerCase())
      ))
    );

    return (
      <div className="flex flex-col h-full bg-[#f9fafb]">
        {/* Main Tabs - Pill Style */}
        <div className="px-4 py-4">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setMainTab("library")}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${mainTab === "library"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Library ({citations.length})
            </button>
            <button
              onClick={() => setMainTab("add-new")}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${mainTab === "add-new"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Add New
            </button>
          </div>
        </div>

        {mainTab === "library" ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Library Search */}
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search library..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none bg-white"
                  value={librarySearchQuery}
                  onChange={(e) => setLibrarySearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Library List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
              {filteredCitations.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    {librarySearchQuery ? "No matching sources found." : "Your library is empty."}
                  </p>
                </div>
              ) : (
                filteredCitations.map((source, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all">
                    <h4 className="text-sm font-bold text-gray-900 mb-1 leading-snug line-clamp-2">{source.title}</h4>
                    <p className="text-xs text-gray-500 mb-2 truncate">
                      {Array.isArray(source.authors) && source.authors.length > 0
                        ? source.authors.map((a: any) => {
                          if (typeof a === 'string') return a;
                          if (a.name) return a.name;
                          if (a.firstName && a.lastName) return `${a.firstName} ${a.lastName}`;
                          if (a.lastName) return a.lastName;
                          return "Unknown";
                        }).join(", ")
                        : (source.author || "Unknown Author")}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase">
                        {source.type || "Source"}
                      </span>
                      <button
                        onClick={() => {
                          if (onInsertCitation) {
                            let author = "Anon";
                            if (Array.isArray(source.authors) && source.authors.length > 0) {
                              const firstAuthor = source.authors[0];
                              if (typeof firstAuthor === 'string') {
                                author = firstAuthor;
                              } else if (firstAuthor.lastName) {
                                author = firstAuthor.lastName;
                              } else if (firstAuthor.name) {
                                // Extract last name from full name if possible
                                const parts = firstAuthor.name.split(' ');
                                author = parts[parts.length - 1];
                              }
                            } else if (source.author) {
                              const parts = (source.author as string).split(' ');
                              author = parts[parts.length - 1];
                            }

                            const year = source.year || "n.d.";
                            const citationText = `(${author}, ${year})`;

                            onInsertCitation(citationText, {
                              sourceId: source.id,
                              title: source.title,
                              fullReferenceEntry: `${author} (${year}). ${source.title}.`
                            });
                          }
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Quote className="w-3 h-3 fill-current" />
                        Cite
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 bg-white border-t border-gray-100 rounded-t-3xl shadow-2xl">
            {/* Nested Tabs for Add New */}
            <div className="flex border-b border-gray-100 px-4 mt-2">
              <button
                onClick={() => setActiveTab("search")}
                className={`px-3 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === "search"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`px-3 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === "manual"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                Manual
              </button>
              <button
                onClick={() => setActiveTab("import")}
                className={`px-3 py-3 text-xs font-bold transition-all border-b-2 ${activeTab === "import"
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
              >
                Import
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {renderContent()}
            </div>

            {/* Footer for Add New */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                onClick={handleSaveCitation}
                disabled={!isFormValid()}
                className="w-full py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-100"
              >
                {importResult ? "Add to Library" : "Save Citation"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Modal mode rendering
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? "Edit Citation" : "Add Citation"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            onClick={() => setActiveTab("search")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "search"
              ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
              : "text-gray-600 hover:text-gray-800"
              }`}>
            <Search className="h-4 w-4 inline-block mr-2" />
            Search
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "manual"
              ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
              : "text-gray-600 hover:text-gray-800"
              }`}>
            <FileText className="h-4 w-4 inline-block mr-2" />
            Manual Entry
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${activeTab === "import"
              ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
              : "text-gray-600 hover:text-gray-800"
              }`}>
            <Plus className="h-4 w-4 inline-block mr-2" />
            Import
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleSaveCitation}
            disabled={!isFormValid()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center">
            {importResult ? "Add Citation" : "Save Citation"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCitationModal;
