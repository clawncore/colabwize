"use client";

import { useState, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import {
  BookOpen,
  Plus,
  Copy,
  Check,
  Trash2,
  Search,
  GraduationCap,
  FileText,
  Globe,
  Users,
  Edit3,
  X,
} from "lucide-react";
import { CitationService, type StoredCitation } from "../../services/citationService";
import AddCitationModal from "./AddCitationModal";

interface Author {
  firstName: string;
  lastName: string;
}

interface CitationsPanelProps {
  projectId: string;
  documentTitle?: string;
  editor?: Editor | null;
}

export function CitationsPanel({
  projectId,
  documentTitle,
  editor,
}: CitationsPanelProps) {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [searchQuery, setSearchQuery] = useState("");
  const [citations, setCitations] = useState<StoredCitation[]>([]);
  const [filteredCitations, setFilteredCitations] = useState<StoredCitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<"apa" | "mla" | "chicago">("apa");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCitations = useCallback(async () => {
    if (!projectId) {
      setCitations([]);
      setFilteredCitations([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetchedCitations =
        await CitationService.getProjectCitations(projectId);
      setCitations(fetchedCitations);
      setFilteredCitations(fetchedCitations);
    } catch (err: any) {
      setError(
        "Failed to fetch citations: " + (err.message || "Unknown error"),
      );
      console.error("Fetch citations error:", err);
      setCitations([]);
      setFilteredCitations([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Fetch citations when mounted or projectId changes
  useEffect(() => {
    fetchCitations();
  }, [projectId, fetchCitations]);

  // Filter citations based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCitations(citations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = citations.filter(
        (citation) => {
          // Search in title
          if (citation.title.toLowerCase().includes(query)) return true;

          // Search in authors (handle both string[] and object[] formats)
          if (Array.isArray(citation.authors)) {
            const authorMatch = citation.authors.some((author: string | { firstName?: string; lastName?: string }) => {
              if (typeof author === 'string') {
                return author.toLowerCase().includes(query);
              }
              return (
                (author.firstName && author.firstName.toLowerCase().includes(query)) ||
                (author.lastName && author.lastName.toLowerCase().includes(query))
              );
            });
            if (authorMatch) return true;
          } else if (citation.author && citation.author.toLowerCase().includes(query)) {
            return true;
          }

          // Search in journal
          if (citation.journal && citation.journal.toLowerCase().includes(query)) {
            return true;
          }

          // Search in year
          if (citation.year && citation.year.toString().includes(query)) {
            return true;
          }

          return false;
        }
      );
      setFilteredCitations(filtered);
    }
  }, [searchQuery, citations]);

  const formatCitation = (citation: StoredCitation): string => {
    return CitationService.formatCitation(citation, style);
  };

  const copyCitation = (citation: StoredCitation) => {
    navigator.clipboard.writeText(formatCitation(citation));
    setCopiedId(citation.id || '');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const insertCitation = (citation: StoredCitation) => {
    // Dispatch event for editor to catch if direct prop isn't available
    const authors = Array.isArray(citation.authors) ? citation.authors : citation.author ? [{ firstName: '', lastName: citation.author }] : [];
    const authorText = authors[0] ? (typeof authors[0] === 'string' ? authors[0] : `${authors[0].lastName || authors[0].firstName}`) : 'Author';
    const event = new CustomEvent("insert-citation", {
      detail: {
        text: `(${authorText}, ${citation.year || "N.d."})`,
      },
    });
    window.dispatchEvent(event);
  };

  const deleteCitation = async (id: string) => {
    try {
      await CitationService.deleteCitation(id);
      setCitations(citations.filter((c) => c.id !== id));
      setFilteredCitations(filteredCitations.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(
        "Failed to delete citation: " + (err.message || "Unknown error"),
      );
      console.error("Delete citation error:", err);
    }
  };

  const handleNewCitationAdded = () => {
    fetchCitations();
    setActiveTab("existing");
  };

  const typeIcons = {
    article: FileText,
    book: BookOpen,
    website: Globe,
    conference: Users,
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header handled by EditorPage usually, but we can add tabs content here */}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="flex-1 flex flex-col h-full">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 mb-2">
            <TabsTrigger
              value="existing"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600">
              Library ({citations.length})
            </TabsTrigger>
            <TabsTrigger
              value="new"
              className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600">
              Add New
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="existing"
          className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm bg-white border-gray-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <Select
              value={style}
              onValueChange={(v) => setStyle(v as typeof style)}>
              <SelectTrigger className="w-24 h-9 text-xs bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="apa">APA</SelectItem>
                <SelectItem value="mla">MLA</SelectItem>
                <SelectItem value="chicago">Chicago</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
              {error}
            </div>
          )}

          <ScrollArea className="flex-1 -mr-3 pr-3">
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-3 border border-gray-100 rounded-lg animate-pulse">
                    <div className="h-3.5 bg-gray-100 rounded w-3/4 mb-2"></div>
                    <div className="h-2.5 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredCitations.length > 0 ? (
              <div className="space-y-3 pb-8">
                {filteredCitations.map((citation) => {
                  const Icon =
                    typeIcons[citation.type as keyof typeof typeIcons] ||
                    FileText;
                  return (
                    <div
                      key={citation.id || `citation-${Math.random()}`}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                      <div className="flex items-start gap-3">
                        <Icon className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {citation.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {Array.isArray(citation.authors)
                              ? citation.authors.map(
                                (a: string | { firstName?: string; lastName?: string }) =>
                                  typeof a === 'string'
                                    ? a
                                    : `${a.lastName || ''}, ${a.firstName?.[0] || ''}`.trim(),
                              ).join("; ")
                              : citation.author || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                              {citation.year || "N.d."}
                            </span>
                            <span className="uppercase">{citation.type}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions Row */}
                      <div className="flex items-center justify-end gap-1 mt-3 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-gray-500 hover:text-blue-600"
                          onClick={() => copyCitation(citation)}
                          title="Copy Citation">
                          {copiedId === citation.id ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          Copy
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-gray-500 hover:text-green-600"
                          onClick={() => insertCitation(citation)}
                          title="Insert into document">
                          <Plus className="h-3 w-3 mr-1" />
                          Cite
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 ml-auto"
                          onClick={() => citation.id && deleteCitation(citation.id)}
                          title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-10 opacity-60">
                <Search className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-xs text-gray-500">No matches found</p>
              </div>
            ) : (
              <div className="text-center py-10 opacity-60">
                <BookOpen className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-xs text-gray-500">
                  Your library is empty
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="new" className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mb-4">
            <p className="text-xs text-blue-700">
              Add sources manually or by search. They will appear in your
              library.
            </p>
          </div>
          <AddCitationModal
            projectId={projectId}
            onCitationAdded={handleNewCitationAdded}
            isOpen={true} // Embedded mode
            onClose={() => { }} // No close needed in panel
            isPanel={true} // New prop to style as panel content
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
