import React, { useState, useCallback } from "react";
import { documentService } from "../../services/documentService";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContentReady: (content: string, title: string, filename?: string) => void;
  onDocumentUploaded?: (projectId: string, title: string) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onContentReady,
  onDocumentUploaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [content, setContent] = useState("");
  const [filename, setFilename] = useState("");
  const [title, setTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setFilename(file.name);
    setTitle(fileNameWithoutExt); // Auto-fill title with filename
    setUploadedFile(file);
    setContent(""); // Clear any pasted content
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a document title");
      return;
    }

    try {
      // setIsUploading(true);

      // Check if user uploaded a file or pasted text
      if (uploadedFile) {
        // Use backend file upload service for proper parsing
        const result = await documentService.uploadDocument(
          uploadedFile,
          title,
          ""
        );

        if (result.success && result.data) {
          // The uploadDocument API already creates the project, so we don't need to trigger onContentReady
          // Instead, we'll call the onDocumentUploaded callback if provided
          resetForm();

          // Call the callback to handle navigation
          if (onDocumentUploaded) {
            onDocumentUploaded(result.data.id, result.data.title);
          } else {
            onClose();
            alert("Document uploaded successfully!");
          }
        } else {
          alert(result.error || "Failed to upload document");
        }
      } else if (content.trim()) {
        // Direct text paste - use existing flow
        onContentReady(content, title, "pasted-content.txt");
        resetForm();
      } else {
        alert("Please upload a file or paste text");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while processing your document");
    } finally {
      // setIsUploading(false);
    }
  };

  const resetForm = () => {
    onClose();
    setContent("");
    setTitle("");
    setFilename("");
    setUploadedFile(null);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            {/* Drag and Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 bg-gray-50 hover:border-indigo-400"
                }`}
            >
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Drop your document here
              </h3>
              <p className="text-gray-600 mb-4">
                or click below to browse files
              </p>

              <label className="inline-block px-6 py-3 bg-[#5B7CFA] text-white font-medium rounded-lg hover:bg-[#4F6EEA] active:bg-[#445FD8] cursor-pointer transition-colors">
                Browse Files
                <input
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>

              <p className="text-sm text-gray-500 mt-4">
                Supports: TXT, PDF, DOCX (max 100,000 characters)
              </p>
            </div>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  OR
                </span>
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Paste Text Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Your Text
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your document text here..."
                className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {content.length.toLocaleString()} characters
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim() || !title.trim()}
                  className="px-4 py-2 bg-[#5B7CFA] text-white font-medium rounded-md hover:bg-[#4F6EEA] active:bg-[#445FD8] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Create Document
                </button>
              </div>
            </div>

            {/* Current File */}
            {filename && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-semibold">✓</span>
                    <span className="text-green-900 font-medium">
                      Ready: {filename}
                    </span>
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!title.trim()}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
