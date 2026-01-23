"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../services/useUser";
import Button from "../auth/Button";
import { useForm } from "react-hook-form";
import { getTemplateByType } from "../../templates";
import { documentService } from "../../services/documentService";
import {
  Calendar,
  BookOpen,
  File,
  FileText,
  AlertCircle,
  GraduationCap,
  Library,
  ScrollText,
} from "lucide-react";

interface CreateProjectTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreate: (project: any) => void;
  isFreeUser?: boolean;
  isStudentUser?: boolean;
  isResearcherUser?: boolean;
  maxProjects?: number;
  currentProjectCount?: number;
}

export default function CreateProjectTemplates({
  isOpen,
  onClose,
  onProjectCreate,
}: CreateProjectTemplatesProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // New State: "null" by default to force user choice
  const [startMode, setStartMode] = useState<"blank" | "template" | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      type: "", // No default type to ensure form is hidden initially
      dueDate: "",
      description: "",
    },
    mode: "onChange",
  });

  const watchType = watch("type");
  const watchedFields = watch();

  useEffect(() => {
    if (isOpen) {
      setError(null);
      const defaultValues = {
        name: "",
        type: "",
        dueDate: "",
        description: "",
      };
      reset(defaultValues);
      setStartMode(null); // Reset to no selection
      setSelectedTemplate(null);
    }
  }, [isOpen, reset]);

  const projectTypes = [
    // Filtered for MVP
    {
      id: "research-paper",
      name: "Research Paper",
      description: "Standard structure for academic research.",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "literature-review",
      name: "Literature Review",
      description: "Analyze and synthesize existing research.",
      icon: BookOpen,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "research-proposal",
      name: "Research Proposal",
      description: "Outline your proposed research project.",
      icon: ScrollText,
      color: "bg-teal-100 text-teal-600",
    },
    {
      id: "thesis",
      name: "Thesis",
      description: "Full structure for master's thesis or dissertation.",
      icon: GraduationCap,
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  interface FormData {
    name: string;
    type: string;
    dueDate: string;
    description: string;
  }

  const onSubmit = async (data: FormData) => {
    if (!user) {
      setError("You must be logged in to create a project");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Logic to handle "blank" mode actually using "blank" type
      const finalType = startMode === 'blank' ? 'blank' : data.type;

      // CRITICAL FIX: Ensure template is loaded if in template mode
      if (startMode === 'template' && !selectedTemplate) {
        setError("Template failed to load. Please try again or choose 'Blank Document'.");
        setIsLoading(false);
        return;
      }

      // ARCHITECTURAL FIX: Inject template content at creation time, not navigation time
      // This makes content persistent in the database from the start
      const initialContent = startMode === 'blank'
        ? null
        : selectedTemplate?.content || null;

      // Create project with template content already injected
      const result = await documentService.createProject(
        data.name,
        data.description || "",
        initialContent
      );

      if (result.success && result.data) {
        // Navigate to editor - content is already saved in backend
        // No router state needed (was fragile, ephemeral, broke on refresh)
        navigate(`/editor/${result.data.id}`);

        if (onProjectCreate) {
          onProjectCreate(result.data); // Pass proper Project object
        }
        onClose();
      } else {
        throw new Error(result.error || "Failed to create project");
      }
    } catch (err: any) {
      console.error("Project creation error:", err);
      // ... existing error handling
      if (err.message) {
        setError(`Error: ${err.message}`);
      } else if (err.toString().includes("Unauthorized")) {
        setError("Authentication failed. Please try signing out and back in.");
      } else {
        setError("Failed to create project. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleModeSelect = (mode: "blank" | "template") => {
    setStartMode(mode);
    if (mode === "blank") {
      setValue("type", "blank", { shouldValidate: true });
      setSelectedTemplate(null);
    } else {
      // Template mode: Clear type so form hides until distinct selection
      setValue("type", "", { shouldValidate: true });
      setSelectedTemplate(null);
    }
  };

  const handleTypeSelect = (typeId: string) => {
    setValue("type", typeId, { shouldValidate: true });

    if (typeId === "blank") {
      // Should not happen in new UI logic for template grid
      setSelectedTemplate(null);
      return;
    }

    // Get template from frontend registry (synchronous - no API call)
    const template = getTemplateByType(typeId);
    if (template) {
      setSelectedTemplate(template);
    } else {
      console.warn(`Template not found for type: ${typeId}`);
      setSelectedTemplate(null);
    }
  };

  // Helper for Skeleton Preview - Made smaller/compact
  const TemplatePreviewSkeleton = () => (
    <div className="w-full h-24 bg-gray-50 border-b border-gray-100 flex flex-col gap-1.5 p-2 overflow-hidden opacity-50">
      <div className="h-1.5 w-1/3 bg-gray-200 rounded-sm"></div>
      <div className="h-1 w-full bg-gray-100 rounded-sm mt-1"></div>
      <div className="h-1 w-full bg-gray-100 rounded-sm"></div>
      <div className="h-1 w-2/3 bg-gray-100 rounded-sm"></div>
      <div className="mt-auto h-1 w-1/4 bg-gray-200 rounded-sm"></div>
    </div>
  );


  if (!isOpen) return null;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Create New Project</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Choose a starting point for your document.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* 1. STARTING MODE SELECTION - Compact Horizontal */}
        {/* 1. STARTING MODE SELECTION - Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Blank */}
          <div
            onClick={() => handleModeSelect("blank")}
            className={`group relative h-32 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${startMode === "blank"
              ? "border-blue-600 shadow-lg ring-2 ring-blue-100"
              : "border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-md"
              }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src="/images/templates/blank.png"
                alt="Blank"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className={`absolute inset-0 transition-colors ${startMode === "blank" ? "bg-blue-900/10" : "bg-white/40 group-hover:bg-white/20"}`} />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
            </div>

            <div className="relative z-10 h-full p-6 flex flex-col justify-center max-w-[70%]">
              <div className="flex items-center gap-3 mb-1">
                <div className={`p-2 rounded-lg ${startMode === "blank" ? "bg-blue-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}>
                  <File className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Start Blank</h3>
              </div>
              <p className="text-sm text-gray-600 pl-1">Start from a clean slate. Best for custom writing.</p>
            </div>

            {/* Selection Indicator */}
            {startMode === "blank" && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white p-1.5 rounded-full shadow-md animate-in zoom-in">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>

          {/* Use Template */}
          <div
            onClick={() => handleModeSelect("template")}
            className={`group relative h-32 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${startMode === "template"
              ? "border-blue-600 shadow-lg ring-2 ring-blue-100"
              : "border-gray-100 shadow-sm hover:border-purple-300 hover:shadow-md"
              }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src="/images/templates/research-paper.png"
                alt="Templates"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
            </div>

            <div className="relative z-10 h-full p-6 flex flex-col justify-center max-w-[70%]">
              <div className="flex items-center gap-3 mb-1">
                <div className={`p-2 rounded-lg ${startMode === "template" ? "bg-purple-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">Use a Template</h3>
              </div>
              <p className="text-sm text-gray-600 pl-1">Choose from structured academic formats.</p>
            </div>

            {startMode === "template" && (
              <div className="absolute top-4 right-4 bg-purple-600 text-white p-1.5 rounded-full shadow-md animate-in zoom-in">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            )}
          </div>
        </div>


        {/* 2. VISUAL TEMPLATE GALLERY (Only if Template Mode) - 4 Columns */}
        {startMode === "template" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Templates</label>
            </div>

            {/* Premium Template Selection Grid with Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {projectTypes.map((type) => {
                const isSelected = watchType === type.id;
                // Map ID to image filename
                const images: any = {
                  "research-paper": "/images/templates/research-paper.png",
                  "literature-review": "/images/templates/literature-review.png",
                  "research-proposal": "/images/templates/research-proposal.png",
                  "thesis": "/images/templates/thesis.png",
                };

                return (
                  <div
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className={`group relative rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden flex flex-col h-full hover:shadow-xl hover:-translate-y-1 ${isSelected
                      ? "border-blue-600 ring-2 ring-blue-100 shadow-lg"
                      : "border-gray-100 bg-white hover:border-blue-200"
                      }`}
                  >
                    {/* Image Cover */}
                    <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                      <img
                        src={images[type.id]}
                        alt={type.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Checkmark Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 z-20 bg-blue-600 text-white p-1 rounded-full shadow-lg animate-in zoom-in">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col bg-white relative z-20">
                      <div className="flex items-start gap-2 mb-1">
                        <h3 className={`font-bold text-sm leading-tight ${isSelected ? "text-blue-700" : "text-gray-900 group-hover:text-blue-700 transition-colors"}`}>
                          {type.name}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coming Soon */}
            <div className="text-center pt-2">
              <span
                className="text-[10px] text-gray-400 cursor-help border-b border-dotted border-gray-300 hover:text-gray-600 transition-colors"
                title="Template marketplace coming post-MVP"
              >
                + Template Marketplace (Coming Soon)
              </span>
            </div>
          </div>
        )}

        {/* 3. PROJECT DETAILS FORM (Conditional) */}
        {(startMode === "blank" || (startMode === "template" && watchType)) && (
          <div className="pt-5 border-t border-gray-100 animate-in fade-in duration-500">

            <div className="grid grid-cols-12 gap-5">
              {/* Left Col: Inputs */}
              <div className="col-span-12 md:col-span-9 space-y-4">
                {/* Project Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Project Name</label>
                  <input
                    {...register("name", { required: "Project name is required" })}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
                    placeholder={startMode === 'blank' ? "Untitled Document" : `${projectTypes.find(t => t.id === watchType)?.name || 'Project'} Draft`}
                  />
                </div>

                {/* Due Date & Description */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Due Date <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <div className="relative">
                      <input
                        {...register("dueDate")}
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
                      />
                      <Calendar className="absolute right-3 top-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input
                      {...register("description")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 text-sm"
                      placeholder="Brief notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Right Col: Action */}
              <div className="col-span-12 md:col-span-3 flex flex-col justify-end">
                {/* Error message (Absolute/Floating or stacked) */}
                {error && (
                  <div className="mb-3 bg-red-50 border border-red-200 rounded p-2 text-xs text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="line-clamp-2 leading-tight">{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={isLoading}
                  className="w-full h-10 text-sm"
                  disabled={!isValid || isLoading || !watchedFields.name}
                >
                  {isLoading ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
