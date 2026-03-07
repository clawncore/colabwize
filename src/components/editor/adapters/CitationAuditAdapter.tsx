import React, { useState } from "react";
import { Editor } from "@tiptap/react";

import { Loader2, BarChart } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { UpgradeModal } from "../../subscription/UpgradeModal";
import { BibliographyManager } from "../../../services/citationAudit/bibliographyEngine";

interface CitationAuditAdapterProps {
    projectId: string;
    citationStyle: string;
    editor: Editor | null;
    citationLibrary?: any[];
    onScanComplete: (results: any) => void;
}

export const CitationAuditAdapter: React.FC<CitationAuditAdapterProps> = ({
    projectId,
    citationStyle,
    editor,
    citationLibrary,
    onScanComplete,
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const { toast } = useToast();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);


    const handleScan = async () => {
        // Pass "AUTO_START" to let the Sidebar know it should bypass the IDLE screen.
        onScanComplete("AUTO_START");
    };

    return (
        <>
            <button
                onClick={handleScan}
                disabled={isScanning}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors flex items-center gap-2
            ${isScanning
                        ? "bg-green-50 border-green-200 text-green-700 cursor-not-allowed"
                        : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                title="Audit Citations">
                {isScanning ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Scanning...</span>
                    </>
                ) : (
                    <>
                        <BarChart className="w-4 h-4" />
                        <span>Citation Audit</span>
                    </>
                )}
            </button>
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                // Use defaults for friendlier tone
                // title="Oops! Limit Reached" 
                // message={upgradeMessage}
                feature="citations"
            />
        </>
    );
};
