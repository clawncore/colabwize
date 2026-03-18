"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  X,
  User,
  Loader2,
  Sparkles,
  Copy,
  Check,
  History,
  Trash2,
  PlusCircle,
  Clock,
} from "lucide-react";
import { Button } from "../ui/button";
import { ResearchService } from "../../services/researchService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Paper {
  externalId?: string;
  paperId?: string;
  source?: string;
  documentType?: string;
  title?: string;
  [key: string]: any;
}

interface ResearchChatSidebarProps {
  papers: Paper[];
  isOpen: boolean;
  onClose: () => void;
  pendingMessage?: string | null;
  onQueryConsumed?: () => void;
  // Enhancements for PDF Annotator
  isAnnotatorMode?: boolean;
  annotatorContext?: {
    documentContent: string;
    pdfAnnotations: any[];
    projectTitle?: string;
    projectDescription?: string;
  };
  onAnnotatorChat?: (messages: any[], sessionId: string | null) => Promise<Response>;
}

// Individual AI message bubble with copy support
function AiBubble({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex gap-3 items-start">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
        <Sparkles className="w-4 h-4 text-white" />
      </div>

      {/* Bubble */}
      <div
        className="relative max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed
        bg-gradient-to-br from-muted/80 to-muted
        border border-border/60
        shadow-sm
        backdrop-blur-sm
      ">
        {/* Subtle top-left gradient accent */}
        <div className="absolute inset-0 rounded-2xl rounded-tl-sm bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />

        <div className="text-foreground relative z-10 prose prose-sm prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>

        {/* Copy button — appears on hover */}
        <button
          onClick={handleCopy}
          className="absolute -bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity
            flex items-center gap-1 text-[10px] text-muted-foreground bg-background border border-border
            rounded-full px-2 py-0.5 shadow-sm hover:text-foreground">
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

// User message bubble
function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex gap-3 items-end justify-end">
      {/* Bubble */}
      <div
        className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed
        bg-gradient-to-br from-violet-600 to-indigo-700
        shadow-lg shadow-violet-500/20
        relative overflow-hidden
      ">
        {/* Shine overlay */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl" />
        <div className="text-white relative z-10 prose prose-sm prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/20">
        <User className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

// Animated typing indicator
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-start">
      <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3
        bg-gradient-to-br from-muted/80 to-muted
        border border-border/60 shadow-sm
        flex items-center gap-1.5
      ">
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export function ResearchChatSidebar({
  papers,
  isOpen,
  onClose,
  pendingMessage,
  onQueryConsumed,
  isAnnotatorMode,
  annotatorContext,
  onAnnotatorChat,
}: ResearchChatSidebarProps) {
  const selectedPaperCount = papers.length;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        isAnnotatorMode
          ? "Hello! I'm your PDF Research Assistant. I'm aware of your highlights and notes. How can I help you analyze this document today?"
          : selectedPaperCount > 0
            ? `I'm ready to answer questions about this document. Click a suggestion below or ask anything!`
            : "Select papers from the matrix to ask specific questions, or ask me general research questions.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsFetched, setQuestionsFetched] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isPdfOrProjectChat = papers.some((p) => p.source === "pdf_upload");
  const isProjectChat = papers.some((p) => p.documentType === "project");
  
  // Identify the most relevant ID for persistence
  const relevantIds = useMemo(() => {
    const pdfPaper = papers.find((p) => p.source === "pdf_upload");
    const externalPaper = papers.find((p) => p.source !== "pdf_upload");
    
    // Default to 'pdf' if source is pdf_upload but type is missing
    const docType = pdfPaper?.documentType || (pdfPaper?.source === "pdf_upload" ? "pdf" : undefined);
    
    return {
      fileId: docType === "pdf" ? pdfPaper?.id || pdfPaper?.externalId : undefined,
      projectId: docType === "project" ? pdfPaper?.id || pdfPaper?.externalId : undefined,
      externalPaperId: externalPaper?.paperId || externalPaper?.externalId
    };
  }, [papers]);

  const documentId = relevantIds.fileId || relevantIds.projectId || relevantIds.externalPaperId;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "50px"; // base height
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    if (!isOpen || !isPdfOrProjectChat || !documentId || questionsFetched)
      return;

    const fetch = async () => {
      setLoadingQuestions(true);
      setQuestionsFetched(true);
      const questions = await ResearchService.getSuggestedQuestions(
        documentId,
        isProjectChat ? "project" : "pdf",
      );
      setSuggestedQuestions(questions);
      setLoadingQuestions(false);
    };

    fetch();
  }, [isOpen, documentId, isPdfOrProjectChat, isProjectChat, questionsFetched]);

  // Load chat sessions for this context
  useEffect(() => {
    if (!isOpen) return;

    const loadSessions = async () => {
      setIsLoadingHistory(true);
      const filters: any = {};
      if (relevantIds.fileId) filters.fileId = relevantIds.fileId;
      if (relevantIds.projectId) filters.projectId = relevantIds.projectId;
      if (relevantIds.externalPaperId && !relevantIds.fileId && !relevantIds.projectId) 
        filters.externalPaperId = relevantIds.externalPaperId;
      
      const sessionList = await ResearchService.getSessionsByContext(filters);
      setSessions(sessionList);
      
      // Auto-load the most recent session if we don't have one active
      if (sessionList.length > 0 && !sessionId) {
        handleLoadSession(sessionList[0].id);
      }
      setIsLoadingHistory(false);
    };

    loadSessions();
  }, [isOpen, papers]);

  const handleLoadSession = async (sid: string) => {
    setIsLoadingHistory(true);
    setSessionId(sid);
    setShowHistory(false);
    try {
      const { messages: history } = await ResearchService.getChatSession(sid);
      const formattedMessages: Message[] = history.map((m: any) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(m.created_at),
      }));
      
      if (formattedMessages.length > 0) {
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Failed to load session history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const startNewChat = async () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: isAnnotatorMode
          ? "Hello! I'm your PDF Research Assistant. How can I help you analyze this document today?"
          : "Hello! ask me anything about these papers.",
        timestamp: new Date(),
      },
    ]);
    setSessionId(null);
    setShowHistory(false);
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText ?? input;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    // Ensure session exists
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      try {
        const session = await ResearchService.startChatSession({
          fileId: relevantIds.fileId,
          projectId: relevantIds.projectId,
          externalPaperId: relevantIds.externalPaperId,
        });
        activeSessionId = session.id;
        setSessionId(activeSessionId);
      } catch (err) {
        console.error("Failed to create session:", err);
      }
    }

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setSuggestedQuestions([]);

    try {
      const history = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      if (isAnnotatorMode && annotatorContext) {
        // Special handling for Annotator Mode (Streaming)
        const messagesForApi = history.concat([{ role: "user", content: text }]);
        
        let response: Response;
        if (onAnnotatorChat) {
          response = await onAnnotatorChat(messagesForApi, activeSessionId);
        } else {
          response = await ResearchService.chatWithAnnotator(
            messagesForApi,
            annotatorContext,
            activeSessionId
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const assistantMsgId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          },
        ]);

        const decoder = new TextDecoder();
        let done = false;
        let accumulatedContent = "";

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            accumulatedContent += chunk;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, content: accumulatedContent }
                  : msg
              )
            );
          }
        }
        return;
      }

      let responseText = "";

      if (isPdfOrProjectChat) {
        const pdfPaper = papers.find((p) => p.source === "pdf_upload");
        if (!pdfPaper || !pdfPaper.externalId)
          throw new Error("Invalid document context.");

        if (isProjectChat) {
          responseText = await ResearchService.chatWithProject(
            text,
            pdfPaper.externalId,
            history,
          );
        } else {
          responseText = await ResearchService.chatWithPdf(
            text,
            pdfPaper.externalId,
            history,
          );
        }
      } else {
        const paperIds = papers
          .map((p) => p.externalId || p.paperId)
          .filter(Boolean);
        if (paperIds.length === 0)
          throw new Error("No papers provided context.");

        const response = await ResearchService.chatWithPapers(
          text,
          paperIds,
          history,
        );
        responseText =
          typeof response === "string"
            ? response
            : response?.data || response?.answer || JSON.stringify(response);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseText,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I encountered an error while analyzing the document. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Auto-send when a pendingMessage arrives (e.g. text selected in the doc)
  // Must be placed AFTER handleSend is defined (const is not hoisted)
  useEffect(() => {
    if (pendingMessage && pendingMessage.trim() && !isTyping) {
      handleSend(pendingMessage);
      onQueryConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingMessage, isTyping, handleSend, onQueryConsumed]);

  if (!isOpen) return null;

  return (
    <div className="w-full bg-background flex flex-col h-full relative overflow-hidden">
      {/* Subtle ambient glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="relative shrink-0 px-4 py-3 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground leading-tight">
              {isAnnotatorMode ? "PDF AI Assistant" : "Research Assistant"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isAnnotatorMode 
                ? "Document + Annotations Context" 
                : `${selectedPaperCount} source${selectedPaperCount !== 1 ? "s" : ""} selected`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(!showHistory)}
            className={`h-8 w-8 ${showHistory ? "text-purple-600 bg-purple-50" : "text-muted-foreground"}`}
            title="Chat History">
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={startNewChat}
            className="h-8 w-8 text-muted-foreground hover:text-purple-600"
            title="New Chat">
            <PlusCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* History Panel Overlay */}
      {showHistory && (
        <div className="absolute inset-0 top-[57px] bg-background z-20 flex flex-col border-t border-border animate-in slide-in-from-top duration-200">
          <div className="p-4 border-b border-border bg-white">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Recent Conversations
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading history...
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-muted-foreground">No recent chats for this document.</p>
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleLoadSession(session.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group
                    ${sessionId === session.id 
                      ? "bg-purple-500/10 border border-purple-500/20" 
                      : "hover:bg-muted border border-transparent"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                    ${sessionId === session.id ? "bg-purple-500 text-white" : "bg-muted-foreground/10 text-muted-foreground"}`}>
                    <History className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${sessionId === session.id ? "text-purple-600" : "text-foreground"}`}>
                      {session.title || "Untitled Research Chat"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(session.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-4 border-t border-border bg-white">
            <Button variant="outline" className="w-full text-xs gap-2" onClick={startNewChat}>
              <PlusCircle className="w-3 h-3" /> Start Fresh Chat
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-44 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.map((msg) =>
          msg.role === "assistant" ? (
            <AiBubble key={msg.id} content={msg.content} />
          ) : (
            <UserBubble key={msg.id} content={msg.content} />
          ),
        )}

        {/* Suggested questions */}
        {(loadingQuestions || suggestedQuestions.length > 0) && (
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground px-1">
              Suggested
            </p>
            {loadingQuestions ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating questions...
              </div>
            ) : (
              suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  disabled={isTyping}
                  className="group text-left text-xs px-3.5 py-2.5 rounded-xl
                    border border-border/60 bg-muted/40
                    hover:border-purple-500/40 hover:bg-purple-500/5
                    text-muted-foreground hover:text-foreground
                    transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed
                    flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 group-hover:bg-purple-500 transition-colors" />
                  {q}
                </button>
              ))
            )}
          </div>
        )}

        {isTyping && <TypingIndicator />}
      </div>

      {/* Input area */}
      <div className="absolute bottom-0 left-0 w-full p-4 z-10">
        {/* Frosted glass backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-t border-border pointer-events-none" />

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              selectedPaperCount > 0
                ? "Ask about this document..."
                : "Ask a research question..."
            }
            rows={1}
            className="w-full pr-14 pl-4 py-3 rounded-xl text-sm
              bg-muted/60 border border-border
              focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/60
              resize-none max-h-[120px] min-h-[50px] overflow-y-auto
              text-foreground placeholder:text-muted-foreground
              transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-2.5 bottom-[16px] w-9 h-9
              bg-gradient-to-br from-violet-600 to-indigo-700
              hover:from-violet-500 hover:to-indigo-600
              disabled:from-muted disabled:to-muted disabled:text-muted-foreground
              text-white rounded-lg
              flex items-center justify-center
              transition-all shadow-md shadow-violet-500/20 disabled:shadow-none
              disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2 relative">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
