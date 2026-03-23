import React, { useState } from "react";
import {
  ChevronDown,
  Save,
  FileText,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ArrowLeft,
} from "lucide-react";
import { useEffect } from "react";
import { CitationService } from "../../services/citationService";

interface LiteratureMatrixProps {
  sources: any[];
  projectId?: string;
  onUpdateCitations?: (updatedCitations: any[]) => void;
  isAnalyzing?: boolean;
  userPlan?: string;
  viewMode?: "split" | "full";
  onToggleViewMode?: () => void;
}

export const LiteratureMatrix: React.FC<LiteratureMatrixProps> = ({
  sources,
  projectId,
  onUpdateCitations,
  isAnalyzing: externalIsAnalyzing = false,
  userPlan = "Free Plan",
  viewMode = "full",
  onToggleViewMode,
}) => {
  const [localIsAnalyzing, setLocalIsAnalyzing] = useState(false);
  const isAnalyzing = externalIsAnalyzing || localIsAnalyzing;

  // Handle Escape key to close full screen
  useEffect(() => {
    if (viewMode === "full" && onToggleViewMode) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onToggleViewMode();
        }
      };
      window.addEventListener("keydown", handleEsc);
      return () => window.removeEventListener("keydown", handleEsc);
    }
  }, [viewMode, onToggleViewMode]);

  const isPremium = userPlan === "Premium";

  const handleBatchAnalyze = async () => {
    if (!projectId || isAnalyzing || !isPremium) return;

    setLocalIsAnalyzing(true);
    try {
      const updated = await CitationService.batchAnalyzeCitations(projectId);
      if (onUpdateCitations && updated && updated.length > 0) {
        onUpdateCitations(updated);
      } else if (updated && updated.length === 0) {
        alert(
          "No citations found requiring analysis (missing abstracts or already analyzed).",
        );
      }
    } catch (err: any) {
      console.error("Batch analysis failed", err);
      alert(`Synthesis failed: ${err.message || "Unknown error"}`);
    } finally {
      setLocalIsAnalyzing(false);
    }
  };

  const themes = ["Gap", "Methodology", "Result"];

  // Group sources by theme for a "Theme Card" layout if not using a grid
  // But for a "Matrix", a grid is best: Rows = Sources, Cols = Themes

  return (
    <div
      className={`flex flex-col h-full bg-slate-50 overflow-hidden ${viewMode === "split" ? "border-l border-slate-200 shadow-xl" : ""}`}>
      {/* Header */}
      <div
        className={`${viewMode === "split" ? "p-4" : "p-6"} bg-white border-b border-slate-200`}>
        <div
          className={`flex ${viewMode === "split" ? "flex-col gap-3" : "items-center justify-between"} mb-4`}>
          <div>
            <div className="flex items-center gap-3">
              {viewMode === "full" && onToggleViewMode && (
                <button
                  onClick={onToggleViewMode}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                  title="Back to Panel">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h2
                className={`${viewMode === "split" ? "text-lg" : "text-xl"} font-bold text-slate-900 flex items-center gap-2 mb-1`}>
                <FileText className="w-5 h-5 text-teal-600" />
                Literature Matrix
              </h2>
            </div>
            {viewMode === "full" && (
              <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                Synthesize your research by identifying recurring patterns
                across your bibliography.
              </p>
            )}
          </div>

          <div
            className={`flex items-center ${viewMode === "split" ? "justify-between w-full" : "gap-3"}`}>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {sources.length} Sources
            </span>

            {projectId && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchAnalyze}
                    disabled={isAnalyzing || !isPremium}
                    className={`flex items-center gap-2 rounded-lg text-sm font-bold shadow-md transition-all ${
                      viewMode === "split" ? "p-2" : "px-4 py-2"
                    } ${
                      isPremium
                        ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 hover:scale-105"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    }`}
                    title={
                      !isPremium
                        ? "Available on Premium Plan"
                        : viewMode === "split"
                          ? "Synthesize Matrix"
                          : ""
                    }>
                    <CheckCircle2
                      className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`}
                    />
                    {viewMode === "full"
                      ? isAnalyzing
                        ? "Synthesizing..."
                        : "Synthesize Matrix"
                      : null}
                  </button>

                  {onToggleViewMode && (
                    <button
                      onClick={onToggleViewMode}
                      className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-600 transition-all hover:scale-105"
                      title={
                        viewMode === "split"
                          ? "Expand to Full Screen"
                          : "Exit Full Screen"
                      }>
                      {viewMode === "split" ? (
                        <Maximize2 className="w-5 h-5" />
                      ) : (
                        <Minimize2 className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
                {!isPremium && viewMode === "full" && (
                  <span className="text-[10px] text-orange-500 font-semibold flex items-center gap-1">
                    ✨ Premium Plan Only
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Matrix Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar">
        {viewMode === "split" ? (
          // COMPACT VIEW (Cards)
          <div className="grid grid-cols-1 gap-4">
            {sources.map((source, idx) => (
              <div
                key={source.id || idx}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:border-teal-300 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-teal-700 transition-colors">
                      {source.title || "Untitled Source"}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium italic">
                      {Array.isArray(source.authors)
                        ? source.authors.join(", ")
                        : source.author || source.authors || "Unknown Author"}
                      , {source.year || "n.d."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {themes.map((theme) => {
                    const isTagged = source.themes?.includes(theme);
                    return (
                      <div
                        key={theme}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                          isTagged
                            ? theme === "Gap"
                              ? "bg-orange-50 border-orange-200 text-orange-600"
                              : theme === "Methodology"
                                ? "bg-blue-50 border-blue-200 text-blue-600"
                                : "bg-emerald-50 border-emerald-200 text-emerald-600"
                            : "bg-slate-50 border-slate-100 text-slate-300 opacity-40"
                        }`}>
                        <CheckCircle2
                          className={`w-3 h-3 ${isTagged ? "" : "opacity-20"}`}
                        />
                        {theme}
                      </div>
                    );
                  })}
                </div>

                {source.matrix_notes && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[11px] text-slate-600 leading-relaxed italic line-clamp-2">
                      {source.matrix_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
            {sources.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-sm text-slate-400">
                  No sources added to matrix yet.
                </p>
              </div>
            )}
          </div>
        ) : (
          // FULL VIEW (Table)
          <div className="min-w-[800px] bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="sticky left-0 bg-slate-50 z-10 p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-200 w-1/4">
                    Research Source
                  </th>
                  {themes.map((theme) => (
                    <th
                      key={theme}
                      className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-200">
                      {theme}
                    </th>
                  ))}
                  <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Qualitative Synthesis
                  </th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source, idx) => (
                  <tr
                    key={source.id || idx}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/20"}`}>
                    <td className="sticky left-0 bg-inherit z-10 p-4 border-r border-slate-100">
                      <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-1">
                        {source.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium italic">
                        {source.author}, {source.year}
                      </p>
                    </td>

                    {themes.map((theme) => {
                      const isTagged = source.themes?.includes(theme);
                      return (
                        <td
                          key={theme}
                          className="p-4 text-center border-r border-slate-100">
                          <div className="flex justify-center">
                            {isTagged ? (
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                  theme === "Gap"
                                    ? "bg-orange-100 text-orange-600"
                                    : theme === "Methodology"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-emerald-100 text-emerald-600"
                                }`}>
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200 hover:border-slate-300 hover:text-slate-300 transition-colors cursor-pointer">
                                <ChevronDown className="w-4 h-4 opacity-0 hover:opacity-100" />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    <td className="p-4 align-top">
                      <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-4">
                        {source.matrix_notes ||
                          "No synthesis notes added yet..."}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend / Footer */}
      <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-orange-200"></span> Missing
            Research Gap
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-200"></span> Methodology /
            Process
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-200"></span> Findings &
            Results
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-60">
          <Save className="w-3 h-3" />
          Auto-synthesizing from bibliography
        </div>
      </div>
    </div>
  );
};
