import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Play,
  BookOpen,
  Users,
  FileText,
  Zap,
} from "lucide-react";

const QuickStartPage = () => {
  const steps = [
    {
      id: 1,
      title: "Create Your Account",
      description: "Sign up for a free ColabWize account to get started",
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      time: "2 minutes",
    },
    {
      id: 2,
      title: "Complete Your Profile",
      description: "Set up your academic profile and preferences",
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      time: "3 minutes",
    },
    {
      id: 3,
      title: "Create Your First Project",
      description: "Start a new academic project or import existing work",
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      time: "5 minutes",
    },
    {
      id: 4,
      title: "Use AI Writing Assistant",
      description: "Enhance your writing with our AI-powered tools",
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      time: "Ongoing",
    },
    {
      id: 5,
      title: "Check for Plagiarism",
      description: "Ensure academic integrity with our plagiarism checker",
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      time: "5 minutes",
    },
    {
      id: 6,
      title: "Export Your Work",
      description: "Download your project in various academic formats",
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      time: "2 minutes",
    },
  ];

  const features = [
    {
      icon: <Play className="h-8 w-8 text-blue-600" />,
      title: "Video Tutorials",
      description: "Step-by-step video guides for each feature",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      title: "Documentation",
      description: "Comprehensive written guides and best practices",
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Community",
      description: "Connect with other students and researchers",
    },
    {
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      title: "Templates",
      description: "Academic templates for various document types",
    },
    {
      icon: <Zap className="h-8 w-8 text-red-600" />,
      title: "AI Tools",
      description: "Powerful AI assistance for writing and research",
    },
  ];

  return (
    <div className="min-h-screen px-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="container-custom py-6">
          {/* Hero Section */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Getting Started Steps</h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.id} className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    {step.icon}
                  </div>
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold">
                      Step {step.id}: {step.title}
                    </h3>
                    <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {step.time}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mr-4 mt-1">{feature.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
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
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
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

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <p className="text-gray-600 mb-6">
          After completing the quick start guide, we recommend exploring these
          advanced features:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/study-groups"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <Users className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-semibold">Study Groups</h3>
            <p className="text-sm text-gray-600 mt-1">
              Work with peers and advisors
            </p>
          </Link>

          <Link
            to="/analytics"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <Zap className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-semibold">Advanced Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">
              Track your writing progress
            </p>
          </Link>

          <Link
            to="/templates"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <FileText className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-semibold">Templates</h3>
            <p className="text-sm text-gray-600 mt-1">
              Professional academic templates
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickStartPage;
