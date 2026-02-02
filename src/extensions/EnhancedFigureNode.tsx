import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import React, { useState, useRef, useEffect } from "react";
import { RotateCw, AlignLeft, AlignCenter, AlignRight, Trash2, Type } from "lucide-react";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        figure: {
            /**
             * Insert a figure with image and caption
             */
            setFigure: (options: { src: string; alt?: string; width?: number; height?: number }) => ReturnType;
        };
    }
}


// Figure Component with Image + Caption
const FigureComponent = (props: any) => {
    const [selected, setSelected] = useState(false);
    const [editingCaption, setEditingCaption] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const captionRef = useRef<HTMLDivElement>(null);

    const { node, updateAttributes, deleteNode } = props;

    // Attributes
    const { src, alt, width, height, rotate, align, figureNumber, caption } = node.attrs;

    // Auto-focus caption when editing
    useEffect(() => {
        if (editingCaption && captionRef.current) {
            captionRef.current.focus();
            // Place cursor at end
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(captionRef.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }, [editingCaption]);

    // Handle Resize
    const handleResize = (e: React.MouseEvent, direction: string) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = width || (imageRef.current?.offsetWidth || 300);
        const startHeight = height || (imageRef.current?.offsetHeight || 200);

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            const newAttrs: any = {};

            if (direction.includes("e")) {
                newAttrs.width = Math.max(100, startWidth + deltaX);
            } else if (direction.includes("w")) {
                newAttrs.width = Math.max(100, startWidth - deltaX);
            }

            if (direction.includes("s")) {
                newAttrs.height = Math.max(100, startHeight + deltaY);
            } else if (direction.includes("n")) {
                newAttrs.height = Math.max(100, startHeight - deltaY);
            }

            if (Object.keys(newAttrs).length > 0) {
                updateAttributes(newAttrs);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const handleCaptionUpdate = () => {
        if (captionRef.current) {
            const newCaption = captionRef.current.textContent || "";
            updateAttributes({ caption: newCaption });
            setEditingCaption(false);
        }
    };

    return (
        <NodeViewWrapper
            className={`figure-wrapper my-6 flex ${align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start"
                }`}
            data-drag-handle
        >
            <div
                className={`figure-container max-w-full transition-all ${selected ? "ring-2 ring-blue-500 rounded-lg" : ""
                    }`}
                onClick={() => setSelected(!selected)}
            >
                {/* Image */}
                <div className="relative group inline-block">
                    <img
                        ref={imageRef}
                        src={src}
                        alt={alt}
                        style={{
                            width: width ? `${width}px` : "auto",
                            height: height ? `${height}px` : "auto",
                            transform: `rotate(${rotate || 0}deg)`,
                            maxWidth: "100%",
                        }}
                        className="rounded-lg shadow-md"
                    />

                    {/* Controls Overlay */}
                    {selected && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg p-1 flex items-center gap-1 z-50 border border-gray-200">
                            <button
                                onClick={() => updateAttributes({ align: "left" })}
                                className={`p-1.5 rounded hover:bg-gray-100 ${align === "left" ? "text-blue-600 bg-blue-50" : "text-gray-600"
                                    }`}
                                title="Align Left"
                            >
                                <AlignLeft size={16} />
                            </button>
                            <button
                                onClick={() => updateAttributes({ align: "center" })}
                                className={`p-1.5 rounded hover:bg-gray-100 ${align === "center" ? "text-blue-600 bg-blue-50" : "text-gray-600"
                                    }`}
                                title="Align Center"
                            >
                                <AlignCenter size={16} />
                            </button>
                            <button
                                onClick={() => updateAttributes({ align: "right" })}
                                className={`p-1.5 rounded hover:bg-gray-100 ${align === "right" ? "text-blue-600 bg-blue-50" : "text-gray-600"
                                    }`}
                                title="Align Right"
                            >
                                <AlignRight size={16} />
                            </button>
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            <button
                                onClick={() => updateAttributes({ rotate: (rotate || 0) + 90 })}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                                title="Rotate"
                            >
                                <RotateCw size={16} />
                            </button>
                            <button
                                onClick={() => setEditingCaption(true)}
                                className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                                title="Edit Caption"
                            >
                                <Type size={16} />
                            </button>
                            <div className="w-px h-4 bg-gray-300 mx-1"></div>
                            <button
                                onClick={deleteNode}
                                className="p-1.5 rounded hover:bg-red-50 text-red-600"
                                title="Delete Figure"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}

                    {/* Resize Handles */}
                    {selected && (
                        <>
                            <div
                                className="absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-blue-500/50 z-10"
                                onMouseDown={(e) => handleResize(e as any, "e")}
                            ></div>
                            <div
                                className="absolute top-0 left-0 h-full w-2 cursor-col-resize hover:bg-blue-500/50 z-10"
                                onMouseDown={(e) => handleResize(e as any, "w")}
                            ></div>
                            <div
                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 cursor-row-resize bg-white border border-gray-300 rounded shadow-sm hover:bg-blue-500/50 z-10"
                                onMouseDown={(e) => handleResize(e as any, "s")}
                            ></div>
                            <div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2 cursor-row-resize bg-white border border-gray-300 rounded shadow-sm hover:bg-blue-500/50 z-10"
                                onMouseDown={(e) => handleResize(e as any, "n")}
                            ></div>
                            <div
                                className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-sm hover:scale-125 transition-transform z-20"
                                onMouseDown={(e) => handleResize(e as any, "nw")}
                            ></div>
                            <div
                                className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize border-2 border-white shadow-sm hover:scale-125 transition-transform z-20"
                                onMouseDown={(e) => handleResize(e as any, "ne")}
                            ></div>
                            <div
                                className="absolute -bottom-1 -left-1 w-4 h-4 bg-blue-500 rounded-full cursor-nesw-resize border-2 border-white shadow-sm hover:scale-125 transition-transform z-20"
                                onMouseDown={(e) => handleResize(e as any, "sw")}
                            ></div>
                            <div
                                className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize border-2 border-white shadow-sm hover:scale-125 transition-transform z-20"
                                onMouseDown={(e) => handleResize(e as any, "se")}
                            ></div>
                        </>
                    )}
                </div>

                {/* Caption */}
                <div className="figure-caption mt-2 text-sm text-gray-700 text-center">
                    <span className="font-semibold">Figure {figureNumber || "?"}.</span>{" "}
                    {editingCaption ? (
                        <div
                            ref={captionRef}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleCaptionUpdate}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleCaptionUpdate();
                                }
                            }}
                            className="inline-block min-w-[200px] border-b border-dashed border-gray-400 focus:outline-none px-1"
                        >
                            {caption || "Click to add caption"}
                        </div>
                    ) : (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                setEditingCaption(true);
                            }}
                            className="cursor-text hover:text-blue-600 transition-colors"
                        >
                            {caption || "Click to add caption"}
                        </span>
                    )}
                </div>
            </div>
        </NodeViewWrapper>
    );
};

export const EnhancedFigureNode = Node.create({
    name: "figure",

    group: "block",

    content: "", // No nested content, caption is in attributes

    atom: true, // Treated as a single unit

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: "",
            },
            width: {
                default: null,
            },
            height: {
                default: null,
            },
            rotate: {
                default: 0,
            },
            align: {
                default: "center",
            },
            figureNumber: {
                default: null, // Auto-assigned by AutoNumbering plugin
            },
            caption: {
                default: "",
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "figure",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["figure", mergeAttributes(HTMLAttributes, { class: "figure-node" }), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FigureComponent);
    },

    addCommands() {
        return {
            setFigure:
                (options: { src: string; alt?: string; width?: number; height?: number }) =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                src: options.src,
                                alt: options.alt || "",
                                width: options.width || null,
                                height: options.height || null,
                                align: "center",
                                rotate: 0,
                                caption: "",
                            },
                        });
                    },
        };
    },
});

export default EnhancedFigureNode;
