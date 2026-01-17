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
    <div className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Award className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Authorship Certificate
          </h1>
        </div>
        <p className="text-gray-500 max-w-2xl">
          Generate verifiable proof of your work. This certificate aggregates your editing history, session time, and originality data into a professional document.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Stats (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Certificate Preview / Action Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Ready to download
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Your certificate for <span className="font-medium text-gray-900">"{projectTitle}"</span> is ready. It includes your unique QR verification code.
              </p>

              {/* Blurred Preview Thumbnail */}
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-32 bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden pointer-events-none select-none">
                  <div className="absolute inset-0 flex flex-col p-2 space-y-2 opacity-50 blur-[2px] transform scale-90 origin-top">
                    <div className="h-4 w-12 bg-gray-800 rounded mx-auto mb-2 opacity-80"></div>
                    <div className="h-1.5 w-full bg-gray-300 rounded"></div>
                    <div className="h-1.5 w-full bg-gray-300 rounded"></div>
                    <div className="h-1.5 w-3/4 bg-gray-300 rounded"></div>
                    <div className="flex-1"></div>
                    <div className="h-6 w-6 bg-indigo-200 rounded-full mx-auto opacity-50"></div>
                  </div>
                  {/* Overlay to ensure blur look */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                </div>
                <div className="text-xs text-gray-400 italic">
                  Preview blurred
                </div>
              </div>
            </div>
            <div>
              <CertificateDownloadButton
                projectId={projectId}
                projectTitle={projectTitle}
                certificateType="authorship"
              />
            </div>
          </div>

          {/* Stats Display */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Work Analysis
              </h2>
            </div>
            <AuthorshipStatsDisplay projectId={projectId} />
          </div>
        </div>

        {/* Sidebar - Value Props (Right Column) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Included in Certificate
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Time Tracking</p>
                  <p className="text-xs text-gray-500">Verified session duration</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FileEdit className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Edit History</p>
                  <p className="text-xs text-gray-500">Total manual keystroke count</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Authenticity Seal</p>
                  <p className="text-xs text-gray-500">Cryptographic verification URL</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
