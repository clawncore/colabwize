import React, { useState } from 'react'
import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { Pin } from 'lucide-react'

// --- React Component ---
export const ConsensusPinNodeView: React.FC<NodeViewProps> = (props) => {
  const [isHovered, setIsHovered] = useState(false)
  const attrs = props.node.attrs;

  const getPinColor = () => {
    switch (attrs.consensusLevel) {
      case 'strong': return 'text-emerald-500 hover:text-emerald-600 bg-emerald-50';
      case 'emerging': return 'text-blue-500 hover:text-blue-600 bg-blue-50';
      case 'divided': return 'text-orange-500 hover:text-orange-600 bg-orange-50';
      case 'controversial': return 'text-red-500 hover:text-red-600 bg-red-50';
      default: return 'text-red-500 hover:text-red-600 bg-red-50';
    }
  }

  return (
    <NodeViewWrapper as="span" className="inline-flex items-center mx-1 relative select-none" contentEditable={false}>
      <span 
        className={`inline-flex items-center justify-center p-1 rounded-full cursor-pointer transition-colors ${getPinColor()} ring-1 ring-inset ring-black/5`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={`${attrs.consensusLevel?.toUpperCase()}: ${attrs.consensusScore}% Agreement`}
      >
        <Pin className="w-3.5 h-3.5 transform -rotate-45 fill-current" />
      </span>
      
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-white rounded-lg shadow-xl border border-gray-100 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Verification</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getPinColor()}`}>
              {attrs.consensusScore}% Score
            </span>
          </div>
          <p className="text-[11px] text-gray-700 font-medium leading-relaxed mb-2 line-clamp-3">
            "{attrs.claim}"
          </p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 pt-2 border-t border-gray-50">
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Method</span>
                <span className="text-[9px] font-bold text-gray-700">{attrs.methodologyScore}/100</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Bias</span>
                <span className="text-[9px] font-bold text-gray-700">{attrs.biasCheckStatus?.toUpperCase()}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Extra Evid.</span>
                <span className="text-[9px] font-bold text-gray-700">{attrs.extraordinaryEvidenceRequired ? 'Req' : 'No'}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Dissent</span>
                <span className="text-[9px] font-bold text-gray-700">{attrs.dissentAcknowledged ? 'Yes' : 'No'}</span>
             </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  )
}

// --- Tiptap Extension ---
export interface ConsensusPinOptions {
  HTMLAttributes: Record<string, any>
}

export const ConsensusPinExtension = Node.create<ConsensusPinOptions>({
  name: 'consensusPin',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      claim: { default: null },
      consensusLevel: { default: null },
      consensusScore: { default: null },
      evidenceConvergent: { default: null },
      dissentAcknowledged: { default: null },
      biasCheckStatus: { default: null },
      methodologyScore: { default: null },
      extraordinaryEvidenceRequired: { default: null },
    }
  },

  parseHTML() {
    return [
      { tag: 'span[data-type="consensus-pin"]' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-type': 'consensus-pin' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ConsensusPinNodeView)
  },
})
