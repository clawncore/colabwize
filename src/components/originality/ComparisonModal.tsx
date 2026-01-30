import React from "react";
import { X, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    viewUrl: string | null;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
    isOpen,
    onClose,
    viewUrl,
}) => {
    if (!isOpen || !viewUrl) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header - White-Labeled */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">
                            Source Comparison Report
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                            Secure View
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5 text-gray-500 hover:text-gray-900" />
                        </Button>
                    </div>
                </div>

                {/* Iframe Container */}
                <div className="flex-1 bg-gray-50 relative">
                    <iframe
                        src={viewUrl}
                        className="absolute inset-0 w-full h-full border-0"
                        title="Comparison View"
                        sandbox="allow-scripts allow-same-origin allow-forms" // Security best practice
                    />
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-400">
                    Comparison report provided by secure originality verification engine.
                </div>
            </div>
        </div>
    );
};
