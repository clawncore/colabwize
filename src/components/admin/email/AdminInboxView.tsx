import React, { useState, useEffect } from "react";
import { useToast } from "../../../hooks/use-toast";
import { apiClient } from "../../../services/apiClient";
import { 
  Loader2, Inbox, Reply, 
  Search, User, MessageSquare, Zap, Code2
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
      const response = await apiClient.get(`/api/admin/inbox?status=${filterStatus}`);
      if (response.success) {
        setMessages(response.messages || []);
      }
    } catch (error) {
      toast({
        title: "Connection Bridge Failed",
        description: "Unable to reach the communications array.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (threadId: string) => {
    try {
      const response = await apiClient.get(`/api/admin/inbox/${threadId}`);
      if (response.success) {
        setThreadMessages(response.messages || []);
        setSelectedThread(threadId);
      }
    } catch (error) {
       toast({
        title: "Thread Uplink Failed",
        description: "Failed to retrieve the message history.",
        variant: "destructive"
      });
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
        toast({ title: "Signal Transmitted", description: "Reply has been beamed to the recipient." });
        fetchThread(selectedThread); // Refresh thread
      }
    } catch (error: any) {
      toast({
        title: "Transmission Failed",
        description: error.message || "Failed to relay the response.",
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
      <div className="h-[calc(100vh-180px)] flex gap-8">
        {/* Thread List Area */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-foreground tracking-tight italic">Support Inbox</h2>
              <p className="text-muted-foreground mt-4 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping" />
                Inbound Signal Monitor
              </p>
            </div>
          </div>

          <div className="bg-card/40 border border-border rounded-2xl p-2 backdrop-blur-sm shadow-xl shadow-black/20">
             <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl mb-2">
                <button 
                  onClick={() => setFilterStatus('open')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterStatus === 'open' ? 'bg-background text-sky-500 shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Active
                </button>
                <button 
                  onClick={() => setFilterStatus('resolved')}
                  className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filterStatus === 'resolved' ? 'bg-background text-sky-500 shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Resolved
                </button>
             </div>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter transmissions..."
                  className="w-full pl-10 pr-4 py-2 bg-transparent text-foreground border-none focus:ring-0 text-xs font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 gap-3 opacity-50">
                <Loader2 className="animate-spin text-sky-500" size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest">Scanning Frequencies...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
                <Inbox size={40} className="mb-4 text-sky-500/50" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Signals Detected</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => fetchThread(msg.thread_id || msg.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                    selectedThread === (msg.thread_id || msg.id) 
                      ? 'bg-sky-500/5 border-sky-500/30 shadow-lg shadow-sky-500/5' 
                      : 'bg-card/40 border-border hover:border-sky-500/20 hover:bg-secondary/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover:border-sky-500/30 transition-colors">
                       <User size={18} className="text-muted-foreground group-hover:text-sky-500 transition-colors" />
                    </div>
                    <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">
                      {new Date(msg.created_at || msg.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground mb-1 truncate group-hover:text-sky-500 transition-colors">{msg.subject || 'Empty Subject'}</h4>
                  <p className="text-[11px] text-muted-foreground truncate font-medium">{msg.sender_email}</p>
                  
                  {selectedThread === (msg.thread_id || msg.id) && (
                    <motion.div layoutId="activeThreadIndicator" className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 shadow-[0_0_10px_rgba(var(--sky-500),0.5)]" />
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Message View Area */}
        <div className="flex-1 bg-card/20 border border-border rounded-[2.5rem] flex flex-col overflow-hidden backdrop-blur-md relative shadow-2xl shadow-black/40">
          <AnimatePresence mode="wait">
            {selectedThread ? (
              <motion.div 
                key={selectedThread}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full"
              >
                {/* Thread Header */}
                <div className="p-8 border-b border-border bg-card/40 flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <MessageSquare size={120} className="text-sky-500" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-black text-foreground italic flex items-center gap-3 tracking-tighter">
                       <span className="p-2 bg-sky-500/10 rounded-lg"><MessageSquare size={20} className="text-sky-500" /></span>
                       {threadMessages[0]?.subject || 'Secure Thread'}
                    </h3>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="px-2 py-0.5 bg-secondary text-muted-foreground text-[9px] font-black uppercase tracking-widest rounded border border-border">ID: {selectedThread.split('-')[0]}</span>
                      <span className="h-px w-4 bg-border" />
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Protocol: Secure End-to-End Relay</p>
                    </div>
                  </div>
                  <div className="flex gap-3 relative z-10">
                    <button className="px-5 py-2.5 bg-secondary border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-foreground hover:border-muted-foreground transition-all">Resolve Transmission</button>
                    <button className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-500 hover:bg-sky-500 hover:text-white transition-all shadow-lg shadow-sky-500/10">
                      <Reply size={20} />
                    </button>
                  </div>
                </div>

                {/* Message Center */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar bg-grid-white/[0.01]">
                  {threadMessages.map((msg, i) => (
                    <div key={msg.id} className={`flex ${msg.source_alias ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] flex flex-col ${msg.source_alias ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-3 mb-2 px-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${msg.source_alias ? 'text-sky-500/70' : 'text-primary/70'}`}>
                            {msg.source_alias ? 'Titan Intelligence (Admin)' : msg.sender_email}
                          </span>
                          <span className="h-px w-6 bg-border" />
                          <span className="text-[9px] font-bold text-muted-foreground opacity-40">
                            {new Date(msg.created_at || msg.received_at).toLocaleString()}
                          </span>
                        </div>
                        <motion.div 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`p-6 rounded-[2rem] border ${
                          msg.source_alias 
                            ? 'bg-sky-500/5 border-sky-500/20 rounded-tr-none shadow-lg shadow-sky-500/5' 
                            : 'bg-card border-border rounded-tl-none shadow-2xl shadow-black/20'
                        }`}>
                          <div 
                            className="text-sm font-medium leading-relaxed prose prose-invert max-w-none text-foreground/90"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.message_html || msg.message_text || "") }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Interface */}
                <div className="p-8 bg-card/40 border-t border-border backdrop-blur-xl">
                  <div className="relative bg-secondary/30 rounded-3xl border border-border p-6 shadow-inner">
                    <textarea 
                      placeholder="Input response payload for transmission..."
                      className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium min-h-[120px] text-foreground resize-none placeholder:text-muted-foreground/50"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <div className="flex justify-between items-center mt-6 pt-6 border-t border-border/10">
                       <div className="flex gap-3">
                         <button className="p-2.5 text-muted-foreground hover:text-sky-500 hover:bg-sky-500/5 rounded-xl transition-all">
                           <Code2 size={20} />
                         </button>
                         <button className="p-2.5 text-muted-foreground hover:text-sky-500 hover:bg-sky-500/5 rounded-xl transition-all">
                           <Zap size={20} />
                         </button>
                       </div>
                       <button 
                        onClick={handleReply}
                        disabled={!replyMessage || isSending}
                        className="flex items-center gap-3 px-8 py-3 bg-sky-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] shadow-[0_10px_30px_rgba(14,165,233,0.2)] hover:shadow-[0_15px_40px_rgba(14,165,233,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                       >
                         {isSending ? 'Transmitting Data...' : 'Transmit Payload'}
                         <Reply size={16} />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-20 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-sky-500/20 blur-3xl rounded-full animate-pulse" />
                  <div className="relative h-32 w-32 rounded-[2.5rem] bg-card border border-border flex items-center justify-center mb-10 shadow-2xl">
                    <Inbox size={56} className="text-sky-500/40" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-foreground tracking-tighter italic mb-4">Awaiting Signal Synchronization</h3>
                <p className="text-muted-foreground max-w-sm text-sm font-medium leading-relaxed opacity-60">
                  Select a communication channel from the downlink terminal to initialize the secure data stream.
                </p>
                <div className="mt-10 flex gap-4">
                  <div className="h-1 w-8 bg-sky-500/20 rounded-full" />
                  <div className="h-1 w-8 bg-sky-500 rounded-full" />
                  <div className="h-1 w-8 bg-sky-500/20 rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
};
