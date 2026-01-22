import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Shield,
  Calendar,
  FileText,
  User,
} from "lucide-react";
import { apiClient } from "../../services/apiClient";
import Layout from "../../components/Layout";

interface CertificateData {
  id: string;
  isValid: boolean;
  issuedAt: string;
  recipient: string;
  projectTitle: string;
  wordCount: number;
  metadata: any;
  status: string;
}

export const VerifyCertificatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setLoading(true);
        // We need to use a public apiClient call. Assuming apiClient helper handles base URL.
        const response = await apiClient.get(`/authorship/verify/${id}`);
        setData(response.data);
      } catch (err: any) {
        setError(
          err.response?.data?.error || "Invalid or undefined certificate."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      verifyCertificate();
    }
  }, [id]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-indigo-900 p-6 text-center">
            <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h1 className="text-xl font-bold text-white">
              Authorship Verification
            </h1>
            <p className="text-indigo-200 text-sm">
              Reviewing Certificate Validity
            </p>
          </div>

          <div className="p-8">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Verifying authenticity...</p>
              </div>
            ) : error || !data ? (
              <div className="text-center py-4">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Invalid Certificate
                </h2>
                <p className="text-red-600 text-sm mb-6">{error}</p>
                <Link
                  to="/"
                  className="text-indigo-600 font-medium hover:underline">
                  Return to Home
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center">
                  <div className="bg-green-100 p-3 rounded-full mb-3">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-700">
                    Valid Certificate
                  </h2>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                    ID: {data.id}
                  </p>
                </div>

                <div className="border-t border-b border-gray-100 py-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Recipient</p>
                      <p className="font-semibold text-gray-900">
                        {data.recipient}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Project</p>
                      <p className="font-semibold text-gray-900">
                        {data.projectTitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Issued Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(data.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600">
                    This document certifies that the work was authored primarily
                    through manual effort, with{" "}
                    <strong>
                      {data.metadata?.manual_contribution_percentage || 0}%
                    </strong>{" "}
                    human contribution.
                  </p>
                </div>

                <div className="text-center pt-2">
                  <a
                    href="https://app.colabwize.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">
                    Verified by ColabWize Technology
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
