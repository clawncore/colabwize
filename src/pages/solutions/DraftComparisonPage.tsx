import React, { useState } from "react";
import Layout from "../../components/Layout";
import { DraftComparisonPanel } from "../../components/originality/DraftComparisonPanel";
import {
  DraftComparisonService,
  ComparisonResult,
} from "../../services/draftComparisonService";
import { AlertCircle, CheckCircle } from "lucide-react";

export const DraftComparisonPage: React.FC = () => {
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (data: {
    currentDraft: string;
    previousDraft?: string;
    file?: File;
  }) => {
    setIsComparing(true);
    setError(null);
    setResult(null);

    try {
      const comparisonData = await DraftComparisonService.compareDrafts(
        "temp-session", // Dummy ID if not used for DB lookup
        data.currentDraft,
        { previousDraft: data.previousDraft, file: data.file }
      );
      setResult(comparisonData);
    } catch (err: any) {
      setError(err.message || "Comparison failed");
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Draft Comparison Guard
          </h1>
          <p className="text-gray-600 mt-2">
            Verify authenticity by comparing your current work against previous
            versions or sources.
          </p>
        </div>

        <DraftComparisonPanel
          onCompare={handleCompare}
          isComparing={isComparing}
        />

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6 fade-in">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                Comparison Analysis
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    result.similarityScore > 20
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                  {result.similarityScore.toFixed(1)}% Similarity
                </span>
              </h3>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-800 font-medium">{result.analysis}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Metrics</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between p-3 bg-gray-50 rounded">
                      <span>Overlap Percentage</span>
                      <span className="font-bold">
                        {result.overlapPercentage.toFixed(1)}%
                      </span>
                    </li>
                    <li className="flex justify-between p-3 bg-gray-50 rounded">
                      <span>Self-Plagiarism Risk</span>
                      <span
                        className={`font-bold ${result.isSelfPlagiarismInternal ? "text-red-600" : "text-green-600"}`}>
                        {result.isSelfPlagiarismInternal ? "DETECTED" : "LOW"}
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Matched Segments
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {result.matchedSegments.length > 0 ? (
                      result.matchedSegments.map((match, i) => (
                        <div
                          key={i}
                          className="p-3 border border-red-100 bg-red-50 rounded text-sm group hover:border-red-300 transition-colors">
                          <p className="text-gray-800 line-clamp-2">
                            "{match.segment}"
                          </p>
                          <div className="mt-1 flex justify-between text-xs text-red-600 font-medium opacity-75">
                            <span>
                              Match Score: {(match.similarity * 100).toFixed(0)}
                              %
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-sm p-4 text-center">
                        No significant matching segments found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
