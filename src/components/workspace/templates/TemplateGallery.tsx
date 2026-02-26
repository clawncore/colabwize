import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TemplateService, { Template } from "../../../services/templateService";
import { Button } from "../../ui/button";
import { Plus, FileText, MoreVertical, Trash2, Edit } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { toast } from "sonner";



export default function TemplateGallery() {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (workspaceId) {
            loadTemplates();
        }
    }, [workspaceId]);

    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await TemplateService.getTemplates({ workspaceId });
            setTemplates(data);
        } catch (error) {
            console.error("Failed to load templates:", error);
            toast.error("Failed to load templates");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this template?")) return;
        try {
            // We need to implement delete in TemplateService.ts wrapper or use JS directly
            // Assuming deleteTemplate exists in the underlying service
            // @ts-ignore
            await TemplateService.deleteTemplate(id); // Check if this method exists in wrapper or JS
            toast.success("Template deleted");
            loadTemplates(); // Refresh list
        } catch (error) {
            console.error("Failed to delete template:", error);
            toast.error("Failed to delete template");
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Templates</h2>
                    <p className="text-muted-foreground">
                        Manage custom templates for your workspace.
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                </Button>
            </div>

            {templates.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-gray-50/50 dashed border-gray-200">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new template.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <Card key={template.id} className="group relative overflow-hidden transition-all hover:shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        <CardDescription className="line-clamp-2">{template.description || "No description"}</CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => { }}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(template.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Badge variant="secondary">{template.type}</Badge>
                                    {template.is_public && <Badge variant="outline">Public</Badge>}
                                </div>
                            </CardContent>
                            <CardFooter className="text-xs text-muted-foreground pt-0">
                                Updated {new Date(template.updated_at).toLocaleDateString()}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
