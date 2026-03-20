import React, { useState, useEffect } from "react";
import { useToast } from "../../../hooks/use-toast";
import { apiClient } from "../../../services/apiClient";
import { 
  Loader2, Inbox, Reply, 
  Search, User, Mail, Star, 
  Archive, Trash2, MoreVertical, 
  ChevronLeft, ChevronRight, CheckCircle2,
  Clock, Filter, Shield, CreditCard,
  Globe, HelpCircle
} from "lucide-react";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender_email: string;
  subject: string;
  message_text: string;
  message_html?: string;
  received_at: string;
  created_at: string;
  thread_id?: string;
  source_alias?: string;
  is_read: boolean;
  folder: string;
  priority: string;
}


export const AdminInboxView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'open' | 'resolved'>('open');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { toast } = useToast();

  const fetchInbox = async () => {
    try {
      setLoading(true);
      let url = `/api/admin/inbox?status=${filterStatus}`;
      
      const response = await apiClient.get(url);
      if (response.success) {
        setMessages(response.messages || []);
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Failed to connect to the email server.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (threadId: string, message?: Message) => {
    try {
      const response = await apiClient.get(`/api/admin/inbox/${threadId}`);
      if (response.success) {
        setThreadMessages(response.messages || []);
        setSelectedThread(threadId);
        
        // If the first message is unread, mark it as read
        if (message && !message.is_read) {
          handleMarkAsRead(message.id);
        }
      }
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to load message conversation.",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await apiClient.patch(`/api/admin/inbox/message/${messageId}/read`, { isRead: true });
      // Update local state to avoid re-fetch unless needed
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleReply = async () => {
    if (!selectedThread || !replyMessage) return;
    
    try {
      setIsSending(true);
      const mainMsg = threadMessages[0];
      const response = await apiClient.post('/api/admin/inbox/reply', {
        threadId: selectedThread,
        senderAlias: 'SUPPORT',
        to: mainMsg.sender_email,
        subject: `Re: ${mainMsg.subject}`,
        message: replyMessage
      });

      if (response.success) {
        setReplyMessage("");
        toast({ title: "Email Sent", description: "Your reply has been sent successfully." });
        fetchThread(selectedThread);
      }
    } catch (error: any) {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send the email reply.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [filterStatus]);

  const filteredMessages = messages.filter(m => 
    m.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.sender_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Sidebar (Gmail Style) */}
      <div className="w-64 flex flex-col border-r border-gray-100 bg-[#f8f9fa] shrink-0">
        <div className="p-4">
          <button className="w-full py-3 px-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md flex items-center gap-3 transition-all group">
            <Mail className="text-slate-500 group-hover:text-sky-500 transition-colors" size={18} />
            <span className="font-semibold text-slate-700">Compose</span>
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 mt-2 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => { setFilterStatus('open'); setSelectedThread(null); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r-full text-sm font-medium transition-colors ${filterStatus === 'open' ? 'bg-sky-50 text-sky-600' : 'text-slate-500 hover:bg-slate-100/50'}`}
          >
            <Inbox size={18} />
            <span className="flex-1 text-left">All Inbox</span>
            <span className={`text-[10px] font-bold tracking-wider ${filterStatus === 'open' ? 'text-sky-600' : 'text-slate-400'}`}>{messages.length}</span>
          </button>

          
          <div className="my-4 border-t border-gray-100" />

          <button 
            onClick={() => { setFilterStatus('resolved'); setSelectedThread(null); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-r-full text-sm font-medium transition-colors ${filterStatus === 'resolved' ? 'bg-sky-50 text-sky-600' : 'text-slate-500 hover:bg-slate-100/50'}`}
          >
            <CheckCircle2 size={18} />
            <span className="flex-1 text-left">Resolved</span>
          </button>
        </nav>
      </div>

      {/* Message List */}
      <div className={`flex flex-col border-r border-gray-100 transition-all ${selectedThread ? 'w-1/3' : 'flex-1'}`}>
        <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-white sticky top-0 z-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search in mail"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg focus:bg-white focus:ring-1 focus:ring-sky-500/20 text-sm transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full">
            <Filter size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 opacity-50 h-full">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <span className="text-sm font-medium text-gray-500">Loading messages...</span>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center opacity-40 h-full">
              <Inbox size={48} className="mb-4 text-gray-300" />
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Your inbox is clean</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => fetchThread(msg.thread_id || msg.id, msg)}
                  className={`px-4 py-3 flex flex-col gap-1 cursor-pointer transition-all border-l-4 ${
                    selectedThread === (msg.thread_id || msg.id) 
                      ? 'bg-blue-50 border-blue-500' 
                      : 'border-transparent hover:bg-gray-50'
                  } ${!msg.is_read ? 'bg-[#f2f6fc]' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-sm truncate ${!msg.is_read ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>
                      {msg.sender_email.split('@')[0]}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider whitespace-nowrap ${!msg.is_read ? 'text-sky-600 font-bold' : 'text-slate-400 font-medium'}`}>
                      {new Date(msg.created_at || msg.received_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className={`text-sm truncate ${!msg.is_read ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>{msg.subject}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">{msg.message_text.replace(/<[^>]+>/g, '')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Area (Selected Email) */}
      <div className="flex-1 flex flex-col bg-white">
        <AnimatePresence mode="wait">
          {selectedThread ? (
            <motion.div 
              key={selectedThread}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Message Toolbar */}
              <div className="px-6 py-2 border-b border-gray-100 flex items-center justify-between shrink-0 h-14 bg-white sticky top-0 z-20">
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelectedThread(null)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors mr-2 lg:hidden">
                    <ChevronLeft size={20} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Archive size={18} /></button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Trash2 size={18} /></button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full border-l border-gray-100 ml-1 pl-3"><Mail size={18} /></button>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><MoreVertical size={18} /></button>
                  <div className="flex items-center border-l border-gray-100 ml-1 pl-3">
                    <span className="text-xs text-gray-500 px-2">1 of 1</span>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronLeft size={18} /></button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><ChevronRight size={18} /></button>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="px-8 pt-8 pb-4">
                  <h2 className="text-2xl text-gray-900 font-medium mb-8 leading-tight">{threadMessages[0]?.subject || '(No Subject)'}</h2>
                </div>

                <div className="px-8 space-y-12 pb-12">
                  {threadMessages.map((msg, idx) => (
                    <div key={msg.id} className="group relative">
                      <div className="flex gap-4 items-start">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold capitalize shadow-sm">
                          {msg.sender_email.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{msg.sender_email.split('@')[0]}</span>
                              <span className="text-[10px] font-medium text-slate-400 tracking-wider"> &lt;{msg.sender_email}&gt;</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(msg.created_at || msg.received_at).toLocaleString()}</span>
                          </div>
                          <div 
                            className="text-[15px] leading-relaxed text-gray-800 prose prose-blue max-w-none break-words"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.message_html || msg.message_text || "") }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Reply Box */}
                <div className="px-8 pb-12">
                   <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm focus-within:shadow-md focus-within:border-blue-300 transition-all bg-white">
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <Reply size={14} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-600">Reply to {threadMessages[0]?.sender_email}</span>
                      </div>
                      <textarea 
                        className="w-full p-4 min-h-[150px] border-none focus:ring-0 text-sm placeholder:text-gray-300 text-gray-800 resize-none"
                        placeholder="Type your message here..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                      />
                      <div className="p-4 flex justify-end bg-white border-t border-gray-50">
                        <button 
                          onClick={handleReply}
                          disabled={!replyMessage || isSending}
                          className="px-6 py-2.5 bg-sky-500 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest hover:bg-sky-600 shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                          {isSending ? <Loader2 className="animate-spin" size={14} /> : <Reply size={14} />}
                          Send Message
                        </button>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center p-20 text-center bg-white h-full"
            >
              <div className="h-40 w-40 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Mail size={64} className="text-gray-200" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an item to read</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">Click on a message from the list on the left to view the full conversation history.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
