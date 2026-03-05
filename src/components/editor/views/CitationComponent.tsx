import React, { useEffect, useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { CitationRegistryService, RegistryEntry } from "../../../services/CitationRegistryService";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../ui/hover-card";
import { ExternalLink, Edit2, BookOpen, FileText, RefreshCw, FileText as FileTextIcon } from "lucide-react";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";

export const CitationComponent = (props: NodeViewProps) => {
    const { node, editor } = props;
    const { citationId, text } = node.attrs;
    const [metadata, setMetadata] = useState<RegistryEntry | null>(null);

    useEffect(() => {
        if (citationId) {
            // Re-fetch metadata from registry asynchronously if needed
            const meta = (CitationRegistryService as any).cache?.get(citationId);
            if (meta) {
                setMetadata(meta);
            }
        }
    }, [citationId]);

    const displayText = text || "[citation]";

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Trigger whatever edit modal or panel is standard
        console.log("Edit citation", citationId);
    };

    const handleOpenPdf = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (metadata?.url) {
            window.open(metadata.url, '_blank');
        }
    };

    return (
        <NodeViewWrapper className="inline-block" as="span">
            <HoverCard openDelay={200} closeDelay={200}>
                <HoverCardTrigger asChild>
                    <a
                        className="citation-node citation-pill"
                        data-citation-id={citationId}
                        style={{ color: "#2563eb", fontWeight: 500, cursor: "pointer", textDecoration: "none" }}
                        onClick={(e) => {
                            e.preventDefault();
                            // If there's an active selection or click logic in editor, let it happen
                        }}
                    >
                        {displayText}
                    </a>
                </HoverCardTrigger>
                <HoverCardContent
                    className="w-[340px] p-3 bg-white shadow-xl rounded-xl border border-gray-200 z-50 flex flex-col gap-2"
                    side="bottom"
                    align="start"
                >
                    {/* Header Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="px-[6px] py-[2px] text-[10px] bg-gray-100/80 text-gray-500 hover:bg-gray-100/80 font-medium border-0 shadow-none">Review</Badge>
                        {(metadata?.metadata as any)?.citationCount !== undefined && (
                            <Badge variant="outline" className="px-[6px] py-[2px] text-[10px] text-gray-600 font-medium bg-gray-50/50 border-gray-100 shadow-none">
                                <span className="text-[9px] text-gray-400 mr-1 uppercase">CITED BY</span> <span className="font-bold text-gray-900">{(metadata?.metadata as any).citationCount}</span>
                            </Badge>
                        )}
                        {(metadata?.metadata as any)?.metrics?.impactFactor && (
                            <Badge variant="outline" className="px-[6px] py-[2px] text-[10px] text-gray-600 font-medium bg-gray-50/50 border-gray-100 shadow-none">
                                <span className="text-[9px] text-gray-400 mr-1 uppercase">IF</span> <span className="font-bold text-gray-900">{(metadata?.metadata as any).metrics.impactFactor}</span>
                            </Badge>
                        )}
                        <Badge variant="outline" className="px-[6px] py-[2px] text-[10px] text-gray-900 border-orange-100 bg-orange-50/30 font-medium flex items-center gap-1 shadow-none">
                            <span className="w-[10px] h-[10px] rounded border border-orange-500 bg-transparent flex items-center justify-center text-[6px] font-bold text-orange-500">🔓</span>
                            OPEN ACCESS
                        </Badge>
                    </div>

                    {/* Content Section */}
                    <div>
                        <h4 className="text-[15px] font-bold text-gray-900 leading-snug mb-1">
                            {metadata?.sourceTitle || "Unknown Title"}
                        </h4>
                        <p className="text-[13px] text-gray-500 line-clamp-1">
                            {metadata?.authors?.join(", ") || "Unknown Authors"}
                        </p>
                        <p className="text-[13px] text-emerald-600 font-medium mt-1">
                            {(metadata?.metadata as any)?.journal || (metadata?.metadata as any)?.publisher || "Journal of Unknown"} · {metadata?.year || "N/A"}
                        </p>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1.5">
                            <Button variant="ghost" size="sm" className="h-6 px-1.5 font-bold text-[11px] text-gray-900 hover:bg-gray-100" onClick={handleEdit}>
                                <Edit2 className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                                Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-1.5 font-bold text-[11px] text-gray-900 hover:bg-gray-100">
                                <RefreshCw className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                                Narrative
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-1.5 font-bold text-[11px] text-gray-900 hover:bg-gray-100" onClick={handleOpenPdf} disabled={!metadata?.url}>
                                <FileTextIcon className="w-3.5 h-3.5 mr-1" strokeWidth={2.5} />
                                Open PDF
                            </Button>
                        </div>
                        <span className="text-[11px] font-medium text-gray-400">
                            {metadata?.url ? "Library Source" : "Auto-Imported"}
                        </span>
                    </div>
                </HoverCardContent>
            </HoverCard>
        </NodeViewWrapper>
    );
};
