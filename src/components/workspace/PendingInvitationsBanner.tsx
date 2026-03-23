import React, { useState, useEffect } from "react";
import WorkspaceService from "../../services/workspaceService";
import { Button } from "../ui/button";
import {
  Loader2,
  Mail,
  Check,
  X,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "../../hooks/use-toast";

interface Invitation {
  id: string;
  token: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
  workspace: {
    id: string;
    name: string;
    description: string | null;
  };
  inviter: {
    full_name: string | null;
    email: string;
  };
}

export default function PendingInvitationsBanner({
  onInvitationAction,
}: {
  onInvitationAction?: () => void;
}) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingToken, setProcessingToken] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const fetchInvitations = async () => {
    try {
      const data = await WorkspaceService.getPendingInvitations();
      setInvitations(data);
    } catch (error) {
      // Silently fail — not critical
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleAccept = async (token: string, workspaceName: string) => {
    setProcessingToken(token);
    try {
      await WorkspaceService.acceptInvitation(token);
      toast({
        title: "Invitation Accepted!",
        description: `You've joined "${workspaceName}".`,
      });
      setInvitations((prev) => prev.filter((i) => i.token !== token));
      onInvitationAction?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation.",
        variant: "destructive",
      });
    } finally {
      setProcessingToken(null);
    }
  };

  const handleDecline = async (token: string) => {
    setProcessingToken(token);
    try {
      await WorkspaceService.declineInvitation(token);
      toast({
        title: "Invitation Declined",
        description: "The invitation has been declined.",
      });
      setInvitations((prev) => prev.filter((i) => i.token !== token));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline invitation.",
        variant: "destructive",
      });
    } finally {
      setProcessingToken(null);
    }
  };

  if (loading || invitations.length === 0) return null;

  return (
    <div className="mx-4 mt-4 mb-0">
      <div className="rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-sm overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-teal-100/30 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-teal-800">
                {invitations.length} Pending Invitation
                {invitations.length !== 1 ? "s" : ""}
              </p>
              <p className="text-[11px] text-teal-600">
                You've been invited to join workspace
                {invitations.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-teal-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-teal-500" />
          )}
        </button>

        {/* Invitation Cards */}
        {!collapsed && (
          <div className="px-4 pb-4 space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-teal-100 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {inv.workspace.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Invited by {inv.inviter.full_name || inv.inviter.email} as{" "}
                      <span className="font-medium capitalize">{inv.role}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                  <Button
                    onClick={() => handleAccept(inv.token, inv.workspace.name)}
                    disabled={processingToken === inv.token}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-xs h-7 px-3">
                    {processingToken === inv.token ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleDecline(inv.token)}
                    disabled={processingToken === inv.token}
                    className="text-xs h-7 px-2 text-slate-500 hover:text-red-600 hover:border-red-200">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
