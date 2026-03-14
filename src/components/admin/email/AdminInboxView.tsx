import React, { useState, useEffect } from "react";
import { useToaster } from "../../../hooks/useToaster";
import { getAuthToken } from "../../../services/auth";
import { Loader2, Inbox, CheckCircle, RefreshCcw, Reply, XCircle } from "lucide-react";
import DOMPurify from "dompurify";

interface Message {
  id: string;
  sender_email: string;
  subject: string;
  message_html: string;
  message_text: string;
  received_at: string;
  status: string;
  thread_id: string;
  source_alias: string;
}

export const AdminInboxView: React.FC = () => {
  const [threads, setThreads] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<Message[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToaster();

  const fetchInbox = async (status = "open") => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/admin/inbox?status=${status}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setThreads(data.messages);
      }
    } catch (err) {
      toast({ title: "Error fetching inbox", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchThread = async (threadId: string) => {
    try {
      const token = await getAuthToken();
      const res = await fetch(`/api/admin/inbox/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedThread(data.messages);
      }
    } catch (err) {
      toast({ title: "Error fetching thread details", variant: "destructive" });
    }
  };

  const handleReply = async () => {
    if (!replyText || !selectedThread) return;
    
    setIsReplyLoading(true);
    try {
      const originalMessage = selectedThread[0]; // Oldest message in thread
      const token = await getAuthToken();
      
      const res = await fetch("/api/admin/inbox/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          threadId: originalMessage.thread_id,
          senderAlias: originalMessage.source_alias || "SUPPORT",
          to: originalMessage.sender_email,
          subject: originalMessage.subject.startsWith("Re:") ? originalMessage.subject : `Re: ${originalMessage.subject}`,
          message: replyText
        })
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: "Reply sent successfully" });
        setReplyText("");
        await fetchThread(originalMessage.thread_id); // Refresh thread
      } else {
        throw Error(data.error);
      }
    } catch (err: any) {
      toast({ title: "Failed to send reply", description: err.message, variant: "destructive" });
    } finally {
      setIsReplyLoading(false);
    }
  };

  const updateThreadStatus = async (threadId: string, status: string) => {
     try {
       const token = await getAuthToken();
       await fetch(`/api/admin/inbox/${threadId}/status`, {
           method: "PATCH",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${token}`
           },
           body: JSON.stringify({ status })
       });
       toast({ title: `Thread marked as ${status}` });
       setSelectedThread(null);
       fetchInbox();
     } catch (err) {
       toast({ title: "Failed to update status", variant: "destructive" });
     }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  if (isLoading && threads.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[800px]">
      {/* Left panel - Thread list */}
      <div className="col-span-1 border rounded-lg overflow-y-auto bg-white shadow-sm flex flex-col">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center sticky top-0">
           <h3 className="font-semibold text-slate-800 flex items-center gap-2">
             <Inbox className="w-4 h-4" /> Open Tickets
           </h3>
           <button onClick={() => fetchInbox()} className="text-slate-500 hover:text-blue-600">
             <RefreshCcw className="w-4 h-4" />
           </button>
        </div>
        <div className="divide-y relative">
          {threads.length === 0 ? (
            <p className="p-8 text-center text-slate-500 text-sm">No open support messages found.</p>
          ) : (
            threads.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => fetchThread(msg.thread_id)}
                className={`p-4 cursor-pointer hover:bg-slate-50 transition ${selectedThread?.[0]?.thread_id === msg.thread_id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-sm text-slate-900 truncate pr-2">{msg.sender_email}</span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(msg.received_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 truncate">{msg.subject}</p>
                <p className="text-xs text-slate-500 truncate mt-1">
                   Via <strong className="text-blue-600">{msg.source_alias}</strong> alias
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel - Thread viewing & replies */}
      <div className="col-span-2 border rounded-lg bg-white shadow-sm flex flex-col relative">
        {selectedThread ? (
          <>
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center shrink-0">
               <div>
                 <h2 className="font-semibold text-lg text-slate-900">{selectedThread[0].subject}</h2>
                 <p className="text-sm text-slate-500">From: {selectedThread[0].sender_email} • Thread ID: {selectedThread[0].thread_id}</p>
               </div>
               <button 
                  onClick={() => updateThreadStatus(selectedThread[0].thread_id, 'resolved')}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 flex items-center gap-2"
               >
                 <CheckCircle className="w-4 h-4" /> Resolve
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {selectedThread.map((msg, index) => {
                  const isAdminReply = msg.imap_uid.toString().length > 6 && !msg.sender_email.includes('@'); // Dirty check based on logic implemented
                  
                  return (
                     <div key={msg.id} className={`flex flex-col max-w-[85%] ${isAdminReply ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                           <span className="font-medium">{isAdminReply ? 'ColabWize Admin' : msg.sender_email}</span>
                           <span>{new Date(msg.received_at).toLocaleString()}</span>
                        </div>
                        <div 
                           className={`p-4 rounded-xl text-sm \${isAdminReply ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}
                           dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.message_html || msg.message_text.replace(/\n/g, '<br/>')) }}
                        />
                     </div>
                  );
               })}
            </div>

            <div className="p-4 border-t bg-slate-50 shrink-0">
               <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here... (HTML supported)"
                  className="w-full rounded-md border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]"
               />
               <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <XCircle className="w-3 h-3"/> Never include sensitive credentials in email.
                  </span>
                  <button 
                     disabled={isReplyLoading || !replyText}
                     onClick={handleReply}
                     className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
                  >
                     {isReplyLoading && <Loader2 className="w-4 h-4 animate-spin"/>}
                     <Reply className="w-4 h-4"/> Reply
                  </button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Inbox className="w-16 h-16 mb-4 text-slate-200" />
            <p>Select a conversation from the left to view</p>
          </div>
        )}
      </div>
    </div>
  );
};
