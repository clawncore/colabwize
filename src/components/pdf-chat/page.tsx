"use client";

import React, { useState } from "react";
import {
  FileText,
  ArrowRight,
  Loader2,
  Sparkles,
  Quote,
  HelpCircle,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { documentService } from "../../services/documentService";
import { apiClient } from "../../services/apiClient";
import { useSubscriptionStore } from "../../stores/useSubscriptionStore";
import { PlanRestrictionCover } from "../subscription/PlanRestrictionCover";
import { UpgradePromptDialog } from "../subscription/UpgradePromptDialog";

interface PdfDocument {
  id: string;
  filename: string;
  status: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  word_count: number;
  created_at: string;
}

export default function PdfUploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState<"pdfs" | "projects">("pdfs");

  // Upgrade Dialog state
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<
    "pdf_limit" | "pdf_size_limit"
  >("pdf_limit");

  // Subscription data
  const { plan: rawPlan } = useSubscriptionStore();
  const plan = rawPlan?.toLowerCase() || "free";

  const isPlus = plan === "plus" || plan === "student";
  const isPremium = plan === "premium" || plan === "researcher";

  const canAccessPdfChat = isPlus || isPremium;
  const canAccessProjectChat = isPremium;

  React.useEffect(() => {
    const fetchPdfs = async () => {
      setLoadingPdfs(true);
      try {
        const response = await apiClient.get("/api/pdf");

        if (response.success && response.data) {
          setPdfs(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch PDFs", err);
      } finally {
        setLoadingPdfs(false);
      }
    };

    const fetchProjects = async () => {
      try {
        const response = await documentService.getProjects();
        if (response.success && response.data) {
          setProjects(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchPdfs();
    fetchProjects();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    // Client-side size validation based on plan
    const sizeMB = file.size / (1024 * 1024);
    const sizeLimit = isPremium ? 100 : 50;
    if (sizeMB > sizeLimit) {
      setUpgradeFeature("pdf_size_limit");
      setShowUpgradeDialog(true);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post("/api/pdf/upload", formData);

      if (!response.success) {
        if (response.error === "PDF_LIMIT_REACHED") {
          setUpgradeFeature("pdf_limit");
          setShowUpgradeDialog(true);
          return;
        }
        if (response.error === "FILE_SIZE_EXCEEDED") {
          setUpgradeFeature("pdf_size_limit");
          setShowUpgradeDialog(true);
          return;
        }
        throw new Error(response.error || "Upload failed");
      }

      navigate(
        `/dashboard/pdf-chat/${response.data.documentId}?name=${encodeURIComponent(
          file.name,
        )}`,
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.message || "Failed to upload PDF. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] relative bg-background">
      <UpgradePromptDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        feature={upgradeFeature}
      />
      {/* Background Decorations - Cloud/Wave Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen filter" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen filter" />
        <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] bg-indigo-100/40 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-60 mix-blend-multiply dark:mix-blend-screen filter" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full mx-auto px-6 py-12 flex flex-col items-center">
        {/* Top-Level Tabs */}
        <div className="w-full max-w-xl flex items-center justify-center p-1.5 bg-background border border-border rounded-[1.25rem] shadow-sm mb-12">
          <button
            onClick={() => setActiveTab("pdfs")}
            className={`flex-1 px-6 py-3 font-medium text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "pdfs"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50 border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}>
            <FileText className="w-4 h-4" />
            Chat with PDF
            {!canAccessPdfChat && (
              <Lock className="w-3 h-3 text-muted-foreground/60" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`flex-1 px-6 py-3 font-medium text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "projects"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50 border border-blue-200 dark:border-blue-800"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            }`}>
            <Sparkles className="w-4 h-4" />
            Chat with My Projects
            {!canAccessProjectChat && (
              <Lock className="w-3 h-3 text-muted-foreground/60" />
            )}
          </button>
        </div>

        {/* --- PDF UPLOAD TAB VIEW --- */}
        {activeTab === "pdfs" && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {!canAccessPdfChat && (
              <PlanRestrictionCover
                requiredPlan="Plus"
                featureName="PDF Chat"
                featureDescription="Upload, analyze, and chat with any PDF document to get instant summaries and insights."
              />
            )}
            <div
              className={
                !canAccessPdfChat
                  ? "opacity-60 pointer-events-none w-full flex flex-col items-center"
                  : "w-full flex flex-col items-center"
              }>
              {/* Header Section */}
              <div className="text-center mb-10 max-w-2xl">
                <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                  Chat with any PDF
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Upload your documents to summarize, analyze, and ask questions
                  instantly.
                </p>
              </div>

              {/* Upload Card */}
              <div className="w-full max-w-4xl relative mb-8">
                {/* Floating Icons Decor */}
                <div className="absolute -top-8 -left-8 animate-bounce delay-700 hidden md:block">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-2xl shadow-sm transform -rotate-12">
                    <span className="text-2xl">💬</span>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 animate-bounce delay-100 hidden md:block">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl shadow-sm transform rotate-6">
                    <span className="text-2xl">⚙️</span>
                  </div>
                </div>

                <label
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  htmlFor="pdf-upload"
                  className={`
                    relative flex flex-col items-center justify-center 
                    w-full aspect-[2/1] md:aspect-[2.5/1] max-h-[400px]
                    bg-card/80 backdrop-blur-sm
                    border-2 border-dashed rounded-[2rem]
                    transition-all duration-300 ease-in-out cursor-pointer
                    shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                    ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.01] shadow-xl ring-4 ring-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-card/90 hover:shadow-lg"
                    }
                  `}>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    id="pdf-upload"
                    onChange={handleFileSelect}
                  />

                  {isUploading ? (
                    <div className="flex flex-col items-center animate-pulse">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        Processing Document...
                      </h3>
                      <p className="text-muted-foreground">
                        Analyzing structure and extracting insights
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center p-8">
                      {/* Central Icon Illustration */}
                      <div className="mb-6 relative">
                        <div className="w-20 h-24 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700/50 rounded-lg shadow-sm flex items-center justify-center transform -rotate-3 mb-2 mx-auto">
                          <div className="w-12 h-1 bg-blue-200 dark:bg-blue-700 rounded-full mb-2"></div>
                          <div className="w-8 h-1 bg-blue-200 dark:bg-blue-700 rounded-full"></div>
                        </div>
                        <div className="absolute bottom-[-10px] right-[-10px] bg-primary text-primary-foreground p-2 rounded-full shadow-md">
                          <ArrowRight className="w-5 h-5 transform -rotate-45" />
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        Drop PDF here or click to upload
                      </h3>
                      <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                        Supports research papers, agreements, contracts, and
                        books from your computer.
                      </p>

                      <div className="px-8 py-3 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-xl transition-colors flex items-center gap-2">
                        Select File <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pb-12">
                <div className="bg-card p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-border hover:shadow-lg transition-all hover:-translate-y-1 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Smart Summaries
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">
                    Get instant overviews of long papers. Understand key points
                    in seconds.
                  </p>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-border hover:shadow-lg transition-all hover:-translate-y-1 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                    <Quote className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Citation Extraction
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">
                    Automatically find and verify references included in the
                    document.
                  </p>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-border hover:shadow-lg transition-all hover:-translate-y-1 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Q&A Assistant
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">
                    Ask specific questions about methods, results, or any detail
                    in the text.
                  </p>
                </div>
              </div>

              {/* PDFs List */}
              <div className="w-full max-w-4xl mt-8 mb-8">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  Recent PDFs ({pdfs.length})
                </h2>
                {loadingPdfs ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : pdfs.length === 0 ? (
                  <div className="text-center p-12 bg-card rounded-3xl border border-border shadow-sm">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                      No PDFs yet
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Upload a PDF to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {pdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        onClick={() =>
                          navigate(
                            `/dashboard/pdf-chat/${pdf.id}?name=${encodeURIComponent(
                              pdf.filename,
                            )}&type=pdf`,
                          )
                        }
                        className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden">
                        <div className="absolute left-0 top-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">
                              {pdf.filename}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>
                                {new Date(pdf.created_at).toLocaleString(
                                  undefined,
                                  {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- PROJECTS TAB VIEW --- */}
        {activeTab === "projects" && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {!canAccessProjectChat && (
              <PlanRestrictionCover
                requiredPlan="Premium"
                featureName="Project Intelligence"
                featureDescription="Harness the full power of your existing projects with deep context-aware chat and multi-document analysis."
              />
            )}
            <div
              className={
                !canAccessProjectChat
                  ? "opacity-60 pointer-events-none w-full flex flex-col items-center"
                  : "w-full flex flex-col items-center"
              }>
              {/* Header Section */}
              <div className="text-center mb-10 max-w-2xl mt-4">
                <h1 className="text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                  Chat with your research papers
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Unlock deeper insights into your own written projects with an
                  AI assistant that knows every word.
                </p>
              </div>

              {/* Feature Cards (Projects) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-16 mt-4">
                <div className="bg-card p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-border hover:shadow-lg transition-all hover:-translate-y-1 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Deep Context
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">
                    AI understands your unique project structure, arguments, and
                    specific terminology.
                  </p>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-border hover:shadow-lg transition-all hover:-translate-y-1 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 rounded-2xl flex items-center justify-center mb-6 text-sky-600 dark:text-sky-400">
                    <Quote className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Knowledge Base
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">
                    Turn your scattered projects into a searchable,
                    conversational knowledge hub.
                  </p>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-border hover:shadow-lg transition-all hover:-translate-y-1 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mb-6 text-rose-600 dark:text-rose-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Instant Answers
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px]">
                    Select text from your document to instantly ask AI for
                    clarification or expansion.
                  </p>
                </div>
              </div>

              {/* Projects List */}
              <div className="w-full max-w-4xl mb-8">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-4">
                  <FileText className="w-5 h-5 text-primary" />
                  Your Projects ({projects.length})
                </h2>
                {loadingProjects ? (
                  <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center p-12 bg-card rounded-3xl border border-border shadow-sm">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                      No projects yet
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      Create a document in the editor to see it here.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() =>
                          navigate(
                            `/dashboard/pdf-chat/${project.id}?name=${encodeURIComponent(
                              project.title,
                            )}&type=project`,
                          )
                        }
                        className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden">
                        <div className="absolute left-0 top-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-lg">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>
                                {new Date(project.created_at).toLocaleString(
                                  undefined,
                                  {
                                    dateStyle: "medium",
                                  },
                                )}
                              </span>
                              <span>•</span>
                              <span>
                                {project.word_count.toLocaleString()} words
                              </span>
                            </div>
                            {project.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
