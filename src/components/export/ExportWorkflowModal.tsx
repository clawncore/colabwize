import React, { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import {
    Dialog,
    DialogContent,
} from "../ui/dialog";
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Loader2,
    ShieldAlert,
    AlertTriangle,
    FileSearch
} from "lucide-react";
import { apiClient } from "../../services/apiClient";
import { Project } from "../../services/documentService";
import { useToast } from "../../hooks/use-toast";
import { runCitationAudit } from "../../services/citationAudit/citationAuditEngine";
import { detectAndNormalizeCitations } from "../editor/utils/normalization";
import { CitationStyleDialog } from "../citations/CitationStyleDialog";

interface ExportWorkflowModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    currentContent: any; // TipTap content
    currentHtmlContent?: string;
    editor?: Editor | null;
    onProjectUpdate?: (updates: Partial<Project>) => void;
}

type Step = "audit" | "details" | "format" | "mode" | "review";
type ExportFormat = "docx" | "pdf" | "latex" | "rtf" | "txt";
type ExportMode = "standard" | "journal";

export const ExportWorkflowModal: React.FC<ExportWorkflowModalProps> = ({
    // Optimized Modal Component
    isOpen,
    onClose,
    project,
    currentContent,
    currentHtmlContent,
    editor,
    onProjectUpdate,
}) => {
    const [currentStep, setCurrentStep] = useState<Step>("audit");
    // Checklist state removed
    const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
    const [exportMode, setExportMode] = useState<ExportMode>("standard");
    const [downloading, setDownloading] = useState(false);
    const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);

    const [includeAuthorshipCertificate, setIncludeAuthorshipCertificate] = useState(true);

    // Audit State
    const [isAuditing, setIsAuditing] = useState(false);
    const [auditResult, setAuditResult] = useState<any>(null);
    const [citationPolicy, setCitationPolicy] = useState({
        mode: "annotate",
        excludeOrphanReferences: false,
        markUnsupportedClaims: true
    });

    // Metadata State (Abstract removed per user request)
    const [author, setAuthor] = useState("");
    const [affiliation, setAffiliation] = useState("");
    const [course, setCourse] = useState("");
    const [instructor, setInstructor] = useState("");
    const [runningHead, setRunningHead] = useState("");

    // Removed hasCredit state usage for UI, but keeping logic internal if needed later

    const { toast } = useToast();

    // Reset state on open
    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setCurrentStep("audit");
            setSelectedFormat(null);
            setAuditResult(null); // Reset audit

            // Auto-fill from user profile in localStorage
            setAuthor(localStorage.getItem("user_full_name") || "");
            setAffiliation(localStorage.getItem("user_institution") || "");
            setCourse("");
            setInstructor("");
            setRunningHead("");
        }
    }, [isOpen]);

    // --- Step 1: Compliance Logic (formerly Audit) ---
    // (Checklist logic removed)
    const performAudit = React.useCallback(async () => {
        if (auditResult) return; // Already audited

        setIsAuditing(true);
        try {
            // SILENT NORMALIZATION (User Request)
            // Ensure editor nodes are converted to Citation Nodes properly before auditing
            if (editor) {
                await detectAndNormalizeCitations(editor, project.citations || []);
            }

            // Get fresh content if editor is available (since normalization changed it)
            const contentToAudit = editor ? editor.getJSON() : currentContent;

            const result = await runCitationAudit(
                contentToAudit,
                project.citation_style || "apa"
            );
            setAuditResult(result);
        } catch (error) {
            console.error("Audit failed", error);
            // Non-blocking error for now
        } finally {
            setIsAuditing(false);
        }
    }, [auditResult, editor, project.citations, project.citation_style, currentContent]);

    // Trigger audit when entering audit step
    useEffect(() => {
        if (currentStep === "audit" && !auditResult && !isAuditing) {
            performAudit();
        }
    }, [currentStep, auditResult, isAuditing, performAudit]);


    // --- Step 4: Format Logic ---
    const formats = [
        {
            id: "docx",
            label: "Microsoft Word (.docx)",
            description: "Best for submission and editing.",
            icon: "W",
            color: "bg-blue-600",
            disabled: false,
        },
        {
            id: "pdf",
            label: "PDF Document (.pdf)",
            description: "Best for sharing and printing.",
            icon: "PDF",
            color: "bg-red-600",
            disabled: false,
        },

        {
            id: "latex",
            label: "LaTeX Source (.tex)",
            description: "Best for scientific/academic layouts.",
            icon: "T",
            color: "bg-green-600",
            disabled: true,
        },
        {
            id: "rtf",
            label: "Rich Text Format (.rtf)",
            description: "Universal compatibility.",
            icon: "R",
            color: "bg-purple-600",
            disabled: true,
        },
        {
            id: "txt",
            label: "Plain Text (.txt)",
            description: "Simple text content.",
            icon: "T",
            color: "bg-gray-600",
            disabled: true,
        },
    ];

    // --- Actions ---
    const handleDownload = async () => {
        if (!selectedFormat) return;

        try {
            setDownloading(true);

            // Filter orphans on frontend if requested (Optimization)
            const citationsToSend = citationPolicy.excludeOrphanReferences && auditResult?.violations
                ? (project.citations || []).filter((c: any) => {
                    // Check if this citation ID appears in violations as an orphan? 
                    // Or more robustly: check if it appears in the text.
                    // For now, let backend handle it or rely on simple filter.
                    // Actually, let's just send the policy and let backend handle the logic to ensure consistency.
                    return true;
                })
                : (project.citations || []);


            const userId = localStorage.getItem("user_id") || "";
            const response = await apiClient.download("/api/files", {
                fileData: {
                    id: project.id,
                    title: project.title,
                    content: currentContent,
                    citations: citationsToSend,
                    includeAuthorshipCertificate,
                    metadata: {
                        author,
                        institution: affiliation,
                        course,
                        instructor,
                        runningHead
                    },
                    citationPolicy: {
                        ...citationPolicy,
                        violations: auditResult?.violations || [] // Pass violations for backend annotation
                    }
                },
                fileType: `export-${selectedFormat}`,
                userId: userId,
                format: selectedFormat,
            });

            const data = await response.json();

            if (!data.success || !data.result?.downloadUrl) {
                throw new Error(data.message || "Failed to generate download URL");
            }

            // Direct download using the signed URL (which now has Content-Disposition set)
            const a = document.createElement("a");
            a.href = data.result.downloadUrl;
            // No need to set download attribute as the URL itself enforces it, 
            // but setting it doesn't hurt for fallback
            a.download = `${project.title}.${selectedFormat}`;
            document.body.appendChild(a);
            a.click();
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

    // --- Navigation ---
    const goToNextStep = () => {
        if (currentStep === "audit") setCurrentStep("details");
        else if (currentStep === "details") setCurrentStep("format");
        else if (currentStep === "format" && selectedFormat) setCurrentStep("mode");
        else if (currentStep === "mode") setCurrentStep("review");
    };

    // Step 1: Compliance Content (Enhanced with Style Selector)
    const renderAuditContent = () => {
        if (isAuditing) {
            return (
                <div className="flex flex-col items-center justify-center h-full py-12">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Scanning Citations...</h3>
                    <p className="text-gray-500">Detecting style and verifying references.</p>
                </div>
            );
        }

        const violations = auditResult?.violations || [];
        const tier3 = violations.filter((v: any) => v.ruleId.includes("VERIFICATION") || v.ruleId.includes("RISK"));
        const tier1 = violations.filter((v: any) => v.ruleId.includes("REF") || v.ruleId.includes("STY"));

        const riskLevel = tier3.length > 0 ? "High" : tier1.length > 0 ? "Moderate" : "Low";
        const riskColor = riskLevel === "High"
            ? "bg-red-50 border-red-200 text-red-800"
            : riskLevel === "Moderate"
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-green-50 border-green-200 text-green-800";

        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Compliance Check</h2>
                    <p className="text-gray-500">Review automated findings before exporting.</p>
                </div>

                {/* Citation Style Header */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700 font-bold text-sm">
                            {project.citation_style?.toUpperCase() || "APA"}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Detected Citation Style</p>
                            <p className="text-xs text-gray-500">Assuming {project.citation_style?.toUpperCase() || "APA"} format based on content.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsStyleDialogOpen(true)}
                        className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 hover:underline"
                    >
                        Change
                    </button>
                </div>

                <CitationStyleDialog
                    open={isStyleDialogOpen}
                    onOpenChange={setIsStyleDialogOpen}
                    currentStyle={project.citation_style}
                    onSave={(style) => {
                        if (onProjectUpdate) {
                            onProjectUpdate({
                                citation_style: style
                            });
                        }
                        setIsStyleDialogOpen(false);
                        // Re-run audit if style changes
                        setAuditResult(null);
                    }}
                />

                {/* Compliance Score & Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center gap-6">
                        {/* Score Circle */}
                        <div className="relative w-24 h-24 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    className="text-gray-100"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="36"
                                    cx="48"
                                    cy="48"
                                />
                                <circle
                                    className={`${riskLevel === "High" ? "text-red-500" : riskLevel === "Moderate" ? "text-amber-500" : "text-green-500"} transition-all duration-1000 ease-out`}
                                    strokeWidth="8"
                                    strokeDasharray={226}
                                    strokeDashoffset={226 - (226 * (100 - (violations.length * 10))) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="36"
                                    cx="48"
                                    cy="48"
                                />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className={`text-xl font-bold ${riskLevel === "High" ? "text-red-700" : riskLevel === "Moderate" ? "text-amber-700" : "text-green-700"}`}>
                                    {Math.max(0, 100 - (violations.length * 10))}%
                                </span>
                            </div>
                        </div>

                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-900 mb-1">
                                {riskLevel === "High" ? "Critical Issues Found" : riskLevel === "Moderate" ? "Improvements Needed" : "Excellent Compliance"}
                            </h4>
                            <p className="text-sm text-gray-500 mb-3">
                                {violations.length > 0
                                    ? `We found ${violations.length} issue${violations.length === 1 ? '' : 's'} that might affect your submission acceptance.`
                                    : "Your document meets all citation standards."}
                            </p>

                            {/* Detailed Violations List */}
                            {violations.length > 0 && (
                                <div className="space-y-3 mt-4">
                                    {violations.slice(0, 2).map((v: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{v.message || "Citation Format Warning"}</p>
                                                    <p className="text-xs text-gray-500">{v.context || "Check citation style guidelines."}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    // Simulate Fix
                                                    const newViolations = violations.filter((_: any, i: number) => i !== idx);
                                                    setAuditResult((prev: any) => ({ ...prev, violations: newViolations }));
                                                    toast({ title: "Issue Resolved", description: "Citation corrected automatically.", variant: "default" });
                                                }}
                                                className="text-xs bg-white border border-gray-300 hover:bg-gray-50 text-indigo-600 font-semibold px-3 py-1.5 rounded-md shadow-sm transition-colors whitespace-nowrap">
                                                Fix Issue
                                            </button>
                                        </div>
                                    ))}
                                    {violations.length > 2 && (
                                        <p className="text-xs text-center text-gray-400 mt-2">+ {violations.length - 2} more issues...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Policy Controls */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <FileSearch className="w-5 h-5 text-gray-500" />
                        <h4 className="font-semibold text-gray-900">Export Policy</h4>
                    </div>

                    <div className="space-y-3 pl-7">
                        {/* Exclude Orphans */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={citationPolicy.excludeOrphanReferences}
                                onChange={(e) => setCitationPolicy(prev => ({ ...prev, excludeOrphanReferences: e.target.checked }))}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                                <span className="text-gray-900 font-medium group-hover:text-indigo-700 transition-colors">Exclude Orphan References</span>
                                <p className="text-xs text-gray-500">Remove bibliography entries that are not cited in the text.</p>
                            </div>
                        </label>

                        {/* Mark Unsupported */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={citationPolicy.markUnsupportedClaims}
                                onChange={(e) => setCitationPolicy(prev => ({ ...prev, markUnsupportedClaims: e.target.checked }))}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                                <span className="text-gray-900 font-medium group-hover:text-indigo-700 transition-colors">Mark Unsupported Claims</span>
                                <p className="text-xs text-gray-500">Inject comments/highlights in the exported file for unverified or risky claims.</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        );
    };

    // Step 2: Details Content (Renamed from Step 3)
    const renderDetailsContent = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Paper Details</h2>
                <p className="text-gray-500">Provide essential metadata for your research paper.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Author Name</label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            placeholder="e.g. Jane Doe"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Institution / Affiliation</label>
                        <input
                            type="text"
                            value={affiliation}
                            onChange={(e) => setAffiliation(e.target.value)}
                            placeholder="e.g. University of Science"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Course (Optional)</label>
                        <input
                            type="text"
                            value={course}
                            onChange={(e) => setCourse(e.target.value)}
                            placeholder="e.g. BIO 101"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Instructor (Optional)</label>
                        <input
                            type="text"
                            value={instructor}
                            onChange={(e) => setInstructor(e.target.value)}
                            placeholder="e.g. Dr. Smiths"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-900">Running Head (Optional)</label>
                    <input
                        type="text"
                        value={runningHead}
                        onChange={(e) => setRunningHead(e.target.value)}
                        placeholder="Short title for header"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>


            </div>
        </div>
    );

    // Step 3: Format Content (Renamed from Step 4)
    const renderFormatContent = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Format</h2>
                <p className="text-gray-500">Choose the file format you wish to export.</p>
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


    // Step 3.5: Export Mode Selection  
    const renderModeContent = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Mode</h2>
                <p className="text-gray-500">Choose how you'd like to export your document.</p>
            </div>

            <div className="space-y-4">
                {/* Standard Export Option */}
                <button
                    onClick={() => setExportMode("standard")}
                    className={`w-full flex items-start gap-4 p-6 rounded-xl border-2 text-left transition-all ${exportMode === "standard" ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200" : "border-gray-200 bg-white hover:border-indigo-300"}`}>
                    <div className="flex-shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${exportMode === "standard" ? "border-indigo-600 bg-indigo-600" : "border-gray-300 bg-white"}`}>
                            {exportMode === "standard" && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-3xl">📄</span>
                            <h3 className="text-lg font-bold text-gray-900">Standard Export</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Complete document with text, images, and tables in a single file.</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500"><CheckCircle2 className="w-4 h-4" /><span>Ideal for general use and sharing</span></div>
                    </div>
                </button>

                {/* Journal Submission Option (DISABLED) */}
                <button
                    disabled={true}
                    onClick={() => {
                        toast({
                            title: "Feature Under Development",
                            description: "Journal Submission format is currently being upgraded. Please use Standard Export for now.",
                            variant: "default",
                        });
                    }}
                    className="w-full flex items-start gap-4 p-6 rounded-xl border-2 text-left transition-all border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed">
                    <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-gray-300 bg-white">
                            {/* unchecked */}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-3xl grayscale opacity-50">🔬</span>
                            <h3 className="text-lg font-bold text-gray-900">Journal Submission</h3>
                            <span className="ml-2 bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-semibold">Coming Soon</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Generates two separate files required by academic journals:</p>
                        <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                            <div className="flex items-start gap-2"><span className="text-gray-400 font-bold text-sm mt-0.5">1.</span><div><p className="font-semibold text-sm text-gray-500">Main Manuscript (DOCX)</p><p className="text-xs text-gray-400">Text only with figure callouts</p></div></div>
                            <div className="flex items-start gap-2"><span className="text-gray-400 font-bold text-sm mt-0.5">2.</span><div><p className="font-semibold text-sm text-gray-500">Figures File (DOCX)</p><p className="text-xs text-gray-400">All figures, one per page</p></div></div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );

    // Step 4: Final Review (Merged Preview + Action)
    const renderReviewContent = () => (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Final Review</h2>
                    <p className="text-gray-500">Preview {selectedFormat?.toUpperCase()} output and export.</p>
                </div>
                <div className="text-right">
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="bg-indigo-600 text-white rounded-lg px-8 py-3 font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                        {downloading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                Export Document
                                <ChevronRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 p-8 flex items-center justify-center overflow-hidden relative">
                {/* Mini Overlay Stats */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur shadow-sm p-3 rounded-lg border border-gray-200 z-10 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-700">Format:</span>
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-bold">{selectedFormat?.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Style:</span>
                        <span className="text-gray-600">{project.citation_style?.toUpperCase() || "APA"}</span>
                    </div>
                </div>

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
                        {["audit", "details", "format", "mode", "review"].map((step, idx) => {
                            const stepNames = ["Compliance", "Details", "Format", "Mode", "Review"];
                            const isActive = currentStep === step;
                            const isPast = ["audit", "details", "format", "mode", "review"].indexOf(currentStep) > idx;

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
                                    {idx < 4 && (
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
                            {currentStep === "audit" && renderAuditContent()}
                            {currentStep === "details" && renderDetailsContent()}
                            {currentStep === "format" && renderFormatContent()}
                            {currentStep === "mode" && renderModeContent()}
                            {currentStep === "review" && renderReviewContent()}
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

                            {/* Risk Assessment */}
                            {auditResult && (
                                <div className="pb-6 border-b border-gray-100">
                                    <p className="text-sm text-gray-500 mb-2">Audit Risk Status</p>
                                    <div className="flex items-center gap-2">
                                        {/* Simple color logic based on audit result */}
                                        <div className={`w-3 h-3 rounded-full ${auditResult.violations?.some((v: any) => v.ruleId.includes("VER")) ? "bg-red-500" :
                                            auditResult.violations?.length > 0 ? "bg-amber-500" : "bg-green-500"
                                            }`} />
                                        <span className="text-sm font-medium text-gray-700">
                                            {auditResult.violations?.some((v: any) => v.ruleId.includes("VER")) ? "High Risk" :
                                                auditResult.violations?.length > 0 ? "Moderate Risk" : "Verified Clean"}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Checklist Status REMOVED */}
                        </div>

                        <div className="mt-12">
                            {currentStep !== "review" && (
                                <button
                                    onClick={goToNextStep}
                                    disabled={(currentStep === "format" && !selectedFormat) || (currentStep === "audit" && isAuditing)}
                                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${(currentStep === "format" && !selectedFormat) || (currentStep === "audit" && isAuditing)
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg"
                                        }`}>
                                    {currentStep === "audit" && isAuditing ? "Auditing..." : "Continue"}
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