import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Quote, Check } from "lucide-react";

interface CitationStyleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentStyle: string | null;
    onSave: (style: string) => void;
}

const STYLES = [
    { id: "APA", label: "APA", description: "Standard (Author, Year)" },
    { id: "MLA", label: "MLA", description: "Humanities (Author Page)" },
    { id: "Chicago", label: "Chicago", description: "History & Notes" },
    { id: "IEEE", label: "IEEE", description: "Engineering [1]" },
];

export const CitationStyleDialog: React.FC<CitationStyleDialogProps> = ({
    open,
    onOpenChange,
    currentStyle,
    onSave
}) => {
    const [selectedStyle, setSelectedStyle] = useState<string>(currentStyle || "APA");

    const handleConfirm = () => {
        onSave(selectedStyle);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <Quote className="w-6 h-6" />
                        <DialogTitle>Citation Style</DialogTitle>
                    </div>
                    <DialogDescription>
                        This style will be used for all citations in your document. The Citation Audit will flag any format violations.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    {STYLES.map((style) => (
                        <div
                            key={style.id}
                            onClick={() => setSelectedStyle(style.id)}
                            className={`
                                cursor-pointer rounded-lg border p-4 transition-all hover:bg-gray-50 flex flex-col items-center justify-center text-center relative
                                ${selectedStyle === style.id
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                    : "border-gray-200"
                                }
                            `}
                        >
                            {selectedStyle === style.id && (
                                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-0.5">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                            <span className="font-bold text-gray-900">{style.label}</span>
                            <span className="text-xs text-gray-500 mt-1">{style.description}</span>
                        </div>
                    ))}

                    <div className="col-span-2 cursor-not-allowed opacity-50 border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center text-sm text-gray-400">
                        + Custom Citation Style (Coming Soon)
                    </div>
                </div>

                <div className="bg-blue-50 rounded-md p-3 text-xs text-blue-700 mb-4">
                    You can change this later in settings, but it may require re-checking all citations.
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                        Confirm & Continue
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
