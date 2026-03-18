import React, { useState, useEffect } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Send, 
  Rss, 
  Activity, 
  BarChart3, 
  Users as UsersIcon,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Search,
  ArrowRight,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  LayoutTemplate
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { apiClient } from "../../../services/apiClient";
import DOMPurify from "dompurify";
import { AdminUserDirectory } from "./AdminUserDirectory";
import { AdminInboxView } from "./AdminInboxView";

type TabType = "users" | "send" | "broadcast" | "logs" | "analytics" | "inbox" | "templates";

export const AdminEmailCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("send");
  const [subSidebarOpen, setSubSidebarOpen] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Basic route sync for deep linking
    const path = window.location.pathname;
    if (path.includes("broadcast")) setActiveTab("broadcast");
    else if (path.includes("logs")) setActiveTab("logs");
    else if (path.includes("analytics")) setActiveTab("analytics");
    else if (path.includes("users")) setActiveTab("users");
    else setActiveTab("send");
  }, []);

  // Individual Email State
  const [recipient, setRecipient] = useState("");
  const [senderAlias, setSenderAlias] = useState("SUPPORT");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Broadcast State
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  const [targetCount, setTargetCount] = useState(0);
  const [confirmText, setConfirmText] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Logs & Analytics State
  const [logs, setLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const SENDER_ALIASES = [
    { value: "SUPPORT", label: "ColabWize Support (support@colabwize.com)" },
    { value: "HELP", label: "ColabWize Help (help@colabwize.com)" },
    { value: "BILLING", label: "ColabWize Billing (billing@colabwize.com)" },
    { value: "TEAM", label: "ColabWize Team (team@colabwize.com)" },
    { value: "INFO", label: "ColabWize Info (info@colabwize.com)" },
    { value: "MARKETING", label: "ColabWize Marketing (marketing@colabwize.com)" },
    { value: "PRESS", label: "ColabWize Press (press@colabwize.com)" },
    { value: "LEGAL", label: "ColabWize Legal (legal@colabwize.com)" },
    { value: "ENGINEERING", label: "ColabWize Engineering (engineering@colabwize.com)" },
  ];

  useEffect(() => {
    if (activeTab === "logs") fetchLogs();
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "broadcast") fetchUserCount();
  }, [activeTab]);

  const fetchUserCount = async () => {
    try {
      const { users } = await apiClient.get("/api/admin/users?limit=1000"); // Simple count fetch
      setTargetCount(users.length);
    } catch (err) {
      console.error("Failed to fetch user count:", err);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingData(true);
    try {
      const response = await apiClient.get(`/api/admin/email/logs`);
      setLogs(response.logs || []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch email logs", variant: "destructive" });
    } finally {
        setIsLoadingData(false);
    }
  };

  const fetchAnalytics = async () => {
    setIsLoadingData(true);
    try {
      const response = await apiClient.get("/api/admin/analytics");
      setAnalytics(response.data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch analytics", variant: "destructive" });
    } finally {
        setIsLoadingData(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await apiClient.post("/api/admin/email/send", {
        to: recipient,
        senderAlias,
        subject,
        message
      });
      toast({ title: "Success", description: `Email dispatched to ${recipient}` });
      setRecipient("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      toast({ title: "Failed", description: err.message || "Email dispatch failed", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
      e.preventDefault();
      if (confirmText !== "SEND") {
          toast({ title: "Verification Failed", description: "Type 'SEND' to confirm broadcast", variant: "destructive" });
          return;
      }
      setIsBroadcasting(true);
      try {
          // Fetch user IDs for broadcast (mocking all for now)
          const { users } = await apiClient.get("/api/admin/users?limit=2000");
          const userIds = users.map((u: any) => u.id);

          await apiClient.post("/api/admin/email/broadcast", {
              userIds,
              senderAlias,
              subject,
              message
          });
          toast({ title: "Broadcast Initialized", description: `Broadcasting to ${userIds.length} users in background.` });
          setConfirmText("");
      } catch (err: any) {
          toast({ title: "Broadcast Failed", description: err.message, variant: "destructive" });
      } finally {
          setIsBroadcasting(false);
      }
  };

  const subNavContent = (
    <div className="flex flex-col gap-2 px-4">
      <div className="px-2 mb-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 italic">Email Array</h2>
        <p className="text-xl font-black text-foreground tracking-tighter">Communications</p>
      </div>

      {[
        { id: "users", label: "Users Directory", icon: UsersIcon },
        { id: "send", label: "Direct Email", icon: Send },
        { id: "broadcast", label: "Mass Broadcast", icon: Rss },
        { id: "inbox", label: "Support Inbox", icon: Inbox },
        { id: "logs", label: "Audit Logs", icon: Activity },
        { id: "analytics", label: "Statistics", icon: BarChart3 },
        { id: "templates", label: "Email Templates", icon: LayoutTemplate },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as TabType)}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === tab.id 
            ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" 
            : "bg-card border border-border text-muted-foreground hover:text-sky-500 hover:border-sky-500/30 hover:bg-sky-500/5"
          }`}
        >
          <tab.icon size={16} className="shrink-0" />
          <span className="truncate whitespace-nowrap">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <AdminLayout subSidebar={subNavContent}>
      <div className="space-y-8 pb-20">
        {/* Header - Simple and Professional */}
        {activeTab !== "inbox" && (
          <div className="px-4 py-6 border-b border-border mb-6">
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {activeTab === "users" ? "User Directory" : 
               activeTab === "send" ? "Direct Email" :
               activeTab === "broadcast" ? "Mass Broadcast" :
               activeTab === "logs" ? "Email Audit Logs" :
               activeTab === "analytics" ? "Email Statistics" :
               activeTab === "templates" ? "Email Templates" : "Email Communications"}
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-1">
              Manage platform-wide email communications and user interactions.
            </p>
          </div>
        )}

        {/* Content Area */}
        <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full"
              >
                {activeTab === "users" && <AdminUserDirectory />}
                {activeTab === "inbox" && <AdminInboxView />}

                {activeTab === "templates" && (
                  <div className="p-12 bg-card border border-border rounded-[2.5rem] text-center space-y-6 shadow-xl">
                    <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-sky-500/10 border border-sky-500/20 mx-auto">
                      <LayoutTemplate size={40} className="text-sky-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-foreground tracking-tight">Email Templates</h2>
                      <p className="text-muted-foreground mt-2 text-sm font-medium max-w-md mx-auto">
                        Create and manage reusable email templates for common communications — welcome emails, announcements, billing notices, and more.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500/10 border border-sky-500/20 rounded-full">
                      <div className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                      <span className="text-[11px] font-black text-sky-500 uppercase tracking-widest">Coming Soon — Will be connected when ready</span>
                    </div>
                  </div>
                )}

                {(activeTab === "send" || activeTab === "broadcast") && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Matrix */}
                <div className="p-8 bg-card border border-border rounded-[2.5rem] space-y-8 shadow-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-foreground tracking-tight italic flex items-center gap-3">
                      {activeTab === "send" ? <Send size={20} className="text-sky-500" /> : <Rss size={20} className="text-sky-500" />}
                      {activeTab === "send" ? "Direct Transmission" : "Broadcast Array"}
                    </h3>
                    {activeTab === "broadcast" && (
                        <div className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full">
                            <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">
                                {targetCount} Target Recipients
                            </span>
                        </div>
                    )}
                  </div>

                  <form className="space-y-6" onSubmit={activeTab === "send" ? handleSendEmail : handleBroadcast}>
                    {activeTab === "send" ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Recipient Identity</label>
                        <div className="relative">
                          <input 
                            type="email" 
                            required
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="user@colabwize.com"
                            className="w-full h-14 bg-secondary border border-border rounded-2xl px-6 text-sm font-medium focus:border-sky-500 transition-all outline-none"
                          />
                          <Mail className="absolute right-6 top-4 text-muted-foreground/30" size={20} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Target Audience</label>
                        <select 
                          className="w-full h-14 bg-secondary border border-border rounded-2xl px-6 text-sm font-bold uppercase tracking-widest outline-none focus:border-sky-500 transition-all appearance-none cursor-pointer"
                          value={broadcastTarget}
                          onChange={(e) => setBroadcastTarget(e.target.value)}
                        >
                          <option value="all">All Pulse Nodes (All Users)</option>
                          <option value="paid">Active Subscriptions Only</option>
                          <option value="free">Standard Nodes (Free Plan)</option>
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Sender Alias</label>
                        <select 
                          className="w-full h-14 bg-secondary border border-border rounded-2xl px-6 text-sm font-bold outline-none focus:border-sky-500 transition-all cursor-pointer"
                          value={senderAlias}
                          onChange={(e) => setSenderAlias(e.target.value)}
                        >
                          {SENDER_ALIASES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Subject Header</label>
                        <input 
                          type="text" 
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Transmission Header..."
                          className="w-full h-14 bg-secondary border border-border rounded-2xl px-6 text-sm font-medium focus:border-sky-500 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Payload (HTML Enabled)</label>
                      <textarea 
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="<h1>System Alert</h1><p>Neural pathways synchronized...</p>"
                        className="w-full h-64 bg-secondary border border-border rounded-[2rem] p-6 text-sm font-mono focus:border-sky-500 transition-all outline-none resize-none"
                      />
                    </div>

                    {activeTab === "broadcast" && (
                        <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl space-y-4">
                            <div className="flex items-center gap-3 text-red-500">
                                <AlertTriangle size={20} />
                                <span className="text-xs font-black uppercase tracking-widest">Broadcast Safety Protocol</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium">
                                You are about to transmit to <span className="text-foreground font-bold">{targetCount}</span> nodes. 
                                Type <span className="text-red-500 font-bold underline">SEND</span> to authorize the uplink.
                            </p>
                            <input 
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                placeholder="Type SEND to confirm"
                                className="w-full h-12 bg-background border border-border rounded-xl px-4 text-xs font-black tracking-[0.3em] text-center focus:border-red-500/50 outline-none transition-all"
                            />
                        </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSending || isBroadcasting}
                      className={`w-full h-16 rounded-[1.5rem] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] transition-all ${
                          activeTab === "send" 
                          ? "bg-sky-500 text-white shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-95" 
                          : "bg-red-500 text-white shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
                      }`}
                    >
                      {(isSending || isBroadcasting) ? <Loader2 className="animate-spin" size={20} /> : (
                          <>
                            {activeTab === "send" ? "Initialize Transmission" : "Execute Global Broadcast"}
                            <ArrowRight size={16} />
                          </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Preview Matrix */}
                <div className="p-8 bg-card/40 border border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center group border-dashed relative overflow-hidden h-fit sticky top-8">
                   <div className="w-full text-left mb-6">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Neural Render Preview</p>
                   </div>
                   <div className="w-full bg-white rounded-[2rem] overflow-hidden shadow-2xl min-h-[500px] flex flex-col border border-border">
                        <div className="h-12 bg-secondary border-b border-border flex items-center px-6 gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                            <span className="ml-auto text-[10px] font-black text-muted-foreground uppercase">cw-mail-render-v1.0</span>
                        </div>
                        <div className="flex-1 p-10 prose prose-sky prose-sm max-w-none text-left overflow-auto">
                            <h2 className="text-xl font-black text-foreground mb-4">{subject || "Transmission Header..."}</h2>
                            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message || `<p class="italic text-slate-400">Waiting for payload input...</p>`) }} />
                        </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
                <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                    <div className="p-8 border-b border-border flex justify-between items-center">
                        <h3 className="text-xl font-black text-foreground italic flex items-center gap-3">
                            <Activity size={20} className="text-sky-500" />
                            Transmission Audit Logs
                        </h3>
                        <button onClick={fetchLogs} className="p-3 bg-secondary rounded-xl hover:text-sky-500 transition-colors">
                            <Loader2 size={16} className={isLoadingData ? "animate-spin" : ""} />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Timestamp</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recipient</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sender Alias</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subject</th>
                                    <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-t border-border hover:bg-secondary/30 transition-colors group">
                                        <td className="px-8 py-5 text-xs font-mono text-muted-foreground">
                                            {new Date(log.sent_at).toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-sm font-bold text-foreground">
                                            {log.recipient}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-black text-sky-500/80 uppercase px-2 py-1 bg-sky-500/5 rounded border border-sky-500/10">
                                                {log.sender}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm font-medium text-muted-foreground truncate max-w-xs">
                                            {log.subject}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${log.status === 'sent' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                <div className={`h-1.5 w-1.5 rounded-full ${log.status === 'sent' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {logs.length === 0 && !isLoadingData && (
                            <div className="p-20 text-center space-y-4">
                                <ShieldCheck size={48} className="mx-auto text-muted-foreground/20" />
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No transmissions recorded in matrix</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === "analytics" && analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="p-8 bg-card border border-border rounded-[2rem] space-y-4 shadow-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Transmissions</p>
                            <CheckCircle2 size={16} className="text-emerald-500" />
                        </div>
                        <h4 className="text-4xl font-black text-foreground tracking-tighter">
                            {analytics.emails.reduce((acc: any, curr: any) => acc + curr._count, 0)}
                        </h4>
                    </div>
                    <div className="p-8 bg-card border border-border rounded-[2rem] space-y-4 shadow-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Successful Link</p>
                            <Activity size={16} className="text-sky-500" />
                        </div>
                        <h4 className="text-4xl font-black text-foreground tracking-tighter text-sky-500">
                            {analytics.emails.find((e: any) => e.status === 'sent')?._count || 0}
                        </h4>
                    </div>
                    <div className="p-8 bg-card border border-border rounded-[2rem] space-y-4 shadow-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Node Growth (30D)</p>
                            <TrendingUpIcon size={16} className="text-emerald-500" />
                        </div>
                        <h4 className="text-4xl font-black text-foreground tracking-tighter">
                            +{analytics.growth.last30Days}
                        </h4>
                        <p className="text-[9px] font-bold text-emerald-500">Global Coverage Optimized</p>
                    </div>
                    <div className="p-8 bg-card border border-border rounded-[2rem] space-y-4 shadow-lg">
                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Paid Nodes</p>
                            <ShieldCheck size={16} className="text-sky-500" />
                        </div>
                        <h4 className="text-4xl font-black text-foreground tracking-tighter">
                            {analytics.distribution.paid}
                        </h4>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase">/{analytics.growth.total} Total Active Nodes</p>
                    </div>
                </div>
            )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
    </AdminLayout>
  );
};

// Simple icon duplicate for analytics page
const TrendingUpIcon = ({ size, className }: { size: number, className: string }) => (
    <svg 
        width={size} height={size} viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
        className={className}
    >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

export default AdminEmailCenter;
