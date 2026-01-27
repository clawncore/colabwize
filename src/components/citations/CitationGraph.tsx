import React, { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Loader2 } from "lucide-react";
import { apiClient } from "../../services/apiClient";
import { useParams } from "react-router-dom";

interface GraphData {
    nodes: {
        id: string;
        name: string;
        type: "project" | "citation" | "author";
        val: number;
        color: string;
    }[];
    links: {
        source: string;
        target: string;
        type: string;
    }[];
}

interface CitationGraphProps {
    width?: number;
    height?: number;
    projectId?: string;
}

export const CitationGraph: React.FC<CitationGraphProps> = ({ width, height, projectId: propProjectId }) => {
    const params = useParams<{ projectId?: string; id?: string }>();
    const projectId = propProjectId || params.projectId || params.id;

    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);
    const fgRef = useRef<any>();

    useEffect(() => {
        if (!projectId) {
            setLoading(false);
            return;
        }

        const fetchGraph = async () => {
            setLoading(true);
            try {
                const result = await apiClient.get(`/api/citations/${projectId}/graph`);
                setData(result);
            } catch (error) {
                console.error("Failed to fetch graph data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGraph();
    }, [projectId]);

    const handleNodeClick = (node: any) => {
        // Zoom in on click
        if (fgRef.current) {
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(4, 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!data || data.nodes.length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                <p>No citations to map yet.<br />Add sources to your document.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Visual Insight Map</h1>
                    <p className="text-sm text-gray-600">Interactive knowledge graph showing connections between your document, citations, and authors</p>
                </div>
            </div>

            {/* Graph Container */}
            <div className="flex-1 overflow-hidden relative bg-gradient-to-br from-zinc-50 to-zinc-100">
                <ForceGraph2D
                    ref={fgRef}
                    width={width || 400}
                    height={(height || 400) - 100}
                    graphData={data}
                    nodeLabel="name"
                    nodeColor={(node: any) => node.color}
                    backgroundColor="#f9fafb"
                    linkColor={() => "#9ca3af"}
                    onNodeClick={handleNodeClick}
                    cooldownTicks={100}
                />
                <div className="absolute bottom-6 right-6 text-xs text-gray-600 px-4 py-2 bg-white rounded-lg pointer-events-none shadow-md border border-gray-200">
                    💡 Click nodes to zoom
                </div>

                {/* Legend */}
                <div className="absolute top-6 left-6 p-4 bg-white rounded-xl border border-gray-200 shadow-lg space-y-2.5 pointer-events-none">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Legend</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-700">
                        <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-gray-400"></span>
                        <span className="font-medium">Document</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-700">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="font-medium">Citation</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-700">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        <span className="font-medium">Author</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
