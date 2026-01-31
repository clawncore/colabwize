import React, { useEffect, useState, useRef } from "react";
import { Loader2, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw, Search, Bot } from "lucide-react";
import { useParams } from "react-router-dom";

interface CitationGraphProps {
    width?: number;
    height?: number;
    projectId?: string;
    project?: any;
    onTopicSelect?: (topic: string) => void;
    onAskAI?: (topic: string) => void;
    viewMode?: "split" | "full";
    onToggleViewMode?: () => void;
}

interface MindMapNode {
    id: string;
    label: string;
    type: "root" | "child" | "leaf";
    x: number;
    y: number;
    width: number;
    height: number;
    children?: MindMapNode[];
    childrenIds?: string[];
}

export const CitationGraph: React.FC<CitationGraphProps> = ({ width = 800, height = 600, projectId: propProjectId, project, onTopicSelect, onAskAI, viewMode = "full", onToggleViewMode }) => {
    const params = useParams<{ projectId?: string; id?: string }>();
    const projectId = propProjectId || params.projectId || params.id;
    const [loading, setLoading] = useState(true);
    const [nodes, setNodes] = useState<MindMapNode[]>([]);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    // Generate Tree Data from Project
    useEffect(() => {
        setLoading(true);

        const timer = setTimeout(() => {
            if (!project) {
                setLoading(false);
                return;
            }

            // 1. Define Hierarchy Data Structure
            interface HierarchyNode {
                id: string;
                label: string;
                children: HierarchyNode[];
                width: number;
                height: number;
                x?: number;
                y?: number;
                type: "root" | "child" | "leaf";
            }

            // 2. Generate Data (Mock AI)
            const rootLabel = project.title || "Untitled Document";
            // const rootId = "root";

            let topics: { label: string; subtopics: string[] }[] = [];

            // Try to extract from outline first
            if (project.outline && Array.isArray(project.outline) && project.outline.length > 0) {
                const distinctL1 = project.outline.filter((i: any) => i.level === 1).slice(0, 5);
                topics = distinctL1.map((l1: any) => {
                    return { label: l1.title, subtopics: ["Key Concept", "Analysis", "Evidence"] };
                });
            }

            if (topics.length === 0) {
                const title = (project.title || "").toLowerCase();
                if (title.includes("dna") || title.includes("genomics")) {
                    topics = [
                        { label: "ChIP-seq Workflow", subtopics: ["Crosslinking", "Fragmentation", "Immunoprecipitation"] },
                        { label: "Sequencing Generations", subtopics: ["Sanger", "Next-Gen (NGS)", "Nanopore"] },
                        { label: "NGS File Formats", subtopics: ["FASTQ", "BAM/SAM", "BED"] },
                        { label: "Quality Control", subtopics: ["FastQC Metrics", "Trimming", "Filtering"] }
                    ];
                } else if (title.includes("hiv") || title.includes("health")) {
                    topics = [
                        { label: "Transmission Vectors", subtopics: ["Blood-borne", "Vertical", "Sexual"] },
                        { label: "Prevention Strategies", subtopics: ["PrEP / PEP", "Vaccine Research", "Education"] },
                        { label: "Treatment Protocols", subtopics: ["ART Adherence", "Viral Load", "Drug Resistance"] },
                        { label: "Socio-economic Impact", subtopics: ["Healthcare Costs", "Stigma", "Labor Force"] }
                    ];
                } else {
                    topics = [
                        { label: "Literature Review", subtopics: ["Historical Context", "Major Theories", "Gaps"] },
                        { label: "Methodology", subtopics: ["Research Design", "Data Collection", "Participants"] },
                        { label: "Data Analysis", subtopics: ["Statistical Models", "Qualitative Coding"] },
                        { label: "Discussion", subtopics: ["Implications", "Limitations", "Future Work"] }
                    ];
                }
            }

            // 3. Construct Tree Object
            const root: HierarchyNode = {
                id: "root",
                label: rootLabel,
                type: "root",
                width: 250,
                height: 60,
                children: topics.map((t, i) => ({
                    id: `c-${i}`,
                    label: t.label,
                    type: "child",
                    width: 220,
                    height: 50,
                    children: t.subtopics.map((st, j) => ({
                        id: `c-${i}-s-${j}`,
                        label: st,
                        type: "leaf",
                        width: 180,
                        height: 40,
                        children: []
                    }))
                }))
            };

            // 4. Calculate Layout
            const VERTICAL_GAP = 20;
            const SUB_GAP = 10;
            const HORIZONTAL_GAP = 150;

            const flatNodes: MindMapNode[] = [];

            function layoutNode(node: HierarchyNode, x: number, startY: number): number {
                // If leaf, height is fixed
                if (node.children.length === 0) {
                    node.x = x;
                    node.y = startY;
                    flatNodes.push({
                        id: node.id,
                        label: node.label,
                        type: node.type as any,
                        x: node.x,
                        y: node.y,
                        width: node.width,
                        height: node.height,
                        childrenIds: []
                    });
                    return node.height + SUB_GAP;
                }

                // If parent, layout children first
                let currentY = startY;
                const childX = x + node.width + HORIZONTAL_GAP;
                const childIds: string[] = [];

                node.children.forEach(child => {
                    const allocatedHeight = layoutNode(child, childX, currentY);
                    currentY += allocatedHeight;
                    childIds.push(child.id);
                });

                // Parent Y is midpoint of children range
                const totalChildrenHeight = currentY - startY - SUB_GAP;
                const firstChildY = node.children[0].y!;
                const lastChildY = node.children[node.children.length - 1].y!;

                node.x = x;
                node.y = (firstChildY + lastChildY) / 2;

                flatNodes.push({
                    id: node.id,
                    label: node.label,
                    type: node.type as any,
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height,
                    childrenIds: childIds
                });

                return Math.max(node.height + VERTICAL_GAP, totalChildrenHeight + VERTICAL_GAP);
            }

            // Run Layout
            layoutNode(root, 100, 0);

            // Center Vertically
            const treeCenterY = root.y!;
            const canvasCenterY = height / 2;
            const shiftY = canvasCenterY - treeCenterY;

            const finalNodes = flatNodes.map(n => ({
                ...n,
                y: n.y + shiftY
            }));

            setNodes(finalNodes);
            setLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [project, height]);

    // Zoom Functions
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Pan Functions
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    // Mouse Wheel Zoom
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setScale(prev => Math.min(Math.max(prev + delta, 0.5), 2));
    };

    const renderEdges = () => {
        if (nodes.length <= 1) return null;

        return nodes.flatMap(sourceNode => {
            if (!sourceNode.childrenIds || sourceNode.childrenIds.length === 0) return [];

            return sourceNode.childrenIds.map(childId => {
                const targetNode = nodes.find(n => n.id === childId);
                if (!targetNode) return null;

                const sourceX = sourceNode.x + sourceNode.width;
                const sourceY = sourceNode.y + (sourceNode.height / 2);

                const targetX = targetNode.x;
                const targetY = targetNode.y + (targetNode.height / 2);

                const c1x = sourceX + (targetX - sourceX) * 0.5;
                const c1y = sourceY;
                const c2x = targetX - (targetX - sourceX) * 0.5;
                const c2y = targetY;

                const path = `M ${sourceX} ${sourceY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${targetX} ${targetY}`;

                return (
                    <g key={`edge-${sourceNode.id}-${targetNode.id}`}>
                        <path d={path} stroke="white" strokeWidth="4" fill="none" />
                        <path d={path} stroke="#a855f7" strokeWidth="2" fill="none" strokeOpacity="0.6" />
                        <circle cx={sourceX} cy={sourceY} r="3" fill="#a855f7" />
                        <circle cx={targetX} cy={targetY} r="3" fill="#a855f7" />
                    </g>
                );
            });
        });
    };

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-gray-50/50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Generating Visual Insight Map...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="h-full w-full flex flex-col bg-white overflow-hidden relative">
            {/* Header */}
            <div className="absolute top-6 left-6 z-20 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-gray-100 shadow-sm max-w-md pointer-events-none">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Visual Insight Map</h1>
                <p className="text-xs text-gray-500">
                    Interactive knowledge graph showing topic relationships. Click a node to explore related papers.
                </p>
            </div>

            {/* Canvas */}
            <div
                className={`flex-1 w-full h-full relative bg-[#F9FAFB] overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={handleWheel}
            >
                <div
                    className="min-w-[1000px] min-h-[800px] relative w-full h-full transition-transform duration-75 ease-linear origin-center"
                    style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }}
                >

                    {/* SVG Layer */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                        {renderEdges()}
                    </svg>

                    {/* HTML Nodes */}
                    {nodes.map((node) => (
                        <div
                            key={node.id}
                            onClick={() => {
                                if (onTopicSelect) {
                                    onTopicSelect(node.label);
                                }
                            }}
                            style={{
                                position: 'absolute',
                                left: node.x,
                                top: node.y,
                                width: node.width,
                                height: node.height,
                            }}
                            className={`flex items-center justify-between px-4 py-2 rounded-lg shadow-sm border transition-all hover:scale-105 hover:shadow-md cursor-pointer group z-10
                                ${node.type === 'root'
                                    ? 'bg-gradient-to-r from-purple-100 to-indigo-100 border-purple-200 text-purple-900'
                                    : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50/50'
                                }`
                            }
                            role="button"
                            tabIndex={0}
                            title="Click to find papers"
                        >
                            <span className={`text-sm font-semibold truncate ${node.type === 'root' ? 'text-base' : ''}`}>
                                {node.label}
                            </span>

                            {node.type !== 'root' && (
                                <div className="flex flex-col gap-1">
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onTopicSelect) onTopicSelect(node.label);
                                        }}
                                        className="p-1 rounded-full bg-gray-100 text-gray-400 hover:bg-purple-100 hover:text-purple-600 transition-colors"
                                        title="Find Papers"
                                    >
                                        <Search className="w-3 h-3" />
                                    </div>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onAskAI) onAskAI(node.label);
                                        }}
                                        className="p-1 rounded-full bg-gray-100 text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                                        title="Ask AI Assistant"
                                    >
                                        <Bot className="w-3 h-3" />
                                    </div>
                                </div>
                            )}

                            {node.type === 'root' && (
                                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full ring-4 ring-white" />
                            )}
                            {/* Only show Left Dot if it has a parent (not root). 
                                 Since all our nodes except root are children, this logic works.
                                 BUT 'child' and 'leaf' nodes both need left dots. */}
                            {node.type !== 'root' && (
                                <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full ring-4 ring-white" />
                            )}

                            {/* NEW: Right Dot for Child nodes that are parents of Leaves?
                                In our mock data, 'child' nodes have 'leaf' children.
                                So 'child' nodes should have a Right Dot too.
                            */}
                            {node.type === 'child' && (
                                <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full ring-4 ring-white" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Floating Controls */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
                    <button
                        onClick={handleZoomIn}
                        className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600 active:bg-gray-100"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleZoomOut}
                        className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600 active:bg-gray-100"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600 active:bg-gray-100"
                        title="Reset Zoom"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                    {onToggleViewMode && (
                        <button
                            onClick={onToggleViewMode}
                            className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600 active:bg-gray-100"
                            title={viewMode === 'split' ? "Expand to Full Screen" : "Exit Full Screen"}
                        >
                            {viewMode === 'split' ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
