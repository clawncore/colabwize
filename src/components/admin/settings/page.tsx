"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import WorkspaceService, {
  Workspace,
} from "../../../services/workspaceService";
import { useUser } from "../../../services/useUser";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Loader2, Settings, Trash2, Save, AlertTriangle } from "lucide-react";
import { toast } from "../../../hooks/use-toast";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const workspaceId = params.id as string;
  const { user } = useUser();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");

  const isOwner = workspace?.owner_id === user?.id;

  useEffect(() => {
    const loadWorkspace = async () => {
      setIsLoading(true);
      try {
        const data = await WorkspaceService.getWorkspace(workspaceId);
        setWorkspace(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setIcon(data.icon || "");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load workspace settings",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (workspaceId) loadWorkspace();
  }, [workspaceId]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Workspace name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await WorkspaceService.updateWorkspace(workspaceId, {
        name: name.trim(),
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
      });
      setWorkspace(updated);
      toast({
        title: "Settings Saved",
        description: "Workspace settings updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workspace settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== workspace?.name) return;

    setIsDeleting(true);
    try {
      await WorkspaceService.deleteWorkspace(workspaceId);
      toast({
        title: "Workspace Deleted",
        description: `"${workspace?.name}" has been permanently deleted.`,
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.message ||
          "Failed to delete workspace. Only the owner can delete a workspace.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const hasChanges =
    workspace &&
    (name !== (workspace.name || "") ||
      description !== (workspace.description || "") ||
      icon !== (workspace.icon || ""));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="w-full p-8 min-h-screen bg-background">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center gap-2">
          <Settings className="w-7 h-7 text-teal-500" />
          Workspace Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your workspace configuration and preferences.
        </p>
      </div>

      {/* General Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Workspace Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Workspace Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              className="max-w-md"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this workspace for?"
              rows={3}
              className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          {/* Icon / Emoji */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Icon (Emoji)
            </label>
            <div className="flex items-center gap-3 max-w-md">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 flex items-center justify-center text-2xl">
                {icon || "🏢"}
              </div>
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🏢"
                className="w-24"
                maxLength={2}
              />
              <span className="text-xs text-muted-foreground">
                Paste any emoji
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isOwner && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="text-lg text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-red-800 font-medium mb-1">
                  Delete this workspace
                </p>
                <p className="text-xs text-red-600 mb-3">
                  This action is permanent and cannot be undone. All projects,
                  tasks, messages, and data in this workspace will be
                  permanently deleted.
                </p>

                {!showDeleteConfirm ? (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Workspace
                  </Button>
                ) : (
                  <div className="p-4 border border-red-300 rounded-lg bg-white space-y-3">
                    <p className="text-sm text-red-800">
                      Type <strong>{workspace?.name}</strong> to confirm
                      deletion:
                    </p>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder={workspace?.name}
                      className="max-w-md border-red-200 focus-visible:ring-red-400"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleDelete}
                        disabled={
                          isDeleting || deleteConfirmText !== workspace?.name
                        }
                        className="bg-red-600 hover:bg-red-700 text-white">
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Permanently Delete
                      </Button>
                      <Button
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText("");
                        }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
