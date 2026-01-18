import React from "react";
import { AuthorshipStatsDisplay } from "./AuthorshipStatsDisplay";
import { CertificateDownloadButton } from "./CertificateDownloadButton";
import { Award, Clock, FileEdit, ShieldCheck } from "lucide-react";

interface AuthorshipCertificateProps {
  projectId: string;
  projectTitle: string;
}

export const AuthorshipCertificate: React.FC<AuthorshipCertificateProps> = ({
  projectId,
  projectTitle,
}) => {
  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 h-screen overflow-hidden flex flex-col">
      {/* Header - Ultra Compact */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="p-1 bg-indigo-100 rounded-md">
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            Authorship Certificate
          </h1>
        </div>
        <p className="text-xs text-gray-500 ml-8">
          Verifiable proof of your work.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* Main Content - Preview and Action (Left 2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Action Card - Ultra Compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900">
                Ready to download
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Certificate for <span className="font-medium">"{projectTitle}"</span> is ready.
              </p>
              <CertificateDownloadButton
                projectId={projectId}
                projectTitle={projectTitle}
                certificateType="authorship"
                variant="primary"
              />
            </div>


          </div>

          {/* Stats Display (Moved here from sidebar) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <AuthorshipStatsDisplay projectId={projectId} />
          </div>


        </div>

        {/* Sidebar - Value Props and Stats (Right Column) */}
        <div className="space-y-3 flex flex-col h-full overflow-y-auto pr-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex-shrink-0">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              Included
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">Verified Time</span>
              </li>
              <li className="flex items-center gap-2">
                <FileEdit className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">Edit History</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-600">Authentic Seal</span>
              </li>
            </ul>
          </div>

          {/* Certificate Preview - Moved to Sidebar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center justify-center flex-1  min-h-[220px]">
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4 w-full border-b border-gray-100 pb-2">
              Document Preview
            </h3>
            <div className="relative w-32 h-44 bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden hover:scale-105 transition-transform origin-center group cursor-default shadow-md">
              <div className="absolute inset-0 flex flex-col p-3 space-y-2 bg-white">
                <div className="flex justify-between items-start mb-1">
                  <div className="h-4 w-4 bg-indigo-900 rounded-full"></div>
                  <div className="h-2 w-10 bg-gray-400 rounded"></div>
                </div>
                <div className="h-3 w-3/4 bg-gray-800 rounded mx-auto mb-3"></div>
                <div className="space-y-1.5">
                  <div className="h-1 w-full bg-gray-300 rounded"></div>
                  <div className="h-1 w-full bg-gray-300 rounded"></div>
                  <div className="h-1 w-full bg-gray-300 rounded"></div>
                  <div className="h-1 w-5/6 bg-gray-300 rounded"></div>
                </div>
                <div className="space-y-1.5 mt-2">
                  <div className="h-1 w-full bg-gray-300 rounded"></div>
                  <div className="h-1 w-11/12 bg-gray-300 rounded"></div>
                </div>
                <div className="flex-1 flex items-end justify-center mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="h-8 w-8 bg-indigo-100 rounded-full border-2 border-indigo-200 text-indigo-300 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-colors pointer-events-none" />
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};
