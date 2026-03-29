import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { Sparkles, CheckCircle2, AlertCircle, HelpCircle, X, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface ConsensusBubbleMenuProps {
  editor: Editor;
  projectId: string;
}

export const ConsensusBubbleMenu: React.FC<ConsensusBubbleMenuProps> = ({ editor, projectId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!editor) return;

      const { selection } = editor.state;
      const { $from } = selection;

      // Only show if cursor is inside a consensus highlight mark
      const marks = $from.marks();
      const consensusMark = marks.find(m => m.type.name === 'citation-highlight' && m.attrs.type === 'consensus');

      if (!consensusMark) {
        setIsVisible(false);
        setResult(null);
        return;
      }

      setIsVisible(true);

      // Parse result from mark attrs
      setResult({
        consensusLevel: consensusMark.attrs.consensusLevel,
        agreementPercentage: consensusMark.attrs.consensusScore,
        summary: consensusMark.attrs.message?.replace(/^[A-Z]+: /, ''), // Remove the prefix if any
        evidenceConvergent: consensusMark.attrs.evidenceConvergent,
        dissentAcknowledged: consensusMark.attrs.dissentAcknowledged,
        biasCheckStatus: consensusMark.attrs.biasCheckStatus,
        methodologyScore: consensusMark.attrs.methodologyScore,
        extraordinaryEvidenceRequired: consensusMark.attrs.extraordinaryEvidenceRequired,
      });

      try {
        if (editor.view && editor.view.dom) {
          const coords = editor.view.coordsAtPos($from.pos);
          if (coords) {
            setPosition({
              top: coords.bottom + window.scrollY + 10,
              left: coords.left + window.scrollX,
            });
          }
        }
      } catch (e) {}
    };

    editor.on('selectionUpdate', updatePosition);
    return () => {
      editor.off('selectionUpdate', updatePosition);
    };
  }, [editor]);

  const closeMenu = () => {
    setIsVisible(false);
    setResult(null);
  };

  if (!isVisible) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute z-50 bg-white border border-slate-200 rounded-xl shadow-2xl p-1 flex flex-col min-w-[240px] animate-in fade-in zoom-in-95 duration-200"
      style={{ top: position.top, left: position.left }}
    >
      {!result ? null : (
        <div className="p-3">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {result.consensusLevel === 'strong' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : result.consensusLevel === 'divided' || result.consensusLevel === 'controversial' ? (
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                    ) : (
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                        Consensus Result
                    </span>
                </div>
                <button onClick={closeMenu} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="mb-3">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className={`text-lg font-black leading-none ${
                        result.consensusLevel === 'strong' ? 'text-emerald-600' :
                        result.consensusLevel === 'divided' ? 'text-orange-600' :
                        result.consensusLevel === 'controversial' ? 'text-red-600' :
                        'text-blue-600'
                    }`}>
                        {result.consensusLevel?.toUpperCase() || 'EMERGING'}
                    </span>
                    <span className="text-sm font-bold text-slate-400">
                        {result.agreementPercentage}%
                    </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed italic border-l-2 border-slate-200 pl-2">
                    {result.summary}
                </p>
            </div>

            {result.extraordinaryEvidenceRequired && (
                <div className="flex items-start gap-2 p-2 mb-3 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold leading-tight">
                        Contradicts strong consensus. Extraordinary evidence required.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-1.5 mb-4">
                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Evidence Convergence</span>
                    {result.evidenceConvergent ? (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">High</span>
                    ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Limited</span>
                    )}
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Dissent Recognized</span>
                    {result.dissentAcknowledged ? (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Yes</span>
                    ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">No</span>
                    )}
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Bias Risk</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        result.biasCheckStatus === 'pass' ? 'text-emerald-600 bg-emerald-50' :
                        result.biasCheckStatus === 'warning' ? 'text-orange-600 bg-orange-50' :
                        'text-red-600 bg-red-50'
                    }`}>
                        {result.biasCheckStatus.toUpperCase()}
                    </span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Methodology Score</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        result.methodologyScore >= 80 ? 'text-emerald-600 bg-emerald-50' :
                        result.methodologyScore >= 50 ? 'text-blue-600 bg-blue-50' :
                        'text-orange-600 bg-orange-50'
                    }`}>
                        {result.methodologyScore}/100
                    </span>
                </div>
            </div>

            <Button 
                onClick={closeMenu}
                variant="outline"
                className="w-full h-8 text-[11px] font-bold border-slate-200 text-slate-500 hover:bg-slate-50"
            >
                Done
            </Button>
        </div>
      )}
    </div>
  );
};
