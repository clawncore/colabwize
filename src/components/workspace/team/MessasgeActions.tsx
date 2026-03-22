"use client";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import { Imessage, useMessage } from "../../../stores/messages";
import { supabaseBrowser } from "../../../lib/supabase/browser";
import { toast } from "sonner";
import { MentionInput, MentionUser } from "../../ui/mention-input";
import workspaceTaskService from "../../../services/workspaceTaskService";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";

export function DeleteAlert() {
  const actionMessage = useMessage((state) => state.actionMessage);
  const optimisticDeleteMessage = useMessage(
    (state) => state.optimisticDeleteMessage,
  );
  const handleDeleteMessage = async () => {
    const supabase = supabaseBrowser();
    optimisticDeleteMessage(actionMessage?.id!);

    const { error } = await supabase
      .from("TeamChatMessage")
      .delete()
      .eq("id", actionMessage?.id!);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Successfully delete a message");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button id="trigger-delete"></button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteMessage}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EditAlert({ workspaceId }: { workspaceId?: string }) {
  const actionMessage = useMessage((state) => state.actionMessage);
  const optimisticUpdateMessage = useMessage(
    (state) => state.optimisticUpdateMessage,
  );

  const [text, setText] = useState("");
  const [members, setMembers] = useState<MentionUser[]>([]);

  useEffect(() => {
    if (actionMessage) {
      setText(actionMessage.content);
    }
  }, [actionMessage]);

  useEffect(() => {
    if (workspaceId) {
      workspaceTaskService
        .getWorkspaceMembers(workspaceId)
        .then((data) => {
          setMembers(
            data.map((member) => ({
              id: member.id,
              name: member.full_name || member.email,
              email: member.email,
            })),
          );
        })
        .catch((err) =>
          console.error("Failed to fetch members for mentions", err),
        );
    }
  }, [workspaceId]);

  const handleEdit = async () => {
    const supabase = supabaseBrowser();
    const resolvedContent = text.replace(
      /@\[([^\]]+)\](?!\()/g,
      (match, name) => {
        const member = members.find((m) => m.name === name);
        return member ? `@[${name}](${member.id})` : match;
      },
    );

    if (resolvedContent.trim()) {
      optimisticUpdateMessage({
        ...actionMessage,
        content: resolvedContent,
      } as Imessage);
      const { error } = await supabase
        .from("TeamChatMessage")
        .update({ content: resolvedContent })
        .eq("id", actionMessage?.id!);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Update Successfully");
      }
      document.getElementById("trigger-edit")?.click();
    } else {
      document.getElementById("trigger-edit")?.click();
      document.getElementById("trigger-delete")?.click();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button id="trigger-edit"></button>
      </DialogTrigger>
      <DialogContent className="w-full">
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
        </DialogHeader>
        <MentionInput
          value={text}
          onChange={setText}
          users={members}
          placeholder="Edit message..."
          onEnter={handleEdit}
        />
        <DialogFooter>
          <Button type="submit" onClick={handleEdit}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
