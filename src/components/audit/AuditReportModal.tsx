import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from "lucide-react";

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: any; // AuditReport type
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({ isOpen, onClose, report }) => {
  if (!report) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "VERIFIED": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "MISMATCH": return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "HALLUCINATION": return <XCircle className="w-5 h-5 text-red-500" />;
      case "UNSUPPORTED": return <HelpCircle className="w-5 h-5 text-orange-500" />;
      default: return <HelpCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getIntegrityColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Forensic Audit Report</span>
            <span className={`text-xl font-bold ${getIntegrityColor(report.integrityIndex)}`}>
              Integrity Score: {report.integrityIndex}/100
            </span>
          </DialogTitle>
          <DialogDescription>
             Analysis of {report.tierMetadata?.CLAIM?.stats?.candidates || 0} citations checked against academic databases.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100 items-center flex flex-col">
                    <span className="text-2xl font-bold text-green-700">
                        {report.verificationResults?.filter((r: any) => r.existenceStatus === 'CONFIRMED' && r.supportStatus !== 'DISPUTED').length || 0}
                    </span>
                    <span className="text-xs text-green-600 uppercase font-bold">Verified</span>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 items-center flex flex-col">
                    <span className="text-2xl font-bold text-yellow-700">
                         {report.flags?.filter((f: any) => f.ruleId.includes('MISMATCH')).length || 0}
                    </span>
                    <span className="text-xs text-yellow-600 uppercase font-bold">Mismatches</span>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-100 items-center flex flex-col">
                    <span className="text-2xl font-bold text-red-700">
                        {report.verificationResults?.filter((r: any) => r.existenceStatus === 'NOT_FOUND').length || 0}
                    </span>
                    <span className="text-xs text-red-600 uppercase font-bold">Hallucinations</span>
                </div>
                 <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 items-center flex flex-col">
                    <span className="text-2xl font-bold text-orange-700">
                        {report.verificationResults?.filter((r: any) => r.supportStatus === 'UNSUPPORTED' || r.supportStatus === 'CONTRADICTORY').length || 0}
                    </span>
                    <span className="text-xs text-orange-600 uppercase font-bold">Unsupported</span>
                </div>
            </div>

            {/* Detailed Flags */}
            <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Issues Detected</h3>
                {report.flags?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No issues detected. Excellent work!</div>
                ) : (
                    report.flags.map((flag: any, idx: number) => (
                        <div key={idx} className="p-4 border rounded-lg bg-white shadow-sm flex gap-4">
                            <div className="mt-1">
                                {flag.ruleId.includes('HALLUCINATION') ? getStatusIcon("HALLUCINATION") : 
                                 flag.ruleId.includes('MISMATCH') ? getStatusIcon("MISMATCH") : 
                                 <AlertTriangle className="w-5 h-5 text-gray-500" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h4 className="font-medium text-gray-900">{flag.message}</h4>
                                    <span className="text-xs font-mono text-gray-400">{flag.ruleId}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Context: </span> "{flag.anchor?.text}"
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-semibold">Reason: </span> {flag.reason}
                                </p>
                                <div className="mt-2 text-sm text-blue-600 font-medium">
                                    Action: {flag.action}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
             {/* Verification Evidence */}
             {report.verificationResults && report.verificationResults.length > 0 && (
                 <div className="space-y-4 mt-8">
                    <h3 className="font-semibold text-gray-900">Verification Evidence</h3>
                    {report.verificationResults.map((res: any, idx: number) => (
                        <div key={idx} className="p-3 border rounded bg-gray-50 text-sm">
                            <div className="font-medium">{res.inlineLocation?.text}</div>
                            <div className="flex gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-white border rounded text-xs">
                                    Status: {res.existenceStatus}
                                </span>
                                <span className="px-2 py-0.5 bg-white border rounded text-xs">
                                    Support: {res.supportStatus}
                                </span>
                            </div>
                            {res.foundPaper && (
                                <div className="mt-2 pl-2 border-l-2 border-blue-200">
                                    <div className="text-xs text-gray-500">Matched Source:</div>
                                    <div className="font-medium text-blue-800">{res.foundPaper.title}</div>
                                    <div className="text-xs text-gray-600">
                                        {res.foundPaper.authors?.join(", ")} ({res.foundPaper.year})
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                 </div>
             )}

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
