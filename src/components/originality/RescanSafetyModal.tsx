import React from "react";
import { AlertTriangle } from "lucide-react";

interface RescanSafetyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    similarityPercent: number;
}

export const RescanSafetyModal: React.FC<RescanSafetyModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    similarityPercent,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">

                <div className="p-6">
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>

                    <h3 className="text-lg font-bold text-center text-gray-900 mb-2">
                        Rescan Largely Unchanged Content?
                    </h3>

                    <p className="text-sm text-gray-600 text-center mb-4">
                        This document is <strong>{similarityPercent}% identical</strong> to your last scan.
                    </p>

                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800 mb-6">
                        <p className="font-semibold mb-1">💡 Smart Saving Tip:</p>
                        Running a new scan will consume credits/usage for the <strong>entire document</strong>, not just the changes. Consider waiting until you've made more significant edits.
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Scan Anyway
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
