import React from "react";
import { AuthorshipStatsDisplay } from "./AuthorshipStatsDisplay";
import { CertificateDownloadButton } from "./CertificateDownloadButton";

interface AuthorshipCertificateProps {
  projectId: string;
  projectTitle: string;
}

export const AuthorshipCertificate: React.FC<AuthorshipCertificateProps> = ({
  projectId,
  projectTitle,
}) => {
  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📜 Authorship Certificate
        </h1>
        <p className="text-gray-600">
          Verify your authorship with detailed statistics and download your
          certificate
        </p>
      </div>

      {/* Download Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">
              Download Your Certificate
            </h2>
            <p className="text-indigo-100">
              Generate a professional PDF certificate proving your authorship
              with:
            </p>
            <ul className="mt-3 space-y-1 text-indigo-100">
              <li>✓ Hours of manual work documented</li>
              <li>✓ Number of manual edits tracked</li>
              <li>✓ 0% automated rewriting claim</li>
              <li>✓ QR code for verification</li>
              <li>✓ ColabWize seal of authenticity</li>
            </ul>
          </div>
          <div>
            <CertificateDownloadButton
              projectId={projectId}
              projectTitle={projectTitle}
              certificateType="authorship"
            />
          </div>
        </div>
      </div>

      {/* Statistics Display */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Authorship Statistics
          </h2>
        </div>
        <AuthorshipStatsDisplay projectId={projectId} />
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Why Authorship Certificates Matter
        </h3>
        <p className="text-blue-800 mb-4">
          In an age of AI-generated content, proving authentic authorship is
          crucial. Your certificate provides verifiable proof of:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">⏱️</div>
            <h4 className="font-semibold text-gray-900 mb-1">
              Time Investment
            </h4>
            <p className="text-sm text-gray-600">
              Documented hours spent on manual writing and editing
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">✍️</div>
            <h4 className="font-semibold text-gray-900 mb-1">Manual Edits</h4>
            <p className="text-sm text-gray-600">
              Every keystroke and revision tracked and verified
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">🔒</div>
            <h4 className="font-semibold text-gray-900 mb-1">Verification</h4>
            <p className="text-sm text-gray-600">
              QR code links to immutable proof of your work
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
