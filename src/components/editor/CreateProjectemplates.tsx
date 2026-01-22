"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../services/useUser";
import Button from "../auth/Button";
import { useForm } from "react-hook-form";
import FormInput from "../auth/FormInput";
import TemplateService from "../../services/templateService";
import { documentService } from "../../services/documentService";
import { SubscriptionService } from "../../services/subscriptionService";
import {
  X,
  Calendar,
  Beaker,
  BookOpen,
  File,
  FileText,
  Crown,
  Rocket,
  Zap,
  AlertCircle,
} from "lucide-react";

interface CreateProjectTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreate: (project: any) => void;
  isFreeUser?: boolean;
  isStudentUser?: boolean;
  isResearcherUser?: boolean;
  maxProjects?: number; // Maximum projects allowed for the user's plan
  currentProjectCount?: number; // Current number of projects user has
}

export default function CreateProjectTemplates({
  isOpen,
  onClose,
  onProjectCreate,
}: CreateProjectTemplatesProps) {
  const { user, loading: userLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "student" | "researcher">(
    "free",
  );
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Derive user plan flags from the actual user plan state
  const isStudentUser = userPlan === "student";
  const isResearcherUser = userPlan === "researcher";

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
      type: "research-paper",
      citationStyle: "",
      dueDate: "",
      description: "",
    },
    mode: "onChange", // Add this to enable real-time validation
  });

  const watchedFields = watch();
  // Load user's current plan
  useEffect(() => {
    const loadUserPlan = async () => {
      if (user && !userLoading) {
        try {
          const { subscription } = await SubscriptionService.getCurrentSubscription();
          setUserPlan(
            subscription?.plan?.id as "free" | "student" | "researcher" || "free"
          );
        } catch (err) {
          console.error("Failed to load subscription data:", err);
          setUserPlan("free");
        }
      }
    };

    loadUserPlan();
  }, [user, userLoading]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);

      // Refresh subscription data when modal opens
      const refreshSubscriptionData = async () => {
        if (user && !userLoading) {
          try {
            const { subscription } = await SubscriptionService.getCurrentSubscription();
            setUserPlan(
              subscription?.plan?.id as "free" | "student" | "researcher" || "free"
            );
          } catch (err) {
            console.error("Failed to refresh subscription data:", err);
            setUserPlan("free");
          }
        }
      };

      refreshSubscriptionData();

      // Reset form to default values when modal opens
      const defaultValues = {
        name: "",
        type: "research-paper", // Default to research paper
        citationStyle: "",
        dueDate: "",
        description: "",
      };
      reset(defaultValues);
    }
  }, [isOpen, reset, user, userLoading]);

  const projectTypes = [
    {
      id: "research-paper",
      label: "Research Paper",
      icon: BookOpen,
      description: "Academic research with citations and references",
      color: "blue",
      locked: false,
    },
    {
      id: "essay",
      label: "Essay",
      icon: FileText,
      description: "Academic essay or analysis paper",
      color: "purple",
      locked: false,
    },
    {
      id: "lab-report",
      label: "Lab Report",
      icon: Beaker,
      description: "Scientific experiment report with methodology",
      color: "green",
      locked: false, // Removed restriction for free users
    },
    {
      id: "business-proposal",
      label: "Business Proposal",
      icon: File,
      description: "Professional business proposal document",
      color: "blue",
      locked: false,
    },
    {
      id: "research-proposal",
      label: "Research Proposal",
      icon: BookOpen,
      description: "Research proposal for grants or academic funding",
      color: "indigo",
      locked: false,
    },
    {
      id: "journal-entry",
      label: "Journal Entry",
      icon: FileText,
      description: "Personal or academic journal entry",
      color: "green",
      locked: false,
    },
    {
      id: "conference-paper",
      label: "Conference Paper",
      icon: BookOpen,
      description: "Academic paper for conferences",
      color: "purple",
      locked: false,
    },
    {
      id: "literature-review",
      label: "Literature Review",
      icon: BookOpen,
      description: "Comprehensive literature review",
      color: "blue",
      locked: false,
    },
    {
      id: "annotated-bibliography",
      label: "Annotated Bibliography",
      icon: BookOpen,
      description: "Bibliography with annotations",
      color: "indigo",
      locked: false,
    },
    {
      id: "case-study",
      label: "Case Study",
      icon: File,
      description: "In-depth analysis of a specific case",
      color: "pink",
      locked: false, // Removed restriction for paid users
    },
    {
      id: "thesis",
      label: "Thesis",
      icon: BookOpen,
      description: "Dissertation or thesis document",
      color: "indigo",
      locked: false, // Removed restriction for researcher users
    },
    {
      id: "presentation-deck",
      label: "Presentation Deck",
      icon: File,
      description: "Professional presentation deck",
      color: "gray",
      locked: false,
    },
    {
      id: "presentation",
      label: "Presentation",
      icon: File,
      description: "Academic presentation or slideshow",
      color: "gray",
      locked: false,
    },
    {
      id: "blank",
      label: "Blank Document",
      icon: File,
      description: "Start from scratch with no template",
      color: "gray",
      locked: false,
    },
  ];

  // Citation styles
  const citationStyles = [
    { value: "", label: "Select citation style..." },
    { value: "apa-7", label: "APA 7th Edition" },
    { value: "mla-9", label: "MLA 9th Edition" },
    { value: "chicago", label: "Chicago" },
    { value: "harvard", label: "Harvard" },
    {
      value: "ieee",
      label: "IEEE",
      locked: false,
    },
    {
      value: "vancouver",
      label: "Vancouver",
      locked: false,
    },
    {
      value: "ama",
      label: "AMA (American Medical Association)",
      locked: false,
    },
    {
      value: "asa",
      label: "ASA (American Sociological Association)",
      locked: false,
    },
    {
      value: "acs",
      label: "ACS (American Chemical Society)",
      locked: false,
    },
  ];

  interface FormData {
    name: string;
    type: string;
    citationStyle: string;
    dueDate: string;
    description: string;
  }

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (!user) {
      setError("You must be logged in to create a project");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Creating project with user:", user?.id);

      // Prepare project data for API
      const projectData = {
        title: data.name,
        type: data.type,
        citation_style: data.citationStyle, // This will be persisted and used throughout the project
        due_date: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        description: data.description || null,
        status: "draft",
        word_count: 0,
        content: selectedTemplate?.content || null, // Use template content if available
        template_id: selectedTemplate?.id || null, // Include template ID if available
      };

      // Create the project using ProjectService
      console.log("Calling documentService.createProject...");
      const createdProject = await documentService.createProject(
        projectData.title,
        projectData.description || "",
        projectData.content || null
      );
      console.log("Project created successfully:", createdProject);

      // Only call onProjectCreate callback with the actual created project
      if (onProjectCreate) {
        onProjectCreate(createdProject);
      }

      onClose();
    } catch (err: any) {
      console.error("Project creation error:", err);

      if (err.message) {
        setError(`Error: ${err.message}`);
      } else if (err.toString().includes("Unauthorized")) {
        setError("Authentication failed. Please try signing out and back in.");
      } else if (err.toString().includes("NetworkError")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to create project. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  interface HandleTypeSelectProps {
    typeId: string;
  }

  const handleTypeSelect = (typeId: HandleTypeSelectProps["typeId"]) => {
    setValue("type", typeId, { shouldValidate: true });

    // Fetch template based on selected project type
    const fetchTemplate = async () => {
      try {
        const template = await TemplateService.getTemplateByType(typeId);
        if (template) {
          setSelectedTemplate(template);
          // Set citation style from template if available
          if (template.citation_style) {
            setValue("citationStyle", template.citation_style, {
              shouldValidate: true,
            });
          }
        } else {
          setSelectedTemplate(null);
        }
      } catch (error) {
        console.error("Error fetching template by type:", error);
        // Don't show error to user as template might not exist for this type
        setSelectedTemplate(null);
      }
    };

    fetchTemplate();
  };

  // Get plan-specific styling
  const getPlanStyling = () => {
    if (isResearcherUser) {
      return {
        headerBg: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white",
        button:
          "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700",
      };
    } else if (isStudentUser) {
      return {
        headerBg: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white",
        button:
          "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-500 hover:to-cyan-700",
      };
    } else {
      return {
        headerBg: "bg-white text-gray-900 border-b border-gray-200",
        button: "bg-blue-600 hover:bg-blue-700",
      };
    }
  };

  const planStyling = getPlanStyling();

  if (!isOpen) return null;

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
        <p className="text-sm text-gray-500 mt-1">
          Start a new project from scratch or use one of our templates
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <FormInput
              label="Project Name"
              error={errors.name?.message}
              required
              {...register("name", {
                required: "Project name is required",
              })}
              type="text"
              placeholder="Enter project name"
            />
            <p className="text-xs text-gray-500 mt-1">
              Customize the name for your project
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2 mt-1">
                Project Type
              </label>
              <select
                {...register("type")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                onChange={(e) => handleTypeSelect(e.target.value)}>
                {projectTypes.map((type) => (
                  <option
                    key={type.id}
                    value={type.id}
                    disabled={type.locked}>
                    {type.label}
                    {type.locked && " (Premium)"}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-600 flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.type.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2 mt-1">
                Citation Style
              </label>
              <select
                {...register("citationStyle")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900">
                {citationStyles.map((style) => (
                  <option
                    key={style.value}
                    value={style.value}
                    disabled={style.locked}>
                    {style.label}
                    {style.locked && " (Premium)"}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select or change the citation style for your project
              </p>
              {errors.citationStyle && (
                <p className="text-sm text-red-600 flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.citationStyle.message}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2 mt-1">
              Due Date
            </label>
            <div className="relative">
              <input
                {...register("dueDate")}
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              />
              <Calendar className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Set or change the due date for your project
            </p>
            {errors.dueDate && (
              <p className="text-sm text-red-600 flex items-center space-x-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.dueDate.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2 mt-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              placeholder="Describe your project (optional)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add or modify the project description
            </p>
            {errors.description && (
              <p className="text-sm text-red-600 flex items-center space-x-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.description.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Footer - Only Create Button */}
        <div className="pt-4">
          <Button
            type="submit"
            loading={isLoading}
            className="w-full md:w-auto"
            disabled={
              !isValid || isLoading || !watchedFields.name
              // Removed project limit check to allow unlimited project creation
              // hasReachedProjectLimit
            }>
            {isLoading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
