import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, Search, Filter, Shield, Calendar,
  ChevronDown, Loader2, X, CreditCard, UserCheck, UserX, Mail
} from "lucide-react";
import { apiClient } from "../../../services/apiClient";
import { useToast } from "../../../hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Subscription {
  plan: string;
  status: string;
}

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  subscription: Subscription | Subscription[];
}

// Mask email: show first 3 chars then *** then @domain
const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
};

interface AdminUserDirectoryProps {
  onEmailUser?: (email: string, full_name?: string) => void;
}

export const AdminUserDirectory: React.FC<AdminUserDirectoryProps> = ({ onEmailUser }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [planFilter, setPlanFilter] = useState<"all" | "paid" | "free">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (planFilter !== "all") params.set("plan", planFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      params.set("limit", "200");

      const response = await apiClient.get(`/api/admin/users?${params.toString()}`);
      setUsers(response.users || []);
      setTotal(response.total || 0);
    } catch (error) {
      toast({
        title: "Failed to Load Users",
        description: "Could not fetch user data from the database.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, planFilter, dateFrom, dateTo]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchUsers(); }, 400);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const clearFilters = () => {
    setPlanFilter("all");
    setDateFrom("");
    setDateTo("");
    setSearchTerm("");
  };

  const activeFilterCount = [
    planFilter !== "all",
    !!dateFrom,
    !!dateTo,
  ].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full h-11 pl-10 pr-4 bg-card border border-border rounded-xl text-sm font-medium focus:border-sky-500 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 h-11 rounded-xl text-[11px] font-bold uppercase tracking-widest border transition-all ${
            showFilters || activeFilterCount > 0
              ? "bg-sky-500 text-white border-sky-500 shadow-sm"
              : "bg-white border-slate-200 text-slate-500 hover:text-slate-900"
          }`}
        >
          <Filter size={14} />
          Filters {activeFilterCount > 0 && <span className="bg-white/20 text-white rounded-full px-1.5 text-[10px]">{activeFilterCount}</span>}
          <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-4 h-11 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-slate-200 bg-white text-slate-500 hover:text-red-500 hover:border-red-100 transition-all">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-4 p-5 bg-card border border-border rounded-2xl">
              {/* Plan Filter */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subscription Plan</p>
                <div className="flex gap-2">
                  {(["all", "paid", "free"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlanFilter(p)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                        planFilter === p
                          ? "bg-sky-500 text-white border-sky-500"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {p === "all" ? "All" : p === "paid" ? "Paid" : "Free"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> Date Joined From</p>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-9 px-3 bg-secondary border border-border rounded-xl text-sm outline-none focus:border-sky-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> To</p>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-9 px-3 bg-secondary border border-border rounded-xl text-sm outline-none focus:border-sky-500 transition-all"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="admin-table-container">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{users.length}</span> of <span className="text-slate-900">{total}</span> users
          </p>
          {isLoading && <Loader2 size={14} className="animate-spin text-sky-500" />}
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Date Joined</th>
                <th>Subscription</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-secondary rounded-lg w-3/4" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users size={32} className="text-muted-foreground/30" />
                      <p className="text-sm font-bold text-muted-foreground">No users match the current filters</p>
                    </div>
                  </td>
                </tr>
              ) : users.map((user) => {
                const sub = Array.isArray(user.subscription) ? user.subscription[0] : user.subscription;
                const isPaid = sub?.status?.toLowerCase() === "active";

                return (
                  <tr key={user.id} className="group hover:bg-sky-500/5 transition-all duration-200">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sky-500 font-bold text-base shrink-0">
                          {user.full_name?.charAt(0)?.toUpperCase() || <Shield size={14} />}
                        </div>
                        <p className="font-semibold text-sm text-slate-800 group-hover:text-sky-600 transition-colors">
                          {user.full_name || "—"}
                        </p>
                      </div>
                    </td>

                    {/* Masked Email */}
                    <td className="px-6 py-4">
                      <p className="text-xs text-muted-foreground font-mono">{maskEmail(user.email)}</p>
                    </td>

                    {/* Date Joined */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>

                    {/* Subscription */}
                    <td className="px-6 py-4">
                      {isPaid ? (() => {
                        const rawPlan = sub?.plan || "Paid";
                        const lowerPlan = rawPlan.toLowerCase();
                        
                        if (lowerPlan.includes("free") || lowerPlan === "free") {
                          return (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                              <UserX size={11} strokeWidth={3} />
                              Free
                            </div>
                          );
                        }

                        let badgeColor = "bg-emerald-50 border-emerald-100 text-emerald-600";
                        let displayPlan = rawPlan.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                        
                        if (lowerPlan.includes("premium")) {
                          badgeColor = "bg-fuchsia-50 border-fuchsia-100 text-fuchsia-600";
                          displayPlan = "Premium";
                        } else if (lowerPlan.includes("plus")) {
                          badgeColor = "bg-sky-50 border-sky-100 text-sky-600";
                          displayPlan = "Plus";
                        } else if (lowerPlan.includes("pro")) {
                          badgeColor = "bg-violet-50 border-violet-100 text-violet-600";
                          displayPlan = "Pro";
                        }

                        return (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded-lg text-[10px] font-bold uppercase tracking-widest ${badgeColor}`}>
                            <UserCheck size={11} strokeWidth={3} />
                            {displayPlan}
                          </div>
                        );
                      })() : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                          <UserX size={11} strokeWidth={3} />
                          Free
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onEmailUser?.(user.email, user.full_name)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-slate-50 hover:bg-sky-500 hover:text-white text-slate-400 transition-all border border-slate-100"
                        title="Send Direct Email"
                      >
                        <Mail size={14} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
