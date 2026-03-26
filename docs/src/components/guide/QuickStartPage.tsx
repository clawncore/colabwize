import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Play,
  BookOpen,
  Users,
  FileText,
  Zap,
  ChevronDown,
  ChevronRight,
  UserPlus,
  User,
  FolderPlus,
  Sparkles,
  ShieldCheck,
  Download,
  ExternalLink,
} from "lucide-react";

const QuickStartPage = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 1,
      title: "Create Your Account",
      description: "Sign up for a free ColabWize account to get started",
      icon: <UserPlus className="h-6 w-6" />,
      time: "2 minutes",
      link: "/account-setup",
      details: [
        "Click 'Sign Up' on the homepage",
        "Enter your email and create a password",
        "Or sign up with Google/GitHub",
        "Verify your email address",
      ],
      tip: "Use your .edu email to qualify for student discounts",
    },
    {
      id: 2,
      title: "Complete Your Profile",
      description: "Set up your academic profile and preferences",
      icon: <User className="h-6 w-6" />,
      time: "3 minutes",
      link: "/profile",
      details: [
        "Add your institution name",
        "Select your academic level",
        "Choose your field of study",
        "Set your preferred citation style",
      ],
      tip: "A complete profile helps us provide better suggestions",
    },
    {
      id: 3,
      title: "Create Your First Project",
      description: "Start a new academic project or import existing work",
      icon: <FolderPlus className="h-6 w-6" />,
      time: "5 minutes",
      link: "/account",
      details: [
        "Click 'New Project' from the dashboard",
        "Choose a project type (essay, research paper, etc.)",
        "Upload your document or start from scratch",
        "Give your project a descriptive name",
      ],
      tip: "You can import Word docs, PDFs, or Google Docs",
    },
    {
      id: 4,
      title: "Use AI Writing Assistant",
      description: "Enhance your writing with our AI-powered tools",
      icon: <Sparkles className="h-6 w-6" />,
      time: "Coming Soon",
      link: "/originality",
      comingSoon: true,
      details: [
        "Select text you want to improve",
        "Click the AI Assistant button",
        "Choose from suggestions or request custom help",
        "Accept, modify, or reject suggestions",
      ],
      tip: "This feature is currently in beta - join the waitlist to get early access",
    },
    {
      id: 5,
      title: "Check for Plagiarism",
      description: "Ensure academic integrity with our plagiarism checker",
      icon: <ShieldCheck className="h-6 w-6" />,
      time: "Coming Soon",
      link: "/originality",
      comingSoon: true,
      details: [
        "Open your project",
        "Click 'Run Originality Scan'",
        "Wait for the scan to complete",
        "Review highlighted matches and sources",
      ],
      tip: "This feature is currently in beta - join the waitlist to get early access",
    },
    {
      id: 6,
      title: "Export Your Work",
      description: "Download your project in various academic formats",
      icon: <Download className="h-6 w-6" />,
      time: "2 minutes",
      link: "/certificates",
      details: [
        "Click 'Export' in your project",
        "Choose format (PDF, DOCX, etc.)",
        "Generate certificate if needed",
        "Download or share directly",
      ],
      tip: "Certificates prove your work's originality",
    },
  ];

  const features = [
    {
      icon: <Play className="h-8 w-8 text-blue-600" />,
      title: "Video Tutorials",
      description: "Step-by-step video guides for each feature",
      link: "/quickstart",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      title: "Documentation",
      description: "Comprehensive written guides and best practices",
      link: "/",
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Community",
      description: "Connect with other Plus users and Pros",
      link: "https://discord.gg/2MMSdX3Uee",
      external: true,
    },
    {
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      title: "Templates",
      description: "Academic templates for various document types",
      link: "/templates",
    },
    {
      icon: <Zap className="h-8 w-8 text-red-600" />,
      title: "AI Tools",
      description: "Powerful AI assistance for writing and research",
      link: "/originality",
    },
  ];

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const toggleComplete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen px-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container-custom py-6">
          <Link to="/" className="inline-flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documentation
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Quick Start Guide</h1>
            <p className="text-lg text-gray-600">
              Get up and running with ColabWize in under 30 minutes
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Before You Begin</h2>
        <p className="text-blue-800 mb-4">
          This guide will walk you through the essential steps to start using
          ColabWize effectively. No prior experience is required - just a
          willingness to improve your academic writing.
        </p>
        <div className="flex items-center text-sm text-blue-700">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-3">
            Estimated time: 30 minutes
          </span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Beginner friendly
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {completedSteps.length} of {steps.length} steps
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((completedSteps.length / steps.length) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(completedSteps.length / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Getting Started Steps */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Getting Started Steps</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`border rounded-xl overflow-hidden transition-all ${
                  completedSteps.includes(index)
                    ? "border-green-300 bg-green-50"
                    : expandedStep === index
                    ? "border-blue-300 shadow-md"
                    : step.comingSoon
                    ? "border-purple-200 bg-purple-50"
                    : "border-gray-200"
                }`}>
                {/* Step Header */}
                <button
                  onClick={() => toggleStep(index)}
                  className="w-full flex items-center p-4 text-left hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 mr-4">
                    {completedSteps.includes(index) ? (
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-500 text-white">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    ) : (
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full ${
                          step.comingSoon
                            ? "bg-purple-100 text-purple-600"
                            : "bg-blue-100 text-blue-600"
                        }`}>
                        {step.icon}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-lg font-semibold ${
                          completedSteps.includes(index)
                            ? "text-green-700 line-through"
                            : step.comingSoon
                            ? "text-gray-500"
                            : ""
                        }`}>
                        {step.title}
                      </h3>
                      {step.comingSoon && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          Coming Soon
                        </span>
                      )}
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={(e) => toggleComplete(index, e)}
                      className={`p-2 rounded-lg transition-colors ${
                        completedSteps.includes(index)
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600"
                      }`}
                      title={
                        completedSteps.includes(index)
                          ? "Mark incomplete"
                          : "Mark complete"
                      }>
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    {expandedStep === index ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedStep === index && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    <div className="ml-14">
                      <h4 className="font-medium text-gray-700 mb-3">
                        How to do this:
                      </h4>
                      <ul className="space-y-2 mb-4">
                        {step.details.map((detail, dIndex) => (
                          <li key={dIndex} className="flex items-start text-sm">
                            <span className="text-blue-500 mr-2">•</span>
                            <span className="text-gray-600">{detail}</span>
                          </li>
                        ))}
                      </ul>
                      {step.tip && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-yellow-800">
                            <strong>Tip:</strong> {step.tip}
                          </p>
                        </div>
                      )}
                      <Link
                        to={step.link}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Learn more
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="space-y-4">
            {features.map((feature, index) =>
              feature.external ? (
                <a
                  key={index}
                  href={feature.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="flex-shrink-0 mr-4 mt-1 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex items-center ml-2">
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </a>
              ) : (
                <Link
                  key={index}
                  to={feature.link}
                  className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all group">
                  <div className="flex-shrink-0 mr-4 mt-1 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex items-center ml-2">
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </Link>
              )
            )}
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
            <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
            <p className="mb-4 opacity-90">
              Our support team is available 24/7 to help you get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/contact-support"
                className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors justify-center">
                Contact Support
              </Link>
              <a
                href="https://discord.gg/2MMSdX3Uee"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors justify-center border border-white/20">
                <Users className="h-4 w-4 mr-2" />
                Join Community
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <p className="text-gray-600 mb-6">
          After completing the quick start guide, explore these features:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/citations"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
            <BookOpen className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
              Citation Confidence
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Analyze and improve your citations
            </p>
          </Link>

          <Link
            to="/analytics"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
            <Zap className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
              Advanced Analytics
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Track your writing progress
            </p>
          </Link>

          <Link
            to="/certificates"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
            <FileText className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
              Certificates
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Generate authorship certificates
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickStartPage;
