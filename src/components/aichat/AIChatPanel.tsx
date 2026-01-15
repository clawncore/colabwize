import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  X,
  PlusCircle,
  Lightbulb,
  FileText,
  History,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  X as XIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { useToast } from "../../hooks/use-toast";
import { cn } from "../../lib/utils";
import { apiClient } from "../../services/apiClient";
import { supabase } from "../../lib/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIChatPanelProps {
  documentContent: string;
  selectedText?: string;
  projectId?: string; // Added to associate session with project
  projectTitle?: string;
  projectDescription?: string;
  originalityResults?: any;
  citationSuggestions?: any;
  onClose?: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  documentContent,
  selectedText,
  projectId,
  projectTitle,
  projectDescription,
  originalityResults,
  citationSuggestions,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your Academic Integrity Assistant. I can explain citation rules, analyze similarity, and clarify academic policies. **I cannot write or edit text for you.** How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Removed auto-create session on mount to prevent empty historyspam

  const createNewSession = async () => {
    try {
      setShowHistory(false);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! I'm your Academic Integrity Assistant. I can explain citation rules, analyze similarity, and clarify academic policies. **I cannot write or edit text for you.** How can I help?",
        },
      ]);
      setSessionId(null);

      // Use apiClient which handles auth automatically
      const result = await apiClient.post("/api/chat/session", { projectId });

      if (result.success && result.data) {
        setSessionId(result.data.id);
        return result.data.id;
      }
      return null;
    } catch (error) {
      console.error("Failed to create session:", error);
      toast({
        title: "Error",
        description: "Failed to start new chat",
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const result = await apiClient.get("/api/chat/sessions");
      if (result.success) {
        setSessions(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSession = async (sid: string) => {
    try {
      if (editingSessionId) return; // Prevent loading while editing
      setIsLoading(true);
      setSessionId(sid);
      setShowHistory(false);

      const result = await apiClient.get(`/api/chat/session/${sid}`);
      if (result.success && Array.isArray(result.data)) {
        // Transform backend messages to UI format
        const history = result.data.map((msg: any) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
        }));
        setMessages(history);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    try {
      const result = await apiClient.delete(`/api/chat/session/${sid}`, {});
      if (result.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sid));
        if (sessionId === sid) {
          setMessages([]);
          setSessionId(null);
        }
        toast({ title: "Deleted", description: "Chat session deleted" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const startRename = (e: React.MouseEvent, session: any) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title || "Untitled Chat");
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(null);
    setEditTitle("");
  };

  const saveRename = async (e: React.MouseEvent, sid: string) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;

    try {
      const result = await apiClient.patch(`/api/chat/session/${sid}`, {
        title: editTitle,
      });
      if (result.success) {
        setSessions((prev) =>
          prev.map((s) => (s.id === sid ? { ...s, title: editTitle } : s))
        );
        setEditingSessionId(null);
        toast({ title: "Updated", description: "Chat renamed successfully" });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename chat",
        variant: "destructive",
      });
    }
  };

  const toggleHistory = () => {
    if (!showHistory) {
      fetchSessions();
    }
    setShowHistory(!showHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    // Ensure we have a session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await createNewSession();
      if (!currentSessionId) return; // Failed to create session
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Get current auth token for manual fetch
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: messages
            .concat(userMessage)
            .map((m) => ({ role: m.role, content: m.content })),
          context: {
            documentContent,
            selectedText,
            projectTitle,
            projectDescription,
            originalityResults,
            citationSuggestions,
          },
          sessionId: currentSessionId, // Send active session ID
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please sign in");
        }
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, role: "assistant", content: "" },
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
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedContent }
                : msg
            )
          );
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect to AI assistant.",
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full border-l rounded-none shadow-xl w-full">
      <CardHeader className="p-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-indigo-600" />
            Integrity Assistant
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 hover:bg-gray-200",
                showHistory && "bg-gray-200"
              )}
              onClick={toggleHistory}
              title="Chat History">
              <History className="w-4 h-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-gray-200"
              onClick={createNewSession}
              title="New Chat Session">
              <PlusCircle className="w-4 h-4 text-gray-600" />
            </Button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded border border-yellow-100 mt-2 flex gap-1">
          <AlertTriangle className="w-3 h-3 text-yellow-600 mt-0.5 shrink-0" />
          <span>
            Strictly advisory. This assistant <strong>will not</strong> write,
            rewrite, or edit for you. "Explain Mode" only.
          </span>
        </div>

        {/* Quick Explanation Buttons */}
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs px-2 py-1 h-7 bg-blue-500 text-white"
            onClick={() => setInput("Explain why this sentence is marked red")}>
            <Lightbulb className="w-3 h-3 mr-1" /> Explain Red Flag
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs px-2 py-1 h-7 bg-blue-500 text-white"
            onClick={() => setInput("Do I need to cite common knowledge?")}>
            <Lightbulb className="w-3 h-3 mr-1" /> Common Knowledge
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs px-2 py-1 h-7 bg-blue-500 text-white"
            onClick={() => setInput("Explain proper citation format")}>
            <FileText className="w-3 h-3 mr-1" /> Citation Format
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden relative">
        {showHistory ? (
          <ScrollArea className="h-full p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-gray-500 mb-3 uppercase tracking-wider">
                Recent Chats
              </h3>
              {sessions.length === 0 && !isLoading && (
                <p className="text-center text-gray-400 text-sm py-8">
                  No conversation history
                </p>
              )}
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => loadSession(session.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border hover:bg-gray-100 transition-colors text-sm group relative flex items-center justify-between cursor-pointer",
                    sessionId === session.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-100"
                  )}>
                  {editingSessionId === session.id ? (
                    <div
                      className="flex items-center gap-1 w-full"
                      onClick={(e) => e.stopPropagation()}>
                      <input
                        className="flex-1 text-sm border rounded px-1 py-0.5"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => saveRename(e, session.id)}
                        className="p-1 hover:text-green-600">
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="p-1 hover:text-red-600">
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="overflow-hidden flex-1">
                        <div className="font-medium truncate pr-6">
                          {session.title || "Untitled Chat"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-gray-200">
                              <MoreVertical className="w-3 h-3 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => startRename(e, session)}>
                              <Edit2 className="w-3 h-3 mr-2" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => deleteSession(e, session.id)}
                              className="text-red-600 focus:text-red-600">
                              <Trash2 className="w-3 h-3 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-2 max-w-[85%]",
                    message.role === "user"
                      ? "ml-auto flex-row-reverse"
                      : "mr-auto"
                  )}>
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === "user"
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-gray-100 text-gray-600"
                    )}>
                    {message.role === "user" ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm",
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    )}>
                    <div className="prose prose-sm max-w-none break-words dark:prose-invert">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => (
                            <p
                              className="mb-2 last:mb-0 leading-relaxed"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc pl-5 mb-2 space-y-1 block"
                              {...props}
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              className="list-decimal pl-5 mb-2 space-y-1 block"
                              {...props}
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="pl-1 mb-0.5" {...props} />
                          ),
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-lg font-bold mb-2 mt-4"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-base font-bold mb-2 mt-3"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              className="text-sm font-bold mb-1 mt-2"
                              {...props}
                            />
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-medium hover:text-indigo-300 transition-colors"
                              {...props}
                            />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-indigo-300 pl-3 italic my-2 text-gray-500"
                              {...props}
                            />
                          ),
                          code: ({
                            node,
                            className,
                            children,
                            ...props
                          }: any) => {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            return !className?.includes("language-") ? (
                              <code
                                className="bg-muted/50 px-1.5 py-0.5 rounded font-mono text-xs border border-muted"
                                {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-400 text-xs ml-10">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex w-full gap-2 items-end">
          <Textarea
            ref={textareaRef}
            placeholder={
              selectedText
                ? "Ask about selection..."
                : "Ask a question (Shift+Enter for new line)..."
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 min-h-[44px] max-h-[200px] resize-none py-3 overflow-hidden"
            rows={1}
            style={{
              overflowY:
                textareaRef.current && textareaRef.current.scrollHeight > 200
                  ? "auto"
                  : "hidden",
            }}
          />
          <Button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            size="icon"
            disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
