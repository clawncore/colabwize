import React from "react";
import { AuthorshipStatsDisplay } from "./AuthorshipStatsDisplay";
import { CertificateDownloadButton } from "./CertificateDownloadButton";
import { Award, ShieldCheck } from "lucide-react";

interface AuthorshipCertificateProps {
  projectId: string;
  projectTitle: string;
}

export const AuthorshipCertificate: React.FC<AuthorshipCertificateProps> = ({
  projectId,
  projectTitle,
}) => {
  return (
    <div className="max-w-6xl mx-auto p-6 h-screen flex flex-col justify-center items-center">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden border border-gray-200 flex flex-col lg:flex-row h-[600px]">
        {/* Left Side - Visual Preview (Hero) */}
        <div className="lg:w-2/5 bg-slate-900 relative p-8 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Decor/Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400"></div>

          <div className="relative z-10 mb-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 mb-4 mx-auto">
              <Award className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-serif text-white tracking-wide mb-2">Authorship Certificate</h2>
            <p className="text-blue-200 text-sm">Official Proof of Work based on Edit History</p>
          </div>

          {/* Certificate Preview Card */}
          <div className="relative w-64 bg-white shadow-2xl rounded-sm p-1 transform rotate-1 transition-transform hover:rotate-0 duration-500 cursor-default">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-200 rounded-full shadow-inner z-20"></div>
            <div className="h-full w-full border-4 border-double border-gray-100 p-4 flex flex-col items-center bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
              <div className="w-8 h-8 mb-2 opacity-80">
                <ShieldCheck className="w-full h-full text-indigo-900" />
              </div>
              <div className="w-3/4 h-1 bg-gray-800 mb-4"></div>
              <div className="w-full space-y-2 opacity-60">
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6 mx-auto"></div>
                <div className="h-2 bg-gray-200 rounded w-4/6 mx-auto"></div>
              </div>
              <div className="mt-auto pt-4 flex justify-between w-full opacity-60">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-900/30"></div>
                <div className="w-16 h-8 border-b border-gray-400"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Stats & Actions */}
        <div className="lg:w-3/5 p-8 flex flex-col bg-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{projectTitle}</h1>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Verified & Ready for Issue
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Ready
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="prose prose-sm text-gray-500 mb-6">
              <p>
                This certificate serves as an immutable record of the creation process.
                It aggregates edit logs, session metadata, and keystroke dynamics to prove original authorship.
              </p>
            </div>

            {/* Stats Component Integration */}
            <div className="mb-6">
              <AuthorshipStatsDisplay projectId={projectId} />
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs text-gray-400">
                Includes: Timestamp, Edit Count, Auth Signature
              </div>
              <div className="flex-shrink-0">
                <CertificateDownloadButton
                  projectId={projectId}
                  projectTitle={projectTitle}
                  certificateType="authorship"
                  variant="primary"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
