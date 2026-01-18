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
    AlertTriangle,
} from "lucide-react";
import { apiClient } from "../../services/apiClient";
import { Project } from "../../services/documentService";
import { useToast } from "../../hooks/use-toast";
import { OriginalityService } from "../../services/originalityService";

interface ExportWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    currentContent: any; // TipTap content
    currentHtmlContent?: string;
}

type Step = "checklist" | "format" | "preview" | "final";
type ExportFormat = "docx" | "pdf" | "latex" | "rtf" | "txt";

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
    const [isSelfPlagiarismCheckRunning, setIsSelfPlagiarismCheckRunning] =
        useState(false);
    const [selfPlagiarismWarning, setSelfPlagiarismWarning] = useState<
        string | null
    >(null);
    const [includeAuthorshipCertificate, setIncludeAuthorshipCertificate] = useState(true);
    // Removed hasCredit state usage for UI, but keeping logic internal if needed later

    const { toast } = useToast();

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setCurrentStep("checklist");
            setCheckedItems([]);
            setSelectedFormat(null);
            setSelfPlagiarismWarning(null);
        }
    }, [isOpen]);

    // --- Step 1: Checklist Logic ---
    const checklistItems = [
        {
            id: 1,
            text: "Add citations to highlights",
            subtext: "Check for any 'Citation Needed' flags.",
        },
        {
            id: 2,
            text: "Rewrite close paraphrases",
            subtext: "Ensure you've used your own voice.",
        },
        {
            id: 3,
            text: "Confirm quotes are marked",
            subtext: "Verify all direct quotes have quotation marks.",
        },
        {
            id: 4,
            text: "Review reused draft sections",
            subtext: "Ensure context is appropriate for this new submission.",
        },
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
            label: "Microsoft Word (.docx)",
            description: "Best for submission and editing.",
            icon: "W",
            color: "bg-blue-600",
        },
        {
            id: "pdf",
            label: "PDF Document (.pdf)",
            description: "Best for printing and sharing.",
            icon: "P",
            color: "bg-red-600",
        },
        {
            id: "latex",
            label: "LaTeX Source (.tex)",
            description: "Best for scientific/academic layouts.",
            icon: "T",
            color: "bg-green-600",
        },
        {
            id: "rtf",
            label: "Rich Text Format (.rtf)",
            description: "Universal compatibility.",
            icon: "R",
            color: "bg-purple-600",
        },
        {
            id: "txt",
            label: "Plain Text (.txt)",
            description: "Simple text content.",
            icon: "T",
            color: "bg-gray-600",
        },
    ];

    // --- Actions ---
    const handleDownload = async () => {
        if (!selectedFormat) return;

        try {
            setDownloading(true);

            // Self-Plagiarism Guard Check (if confirmed in step 2, we might skip re-check or just warn)
            // Here we assume the check ran or user bypassed it.

            const userId = localStorage.getItem("user_id") || "";
            const response = await apiClient.download("/api/files", {
                fileData: {
                    id: project.id,
                    title: project.title,
                    content: currentContent,
                    citations: project.citations || [],
                    includeAuthorshipCertificate,
                },
                fileType: `export-${selectedFormat}`,
                userId: userId,
                format: selectedFormat,
            });

            const data = await response.json();

            if (!data.success || !data.result?.downloadUrl) {
                throw new Error(data.message || "Failed to generate download URL");
            }

            const fileResponse = await fetch(data.result.downloadUrl);
            if (!fileResponse.ok) throw new Error("Failed to download file");

            const blob = await fileResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const extensionMap: Record<string, string> = {
                docx: "docx",
                pdf: "pdf",
                latex: "tex",
                rtf: "rtf",
                txt: "txt",
            };
            a.download = `${project.title.replace(/\s+/g, "_")}.${extensionMap[selectedFormat]}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Download Started",
                description: `Your ${selectedFormat.toUpperCase()} file is ready.`,
            });

            onClose();
        } catch (error) {
            console.error("Download failed", error);
            toast({
                title: "Download Failed",
                description: "There was an error generating your file.",
                variant: "destructive",
            });
        } finally {
            setDownloading(false);
        }
    };

    const runSelfPlagiarismCheck = async () => {
        setIsSelfPlagiarismCheckRunning(true);
        try {
            const contentText = typeof currentContent === "string" ? currentContent : JSON.stringify(currentContent);
            const results = await OriginalityService.checkSelfPlagiarism(contentText, project.id);

            const riskyMatches = results.filter(r => r.isSelfPlagiarismInternal && r.similarityScore > 20);

            if (riskyMatches.length > 0) {
                setSelfPlagiarismWarning(`${riskyMatches.length} sections match your previous work.`);
            } else {
                setSelfPlagiarismWarning(null);
                toast({ title: "No Self-Plagiarism Detected", description: "You are good to go!", variant: "default" });
            }
        } catch (err) {
            console.error("Check failed", err);
        } finally {
            setIsSelfPlagiarismCheckRunning(false);
        }
    };

    // --- Navigation ---
    const goToNextStep = () => {
        if (currentStep === "checklist" && isChecklistComplete) setCurrentStep("format");
        else if (currentStep === "format" && selectedFormat) setCurrentStep("preview");
        else if (currentStep === "preview") setCurrentStep("final");
    };

    // Navigation helper (currently unused but kept for future use)
    // const goToPrevStep = () => {
    //     if (currentStep === "format") setCurrentStep("checklist");
    //     else if (currentStep === "preview") setCurrentStep("format");
    //     else if (currentStep === "final") setCurrentStep("preview");
    // };

    // --- Render Steps (Content Only) ---

    // Step 1: Checklist Content
    const renderChecklistContent = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pre-Export Checks</h2>
                <p className="text-gray-500">Please verify the following items before proceeding.</p>
            </div>
            <div className="space-y-4">
                {checklistItems.map((item) => {
                    const isChecked = checkedItems.includes(item.id);
                    return (
                        <div
                            key={item.id}
                            onClick={() => toggleChecklistItem(item.id)}
                            className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${isChecked
                                ? "border-indigo-600 bg-indigo-50/50"
                                : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                                }`}>
                            <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isChecked
                                ? "border-indigo-600 bg-indigo-600"
                                : "border-gray-300"
                                }`}>
                                {isChecked && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                                <h4 className={`font-semibold text-lg ${isChecked ? "text-indigo-900" : "text-gray-900"}`}>
                                    {item.text}
                                </h4>
                                <p className={`text-gray-500 ${isChecked ? "text-indigo-700" : ""}`}>
                                    {item.subtext}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // Step 2: Format Content
    const renderFormatContent = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Format</h2>
                <p className="text-gray-500">Choose the file format you wish to export.</p>
            </div>

            {/* Self-Plagiarism Guard */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-4">
                <div className="bg-amber-100 p-2 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-amber-700" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-amber-900">Draft Comparison Guard</h4>
                    <p className="text-amber-800 text-sm mt-1 mb-3">
                        {selfPlagiarismWarning || "Check for content overlaps with your previous submissions to avoid self-plagiarism."}
                    </p>
                    <button
                        onClick={runSelfPlagiarismCheck}
                        disabled={isSelfPlagiarismCheckRunning}
                        className="text-sm font-medium bg-white text-amber-700 border border-amber-200 px-3 py-1.5 rounded-md hover:bg-amber-50 transition-colors shadow-sm flex items-center gap-2">
                        {isSelfPlagiarismCheckRunning && <Loader2 className="w-3 h-3 animate-spin" />}
                        {isSelfPlagiarismCheckRunning ? "Running Check..." : "Run Safety Check"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formats.map((fmt) => (
                    <button
                        key={fmt.id}
                        onClick={() => setSelectedFormat(fmt.id as ExportFormat)}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${selectedFormat === fmt.id
                            ? `border-${fmt.color.replace('bg-', '')} ring-1 ring-${fmt.color.replace('bg-', '')} bg-gray-50`
                            : "border-gray-100 bg-white hover:border-indigo-200"
                            }`}>
                        <div className={`w-12 h-12 rounded-lg ${fmt.color} text-white flex items-center justify-center font-bold text-xl shadow-sm`}>
                            {fmt.icon}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">{fmt.label}</h4>
                            <p className="text-sm text-gray-500">{fmt.description}</p>
                        </div>
                        {selectedFormat === fmt.id && <div className="ml-auto"><CheckCircle2 className="w-6 h-6 text-indigo-600" /></div>}
                    </button>
                ))}
            </div>

            {/* Smart Export Options */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Smart Export Options</h4>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={includeAuthorshipCertificate}
                            onChange={(e) => setIncludeAuthorshipCertificate(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                            <p className="font-medium text-gray-900">Include Authorship Certificate</p>
                            <p className="text-xs text-gray-500">Append verifiable proof of authorship to your document.</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );

    // Step 3: Preview Content
    const renderPreviewContent = () => (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Review</h2>
                <p className="text-gray-500">Preview your document layout before confirming.</p>
            </div>

            <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 p-8 flex items-center justify-center overflow-hidden">
                <div className="bg-white shadow-2xl w-full max-w-2xl aspect-[8.5/11] rounded-sm overflow-hidden flex flex-col transform scale-95 sm:scale-100 transition-transform origin-center">
                    {/* Real Document Content Preview */}
                    <div className="flex-1 p-8 sm:p-12 overflow-y-auto bg-white article-content">
                        {currentHtmlContent ? (
                            <div
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: currentHtmlContent }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 italic">
                                Preview not available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Step 4: Final Payment/Auth Content
    const renderFinalContent = () => (
        <div className="space-y-6 flex flex-col justify-center h-full">
            <div className="text-center mb-8">
                <div className="mx-auto w-24 h-24 bg-indigo-50/50 rounded-full flex items-center justify-center mb-6 p-4">
                    <img src="/images/Colabwize-logo.png" alt="ColabWize" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Ready to Export</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    You are about to export <strong>{project.title}</strong> as a <strong>{selectedFormat?.toUpperCase()}</strong> file.
                </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-6 max-w-md mx-auto w-full shadow-sm">
                <div className="space-y-4">
                    <div className="bg-indigo-100/50 p-3 rounded-lg flex gap-3 items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        <span className="text-sm text-indigo-900 font-medium">Verified & Ready for Download</span>
                    </div>
                </div>
            </div>
            <div className="text-center mt-8">
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full max-w-md bg-indigo-600 text-white rounded-xl py-4 text-lg font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
                    {downloading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Confirm & Export
                            <ChevronRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[90vw] w-full h-[90vh] p-0 gap-0 bg-gray-50 overflow-hidden rounded-2xl sm:max-w-6xl">

                {/* --- Header --- */}
                <div className="h-20 border-b border-gray-200 bg-white flex items-center justify-center px-8 flex-shrink-0 relative">
                    <button onClick={onClose} className="absolute left-8 text-gray-500 hover:text-gray-900 font-medium flex items-center gap-2">
                        <ChevronLeft className="w-5 h-5" />
                        Back to Editor
                    </button>

                    <div className="flex items-center gap-12">
                        {["checklist", "format", "preview", "final"].map((step, idx) => {
                            const stepNames = ["Checklist", "Format", "Review", "Complete"];
                            const isActive = currentStep === step;
                            const isPast = ["checklist", "format", "preview", "final"].indexOf(currentStep) > idx;

                            return (
                                <div key={step} className="flex flex-col items-center gap-2 relative">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all z-10 ${isActive ? "border-indigo-600 bg-indigo-600 text-white" :
                                        isPast ? "border-indigo-600 bg-indigo-600 text-white" :
                                            "border-gray-200 bg-white text-gray-400"
                                        }`}>
                                        {isPast ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                                    </div>
                                    <span className={`text-xs font-semibold ${isActive ? "text-indigo-900" : "text-gray-400"}`}>
                                        {stepNames[idx]}
                                    </span>
                                    {/* Connector Line */}
                                    {idx < 3 && (
                                        <div className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 ml-4 w-24 ${isPast ? "bg-indigo-600" : "bg-gray-200"
                                            }`} style={{ width: "4rem", transform: "translateX(50%)" }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- Main Layout Grid --- */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Left Column: Main step Content */}
                    <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                        <div className="max-w-3xl mx-auto h-full">
                            {currentStep === "checklist" && renderChecklistContent()}
                            {currentStep === "format" && renderFormatContent()}
                            {currentStep === "preview" && renderPreviewContent()}
                            {currentStep === "final" && renderFinalContent()}
                        </div>
                    </div>

                    {/* Right Column: Order Summary Sidebar */}
                    <div className="w-96 bg-white border-l border-gray-200 p-8 hidden lg:block overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Export Summary</h3>

                        <div className="space-y-6">
                            {/* Project Info */}
                            <div className="pb-6 border-b border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Document</p>
                                <h4 className="font-semibold text-gray-900 line-clamp-2">{project.title}</h4>
                            </div>

                            {/* Format Selection */}
                            <div className="pb-6 border-b border-gray-100">
                                <p className="text-sm text-gray-500 mb-2">Selected Format</p>
                                {selectedFormat ? (
                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white ${formats.find(f => f.id === selectedFormat)?.color
                                            }`}>
                                            {formats.find(f => f.id === selectedFormat)?.icon}
                                        </div>
                                        <span className="font-medium text-gray-900">{formats.find(f => f.id === selectedFormat)?.label}</span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">No format selected</p>
                                )}
                            </div>

                            {/* Checklist Status */}
                            <div className="pb-6 border-b border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm text-gray-500">Pre-Flight Checks</p>
                                    <span className="text-xs font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                        {checkedItems.length}/{checklistItems.length}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full transition-all duration-500"
                                        style={{ width: `${(checkedItems.length / checklistItems.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            {currentStep !== "final" && (
                                <button
                                    onClick={goToNextStep}
                                    disabled={(currentStep === "checklist" && !isChecklistComplete) || (currentStep === "format" && !selectedFormat)}
                                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${(currentStep === "checklist" && !isChecklistComplete) || (currentStep === "format" && !selectedFormat)
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                                        }`}>
                                    Continue
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};
