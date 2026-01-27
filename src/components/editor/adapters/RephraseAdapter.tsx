import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { OriginalityService } from "../../../services/originalityService";
import { useToast } from "../../../hooks/use-toast";
import { UpgradePromptDialog } from "../../subscription/UpgradePromptDialog";
import { Sparkles, Loader2 } from "lucide-react"; // Import Icons

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
  const { toast } = useToast();

  const handleRephrase = async () => {
    if (!editor) return;

    const selectionStart = editor.state.selection.from;
    const selectionEnd = editor.state.selection.to;
    const selectedText = editor.state.doc.textBetween(selectionStart, selectionEnd);
    const selectionLength = selectionEnd - selectionStart;

    if (selectionLength < 500) {
      toast({
        title: "Selection too short",
        description: `Please select at least 500 characters to rephrase (current: ${selectionLength}).`,
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

      const result = await OriginalityService.rewriteSelection(
        selectedText
      );

      // Validate result
      if (!result || !result.variations || result.variations.length === 0) {
        throw new Error("Failed to generate rephrased text. Please try again.");
      }

      // Map variations to suggestion objects
      const rephraseSuggestions = result.variations.map((text, idx) => ({
        id: `rephrased-${idx}`,
        originalText: selectedText,
        suggestedText: text,
        explanation: `Variation ${idx + 1}: AI-generated alternative for better flow and originality.`
      }));

      onOpenRephrasePanel(rephraseSuggestions, selectedText);

    } catch (err: any) {
      console.error("Rephrase failed:", err);
      // Enhanced Limit Handling
      const backendCode = err.code || err.response?.data?.code;


      if (backendCode === "PLAN_LIMIT_REACHED" || backendCode === "INSUFFICIENT_CREDITS") {
        setShowUpgradePrompt(true);
        // We might want to pass more specific data to the dialog in future,
        // but for now, the dialog handles "upgrade" flow.
        return;
      }

      // Legacy check just in case
      if (err.response?.status === 403) {
        setShowUpgradePrompt(true);
        return;
      }
      toast({
        title: "Rephraser Failed",
        description: err.response?.data?.error || err.message || "Could not rephrase text at this time.",
        variant: "destructive"
      });
    } finally {
      setIsRephrasing(false);
    }
  };

  const selectionLength = editor ? editor.state.selection.to - editor.state.selection.from : 0;
  const isSelectionTooShort = selectionLength < 500;

  return (
    <>
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
        title={isSelectionTooShort ? "Select at least 500 characters to rephrase" : "Rephrase Selected Text (AI)"}>
        {isRephrasing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Rephrasing...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Rephrase</span>
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
    </>
  );
};
