import React from "react";
import {
    ArrowLeft,
    ExternalLink,
    BookOpen,
    Calendar,
    MapPin,
    Hash,
    ShieldCheck,
    Globe,
    Sparkles,
    Activity,
    Loader2,
    Lock
} from "lucide-react";
import { ConsensusBadge } from "./ConsensusBadge";
import { apiClient } from "../../services/apiClient";

export interface StoredCitation {
    id?: string;
    title: string;
    author?: string; // Backend often stores as string
    authors?: string[]; // Frontend service uses array
    year?: number | string;
    journal?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    doi?: string;
    url?: string;
    source?: string;
    abstract?: string;
    citation_count?: number;
    impactFactor?: string | number;
    openAccess?: boolean;
    type?: string;
    formatted_citations?: any;
    themes?: string[]; // Added
    matrix_notes?: string; // Added
}

interface SourceDetailPanelProps {
    source: StoredCitation;
    projectId: string; // Added
    onBack: () => void;
    onUpdate: (updatedSource: StoredCitation) => void; // Added
    isResearcher?: boolean; // Added for entitlement check
}

export const SourceDetailPanel: React.FC<SourceDetailPanelProps> = ({
    source,
    projectId,
    onBack,
    onUpdate,
    isResearcher = false // Default to false if not provided
}) => {
    // Normalize authors
    const getAuthors = () => {
        if (Array.isArray(source.authors)) return source.authors.join(", ");
        return source.author || "Unknown Author";
    };

    // Safe open link
    const handleVisitSource = () => {
        if (source.url || source.doi) {
            const targetUrl = source.url || `https://doi.org/${source.doi}`;
            window.open(targetUrl, "_blank", "noopener,noreferrer");
        }
    };

    const themes = ["Gap", "Methodology", "Result"];
    const [isSaving, setIsSaving] = React.useState(false);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);

    // Consensus Meter State
    const [consensusClaim, setConsensusClaim] = React.useState("");
    const [consensusResult, setConsensusResult] = React.useState<any>(null);
    const [isAnalyzingConsensus, setIsAnalyzingConsensus] = React.useState(false);

    const handleAnalyze = async () => {
        if (!source.id || !projectId || isAnalyzing) return;

        // Alert if no abstract
        if (!source.abstract) {
            alert("No abstract available for this source. Please use a source with an abstract.");
            return;
        }

        setIsAnalyzing(true);
        try {
            const { CitationService } = await import("../../services/citationService");
            const updated = await CitationService.analyzeCitation(projectId, source.id);
            if (updated) {
                onUpdate(updated);
                // DEBUG: Show exactly what was received
                alert(`Analysis Result:\nThemes: ${JSON.stringify(updated.themes)}\nNotes: ${updated.matrix_notes}`);
            }
        } catch (err: any) {
            console.error("Analysis failed", err);
            alert(`Analysis failed: ${err.message || "Unknown error"}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleToggleTheme = async (theme: string) => {
        if (!source.id || !projectId) return;

        setIsSaving(true);
        try {
            const currentThemes = source.themes || [];
            const newThemes = currentThemes.includes(theme)
                ? currentThemes.filter(t => t !== theme)
                : [...currentThemes, theme];

            const { CitationService } = await import("../../services/citationService");
            await CitationService.updateCitationThemes(projectId, source.id, { themes: newThemes });

            onUpdate({ ...source, themes: newThemes });
        } catch (err) {
            console.error("Failed to update theme", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateNotes = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
        const newNotes = e.target.value;
        if (!source.id || !projectId || newNotes === source.matrix_notes) return;

        setIsSaving(true);
        try {
            const { CitationService } = await import("../../services/citationService");
            await CitationService.updateCitationThemes(projectId, source.id, { matrix_notes: newNotes });

            onUpdate({ ...source, matrix_notes: newNotes });
        } catch (err) {
            console.error("Failed to update notes", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAnalyzeConsensus = async () => {
        if (!consensusClaim.trim() || !projectId || isAnalyzingConsensus) return;

        // Check if abstract is available
        if (!source.abstract) {
            alert("Cannot analyze: This paper doesn't have an abstract. Please try adding it from a search result that includes abstracts.");
            return;
        }

        setIsAnalyzingConsensus(true);
        setConsensusResult(null);

        try {
            const response = await apiClient.post(`/api/citations/${projectId}/consensus`, {
                claim: consensusClaim,
                citationIds: source.id ? [source.id] : undefined
            });

            if (response.data.success) {
                setConsensusResult(response.data.consensus);
            }
        } catch (error: any) {
            console.error("Consensus analysis failed", error);
            alert(`Analysis failed: ${error.message || "Unknown error"}`);
        } finally {
            setIsAnalyzingConsensus(false);
        }
    };

    const isOpenAccess = false; // We don't have this metadata explicitly yet, but could check type.

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                    onClick={onBack}
                    className="p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors"
                    title="Back to Library"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 truncate flex-1">
                    Source Details
                </h2>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {/* Title & Provenance */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900 leading-snug mb-3">
                        {source.title}
                    </h1>
                    <div className="flex flex-wrap gap-2 text-xs mb-4">
                        {/* Badges */}
                        {source.source === "arxiv" ? (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-medium border border-orange-200 uppercase tracking-wide">
                                Preprint
                            </span>
                        ) : (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium border border-blue-200 uppercase tracking-wide flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Peer-Reviewed
                            </span>
                        )}

                        {isOpenAccess && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-medium border border-green-200 uppercase tracking-wide flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Open Access
                            </span>
                        )}
                    </div>
                </div>

                {/* Metadata Grid */}
                <div className="space-y-4 mb-8">
                    <div className="flex gap-3">
                        <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Authors</span>
                            <p className="text-sm text-gray-800">{getAuthors()}</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Year</span>
                            <p className="text-sm text-gray-800">{source.year || "N/A"}</p>
                        </div>
                    </div>

                    {(source.journal || source.source) && (
                        <div className="flex gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Venue / Source</span>
                                <p className="text-sm text-gray-800">
                                    {source.journal ? source.journal : (source.source || "Unknown")}
                                    {source.volume && `, Vol. ${source.volume}`}
                                    {source.issue && `, Issue ${source.issue}`}
                                    {source.pages && `, pp. ${source.pages}`}
                                </p>
                            </div>
                        </div>
                    )}

                    {source.doi && (
                        <div className="flex gap-3">
                            <Hash className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">DOI</span>
                                <p className="text-sm text-gray-800 break-all font-mono">{source.doi}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Abstract Preview */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-900">Abstract preview</h3>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">(For verification only)</span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 relatiive group select-none">
                        {/* No select, no copy */}
                        <div className="select-none pointer-events-none">
                            <p className="text-sm text-gray-600 leading-relaxed font-serif relative">
                                {source.abstract ? (
                                    <>
                                        {source.abstract.slice(0, 400)}
                                        {source.abstract.length > 400 && "..."}
                                        {/* Fade effect overlay */}
                                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                                    </>
                                ) : (
                                    <span className="italic text-gray-400">No abstract available for this source.</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                        Reading and interpretation should be done at the source.
                    </p>
                </div>

                {/* Literature Matrix Themes */}
                <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl relative overflow-hidden">
                    {/* Entitlement Lock Overlay */}
                    {!isResearcher && (
                        <div className="absolute inset-0 z-10 bg-gray-50/60 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 p-4 text-center">
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <Lock className="w-5 h-5 text-gray-500" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">Researcher Plan Feature</p>
                                <p className="text-xs text-gray-500 max-w-[200px] mb-2">
                                    Upgrade to tag sources for your Literature Matrix.
                                </p>
                                {/* We could add a button here to trigger upgrade modal if we had the handler passed down */}
                            </div>
                        </div>
                    )}

                    {isSaving && (
                        <div className="absolute top-4 right-4 text-[10px] font-bold text-gray-400 animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            SAVING...
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-700">Literature Matrix Tags</h3>
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !isResearcher}
                            className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 hover:text-blue-800 disabled:opacity-50 transition-colors"
                            title={!source.abstract ? "Abstract required for analysis" : "Analyze with AI"}
                        >
                            <Sparkles className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                            {isAnalyzing ? "Analyzing..." : "Auto-Analyze"}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {themes.map(theme => {
                            const isSelected = source.themes?.includes(theme);
                            return (
                                <button
                                    key={theme}
                                    onClick={() => handleToggleTheme(theme)}
                                    disabled={!isResearcher}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${isSelected
                                        ? "bg-slate-700 text-white border-slate-700 shadow-sm"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    {theme}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-4">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Matrix Notes</label>
                        <textarea
                            className="w-full p-3 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all placeholder:text-gray-300 min-h-[80px]"
                            placeholder="Identify specific gaps or findings in this source for the Literature Matrix..."
                            defaultValue={source.matrix_notes}
                            onBlur={handleUpdateNotes}
                            disabled={!isResearcher}
                        />
                    </div>
                </div>

                {/* Consensus Meter */}
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl relative overflow-hidden">
                    {/* Entitlement Lock Overlay */}
                    {!isResearcher && (
                        <div className="absolute inset-0 z-10 bg-gray-50/60 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 p-4 text-center">
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <Lock className="w-5 h-5 text-gray-500" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">Researcher Plan Feature</p>
                                <p className="text-xs text-gray-500 max-w-[200px] mb-2">
                                    Upgrade to analyze consensus for this source.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-gray-600" />
                        <h3 className="text-sm font-bold text-gray-700">Consensus Analysis</h3>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                        Assess whether this paper supports, opposes, or remains neutral regarding a specific research claim.
                    </p>

                    {/* Claim Input */}
                    <div className="mb-3">
                        <input
                            type="text"
                            value={consensusClaim}
                            onChange={(e) => setConsensusClaim(e.target.value)}
                            placeholder="Enter a claim (e.g., 'AI replaces jobs')"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition-all placeholder:text-gray-400"
                            disabled={isAnalyzingConsensus || !isResearcher}
                        />
                    </div>

                    <button
                        onClick={handleAnalyzeConsensus}
                        disabled={!consensusClaim.trim() || isAnalyzingConsensus || !isResearcher}
                        className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzingConsensus ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Activity className="w-4 h-4" />
                                Analyze Stance
                            </>
                        )}
                    </button>

                    {/* Results */}
                    {consensusResult && (
                        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-900">Analysis Result:</span>
                                <ConsensusBadge
                                    consensusLevel={consensusResult.consensusLevel}
                                    agreementPercentage={consensusResult.agreementPercentage}
                                    showLabel={false}
                                    size="sm"
                                />
                            </div>
                            <p className="text-xs text-gray-700 mb-2">{consensusResult.summary}</p>

                            {consensusResult.supporting.length > 0 && (
                                <div className="text-xs text-emerald-700 mb-1">
                                    ✓ <strong>{consensusResult.supporting.length}</strong> supporting
                                </div>
                            )}
                            {consensusResult.opposing.length > 0 && (
                                <div className="text-xs text-red-700 mb-1">
                                    ✗ <strong>{consensusResult.opposing.length}</strong> opposing
                                </div>
                            )}
                            {consensusResult.neutral.length > 0 && (
                                <div className="text-xs text-gray-600">
                                    ○ <strong>{consensusResult.neutral.length}</strong> neutral
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* External Action */}
                <button
                    onClick={handleVisitSource}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <ExternalLink className="w-4 h-4" />
                    Visit Source
                </button>
            </div>
        </div>
    );
};
