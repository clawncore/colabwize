import React from "react";
import { ChevronDown, Save, FileText, CheckCircle2 } from "lucide-react";

import { StoredCitation as Source } from "./SourceDetailPanel";

interface LiteratureMatrixProps {
    sources: Source[];
}

export const LiteratureMatrix: React.FC<LiteratureMatrixProps> = ({ sources }) => {
    const themes = ["Gap", "Methodology", "Result"];

    // Group sources by theme for a "Theme Card" layout if not using a grid
    // But for a "Matrix", a grid is best: Rows = Sources, Cols = Themes

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600" />
                        Literature Matrix
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                            {sources.length} Sources Analyzed
                        </span>
                    </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                    Synthesize your research by identifying recurring patterns across your bibliography.
                    Use this grid to identify what is missing (Gaps) and what is established (Methodology/Results).
                </p>
            </div>

            {/* Matrix Table */}
            <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                <div className="min-w-[800px] bg-white rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="sticky left-0 bg-slate-50 z-10 p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-200 w-1/4">Research Source</th>
                                {themes.map(theme => (
                                    <th key={theme} className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-200">
                                        {theme}
                                    </th>
                                ))}
                                <th className="p-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qualitative Synthesis</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sources.map((source, idx) => (
                                <tr key={source.id || idx} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'}`}>
                                    <td className="sticky left-0 bg-inherit z-10 p-4 border-r border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug mb-1">{source.title}</h4>
                                        <p className="text-[10px] text-slate-500 font-medium italic">{source.author}, {source.year}</p>
                                    </td>

                                    {themes.map(theme => {
                                        const isTagged = source.themes?.includes(theme);
                                        return (
                                            <td key={theme} className="p-4 text-center border-r border-slate-100">
                                                <div className="flex justify-center">
                                                    {isTagged ? (
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${theme === 'Gap' ? 'bg-orange-100 text-orange-600' :
                                                            theme === 'Methodology' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-emerald-100 text-emerald-600'
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
                                            {source.matrix_notes || "No synthesis notes added yet..."}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend / Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium px-8">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-orange-200"></span> Missing Research Gap
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-blue-200"></span> Methodology / Process
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-emerald-200"></span> Findings & Results
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
