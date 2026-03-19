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
  LayoutTemplate,
  Sparkles,
  X,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  MousePointer2,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { apiClient } from "../../../services/apiClient";
import DOMPurify from "dompurify";
import { AdminUserDirectory } from "./AdminUserDirectory";
import { AdminInboxView } from "./AdminInboxView";
import { EmailComposerEditor, EmailComposerEditorRef } from "./EmailComposerEditor";
import { useRef } from "react";

type TabType = "users" | "send" | "broadcast" | "logs" | "analytics" | "inbox" | "templates" | "unsubscribed" | "gallery";

const ASSET_IMAGES = [
  { title: "AI Neural Drafting", key: "ai-neural-drafting", desc: "Scientific AI visualization for promos", url: "/admin/gallery/ai-neural-drafting.png" },
  { title: "Research Network", key: "research-network", desc: "Global academic connectivity abstract", url: "/admin/gallery/research-network.png" },
  { title: "Academic Integrity Seal", key: "integrity-seal", desc: "Official verification seal for proofs", url: "/admin/gallery/integrity-seal.png" },
  { title: "Workspace Interface", key: "workspace-preview", desc: "Premium dashboard UI showcase", url: "/admin/gallery/workspace-preview.png" },
  { title: "Collaboration Abstract", key: "collaboration-abstract", desc: "Digital synergy and teamwork visual", url: "/admin/gallery/collaboration-abstract.png" }
];

const ALIAS_LINKS: Record<string, { label: string, url: string }[]> = {
  SUPPORT: [
    { label: "Help Center", url: "https://colabwize.com/resources/help-center" },
    { label: "Contact Us", url: "https://colabwize.com/contact" },
    { label: "FAQ Center", url: "https://colabwize.com/company/faq" },
  ],
  BILLING: [
    { label: "Subscription Management", url: "https://colabwize.com/dashboard/settings/billing" },
    { label: "Invoice History", url: "https://colabwize.com/dashboard/settings/billing" },
    { label: "Pricing Tiers", url: "https://colabwize.com/pricing" },
  ],
  MARKETING: [
    { label: "Latest Blogs", url: "https://colabwize.com/resources/blogs" },
    { label: "Case Studies", url: "https://colabwize.com/resources/case-studies" },
    { label: "Product Roadmap", url: "https://colabwize.com/roadmap" },
  ],
  ENGINEERING: [
    { label: "Status Dashboard", url: "https://status.colabwize.com" },
    { label: "Documentation", url: "https://colabwize.com/resources/documentation" },
  ],
  SECURITY: [
    { label: "Legal Security", url: "https://colabwize.com/legal/security" },
    { label: "Privacy Policy", url: "https://colabwize.com/legal/privacy" },
    { label: "Compliance Center", url: "https://colabwize.com/legal/gdpr" },
  ],
  DEFAULT: [
    { label: "ColabWize Home", url: "https://colabwize.com" },
    { label: "Terms of Service", url: "https://colabwize.com/legal/terms" },
    { label: "Contact", url: "https://colabwize.com/contact" },
  ]
};

const ALIAS_COLORS: Record<string, string> = {
  SUPPORT: "#10b981",    // Emerald
  HELP: "#f59e0b",       // Amber
  BILLING: "#0ea5e9",    // Sky
  MARKETING: "#a855f7",  // Purple
  ENGINEERING: "#f97316", // Orange
  SECURITY: "#ef4444",   // Red
  DEFAULT: "#111827"     // Obsidian
};

  const extractNameFromEmail = (email: string) => {
    if (!email || !email.includes("@")) return "";
    const namePart = email.split("@")[0];
    return namePart
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

export const maskEmail = (email: string) => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 3) return `***@${domain}`;
  return `${local.substring(0, 3)}***@${domain}`;
};

