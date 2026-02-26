"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import WorkspaceService, {
  Workspace,
} from "../../../services/workspaceService";
import { useUser } from "../../../services/useUser";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import {
  Loader2,
  Mail,
  Users,
  Shield,
  ShieldCheck,
  Eye,
  Pencil,
  UserMinus,
  Crown,
  ChevronDown,
} from "lucide-react";
import { toast } from "../../../hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    description: "Full access, can manage members",
  },
  editor: {
    label: "Editor",
    icon: Pencil,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "Can create and edit content",
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "text-slate-600 bg-slate-50 border-slate-200",
    description: "Read-only access",
  },
};

export default function WorkspaceMembersPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { user } = useUser();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const isOwner = workspace?.owner_id === user?.id;
  const currentUserMember = workspace?.members?.find(
    (m) => m.user_id === user?.id
  );
  const canManageMembers =
    isOwner || currentUserMember?.role === "admin";

  const loadWorkspace = async () => {
    setIsLoading(true);
    try {
      const [workspaceData, invitationsData] = await Promise.all([
        WorkspaceService.getWorkspace(workspaceId),
        WorkspaceService.getWorkspaceInvitations(workspaceId)
      ]);
      setWorkspace(workspaceData);
      setPendingInvitations(Array.isArray(invitationsData) ? invitationsData.filter((i: any) => i.status === "pending") : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load workspace members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId) {
      loadWorkspace();
    }
  }, [workspaceId]);

  const handleInvite = async () => {
    if (!workspace || !inviteEmail) return;
    setIsInviting(true);
    try {
      await WorkspaceService.inviteMember(workspaceId, inviteEmail, inviteRole);
      toast({
        title: "Invited!",
        description: `${inviteEmail} has been invited as ${inviteRole}.`,
      });
      setInviteEmail("");
      loadWorkspace();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to invite user.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    setRevokingInviteId(invitationId);
    try {
      await WorkspaceService.revokeInvitation(workspaceId, invitationId);
      toast({
        title: "Invitation Revoked",
        description: "The invitation has been canceled.",
      });
      loadWorkspace();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to revoke invitation.",
        variant: "destructive",
      });
    } finally {
      setRevokingInviteId(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await WorkspaceService.updateMemberRole(workspaceId, memberId, newRole);
      toast({
        title: "Role Updated",
        description: `Member role changed to ${newRole}.`,
      });
      setRoleDropdownOpen(null);
      loadWorkspace();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update role.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingMemberId(memberId);
    try {
      await WorkspaceService.removeMember(workspaceId, memberId);
      toast({
        title: "Member Removed",
        description: "Member has been removed from the workspace.",
      });
      setConfirmRemove(null);
      loadWorkspace();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to remove member.",
        variant: "destructive",
      });
    } finally {
      setRemovingMemberId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-background">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center gap-2">
          <Users className="w-7 h-7 text-teal-500" />
          {workspace?.name} — Members
        </h1>
        <p className="text-muted-foreground">
          {workspace?.members?.length || 0} member
          {(workspace?.members?.length || 0) !== 1 ? "s" : ""} in this
          workspace.
        </p>
      </div>

      {/* Invite Section */}
      {canManageMembers && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-teal-500" />
              Invite New Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="max-w-md"
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                {isInviting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations List */}
      {canManageMembers && pendingInvitations.length > 0 && (
        <Card className="mb-8 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-amber-500" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card/50 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{invite.email}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        Invited as {invite.role} • By {invite.inviter.full_name || invite.inviter.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRevokeInvite(invite.id)}
                    disabled={revokingInviteId === invite.id}
                  >
                    {revokingInviteId === invite.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Revoke"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-500" />
            Active Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workspace?.members?.map((member) => {
              const isOwnMember = member.user_id === workspace.owner_id;
              const roleConfig =
                ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG] ||
                ROLE_CONFIG.viewer;
              const RoleIcon = roleConfig.icon;

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all"
                >
                  {/* Member Info */}
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                      {member.user.full_name
                        ?.substring(0, 2)
                        .toUpperCase() ||
                        member.user.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {member.user.full_name || "User"}
                        </p>
                        {isOwnMember && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-600 border border-amber-200 font-bold uppercase tracking-wider">
                            <Crown className="w-3 h-3" /> Owner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Role & Actions */}
                  <div className="flex items-center gap-2">
                    {/* Role Badge / Dropdown */}
                    {canManageMembers && !isOwnMember ? (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setRoleDropdownOpen(
                              roleDropdownOpen === member.id
                                ? null
                                : member.id
                            )
                          }
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer hover:opacity-80 ${roleConfig.color}`}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleConfig.label}
                          <ChevronDown className="w-3 h-3 ml-0.5" />
                        </button>

                        {/* Role Dropdown */}
                        {roleDropdownOpen === member.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-lg z-50 py-1">
                            {Object.entries(ROLE_CONFIG).map(
                              ([key, config]) => (
                                <button
                                  key={key}
                                  onClick={() =>
                                    handleRoleChange(member.id, key)
                                  }
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted transition-colors ${member.role === key
                                    ? "bg-muted font-bold"
                                    : ""
                                    }`}
                                >
                                  <config.icon className="w-3.5 h-3.5" />
                                  <div className="text-left">
                                    <p className="font-medium">
                                      {config.label}
                                    </p>
                                    <p className="text-muted-foreground text-[10px]">
                                      {config.description}
                                    </p>
                                  </div>
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${roleConfig.color}`}
                      >
                        <RoleIcon className="w-3.5 h-3.5" />
                        {roleConfig.label}
                      </span>
                    )}

                    {/* Remove Button */}
                    {canManageMembers && !isOwnMember && (
                      <>
                        {confirmRemove === member.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={removingMemberId === member.id}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs h-7 px-2"
                            >
                              {removingMemberId === member.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Confirm"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setConfirmRemove(null)}
                              className="text-xs h-7 px-2"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmRemove(member.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            title="Remove member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {(!workspace?.members || workspace.members.length === 0) && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No members yet. Invite someone to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
