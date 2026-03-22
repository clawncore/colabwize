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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import WorkspaceService from "../../../services/workspaceService";
import WorkspaceTaskService from "../../../services/workspaceTaskService";
import { documentService } from "../../../services/documentService";
import { formatContentForTiptap } from "../../../utils/editorUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";

export default function TemplateGallery({
  workspaceId: propsWorkspaceId,
  onSelect,
  isSelectionMode = false,
}: {
  workspaceId?: string;
  onSelect?: (template: any) => void;
  isSelectionMode?: boolean;
}) {
  const { id: paramId } = useParams<{ id: string }>();
  const workspaceId = propsWorkspaceId || paramId;
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState<string>("");

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUseTemplateOpen, setIsUseTemplateOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null,
  );
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "standard",
    content: "",
    is_public: false,
  });

  const [useTemplateData, setUseTemplateData] = useState({
    title: "",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "standard",
      content: "",
      is_public: false,
    });
    setEditingTemplate(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      type: template.type,
      content:
        typeof template.content === "string"
          ? template.content
          : JSON.stringify(template.content, null, 2),
      is_public: template.is_public || false,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) {
      toast.error("Name and content are required");
      return;
    }

    try {
      setIsSubmitting(true);
      let parsedContent = formData.content;
      try {
        parsedContent = JSON.parse(formData.content);
      } catch (e) {
        // It's just a string, which is fine
      }

      const templatePayload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        content: parsedContent,
        is_public: formData.is_public,
        workspace_id: workspaceId,
      };

      if (editingTemplate) {
        await TemplateService.updateTemplate(
          editingTemplate.id,
          templatePayload,
        );
        toast.success("Template updated successfully");
      } else {
        await TemplateService.createTemplate(templatePayload);
        toast.success("Template created successfully");
      }

      setIsFormOpen(false);
      loadTemplates();
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error(
        editingTemplate
          ? "Failed to update template"
          : "Failed to create template",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenUse = (template: Template) => {
    // If we're in selection mode, simply call the onSelect callback
    if (onSelect) {
      onSelect(template);
      return;
    }

    setSelectedTemplate(template);
    setUseTemplateData({
      title: `${template.name} - New Project`,
      description: "",
    });
    setIsUseTemplateOpen(true);
  };

  const handleUseTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useTemplateData.title || !selectedTemplate) {
      toast.error("Project title is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const formattedContent = formatContentForTiptap(selectedTemplate.content);
      const response = await documentService.createProject(
        useTemplateData.title,
        useTemplateData.description,
        formattedContent,
        "", // no specific template id mapping needed here by the service signature
        workspaceId,
      );

      if (response.success && response.data) {
        toast.success("Project created from template!");
        setIsUseTemplateOpen(false);
        navigate(
          `/dashboard/workspace/${workspaceId}/documents?project=${response.data.id}`,
        );
      } else {
        throw new Error(response.error || "Failed to create project");
      }
    } catch (error: any) {
      console.error("Failed to use template:", error);
      toast.error(error.message || "Failed to create project from template");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      loadTemplates();
      fetchWorkspaceName();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const fetchWorkspaceName = async () => {
    try {
      const data = await WorkspaceService.getWorkspace(workspaceId);
      if (data) {
        setWorkspaceName(data.name);
      }
    } catch (error) {
      console.error("Failed to fetch workspace name", error);
    }
  };

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      // Load document templates
      const docTemplates = await TemplateService.getTemplates({ workspaceId });

      // Load task templates (if we have a workspace ID)
      let taskTemplates: any[] = [];
      if (workspaceId) {
        try {
          const workspaceTasks = await WorkspaceTaskService.getTasks(
            workspaceId,
            true,
          );
          taskTemplates = workspaceTasks
            .filter((t) => t.is_template)
            .map((t) => ({
              ...t,
              name: t.template_name || t.title,
              type: "task",
              is_task_template: true,
            }));
        } catch (err) {
          console.error("Failed to load task templates:", err);
        }
      }

      setTemplates([...docTemplates, ...taskTemplates]);
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingTemplateId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTemplateId) return;
    const id = deletingTemplateId;
    setIsDeleteConfirmOpen(false);
    setDeletingTemplateId(null);

    // Optimistic removal — remove from state immediately
    const previousTemplates = [...templates];
    setTemplates((prev) => prev.filter((t) => t.id !== id));

    try {
      // @ts-ignore
      await TemplateService.deleteTemplate(id);
      toast.success("Template deleted");
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template");
      // Restore on failure
      setTemplates(previousTemplates);
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
      <div
        className={`${isSelectionMode ? "p-0" : "p-8"} bg-background min-h-screen`}>
        <div className="flex justify-between items-center mb-8">
          <div>
            {!isSelectionMode && (
              <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center gap-2">
                {isLoading ? (
                  <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  workspaceName
                )}{" "}
                Workspace Templates
              </h1>
            )}
            <p className="text-muted-foreground">
              {isSelectionMode
                ? "Select a template to quickly create your next task."
                : "Manage custom templates for your workspace."}
            </p>
          </div>
          {!isSelectionMode && (
            <Button
              className="bg-teal-500 border-border hover:bg-teal-600 hover:border-teal-600"
              onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          )}
        </div>

        {templates.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-gray-50/50 dashed border-gray-200">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No templates
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new template.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="group relative overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {template.description || "No description"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(template)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onSelect={() => handleDeleteClick(template.id)}>
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
                    {template.is_public && <Badge>Public</Badge>}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-0">
                  <span>
                    Updated {new Date(template.updated_at).toLocaleDateString()}
                  </span>
                  <Button
                    variant="secondary"
                    className="bg-teal-500 border-border hover:bg-teal-600 hover:border-teal-600"
                    onClick={() => handleOpenUse(template)}>
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) resetForm();
        }}>
        <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Update the details of your workspace template."
                : "Create a reusable document template for this workspace."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Weekly Report"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Document Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  placeholder="e.g., standard, research-paper"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Briefly describe what this template is used for..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Template Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Enter markdown, plain text, or JSON content for the editor..."
                className="font-mono text-sm"
                rows={10}
                required
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingTemplate
                    ? "Update Template"
                    : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isUseTemplateOpen} onOpenChange={setIsUseTemplateOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle>Use Template</DialogTitle>
            <DialogDescription>
              Create a new project in your workspace using the "
              {selectedTemplate?.name}" template.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUseTemplate} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="projectTitle">Project Title *</Label>
              <Input
                id="projectTitle"
                value={useTemplateData.title}
                onChange={(e) =>
                  setUseTemplateData({
                    ...useTemplateData,
                    title: e.target.value,
                  })
                }
                placeholder="Enter new project title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description</Label>
              <Textarea
                id="projectDescription"
                value={useTemplateData.description}
                onChange={(e) =>
                  setUseTemplateData({
                    ...useTemplateData,
                    description: e.target.value,
                  })
                }
                placeholder="Briefly describe this new project..."
                rows={3}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" onClick={() => setIsUseTemplateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={(open) => {
          setIsDeleteConfirmOpen(open);
          if (!open) setDeletingTemplateId(null);
        }}>
        <DialogContent className="sm:max-w-[400px] bg-white">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
