import { Editor } from "@tiptap/react";
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";

interface GrammarBubbleMenuProps {
    editor: Editor;
}

export const GrammarBubbleMenu = ({ editor }: GrammarBubbleMenuProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [activeError, setActiveError] = useState<any>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updatePosition = () => {
            if (!editor) return;

            const { selection } = editor.state;
            const { from } = selection;

            // Better way: get mark at selection
            const { $from } = selection;
            const grammarMark = $from.marks().find(m => m.type.name === 'grammar-error');

            if (!grammarMark) {
                setIsVisible(false);
                setActiveError(null);
                return;
            }

            // We found a mark!
            setActiveError(grammarMark.attrs);
            setIsVisible(true);

            // Calculate Position
            const coords = editor.view.coordsAtPos(from);
            if (coords) {
                // Position slightly below the line
                setPosition({
                    top: coords.bottom + window.scrollY + 10,
                    left: coords.left + window.scrollX - 20
                });
            }
        };

        // We want to update when selection changes
        editor.on("selectionUpdate", updatePosition);
        editor.on("focus", updatePosition);
        editor.on("blur", () => {
            // Optional: hide on blur, but delay to allow clicking the menu
            setTimeout(() => {
                if (document.activeElement?.closest('.grammar-bubble-menu')) return;
            }, 200);
        });

        return () => {
            editor.off("selectionUpdate", updatePosition);
            editor.off("focus", updatePosition);
            editor.off("blur");
        };
    }, [editor]);

    const handleFix = () => {
        if (!activeError || !activeError.suggestion) return;

        // Replace text? 
        // This is tricky because "Mark" doesn't inherently know its range.
        // We need to find the range of this specific mark.

        // For MVP: We will simply replace the *current selection* if user selected the error.
        // If just clicked, we try to expand to the mark.

        editor.chain().focus().extendMarkRange('grammar-error').insertContent(activeError.suggestion).unsetMark('grammar-error').run();

        setIsVisible(false);
    };

    const handleIgnore = () => {
        editor.chain().focus().extendMarkRange('grammar-error').unsetMark('grammar-error').run();
        setIsVisible(false);
    };

    if (!isVisible || !activeError) return null;

    return (
        <div
            ref={menuRef}
            className="grammar-bubble-menu absolute z-50 flex flex-col bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-72 animate-in fade-in zoom-in-95 duration-200"
            style={{ top: position.top, left: position.left }}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${activeError.type === 'spelling' ? 'bg-red-100 text-red-700' :
                        activeError.type === 'grammar' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {activeError.type || 'Error'}
                    </span>
                </div>
                <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1">{activeError.explanation}</p>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 line-through">{activeError.original}</span>
                    <span
                        className="text-sm font-bold text-green-700 cursor-pointer hover:underline"
                        onClick={handleFix}
                        title="Click to apply this correction"
                    >
                        {activeError.suggestion}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
                {/* Fix It button removed per user request - manual correction only */}
                <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-gray-600 h-8 hover:bg-gray-100"
                    onClick={handleIgnore}
                >
                    Ignore
                </Button>
            </div>
        </div>
    );
};
