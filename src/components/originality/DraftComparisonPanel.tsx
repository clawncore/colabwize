import React, { useState } from "react";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowLeft,
  Percent,
  FileDiff,
  AlertOctagon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { DraftComparisonResult } from "../../services/originalityService";

interface DraftComparisonPanelProps {
  onCompare?: (data: {
    currentDraft: string;
    previousDraft?: string;
    file?: File;
  }) => Promise<void>;
  isComparing?: boolean;
  result?: DraftComparisonResult;
  onClose?: () => void;
}

export const DraftComparisonPanel: React.FC<DraftComparisonPanelProps> = ({
  onCompare,
  isComparing = false,
  result,
  onClose,
}) => {
  const [currentDraft, setCurrentDraft] = useState("");
  const [comparisonMode, setComparisonMode] = useState<"text" | "file">("text");
  const [previousDraft, setPreviousDraft] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCompare) {
      onCompare({
        currentDraft,
        previousDraft: comparisonMode === "text" ? previousDraft : undefined,
        file: comparisonMode === "file" && file ? file : undefined,
      });
    }
  };

  // Render Result View if result is provided
  if (result) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FileDiff className="w-5 h-5 text-indigo-600" />
            Comparison Result
          </h3>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-center">
              <div className="flex justify-center mb-1">
                <Percent className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-indigo-700">
                {Math.round(result.similarityScore)}%
              </div>
              <div className="text-xs text-indigo-600 font-medium">
                Similarity
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-center">
              <div className="flex justify-center mb-1">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {Math.round(result.overlapPercentage)}%
              </div>
              <div className="text-xs text-blue-600 font-medium">Overlap</div>
            </div>
          </div>

          {/* Alert Status */}
          {result.isSelfPlagiarismInternal && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-800 text-sm">
                  Potential Self-Refrence
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  Significant overlap detected. Ensure you are not reusing old
                  work without proper citation.
                </p>
              </div>
            </div>
          )}

          {/* Analysis Text */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Analysis</h4>
            <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-md border border-gray-100">
              {result.analysis}
            </div>
          </div>

          {/* Matched Segments */}
          {result.matchedSegments && result.matchedSegments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span>Matched Segments</span>
                <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {result.matchedSegments.length}
                </span>
              </h4>
              <div className="space-y-3">
                {result.matchedSegments.map((match, idx) => (
                  <div
                    key={idx}
                    className="text-xs border border-gray-200 rounded-md p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                        {Math.round(match.similarity * 100)}% Match
                      </span>
                    </div>
                    <p className="text-gray-700 italic">"{match.segment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Input/Form View (Legacy/Fallback)
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-indigo-600" />
          Draft Comparison Guard
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Compare two versions to check for self-plagiarism or accidental reuse.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Current Draft Input */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Current Draft (New Version)
          </label>
          <Textarea
            value={currentDraft}
            onChange={(e) => setCurrentDraft(e.target.value)}
            placeholder="Paste your current draft here..."
            className="min-h-[200px] font-mono text-sm resize-y"
            required
            minLength={50}
          />
        </div>

        {/* Comparison Source Selection */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center gap-4 border-b border-gray-200 pb-2">
            <label className="text-sm font-semibold text-gray-700">
              Compare Against:
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={comparisonMode === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setComparisonMode("text")}
                className={
                  comparisonMode === "text"
                    ? "bg-indigo-600 text-white"
                    : "bg-blue-400 text-white"
                }>
                Paste Text
              </Button>
              <Button
                type="button"
                variant={comparisonMode === "file" ? "default" : "outline"}
                size="sm"
                onClick={() => setComparisonMode("file")}
                className={
                  comparisonMode === "file"
                    ? "bg-indigo-600 text-white"
                    : "bg-blue-400 text-white"
                }>
                Upload File
              </Button>
            </div>
          </div>

          {comparisonMode === "text" ? (
            <div className="space-y-2 fade-in">
              <Textarea
                value={previousDraft}
                onChange={(e) => setPreviousDraft(e.target.value)}
                placeholder="Paste previous draft or source text here..."
                className="min-h-[150px] font-mono text-sm resize-y"
                required={comparisonMode === "text"}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-white transition-colors cursor-pointer relative fade-in">
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                accept=".txt,.md,.pdf,.docx"
                required={comparisonMode === "file"}
              />
              <div className="flex flex-col items-center gap-2 text-gray-500">
                {file ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <span className="font-medium text-gray-900">
                      {file.name}
                    </span>
                    <span className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="font-medium">
                      Click to upload previous version
                    </span>
                    <span className="text-xs">Supports PDF, DOCX, TXT</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 shadow-md hover:shadow-lg transition-all"
          disabled={
            isComparing ||
            !currentDraft ||
            (comparisonMode === "text" && !previousDraft) ||
            (comparisonMode === "file" && !file)
          }>
          {isComparing ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Comparing...
            </span>
          ) : (
            "Run Comparison Analysis"
          )}
        </Button>

        <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 p-3 rounded text-blue-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Note:</strong> Comparison is performed securely. Your data
            is processed for analysis only and not permanently stored unless you
            save the project.
          </p>
        </div>
      </form>
    </div>
  );
};
