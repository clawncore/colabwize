import React from "react";
import { AuthorshipStatsDisplay } from "./AuthorshipStatsDisplay";
import { CertificateDownloadButton } from "./CertificateDownloadButton";
import { ShieldCheck } from "lucide-react";
import { AnimatedLogo } from "../common/AnimatedLogo";

interface AuthorshipCertificateProps {
  projectId: string;
  projectTitle: string;
}

export const AuthorshipCertificate: React.FC<AuthorshipCertificateProps> = ({
  projectId,
  projectTitle,
}) => {
  const [downloadStep, setDownloadStep] = React.useState<'idle' | 'preparing' | 'signing' | 'ready'>('preparing');

  // Auto-run "preparation" on mount
  React.useEffect(() => {
    // Sequence to simulate "Fetching / Signing" on load
    const timer1 = setTimeout(() => setDownloadStep('signing'), 800);
    const timer2 = setTimeout(() => setDownloadStep('ready'), 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      <div className="bg-white w-full h-full shadow-none flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side - Visual Preview (Hero) */}
        <div className="lg:w-2/5 bg-slate-900 relative p-8 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Decor/Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400"></div>

          <div className="relative z-10 mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 mx-auto">
              {downloadStep === 'preparing' ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              ) : (
                <img src="/logo.svg" alt="CollaborateWise Logo" className="w-10 h-10" />
              )}
            </div>
            <h2 className="text-2xl font-serif text-white tracking-wide mb-2">
              {downloadStep === 'preparing' ? 'Generating Proof...' : 'Authorship Certificate'}
            </h2>
            <p className="text-blue-200 text-sm">
              {downloadStep === 'preparing' ? 'Aggregating edit logs & metadata' :
                downloadStep === 'signing' ? 'Cryptographically signing...' :
                  'Official Proof of Work based on Edit History'}
            </p>
          </div>

          {/* Certificate Preview Card - New Formal Design (Template View) */}
          <div className={`relative w-[340px] h-[240px] bg-white shadow-2xl rounded-sm transform transition-all duration-700 cursor-default flex-shrink-0 ${downloadStep === 'ready' ? 'rotate-0 scale-100 opacity-100' : 'scale-95 opacity-80'}`}>
            {/* Paper Texture & Border */}
            <div className="absolute inset-0 bg-[#fffdf5] border-8 border-double border-slate-800 m-2"></div>
            <div className="absolute inset-0 m-3 border border-yellow-600/30"></div>

            {/* Corner Accents */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-slate-800"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-slate-800"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-slate-800"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-slate-800"></div>

            <div className="relative h-full w-full p-6 flex flex-col items-center justify-between z-10">

              {/* Header */}
              <div className="text-center space-y-1">
                <p className="text-[8px] font-serif tracking-[0.2em] text-slate-600 uppercase">ColabWize Platform</p>
                <h3 className="font-serif font-bold text-slate-900 text-[10px] leading-tight tracking-wide border-b border-slate-200 pb-1 mx-4">
                  CERTIFICATE OF AUTHORSHIP AND <br /> ACADEMIC INTEGRITY
                </h3>
              </div>

              {/* Blank Name Field */}
              <div className="text-center w-full my-1">
                <div className="h-4 w-3/4 mx-auto border-b border-slate-300 mb-1"></div>
                {/* Empty line for name as requested */}
              </div>

              {/* Body Text Blocks (Skeletons) */}
              <div className="w-full text-center px-4 space-y-1">
                <div className="h-1 w-full bg-slate-100 rounded"></div>
                <div className="h-1 w-5/6 mx-auto bg-slate-100 rounded"></div>
                <div className="h-1 w-4/5 mx-auto bg-slate-100 rounded"></div>
              </div>

              {/* Stats Row Skeletons */}
              <div className="flex justify-between w-full px-6 py-1 border-t border-b border-slate-100 mt-1">
                <div className="flex flex-col items-center space-y-1">
                  <div className="h-2 w-8 bg-slate-200 rounded"></div>
                  <div className="h-1 w-10 bg-slate-100 rounded"></div>
                </div>
                <div className="flex flex-col items-center space-y-1 border-l border-slate-100 pl-4">
                  <div className="h-2 w-8 bg-slate-200 rounded"></div>
                  <div className="h-1 w-10 bg-slate-100 rounded"></div>
                </div>
                <div className="flex flex-col items-center space-y-1 border-l border-slate-100 pl-4">
                  <div className="h-2 w-8 bg-slate-200 rounded"></div>
                  <div className="h-1 w-10 bg-slate-100 rounded"></div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-2 flex justify-between items-end w-full px-2">
                {/* Sig */}
                <div className="flex flex-col items-start">
                  <div className="w-16 h-4 border-b border-slate-400 mb-0.5 font-handwriting text-[8px] text-slate-600">
                    ColabWize Logic
                  </div>
                  <span className="text-[5px] uppercase text-slate-400 tracking-wider">Authorized Signature</span>
                </div>

                {/* Seal */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-md flex items-center justify-center border-2 border-yellow-100">
                    <div className="w-8 h-8 rounded-full border border-yellow-700/30 flex items-center justify-center">
                      <div className="text-[4px] text-yellow-900 font-bold text-center leading-none">OFFICIAL<br />SEMBLANCE</div>
                    </div>
                  </div>
                  {/* Ribbon tails */}
                  <div className="absolute -bottom-2 -left-1 w-3 h-4 bg-yellow-500 -z-10 rotate-12"></div>
                  <div className="absolute -bottom-2 -right-1 w-3 h-4 bg-yellow-500 -z-10 -rotate-12"></div>
                </div>

                {/* QR */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-slate-800 p-0.5">
                    <div className="w-full h-full bg-white opacity-90 grid grid-cols-4 gap-0.5">
                      {/* Mock QR pattern */}
                      {[...Array(16)].map((_, i) => <div key={i} className={`bg-slate-900 ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>)}
                    </div>
                  </div>
                  <span className="text-[5px] uppercase text-slate-400 tracking-wider mt-0.5">Scan to Verify</span>
                </div>
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
              {downloadStep === 'ready' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Ready to Issue
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                  Preparing...
                </span>
              )}
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
                  // Pass loading state down based on initial prep
                  disabled={downloadStep !== 'ready'}
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
