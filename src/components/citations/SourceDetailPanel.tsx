import React, { useEffect, useState } from "react";
import {
  ExternalLink,
  BookOpen,
  Calendar,
  MapPin,
  Sparkles,
  Activity,
  Loader2,
  Lock,
  Tag,
  FileText,
  X,
  Plus,
  Quote,
  Database,
  Search,
  CheckCircle2,
  ChevronLeft,
  Info,
  Link as LinkIcon,
  Hash,
  Globe,
  Archive,
  Fingerprint,
  PieChart
} from "lucide-react";
import { ConsensusBadge } from "./ConsensusBadge";
import { ZoteroIcon } from "../common/ZoteroIcon";
import { apiClient } from "../../services/apiClient";
import { ZoteroService } from "../../services/zoteroService";
import { useToast } from "../../hooks/use-toast";

export interface StoredCitation {
  id?: string;
  title: string;
  author?: string;
  authors?: string[];
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
  themes?: string[];
  matrix_notes?: string;
  itemType?: string;
  sourceType?: string;
  authorSummary?: string;
  // Zotero/Mendeley Specific Extended Fields
  publisher?: string;
  place?: string;
  section?: string;
  series?: string;
  seriesTitle?: string;
  seriesText?: string;
  partNumber?: string;
  partTitle?: string;
  journalAbbr?: string;
  citationKey?: string;
  accessed?: string;
  pmid?: string;
  pmcid?: string;
  issn?: string;
  archive?: string;
  locInArchive?: string;
  shortTitle?: string;
  language?: string;
  libraryCatalog?: string;
  callNumber?: string;
  license?: string;
  extra?: string;
  dateAdded?: string;
  dateModified?: string;
}

// Compact Info Row Component (Zotero-style)
const InfoRow: React.FC<{ label: string; value?: string | number; link?: boolean; mono?: boolean }> = ({ label, value, link, mono }) => {
  if (!value || value === 'N/A' || value === '') return null;
  const stringValue = value.toString();
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[90px_1fr] gap-1 sm:gap-4 py-1.5 border-b border-gray-50 last:border-0 items-start group overflow-hidden">
      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight pt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>
      {link ? (
        <a href={stringValue} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-600 font-bold break-all hover:underline flex items-center gap-1 leading-normal">
          {stringValue}
          <LinkIcon className="w-2.5 h-2.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ) : (
        <span className={`text-[11px] text-gray-800 font-bold block leading-normal break-words ${mono ? 'font-mono bg-gray-50 px-1 rounded' : ''}`}>
          {stringValue}
        </span>
      )}
    </div>
  );
};

// Compact Strip Field Component
const StripField: React.FC<{ label: string; value?: string | number; link?: boolean; mono?: boolean }> = ({ label, value, link, mono }) => {
  if (!value || value === 'N/A' || value === '') return null;
  const stringValue = value.toString();
  return (
    <div className="space-y-1">
      <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      {link ? (
        <a href={stringValue} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 font-bold break-all hover:underline flex items-center gap-1">
          <LinkIcon className="w-2.5 h-2.5 flex-shrink-0" />
          Link
        </a>
      ) : (
        <span className={`text-[11px] text-gray-800 font-bold block ${mono ? 'font-mono bg-gray-50 px-1 rounded border border-gray-100' : ''}`}>
          {stringValue}
        </span>
      )}
    </div>
  );
};

interface SourceDetailPanelProps {
  source: StoredCitation;
  projectId: string;
  onBack: () => void;
  onUpdate: (updatedSource: StoredCitation) => void;
  isPremium?: boolean;
}

