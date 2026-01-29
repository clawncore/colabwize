import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { CitationService } from "../../../services/citationService";
import { Loader2, BarChart } from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { UpgradeModal } from "../../subscription/UpgradeModal";

interface CitationAuditAdapterProps {
    projectId: string;
    editor: Editor | null;
    onScanComplete: (results: any) => void;
}

export const CitationAuditAdapter: React.FC<CitationAuditAdapterProps> = ({
    projectId,
    editor,
    onScanComplete,
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const { toast } = useToast();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);


    const handleScan = async () => {
        const content = editor?.getText() || "";
        if (!content.trim()) {
            toast({
                title: "Empty Document",
                description: "Please enter some text to scan.",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsScanning(true);
            const results = await CitationService.scanContent(content, projectId);

            onScanComplete(results);

        } catch (error: any) {
            console.error("Audit failed", error);

            // Check for specific limit error
            if (error.message && error.message.includes("limit reached")) {
                // Use default message in modal
                setShowUpgradeModal(true);
                return;
            }

            toast({
                title: "Audit Failed",
                description: "Could not complete citation scan.",
                variant: "destructive",
            });
        } finally {
            setIsScanning(false);
        }
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
