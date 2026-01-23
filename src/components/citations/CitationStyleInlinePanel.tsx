import React, { useState } from "react";
import { Quote, Lock, Plus, Trash2, Check, X } from "lucide-react";
import { CitationStyle } from "../../utils/citationFormatter";

interface CitationStyleInlinePanelProps {
    onConfirm: (style: CitationStyle) => void;
    onCancel: () => void;
    isSaving?: boolean;
}

interface CustomCitationData {
    authors: string[];
    year: string;
    title: string;
    journal?: string;
    doi?: string;
}

export const CitationStyleInlinePanel: React.FC<CitationStyleInlinePanelProps> = ({
    onConfirm,
    onCancel,
    isSaving = false,
}) => {
    const [selectedStyle, setSelectedStyle] = useState<CitationStyle | null>(null);
    const [showCustomEditor, setShowCustomEditor] = useState(false);
    const [customCitation, setCustomCitation] = useState<CustomCitationData>({
        authors: [""],
        year: new Date().getFullYear().toString(),
        title: "",
        journal: "",
        doi: "",
    });

    const handleAddAuthor = () => {
        setCustomCitation(prev => ({
            ...prev,
            authors: [...prev.authors, ""]
        }));
    };

    const handleRemoveAuthor = (index: number) => {
        if (customCitation.authors.length > 1) {
            setCustomCitation(prev => ({
                ...prev,
                authors: prev.authors.filter((_, i) => i !== index)
            }));
        }
    };

    const handleAuthorChange = (index: number, value: string) => {
        setCustomCitation(prev => ({
            ...prev,
            authors: prev.authors.map((author, i) => i === index ? value : author)
        }));
    };

    if (showCustomEditor) {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-bold text-purple-900">Custom Citation</h4>
                    <button
                        onClick={() => setShowCustomEditor(false)}
                        className="text-purple-600 hover:text-purple-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Authors */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Authors
                    </label>
                    {customCitation.authors.map((author, index) => (
                        <div key={index} className="flex gap-1 mb-1">
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => handleAuthorChange(index, e.target.value)}
                                placeholder={`Author ${index + 1}`}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                            />
                            {customCitation.authors.length > 1 && (
                                <button
                                    onClick={() => handleRemoveAuthor(index)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={handleAddAuthor}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 mt-1"
                    >
                        <Plus className="w-3 h-3" />
                        Add Author
                    </button>
                </div>

                {/* Year (Disabled) */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        Year
                        <span className="text-[10px] text-gray-500 font-normal">(Cannot Edit)</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={customCitation.year}
                            disabled
                            className="w-full px-2 py-1 pr-7 border border-gray-300 rounded text-xs bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <Lock className="absolute right-2 top-1.5 w-3 h-3 text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">Year is auto-detected</p>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={customCitation.title}
                        onChange={(e) => setCustomCitation(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter title"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>

                {/* Journal */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Journal <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        value={customCitation.journal}
                        onChange={(e) => setCustomCitation(prev => ({ ...prev, journal: e.target.value }))}
                        placeholder="e.g., Nature"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={() => {
                        // Save custom citation logic
                        setShowCustomEditor(false);
                    }}
                    className="w-full py-2 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-700"
                >
                    Save Custom Citation
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Quote className="w-4 h-4 text-blue-600 fill-current" />
                    <h4 className="text-sm font-bold text-blue-900">Citation Style</h4>
                </div>
                <button
                    onClick={onCancel}
                    className="text-blue-600 hover:text-blue-800"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <p className="text-xs text-gray-600 mb-3">
                This style will be used for all citations in your document.
            </p>

            {/* Style Options */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                {(["APA", "MLA", "Chicago", "IEEE"] as CitationStyle[]).map((style) => (
                    <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`relative py-2 px-3 rounded-md border-2 transition-all text-xs font-medium ${selectedStyle === style
                                ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                            }`}
                    >
                        {style}
                        {selectedStyle === style && (
                            <Check className="absolute top-1 right-1 w-3 h-3 text-blue-600" />
                        )}
                    </button>
                ))}
            </div>

            {/* Custom Citation Button */}
            <button
                onClick={() => setShowCustomEditor(true)}
                className="w-full py-2 px-3 rounded-md border-2 border-dashed border-gray-300 text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all text-xs font-medium mb-3"
            >
                + Custom Citation
            </button>

            {/* Info */}
            <div className="p-2 bg-blue-100 text-blue-800 text-[10px] rounded mb-3">
                You can change this later in settings, but it may require re-checking citations.
            </div>

            {/* Confirm Button */}
            <button
                onClick={() => selectedStyle && onConfirm(selectedStyle)}
                disabled={!selectedStyle || isSaving}
                className={`w-full py-2 rounded-lg text-xs font-bold text-white transition-all ${!selectedStyle || isSaving
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {isSaving ? "Setting..." : "Confirm & Continue"}
            </button>
        </div>
    );
};
