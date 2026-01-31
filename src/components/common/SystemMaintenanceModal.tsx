import React from "react";
import { AlertCircle } from "lucide-react";

interface SystemMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export const SystemMaintenanceModal: React.FC<SystemMaintenanceModalProps> = ({
    isOpen,
    onClose,
    title = "Service Temporarily Unavailable",
    message = "The originality map services are down. Please check back after some time."
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-50 rounded-full flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            {message}
                        </p>

                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors border border-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
