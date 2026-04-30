import { getErrorMessage } from "../../../utils/errorHandler";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOutletContext } from "react-router-dom";
import {
  Mail,
  Send,
  Rss,
  Activity,
  BarChart3,
  Users as UsersIcon,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Inbox,
  LayoutTemplate,
  Sparkles,
  X,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  MousePointer2,
  TrendingUp,
  Link as LinkIcon,
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { apiClient } from "../../../services/apiClient";
import DOMPurify from "dompurify";
import { AdminUserDirectory } from "./AdminUserDirectory";
import { AdminInboxView } from "./AdminInboxView";
import {
  EmailComposerEditor,
  EmailComposerEditorRef,
} from "./EmailComposerEditor";
import { useRef } from "react";
import { StockPhotoPicker } from "../shared/StockPhotoPicker";

type TabType =
  | "users"
  | "send"
  | "broadcast"
  | "logs"
  | "analytics"
  | "inbox"
  | "templates"
  | "unsubscribed"
  | "gallery";

const ASSET_IMAGES = [
  {
    title: "AI Neural Drafting",
    key: "ai-neural-drafting",
    desc: "Scientific AI visualization for promos",
    url: "/admin/gallery/ai-neural-drafting.png",
  },
  {
    title: "Research Network",
    key: "research-network",
    desc: "Global academic connectivity abstract",
    url: "/admin/gallery/research-network.png",
  },
  {
    title: "Academic Integrity Seal",
    key: "integrity-seal",
    desc: "Official verification seal for proofs",
    url: "/admin/gallery/integrity-seal.png",
  },
  {
    title: "Workspace Interface",
    key: "workspace-preview",
    desc: "Premium dashboard UI showcase",
    url: "/admin/gallery/workspace-preview.png",
  },
  {
    title: "Collaboration Abstract",
    key: "collaboration-abstract",
    desc: "Digital synergy and teamwork visual",
    url: "/admin/gallery/collaboration-abstract.png",
  },
];

const ALIAS_LINKS: Record<string, { label: string; url: string }[]> = {
  SUPPORT: [
    {
      label: "Help Center",
      url: "https://colabwize.com/resources/help-center",
    },
    { label: "Contact Us", url: "https://colabwize.com/contact" },
    { label: "FAQ Center", url: "https://colabwize.com/company/faq" },
  ],
  BILLING: [
    {
      label: "Subscription Management",
      url: "https://colabwize.com/dashboard/settings/billing",
    },
    {
      label: "Invoice History",
      url: "https://colabwize.com/dashboard/settings/billing",
    },
    { label: "Pricing Tiers", url: "https://colabwize.com/pricing" },
  ],
  MARKETING: [
    { label: "Latest Blogs", url: "https://colabwize.com/resources/blogs" },
    {
      label: "Case Studies",
      url: "https://colabwize.com/resources/case-studies",
    },
    { label: "Product Roadmap", url: "https://colabwize.com/roadmap" },
  ],
  ENGINEERING: [
    { label: "Status Dashboard", url: "https://status.colabwize.com" },
    {
      label: "Documentation",
      url: "https://colabwize.com/resources/documentation",
    },
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
  ],
};

const ALIAS_COLORS: Record<string, string> = {
  SUPPORT: "#10b981", // Emerald
  HELP: "#f59e0b", // Amber
  BILLING: "#0ea5e9", // Sky
  MARKETING: "#a855f7", // Purple
  ENGINEERING: "#f97316", // Orange
  SECURITY: "#ef4444", // Red
  DEFAULT: "#111827", // Obsidian
};

const extractNameFromEmail = (email: string) => {
  if (!email || !email.includes("@")) return "";
  const namePart = email.split("@")[0];
  return namePart
    .split(/[._-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const maskEmail = (email: string) => {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 3) return `***@${domain}`;
  return `${local.substring(0, 3)}***@${domain}`;
};

export const AdminEmailCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("send");
  const [subSidebarOpen, setSubSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [unsubscribedUsers, setUnsubscribedUsers] = useState<any[]>([]);
  const [loadingUnsub, setLoadingUnsub] = useState(false);

  const { setSubSidebar } = useOutletContext<{
    setSubSidebar: (content: React.ReactNode) => void;
  }>();

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
      apiClient
        .get("/api/admin/email/unsubscribed")
        .then((r: any) => setUnsubscribedUsers(r.users || []))
        .catch(() =>
          toast({
            title: "Failed to load unsubscribed users",
            variant: "destructive",
          }),
        )
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
  const [isStockPickerOpen, setIsStockPickerOpen] = useState(false);

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
    {
      value: "MARKETING",
      label: "ColabWize Marketing (marketing@colabwize.com)",
    },
    { value: "PRESS", label: "ColabWize Press (press@colabwize.com)" },
    { value: "LEGAL", label: "ColabWize Legal (legal@colabwize.com)" },
    {
      value: "ENGINEERING",
      label: "ColabWize Engineering (engineering@colabwize.com)",
    },
    { value: "SECURITY", label: "ColabWize Security (security@colabwize.com)" },
  ];

  const SIGNATURE_PROFILES: Record<string, any> = {
    SUPPORT: {
      name: "ColabWize Support Team",
      title: "Customer Support",
      dept: "Support & Customer Experience",
      email: "support@colabwize.com",
    },
    HELP: {
      name: "ColabWize Help Desk",
      title: "Help & Assistance",
      dept: "Help & Resources",
      email: "help@colabwize.com",
    },
    BILLING: {
      name: "ColabWize Billing Department",
      title: "Billing & Subscriptions",
      dept: "Finance & Billing",
      email: "billing@colabwize.com",
    },
    TEAM: {
      name: "ColabWize Team",
      title: "Internal Communications",
      dept: "Operations & Team",
      email: "team@colabwize.com",
    },
    INFO: {
      name: "ColabWize Information",
      title: "Platform Communications",
      dept: "Communications",
      email: "info@colabwize.com",
    },
    MARKETING: {
      name: "ColabWize Marketing",
      title: "Marketing & Growth",
      dept: "Marketing",
      email: "marketing@colabwize.com",
    },
    PRESS: {
      name: "ColabWize Press Office",
      title: "Media & Public Relations",
      dept: "Press & Media",
      email: "press@colabwize.com",
    },
    LEGAL: {
      name: "ColabWize Legal Department",
      title: "Legal & Compliance",
      dept: "Legal & Compliance",
      email: "legal@colabwize.com",
    },
    ENGINEERING: {
      name: "ColabWize Engineering",
      title: "Platform Engineering",
      dept: "Engineering & Infrastructure",
      email: "engineering@colabwize.com",
    },
  };

  const renderFullPreview = () => {
    const profile = {
      ...(SIGNATURE_PROFILES[senderAlias] || SIGNATURE_PROFILES.SUPPORT),
    };
    if (senderName) profile.name = senderName;
    if (senderTitle) profile.title = senderTitle;

    const currentYear = new Date().getFullYear();
    const sanitizedBody = DOMPurify.sanitize(
      message ||
        `<p style="color: #94a3b8; font-style: italic;">Waiting for message input...</p>`,
    );

    return `
      <div style="background-color: #f8fafc; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f8fafc">
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); overflow: hidden;">
                <!-- Banner Header -->
                <tr>
                  <td style="padding: 0; text-align: center;">
                    <img src="https://colabwize.com/email_logo.png" alt="ColabWize" style="width: 100%; max-width: 600px; height: auto; display: block; margin: 0 auto;">
                  </td>
                </tr>

                <!-- Main Body Content -->
                <tr>
                  <td style="padding: 40px 40px 10px 40px; color: #334155; font-size: 16px; line-height: 1.6;">
                    ${sanitizedBody}
                  </td>
                </tr>

                <!-- Signature & Footer (Inside Card) -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #f1f5f9; margin-top: 32px; font-family: sans-serif;">
                      <tr>
                        <td style="padding-top: 16px; border-left: 2px solid #0ea5e9; padding-left: 16px; vertical-align: top;">
                          <p style="margin: 0 0 2px 0; font-size: 15px; font-weight: 600; color: #0f172a;">${profile.name}</p>
                          <p style="margin: 0 0 2px 0; font-size: 12px; color: #64748b;">${profile.title}${profile.dept ? ` &bull; ${profile.dept}` : ""}</p>
                          <p style="margin: 6px 0 0 0; font-size: 12px;">
                            <a href="mailto:${profile.email}" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">${profile.email}</a>
                            &nbsp;&bull;&nbsp;
                            <a href="https://colabwize.com" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">colabwize.com</a>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 60px; text-align: center; border-top: 1px solid #f8fafc; font-family: sans-serif;">
                      <tr>
                        <td style="padding: 30px 20px;">
                          <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px auto; border-collapse: collapse; text-align: left;">
                            <tr>
                              <td style="vertical-align: middle; padding-right: 16px;">
                                <img src="https://colabwize.com/images/Colabwize-logo.png" alt="ColabWize" style="height: 40px; width: auto; display: block;">
                              </td>
                              <td style="vertical-align: middle; border-left: 1px solid #e2e8f0; padding-left: 16px;">
                                <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #0f172a; tracking-tight: -0.01em; font-family: sans-serif;">ColabWize</h1>
                                <p style="margin: 1px 0 0 0; font-size: 12px; color: #94a3b8; font-weight: 500; font-family: sans-serif;">A Platform for Original, Credible, and Human Work.</p>
                              </td>
                            </tr>
                          </table>

                          <div style="margin-bottom: 24px; font-size: 13px; color: #64748b; line-height: 1.6; max-width: 450px; margin-left: auto; margin-right: auto;">
                            <p style="margin: 0 0 10px 0;">Have questions? <a href="https://colabwize.com/contact" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">Contact support</a></p>
                            <p style="margin: 0;">You can <a href="https://colabwize.com/dashboard/settings" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">manage notifications</a> or <a href="#" style="color: #0ea5e9; text-decoration: none; font-weight: 500;">unsubscribe</a>.</p>
                          </div>

                          <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                            © ${currentYear} ColabWize. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
    const foundUser = allUsers.find(
      (u) => u.email.toLowerCase() === recipient.toLowerCase(),
    );
    if (foundUser) {
      setRecipientName(foundUser.full_name);
    } else {
      // If not in pre-loaded list, we can keep the current name or clear if it looks like a typing change
      // But we'll leave it for now to avoid flickering if typed correctly
    }
  }, [recipient, allUsers]);

  useEffect(() => {
    const profile =
      SIGNATURE_PROFILES[senderAlias] || SIGNATURE_PROFILES.SUPPORT;
    setSenderName(profile.name);
    setSenderTitle(profile.title);
  }, [senderAlias]);

  const fetchLogs = async () => {
    setIsLoadingData(true);
    try {
      const response = await apiClient.get(`/api/admin/email/logs`);
      setLogs(response.logs || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch email logs",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to fetch analytics",
        variant: "destructive",
      });
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
        senderTitle,
      });
      toast({
        title: "Success",
        description: `Email dispatched to ${recipient}`,
      });
      setRecipient("");
      setSubject("");
      setMessage("");
      setIsTemplateLoaded(false);
    } catch (err: any) {
      toast({
        title: "Failed",
        description: getErrorMessage(err, "Email dispatch failed"),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== "SEND") {
      toast({
        title: "Verification Failed",
        description: "Type 'SEND' to confirm broadcast",
        variant: "destructive",
      });
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
        senderTitle,
      });
      toast({
        title: "Broadcast Initialized",
        description: `Broadcasting to ${userIds.length} users in background.`,
      });
      setConfirmText("");
      setIsTemplateLoaded(false);
    } catch (err: any) {
      toast({
        title: "Broadcast Failed",
        description: getErrorMessage(err),
        variant: "destructive",
      });
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
        currentMessage: message,
      });
      if (resp.html) {
        setMessage(resp.html);
        toast({
          title: "Draft Generated",
          description: "The AI has finished composing your draft.",
        });
        setShowAIModal(false);
        setAiPrompt("");
      }
    } catch (err: any) {
      toast({
        title: "AI Failed",
        description: getErrorMessage(err, "Failed to generate email."),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const subNavContent = (
    <div className="flex flex-col gap-2 px-4">
      <div className="px-2 mb-6">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-sky-600">
          Email Array
        </h2>
        <p className="text-lg font-bold text-slate-900 tracking-tight">
          Communications
        </p>
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
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
            activeTab === tab.id
              ? "bg-sky-50 text-sky-600 border border-sky-100"
              : "bg-white border border-slate-100 text-slate-500 hover:text-sky-600 hover:border-sky-200 hover:bg-slate-50/50"
          }`}>
          <tab.icon size={14} className="shrink-0" />
          <span className="truncate whitespace-nowrap">{tab.label}</span>
        </button>
      ))}
    </div>
  );

  useEffect(() => {
    setSubSidebar(subNavContent);
    return () => setSubSidebar(null);
  }, [activeTab, setSubSidebar, subNavContent]);

  return (
    <>
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
              className="w-full">
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
                      <h2 className="text-3xl font-black text-foreground tracking-tighter mb-2">
                        Asset Gallery
                      </h2>
                      <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] mb-8">
                        Manage your branded images and assets
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ASSET_IMAGES.map((item) => {
                          const fullUrl = `https://colabwize.com${item.url}`;
                          return (
                            <div
                              key={item.key}
                              className="group/card bg-secondary/30 border border-border rounded-3xl overflow-hidden hover:border-sky-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-sky-500/10">
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
                                      toast({
                                        title: "URL Copied",
                                        description:
                                          "Image link copied to clipboard",
                                      });
                                    }}
                                    className="h-10 w-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                                    title="Copy URL">
                                    <Copy size={18} />
                                  </button>
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-10 w-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all hover:scale-110"
                                    title="View Fullsize">
                                    <ExternalLink size={18} />
                                  </a>
                                </div>
                              </div>
                              <div className="p-5">
                                <h4 className="font-black text-sm text-foreground tracking-tight">
                                  {item.title}
                                </h4>
                                <p className="text-[10px] text-muted-foreground mt-1 font-medium leading-relaxed">
                                  {item.desc}
                                </p>
                                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                                  <code className="text-[9px] bg-background px-2 py-1 rounded-lg text-muted-foreground truncate max-w-[140px]">
                                    .../${item.key}.png
                                  </code>
                                  <button
                                    onClick={() => {
                                      setMessage(
                                        (prev) =>
                                          prev +
                                          `<br><img src="${item.url}" alt="${item.title}" style="max-width: 100%; border-radius: 16px; margin: 20px 0;">`,
                                      );
                                      setActiveTab("send");
                                      toast({
                                        title: "Inserted",
                                        description: "Image added to composer",
                                      });
                                    }}
                                    className="text-[9px] font-black uppercase tracking-widest text-sky-500 hover:text-sky-400">
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
                  <div className="p-8 bg-white border border-slate-200 rounded-2xl text-left">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 border border-sky-100">
                        <LayoutTemplate size={20} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                          Platform Templates
                        </h2>
                        <p className="text-sm font-medium text-slate-400 mt-1">
                          Curated professional templates. Loads instantly into
                          Compose or Broadcast.
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
                          icon: (
                            <ShieldCheck
                              size={20}
                              className="text-emerald-500"
                            />
                          ),
                          thumbnail:
                            "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=400&h=200&fit=crop",
                          subject:
                            "Issue Resolved: Your support ticket has been closed",
                          message: `<h2>Issue Resolved Successfully</h2><p>Hello,</p><p>We are pleased to inform you that your recent support inquiry has been fully addressed and resolved by our technical team.</p><p><strong>Resolution Details:</strong> The reported behavior was investigated and a localized patch has been deployed to your workspace environment. All systems are now performing within optimal parameters.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/contact" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Contact Support Team</a>
                            </div>`,
                        },
                        {
                          alias: "HELP",
                          name: "New User Onboarding Guide",
                          icon: (
                            <span className="font-bold text-amber-500 text-lg">
                              ?
                            </span>
                          ),
                          thumbnail:
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop",
                          subject:
                            "Welcome to ColabWize: Your Quick-Start Guide",
                          message: `<h2>Welcome to the Platform</h2><p>We're thrilled to have you onboard! To help you get the most out of ColabWize, we've compiled a few essential resources for your first 48 hours:</p><ul><li><strong>Quick Start Video:</strong> A 3-minute overview of the dashboard.</li><li><strong>Knowledge Base:</strong> Searchable documentation for every feature.</li><li><strong>Community Forum:</strong> Connect with other researchers and power users.</li></ul>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/resources/help-center" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Start Onboarding Now</a>
                            </div>`,
                        },
                      ],
                      "Billing & Subscription": [
                        {
                          alias: "BILLING",
                          name: "Plan Upgrade Confirmation",
                          icon: <Activity size={20} className="text-sky-500" />,
                          thumbnail:
                            "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=200&fit=crop",
                          subject:
                            "Billing Update: Subscription Upgrade Successful",
                          message: `<h2>Upgrade Successful</h2><p>Hello,</p><p>This email confirms that your ColabWize account has been successfully upgraded to the <strong>Premium Tier</strong>.</p><p><strong>New Features Unlocked:</strong></p><ul><li>Unlimited AI Drafting</li><li>Advanced Citation Exports</li><li>Priority Engineering Support</li></ul><p>Your new billing cycle begins today. You can manage your subscription and download invoices at any time from your billing dashboard.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/dashboard/settings/billing" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">View Billing Information</a>
                            </div>`,
                        },
                        {
                          alias: "BILLING",
                          name: "Payment Overdue Notice",
                          icon: (
                            <AlertTriangle size={20} className="text-red-500" />
                          ),
                          thumbnail:
                            "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=200&fit=crop",
                          subject:
                            "Urgent Action Required: Payment Method Overdue",
                          message: `<h2>Action Required: Payment Overdue</h2><p>Hello,</p><p>We were unable to process your most recent subscription payment. To avoid any interruption to your research workspace and AI access, please update your payment information immediately.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/dashboard/settings/billing" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Update Payment Method</a>
                            </div>`,
                        },
                      ],
                      "Newsletters & Broadcasts": [
                        {
                          alias: "MARKETING",
                          name: "Weekly Innovation Breakfast",
                          icon: (
                            <Sparkles size={20} className="text-purple-500" />
                          ),
                          thumbnail:
                            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=200&fit=crop",
                          subject:
                            "Sunday Breakfast: The Future of Originality",
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
                            <p><strong>The ColabWize Team</strong></p>`,
                        },
                      ],
                      "Customer Success": [
                        {
                          alias: "TEAM",
                          name: "Onboarding Check-in",
                          thumbnail:
                            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop",
                          subject: "How is your ColabWize experience so far?",
                          message: `<p>Hello,</p><p>It's been 48 hours since you joined, and we wanted to check in. Our goal is to make your research as seamless as possible.</p><p>Are you finding everything you need? If you're stuck on anything—from AI drafting to citation exports—our success team is here to help.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/dashboard" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Return to Dashboard</a>
                            </div>`,
                        },
                        {
                          alias: "TEAM",
                          name: "Inactivity Check-in",
                          thumbnail:
                            "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=200&fit=crop",
                          subject: "We haven't seen you in a while!",
                          message: `<p>Hello,</p><p>We noticed you haven't logged into ColabWize in a few days. We've recently added some powerful new AI features that we think you'll love.</p><p>Is there anything we can help you with to get back on track?</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/dashboard" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Return to Workspace</a>
                            </div>`,
                        },
                        {
                          alias: "TEAM",
                          name: "Milestone Celebration",
                          subject: "Congrats! You reached a new milestone",
                          message: `<h2>You're Crushing It!</h2><p>Hello,</p><p>Congratulations! You just completed your 10th research draft. That's a huge step toward completing your project.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/dashboard" style="background-color: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Keep Going &rarr;</a>
                            </div>`,
                        },
                      ],
                      "Legal & Policy": [
                        {
                          alias: "LEGAL",
                          name: "Annual Terms Update",
                          thumbnail:
                            "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=200&fit=crop",
                          subject:
                            "Legal Notice: Updates to ColabWize Terms of Service",
                          message: `<h2>Policy Update Notice</h2><p>Hello,</p><p>In accordance with new international data protections, we have updated our Global Terms of Service and Privacy Policy.</p><p>By continuing to use ColabWize after April 1st, you agree to these updated terms.</p>
                            <div style="margin: 30px 0; text-align: center;">
                              <a href="https://colabwize.com/legal/terms" style="background-color: #475569; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; display: inline-block;">Accept Terms</a>
                            </div>`,
                        },
                      ],
                    }).map(([category, items]) => (
                      <div key={category} className="space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="h-8 w-1 bg-sky-500 rounded-full" />
                          <h3 className="text-xl font-black text-foreground tracking-tighter">
                            {category}
                          </h3>
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {items.map((tpl) => (
                            <div
                              key={tpl.name}
                              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-sky-500/50 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300 group flex flex-col h-full">
                              <div className="mb-4 aspect-video rounded-lg overflow-hidden border border-slate-100 bg-slate-50 relative group/img">
                                {tpl.thumbnail ? (
                                  <img
                                    src={tpl.thumbnail}
                                    alt="Preview"
                                    className="w-full h-full object-cover grayscale-[0.5] group-hover/img:grayscale-0 transition-all duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                                    <ImageIcon size={32} />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 h-6 w-6 rounded-lg bg-white/90 backdrop-blur shadow-sm flex items-center justify-center text-slate-400">
                                  {tpl.icon}
                                </div>
                              </div>

                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                                    {tpl.name}
                                  </h3>
                                  <span className="text-[10px] font-medium text-slate-400 mt-1 block uppercase tracking-wider">
                                    {tpl.alias} Channel
                                  </span>
                                </div>
                              </div>

                              <div className="flex-1 space-y-3 mb-6">
                                <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                                    Subject Line
                                  </p>
                                  <p className="text-[11px] text-slate-600 font-medium line-clamp-1 italic">
                                    {tpl.subject}
                                  </p>
                                </div>
                                <div className="px-3 py-2 bg-slate-50/50 border border-slate-100/50 rounded-lg">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mb-1">
                                    Content Snippet
                                  </p>
                                  <p
                                    className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                      __html: tpl.message.includes("<h2>")
                                        ? tpl.message.match(
                                            /<h2>(.*?)<\/h2>/,
                                          )?.[1] ||
                                          tpl.message.replace(/<[^>]*>?/gm, " ")
                                        : tpl.message.replace(
                                            /<[^>]*>?/gm,
                                            " ",
                                          ),
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50">
                                <button
                                  onClick={() => {
                                    let nameToUse =
                                      recipientName ||
                                      extractNameFromEmail(recipient);
                                    let personalizedMsg = tpl.message;
                                    if (nameToUse) {
                                      personalizedMsg = personalizedMsg
                                        .replace(
                                          /Hello,/g,
                                          `Hello ${nameToUse},`,
                                        )
                                        .replace(/Hey!/g, `Hey ${nameToUse}!`)
                                        .replace(
                                          /Hello\s+([A-Z])/g,
                                          `Hello ${nameToUse}, $1`,
                                        )
                                        .replace(/Hey,/g, `Hey ${nameToUse},`);
                                    }
                                    setSenderAlias(tpl.alias);
                                    setSubject(tpl.subject);
                                    setMessage(personalizedMsg);
                                    setIsTemplateLoaded(true);
                                    setActiveTab("send");
                                    toast({
                                      title: "Template Loaded",
                                      description: `Personalized for ${nameToUse || "User"}`,
                                    });
                                  }}
                                  className="px-3 py-2 bg-sky-600 text-white text-[9px] font-bold uppercase tracking-wider rounded-lg hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-sky-600/10">
                                  <Send size={12} />
                                  Personalize
                                </button>

                                <button
                                  onClick={() => {
                                    setSenderAlias(tpl.alias);
                                    setSubject(tpl.subject);
                                    setMessage(tpl.message);
                                    setIsTemplateLoaded(true);
                                    setActiveTab("broadcast");
                                    toast({
                                      title: "Template Loaded",
                                      description: "Ready for broadcast",
                                    });
                                  }}
                                  className="px-3 py-2 bg-white border border-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider rounded-lg hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                                  <Rss size={12} />
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
                  {/* Form Layout */}
                  <div className="p-8 bg-white border border-slate-200 rounded-2xl space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        {activeTab === "send" ? (
                          <Send size={18} className="text-sky-500" />
                        ) : (
                          <Rss size={18} className="text-sky-500" />
                        )}
                        {activeTab === "send"
                          ? "Compose Email"
                          : "Mass Broadcast"}
                      </h3>
                      {activeTab === "broadcast" && (
                        <div className="px-3 py-1 bg-sky-50 border border-sky-100 rounded-full">
                          <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">
                            {targetCount} Target Recipients
                          </span>
                        </div>
                      )}
                    </div>

                    <form
                      className="space-y-6"
                      onSubmit={
                        activeTab === "send" ? handleSendEmail : handleBroadcast
                      }>
                      {activeTab === "send" ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Recipient (To)
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              value={recipient}
                              onChange={(e) => setRecipient(e.target.value)}
                              placeholder="user@colabwize.com"
                              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold focus:border-sky-500 transition-all outline-none placeholder:text-slate-300"
                            />
                            <Mail
                              className="absolute right-4 top-3.5 text-slate-300"
                              size={18}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Target Audience
                          </label>
                          <select
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold uppercase tracking-wider outline-none focus:border-sky-500 transition-all appearance-none cursor-pointer text-slate-700"
                            value={broadcastTarget}
                            onChange={(e) =>
                              setBroadcastTarget(e.target.value)
                            }>
                            <option value="all">
                              All Pulse Nodes (All Users)
                            </option>
                            <option value="paid">
                              Active Subscriptions Only
                            </option>
                            <option value="free">
                              Standard Nodes (Free Plan)
                            </option>
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between ml-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                              Sender Identity
                            </label>
                            {isTemplateLoaded && (
                              <button
                                type="button"
                                onClick={() => setIsTemplateLoaded(false)}
                                className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:underline">
                                Unlock Alias
                              </button>
                            )}
                          </div>
                          <select
                            disabled={isTemplateLoaded}
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-sky-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-slate-700"
                            value={senderAlias}
                            onChange={(e) => setSenderAlias(e.target.value)}>
                            {SENDER_ALIASES.map((a) => (
                              <option key={a.value} value={a.value}>
                                {a.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Transmission Header (Subject)
                          </label>
                          <input
                            type="text"
                            required
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter Subject..."
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold focus:border-sky-500 transition-all outline-none placeholder:text-slate-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Professional Sender Name
                          </label>
                          <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder="Your Full Name..."
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold focus:border-sky-500 transition-all outline-none placeholder:text-slate-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Professional Sender Title
                          </label>
                          <input
                            type="text"
                            value={senderTitle}
                            onChange={(e) => setSenderTitle(e.target.value)}
                            placeholder="Your Official Title..."
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold focus:border-sky-500 transition-all outline-none placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">
                            Message Content
                          </label>
                        </div>
                        <EmailComposerEditor
                          ref={editorRef}
                          value={message}
                          onChange={setMessage}
                          onImageClick={() => {
                            setIsStockPickerOpen(true);
                          }}
                          onLinkClick={() => {
                            setShowLinkSidebar(true);
                            setShowAssetSidebar(false);
                          }}
                        />
                        <input
                          type="text"
                          name="message-required-hack"
                          required
                          className="opacity-0 w-0 h-0 pointer-events-none absolute"
                          value={message}
                          onChange={() => {}}
                          tabIndex={-1}
                        />
                      </div>

                      {activeTab === "broadcast" && (
                        <div className="p-6 bg-red-50 border border-red-100 rounded-2xl space-y-4">
                          <div className="flex items-center gap-3 text-red-500">
                            <AlertTriangle size={18} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              Broadcast Safety Protocol
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            You are about to transmit to{" "}
                            <span className="text-slate-900 font-bold">
                              {targetCount}
                            </span>{" "}
                            nodes. Type{" "}
                            <span className="text-red-500 font-bold">SEND</span>{" "}
                            to authorize.
                          </p>
                          <input
                            type="text"
                            value={confirmText}
                            onChange={(e) =>
                              setConfirmText(e.target.value.toUpperCase())
                            }
                            placeholder="Type SEND to confirm"
                            className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold tracking-widest text-center focus:border-red-500 outline-none transition-all placeholder:text-slate-300"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSending || isBroadcasting}
                        className={`w-full h-14 rounded-xl flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-widest transition-all ${
                          activeTab === "send"
                            ? "bg-sky-500 text-white shadow-sm hover:bg-sky-600 active:scale-95"
                            : "bg-red-500 text-white shadow-sm hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:grayscale"
                        }`}>
                        {isSending || isBroadcasting ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <>
                            {activeTab === "send"
                              ? "Dispatch Email"
                              : "Execute Broadcast"}
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Preview Panel with AI Dropdown */}
                  <div className="p-8 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center group relative h-fit sticky top-8">
                    <div className="w-full flex justify-between items-center mb-6 relative">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        HTML Render Preview
                      </p>

                      {/* AI Toggle Button */}
                      <button
                        type="button"
                        onClick={() => setShowAIModal(!showAIModal)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all z-10 ${
                          showAIModal
                            ? "bg-sky-500 text-white shadow-sm"
                            : "bg-sky-50 text-sky-600 border border-sky-100 hover:bg-sky-100"
                        }`}>
                        {showAIModal ? <X size={14} /> : <Sparkles size={14} />}
                        {showAIModal ? "Close AI" : "AI Assistant"}
                      </button>

                      {/* AI Dropdown Panel */}
                      <AnimatePresence>
                        {showAIModal && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="absolute top-12 right-0 w-[380px] max-w-[85vw] bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 flex flex-col">
                            <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center gap-3 text-left">
                              <div className="h-9 w-9 bg-sky-500 text-white rounded-lg flex items-center justify-center shrink-0">
                                <Sparkles size={18} />
                              </div>
                              <div className="flex flex-col">
                                <h2 className="text-sm font-bold text-slate-900 leading-tight">
                                  AI Email Assistant
                                </h2>
                                <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                                  Automated Drafting
                                </p>
                              </div>
                            </div>

                            <div className="p-5 space-y-5 text-left max-h-[60vh] overflow-y-auto custom-scrollbar">
                              {message.trim() && (
                                <div className="space-y-3">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Quick Corrections
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() =>
                                        handleGenerateWithAI(
                                          "Fix all grammar and spelling errors, keep tone exactly the same.",
                                        )
                                      }
                                      disabled={isGeneratingAI}
                                      className="h-9 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-600 text-[10px] font-bold uppercase tracking-wider transition-colors border border-slate-100 hover:border-sky-100 disabled:opacity-50 text-left px-3">
                                      Fix Grammar
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleGenerateWithAI(
                                          "Refine this draft to be extremely professional, strong, and highly corporate.",
                                        )
                                      }
                                      disabled={isGeneratingAI}
                                      className="h-9 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-600 text-[10px] font-bold uppercase tracking-wider transition-colors border border-slate-100 hover:border-sky-100 disabled:opacity-50 text-left px-3">
                                      Professional Tone
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleGenerateWithAI(
                                          "Soften the tone of this draft, make it very polite, friendly, and understanding.",
                                        )
                                      }
                                      disabled={isGeneratingAI}
                                      className="h-9 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-600 text-[10px] font-bold uppercase tracking-wider transition-colors border border-slate-100 hover:border-sky-100 disabled:opacity-50 text-left px-3">
                                      Soften Tone
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleGenerateWithAI(
                                          "Make this message extremely concise and short, getting straight to the point.",
                                        )
                                      }
                                      disabled={isGeneratingAI}
                                      className="h-9 rounded-lg bg-slate-50 hover:bg-sky-50 hover:text-sky-600 text-[10px] font-bold uppercase tracking-wider transition-colors border border-slate-100 hover:border-sky-100 disabled:opacity-50 text-left px-3">
                                      Streamline
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-3">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                  {message.trim()
                                    ? "Custom Instructions:"
                                    : "Describe what you want to write:"}
                                </p>
                                <textarea
                                  value={aiPrompt}
                                  onChange={(e) => setAiPrompt(e.target.value)}
                                  placeholder={
                                    message.trim()
                                      ? "e.g. 'Add a paragraph explaining...'"
                                      : "e.g. 'Write a welcome email...'"
                                  }
                                  className="w-full h-28 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium focus:border-sky-500 transition-colors outline-none resize-none placeholder:text-slate-300"
                                />
                              </div>

                              <button
                                onClick={() => handleGenerateWithAI()}
                                disabled={isGeneratingAI || !aiPrompt.trim()}
                                className="w-full h-11 shrink-0 flex items-center justify-center gap-2 bg-sky-500 text-white font-bold text-[11px] uppercase tracking-widest rounded-xl hover:bg-sky-600 disabled:opacity-50 transition-all shadow-sm">
                                {isGeneratingAI ? (
                                  <>
                                    <Loader2
                                      size={16}
                                      className="animate-spin"
                                    />{" "}
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={16} /> Generate Content
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="w-full bg-white rounded-2xl overflow-hidden min-h-[500px] flex flex-col border border-slate-100 relative z-0">
                      <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-1.5 shrink-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                      </div>
                      <div className="flex-1 p-6 text-left overflow-auto bg-slate-50/30">
                        <div className="max-w-[600px] mx-auto bg-white p-8 rounded-xl border border-slate-100">
                          <h2 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-50 pb-4">
                            {subject || "Transmission Header..."}
                          </h2>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: renderFullPreview(),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "logs" && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                      <Activity size={18} className="text-sky-500" />
                      Email Message Logs
                    </h3>
                    <button
                      onClick={fetchLogs}
                      className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:text-sky-600 transition-colors">
                      <Loader2
                        size={16}
                        className={isLoadingData ? "animate-spin" : ""}
                      />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Timestamp
                          </th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Recipient
                          </th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Sender Alias
                          </th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Subject
                          </th>
                          <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {logs.map((log) => (
                          <tr
                            key={log.id}
                            className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-5 text-xs font-mono text-slate-400">
                              {new Date(log.sent_at).toLocaleString()}
                            </td>
                            <td className="px-8 py-5 text-sm font-semibold text-slate-700">
                              {maskEmail(log.recipient)}
                            </td>
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-bold text-sky-600 uppercase px-2 py-1 bg-sky-50 border border-sky-100 rounded-lg">
                                {log.sender}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-sm font-medium text-slate-500 truncate max-w-xs">
                              {log.subject}
                            </td>
                            <td className="px-8 py-5">
                              <span
                                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${log.status === "sent" ? "text-emerald-500" : "text-red-500"}`}>
                                <div
                                  className={`h-1.5 w-1.5 rounded-full ${log.status === "sent" ? "bg-emerald-500" : "bg-red-500"}`}
                                />
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {logs.length === 0 && !isLoadingData && (
                      <div className="p-20 text-center space-y-4">
                        <ShieldCheck
                          size={48}
                          className="mx-auto text-slate-100"
                        />
                        <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                          No transmissions recorded
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "analytics" && analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="p-8 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm group hover:border-sky-200 transition-all">
                    <div className="flex justify-between items-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Total Transmissions
                      </p>
                      <CheckCircle2 size={16} />
                    </div>
                    <h4 className="text-4xl font-bold text-slate-900 tracking-tight">
                      {analytics.emails.reduce(
                        (acc: any, curr: any) => acc + curr._count,
                        0,
                      )}
                    </h4>
                  </div>
                  <div className="p-8 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm group hover:border-sky-200 transition-all">
                    <div className="flex justify-between items-center text-slate-400 group-hover:text-sky-500 transition-colors">
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Successful Link
                      </p>
                      <Activity size={16} />
                    </div>
                    <h4 className="text-4xl font-bold text-sky-600 tracking-tight">
                      {analytics.emails.find((e: any) => e.status === "sent")
                        ?._count || 0}
                    </h4>
                  </div>
                  <div className="p-8 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm group hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Node Growth (30D)
                      </p>
                      <TrendingUp size={16} />
                    </div>
                    <h4 className="text-4xl font-bold text-slate-900 tracking-tight">
                      +{analytics.growth.last30Days}
                    </h4>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      Global Coverage Base
                    </p>
                  </div>
                  <div className="p-8 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-sm group hover:border-sky-200 transition-all">
                    <div className="flex justify-between items-center text-slate-400 group-hover:text-sky-500 transition-colors">
                      <p className="text-[10px] font-bold uppercase tracking-widest">
                        Paid Nodes
                      </p>
                      <ShieldCheck size={16} />
                    </div>
                    <div className="flex flex-col">
                      <h4 className="text-4xl font-bold text-slate-900 tracking-tight">
                        {analytics.distribution.paid}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                        / {analytics.growth.total} Total Active
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Unsubscribed Users Panel */}
              {activeTab === "unsubscribed" && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Unsubscribed Users
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Users who have opted out of communications.
                    </p>
                  </div>

                  <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex gap-4 items-start">
                    <AlertTriangle
                      className="text-amber-500 mt-0.5 shrink-0"
                      size={18}
                    />
                    <div>
                      <p className="text-sm font-bold text-amber-700">
                        Compliance Notice
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        The system automatically excludes these recipients from
                        broadcasts.
                      </p>
                    </div>
                  </div>

                  {loadingUnsub ? (
                    <div className="flex justify-center py-16">
                      <Loader2
                        className="animate-spin text-sky-500"
                        size={32}
                      />
                    </div>
                  ) : unsubscribedUsers.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
                      <CheckCircle2
                        className="mx-auto text-emerald-500 mb-4"
                        size={40}
                      />
                      <p className="text-lg font-bold text-slate-900">
                        No unsubscribed users
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        All registered users are currently subscribed.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                        <p className="text-sm font-bold text-slate-700">
                          {unsubscribedUsers.length} user
                          {unsubscribedUsers.length !== 1 ? "s" : ""} opted out
                        </p>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {unsubscribedUsers.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center justify-between px-8 py-5 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                <X size={14} className="text-slate-400" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">
                                  {u.full_name || "Unnamed User"}
                                </p>
                                <p className="text-xs text-slate-400 font-medium">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-red-50 text-red-500 uppercase tracking-widest border border-red-100">
                                Opted Out
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                                {u.created_at
                                  ? new Date(u.created_at).toLocaleDateString()
                                  : "—"}
                              </p>
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
        </div>

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
                className="fixed top-0 right-0 w-[420px] h-full bg-white border-l border-border shadow-xl z-[70] flex flex-col">
                <div className="p-8 border-b border-border flex justify-between items-center bg-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ImageIcon size={64} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                      Stock Assets
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-medbold uppercase tracking-wider mt-1">
                      Official Media Library
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAssetSidebar(false)}
                    className="p-2 hover:bg-secondary rounded-xl transition-colors relative z-10">
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
                          toast({
                            title: "Node Inserted",
                            description: `Added ${img.title} to transmission.`,
                          });
                        }}
                        className="group relative aspect-square bg-card rounded-2xl overflow-hidden border border-border hover:border-sky-500 transition-all text-left shadow-sm hover:shadow-sky-500/10">
                        <img
                          src={img.url}
                          alt={img.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                          <p className="text-[8px] font-black text-white uppercase tracking-wider mb-0.5 line-clamp-1">
                            {img.title}
                          </p>
                          <p className="text-[7px] text-sky-400 font-bold uppercase tracking-widest">
                            Insert &rarr;
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-secondary/10 border-t border-border mt-auto text-center">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] italic mb-0 opacity-50">
                    ColabWize Global Asset Library
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
                className="fixed top-0 right-0 w-[380px] h-full bg-white border-l border-border shadow-2xl z-[70] flex flex-col">
                <div className="p-8 border-b border-border flex justify-between items-center bg-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 p-4 opacity-5">
                    <Copy size={64} />
                  </div>
                  <div className="relative z-10 text-left">
                    <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
                      Quick Links
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                      Quick Resource Links
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLinkSidebar(false)}
                    className="p-2 hover:bg-secondary rounded-xl transition-colors relative z-10">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-left">
                  {/* Alias Contextual Links */}
                  {(ALIAS_LINKS[senderAlias] || ALIAS_LINKS.DEFAULT).length >
                    0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">
                          Contextual Resources ({senderAlias})
                        </p>
                        <div className="h-[1px] flex-1 bg-sky-500/10 ml-4"></div>
                      </div>
                      <div className="space-y-3">
                        {(ALIAS_LINKS[senderAlias] || ALIAS_LINKS.DEFAULT).map(
                          (link) => (
                            <div
                              key={link.url}
                              className="group bg-background border border-border rounded-2xl overflow-hidden hover:border-sky-500 transition-all shadow-sm">
                              <div className="p-4 border-b border-border bg-secondary/5 flex items-center justify-between">
                                <span className="text-sm font-bold text-foreground">
                                  {link.label}
                                </span>
                                <ExternalLink
                                  size={12}
                                  className="text-muted-foreground opacity-50"
                                />
                              </div>
                              <div className="grid grid-cols-2 divide-x divide-border">
                                <button
                                  onClick={() => {
                                    editorRef.current?.insertLink(
                                      link.label,
                                      link.url,
                                    );
                                    setShowLinkSidebar(false);
                                    toast({
                                      title: "Link Injected",
                                      description: `Added "${link.label}" text link.`,
                                    });
                                  }}
                                  className="flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
                                  <LinkIcon size={12} /> Text Link
                                </button>
                                <button
                                  onClick={() => {
                                    editorRef.current?.insertButton(
                                      link.label,
                                      link.url,
                                      ALIAS_COLORS[senderAlias] ||
                                        ALIAS_COLORS.DEFAULT,
                                    );
                                    setShowLinkSidebar(false);
                                    toast({
                                      title: "Button Formed",
                                      description: `Inserted "${link.label}" CTA block.`,
                                    });
                                  }}
                                  className="flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-sky-500 hover:bg-sky-500/10 transition-all">
                                  <MousePointer2 size={12} /> Pro Button
                                </button>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {/* Standard Phrase Buttons (Requested by User) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em]">
                        Quick Phrases
                      </p>
                      <div className="h-[1px] flex-1 bg-purple-500/10 ml-4"></div>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          label: "Click here for more information",
                          phrase:
                            "Click here for more information about your billing info",
                        },
                        {
                          label: "View detailed research report",
                          phrase:
                            "Click here to view your complete academic integrity report",
                        },
                        {
                          label: "Manage your notification settings",
                          phrase:
                            "Manage your communication and notification settings",
                        },
                      ].map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            const url =
                              (ALIAS_LINKS[senderAlias] ||
                                ALIAS_LINKS.DEFAULT)[0]?.url ||
                              "https://colabwize.com";
                            editorRef.current?.insertButton(
                              p.phrase,
                              url,
                              ALIAS_COLORS[senderAlias] || ALIAS_COLORS.DEFAULT,
                            );
                            setShowLinkSidebar(false);
                          }}
                          className="w-full text-left p-4 bg-background border border-border rounded-xl hover:border-purple-500/40 transition-all group shadow-sm">
                          <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1">
                            {p.label}
                          </p>
                          <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 italic">
                            "{p.phrase}"
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Global Repository */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        Corporate Links
                      </p>
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
                          className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-muted-foreground/30 transition-all group">
                          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                            {link.label}
                          </span>
                          <ArrowRight
                            size={12}
                            className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"
                          />
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
      <StockPhotoPicker
        isOpen={isStockPickerOpen}
        onClose={() => setIsStockPickerOpen(false)}
        onSelect={(url) => {
          if (editorRef.current) {
            editorRef.current.insertImage(url);
          }
          setIsStockPickerOpen(false);
        }}
        title="Insert Stock Photo into Email"
      />
    </>
  );
};

export default AdminEmailCenter;
