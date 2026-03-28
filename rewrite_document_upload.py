import re

new_content = """import React, { useState, useEffect } from "react";
import { documentService } from "../../services/documentService";
import { zoteroService } from "../../services/zoteroService";
import { MendeleyService } from "../../services/mendeleyService";
import { useUser } from "../../services/useUser";
import ZoteroIcon from "../common/ZoteroIcon";
import MendeleyIcon from "../common/MendeleyIcon";
import JSZip from "jszip";

interface DocumentUploadProps {
  onUploadSuccess?: (project: any) => void;
  projectId?: string;
  workspaceId?: string;
}

const extractTextFromDocx = async (file: File): Promise<string> => {
  try {
    const zip = new JSZip();
    const content = await zip.loadAsync(file);
    const documentXml = await content.file("word/document.xml")?.async("string");

    if (documentXml) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(documentXml, "text/xml");
      const paragraphs = xmlDoc.getElementsByTagName("w:p");
      let fullText = "";

      for (let i = 0; i < paragraphs.length; i++) {
        const texts = paragraphs[i].getElementsByTagName("w:t");
        for (let j = 0; j < texts.length; j++) {
          if (texts[j].textContent) {
            fullText += texts[j].textContent;
          }
        }
        fullText += "\\n";
      }
      return fullText;
    }
    return "Could not extract text from document.";
  } catch (err) {
    console.error("Error parsing DOCX:", err);
    return "Error reading document content. Please continue with upload.";
  }
};

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadSuccess,
  projectId,
  workspaceId,
}) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"local" | "zotero" | "mendeley">("local");
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // External library states
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Preview states
  const [documentContent, setDocumentContent] = useState<string>("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const isSubmittingRef = React.useRef(false);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  // Handle Tab Switching
  useEffect(() => {
    setFile(null);
    setTitle("");
    setDescription("");
    setSelectedItem(null);
    setDocumentContent("");
    setPdfPreviewUrl(null);
    setError(null);
    
    if (activeTab === "zotero") {
      if (!user?.zotero_user_id) {
        setError("Zotero account not linked. Please connect Zotero in Account Settings.");
        return;
      }
      fetchZoteroLibrary();
    } else if (activeTab === "mendeley") {
      if (!user?.mendeley_access_token) {
        setError("Mendeley account not linked. Please connect Mendeley in Account Settings.");
        return;
      }
      fetchMendeleyLibrary();
    }
  }, [activeTab, user]);

  const fetchZoteroLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const items = await zoteroService.getLibrary();
      // Filter out notes/attachments if needed, keep top-level items
      const mainItems = items.filter((i: any) => i.data.itemType !== "attachment" && i.data.itemType !== "note");
      setLibraryItems(mainItems);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch Zotero library.");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const fetchMendeleyLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const items = await MendeleyService.getLibrary();
      setLibraryItems(items);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch Mendeley library.");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleItemSelect = (item: any, source: "zotero" | "mendeley") => {
    setSelectedItem(item);
    
    if (source === "zotero") {
      const displayTitle = item.data.title || "Untitled Reference";
      setTitle(displayTitle);
      setDescription(item.data.abstractNote || "");
      
      const authors = item.data.creators?.map((c: any) => `${c.firstName || ''} ${c.lastName || ''}`.trim()).join(", ") || "Unknown Authors";
      const year = item.data.date ? new Date(item.data.date).getFullYear() : "N/A";
      
      setDocumentContent(
        `[Zotero Reference Preview]\\n\\nTitle: ${displayTitle}\\nAuthors: ${authors}\\nYear: ${year}\\nItem Type: ${item.data.itemType}\\n\\nAbstract:\\n${item.data.abstractNote || "No abstract available."}`
      );
    } else if (source === "mendeley") {
      const displayTitle = item.title || "Untitled Reference";
      setTitle(displayTitle);
      setDescription(item.abstract || "");
      
      const authors = item.authors?.map((a: any) => `${a.first_name || ''} ${a.last_name || ''}`.trim()).join(", ") || "Unknown Authors";
      
      setDocumentContent(
        `[Mendeley Reference Preview]\\n\\nTitle: ${displayTitle}\\nAuthors: ${authors}\\nYear: ${item.year || 'N/A'}\\nItem Type: ${item.type}\\n\\nAbstract:\\n${item.abstract || "No abstract available."}`
      );
    }
  };

  // Function to read and display file content (Local approach)
  const readDocumentContent = React.useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;
    setDocumentContent("");
    setPdfPreviewUrl(null);

    if (
      selectedFile.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      setDocumentContent("Extracting text preview...");
      const text = await extractTextFromDocx(selectedFile);
      setDocumentContent(text);
    } else if (selectedFile.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentContent((e.target?.result as string) || "");
      };
      reader.readAsText(selectedFile);
    } else {
      setDocumentContent(
        "Preview not available for this file type. File will be processed after upload."
      );
    }
  }, []);

  useEffect(() => {
    if (activeTab === "local") {
      if (file) {
        readDocumentContent(file);
      } else {
        setDocumentContent("");
        setPdfPreviewUrl(null);
      }
    }
  }, [file, activeTab, readDocumentContent]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/rtf",
        "application/vnd.oasis.opendocument.text",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Please upload a DOCX, TXT, RTF, or ODT file.");
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      setFile(selectedFile);
      setError(null);

      if (!title) {
        const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(fileNameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;

    if (activeTab === "local" && !file) {
      setError("Please select a document to upload");
      return;
    }
    
    if ((activeTab === "zotero" || activeTab === "mendeley") && !selectedItem) {
      setError(`Please select a document from ${activeTab === "zotero" ? "Zotero" : "Mendeley"}`);
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for your document");
      return;
    }

    isSubmittingRef.current = true;
    setIsUploading(true);
    setError(null);

    try {
      let result;
      
      if (activeTab === "local") {
        result = await documentService.uploadDocument(
          file!,
          title,
          description,
          workspaceId,
          null
        );
      } else {
        // Zotero or Mendeley import
        const contentBlock = {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: documentContent || `Imported from ${activeTab === 'zotero' ? 'Zotero' : 'Mendeley'}`,
                },
              ],
            },
          ],
        };
        
        result = await documentService.createProject(
          title,
          description,
          contentBlock,
          "",
          workspaceId,
          activeTab // This sets linked_library to "zotero" or "mendeley"
        );
      }

      if (result.success && result.data) {
        setSuccess(true);
        setFile(null);
        setSelectedItem(null);
        setTitle("");
        setDescription("");

        if (onUploadSuccess) {
          onUploadSuccess(result.data);
        }

        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      setError("An error occurred during upload");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="w-full p-6 bg-white">
      <h2 className="text-xl font-semibold mb-6">
        {projectId ? "Update Document" : "Upload New Document"}
      </h2>

      {!projectId && (
        <div className="flex space-x-2 mb-8 border-b pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("local")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-md font-medium text-sm transition-colors border-b-2 ${
              activeTab === "local" ? "border-blue-600 text-blue-600 bg-blue-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span>Upload New Document</span>
          </button>
          
          <button
            onClick={() => setActiveTab("zotero")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-md font-medium text-sm transition-colors border-b-2 ${
              activeTab === "zotero" ? "border-red-600 text-red-600 bg-red-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ZoteroIcon className="w-4 h-4" />
            <span>Import from Zotero Library</span>
          </button>
          
          <button
            onClick={() => setActiveTab("mendeley")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-md font-medium text-sm transition-colors border-b-2 ${
              activeTab === "mendeley" ? "border-blue-700 text-blue-800 bg-blue-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <MendeleyIcon width={16} height={16} />
            <span>Import from Mendeley Library</span>
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
          Document uploaded successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Upload details / Selection */}
        <div className="flex flex-col h-[500px]">
          {activeTab === "local" && (
            <div className="flex flex-col flex-1 pb-4 overflow-y-auto pr-2">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document title"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter document description (optional)"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document File *
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16">
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.6 5.6 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        DOCX, TXT, RTF, ODT (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".docx,.txt,.rtf,.odt"
                      required={!projectId}
                    />
                  </label>
                </div>

                {file && (
                  <div className="mt-2 text-sm text-gray-600 font-medium">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab === "zotero" || activeTab === "mendeley") && (
            <div className="flex flex-col flex-1 min-h-0 border rounded-lg bg-gray-50 overflow-hidden mb-4">
              <div className="p-3 border-b bg-white">
                <h3 className="text-sm font-semibold flex items-center">
                  Select a document from {activeTab === "zotero" ? "Zotero" : "Mendeley"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">This will implicitly link this project's library exclusively to {activeTab === "zotero" ? "Zotero" : "Mendeley"}.</p>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {isLoadingLibrary ? (
                  <div className="flex justify-center items-center h-full p-8 text-gray-400">
                    <svg className="animate-spin h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading library...
                  </div>
                ) : libraryItems.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-10">
                    No documents found in your library.
                  </div>
                ) : (
                  libraryItems.map((item, idx) => {
                    const isMendeley = activeTab === "mendeley";
                    const id = isMendeley ? item.id : item.key;
                    const itemTitle = isMendeley ? item.title : item.data.title;
                    const itemAuthors = isMendeley 
                      ? item.authors?.map((a: any) => `${a.first_name || ''} ${a.last_name || ''}`).join(', ') 
                      : item.data.creators?.map((c: any) => `${c.firstName || ''} ${c.lastName || ''}`).join(', ');
                    
                    const isSelected = selectedItem && (isMendeley ? selectedItem.id === id : selectedItem.key === id);
                    
                    return (
                      <div 
                        key={id || idx}
                        onClick={() => handleItemSelect(item, activeTab)}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          isSelected 
                            ? (isMendeley ? 'bg-blue-50 border-blue-400' : 'bg-red-50 border-red-400') 
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm text-gray-900 line-clamp-2">{itemTitle || "Untitled"}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{itemAuthors || "Unknown authors"}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Upload Button at the bottom of left column */}
          <div className="mt-auto pt-2 border-t">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || (activeTab === "local" && (!file || !title.trim())) || (activeTab !== "local" && !selectedItem)}
              className={`w-full py-2.5 px-4 rounded-md text-white font-medium transition-colors ${
                isUploading || (activeTab === "local" && (!file || !title.trim())) || (activeTab !== "local" && !selectedItem)
                  ? "bg-gray-400 cursor-not-allowed"
                  : activeTab === "zotero" ? "bg-red-600 hover:bg-red-700" : activeTab === "mendeley" ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isUploading
                ? "Uploading..."
                : projectId
                  ? "Update Document"
                  : activeTab === "local" ? "Upload Document" : `Import Document from ${activeTab === 'zotero' ? 'Zotero' : 'Mendeley'}`
              }
            </button>
          </div>
        </div>

        {/* Right column - Document preview */}
        <div className="flex flex-col h-[500px]">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Document Preview
          </h3>
          <div className="border border-gray-300 rounded-lg p-4 flex-1 overflow-y-auto bg-gray-50 shadow-inner">
            {activeTab === "local" && file ? (
              pdfPreviewUrl ? (
                <iframe
                  src={`${pdfPreviewUrl}#toolbar=0&navpanes=0`}
                  title="PDF Preview"
                  className="w-full h-full border-none rounded bg-white shadow-sm"
                />
              ) : (
                <div className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded shadow-sm min-h-full">
                  {documentContent || "Loading document content..."}
                </div>
              )
            ) : (activeTab === "zotero" || activeTab === "mendeley") && selectedItem ? (
              <div className="whitespace-pre-wrap font-sans text-sm bg-white p-6 rounded shadow-sm min-h-full leading-relaxed">
                {documentContent}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 flex-col space-y-3">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p>{activeTab === "local" ? "Upload a document to see preview here" : `Select a document from ${activeTab === "zotero" ? "Zotero" : "Mendeley"} to preview`}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
"""

with open("/home/clawncore/Desktop/colabwize/src/components/documents/DocumentUpload.tsx", "w") as f:
    f.write(new_content)

print("Rewrite of DocumentUpload.tsx complete.")
