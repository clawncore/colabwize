"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Save,
  Trash2,
  Copy,
  Repeat,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  VisuallyHidden,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { AssigneeSelector } from "./AssigneeSelector";
import { PrioritySelector } from "./PrioritySelector";
import MiniEditor from "./MiniEditor";
import WorkspaceTaskService, {
  WorkspaceTask,
  WorkspaceSubtask,
  WorkspaceAttachment,
} from "../../../services/workspaceTaskService";
import { AttachmentSection } from "./AttachmentSection";
import { Priority } from "./PrioritySelector";
import { toast } from "../../../hooks/use-toast";
import { CommentSection } from "./CommentSection";
import { useUser } from "../../../services/useUser";
import { SubtaskSection } from "./SubtaskSection";
import { LabelSelector } from "./LabelSelector";
import { DependencySection } from "./DependencySection";
import RecurrencePatternPicker from "./RecurrencePatternPicker";
import { TimeTracker } from "./TimeTracker";
import CustomFieldsSection from "../CustomFieldsSection";
import { useWorkspacePermissions } from "../../../hooks/useWorkspacePermissions";

interface User {
  id: string;
  full_name: string | null;
  email: string;
}

interface TaskDetailsModalProps {
  task: WorkspaceTask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: WorkspaceTask) => void;
  onDelete: (taskId: string) => void;
  workspaceId: string;
}

