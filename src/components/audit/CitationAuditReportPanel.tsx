import * as React from "react";
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, HelpCircle, FileText, ExternalLink, ChevronDown, ChevronRight, Target, Search, Trash2, RefreshCw } from "lucide-react";

interface CitationAuditReportPanelProps {
    report: any; // AuditReport type
    onBack: () => void;
    onNavigateToIssue?: (location: { startPos: number, endPos: number }) => void;
    onExecuteFix?: (issue: any) => void;
}

const IssueCard: React.FC<{
    issue: any,
    onNavigate?: (loc: { startPos: number, endPos: number }) => void,
    onFix?: (issue: any) => void
}> = ({ issue, onNavigate, onFix }) => {
    const isCritical = issue.severity === 'CRITICAL';
    const isMajor = issue.severity === 'MAJOR';

    return (
        <div className="group relative p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex gap-5">
                <div className={`mt-1 flex-shrink-0 ${isCritical ? 'text-red-500' : isMajor ? 'text-orange-500' : 'text-yellow-500'}`}>
                    {isCritical ? <XCircle className="w-7 h-7" /> :
                        isMajor ? <AlertTriangle className="w-7 h-7" /> : <HelpCircle className="w-7 h-7" />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1.5">
                        <h4 className={`text-[11px] font-black uppercase tracking-wider ${isCritical ? 'text-red-600' : isMajor ? 'text-orange-600' : 'text-yellow-600'}`}>
                            {issue.type.replace(/_/g, " ")}
                        </h4>
                        {issue.location && onNavigate && (
                            <button
                                onClick={() => onNavigate(issue.location)}
                                className="text-[10px] font-bold text-slate-300 hover:text-blue-500 uppercase tracking-widest transition-colors"
                            >
                                View in Doc
                            </button>
                        )}
                    </div>

                    <p className="text-[14px] font-medium text-slate-600 leading-relaxed mb-2">
                        {issue.message}
                    </p>

                    {issue.location && (
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">
                            Found at position {issue.location.startPos}-{issue.location.endPos}
                        </p>
                    )}

                    {/* Integrated Fix Helper Box */}
                    {issue.suggestedFix && (
                        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between group/fix hover:border-emerald-200 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-white rounded-full shadow-sm">
                                    <Target className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                <p className="text-[11px] font-bold text-slate-700">
                                    <span className="text-[9px] font-black text-slate-400 mr-2 uppercase tracking-widest">Recommended Action:</span>
                                    {issue.suggestedFix}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {issue.action === 'RESOLVE' ? (
                                    <button
                                        onClick={() => onFix?.({ ...issue, action: 'RESOLVE' })}
                                        className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-colors"
                                    >
                                        Resolve Now
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onFix?.({ ...issue, action: 'SEARCH' })}
                                        className="px-4 py-2 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 shadow-md shadow-blue-100 transition-all flex items-center gap-2"
                                    >
                                        <Search className="w-3 h-3" />
                                        Take Action
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const CitationAuditReportPanel: React.FC<CitationAuditReportPanelProps> = ({ report, onBack, onNavigateToIssue, onExecuteFix }) => {
    if (!report) return null;

    const severities = [
        { id: 'CRITICAL', label: 'CRITICAL RISK', sub: 'IMMEDIATE ATTENTION REQUIRED', color: 'bg-red-500' },
        { id: 'MAJOR', label: 'MAJOR RISK', sub: 'ACTION RECOMMENDED', color: 'bg-orange-500' },
        { id: 'MINOR', label: 'MINOR NOTICE', sub: 'STRUCTURAL IMPROVEMENT', color: 'bg-yellow-500' }
    ];

    return (
        <div className="flex flex-col h-full bg-white font-sans">
            {/* Minimalist Header */}
            <div className="flex items-center gap-4 p-8 border-b border-slate-50 bg-white flex-shrink-0">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all border border-transparent hover:border-slate-100"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">Citation Audit Report</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Reference & Bibliography Analysis</p>
                </div>
            </div>

            {/* Simplest Results View */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
                <div className="px-12 py-12 max-w-6xl mx-auto space-y-16">
                    {severities.map(sev => {
                        const sevIssues = report.issues?.filter((i: any) => i.severity === sev.id) || [];
                        if (sevIssues.length === 0) return null;

                        return (
                            <div key={sev.id} className="space-y-8">
                                {/* Severity Section Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${sev.color} shadow-lg shadow-current/20 animate-pulse`} />
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">{sev.label}</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{sev.sub}</span>
                                </div>

                                {/* Issue List */}
                                <div className="grid grid-cols-1 gap-6">
                                    {sevIssues.map((issue: any, idx: number) => (
                                        <IssueCard
                                            key={issue.id || idx}
                                            issue={issue}
                                            onNavigate={onNavigateToIssue}
                                            onFix={onExecuteFix}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {(!report.issues || report.issues.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-[40px] flex items-center justify-center mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Perfect Integrity</h3>
                            <p className="text-slate-500 font-medium max-w-xs mt-2">No citation mismatches or bibliography errors were found in this document.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
