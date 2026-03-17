import {
  X,
  Mail,
  Calendar,
  Info,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { WorkspaceMember } from "../../../services/workspaceService";

interface UserDetailsPanelProps {
  member: WorkspaceMember;
  onClose: () => void;
}

export function UserDetailsPanel({ member, onClose }: UserDetailsPanelProps) {
  const { user, role, joined_at } = member;

  // Format the joined date
  const joinedDate = new Date(joined_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Role badge styling
  const getRoleBadgeColor = (r: string) => {
    switch (r) {
      case "admin":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "editor":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const roleDisplay = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Member";

  return (
    <div className="w-[320px] shrink-0 border-l border-border bg-white flex flex-col h-full animate-in slide-in-from-right shadow-lg lg:shadow-none z-10 md:static absolute right-0 top-0 bottom-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600" /> User Profile
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          title="Close profile">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="p-6 flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-white shadow-md mb-4 ring-2 ring-emerald-50">
            <AvatarImage src={undefined} />
            <AvatarFallback className="bg-emerald-600 text-white text-3xl font-bold">
              {user.full_name?.charAt(0).toUpperCase() ||
                user.email?.charAt(0).toUpperCase() ||
                "U"}
            </AvatarFallback>
          </Avatar>

          <h3 className="text-xl font-bold text-slate-800 text-center leading-tight mb-1">
            {user?.full_name || user?.email || "Team Member"}
          </h3>

          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-[11px] font-bold px-3 py-1 rounded-full border ${getRoleBadgeColor(
                role,
              )} flex items-center gap-1.5`}>
              {role === "admin" && <Shield className="w-3 h-3" />}
              {role === "editor" && <UserIcon className="w-3 h-3" />}
              {roleDisplay}
            </span>
          </div>
        </div>

        <div className="px-5 pb-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Email Address
                  </p>
                  <p
                    className="text-sm text-slate-700 font-medium truncate"
                    title={user.email}>
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Joined Workspace
                  </p>
                  <p className="text-sm text-slate-700 font-medium">
                    {joinedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
