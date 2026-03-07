import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { CheckCircle, AlertTriangle, XCircle, HelpCircle, FileText } from "lucide-react";

interface AuditReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: any; // AuditReport type
}

const IssueCard: React.FC<{ issue: any }> = ({ issue }) => {
    return (
        <div className="group relative p-4 rounded-[28px] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex gap-4">
                <div className={`mt-1 p-2 rounded-2xl ${issue.severity === 'CRITICAL' ? 'bg-red-50 text-red-500' :
                    issue.severity === 'MAJOR' ? 'bg-orange-50 text-orange-500' : 'bg-yellow-50 text-yellow-500'
                    }`}>
                    {issue.severity === 'CRITICAL' ? <XCircle className="w-5 h-5" /> :
                        issue.severity === 'MAJOR' ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`text-[13px] font-black uppercase tracking-wide mb-1 ${issue.severity === 'CRITICAL' ? 'text-red-600' :
                        issue.severity === 'MAJOR' ? 'text-orange-600' : 'text-yellow-600'
                        }`}>
                        {issue.type.replace(/_/g, " ")}
                    </h4>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed mb-3">
                        {issue.message}
                    </p>

                    {issue.location && (
                        <p className="text-[10px] font-bold text-slate-400 mb-3">
                            Found at position {issue.location.startPos}-{issue.location.endPos}
                        </p>
                    )}

                    {issue.suggestedFix && (
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/50 flex items-center justify-between group/fix hover:border-blue-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <p className="text-[11px] font-bold text-slate-700">
                                    <span className="text-slate-400 mr-2 uppercase">Fix:</span>
                                    {issue.suggestedFix}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export const AuditReportModal: React.FC<AuditReportModalProps> = ({ isOpen, onClose, report }) => {
    if (!report) return null;

    const getIntegrityColor = (score: number) => {
        if (score >= 90) return "text-green-600 bg-green-50";
        if (score >= 70) return "text-orange-600 bg-orange-50";
        return "text-red-600 bg-red-50";
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl rounded-[40px] border-none shadow-2xl p-0 bg-white overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-white px-10 pt-10 pb-8 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Citation Audit</h2>
                            <p className="text-slate-500 font-medium text-sm">
                                Analysis of {report.summary?.totalInTextCitations || 0} citations checked against academic databases.
                            </p>
                        </div>
                        <div className={`px-6 py-3 rounded-3xl border-2 border-current/5 flex flex-col items-center justify-center ${getIntegrityColor(report.integrityIndex || 0)}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5">Integrity Score</p>
                            <p className="text-3xl font-black">{typeof (report.integrityIndex) === 'number' ? report.integrityIndex.toFixed(2) : (report.integrityIndex || 0)}<span className="text-lg opacity-40 ml-0.5">/100</span></p>
                        </div>
                    </div>
                </div>

                {report.isCached && (
                    <div className="mx-10 mt-4 px-4 py-2 bg-blue-50/50 border border-blue-100/50 rounded-2xl flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-blue-500" />
                        <p className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest">
                            ⚡ Cached Result: Document state is identical to last audit.
                        </p>
                    </div>
                )}


                <ScrollArea className="flex-1 max-h-[60vh] px-10">
                    <div className="space-y-8 py-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                <AlertTriangle className="w-5 h-5 text-slate-400" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Issues by Risk Level</h3>
                            </div>
                            {(!report.issues || report.issues.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-100 rounded-3xl">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-400" />
                                    </div>
                                    <p className="font-bold text-slate-800">No issues detected</p>
                                    <p className="text-sm text-slate-500">Your document meets all citation integrity standards.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Critical Issues */}
                                    {report.issues.filter((i: any) => i.severity === 'CRITICAL').length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between bg-red-50/50 px-4 py-3 rounded-2xl border border-red-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
                                                    <p className="text-xs font-black text-red-700 uppercase tracking-widest">Critical Risk</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Immediate Attention Required</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {report.issues.filter((i: any) => i.severity === 'CRITICAL').map((issue: any, idx: number) => (
                                                    <IssueCard key={idx} issue={issue} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Major Issues */}
                                    {report.issues.filter((i: any) => i.severity === 'MAJOR').length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between bg-orange-50/50 px-4 py-3 rounded-2xl border border-orange-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                                    <p className="text-xs font-black text-orange-700 uppercase tracking-widest">Major Risk</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Action Recommended</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {report.issues.filter((i: any) => i.severity === 'MAJOR').map((issue: any, idx: number) => (
                                                    <IssueCard key={idx} issue={issue} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Minor Issues */}
                                    {report.issues.filter((i: any) => i.severity === 'MINOR').length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between bg-yellow-50/50 px-4 py-3 rounded-2xl border border-yellow-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                                                    <p className="text-xs font-black text-yellow-700 uppercase tracking-widest">Minor Risk</p>
                                                </div>
                                                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Style & Formatting</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                {report.issues.filter((i: any) => i.severity === 'MINOR').map((issue: any, idx: number) => (
                                                    <IssueCard key={idx} issue={issue} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Evidence & Sources */}
                        {report.verificationResults && report.verificationResults.length > 0 && (
                            <div className="space-y-5 border-t border-slate-100 pt-8">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    Source Evidence & Matching
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {report.verificationResults.map((res: any, idx: number) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <p className="font-bold text-slate-800 truncate max-w-[70%]">"{res.inlineLocation?.text}"</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${res.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {res.status}
                                                </span>
                                            </div>

                                            {res.foundPaper ? (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold text-blue-600 line-clamp-2 leading-snug">
                                                        {res.foundPaper.title}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase">
                                                            {res.foundPaper.database}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                                                            Sim: {(res.similarity * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 italic mt-2">{res.message}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

            </DialogContent>
        </Dialog>
    );
};
