import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import { OriginalityService } from "../../../services/originalityService";
import { useToast } from "../../../hooks/use-toast";
import { UpgradePromptDialog } from "../../subscription/UpgradePromptDialog";

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

  const handleGetRephrase = async () => {
    if (!editor) {
      toast({
        title: "Editor not available",
        description: "Cannot rephrase text without an active editor.",
        variant: "destructive",
      });
      return;
    }

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );

    if (!selectedText.trim()) {
      toast({
        title: "No text selected",
        description: "Please select some text to rephrase.",
        variant: "destructive",
      });
      return;
    }

    if (selectedText.length > 500) {
      toast({
        title: "Text too long",
        description:
          "Please select a shorter piece of text (under 500 characters).",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRephrasing(true);

      // Since we don't have a scan ID for selected text, we'll use the rephrase API directly
      // We'll simulate a temporary scan for the selected text
      const tempScanId = "temp-" + Date.now().toString();
      const tempMatchId = "temp-match-" + Date.now().toString();

      // Get rephrase suggestions for the selected text
      const suggestions = await OriginalityService.getRephrases(
        tempScanId,
        tempMatchId,
        selectedText
      );

      if (suggestions.length > 0) {
        // Call the parent to open the rephrase suggestions panel
        onOpenRephrasePanel(suggestions, selectedText);
      } else {
        toast({
          title: "No suggestions found",
          description:
            "Could not generate rephrase suggestions for the selected text.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      // Changed 'error' to 'err' as per the provided snippet
      console.error("Rephrase failed:", err);

      // Check for usage limit error
      if (
        err.response?.status === 403 ||
        err.message?.includes("limit") ||
        err.response?.data?.error?.includes("limit")
      ) {
        setShowUpgradePrompt(true);
        return;
      }

      toast({
        title: "Rephrase Failed",
        description: err.message || "Could not generate rephrase suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsRephrasing(false);
    }
  };

  return (
    <>
      <button
        onClick={handleGetRephrase}
        disabled={isRephrasing || !editor || editor.state.selection.empty}
        className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors flex items-center gap-2
        ${
          isRephrasing
            ? "bg-blue-50 border-blue-200 text-blue-700 cursor-not-allowed"
            : !editor || editor.state.selection.empty
              ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
              : "border-blue-300 text-blue-700 hover:bg-blue-50 bg-white"
        }`}
        title="Rephrase Selected Text">
        {isRephrasing ? (
          <>
            <svg
              className="w-4 h-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Rephrasing...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-blue-600">
              <path d="M11 7h10" />
              <path d="M3 7h2" />
              <path d="M3 17h2" />
              <path d="M13 17h-2" />
              <path d="M11 12h8" />
              <path d="M7 12h2" />
              <path d="M21 17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
            </svg>
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