export function TaskDetailsModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  workspaceId,
}: TaskDetailsModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [priority, setPriority] = React.useState<Priority>("medium");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
  const [assigneeIds, setAssigneeIds] = React.useState<string[]>([]);
  const [subtasks, setSubtasks] = React.useState<WorkspaceSubtask[]>([]);
  const [attachments, setAttachments] = React.useState<WorkspaceAttachment[]>(
    []
  );
  const [members, setMembers] = React.useState<User[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const { user } = useUser();
  const { canEdit } = useWorkspacePermissions(workspaceId);

  // Recurrence state
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [recurrencePattern, setRecurrencePattern] = React.useState("daily");
  const [recurrenceEndDate, setRecurrenceEndDate] = React.useState<
    Date | undefined
  >(undefined);
  const [recurrenceMaxOccurrences, setRecurrenceMaxOccurrences] =
    React.useState<number | undefined>(undefined);

  // Project linking state
  const [projectId, setProjectId] = React.useState<string | undefined>(
    undefined
  );
  const [workspaceProjects, setWorkspaceProjects] = React.useState<any[]>([]);

  // Initialize form with task data
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority as Priority);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setAssigneeIds(task.assignees?.map((a) => a.user.id) || []);
      setSubtasks(task.subtasks || []);
      setAttachments(task.attachments || []);

      // Set recurrence state
      setIsRecurring(task.is_recurring || false);
      setRecurrencePattern(task.recurrence_pattern || "daily");
      setRecurrenceEndDate(
        task.recurrence_end_date
          ? new Date(task.recurrence_end_date)
          : undefined
      );
      setRecurrenceMaxOccurrences(task.recurrence_max_occurrences);

      // Set project linking
      setProjectId(task.project_id || undefined);
    }
  }, [task]);

  // Fetch workspace members for assignee selection
  React.useEffect(() => {
    if (isOpen && workspaceId) {
      WorkspaceTaskService.getWorkspaceMembers(workspaceId)
        .then(setMembers)
        .catch((err) => console.error("Failed to fetch members:", err));
    }
  }, [isOpen, workspaceId]);

  // Fetch workspace projects for project linking
  React.useEffect(() => {
    if (isOpen && workspaceId) {
      fetch(`/api/workspaces/${workspaceId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
        .then((res) => res.json())
        .then((workspace) => {
          setWorkspaceProjects(workspace.projects || []);
        })
        .catch((err) => console.error("Failed to fetch projects:", err));
    }
  }, [isOpen, workspaceId]);

  const handleSave = async () => {
    if (!task || !canEdit) return;
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await WorkspaceTaskService.updateTask(task.id, {
        title,
        description,
        status,
        priority,
        due_date: dueDate,
        assignee_ids: assigneeIds,
        project_id: projectId, // Include project linking
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : undefined,
        recurrence_end_date: isRecurring ? recurrenceEndDate : undefined,
        recurrence_max_occurrences: isRecurring
          ? recurrenceMaxOccurrences
          : undefined,
      });
      onUpdate(updated);
      toast({ title: "Success", description: "Task updated successfully" });
      onClose();
    } catch (err) {
      console.error("Failed to update task:", err);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!task || !canEdit) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id);
      onClose();
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl bg-white text-gray-600">
        <VisuallyHidden>Task Details: {title}</VisuallyHidden>
        <DialogHeader className="p-6 bg-muted/30 border-b border-border">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-1">
              <Input
                readOnly={!canEdit}
                className={cn(
                  "text-xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto",
                  !canEdit && "cursor-default"
                )}
                placeholder="Task title..."
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-muted-foreground/70">
                  Status:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-muted text-gray-600 font-bold uppercase tracking-wider text-[9px]">
                  {status.replace("-", " ")}
                </span>
                <span className="mx-1">•</span>
                <span>Created by {task.creator?.full_name || "Unknown"}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto overflow-x-hidden bg-white">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="h-3 w-3" /> Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!canEdit}
                    className={cn(
                      "w-full justify-start text-left font-normal h-9 text-xs border-input bg-white text-gray-600 hover:bg-accent hover:text-accent-foreground",
                      !canEdit && "opacity-100 cursor-default"
                    )}
                  >
                    {dueDate ? (
                      format(dueDate, "PPP p")
                    ) : (
                      <span>Pick a date and time</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white shadow-2xl border border-border text-popover-foreground z-[100]"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                  <div className="p-3 border-t border-border flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type="time"
                      disabled={!canEdit}
                      className="h-8 text-xs border-input bg-white text-gray-600 focus:ring-emerald-500/20 focus:border-emerald-500"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        if (dueDate) {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(dueDate);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setDueDate(newDate);
                        }
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ArrowDownCircle className="h-3 w-3" /> Priority
              </Label>
              <PrioritySelector value={priority} onChange={setPriority} disabled={!canEdit} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserIcon className="h-3 w-3" /> Assignees
            </Label>
            <AssigneeSelector
              members={members}
              selectedIds={assigneeIds}
              onChange={setAssigneeIds}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <MiniEditor
              value={description}
              onChange={setDescription}
              placeholder="Add a more detailed description..."
              readOnly={!canEdit}
            />
          </div>

          {/* Project Linking Section */}
          <div className="space-y-2 pt-2">
            <Label htmlFor="project" className="text-sm font-medium">
              Link to Research Project (Optional)
            </Label>
            <select
              id="project"
              value={projectId || ""}
              disabled={!canEdit}
              onChange={(e) => setProjectId(e.target.value || undefined)}
              className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-600 disabled:opacity-100 disabled:cursor-default"
            >
              <option value="">No Project (Workspace-level task)</option>
              {workspaceProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            {projectId && (
              <p className="text-xs text-muted-foreground">
                This task will contribute to the selected project's progress
              </p>
            )}
          </div>

          {/* Recurrence Section */}
          <div className="space-y-3 pt-2">
            <label className={cn("flex items-center gap-2 cursor-pointer", !canEdit && "opacity-70 cursor-default")}>
              <input
                type="checkbox"
                checked={isRecurring}
                disabled={!canEdit}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-gray-600">
                  Make this a recurring task
                </span>
              </div>
            </label>

            {isRecurring && (
              <RecurrencePatternPicker
                value={recurrencePattern}
                startDate={dueDate}
                onChange={(pattern, endDate, maxOccurrences) => {
                  setRecurrencePattern(pattern);
                  setRecurrenceEndDate(endDate);
                  setRecurrenceMaxOccurrences(maxOccurrences);
                }}
                onRemove={() => setIsRecurring(false)}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 pt-2">
            <CustomFieldsSection task={task} onUpdate={() => onUpdate(task)} />

            <LabelSelector
              workspaceId={workspaceId}
              taskId={task.id}
              selectedLabels={task.labels || []}
              onUpdate={onUpdate}
              canEdit={canEdit}
            />

            <SubtaskSection
              taskId={task.id}
              subtasks={subtasks}
              onUpdate={setSubtasks}
              canEdit={canEdit}
            />

            <AttachmentSection
              taskId={task.id}
              attachments={attachments}
              onAttachmentChange={setAttachments}
              canEdit={canEdit}
            />

            <DependencySection
              workspaceId={workspaceId}
              taskId={task.id}
              dependencies={task.dependencies || []}
              blockedBy={task?.blocked_by || []}
              onUpdate={onUpdate}
              canEdit={canEdit}
            />

            {/* Time Tracking Section */}
            <div className="border-t border-border pt-4">
              <TimeTracker taskId={task!.id} onUpdate={onUpdate} canEdit={canEdit} />
            </div>
          </div>

          <div className="border-t border-border mt-2" />

          {/* Comment Section */}
          <CommentSection
            taskId={task.id}
            workspaceId={workspaceId}
            currentUserId={user?.id}
            canEdit={canEdit}
          />
        </div>

        <DialogFooter className="p-4 bg-muted/30 border-t border-border flex justify-between items-center sm:justify-between">
          <div className="flex gap-2">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            )}

            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!task) return;
                  if (!window.confirm("Clone this task?")) return;

                  try {
                    const clonedTask = await WorkspaceTaskService.cloneTask(
                      task.id
                    );
                    onUpdate(clonedTask);
                    onClose();
                  } catch (error) {
                    console.error("Failed to clone task", error);
                    alert("Failed to clone task");
                  }
                }}
                className="text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-xs gap-2"
              >
                <Copy className="h-3.5 w-3.5" /> Clone
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            {canEdit && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs gap-2 min-w-[80px]"
              >
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving
                  </span>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" /> Save
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Re-using icons from Lucide
function ArrowDownCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="m8 12 4 4 4-4" />
    </svg>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
