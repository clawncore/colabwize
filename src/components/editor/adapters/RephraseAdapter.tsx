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
  // Default to ACADEMIC mode, setter removed as UI is hidden
  const [rephraseMode] = useState<"QUICK" | "ACADEMIC" | "DEEP">("ACADEMIC");

  // Debounce/Batching Ref
  // In a real implementation with high-frequency typing, we'd use a useRef timer.
  // For this button-triggered action, "auto-batching" effectively just means 
  // we wait for the user to click (manual batching) or we could strictly enforce a timer.
  // Given the requirements, we'll keep the button trigger but add the Mode UI.

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
      const rephraseSuggestions = result.variations.map((text, idx) => ({
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
        toast({
          title: "Rephraser Busy",
          description: "We're experiencing high load. Please try a shorter selection.",
          variant: "default" // Not destructive, keeps it neutral
        });
      }
    } finally {
      setIsRephrasing(false);
    }
  };

  const selectionLength = editor ? editor.state.selection.to - editor.state.selection.from : 0;
  const isSelectionTooShort = selectionLength < 50;

  return (
    <div className="flex items-center gap-2">
      {/* Mode Selector */}
      {/* Mode Selector Removed per user request - Defaulting to ACADEMIC internally */}
      {/* <select
        value={rephraseMode}
        onChange={(e) => setRephraseMode(e.target.value as any)}
        className="h-9 text-xs border border-gray-200 rounded-md bg-white text-gray-600 focus:ring-purple-500 focus:border-purple-500"
        title="Select Rewrite Mode"
      >
        <option value="QUICK">⚡ Quick</option>
        <option value="ACADEMIC">🎓 Academic</option>
        <option value="DEEP">🧠 Deep</option>
      </select> */}

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
    </div>
  );
};
