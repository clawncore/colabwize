import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
} from "../ui/dialog";
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Loader2,
    FileText,
    FileType
} from "lucide-react";
import { apiClient } from "../../services/apiClient";
import { Project } from "../../services/documentService";
import { useToast } from "../../hooks/use-toast";

interface ExportWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    currentContent: any; // TipTap content
    currentHtmlContent?: string;
}

type Step = "checklist" | "format" | "final"; // Removed 'preview' step to simplify flow further if desired, but user kept 'preview' in desire? Actually user said "straightforward". Let's keep preview but make it fast.
// actually, let's keep the flow: Checklist -> Format -> Final. Preview is often distraction in "concise" mode unless explicitly separate. 
// Re-reading user request: "simplifying the UI... removing the amount of information... straightforward".
// Let's stick to Checklist -> Format -> Confirm (Final).
type ExportFormat = "docx" | "pdf"; // Only DOCX and PDF

export const ExportWorkflowModal: React.FC<ExportWorkflowModalProps> = ({
    isOpen,
    onClose,
    project,
    currentContent,
    currentHtmlContent,
}) => {
    const [currentStep, setCurrentStep] = useState<Step>("checklist");
    const [checkedItems, setCheckedItems] = useState<number[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
    const [downloading, setDownloading] = useState(false);

    // Removed Smart Export Options state

    const { toast } = useToast();

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setCurrentStep("checklist");
            setCheckedItems([]);
            setSelectedFormat(null);
        }
    }, [isOpen]);

    // --- Step 1: Checklist Logic ---
    const checklistItems = [
        { id: 1, text: "Citations Verified" },
        { id: 2, text: "Originality Checked" },
        { id: 3, text: "Quotes Marked" },
        { id: 4, text: "Context Reviewed" },
    ];

    const toggleChecklistItem = (id: number) => {
        setCheckedItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const isChecklistComplete = checkedItems.length === checklistItems.length;

    // --- Step 2: Format Logic ---
    const formats = [
        {
            id: "docx",
            label: "Microsoft Word",
            ext: ".docx",
            icon: <FileText className="w-6 h-6" />,
            color: "bg-blue-600",
            hoverRing: "ring-blue-200",
        },
        {
            id: "pdf",
            label: "PDF Document",
            ext: ".pdf",
            icon: <FileType className="w-6 h-6" />,
            color: "bg-red-600",
            hoverRing: "ring-red-200",
        },
    ];

    // --- Actions ---
    const handleDownload = async () => {
        if (!selectedFormat) return;

        try {
            setDownloading(true);

            const userId = localStorage.getItem("user_id") || "";
            const response = await apiClient.download("/api/files", {
                fileData: {
                    id: project.id,
                    title: project.title,
                    content: currentContent,
                    citations: project.citations || [],
                    includeAuthorshipCertificate: false, // Default to false or system managed
                },
                fileType: `export-${selectedFormat}`,
                userId: userId,
                format: selectedFormat,
            });

            if (response.status === 500) {
                // Try to parse error to see if it's credit related
                // Since response is blob/stream, this is tricky with standard fetch but apiClient.download might handle it.
                // Actually apiClient.download returns raw response.
            }

            // Allow client to handle blob errors if JSON is returned on error
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                if (errorData.message === "INSUFFICIENT_CREDITS") {
                    throw new Error("You have reached your free PDF export limit. Please upgrade or add credits.");
                }
                throw new Error(errorData.message || "Export failed");
            }

            const blob = await response.blob();

            // Check if response was actually a JSON error hidden in blob (edge case)
            if (blob.type === "application/json") {
                // Convert blob to text to parse
                const text = await blob.text();
                try {
                    const json = JSON.parse(text);
                    if (json.message === "INSUFFICIENT_CREDITS") {
                        throw new Error("You have reached your free PDF export limit. Please upgrade or add credits.");
                    }
                    throw new Error(json.message || "Export failed");
                } catch (e) {
                    // proceed if not json
                }
            }

            // Since we use signed URLs in the new backend logic, the response might be a JSON with downloadUrl
            // Let's re-read the backend code I just wrote. 
            // Result is JSON: { success: true, result: { downloadUrl, ... } }
            // WAIT - `apiClient.download` expects a Blob usually? 
            // In `file-processing.ts` I returned `new Response(JSON.stringify({...}))`.
            // So on frontend I should parse JSON first, then trigger download from URL.

            // Re-evaluating `apiClient.download`:
            // Ideally I should act based on what `apiClient.download` does. 
            // Assuming `apiClient` is a wrapper around fetch.
            // If the backend returns JSON, I should parse it.

            // Let's assume standard fetch behavior for now.
            // My backend change returns JSON with `downloadUrl`.

            // CORRECTED LOGIC:
            // Since backend returns JSON now (wrapper around serverless), I should just use `apiClient.post` strictly speaking, 
            // BUT `apiClient.download` might imply it expects a file. 
            // However, looking at the previous code in `ExportWorkflowModal.tsx`:
            // `const data = await response.json();`
            // `if (!data.success ...`
            // So the previous frontend code EXPECTED JSON. So my backend change aligns with that.
            // I will reuse that logic.

            // Wait, I need to read the stream if I haven't already.
            // The previous code did: `const data = await response.json();`
            // So I will stick to that.

            let data;
            try {
                // Clone response in case we need to read it twice or if it was already read (unlikely here)
                data = await response.clone().json();
            } catch (e) {
                // Fallback if it's not JSON? Unlikely given backend.
            }

            if (!data || !data.success || !data.result?.downloadUrl) {
                // Check specific error message
                if (data?.message === "INSUFFICIENT_CREDITS" || data?.error === "INSUFFICIENT_CREDITS") {
                    throw new Error("Limit Reached: You need credits to export more PDFs.");
                }
                throw new Error(data?.message || "Failed to generate download URL");
            }

            const a = document.createElement("a");
            a.href = data.result.downloadUrl;
            a.download = `${project.title}.${selectedFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            toast({
                title: "Export Complete",
                description: `Your ${selectedFormat.toUpperCase()} is ready.`,
            });

            onClose();
        } catch (error: any) {
            console.error("Export failed", error);
            toast({
                title: "Export Failed",
                description: error.message || "There was an error generating your file.",
                variant: "destructive",
            });
        } finally {
            setDownloading(false);
        }
    };

    // --- Navigation ---
    const goToNextStep = () => {
        if (currentStep === "checklist" && isChecklistComplete) setCurrentStep("format");
        else if (currentStep === "format" && selectedFormat) setCurrentStep("final");
    };

    const goToPrevStep = () => {
        if (currentStep === "format") setCurrentStep("checklist");
        else if (currentStep === "final") setCurrentStep("format");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl w-full p-0 bg-white overflow-hidden rounded-2xl shadow-2xl">

                {/* Header */}
                <div className="bg-gray-50/50 border-b border-gray-100 p-4 flex items-center justify-between">
                    <button
                        onClick={currentStep === 'checklist' ? onClose : goToPrevStep}
                        className="text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1 text-sm font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {currentStep === 'checklist' ? 'Back' : 'Previous'}
                    </button>
                    <span className="text-sm font-semibold text-gray-900">
                        {currentStep === 'checklist' ? '1. Pre-Flight' : currentStep === 'format' ? '2. Format' : '3. Export'}
                    </span>
                    <div className="w-16" /> {/* Spacer for centering */}
                </div>

                <div className="p-8">
                    {/* Step 1: Checklist */}
                    {currentStep === "checklist" && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">Ready to Export?</h2>
                                <p className="text-gray-500 text-sm mt-1">Complete these quick checks first.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {checklistItems.map((item) => {
                                    const isChecked = checkedItems.includes(item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleChecklistItem(item.id)}
                                            className={`group flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${isChecked
                                                ? "border-green-500 bg-green-50/30"
                                                : "border-gray-100 hover:border-indigo-200 hover:bg-gray-50"
                                                }`}
                                        >
                                            <span className={`font-semibold ${isChecked ? "text-green-800" : "text-gray-700"}`}>
                                                {item.text}
                                            </span>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isChecked ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400 group-hover:bg-gray-300"
                                                }`}>
                                                {isChecked && <CheckCircle2 className="w-4 h-4" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={goToNextStep}
                                disabled={!isChecklistComplete}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${isChecklistComplete
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200/50"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Continue
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Format */}
                    {currentStep === "format" && (
                        <div className="space-y-8">
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">Select Format</h2>
                                <p className="text-gray-500 text-sm mt-1">Choose your preferred file type.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {formats.map((fmt) => (
                                    <button
                                        key={fmt.id}
                                        onClick={() => setSelectedFormat(fmt.id as ExportFormat)}
                                        className={`relative group flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all ${selectedFormat === fmt.id
                                            ? `border-${fmt.color.replace('bg-', '')} bg-${fmt.color.replace('bg-', '')}/5 ring-1 ring-${fmt.color.replace('bg-', '')}`
                                            : `border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50`
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl ${fmt.color} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                                            {fmt.icon}
                                        </div>
                                        <span className={`font-bold ${selectedFormat === fmt.id ? "text-gray-900" : "text-gray-600"}`}>
                                            {fmt.label}
                                        </span>
                                        <span className="text-xs text-gray-400 mt-1">{fmt.ext}</span>

                                        {selectedFormat === fmt.id && (
                                            <div className="absolute top-3 right-3 text-indigo-600">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={goToNextStep}
                                disabled={!selectedFormat}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${selectedFormat
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200/50"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Final Review
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Step 3: Final */}
                    {currentStep === "final" && (
                        <div className="space-y-8 text-center">
                            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">All Set!</h2>
                                <p className="text-gray-500 mt-2">
                                    Your <strong>{selectedFormat?.toUpperCase()}</strong> file is ready to be generated.
                                </p>
                            </div>

                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl hover:shadow-indigo-200/50 transition-all"
                            >
                                {downloading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Download Now"
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
