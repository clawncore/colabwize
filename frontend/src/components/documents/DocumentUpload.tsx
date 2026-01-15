import React, { useState, useEffect } from "react";
import { documentService } from "../../services/documentService";
import JSZip from "jszip";

interface DocumentUploadProps {
  onUploadSuccess?: (project: any) => void;
  projectId?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadSuccess,
  projectId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/rtf",
        "application/vnd.oasis.opendocument.text",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Please upload a PDF, DOCX, TXT, RTF, or ODT file");
        return;
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      setFile(selectedFile);
      setError(null);

      // Auto-populate title from filename if not already set
      if (!title) {
        const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(fileNameWithoutExt);
      }
    }
  };

  const isSubmittingRef = React.useRef(false); // Ref to strictly prevent double submission

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current) return; // Prevent double submission

    if (!file) {
      setError("Please select a document to upload");
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
      const result = await documentService.uploadDocument(
        file,
        title,
        description
      );

      if (result.success && result.data) {
        setSuccess(true);
        setFile(null);
        setTitle("");
        setDescription("");

        if (onUploadSuccess) {
          onUploadSuccess(result.data);
        }

        // Reset success message after 3 seconds
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

  const [documentContent, setDocumentContent] = useState<string>("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Cleanup object URL on unmount or when file changes
  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  const extractTextFromDocx = async (file: File): Promise<string> => {
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      const documentXml = await content
        .file("word/document.xml")
        ?.async("string");

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

  // Function to read and display file content
  const readDocumentContent = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Reset states
    setDocumentContent("");
    setPdfPreviewUrl(null);

    if (selectedFile.type === "application/pdf") {
      const url = URL.createObjectURL(selectedFile);
      setPdfPreviewUrl(url);
    } else if (
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
  };

  // Update document content when file changes
  useEffect(() => {
    if (file) {
      readDocumentContent(file);
    } else {
      setDocumentContent("");
      setPdfPreviewUrl(null);
    }
  }, [file]);

  return (
    <div className="w-full p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4">
        {projectId ? "Update Document" : "Upload New Document"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          Document uploaded successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column - Upload details */}
        <div>
          <form onSubmit={handleSubmit}>
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
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, TXT, RTF, ODT (MAX. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt,.rtf,.odt"
                    required={!projectId}
                  />
                </label>
              </div>

              {file && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                  MB)
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isUploading || !file || !title.trim()}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isUploading || !file || !title.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}>
              {isUploading
                ? "Uploading..."
                : projectId
                  ? "Update Document"
                  : "Upload Document"}
            </button>
          </form>
        </div>

        {/* Right column - Document preview */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Document Preview
          </h3>
          <div className="border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
            {file ? (
              pdfPreviewUrl ? (
                <iframe
                  src={pdfPreviewUrl}
                  title="PDF Preview"
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="whitespace-pre-wrap">
                  {documentContent || "Loading document content..."}
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Upload a document to see preview here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
