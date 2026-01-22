import { mergeAttributes, Node, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import React, { useState, useRef, useEffect } from "react";
import { Maximize2, RotateCw, AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";

// Image Component for Node View
const ImageComponent = (props: any) => {
    const [selected, setSelected] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);

    const { node, updateAttributes, deleteNode } = props;

    // Attributes
    const { src, alt, width, height, rotate, align } = node.attrs;

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

            // Horizontal Resizing (Width)
            if (direction.includes("e")) { // East (Right)
                newAttrs.width = Math.max(20, startWidth + deltaX);
            } else if (direction.includes("w")) { // West (Left)
                newAttrs.width = Math.max(20, startWidth - deltaX);
            }

            // Vertical Resizing (Height)
            if (direction.includes("s")) { // South (Bottom)
                newAttrs.height = Math.max(20, startHeight + deltaY);
            } else if (direction.includes("n")) { // North (Top)
                newAttrs.height = Math.max(20, startHeight - deltaY);
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

    return (
        <NodeViewWrapper className={`image-view-wrapper flex ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`} draggable="true" data-drag-handle>
            <div
                className={`relative group inline-block transition-all ${selected ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}
                onClick={() => setSelected(!selected)}
                onDragStart={(e) => {
                    // If targeting a handle (resize/control), don't drag the image
                    if ((e.target as HTMLElement).closest('.cursor-col-resize, .cursor-row-resize, .cursor-nwse-resize, .cursor-nesw-resize, button')) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
            >
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
                    className="rounded-lg shadow-sm"
                />

                {/* Controls Overlay (Only when selected) */}
                {selected && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-lg p-1 flex items-center gap-1 z-50 border border-gray-200">
                        <button
                            onClick={() => updateAttributes({ align: 'left' })}
                            className={`p-1.5 rounded hover:bg-gray-100 ${align === 'left' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                            title="Align Left"
                        >
                            <AlignLeft size={16} />
                        </button>
                        <button
                            onClick={() => updateAttributes({ align: 'center' })}
                            className={`p-1.5 rounded hover:bg-gray-100 ${align === 'center' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
                            title="Align Center"
                        >
                            <AlignCenter size={16} />
                        </button>
                        <button
                            onClick={() => updateAttributes({ align: 'right' })}
                            className={`p-1.5 rounded hover:bg-gray-100 ${align === 'right' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
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
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button
                            onClick={deleteNode}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600"
                            title="Delete Image (Files remains in bucket)"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}

                {/* Resize Handles (Only when selected) */}
                {selected && (
                    <>
                        {/* Side Handles (East/West) */}
                        <div
                            className="absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-blue-500/50 z-10"
                            onMouseDown={(e) => handleResize(e as any, "e")}
                        ></div>
                        <div
                            className="absolute top-0 left-0 h-full w-2 cursor-col-resize hover:bg-blue-500/50 z-10"
                            onMouseDown={(e) => handleResize(e as any, "w")}
                        ></div>

                        {/* Vertical Handles (North/South) - Middle Handles */}
                        <div
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-2 cursor-row-resize bg-white border border-gray-300 rounded shadow-sm hover:bg-blue-500/50 z-10 flex justify-center items-center"
                            onMouseDown={(e) => handleResize(e as any, "s")}
                        >
                            <div className="w-4 h-0.5 bg-gray-400"></div>
                        </div>
                        <div
                            className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2 cursor-row-resize bg-white border border-gray-300 rounded shadow-sm hover:bg-blue-500/50 z-10 flex justify-center items-center"
                            onMouseDown={(e) => handleResize(e as any, "n")}
                        >
                            <div className="w-4 h-0.5 bg-gray-400"></div>
                        </div>

                        {/* Corner Handles */}
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
        </NodeViewWrapper>
    );
};

export const ImageExtension = TiptapImage.extend({
    name: "imageExtension",

    addAttributes() {
        return {
            ...this.parent?.(),
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
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageComponent);
    },
});
