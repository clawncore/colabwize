import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { OriginalityService } from "../../../services/originalityService";
import { useToast } from "../../../hooks/use-toast";
import { UpgradePromptDialog } from "../../subscription/UpgradePromptDialog";
import { SystemMaintenanceModal } from "../../common/SystemMaintenanceModal";
import { Sparkles, Loader2 } from "lucide-react";

interface RephraseAdapterProps {
  editor: Editor | null;
  projectId: string;
  onOpenRephrasePanel: (suggestions: any[], originalText: string) => void;
}

export const RephraseAdapter: React.FC<RephraseAdapterProps> = ({
  editor,
  projectId,
  onOpenRephrasePanel,
}) => {
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  // Default to ACADEMIC mode
  const [rephraseMode] = useState<"QUICK" | "ACADEMIC" | "DEEP">("ACADEMIC");

  const { toast } = useToast();

  const handleRephrase = async () => {
    if (!editor) return;

    const selectionStart = editor.state.selection.from;
    const selectionEnd = editor.state.selection.to;
    const selectedText = editor.state.doc.textBetween(selectionStart, selectionEnd);
    const selectionLength = selectionEnd - selectionStart;

    if (selectionLength < 50) {
      toast({
        title: "Selection too short",
        description: `Please select at least 50 characters to rephrase.`,
        variant: "destructive",
      });
      return;
    }

    if (selectionLength > 2000) {
      toast({
        title: "Selection too long",
        description: "Please select under 2000 characters at a time.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRephrasing(true);

      // Trusted UX: No visible credit check, just "Optimizing..."
      toast({
        title: "Optimizing content...",
        description: `Applying ${rephraseMode.toLowerCase()} rewrite protocols.`,
        duration: 2000,
      });

      const result = await OriginalityService.rewriteSelection(
        selectedText,
        rephraseMode
      );

      // Validate result
      if (!result || !result.variations || result.variations.length === 0) {
        throw new Error("Failed to generate rephrased text.");
      }

      // Map variations
      const rephraseSuggestions = result.variations.map((text: string, idx: number) => ({
        id: `rephrased-${idx}`,
        originalText: selectedText,
        suggestedText: text,
        explanation: `Variation ${idx + 1}: ${rephraseMode} rewrite.`
      }));

      onOpenRephrasePanel(rephraseSuggestions, selectedText);

    } catch (err: any) {
      console.error("Rephrase failed:", err);
      // Silent degradation or gentle failure
      const backendCode = err.code || err.response?.data?.code;

      if (backendCode === "PLAN_LIMIT_REACHED") {
        setShowUpgradePrompt(true);
      } else {
        // Show maintenance modal with generic helpful message
        setShowMaintenanceModal(true);
      }
    } finally {
      setIsRephrasing(false);
    }
  };

  const selectionLength = editor ? editor.state.selection.to - editor.state.selection.from : 0;
  const isSelectionTooShort = selectionLength < 50;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRephrase}
        disabled={isRephrasing || !editor || isSelectionTooShort}
        className={`px-4 py-2 border rounded-md text-sm font-bold transition-all flex items-center gap-2 shadow-sm
        ${isRephrasing
            ? "bg-purple-50 border-purple-200 text-purple-700 cursor-not-allowed"
            : !editor || isSelectionTooShort
              ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-purple-200 text-purple-700 hover:bg-purple-50 bg-white hover:shadow-md"
          }`}
        title={isSelectionTooShort ? "Select text to rephrase" : "Rephrase Selected Text"}>
        {isRephrasing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Refining...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Rewrite</span>
          </>
        )}
      </button>

      {showUpgradePrompt && (
        <UpgradePromptDialog
          open={showUpgradePrompt}
          onOpenChange={setShowUpgradePrompt}
          feature="rephrase_suggestions"
        />
      )}

      <SystemMaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        title="Service Temporarily Unavailable"
        message="The rephraser services are down. Please check back after some time."
      />
    </div>
  );
};
