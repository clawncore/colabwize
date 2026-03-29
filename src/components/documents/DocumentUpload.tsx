import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../../services/documentService";
import { GoogleDriveService } from "../../services/googleDriveService";
import { useProfile } from "../../hooks/useProfile";
import { GoogleDriveIcon } from "../common/GoogleDriveIcon";
import { Loader2, ExternalLink } from "lucide-react";
import { OneDriveIcon } from "../common/OneDriveIcon";
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
        fullText += "\n";
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
  const { profile: user, loading: isProfileLoading } = useProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"local" | "google-drive" | "onedrive">("local");
  const [isNotLinked, setIsNotLinked] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Cloud library states
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

  useEffect(() => {
    if (isProfileLoading) return;

    setFile(null);
    setTitle("");
    setDescription("");
    setSelectedItem(null);
    setDocumentContent("");
    setPdfPreviewUrl(null);
    setIsNotLinked(false);
    setError(null);
    
    if (activeTab === "google-drive") {
      if (!user?.google_access_token) {
        setIsNotLinked(true);
        return;
      }
      fetchGoogleDriveLibrary();
    }
  }, [activeTab, user, isProfileLoading]);

  // Listen for Google Drive OAuth popup callback
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_CONNECTED') {
        setIsNotLinked(false);
        setError(null);
        // Refresh profile so google_access_token is available
        window.location.reload();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectGoogleDrive = async () => {
    try {
      const url = await GoogleDriveService.getConnectUrl();
      window.open(url, 'google-drive-connect', 'width=600,height=700,popup=yes');
    } catch (err) {
      console.error('Failed to get Google Drive connect URL:', err);
      setError('Failed to initiate Google Drive connection.');
    }
  };

  const fetchGoogleDriveLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const items = await GoogleDriveService.listFiles();
      setLibraryItems(items);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch Google Drive files.");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setTitle(item.name.replace(/\.[^/.]+$/, ""));
    setDocumentContent(`[Google Drive File Preview]\n\nName: ${item.name}\nMIME Type: ${item.mimeType}\nModified: ${new Date(item.modifiedTime).toLocaleString()}`);
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
    if (file) {
      readDocumentContent(file);
    } else {
      setDocumentContent("");
      setPdfPreviewUrl(null);
    }
  }, [file, readDocumentContent]);

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

    if (activeTab === "google-drive" && !selectedItem) {
      setError("Please select a file from Google Drive");
      return;
    }

    if (activeTab === "onedrive") {
      setError("OneDrive integration is coming soon.");
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
      } else if (activeTab === "google-drive") {
        if (projectId) {
          result = await GoogleDriveService.importFile(
            projectId,
            selectedItem.id
          );
        } else {
          result = await GoogleDriveService.createProject(
            selectedItem.id,
            title,
            description,
            workspaceId
          );
        }
      } else {
        throw new Error("Invalid source");
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
        {projectId ? "Import Document to Project" : "Upload New Document"}
      </h2>

      <div className="flex space-x-2 mb-8 border-b pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("local")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-md font-medium text-sm transition-colors border-b-2 ${
              activeTab === "local" ? "border-blue-600 text-blue-600 bg-blue-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span>Local PC</span>
          </button>
          
          <button
            onClick={() => setActiveTab("google-drive")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-md font-medium text-sm transition-colors border-b-2 ${
              activeTab === "google-drive" ? "border-blue-600 text-blue-600 bg-blue-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <GoogleDriveIcon className="w-4 h-4" />
            <span>Google Drive</span>
          </button>
          
          <button
            onClick={() => setActiveTab("onedrive")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-md font-medium text-sm transition-colors border-b-2 ${
              activeTab === "onedrive" ? "border-blue-700 text-blue-800 bg-blue-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <OneDriveIcon className="w-4 h-4" />
            <span>OneDrive</span>
          </button>
        </div>



      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex items-center justify-between gap-3">
          <span>{error}</span>
          {isNotLinked && (
            <button
              onClick={() => navigate("/dashboard/settings/account")}
              className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Connect in Settings
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
          Document uploaded successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Document Details */}
        <div className="flex flex-col h-[500px]">
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
              rows={2}
            />
          </div>

          {activeTab === "local" && (
            <div className="flex flex-col flex-1 pb-4 overflow-y-auto pr-2">


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

          {activeTab === "google-drive" && (
            <div className={`flex flex-col flex-1 border rounded-lg bg-gray-50 mb-4 ${isNotLinked ? 'min-h-[250px]' : 'min-h-0 overflow-hidden'}`}>
              {isNotLinked ? (
                <div className="flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: '250px' }}>
                  <GoogleDriveIcon width={48} height={48} className="mb-4" />
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Connect Google Drive</h3>
                  <p className="text-sm text-gray-500 mb-5 max-w-[280px]">
                    Grant one-time access so ColabWize can browse your Drive documents. You'll stay on this page.
                  </p>
                  <button
                    type="button"
                    onClick={handleConnectGoogleDrive}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm cursor-pointer z-10"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Connect & Browse
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 border-b bg-white">
                    <h3 className="text-sm font-semibold flex items-center">
                      Select a document from Google Drive
                    </h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {isLoadingLibrary ? (
                      <div className="flex justify-center items-center h-full p-8 text-gray-400">
                        <Loader2 className="animate-spin h-6 w-6 mr-2" />
                        Loading library...
                      </div>
                    ) : libraryItems.length === 0 ? (
                      <div className="text-sm text-gray-500 text-center py-10">
                        No documents found in your library.
                      </div>
                    ) : (
                      libraryItems.map((item, idx) => {
                        const isSelected = selectedItem && selectedItem.id === item.id;
                        
                        return (
                          <div 
                            key={item.id || idx}
                            onClick={() => handleItemSelect(item)}
                            className={`p-3 rounded-md border cursor-pointer transition-colors ${
                              isSelected 
                                ? 'bg-blue-50 border-blue-400' 
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-sm text-gray-900 line-clamp-2">{item.name || "Untitled"}</div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-1">{new Date(item.modifiedTime).toLocaleDateString()}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "onedrive" && (
            <div className="flex flex-col items-center justify-center flex-1 border rounded-lg bg-gray-50 mb-4 p-8 text-center">
              <OneDriveIcon className="w-12 h-12 mb-4 opacity-40" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">OneDrive Coming Soon</h3>
              <p className="text-sm text-gray-500">We're working on making OneDrive integration as smooth as possible.</p>
            </div>
          )}



          {/* Upload Button at the bottom of left column */}
          <div className="mt-auto pt-2 border-t">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || (activeTab === "local" && (!file || !title.trim())) || (activeTab === "google-drive" && !selectedItem)}
              className={`w-full py-2.5 px-4 rounded-md text-white font-medium transition-colors ${
                isUploading || (activeTab === "local" && (!file || !title.trim())) || (activeTab === "google-drive" && !selectedItem)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isUploading
                ? "Uploading..."
                : projectId
                  ? "Update Document"
                : activeTab === "local" ? "Upload Document" : `Import Document from ${activeTab === 'google-drive' ? 'Google Drive' : 'OneDrive'}`
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
            ) : activeTab === "google-drive" && selectedItem ? (
              <div className="whitespace-pre-wrap font-sans text-sm bg-white p-6 rounded shadow-sm min-h-full leading-relaxed">
                {documentContent}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 flex-col space-y-3">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p>{activeTab === "local" ? "Upload a document to see preview here" : `Select a document from ${activeTab === "google-drive" ? "Google Drive" : "OneDrive"} to preview`}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
