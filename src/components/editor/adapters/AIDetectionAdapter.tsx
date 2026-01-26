import React, { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { AIDetectionService, AIScanResult } from "../../../services/aiDetectionService";
import { useToast } from "../../../hooks/use-toast";

interface AIDetectionAdapterProps {
    projectId: string;
    editor: any;
    onScanComplete: (results: AIScanResult) => void;
}

export const AIDetectionAdapter: React.FC<AIDetectionAdapterProps> = ({
    projectId,
    editor,
    onScanComplete,
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const { toast } = useToast();

    const handleAIScan = async () => {
        if (!editor) return;

        setIsScanning(true);
        try {
            const content = editor.getText();
            if (!content || content.trim().length < 50) {
                toast({
                    title: "Insufficient Content",
                    description: "Please write more than 50 characters for an accurate AI detection scan.",
                    variant: "destructive",
                });
                return;
            }

            const results = await AIDetectionService.scanContent(content);
            onScanComplete(results);

            toast({
                title: "AI Scan Complete",
                description: `Detection score: ${Math.round(results.overallScore)}% AI probability.`,
            });
        } catch (error: any) {
            console.error("AI Scan Error:", error);
            toast({
                title: "Scan Failed",
                description: error.message || "Failed to scan for AI content.",
                variant: "destructive",
            });
        } finally {
            setIsScanning(false);
        }
    };

    return (
        <button
            onClick={handleAIScan}
            disabled={isScanning || !editor}
            className={`px-4 py-2 border rounded-md text-sm font-medium flex items-center gap-2 transition-all ${isScanning
                ? "bg-purple-50 text-purple-400 border-purple-200"
                : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                }`}
            title="Scan for AI Probability">
            {isScanning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Sparkles className="w-4 h-4" />
            )}
            {isScanning ? "Scanning..." : "Check AI Prob"}
        </button>
    );
};
