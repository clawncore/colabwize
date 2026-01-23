import React, { useState } from "react";
import { Quote, X, Lock, Plus, Trash2, Check } from "lucide-react";
import { CitationStyle } from "../../utils/citationFormatter";

interface CitationStylePanelProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (style: CitationStyle) => void;
    isSaving?: boolean;
}

interface CustomCitationData {
    authors: string[];
    year: string;
    title: string;
    journal?: string;
    doi?: string;
}

export const CitationStylePanel: React.FC<CitationStylePanelProps> = ({
    isOpen,
    onClose,
    onConfirm,
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

    if (!isOpen) return null;

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

    return (
        <>
            {/* Main Panel - Citation Style Chooser */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen && !showCustomEditor ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-2 text-white">
                            <Quote className="w-5 h-5 fill-current" />
                            <h3 className="text-lg font-bold">Citation Style</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <p className="text-sm text-gray-600 mb-6">
                            This style will be used for all citations and references in your document.
                        </p>

                        {/* Standard Styles */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {(["APA", "MLA", "Chicago", "IEEE"] as CitationStyle[]).map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setSelectedStyle(style)}
                                    className={`relative py-3 px-4 rounded-lg border-2 transition-all font-medium ${selectedStyle === style
                                            ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                        }`}
                                >
                                    {style}
                                    {selectedStyle === style && (
                                        <Check className="absolute top-2 right-2 w-4 h-4 text-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Custom Citation Button */}
                        <button
                            onClick={() => setShowCustomEditor(true)}
                            className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all text-sm font-medium"
                        >
                            + Custom Citation
                        </button>

                        {/* Info Box */}
                        <div className="mt-6 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100">
                            <p>
                                You can change this later in document settings, but it may require re-checking your citations.
                            </p>
                        </div>
                    </div>

                    {/* Footer - Confirm Button */}
                    <div className="p-6 border-t border-gray-200 flex-shrink-0">
                        <button
                            onClick={() => selectedStyle && onConfirm(selectedStyle)}
                            disabled={!selectedStyle || isSaving}
                            className={`w-full py-3 rounded-lg text-sm font-bold text-white transition-all ${!selectedStyle || isSaving
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                                }`}
                        >
                            {isSaving ? "Setting Style..." : "Confirm & Continue"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom Citation Editor Panel (Far Right) */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out ${showCustomEditor ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-between flex-shrink-0">
                        <h3 className="text-lg font-bold text-white">Custom Citation</h3>
                        <button
                            onClick={() => setShowCustomEditor(false)}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {/* Authors */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Authors
                            </label>
                            {customCitation.authors.map((author, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={author}
                                        onChange={(e) => handleAuthorChange(index, e.target.value)}
                                        placeholder={`Author ${index + 1}`}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    />
                                    {customCitation.authors.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveAuthor(index)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={handleAddAuthor}
                                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Add Author
                            </button>
                        </div>

                        {/* Year (Disabled) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                Publication Year
                                <span className="text-xs text-gray-500 font-normal">(Cannot Edit)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={customCitation.year}
                                    disabled
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                                <Lock className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Year is auto-detected and cannot be modified</p>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={customCitation.title}
                                onChange={(e) => setCustomCitation(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>

                        {/* Journal */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Journal/Publisher <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={customCitation.journal}
                                onChange={(e) => setCustomCitation(prev => ({ ...prev, journal: e.target.value }))}
                                placeholder="e.g., Nature"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>

                        {/* DOI */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                DOI <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={customCitation.doi}
                                onChange={(e) => setCustomCitation(prev => ({ ...prev, doi: e.target.value }))}
                                placeholder="10.1000/xyz123"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 flex-shrink-0">
                        <button
                            onClick={() => {
                                // Save custom citation logic here
                                setShowCustomEditor(false);
                            }}
                            className="w-full py-3 rounded-lg text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg transition-all"
                        >
                            Save Custom Citation
                        </button>
                    </div>
                </div>
            </div>

            {/* Backdrop */}
            {(isOpen || showCustomEditor) && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    onClick={() => {
                        if (showCustomEditor) {
                            setShowCustomEditor(false);
                        } else {
                            onClose();
                        }
                    }}
                />
            )}
        </>
    );
};
