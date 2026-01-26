import React, { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
    X,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Highlighter,
    StickyNote,
    Save,
    Trash2,
    Loader2
} from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker URL for PDF.js - Use standard .js for better compatibility
// Set worker URL for PDF.js - Use local import via Webpack 5
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface Annotation {
    id?: string;
    type: 'highlight' | 'note';
    content?: string;
    color?: string;
    coordinates: {
        page: number;
        area: { x: number; y: number; w: number; h: number }[];
    };
}

interface PDFAnnotatorProps {
    fileUrl: string;
    fileId: string;
    title: string;
    onClose: () => void;
    onSaveAnnotations?: (annotations: Annotation[]) => Promise<void>;
    initialAnnotations?: Annotation[];
    authToken?: string; // Added for protected proxy access
}

export const PDFAnnotator: React.FC<PDFAnnotatorProps> = ({
    fileUrl,
    fileId,
    title,
    onClose,
    onSaveAnnotations,
    initialAnnotations = [],
    authToken,
}) => {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.2);
    const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
    const [activeTool, setActiveTool] = useState<'view' | 'highlight' | 'note'>('view');
    const [activeColor, setActiveColor] = useState('rgba(255, 255, 0, 0.4)'); // Yellow
    const [isSaving, setIsSaving] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Construct file object with headers if token is present
    const documentFile = React.useMemo(() => {
        if (authToken && typeof fileUrl === 'string') {
            return {
                url: fileUrl,
                httpHeaders: {
                    'Authorization': `Bearer ${authToken}`
                },
                withCredentials: true
            };
        }
        return fileUrl;
    }, [fileUrl, authToken]);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handlePrevPage = () => setPageNumber(p => Math.max(1, p - 1));
    const handleNextPage = () => setPageNumber(p => Math.min(numPages || p, p + 1));
    const handleZoomIn = () => setScale(s => Math.min(2.5, s + 0.1));
    const handleZoomOut = () => setScale(s => Math.max(0.5, s - 0.1));

    const handleSave = async () => {
        if (!onSaveAnnotations) return;
        setIsSaving(true);
        try {
            await onSaveAnnotations(annotations);
        } catch (err) {
            console.error("Failed to save annotations:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Logic for drawing highlights (Production Grade)
    const handleTextSelection = () => {
        if (activeTool !== 'highlight') return;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.toString().trim().length === 0) return;

        const range = selection.getRangeAt(0);
        const pageElement = (range.commonAncestorContainer as HTMLElement).closest('.react-pdf__Page');

        if (!pageElement) return;

        // Calculate coordinates relative to the page element
        const pageRect = pageElement.getBoundingClientRect();
        const rects = Array.from(range.getClientRects());

        const area = rects.map(rect => ({
            x: ((rect.left - pageRect.left) / pageRect.width) * 100,
            y: ((rect.top - pageRect.top) / pageRect.height) * 100,
            w: (rect.width / pageRect.width) * 100,
            h: (rect.height / pageRect.height) * 100
        }));

        const newHighlight: Annotation = {
            type: 'highlight',
            color: activeColor,
            coordinates: {
                page: pageNumber,
                area
            },
            content: selection.toString()
        };

        setAnnotations(prev => [...prev, newHighlight]);
        selection.removeAllRanges();
    };

    // Render highlights for the current page
    const renderPageHighlights = () => {
        return annotations
            .filter(ann => ann.coordinates.page === pageNumber && ann.type === 'highlight')
            .map((ann, annIdx) => (
                <div key={annIdx} className="absolute inset-0 pointer-events-none">
                    {ann.coordinates.area.map((rect, rectIdx) => (
                        <div
                            key={rectIdx}
                            className="absolute border-b-2 border-transparent transition-colors hover:border-white/20"
                            style={{
                                left: `${rect.x}%`,
                                top: `${rect.y}%`,
                                width: `${rect.w}%`,
                                height: `${rect.h}%`,
                                backgroundColor: ann.color || 'rgba(255, 255, 0, 0.4)',
                                mixBlendMode: 'multiply'
                            }}
                        />
                    ))}
                </div>
            ));
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden font-sans">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-100 shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold text-gray-900 truncate max-w-md">{title}</h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Research Vault • Reader</p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setActiveTool('view')}
                        className={`p-2 rounded-lg transition-all ${activeTool === 'view' ? 'bg-[#6366F1] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-white'}`}
                        title="View Mode">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-gray-200 mx-1" />
                    <button
                        onClick={() => setActiveTool('highlight')}
                        className={`p-2 rounded-lg transition-all ${activeTool === 'highlight' ? 'bg-yellow-400 text-yellow-950 shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-white'}`}
                        title="Highlight Mode">
                        <Highlighter className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setActiveTool('note')}
                        className={`p-2 rounded-lg transition-all ${activeTool === 'note' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-white'}`}
                        title="Sticky Note Mode">
                        <StickyNote className="w-4 h-4" />
                    </button>

                    {/* Color Picker */}
                    <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-gray-200">
                        {[
                            { name: 'Yellow', value: 'rgba(255, 255, 0, 0.4)', class: 'bg-yellow-400' },
                            { name: 'Green', value: 'rgba(34, 197, 94, 0.4)', class: 'bg-green-400' },
                            { name: 'Cyan', value: 'rgba(6, 182, 212, 0.4)', class: 'bg-cyan-400' }
                        ].map(c => (
                            <button
                                key={c.value}
                                onClick={() => {
                                    setActiveColor(c.value);
                                    setActiveTool('highlight');
                                }}
                                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-125 shadow-sm ${c.class} ${activeColor === c.value ? 'border-white ring-2 ring-[#6366F1]' : 'border-black/5'}`}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                        <button onClick={handleZoomOut} className="hover:text-gray-900 transition-colors"><ZoomOut className="w-4 h-4" /></button>
                        <span className="min-w-[3rem] text-center font-bold">{Math.round(scale * 100)}%</span>
                        <button onClick={handleZoomIn} className="hover:text-gray-900 transition-colors"><ZoomIn className="w-4 h-4" /></button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar for annotations breakdown */}
                <div className="w-80 bg-gray-50 border-r border-gray-100 flex flex-col z-10 shadow-sm">
                    <div className="p-5 border-b border-gray-100 bg-white/50">
                        <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Research Annotations ({annotations.length})</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                        {annotations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                                <StickyNote className="w-10 h-10 text-gray-600 mb-3" />
                                <p className="text-xs text-gray-500">No highlights or notes yet.<br />Use the tools to start annotating.</p>
                            </div>
                        ) : (
                            annotations.map((ann, idx) => (
                                <div key={idx} className="p-4 bg-white rounded-xl border border-gray-100 hover:border-[#6366F1] hover:shadow-md transition-all group cursor-pointer">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${ann.type === 'highlight' ? 'bg-yellow-100 text-yellow-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {ann.type}
                                        </span>
                                        <button
                                            onClick={() => setAnnotations(annotations.filter((_, i) => i !== idx))}
                                            className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-700 line-clamp-4 italic leading-relaxed">"{ann.content || '...'}"</p>
                                    <div className="mt-3 pt-3 border-t border-gray-50 text-[10px] text-gray-400 font-bold flex justify-between">
                                        <span>Page {ann.coordinates.page}</span>
                                        <span className="text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity">Jump to Source</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div
                    ref={containerRef}
                    onMouseUp={handleTextSelection}
                    className="flex-1 overflow-auto bg-gray-100/50 p-10 flex justify-center custom-scrollbar"
                    style={{
                        backgroundImage: `radial-gradient(circle, #e2e8f0 1px, rgba(0,0,0,0) 1px)`,
                        backgroundSize: '24px 24px'
                    }}>
                    <div className="shadow-2xl shadow-gray-300/50 max-w-full relative bg-white">
                        <Document
                            file={documentFile}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={(error) => console.error("PDF Load Error:", error)}
                            loading={
                                <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-gray-100 shadow-xl">
                                    <Loader2 className="w-10 h-10 text-[#6366F1] animate-spin mb-4" />
                                    <p className="text-gray-900 font-bold">Initializing Reader...</p>
                                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold opacity-70">Securing environment</p>
                                </div>
                            }
                            error={
                                <div className="p-10 bg-red-900/20 border border-red-500 rounded-lg text-center">
                                    <p className="text-red-400 font-bold">Failed to load PDF</p>
                                    <p className="text-xs text-red-300 mt-2">Make sure the file is a valid scientific document.</p>
                                    <button onClick={onClose} className="mt-4 text-sm font-bold text-red-400 hover:text-red-300 underline">Close Viewer</button>
                                </div>
                            }
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderAnnotationLayer={true}
                                renderTextLayer={true}
                                className="shadow-2xl"
                            >
                                {/* Highlight Overlay Layer */}
                                {renderPageHighlights()}
                            </Page>
                        </Document>
                    </div>
                </div>
            </div>

            {/* Footer / Pagination */}
            <div className="h-14 flex items-center justify-center gap-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-1 text-gray-400">
                    <button
                        onClick={handlePrevPage}
                        disabled={pageNumber <= 1}
                        className="p-1.5 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-20">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-5 py-1.5 bg-gray-50 rounded-xl border border-gray-200 text-sm font-bold flex items-center gap-3">
                        <span className="text-gray-900">{pageNumber}</span>
                        <span className="text-gray-300 w-px h-3 bg-gray-200" />
                        <span className="text-gray-500">{numPages || '?'}</span>
                    </div>
                    <button
                        onClick={handleNextPage}
                        disabled={pageNumber >= (numPages || 1)}
                        className="p-1.5 hover:text-white hover:bg-gray-700 rounded-md transition-colors disabled:opacity-20">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
