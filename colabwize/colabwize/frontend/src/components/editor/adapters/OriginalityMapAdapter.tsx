import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  OriginalityService,
  OriginalityScan,
} from "../../../services/originalityService";
import { useToast } from "../../../hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";
import { UpgradeModal } from "../../subscription/UpgradeModal";

interface OriginalityMapAdapterProps {
  projectId: string;
  editor: Editor | null;
  onScanComplete?: (results: OriginalityScan) => void;
}

export const OriginalityMapAdapter: React.FC<OriginalityMapAdapterProps> = ({
  projectId,
  editor,
  onScanComplete,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    const content = editor?.getText() || "";

    if (!content.trim()) {
      toast({
        title: "Empty Document",
        description: "Please enter some text to scan.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsScanning(true);

      // Direct Service Call
      const result = await OriginalityService.scanDocument(projectId, content);

      // Notify parent to highlight
      if (onScanComplete) {
        onScanComplete(result);
      }

      toast({
        title: "Scan Complete",
        description: `Originality Score: ${Math.round(result.overallScore)}%. Highlights applied.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Scan failed:", error);

      const errorMessage =
        error.message || "Could not complete originality scan.";

      if (
        errorMessage.includes("Usage limit reached") ||
        errorMessage.includes("not available on your current plan")
      ) {
        setShowUpgradeModal(true);
      } else {
        toast({
          title: "Scan Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan="free"
        usageStats={{ used: 3, limit: 3 }}
        featureName="Originality Scans"
      />

      <button
        onClick={handleScan}
        disabled={isScanning}
        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors flex items-center gap-2
          ${
            isScanning
              ? "bg-indigo-50 border-indigo-200 text-indigo-700 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
          }`}
        title="Check Originality">
        {isScanning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Scanning...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Originality Map</span>
          </>
        )}
      </button>
    </>
  );
};