export const AdminEmailCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("send");
  const [subSidebarOpen, setSubSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [unsubscribedUsers, setUnsubscribedUsers] = useState<any[]>([]);
  const [loadingUnsub, setLoadingUnsub] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("broadcast")) setActiveTab("broadcast");
    else if (path.includes("logs")) setActiveTab("logs");
    else if (path.includes("analytics")) setActiveTab("analytics");
    else if (path.includes("users")) setActiveTab("users");
    else setActiveTab("send");
  }, []);

  useEffect(() => {
    if (activeTab === "unsubscribed" && unsubscribedUsers.length === 0) {
      setLoadingUnsub(true);
      apiClient.get("/admin/email/unsubscribed")
        .then((r: any) => setUnsubscribedUsers(r.users || []))
        .catch(() => toast({ title: "Failed to load unsubscribed users", variant: "destructive" }))
        .finally(() => setLoadingUnsub(false));
    }
  }, [activeTab]);

  // Individual Email State
  const [recipient, setRecipient] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [senderAlias, setSenderAlias] = useState("SUPPORT");
  const [isSending, setIsSending] = useState(false);
  const [isTemplateLoaded, setIsTemplateLoaded] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAssetSidebar, setShowAssetSidebar] = useState(false);
  const [showLinkSidebar, setShowLinkSidebar] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderTitle, setSenderTitle] = useState("");
  
  const editorRef = useRef<EmailComposerEditorRef>(null);

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
    { value: "SECURITY", label: "ColabWize Security (security@colabwize.com)" },
  ];

  const SIGNATURE_PROFILES: Record<string, any> = {
    SUPPORT: { name: "ColabWize Support Team", title: "Customer Support", dept: "Support & Customer Experience", email: "support@colabwize.com" },
    HELP: { name: "ColabWize Help Desk", title: "Help & Assistance", dept: "Help & Resources", email: "help@colabwize.com" },
    BILLING: { name: "ColabWize Billing Department", title: "Billing & Subscriptions", dept: "Finance & Billing", email: "billing@colabwize.com" },
    TEAM: { name: "ColabWize Team", title: "Internal Communications", dept: "Operations & Team", email: "team@colabwize.com" },
    INFO: { name: "ColabWize Information", title: "Platform Communications", dept: "Communications", email: "info@colabwize.com" },
    MARKETING: { name: "ColabWize Marketing", title: "Marketing & Growth", dept: "Marketing", email: "marketing@colabwize.com" },
    PRESS: { name: "ColabWize Press Office", title: "Media & Public Relations", dept: "Press & Media", email: "press@colabwize.com" },
    LEGAL: { name: "ColabWize Legal Department", title: "Legal & Compliance", dept: "Legal & Compliance", email: "legal@colabwize.com" },
    ENGINEERING: { name: "ColabWize Engineering", title: "Platform Engineering", dept: "Engineering & Infrastructure", email: "engineering@colabwize.com" },
  };

  const renderFullPreview = () => {
    const profile = { ...(SIGNATURE_PROFILES[senderAlias] || SIGNATURE_PROFILES.SUPPORT) };
    if (senderName) profile.name = senderName;
    if (senderTitle) profile.title = senderTitle;
    
    const currentYear = new Date().getFullYear();
    const sanitizedBody = DOMPurify.sanitize(message || `<p class="italic text-slate-400">Waiting for message input...</p>`);

    return `
      <div style="font-family: Arial, sans-serif; color: #374151;">
        <!-- Banner Header -->
        <img src="https://colabwize.com/email_logo.png" alt="ColabWize" style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0 auto 32px auto; border-radius: 8px;">
        
        <!-- Body -->
        <div style="margin-bottom: 40px; padding: 0 20px;">
          ${sanitizedBody}
        </div>

        <!-- Signature -->
        <div style="border-top: 2px solid #e5e7eb; margin: 32px 20px 0 20px; padding-top: 16px;">
          <table style="border-collapse: collapse;">
            <tr>
              <td style="padding-left: 16px; border-left: 3px solid #0ea5e9; vertical-align: top;">
                <p style="margin: 0 0 2px 0; font-size: 16px; font-weight: bold; color: #111827;">${profile.name}</p>
                <p style="margin: 0 0 2px 0; font-size: 13px; color: #6b7280;">${profile.title}${profile.dept ? ` &bull; ${profile.dept}` : ""}</p>
                <p style="margin: 6px 0 0 0; font-size: 13px;">
                  <a href="mailto:${profile.email}" style="color: #0ea5e9; text-decoration: none;">${profile.email}</a>
                  &nbsp;&bull;&nbsp;
                  <a href="https://colabwize.com" style="color: #0ea5e9; text-decoration: none;">colabwize.com</a>
                </p>
              </td>
            </tr>
          </table>
          <p style="margin: 10px 0 0 0; font-size: 10px; color: #9ca3af;">
            This message was sent from the ColabWize secure administration platform. Please do not share its contents externally.
          </p>
        </div>

        <!-- Premium Footer -->
        <div style="margin-top: 64px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #64748b; line-height: 1.6; padding: 40px 20px; border-top: 1px solid #f1f5f9;">
          <!-- Footer Branding -->
          <div style="display: table; margin: 0 auto 24px auto; text-align: left;">
            <div style="display: table-cell; vertical-align: middle; padding-right: 20px;">
              <img src="https://colabwize.com/images/Colabwize-logo.png" alt="ColabWize" style="height: 52px; width: auto; display: block;">
            </div>
            <div style="display: table-cell; vertical-align: middle; border-left: 1px solid #e5e7eb; padding-left: 20px;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">ColabWize</h1>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500;">A Platform for Original, Credible, and Human Work.</p>
            </div>
          </div>

          <div style="margin-bottom: 32px; font-size: 14px; max-width: 500px; margin-left: auto; margin-right: auto;">
            <p style="margin: 0 0 12px 0;">If you have any questions, feedback, ideas or problems don't hesitate to <a href="https://colabwize.com/contact" style="color: #0ea5e9; text-decoration: underline;">contact us!</a></p>
            <p style="margin: 0;">You can <a href="https://colabwize.com/dashboard/settings" style="color: #0ea5e9; text-decoration: underline;">manage</a> which email notifications you receive or <a href="#" style="color: #0ea5e9; text-decoration: underline;">unsubscribe</a> from our communications.</p>
          </div>

          <div style="margin-bottom: 24px; font-size: 13px; font-weight: 500;">
            Checkout: <a href="https://colabwize.com/resources/updates" style="color: #0ea5e9; text-decoration: none;">Updates</a>, 
            <a href="https://colabwize.com/resources/newsletter" style="color: #0ea5e9; text-decoration: none;">Newsletter</a> or 
            <a href="https://colabwize.com/contact" style="color: #0ea5e9; text-decoration: none;">Support</a>
          </div>

          <div style="margin-bottom: 32px;">
            <a href="https://x.com/colabwize" style="color: #111827; text-decoration: none; font-weight: bold; font-size: 14px;">Follow us on X</a>
          </div>

          <p style="font-size: 11px; color: #9ca3af; margin: 0;">
            © ${currentYear} ColabWize. All rights reserved.
          </p>
        </div>
      </div>
    `;
  };

  useEffect(() => {
    if (activeTab === "logs") fetchLogs();
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "broadcast" || activeTab === "users") fetchAllUsers();
  }, [activeTab]);

  const fetchAllUsers = async () => {
    try {
      const { users } = await apiClient.get("/api/admin/users?limit=2000");
      setAllUsers(users || []);
      setTargetCount(users.length);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // Sync recipientName when recipient email changes manually
  useEffect(() => {
    if (!recipient) {
      setRecipientName("");
      return;
    }
    const foundUser = allUsers.find(u => u.email.toLowerCase() === recipient.toLowerCase());
    if (foundUser) {
      setRecipientName(foundUser.full_name);
    } else {
      // If not in pre-loaded list, we can keep the current name or clear if it looks like a typing change
      // But we'll leave it for now to avoid flickering if typed correctly
    }
  }, [recipient, allUsers]);

  useEffect(() => {
    const profile = SIGNATURE_PROFILES[senderAlias] || SIGNATURE_PROFILES.SUPPORT;
    setSenderName(profile.name);
    setSenderTitle(profile.title);
  }, [senderAlias]);

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
        message,
        senderName,
        senderTitle
      });
      toast({ title: "Success", description: `Email dispatched to ${recipient}` });
      setRecipient("");
      setSubject("");
      setMessage("");
      setIsTemplateLoaded(false);
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
              message,
              senderName,
              senderTitle
          });
          toast({ title: "Broadcast Initialized", description: `Broadcasting to ${userIds.length} users in background.` });
          setConfirmText("");
          setIsTemplateLoaded(false);
      } catch (err: any) {
          toast({ title: "Broadcast Failed", description: err.message, variant: "destructive" });
      } finally {
          setIsBroadcasting(false);
      }
  };

  const handleGenerateWithAI = async (overridePrompt?: string) => {
    const finalPrompt = overridePrompt || aiPrompt;
    if (!finalPrompt.trim()) return;
    setIsGeneratingAI(true);
    try {
      // Pass the current message context if there is any, so the AI can correct/modify
      const resp = await apiClient.post("/api/admin/email/generate", { 
        prompt: finalPrompt,
        currentMessage: message
      });
      if (resp.html) {
        setMessage(resp.html);
        toast({ title: "Draft Generated", description: "The AI has finished composing your draft." });
        setShowAIModal(false);
        setAiPrompt("");
      }
    } catch (err: any) {
      toast({ title: "AI Failed", description: err.message || "Failed to generate email.", variant: "destructive" });
    } finally {
      setIsGeneratingAI(false);
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
        { id: "send", label: "Compose Email", icon: Send },
        { id: "broadcast", label: "Mass Broadcast", icon: Rss },
        { id: "inbox", label: "Support Inbox", icon: Inbox },
        { id: "logs", label: "Audit Logs", icon: Activity },
        { id: "analytics", label: "Statistics", icon: BarChart3 },
        { id: "templates", label: "Email Templates", icon: LayoutTemplate },
        { id: "gallery", label: "Asset Gallery", icon: ImageIcon },
        { id: "unsubscribed", label: "Unsubscribed", icon: X },
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
        {/* Header removed by user request to reduce redundant titles */}

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
                {activeTab === "users" && (
                  <AdminUserDirectory 
                    onEmailUser={(email, name) => { 
                      setRecipient(email); 
                      setRecipientName(name || "");
                      setActiveTab("send"); 
                    }} 
                  />
                )}
                {activeTab === "inbox" && <AdminInboxView />}

                {activeTab === "gallery" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="p-10 bg-card border border-border rounded-[2.5rem] shadow-2xl text-left relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ImageIcon size={120} />
                      </div>
                      
                      <div className="relative z-10">
                        <h2 className="text-3xl font-black text-foreground tracking-tighter mb-2">Corporate Asset Gallery</h2>
                        <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] mb-8">Official Branded Imagery for Communications</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {ASSET_IMAGES.map((item) => {
                            const fullUrl = `https://colabwize.com${item.url}`;
                            return (
                              <div key={item.key} className="group/card bg-secondary/30 border border-border rounded-3xl overflow-hidden hover:border-sky-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-sky-500/10">
                                <div className="aspect-video relative overflow-hidden bg-muted">
                                  <img 
                                    src={item.url} 
                                    alt={item.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-3">
                                    <button 
                                      onClick={() => {
                                        navigator.clipboard.writeText(fullUrl);
                                        toast({ title: "URL Copied", description: "Image link copied to clipboard" });
                                      }}
                                      className="h-10 w-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                      title="Copy URL"
                                    >
                                      <Copy size={18} />
                                    </button>
                                    <a 
                                      href={item.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="h-10 w-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all hover:scale-110"
                                      title="View Fullsize"
                                    >
                                      <ExternalLink size={18} />
                                    </a>
                                  </div>
                                </div>
                                <div className="p-5">
                                  <h4 className="font-black text-sm text-foreground tracking-tight">{item.title}</h4>
                                  <p className="text-[10px] text-muted-foreground mt-1 font-medium leading-relaxed">{item.desc}</p>
                                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                                    <code className="text-[9px] bg-background px-2 py-1 rounded-lg text-muted-foreground truncate max-w-[140px]">.../${item.key}.png</code>
                                    <button 
                                      onClick={() => {
                                        setMessage(prev => prev + `<br><img src="${item.url}" alt="${item.title}" style="max-width: 100%; border-radius: 16px; margin: 20px 0;">`);
                                        setActiveTab("send");
                                        toast({ title: "Inserted", description: "Image added to composer" });
                                      }}
                                      className="text-[9px] font-black uppercase tracking-widest text-sky-500 hover:text-sky-400"
                                    >
                                      Insert &rarr;
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "templates" && (
                  <div className="space-y-6">
                    <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-xl text-left">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500">
                          <LayoutTemplate size={24} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-foreground tracking-tight">Platform Templates</h2>
                          <p className="text-sm font-medium text-muted-foreground mt-1">
                            One-click professional templates curated for each alias. Loads instantly into Compose or Broadcast.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-12 pb-12">
                      {Object.entries({
                        "Support & Resources": [
                          {
                            alias: "SUPPORT",
                            name: "Resolution Confirmation",
                            icon: <ShieldCheck size={20} className="text-emerald-500" />,
                            subject: "Resolved: Your ColabWize Support Request",
                            message: `<h2>Issue Resolved Successfully</h2><p>Hello,</p><p>We are pleased to inform you that your recent support inquiry has been fully addressed and resolved by our technical team.</p><p><strong>Resolution Details:</strong> The reported behavior was investigated and a localized patch has been deployed to your workspace environment. All systems are now performing within optimal parameters.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/contact" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Contact Support Team</a>
                            </div>`
                          },
                          {
                            alias: "HELP",
                            name: "New User Onboarding Guide",
                            icon: <span className="font-bold text-amber-500 text-lg">?</span>,
                            subject: "Getting Started with ColabWize: A Quick Guide",
                            message: `<h2>Welcome to the Platform</h2><p>We're thrilled to have you onboard! To help you get the most out of ColabWize, we've compiled a few essential resources for your first 48 hours:</p><ul><li><strong>Quick Start Video:</strong> A 3-minute overview of the dashboard.</li><li><strong>Knowledge Base:</strong> Searchable documentation for every feature.</li><li><strong>Community Forum:</strong> Connect with other researchers and power users.</li></ul>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/resources/help-center" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Start Onboarding Now</a>
                            </div>`
                          }
                        ],
                        "Billing & Subscription": [
                          {
                            alias: "BILLING",
                            name: "Plan Upgrade Confirmation",
                            icon: <Activity size={20} className="text-sky-500" />,
                            subject: "Confirmation: Your ColabWize Plan Upgrade",
                            message: `<h2>Upgrade Successful</h2><p>Hello,</p><p>This email confirms that your ColabWize account has been successfully upgraded to the <strong>Premium Tier</strong>.</p><p><strong>New Features Unlocked:</strong></p><ul><li>Unlimited AI Neural Drafting</li><li>Advanced Citation Matrix Exports</li><li>Priority Engineering Support</li></ul><p>Your new billing cycle begins today. You can manage your subscription and download invoices at any time from your billing dashboard.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/dashboard/settings/billing" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">View Billing Information</a>
                            </div>`
                          },
                          {
                            alias: "BILLING",
                            name: "Payment Overdue Notice",
                            icon: <AlertTriangle size={20} className="text-red-500" />,
                            subject: "URGENT: Payment Overdue for ColabWize Subscription",
                            message: `<h2>Action Required: Payment Overdue</h2><p>Hello,</p><p>We were unable to process your most recent subscription payment. To avoid any interruption to your research workspace and AI access, please update your payment information immediately.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/dashboard/settings/billing" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Update Payment Method</a>
                            </div>`
                          }
                        ],
                        "Newsletters & Broadcasts": [
                          {
                            alias: "MARKETING",
                            name: "Weekly Innovation Breakfast",
                            icon: <Sparkles size={20} className="text-purple-500" />,
                             subject: "Sunday Breakfast: The Future of Originality",
                            message: `
                            <p>Hey {{name}}!</p>
                            <p>Before we begin... a big thank you to this week's sponsor:</p>
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 20px; margin: 20px 0;">
                              <p style="margin-top: 0;"><strong>Vanta</strong> automates security and compliance so you can keep scaling instead of drowning in paperwork. Runs continuous checks in the background and keeps all your evidence audit-ready.</p>
                              <div style="margin: 20px 0; text-align: center;">
                                <a href="https://vanta.com" style="background-color: #111827; color: white; padding: 10px 20px; text-decoration: none; border-radius: 10px; font-weight: bold;">Get $1,000 Off Vanta</a>
                              </div>
                            </div>
                            
                            <h2>Welcome to Sunday Breakfast!!</h2>

                            <h3 style="color: #f97316;">The Orange Juice</h3>
                            <p><strong>Originality in the AI Age.</strong></p>
                            <p>How do we maintain academic integrity when AI is everywhere? We explore new frameworks for defensible writing and the role of human-first collaboration in the research process.</p>
                            <div style="margin: 20px 0; text-align: center;">
                              <a href="https://colabwize.com/resources/blogs/future-of-integrity" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold;">Read Insight &rarr;</a>
                            </div>

                            <h3 style="color: #0ea5e9;">The Coffee</h3>
                            <p><strong>Building a Defensible Portfolio.</strong></p>
                            <p>Step-by-step guide on how to use ColabWize's neural drafting history to provide undeniable proof of your creative process to institutions and publishers.</p>
                            <div style="margin: 20px 0; text-align: center;">
                              <a href="https://colabwize.com/resources/guides/defensible-writing" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold;">View Guide &rarr;</a>
                            </div>

                            <p>That's it! I hope you have the BEST long weekend!</p>
                            <p><strong>The ColabWize Team</strong></p>`
                          }
                        ],
                        "Customer Success": [
                          {
                            alias: "TEAM",
                            name: "Onboarding Check-in",
                            icon: <CheckCircle2 size={20} className="text-sky-500" />,
                            subject: "How is your ColabWize experience so far?",
                            message: `<p>Hello,</p><p>It's been 48 hours since you joined, and we wanted to check in. Our goal is to make your research as seamless as possible.</p><p>Are you finding everything you need? If you're stuck on anything—from AI drafting to citation exports—our success team is here to help.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/dashboard" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Return to Dashboard</a>
                            </div>`
                          },
                          {
                            alias: "TEAM",
                            name: "Inactivity Check-in",
                            icon: <Clock size={20} className="text-amber-500" />,
                            subject: "We haven't seen you in a while!",
                            message: `<p>Hello,</p><p>We noticed you haven't logged into ColabWize in a few days. We've recently added some powerful new AI features that we think you'll love.</p><p>Is there anything we can help you with to get back on track?</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/dashboard" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Return to Workspace</a>
                            </div>`
                          },
                          {
                            alias: "TEAM",
                            name: "Milestone Celebration",
                            subject: "Congrats! You reached a new milestone",
                            message: `<h2>You're Crushing It!</h2><p>Hello,</p><p>Congratulations! You just completed your 10th research draft. That's a huge step toward completing your project.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/dashboard" style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Keep Going &rarr;</a>
                            </div>`
                          }
                        ],
                        "Legal & Policy": [
                          {
                            alias: "LEGAL",
                            name: "Annual Terms Update",
                            icon: <ShieldCheck size={20} className="text-slate-500" />,
                            subject: "Legal Notice: Updates to ColabWize Terms of Service",
                            message: `<h2>Policy Update Notice</h2><p>Hello,</p><p>In accordance with new international data protections, we have updated our Global Terms of Service and Privacy Policy.</p><p>By continuing to use ColabWize after April 1st, you agree to these updated terms.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/legal/terms" style="background-color: #475569; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Accept Terms</a>
                            </div>`
                          }
                        ],
                      }).map(([category, items]) => (
                        <div key={category} className="space-y-6">
                          <div className="flex items-center gap-4">
                            <h3 className="text-xl font-black text-foreground tracking-tight">{category}</h3>
                            <div className="h-px flex-1 bg-border/50"></div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((tpl) => (
                              <div key={tpl.name} className="bg-card border border-border flex flex-col rounded-[2rem] p-6 shadow-lg hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                  <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-secondary rounded-lg text-muted-foreground group-hover:text-sky-500 transition-colors">
                                    Alias: {tpl.alias}
                                  </span>
                                  {tpl.icon}
                                </div>
                                <h3 className="text-lg font-black text-foreground mb-1">{tpl.name}</h3>
                                <p className="text-xs text-muted-foreground font-medium mb-6 line-clamp-2 italic">
                                  "{tpl.subject}"
                                </p>
                                <div className="mt-auto grid grid-cols-2 gap-3">
                                    <button 
                                      onClick={() => {
                                        let nameToUse = recipientName || extractNameFromEmail(recipient);
                                        let personalizedMsg = tpl.message;
                                        
                                        if (nameToUse) {
                                          personalizedMsg = personalizedMsg
                                            .replace(/Hello,/g, `Hello ${nameToUse},`)
                                            .replace(/Hey!/g, `Hey ${nameToUse}!`)
                                            .replace(/Hello\s+([A-Z])/g, `Hello ${nameToUse}, $1`)
                                            .replace(/Hey,/g, `Hey ${nameToUse},`);
                                        }

                                        setSenderAlias(tpl.alias);
                                        setSubject(tpl.subject);
                                        setMessage(personalizedMsg);
                                        setIsTemplateLoaded(true);
                                        setActiveTab("send");
                                        toast({ title: "Template Personalized", description: `Addressed to ${nameToUse || 'User'}.` });
                                      }}
                                      className="px-3 py-2.5 bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-sky-500 hover:text-white transition-all text-center"
                                    >
                                      Target Send
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setSenderAlias(tpl.alias);
                                        setSubject(tpl.subject);
                                        setMessage(tpl.message);
                                        setIsTemplateLoaded(true);
                                        setActiveTab("broadcast");
                                        toast({ title: "Template Loaded", description: "Ready for mass broadcast." });
                                      }}
                                      className="px-3 py-2.5 bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-500 hover:text-white transition-all text-center"
                                    >
                                      Broadcast
                                    </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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
                      {activeTab === "send" ? "Compose Email" : "Mass Broadcast"}
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
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Recipient (To)</label>
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
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Sender Identity</label>
                          {isTemplateLoaded && (
                             <button type="button" onClick={() => setIsTemplateLoaded(false)} className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:underline">
                               Unlock Alias
                             </button>
                          )}
                        </div>
                        <select  
                          disabled={isTemplateLoaded}
                          className="w-full h-14 bg-secondary border border-border rounded-2xl px-6 text-sm font-bold outline-none focus:border-sky-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                          value={senderAlias}
                          onChange={(e) => setSenderAlias(e.target.value)}
                        >
                          {SENDER_ALIASES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Transmission Header (Subject)</label>
                        <input 
                          type="text" 
                          required
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="Enter Subject..."
                          className="w-full h-14 bg-secondary border border-border rounded-2xl px-6 text-sm font-medium focus:border-sky-500 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Professional Sender Name</label>
                        <input 
                          type="text" 
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="Your Full Name..."
                          className="w-full h-14 bg-secondary border border-border rounded-2xl px-6 text-sm font-medium focus:border-sky-500 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Professional Sender Title</label>
                        <input 
                          type="text" 
                          value={senderTitle}
                          onChange={(e) => setSenderTitle(e.target.value)}
                          placeholder="Your Official Title..."
                          className="w-full h-14 bg-secondary border border-border rounded-2xl px-6 text-sm font-medium focus:border-sky-500 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-end mb-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 block">Message Content</label>
                      </div>
                      <EmailComposerEditor 
                        ref={editorRef}
                        value={message} 
                        onChange={setMessage} 
                        onImageClick={() => {
                          setShowAssetSidebar(true);
                          setShowLinkSidebar(false);
                        }}
                        onLinkClick={() => {
                          setShowLinkSidebar(true);
                          setShowAssetSidebar(false);
                        }}
                      />
                      <input type="text" name="message-required-hack" required className="opacity-0 w-0 h-0 pointer-events-none absolute" value={message} onChange={() => {}} tabIndex={-1} />
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
                            {activeTab === "send" ? "Dispatch Email" : "Execute Broadcast"}
                            <ArrowRight size={16} />
                          </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Column: Preview Matrix with AI Dropdown */}
                <div className="p-8 bg-card border border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center group shadow-xl relative h-fit sticky top-8">
                   <div className="w-full flex justify-between items-center mb-6 relative">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">HTML Render Preview</p>
                      
                      {/* AI Toggle Button */}
                      <button 
                         type="button"
                         onClick={() => setShowAIModal(!showAIModal)}
                         className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${
                            showAIModal 
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
                            : 'bg-sky-500/10 text-sky-500 hover:bg-sky-500/20'
                         }`}
                      >
                         {showAIModal ? <X size={14} /> : <Sparkles size={14} />}
                         {showAIModal ? 'Close AI' : 'AI Assistant'}
                      </button>

                      {/* AI Dropdown Panel */}
                      <AnimatePresence>
                         {showAIModal && (
                            <motion.div 
                               initial={{ opacity: 0, y: 10, scale: 0.95 }}
                               animate={{ opacity: 1, y: 0, scale: 1 }}
                               exit={{ opacity: 0, y: 10, scale: 0.95 }}
                               className="absolute top-14 right-0 w-[420px] max-w-[85vw] bg-card border border-border shadow-2xl rounded-[2rem] overflow-hidden z-50 flex flex-col"
                            >
                               <div className="p-6 bg-secondary border-b border-border flex items-center gap-3 text-left">
                                 <div className="h-10 w-10 bg-sky-500/10 rounded-xl flex items-center justify-center text-sky-500 shrink-0">
                                   <Sparkles size={20} />
                                 </div>
                                 <div>
                                   <h2 className="text-sm font-black text-foreground">AI Email Assistant</h2>
                                   <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">Automated Neural Drafting</p>
                                 </div>
                               </div>
                               
                               <div className="p-6 space-y-6 text-left max-h-[60vh] overflow-y-auto custom-scrollbar">
                                 {message.trim() && (
                                   <div className="space-y-4">
                                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quick Corrections</p>
                                     <div className="grid grid-cols-2 gap-2">
                                       <button onClick={() => handleGenerateWithAI("Fix all grammar and spelling errors, keep tone exactly the same.")} disabled={isGeneratingAI} className="h-10 rounded-xl bg-background hover:bg-sky-500/5 hover:text-sky-500 text-[10px] font-bold uppercase tracking-wider transition-colors border border-border hover:border-sky-500/30 disabled:opacity-50 text-left px-3">Fix Grammar</button>
                                       <button onClick={() => handleGenerateWithAI("Refine this draft to be extremely professional, strong, and highly corporate.")} disabled={isGeneratingAI} className="h-10 rounded-xl bg-background hover:bg-sky-500/5 hover:text-sky-500 text-[10px] font-bold uppercase tracking-wider transition-colors border border-border hover:border-sky-500/30 disabled:opacity-50 text-left px-3">Professional Tone</button>
                                       <button onClick={() => handleGenerateWithAI("Soften the tone of this draft, make it very polite, friendly, and understanding.")} disabled={isGeneratingAI} className="h-10 rounded-xl bg-background hover:bg-sky-500/5 hover:text-sky-500 text-[10px] font-bold uppercase tracking-wider transition-colors border border-border hover:border-sky-500/30 disabled:opacity-50 text-left px-3">Soften Tone</button>
                                       <button onClick={() => handleGenerateWithAI("Make this message extremely concise and short, getting straight to the point.")} disabled={isGeneratingAI} className="h-10 rounded-xl bg-background hover:bg-sky-500/5 hover:text-sky-500 text-[10px] font-bold uppercase tracking-wider transition-colors border border-border hover:border-sky-500/30 disabled:opacity-50 text-left px-3">Streamline</button>
                                     </div>
                                   </div>
                                 )}

                                 <div className="space-y-4">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                     {message.trim() ? "Custom Instructions:" : "Describe what you want to write:"}
                                   </p>
                                   <textarea 
                                     value={aiPrompt}
                                     onChange={(e) => setAiPrompt(e.target.value)}
                                     placeholder={message.trim() ? "e.g. 'Add a paragraph explaining...'" : "e.g. 'Write a welcome email...'"}
                                     className="w-full h-32 bg-background border border-border rounded-2xl p-4 text-sm font-medium focus:border-sky-500 transition-colors shadow-inner outline-none resize-none placeholder-muted-foreground/50"
                                   />
                                 </div>

                                 <button 
                                   onClick={() => handleGenerateWithAI()}
                                   disabled={isGeneratingAI || !aiPrompt.trim()}
                                   className="w-full h-12 shrink-0 flex items-center justify-center gap-2 bg-sky-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-sky-600 disabled:opacity-50 disabled:grayscale transition-all shadow-xl shadow-sky-500/20"
                                 >
                                   {isGeneratingAI ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><Sparkles size={16} /> Generate Mail Payload</>}
                                 </button>
                               </div>
                            </motion.div>
                         )}
                      </AnimatePresence>
                   </div>
                   
                   <div className="w-full bg-white rounded-[2rem] overflow-hidden shadow-sm min-h-[500px] flex flex-col border border-border relative z-0">
                        <div className="h-10 bg-secondary border-b border-border flex items-center px-6 gap-2 shrink-0">
                            <div className="h-2 w-2 rounded-full bg-red-400" />
                            <div className="h-2 w-2 rounded-full bg-amber-400" />
                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        </div>
                        <div className="flex-1 p-10 prose prose-sky prose-sm max-w-none text-left overflow-auto bg-[#fafafa]">
                            <div className="max-w-[600px] mx-auto bg-white p-12 rounded-xl shadow-sm border border-border">
                              <h2 className="text-xl font-black text-foreground mb-4 border-b pb-4">{subject || "Transmission Header..."}</h2>
                              <div dangerouslySetInnerHTML={{ __html: renderFullPreview() }} />
                            </div>
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
                                            {maskEmail(log.recipient)}
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

            {/* Unsubscribed Users Panel */}
            {activeTab === "unsubscribed" && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tighter">Unsubscribed Users</h2>
                  <p className="text-sm text-muted-foreground mt-1">Users who have opted out of broadcast and marketing emails. They will not receive mass communications.</p>
                </div>

                <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex gap-4 items-start">
                  <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={18} />
                  <div>
                    <p className="text-sm font-bold text-amber-600">Compliance Notice</p>
                    <p className="text-xs text-muted-foreground mt-1">These users have explicitly opted out. Sending them marketing broadcasts would violate GDPR and CAN-SPAM regulations. The broadcast system automatically excludes them.</p>
                  </div>
                </div>

                {loadingUnsub ? (
                  <div className="flex justify-center py-16"><Loader2 className="animate-spin text-sky-500" size={32} /></div>
                ) : unsubscribedUsers.length === 0 ? (
                  <div className="text-center py-16 bg-card border border-border rounded-2xl">
                    <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={40} />
                    <p className="text-lg font-bold text-foreground">No unsubscribed users</p>
                    <p className="text-sm text-muted-foreground mt-1">All registered users are currently subscribed to platform communications.</p>
                  </div>
                ) : (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                      <p className="text-sm font-bold text-foreground">{unsubscribedUsers.length} user{unsubscribedUsers.length !== 1 ? "s" : ""} opted out</p>
                    </div>
                    <div className="divide-y divide-border">
                      {unsubscribedUsers.map((u) => (
                        <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                              <X size={14} className="text-red-500" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{u.full_name || "Unnamed User"}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-600 uppercase tracking-widest">Unsubscribed</span>
                            <p className="text-[10px] text-muted-foreground mt-1">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Asset Gallery Sidebar */}
        <AnimatePresence>
          {showAssetSidebar && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAssetSidebar(false)}
                className="fixed inset-0 z-[60] bg-black/5"
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 w-[420px] h-full bg-white border-l border-border shadow-xl z-[70] flex flex-col"
              >
                <div className="p-8 border-b border-border flex justify-between items-center bg-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ImageIcon size={64} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Stock Assets</h3>
                    <p className="text-[10px] text-muted-foreground font-medbold uppercase tracking-wider mt-1">Official Media Library</p>
                  </div>
                  <button 
                    onClick={() => setShowAssetSidebar(false)}
                    className="p-2 hover:bg-secondary rounded-xl transition-colors relative z-10"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-left bg-secondary/10">
                  <div className="grid grid-cols-2 gap-3">
                    {ASSET_IMAGES.map((img) => (
                      <button 
                        key={img.key}
                        onClick={() => {
                          editorRef.current?.insertImage(img.url);
                          setShowAssetSidebar(false);
                          toast({ title: "Node Inserted", description: `Added ${img.title} to transmission.` });
                        }}
                        className="group relative aspect-square bg-card rounded-2xl overflow-hidden border border-border hover:border-sky-500 transition-all text-left shadow-sm hover:shadow-sky-500/10"
                      >
                        <img 
                          src={img.url} 
                          alt={img.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                          <p className="text-[8px] font-black text-white uppercase tracking-wider mb-0.5 line-clamp-1">{img.title}</p>
                          <p className="text-[7px] text-sky-400 font-bold uppercase tracking-widest">Insert &rarr;</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-secondary/10 border-t border-border mt-auto text-center">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] italic mb-0 opacity-50">
                    ColabWize Global Asset Matrix
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Link Sidebar (Left Side) */}
        <AnimatePresence>
          {showLinkSidebar && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLinkSidebar(false)}
                className="fixed inset-0 z-[60] bg-black/5"
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 w-[380px] h-full bg-white border-l border-border shadow-2xl z-[70] flex flex-col"
              >
                <div className="p-8 border-b border-border flex justify-between items-center bg-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 p-4 opacity-5">
                    <Copy size={64} />
                  </div>
                  <div className="relative z-10 text-left">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Quick Links</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">Matrix Resource Shortcuts</p>
                  </div>
                  <button 
                    onClick={() => setShowLinkSidebar(false)}
                    className="p-2 hover:bg-secondary rounded-xl transition-colors relative z-10"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-left">
                  {/* Alias Contextual Links */}
                  {(ALIAS_LINKS[senderAlias] || ALIAS_LINKS.DEFAULT).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">Contextual Resources ({senderAlias})</p>
                        <div className="h-[1px] flex-1 bg-sky-500/10 ml-4"></div>
                      </div>
                      <div className="space-y-3">
                        {(ALIAS_LINKS[senderAlias] || ALIAS_LINKS.DEFAULT).map((link) => (
                          <div key={link.url} className="group bg-background border border-border rounded-2xl overflow-hidden hover:border-sky-500 transition-all shadow-sm">
                            <div className="p-4 border-b border-border bg-secondary/5 flex items-center justify-between">
                              <span className="text-sm font-bold text-foreground">{link.label}</span>
                              <ExternalLink size={12} className="text-muted-foreground opacity-50" />
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-border">
                              <button 
                                onClick={() => {
                                  editorRef.current?.insertLink(link.label, link.url);
                                  setShowLinkSidebar(false);
                                  toast({ title: "Link Injected", description: `Added "${link.label}" text link.` });
                                }}
                                className="flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                              >
                                <LinkIcon size={12} /> Text Link
                              </button>
                              <button 
                                onClick={() => {
                                  editorRef.current?.insertButton(link.label, link.url, ALIAS_COLORS[senderAlias] || ALIAS_COLORS.DEFAULT);
                                  setShowLinkSidebar(false);
                                  toast({ title: "Button Formed", description: `Inserted "${link.label}" CTA block.` });
                                }}
                                className="flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-sky-500 hover:bg-sky-500/10 transition-all"
                              >
                                <MousePointer2 size={12} /> Pro Button
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standard Phrase Buttons (Requested by User) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em]">Quick Phrases</p>
                      <div className="h-[1px] flex-1 bg-purple-500/10 ml-4"></div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Click here for more information", phrase: "Click here for more information about your billing info" },
                        { label: "View detailed research report", phrase: "Click here to view your complete academic integrity report" },
                        { label: "Manage your notification matrix", phrase: "Manage your communication and notification settings" }
                      ].map((p, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            const url = (ALIAS_LINKS[senderAlias] || ALIAS_LINKS.DEFAULT)[0]?.url || "https://colabwize.com";
                            editorRef.current?.insertButton(p.phrase, url, ALIAS_COLORS[senderAlias] || ALIAS_COLORS.DEFAULT);
                            setShowLinkSidebar(false);
                          }}
                          className="w-full text-left p-4 bg-background border border-border rounded-xl hover:border-purple-500/40 transition-all group shadow-sm"
                        >
                          <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1">{p.label}</p>
                          <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 italic">"{p.phrase}"</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Global Repository */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Corporate Links</p>
                      <div className="h-[1px] flex-1 bg-border ml-4"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {ALIAS_LINKS.DEFAULT.map((link) => (
                        <button 
                          key={link.url}
                          onClick={() => {
                            editorRef.current?.insertLink(link.label, link.url);
                            setShowLinkSidebar(false);
                          }}
                          className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-muted-foreground/30 transition-all group"
                        >
                          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{link.label}</span>
                          <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-secondary/10 border-t border-border mt-auto text-center">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] italic mb-0 opacity-50">
                    ColabWize Global Link Repository
                  </p>
                </div>
              </motion.div>
            </>
          )}
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
