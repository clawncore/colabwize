import React, { useState, useEffect } from "react";
import {
    GripVertical,
    Plus,
    Trash2,
    ChevronRight,
    Layout,
    FileText,
    Save,
    RefreshCw
} from "lucide-react";
import { Project, documentService } from "../../services/documentService";

interface OutlineItem {
    id: string;
    title: string;
    description?: string;
    level: number; // 1 for H1, 2 for H2, etc.
}

interface OutlineBuilderProps {
    project: Project;
    onUpdate: (outline: OutlineItem[]) => void;
    onSyncToEditor: (outline: OutlineItem[]) => void;
}

export const OutlineBuilder: React.FC<OutlineBuilderProps> = ({
    project,
    onUpdate,
    onSyncToEditor
}) => {
    const [items, setItems] = useState<OutlineItem[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize from project
    useEffect(() => {
        if (project.outline) {
            setItems(project.outline as OutlineItem[]);
        } else {
            // Default initial outline
            setItems([
                { id: "1", title: "Introduction", level: 1 },
                { id: "2", title: "Literature Review", level: 1 },
                { id: "3", title: "Methodology", level: 1 },
                { id: "4", title: "Results", level: 1 },
                { id: "5", title: "Discussion", level: 1 },
                { id: "6", title: "Conclusion", level: 1 },
            ]);
        }
    }, [project.id, project.outline]);

    const handleAddItem = () => {
        const newItem: OutlineItem = {
            id: Date.now().toString(),
            title: "New Section",
            level: 1
        };
        const newItems = [...items, newItem];
        setItems(newItems);
        onUpdate(newItems); // Notify parent immediately
    };

    const handleRemoveItem = (id: string) => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
        // Propagate update but don't force save yet (optional)
        onUpdate(newItems);
    };

    // Drag and Drop State
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = "move";
        // Ghost image hack or improvement can go here
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) return;

        const draggedIndex = items.findIndex(item => item.id === draggedItemId);
        const targetIndex = items.findIndex(item => item.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Create new array with swapped items
        const newItems = [...items];
        const [movedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, movedItem);

        setItems(newItems);
    };

    const handleDragEnd = () => {
        setDraggedItemId(null);
        onUpdate(items); // Notify parent of reorder
    };


    const handleUpdateItem = (id: string, updates: Partial<OutlineItem>) => {
        setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const handleLevelChange = (id: string) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const nextLevel = item.level === 3 ? 1 : item.level + 1;
                return { ...item, level: nextLevel };
            }
            return item;
        }));
    };

    const saveOutline = async () => {
        setIsSaving(true);
        try {
            await documentService.updateProject(
                project.id,
                project.title,
                project.description || "",
                project.content,
                project.word_count,
                project.citation_style,
                items
            );
            onUpdate(items);
        } catch (error) {
            console.error("Failed to save outline", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-gray-900 text-sm">Structural Plan</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={saveOutline}
                        disabled={isSaving}
                        className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors bg-white border border-gray-200 rounded shadow-sm"
                        title="Save Plan"
                    >
                        <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-pulse' : ''}`} />
                    </button>
                    <button
                        onClick={() => onSyncToEditor(items)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 transition-colors bg-white border border-blue-200 rounded shadow-sm flex items-center gap-1.5"
                        title="Sync Headings to Editor"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Sync</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
                {items.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FileText className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500">No sections added yet.</p>
                        <button
                            onClick={handleAddItem}
                            className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                        >
                            Add first section
                        </button>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragOver={(e) => handleDragOver(e, item.id)}
                            onDragEnd={handleDragEnd}
                            className={`group flex items-center gap-2 p-2 rounded-lg border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all ${item.level === 2 ? 'ml-4' : item.level === 3 ? 'ml-8' : ''
                                } ${draggedItemId === item.id ? 'opacity-50 border-dashed border-blue-300 bg-blue-50' : ''}`}
                        >
                            <div className="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-400">
                                <GripVertical className="w-4 h-4" />
                            </div>

                            <div
                                onClick={() => handleLevelChange(item.id)}
                                className="cursor-pointer p-0.5 rounded hover:bg-gray-100"
                                title="Change Level"
                            >
                                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${item.level === 1 ? 'rotate-0 text-blue-600' :
                                    item.level === 2 ? 'rotate-90 text-teal-600' :
                                        'rotate-180 text-orange-600'
                                    }`} />
                            </div>

                            <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium text-gray-700"
                                placeholder="Section title..."
                            />

                            <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={handleAddItem}
                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs font-bold text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Section
                </button>
            </div>
        </div>
    );
};
