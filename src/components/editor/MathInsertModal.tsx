import React, { useState, useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathInsertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (latex: string) => void;
    initialLatex?: string;
}

export const MathInsertModal: React.FC<MathInsertModalProps> = ({
    isOpen,
    onClose,
    onInsert,
    initialLatex = "",
}) => {
    const [latex, setLatex] = useState(initialLatex);
    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setLatex(initialLatex);
        }
    }, [isOpen, initialLatex]);

    useEffect(() => {
        if (previewRef.current) {
            try {
                katex.render(latex, previewRef.current, {
                    throwOnError: false,
                    displayMode: true,
                });
            } catch (e) {
                // Ignore parsing errors while typing
            }
        }
    }, [latex, isOpen]);

    const handleInsert = () => {
        if (latex.trim()) {
            onInsert(latex);
            onClose();
        }
    };

    const insertExample = (formula: string) => {
        setLatex(formula);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Insert Equation</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">

                    {/* Input Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type KaTeX equation...
                        </label>
                        <textarea
                            value={latex}
                            onChange={(e) => setLatex(e.target.value)}
                            className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                            placeholder="e.g. E = mc^2"
                            autoFocus
                        />
                    </div>

                    {/* Examples */}
                    <div>
                        <p className="text-xs text-gray-500 mb-2">Example formulas:</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => insertExample("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}")}
                                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Quadratic
                            </button>
                            <button
                                onClick={() => insertExample("\\nabla \\cdot \\mathbf{E} = \\frac{\\rho}{\\varepsilon_0}")}
                                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Maxwell's
                            </button>
                            <button
                                onClick={() => insertExample("f(x) = \\begin{cases} x^2 & x < 0 \\\\ x & x \\ge 0 \\end{cases}")}
                                className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Piecewise
                            </button>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="border rounded-md bg-gray-50 p-4 min-h-[80px] flex items-center justify-center overflow-x-auto">
                        <div ref={previewRef} className="text-lg text-gray-800"></div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setLatex("")}
                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border border-transparent hover:border-gray-200 rounded transition-colors"
                            title="Clear"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleInsert}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
