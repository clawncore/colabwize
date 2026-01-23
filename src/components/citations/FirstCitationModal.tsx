import React, { useState } from "react";
import { Quote, AlertTriangle, Check } from "lucide-react";
import { CitationStyle } from "../../utils/citationFormatter";

interface FirstCitationModalProps {
    isOpen: boolean;
    onConfirm: (style: CitationStyle) => void;
    isSaving?: boolean;
}

export const FirstCitationModal: React.FC<FirstCitationModalProps> = ({
    isOpen,
    onConfirm,
    isSaving = false,
}) => {
    const [selectedStyle, setSelectedStyle] = useState<CitationStyle | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Quote className="w-5 h-5 text-blue-600 fill-current" />
                        Choose a Citation Style
                    </h3>
                </div>

                <div className="p-6">
                    {/* Helper Text */}
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                        This style will be used consistently for all citations and references in this document.
                    </p>

                    {/* Style Options */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {(["APA", "MLA", "Chicago", "IEEE"] as CitationStyle[]).map((style) => (
                            <button
                                key={style}
                                onClick={() => setSelectedStyle(style)}
                                className={`
                  relative flex items-center justify-center py-3 px-4 rounded-lg border-2 transition-all
                  ${selectedStyle === style
                                        ? "border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-sm"
                                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                    }
                `}
                            >
                                {style}
                                {selectedStyle === style && (
                                    <div className="absolute top-2 right-2">
                                        <Check className="w-3.5 h-3.5 text-blue-600" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Warning / Info */}
                    <div className="flex gap-2 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 mb-6">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>
                            You can change this later in document settings, but it may require re-checking your citations.
                        </p>
                    </div>

                    {/* Confirm Button */}
                    <button
                        onClick={() => selectedStyle && onConfirm(selectedStyle)}
                        disabled={!selectedStyle || isSaving}
                        className={`
              w-full py-3 rounded-lg text-sm font-bold text-white transition-all shadow-md
              ${!selectedStyle || isSaving
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-[0.98]"
                            }
            `}
                    >
                        {isSaving ? "Setting Style..." : "Confirm & Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
};
