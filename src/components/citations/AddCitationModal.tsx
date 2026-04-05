"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  initialSearchQuery?: string;
  autoSearch?: boolean;
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
  initialSearchQuery,
  autoSearch = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [activeTab, setActiveTab] = useState<"search" | "manual" | "import">("search");
  const [citationData, setCitationData] = useState<CitationData>(
    initialData || { type: "article", title: "", authors: [{ firstName: "", lastName: "" }] },
  );
  const [importData, setImportData] = useState({ doi: "", url: "", bibtex: "", ris: "" });
  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSearch = useCallback(async (queryOverride?: string) => {
    const query = queryOverride || searchQuery;
    if (!query.trim()) return;

    setSearching(true);
    setError(null);

    try {
      const results = await CitationService.searchCitations(query);
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
  }, [searchQuery]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("search");
      const q = initialSearchQuery || "";
      setSearchQuery(q);
      setSearchResults([]);
      if (initialData) {
        setCitationData(initialData);
      } else {
        setCitationData({ type: "article", title: "", authors: [{ firstName: "", lastName: "" }] });
      }
      setImportData({ doi: "", url: "", bibtex: "", ris: "" });
      setImportResult(null);
      setError(null);
      setSuccess(null);

      // Auto search if requested
      if (autoSearch && q) {
        handleSearch(q);
      }
    }
  }, [isOpen, initialData, initialSearchQuery, autoSearch, handleSearch]);

  const handleImportDOI = useCallback(async () => {
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
  }, [importData.doi]);

  const handleImportURL = useCallback(async () => {
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
  }, [importData.url]);

  const handleSaveCitation = useCallback(async () => {
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
  }, [importResult, citationData, projectId, onCitationAdded, onClose]);

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
    return (
      <div className="flex flex-col h-full bg-[#f9fafb] min-w-0">
        {/* Nested Tabs */}
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

        {/* Footer */}
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
