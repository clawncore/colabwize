import React, { useState } from "react";
import { useToaster } from "../../hooks/useToaster";
import { getAuthToken } from "../../services/auth";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Inbox, Users, Activity, Rss } from "lucide-react";
import { AdminInboxView } from "./AdminInboxView";

export const AdminEmailCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"send" | "broadcast" | "inbox" | "users" | "logs">("inbox");
  const [recipient, setRecipient] = useState("");
  const [senderAlias, setSenderAlias] = useState("HELP");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToaster();

  const SENDER_ALIASES = [
    { value: "HELP", label: "ColabWize Help (help@colabwize.com)" },
    { value: "SUPPORT", label: "ColabWize Support (support@colabwize.com)" },
    { value: "BILLING", label: "ColabWize Billing (billing@colabwize.com)" },
    { value: "NOTIFICATIONS", label: "ColabWize Notifications (notifications@colabwize.com)" },
    { value: "TEAM", label: "ColabWize Team (team@colabwize.com)" },
  ];

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !message) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields to send the email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = await getAuthToken();
      const response = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: recipient,
          senderAlias,
          subject,
          message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Email Sent Successfully",
          description: `Dispatched to ${recipient} via ${senderAlias}`,
        });
        // Clear form after success
        setRecipient("");
        setSubject("");
        setMessage("");
      } else {
        throw new Error(data.error || "Failed to dispatch email");
      }
    } catch (error: any) {
      toast({
        title: "Error Sending Email",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-6">
          <Mail className="h-8 w-8 text-blue-600" />
          Administrative Center
        </h1>
        <nav className="-mb-px flex space-x-8">
           <button onClick={() => setActiveTab("inbox")} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 \${activeTab === "inbox" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}>
             <Inbox className="w-4 h-4" /> Support Inbox
           </button>
           <button onClick={() => setActiveTab("send")} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 \${activeTab === "send" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}>
             <Send className="w-4 h-4" /> Send Email
           </button>
           <button onClick={() => setActiveTab("broadcast")} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 \${activeTab === "broadcast" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}>
             <Rss className="w-4 h-4" /> Broadcast
           </button>
           <button onClick={() => setActiveTab("users")} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 \${activeTab === "users" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}>
             <Users className="w-4 h-4" /> User Directory
           </button>
           <button onClick={() => setActiveTab("logs")} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 \${activeTab === "logs" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}>
             <Activity className="w-4 h-4" /> Email Logs
           </button>
        </nav>
      </div>

      {activeTab === "inbox" && <AdminInboxView />}

      {activeTab === "send" && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Send className="h-5 w-5 text-slate-500" />
              Compose Email
            </h2>

            <form onSubmit={handleSendEmail} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Recipient Email</label>
                  <input
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                    placeholder="user@university.edu"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sender Identity</label>
                  <select
                    value={senderAlias}
                    onChange={(e) => setSenderAlias(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {SENDER_ALIASES.map((alias) => (
                      <option key={alias.value} value={alias.value}>
                        {alias.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Important update concerning your ColabWize account"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">HTML Message Body</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={10}
                  placeholder="<p>Dear user...</p>"
                  className="w-full rounded-md border border-slate-300 font-mono text-sm px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500">
                  Tip: Message body resolves strictly as HTML. Plain text fallback is automatically generated.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Security Notice
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <p className="text-sm text-slate-600">
                  You are viewing this panel because your email address is on the administrative whitelist.
                </p>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
                <p className="text-sm text-slate-600">
                  All outgoing emails are verified through Resend domains against <strong>colabwize.com</strong> records.
                </p>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />
                <p className="text-sm text-slate-600">
                  Please assure compliance with anti-spam legislation. Do not use this panel for unverified marketing outreach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default AdminEmailCenter;
