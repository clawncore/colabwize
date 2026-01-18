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

              {/* Blurred Preview Thumbnail - Large */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-60 h-80 bg-white border border-gray-200 shadow-md rounded-sm overflow-hidden pointer-events-none select-none transition-transform hover:scale-[1.01]">
                  {/* Document Structure Mockup */}
                  <div className="absolute inset-0 flex flex-col p-6 space-y-4 opacity-60 blur-[3px] transform scale-100 origin-top bg-white">
                    {/* Header/Logo area */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-8 w-8 bg-indigo-900 rounded-full opacity-40"></div>
                      <div className="h-4 w-24 bg-gray-400 rounded"></div>
                    </div>

                    {/* Title */}
                    <div className="h-6 w-3/4 bg-gray-800 rounded mx-auto mb-6 opacity-80"></div>

                    {/* Body Text Mockup */}
                    <div className="space-y-3">
                      <div className="h-2 w-full bg-gray-300 rounded"></div>
                      <div className="h-2 w-full bg-gray-300 rounded"></div>
                      <div className="h-2 w-5/6 bg-gray-300 rounded"></div>
                      <div className="h-2 w-full bg-gray-300 rounded"></div>
                    </div>

                    <div className="space-y-3 mt-4">
                      <div className="h-2 w-full bg-gray-300 rounded"></div>
                      <div className="h-2 w-11/12 bg-gray-300 rounded"></div>
                      <div className="h-2 w-full bg-gray-300 rounded"></div>
                    </div>

                    {/* Seal Mockup */}
                    <div className="flex-1 flex items-end justify-center mt-8">
                      <div className="h-16 w-16 bg-indigo-100 rounded-full border-4 border-indigo-200 opacity-60"></div>
                    </div>
                  </div>

                  {/* Secure Overlay */}
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-gray-100">
                      <span className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3 mr-1.5" />
                        Preview Hidden
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 italic">
                  Complete certificate generated
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
