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
  const [upgradeMessage, setUpgradeMessage] = useState("");
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
      // Initial call triggers Google Scan (Hybrid Step 1) and initiates Copyleaks (Hybrid Step 2)
      let result = await OriginalityService.scanDocument(projectId, content);

      // If status is Processing, it means Copyleaks (Deep Scan) is running.
      // We poll until it's completed.
      if (result.scanStatus === "processing") {
        const pollInterval = 2000; // 2 seconds
        const maxAttempts = 30; // 60 seconds max
        let attempts = 0;

        while (
          result.scanStatus === "processing" ||
          result.scanStatus === "pending"
        ) {
          if (attempts >= maxAttempts) break; // Timeout
          await new Promise((resolve) => setTimeout(resolve, pollInterval));
          attempts++;

          // Poll for updates
          try {
            result = await OriginalityService.getScanResults(result.id);
          } catch (e) {
            console.warn("Polling error:", e);
          }
        }
      }

      // Notify parent to highlight
      if (onScanComplete) {
        onScanComplete(result);
      }

      toast({
        title: "Scan Complete",
        description: `Originality Score: ${Math.round((result.overallScore ?? (result as any).overall_score) ?? 0)}%. Highlights applied.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Scan failed:", error);

      const errorMessage =
        error.message || "Could not complete originality scan.";

      if (
        errorMessage.toLowerCase().includes("limit reached") ||
        errorMessage.toLowerCase().includes("upgrade")
      ) {
        setUpgradeMessage("Oops! You've hit your plan limit. Upgrade for unlimited access!");
        setShowUpgradeModal(true);
      } else if (errorMessage.toLowerCase().includes("credits")) {
        setUpgradeMessage("Oops! You're out of credits. Top up to keep scanning.");
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
        title="Oops! Limit Reached"
        message={upgradeMessage || "It looks like you've used all your available scans. Upgrade getting unlimited access or top up credits!"}
        feature="Originality Check"
      />

      <button
        onClick={handleScan}
        disabled={isScanning}
        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors flex items-center gap-2
          ${isScanning
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
