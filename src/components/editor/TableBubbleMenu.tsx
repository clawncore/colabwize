import { Editor } from "@tiptap/react";
import {
    Trash2,
    Rows,
    Columns as ColumnsIcon,
    Split,
    Combine,
    Table as TableIcon
} from "lucide-react";
import { Toggle } from "../ui/toggle";
import { Separator } from "../ui/separator";
import { useEffect, useState, useRef } from "react";

interface TableBubbleMenuProps {
    editor: Editor;
}

export const TableBubbleMenu = ({ editor }: TableBubbleMenuProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updatePosition = () => {
            if (!editor) return;

            const { selection } = editor.state;

            // Check if selection is inside a table
            if (!editor.isActive("table")) {
                setIsVisible(false);
                return;
            }

            // Calculate position
            const { view } = editor;

            const from = selection.from;
            // Get coordinates of the cursor/selection
            const coords = view.coordsAtPos(from);

            setIsVisible(true);

            // Calculate relative to window to handle basic positioning
            // Offset slightly above the cursor
            // Note: In a real app we might want to use a portal or more advanced calculation relative to the editor container
            // For now, absolute positioning based on page coordinates + scroll

            // Safety check for valid coords
            if (!coords) return;

            setPosition({
                top: coords.top + window.scrollY - 50, // 50px above cursor
                left: Math.max(10, coords.left + window.scrollX - 20)
            });
        };

        editor.on("selectionUpdate", updatePosition);
        editor.on("update", updatePosition);
        editor.on("focus", updatePosition);
        editor.on("blur", ({ event }) => {
            // Optional: delay hide or check if relatedTarget is the menu itself
            // But for simplicity, we can let it hide on blur for now, or keep it if we want persistent toolbar
            // Actually, clicking the toolbar buttons will blur the editor, so we must NOT hide immediately on blur
            // or prevent default on mouse down in the toolbar.
            // Let's rely on selection update mostly.
        });

        return () => {
            editor.off("selectionUpdate", updatePosition);
            editor.off("update", updatePosition);
            editor.off("focus", updatePosition);
            editor.off("blur");
        };
    }, [editor]);

    if (!editor || !isVisible) return null;

    return (
        <div
            ref={menuRef}
            className="flex flex-wrap items-center gap-1 p-1 bg-white border rounded-lg shadow-lg z-50 absolute transition-all duration-200"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
            onMouseDown={(e) => {
                // Prevent editor blur when clicking buttons
                e.preventDefault();
            }}
        >
            <div className="flex items-center gap-1 group">
                <span className="text-xs font-bold text-gray-500 px-2 uppercase tracking-wider">Table</span>
                <Separator orientation="vertical" className="h-4 mx-1" />
            </div>

            {/* Row Operations */}
            <div className="flex items-center gap-0.5">
                <Toggle
                    size="sm"
                    className="p-1 h-8 w-8 hover:bg-gray-100"
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    disabled={!editor.can().addRowBefore()}
                    title="Add Row Before"
                >
                    <Rows className="w-4 h-4 rotate-180" />
                </Toggle>
                <Toggle
                    size="sm"
                    className="p-1 h-8 w-8 hover:bg-gray-100"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    disabled={!editor.can().addRowAfter()}
                    title="Add Row After"
                >
                    <Rows className="w-4 h-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    className="p-1 h-8 w-8 hover:bg-red-50 hover:text-red-500"
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    disabled={!editor.can().deleteRow()}
                    title="Delete Row"
                >
                    <Trash2 className="w-4 h-4" />
                </Toggle>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Column Operations */}
            <div className="flex items-center gap-0.5">
                <Toggle
                    size="sm"
                    className="p-1 h-8 w-8 hover:bg-gray-100"
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                    disabled={!editor.can().addColumnBefore()}
                    title="Add Column Before"
                >
                    <ColumnsIcon className="w-4 h-4 rotate-180" />
                </Toggle>
                <Toggle
                    size="sm"
                    className="p-1 h-8 w-8 hover:bg-gray-100"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    disabled={!editor.can().addColumnAfter()}
                    title="Add Column After"
                >
                    <ColumnsIcon className="w-4 h-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    className="p-1 h-8 w-8 hover:bg-red-50 hover:text-red-500"
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    disabled={!editor.can().deleteColumn()}
                    title="Delete Column"
                >
                    <Trash2 className="w-4 h-4" />
                </Toggle>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Cell Operations */}
            <div className="flex items-center gap-0.5">
                <Toggle
                    size="sm"
                    className="p-1 h-8 w-8 hover:bg-gray-100"
                    onClick={() => editor.chain().focus().mergeCells().run()}
                    disabled={!editor.can().mergeCells()}
                    title="Merge Cells"
                >
                    <Combine className="w-4 h-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    className="p-1 h-8 w-8 hover:bg-gray-100"
                    onClick={() => editor.chain().focus().splitCell().run()}
                    disabled={!editor.can().splitCell()}
                    title="Split Cell"
                >
                    <Split className="w-4 h-4" />
                </Toggle>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Delete Table */}
            <Toggle
                size="sm"
                className="p-1 h-8 w-8 hover:bg-red-100 text-red-600"
                onClick={() => editor.chain().focus().deleteTable().run()}
                disabled={!editor.can().deleteTable()}
                title="Delete Entire Table"
            >
                <span className="sr-only">Delete Table</span>
                <div className="relative">
                    <TableIcon className="w-4 h-4" />
                    <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full w-2 h-2 border border-white"></div>
                </div>
            </Toggle>

        </div>
    );
};