export const SourceDetailPanel: React.FC<SourceDetailPanelProps> = ({
  source,
  projectId,
  onBack,
  onUpdate,
  isPremium = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);
  const normalizedSource = React.useMemo<StoredCitation>(() => {
    const s = source as any;
    
    // Author Normalization
    let authors: string[] = [];
    if (s.authors && Array.isArray(s.authors)) {
      authors = s.authors.map((a: any) => {
        if (typeof a === 'string') return a;
        if (a.last_name && a.first_name) return `${a.last_name}, ${a.first_name}`;
        if (a.lastName && a.firstName) return `${a.lastName}, ${a.firstName}`;
        if (a.family && a.given) return `${a.family}, ${a.given}`;
        return a.name || a.literal || "Unknown";
      });
    } else if (s.data?.creators) {
      authors = s.data.creators.map((c: any) => `${c.lastName || ''}, ${c.firstName || ''}`.trim() || c.name || "Unknown");
    } else if (s.meta?.creatorSummary) {
      authors = [s.meta.creatorSummary];
    } else if (s.author) {
      authors = [s.author];
    }

    return {
      title: s.title || s.data?.title || "Untitled",
      authors,
      authorSummary: authors.join("; "),
      year: (s.year || s.data?.date || s.data?.year || "N/A").toString(),
      journal: s.journal || s.data?.publicationTitle || s.source || s.data?.publisher || "N/A",
      publisher: s.publisher || s.data?.publisher || "N/A",
      place: s.place || s.data?.place || "N/A",
      volume: s.volume || s.data?.volume || "N/A",
      issue: s.issue || s.data?.issue || "N/A",
      pages: s.pages || s.data?.pages || "N/A",
      doi: s.doi || s.data?.DOI || (s.identifiers as any)?.doi || "N/A",
      url: s.url || s.data?.url || "N/A",
      abstract: s.abstract || s.data?.abstractNote || s.abstractNote || "",
      itemType: s.type || s.data?.itemType || "Journal Article",
      sourceType: s.source ? String(s.source).toLowerCase() : (!s.id && (s.key || s.data?.key) ? 'zotero' : (!s.id && (s.profile_id || s.group_id) ? 'mendeley' : 'project')),
      
      // Extended Fields
      section: s.section || s.data?.section || "N/A",
      series: s.series || s.data?.series || "N/A",
      seriesTitle: s.seriesTitle || s.data?.seriesTitle || "N/A",
      seriesText: s.seriesText || s.data?.seriesText || "N/A",
      partNumber: s.partNumber || s.data?.partNumber || "N/A",
      partTitle: s.partTitle || s.data?.partTitle || "N/A",
      journalAbbr: s.journalAbbr || s.data?.journalAbbreviation || "N/A",
      citationKey: s.citationKey || s.data?.citationKey || "N/A",
      accessed: s.accessed || s.data?.accessDate || "N/A",
      pmid: s.pmid || s.data?.PMID || "N/A",
      pmcid: s.pmcid || s.data?.PMCID || "N/A",
      issn: s.issn || s.data?.ISSN || "N/A",
      archive: s.archive || s.data?.archive || "N/A",
      locInArchive: s.locInArchive || s.data?.locInArchive || "N/A",
      shortTitle: s.shortTitle || s.data?.shortTitle || "N/A",
      language: s.language || s.data?.language || "N/A",
      libraryCatalog: s.libraryCatalog || s.data?.libraryCatalog || "N/A",
      callNumber: s.callNumber || s.data?.callNumber || "N/A",
      license: s.license || s.data?.rights || "N/A",
      extra: s.extra || s.data?.extra || "N/A",
      dateAdded: s.dateAdded || s.data?.dateAdded || s.meta?.dateAdded || "N/A",
      dateModified: s.dateModified || s.data?.dateModified || s.meta?.dateModified || "N/A"
    } as StoredCitation;
  }, [source]);

  // Safe open link
  const handleVisitSource = () => {
    if (normalizedSource.url !== "N/A" || normalizedSource.doi !== "N/A") {
      const targetUrl = normalizedSource.url !== "N/A" ? normalizedSource.url : `https://doi.org/${normalizedSource.doi}`;
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [consensusClaim, setConsensusClaim] = useState("");
  const [consensusResult, setConsensusResult] = useState<any>(null);
  const [isAnalyzingConsensus, setIsAnalyzingConsensus] = useState(false);

  const handleUpdateNotes = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    if (!source.id || !projectId || newNotes === source.matrix_notes) return;
    setIsSaving(true);
    try {
      const { CitationService } = await import("../../services/citationService");
      await CitationService.updateCitationThemes(projectId, source.id, { matrix_notes: newNotes });
      onUpdate({ ...source, matrix_notes: newNotes });
    } catch (err) {
      console.error("Notes update failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzeConsensus = async () => {
    if (!consensusClaim.trim() || !projectId || isAnalyzingConsensus) return;
    if (!normalizedSource.abstract) {
      toast({ title: "Abstract Required", variant: "destructive" });
      return;
    }
    setIsAnalyzingConsensus(true);
    setConsensusResult(null);
    try {
      const response = await apiClient.post(`/api/citations/${projectId}/consensus`, {
        claim: consensusClaim,
        citationIds: source.id ? [source.id] : undefined,
      });
      if (response.success) setConsensusResult(response.consensus);
    } catch (error) {
      console.error("Consensus failed", error);
    } finally {
      setIsAnalyzingConsensus(false);
    }
  };

  const [isInfoExpanded, setIsInfoExpanded] = useState(true);

  return (
    <div className="flex h-full bg-white relative overflow-visible font-sans text-left border-l border-gray-100">
      
      {/* MAIN WORKSPACE: RESEARCH FINDINGS */}
      <div className="flex-1 flex flex-col min-w-[280px] shadow-sm z-40 bg-white overflow-hidden">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${normalizedSource.sourceType === 'zotero' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                    {normalizedSource.sourceType === 'zotero' ? <ZoteroIcon className="w-5 h-5 drop-shadow-sm" /> : <BookOpen className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {normalizedSource.sourceType === 'zotero' && <span className="flex items-center justify-center bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest leading-none top-0.5 relative">Zotero</span>}
                      <h2 className={`text-[10px] font-black uppercase tracking-widest leading-none ${normalizedSource.sourceType === 'zotero' ? 'text-red-600/80 mt-0.5' : 'text-gray-400 mt-0.5'}`}>
                          {normalizedSource.sourceType === 'zotero' ? 'Reference Library' : 'Research Center'}
                      </h2>
                    </div>
                    <p className="text-xs font-black text-gray-900 leading-none">{normalizedSource.title.slice(0, 30)}...</p>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <button onClick={onBack} className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 scroll-smooth">
            {/* Title & Creators (Compact) */}
            <section className="space-y-3">
                <h1 className="text-lg font-black text-gray-900 leading-tight tracking-tight break-words">
                    {normalizedSource.title}
                </h1>
            </section>

            {/* Info Collapsible Section (Zotero-style List) */}
            <section className="space-y-3 pt-2">
                <button 
                  onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                  className="flex items-center gap-2 px-1 text-indigo-600 w-full hover:bg-indigo-50/50 py-1 rounded transition-colors"
                >
                    <Info className="w-3.5 h-3.5" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest flex-1 text-left">Info</h4>
                    <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-200 ${isInfoExpanded ? '-rotate-90' : 'rotate-0'}`} />
                </button>
                
                {isInfoExpanded && (
                  <div className="space-y-1.5 px-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      <InfoRow label="Item Type" value={normalizedSource.itemType} />
                      <InfoRow label="Title" value={normalizedSource.title} />
                      <InfoRow label="Author" value={normalizedSource.authorSummary} />
                      <InfoRow label="Publication" value={normalizedSource.journal} />
                      <InfoRow label="Publisher" value={normalizedSource.publisher} />
                      <InfoRow label="Place" value={normalizedSource.place} />
                      <InfoRow label="Date" value={normalizedSource.year} />
                      <InfoRow label="Volume" value={normalizedSource.volume} />
                      <InfoRow label="Issue" value={normalizedSource.issue} />
                      <InfoRow label="Section" value={normalizedSource.section} />
                      <InfoRow label="Part Number" value={normalizedSource.partNumber} />
                      <InfoRow label="Part Title" value={normalizedSource.partTitle} />
                      <InfoRow label="Pages" value={normalizedSource.pages} />
                      <InfoRow label="Series" value={normalizedSource.series} />
                      <InfoRow label="Series Title" value={normalizedSource.seriesTitle} />
                      <InfoRow label="Series Text" value={normalizedSource.seriesText} />
                      <InfoRow label="Journal Abbr" value={normalizedSource.journalAbbr} />
                      <InfoRow label="DOI" value={normalizedSource.doi} mono />
                      <InfoRow label="Citation Key" value={normalizedSource.citationKey} mono />
                      <InfoRow label="URL" value={normalizedSource.url} link />
                      <InfoRow label="Accessed" value={normalizedSource.accessed} />
                      <InfoRow label="PMID" value={normalizedSource.pmid} mono />
                      <InfoRow label="PMCID" value={normalizedSource.pmcid} mono />
                      <InfoRow label="Library Catalog" value={normalizedSource.libraryCatalog} />
                      <InfoRow label="Language" value={normalizedSource.language} />
                      <InfoRow label="Rights" value={normalizedSource.license} />
                      <InfoRow label="Extra" value={normalizedSource.extra} />
                  </div>
                )}
            </section>

            {/* Abstract Preview */}
            <section className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 px-1 text-blue-600">
                    <FileText className="w-3.5 h-3.5" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Abstract Executive Summary</h4>
                </div>
                <div className="text-[12px] text-gray-600 leading-relaxed font-inter bg-slate-50/50 p-4 rounded-lg border border-slate-100 italic break-words">
                    {normalizedSource.abstract || "Detailed abstract records not found for this entry."}
                </div>
            </section>

            {/* RESEARCH FINDINGS (Renamed Matrix Notes) */}
            <section className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-1 text-purple-600">
                        <Sparkles className="w-3.5 h-3.5" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest">Findings & Gap Analysis</h4>
                    </div>
                    {isSaving && <Loader2 className="w-3 h-3 animate-spin text-purple-400" />}
                </div>
                <textarea
                    className="w-full h-48 p-4 text-[13px] bg-white border border-gray-200 rounded-lg focus:ring-4 focus:ring-purple-50 outline-none transition-all placeholder:text-gray-300 font-inter leading-relaxed"
                    placeholder="Document specific gaps, methods, or critical findings discovered in this source..."
                    defaultValue={source.matrix_notes}
                    onBlur={handleUpdateNotes}
                    disabled={!isPremium}
                />
            </section>

            {/* Consensus (Bottom) */}
            <section className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 px-1 text-indigo-600">
                    <Activity className="w-3.5 h-3.5" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Scientific Consensus</h4>
                </div>
                <div className="relative group">
                    <input
                        type="text"
                        value={consensusClaim}
                        onChange={(e) => setConsensusClaim(e.target.value)}
                        disabled={!isPremium || isAnalyzingConsensus}
                        placeholder="Verify research claim..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold placeholder:text-gray-400 focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                    />
                    <button
                        onClick={handleAnalyzeConsensus}
                        disabled={!isPremium || isAnalyzingConsensus || !consensusClaim.trim()}
                        className="absolute right-1 top-1 p-1.5 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isAnalyzingConsensus ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                    </button>
                </div>
                {consensusResult && (
                    <div className="pt-2 animate-in fade-in slide-in-from-bottom-2 space-y-2">
                        <ConsensusBadge 
                            consensusLevel={consensusResult.consensusLevel || "emerging"} 
                            agreementPercentage={consensusResult.agreementPercentage || 50} 
                        />
                        <div className="grid grid-cols-1 gap-1 border border-gray-100 rounded bg-gray-50 p-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Methodology</span>
                                <span className="text-[10px] font-bold text-indigo-600">{consensusResult.methodologyScore}/100</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Bias Risk</span>
                                <span className={`text-[10px] font-bold ${consensusResult.biasCheckStatus === 'pass' ? 'text-emerald-600' : 'text-orange-600'}`}>{consensusResult.biasCheckStatus?.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Convergence</span>
                                <span className={`text-[10px] font-bold ${consensusResult.evidenceConvergent ? 'text-emerald-600' : 'text-gray-500'}`}>{consensusResult.evidenceConvergent ? 'High' : 'Limited'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Extra Evid.</span>
                                <span className={`text-[10px] font-bold ${consensusResult.extraordinaryEvidenceRequired ? 'text-orange-600' : 'text-emerald-600'}`}>{consensusResult.extraordinaryEvidenceRequired ? 'REQUIRED' : 'NO'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Dissent</span>
                                <span className={`text-[10px] font-bold ${consensusResult.dissentAcknowledged ? 'text-indigo-600' : 'text-gray-500'}`}>{consensusResult.dissentAcknowledged ? 'YES' : 'NO'}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent("apply-consensus-highlight", {
                                    detail: { claim: consensusClaim, result: consensusResult }
                                }));
                                toast({ title: "Applied to Editor", description: "Consensus metadata applied to document." });
                            }}
                            className="w-full flex items-center justify-center gap-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-bold transition-colors mt-2"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Apply Verification to Editor
                        </button>
                    </div>
                )}
            </section>

            {/* External Action */}
            <div className="pt-6">
                <button
                    onClick={handleVisitSource}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center justify-center gap-3">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Original Source
                </button>
            </div>
            
            <div className="h-12" />
        </div>
      </div>
    </div>
  );
};

export default SourceDetailPanel;
