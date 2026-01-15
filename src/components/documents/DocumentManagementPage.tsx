import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentUpload, DocumentList } from ".";

const DocumentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"list" | "upload">("list");
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const handleUploadSuccess = (project: any) => {
    setSelectedProject(project);
    setActiveTab("list");
    // Navigate to editor with the newly uploaded project
    navigate(`/dashboard/editor/${project.id}`);
  };

  const handleProjectSelect = (project: any) => {
    setSelectedProject(project);
    // Navigate to editor with the selected project
    navigate(`/dashboard/editor/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-8 py-8">
        <div className="mb-8 text-left">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Management
          </h1>
          <p className="text-gray-600">
            Upload your documents for originality scanning and analysis
          </p>
        </div>

        <div className="bg-white overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === "list"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("list")}>
                My Documents
              </button>
              <button
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === "upload"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("upload")}>
                Upload Document
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "list" ? (
              <div>
                <DocumentList
                  onProjectSelect={handleProjectSelect}
                  displayMode="grid"
                />
                {selectedProject && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <h3 className="font-medium text-gray-900 mb-2">
                      Selected Document: {selectedProject.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {selectedProject.description || "No description provided"}
                    </p>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                        Run Originality Scan
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <DocumentUpload onUploadSuccess={handleUploadSuccess} />
                {selectedProject && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-md">
                    <p className="text-blue-800">
                      Document uploaded successfully! You can now view it in "My
                      Documents" or switch to the analysis features.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentManagementPage;
