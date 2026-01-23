import React, { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Quote } from "lucide-react";
import { StoredCitation } from "./SourceDetailPanel";
import { formatCitation, CitationStyle } from "../../utils/citationFormatter";

interface CitationStylePopoverProps {
    source: StoredCitation;
    children: React.ReactNode;
    onInsert: (inText: string, fullReference: string, style: CitationStyle) => void;
    title?: string;
    confirmLabel?: string;
    fixedStyle?: CitationStyle | null;
}

export const CitationStylePopover: React.FC<CitationStylePopoverProps> = ({
    source,
    children,
    onInsert,
    title,
    confirmLabel,
    fixedStyle,
}) => {
    const [open, setOpen] = useState(false);
    const [style, setStyle] = useState<CitationStyle>(fixedStyle || "APA");

    // Update style if fixedStyle changes
    React.useEffect(() => {
        if (fixedStyle) setStyle(fixedStyle);
    }, [fixedStyle]);

    const handleInsert = () => {
        let inText = "";
        let fullReference = "";

        // Use precomputed citations if available (preferred)
        if (source.formatted_citations) {
            const styleKey = style.toLowerCase();
            const precomputed = source.formatted_citations[styleKey];
            if (precomputed) {
                inText = precomputed.inText;
                fullReference = precomputed.reference;
            }
        }

        // Fallback to dynamic formatting if not available (legacy support)
        if (!inText || !fullReference) {
            inText = formatCitation(source, style, "in-text");
            fullReference = formatCitation(source, style, "reference-entry");
        }

        onInsert(inText, fullReference, style);
        setOpen(false);
    };

    return (
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild>{children}</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="rounded-lg bg-white shadow-lg border border-gray-200 p-3 w-64 z-50 animate-in fade-in zoom-in-95 duration-200"
                    sideOffset={5}
                >
                    <div className="flex flex-col gap-3">
                        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-2">
                            <Quote className="w-3 h-3 text-blue-600" />
                            {title || "Insert Citation"}
                        </h4>

                        {/* Style Selector */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-gray-500 uppercase">
                                Style
                            </label>
                            {fixedStyle ? (
                                <div className="text-xs text-gray-900 font-medium px-2 py-1 bg-gray-100 rounded border border-gray-200">
                                    {fixedStyle} <span className="text-[9px] text-gray-400 font-normal ml-1">(Document Default)</span>
                                </div>
                            ) : (
                                <select
                                    value={style}
                                    onChange={(e) => setStyle(e.target.value as CitationStyle)}
                                    className="w-full text-xs border-gray-300 rounded-md py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="APA">APA</option>
                                    <option value="MLA">MLA</option>
                                    <option value="Chicago">Chicago</option>
                                    <option value="IEEE">IEEE</option>
                                </select>
                            )}
                        </div>

                        {/* Insert Button */}
                        <button
                            onClick={handleInsert}
                            className="w-full py-1.5 bg-blue-600 text-white text-xs font-bold rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {confirmLabel || "Insert"}
                        </button>
                    </div>
                    <Popover.Arrow className="fill-white" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};
