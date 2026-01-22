import React, { useState, useEffect } from "react";
import { Copy, Check, Quote, AlertTriangle } from "lucide-react";
import { StoredCitation } from "./SourceDetailPanel";
import { formatCitation, CitationStyle } from "../../utils/citationFormatter";

interface InsertCitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    source: StoredCitation;
    onInsert: (text: string, style: CitationStyle) => void;
}

export const InsertCitationModal: React.FC<InsertCitationModalProps> = ({
    isOpen,
    onClose,
    source,
    onInsert,
}) => {
    const [style, setStyle] = useState<CitationStyle>("APA");
    const [previewText, setPreviewText] = useState("");

    useEffect(() => {
        if (source) {
            setPreviewText(formatCitation(source, style, "in-text"));
        }
    }, [source, style]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Quote className="w-4 h-4 text-blue-600" />
                        Insert Citation
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                </div>

                <div className="p-5">
                    {/* Helper Text */}
                    <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded mb-4 border border-blue-100 flex gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <p>Citations acknowledge sources of ideas and data. They do not replace original writing.</p>
                    </div>

                    {/* Source Summary */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Source</label>
                        <p className="text-sm font-medium text-gray-900 truncate">{source.title}</p>
                        <p className="text-xs text-gray-500">{source.year} • {source.author || (source.authors ? source.authors[0] : "")}</p>
                    </div>

                    {/* Style Selector */}
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Citation Style</label>
                        <div className="flex bg-gray-100 p-1 rounded-md">
                            {(["APA", "MLA", "Chicago", "IEEE"] as CitationStyle[]).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${style === s
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Preview (In-Text)</label>
                        <div className="p-3 border border-gray-200 rounded bg-gray-50 font-mono text-sm break-all text-gray-700">
                            {previewText}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-300 rounded text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onInsert(previewText, style)}
                            className="flex-1 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Insert Citation
                        </button>
                    </div>

                </div>

                {/* Footer Warning */}
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-400">Ensure cited ideas are expressed in your own words.</p>
                </div>
            </div>
        </div>
    );
};
