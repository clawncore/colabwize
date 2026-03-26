import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Shield,
  RefreshCw,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Settings,
  Play,
  Copy,
  ExternalLink,
  Apple,
} from "lucide-react";

const InstallationPage = () => {
  const [activePlatform, setActivePlatform] = useState("web");
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const platforms = [
    {
      id: "web",
      icon: <Globe className="h-6 w-6" />,
      title: "Web Browser",
      description: "No install needed - use in browser",
    },
    {
      id: "desktop",
      icon: <Monitor className="h-6 w-6" />,
      title: "Desktop",
      description: "Windows, macOS, Linux",
    },
    {
      id: "mobile",
      icon: <Smartphone className="h-6 w-6" />,
      title: "Mobile",
      description: "iOS & Android",
    },
    {
      id: "tablet",
      icon: <Tablet className="h-6 w-6" />,
      title: "Tablet",
      description: "iPad & Android tablets",
    },
  ];

  const platformSteps: Record<string, any[]> = {
    web: [
      {
        title: "Open Your Browser",
        description: "Use Chrome, Firefox, Safari, or Edge",
        details: [
          "Make sure your browser is up to date",
          "Enable JavaScript in browser settings",
          "Allow cookies for colabwize.com",
        ],
        tip: "Chrome or Firefox recommended for best experience",
      },
      {
        title: "Go to ColabWize",
        description: "Navigate to app.colabwize.com",
        details: [
          "Type app.colabwize.com in your address bar",
          "Bookmark the page for quick access",
          "You can also install it as a PWA (see below)",
        ],
        tip: "Add to home screen for app-like experience",
      },
      {
        title: "Create Your Account",
        description: "Sign up with email or social login",
        details: [
          "Click 'Sign Up' on the homepage",
          "Enter your email and create a password",
          "Or sign up with Google/GitHub",
          "Verify your email address",
        ],
        tip: "Use your .edu email for student discounts",
        link: { text: "Account Setup Guide", url: "/account-setup" },
      },
      {
        title: "Start Using ColabWize",
        description: "You're ready to go!",
        details: [
          "Complete your profile for personalized experience",
          "Create your first project",
          "Explore the features",
        ],
        tip: "Check out the Quick Start Guide for a walkthrough",
        link: { text: "Quick Start Guide", url: "/quickstart" },
      },
    ],
    desktop: [
      {
        title: "Download the App",
        description: "Get the installer for your OS",
        details: [
          "Visit app.colabwize.com/download",
          "Choose your operating system:",
          "  - Windows: .exe installer",
          "  - macOS: .dmg file",
          "  - Linux: .AppImage or .deb",
        ],
        tip: "The download should start automatically",
      },
      {
        title: "Run the Installer",
        description: "Follow the installation wizard",
        details: [
          "Double-click the downloaded file",
          "Windows: Click 'Yes' if prompted by UAC",
          "macOS: Drag app to Applications folder",
          "Linux: Make executable and run",
        ],
        tip: "macOS users may need to allow app in Security settings",
      },
      {
        title: "Launch ColabWize",
        description: "Open the application",
        details: [
          "Find ColabWize in your applications",
          "Pin to taskbar/dock for quick access",
          "Sign in with your account",
        ],
        tip: "Enable auto-start if you want ColabWize to open on boot",
      },
      {
        title: "Configure Settings",
        description: "Customize your experience",
        details: [
          "Set your preferred citation style",
          "Configure notification preferences",
          "Connect cloud storage (optional)",
        ],
        link: { text: "Profile Settings", url: "/profile" },
      },
    ],
    mobile: [
      {
        title: "Open App Store",
        description: "Find ColabWize in your app store",
        details: [
          "iOS: Open the App Store",
          "Android: Open Google Play Store",
          "Search for 'ColabWize'",
        ],
        tip: "Look for the official ColabWize logo",
      },
      {
        title: "Install the App",
        description: "Download and install",
        details: [
          "Tap 'Get' or 'Install'",
          "Wait for download to complete",
          "Open the app when ready",
        ],
        tip: "Requires iOS 15+ or Android 10+",
      },
      {
        title: "Sign In or Sign Up",
        description: "Create or access your account",
        details: [
          "New users: Tap 'Create Account'",
          "Existing users: Sign in with credentials",
          "Enable Face ID/Touch ID for quick access",
        ],
        link: { text: "Account Setup Guide", url: "/account-setup" },
      },
      {
        title: "Enable Notifications",
        description: "Stay updated on your projects",
        details: [
          "Allow push notifications when prompted",
          "Configure which notifications you want",
          "Enable collaboration alerts",
        ],
        tip: "Notifications help you stay on top of deadlines",
      },
    ],
    tablet: [
      {
        title: "Choose Your Method",
        description: "Use app or browser",
        details: [
          "Option 1: Install from App Store/Play Store",
          "Option 2: Use web browser at app.colabwize.com",
          "Option 3: Install as PWA from browser",
        ],
        tip: "Native app offers better offline support",
      },
      {
        title: "Install ColabWize",
        description: "Get the app on your tablet",
        details: [
          "Open App Store (iPad) or Play Store (Android)",
          "Search for 'ColabWize'",
          "Download and install",
          "For PWA: Open in browser → Add to Home Screen",
        ],
      },
      {
        title: "Optimize for Tablet",
        description: "Configure tablet-specific settings",
        details: [
          "Enable split-screen for research",
          "Configure stylus support if available",
          "Adjust font size for comfortable reading",
        ],
        tip: "Great for reviewing documents and taking notes",
      },
      {
        title: "Sync Your Work",
        description: "Access projects across devices",
        details: [
          "Sign in with same account as other devices",
          "Your projects sync automatically",
          "Continue work from any device",
        ],
        link: { text: "Account Management", url: "/account" },
      },
    ],
  };

  const toggleStep = (index: number) => {
    setExpandedStep(expandedStep === index ? null : index);
  };

  const toggleComplete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const currentSteps = platformSteps[activePlatform] || platformSteps.web;

  return (
    <div className="min-h-screen px-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <Link to="/" className="inline-flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documentation
          </Link>
          <div className="text-center">
            <Download className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl font-bold mb-2">Installation Guide</h1>
            <p className="text-lg text-gray-600">
              Get ColabWize up and running on any device
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Platform Selector */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Choose Your Platform</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => {
                  setActivePlatform(platform.id);
                  setExpandedStep(0);
                  setCompletedSteps([]);
                }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  activePlatform === platform.id
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}>
                <div
                  className={`mb-3 ${
                    activePlatform === platform.id
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}>
                  {platform.icon}
                </div>
                <h3 className="font-semibold">{platform.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {platform.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {completedSteps.length} of {currentSteps.length} steps
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((completedSteps.length / currentSteps.length) * 100)}%
              complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (completedSteps.length / currentSteps.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Installation Steps */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            Installation Steps -{" "}
            {platforms.find((p) => p.id === activePlatform)?.title}
          </h2>
          <div className="space-y-4">
            {currentSteps.map((step, index) => (
              <div
                key={index}
                className={`border rounded-xl overflow-hidden transition-all ${
                  completedSteps.includes(index)
                    ? "border-green-300 bg-green-50"
                    : expandedStep === index
                    ? "border-blue-300 shadow-md"
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
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold ${
                        completedSteps.includes(index)
                          ? "text-green-700 line-through"
                          : ""
                      }`}>
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
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
                        Instructions:
                      </h4>
                      <ul className="space-y-2 mb-4">
                        {step.details.map((detail: string, dIndex: number) => (
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
                      {step.link && (
                        <Link
                          to={step.link.url}
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                          {step.link.text}
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/account-setup"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Settings className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold">Account Setup</h3>
                <p className="text-sm text-gray-500">
                  Configure your account
                </p>
              </div>
            </Link>
            <Link
              to="/quickstart"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Play className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold">Quick Start</h3>
                <p className="text-sm text-gray-500">
                  Get started quickly
                </p>
              </div>
            </Link>
            <Link
              to="/troubleshooting"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <RefreshCw className="h-6 w-6 text-orange-600 mr-3" />
              <div>
                <h3 className="font-semibold">Troubleshooting</h3>
                <p className="text-sm text-gray-500">Fix common issues</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="p-6 bg-gray-50 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Common Issues</h3>
              <ul className="space-y-2">
                <li className="flex items-start text-sm">
                  <RefreshCw className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    App won't start - restart device and try again
                  </span>
                </li>
                <li className="flex items-start text-sm">
                  <RefreshCw className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Installation fails - check internet connection
                  </span>
                </li>
                <li className="flex items-start text-sm">
                  <RefreshCw className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">
                    Can't sign in - reset password or contact support
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Get Support</h3>
              <div className="space-y-3">
                <Link
                  to="/faq"
                  className="block text-blue-600 hover:underline text-sm">
                  → Check FAQ
                </Link>
                <Link
                  to="/contact-support"
                  className="block text-blue-600 hover:underline text-sm">
                  → Contact Support
                </Link>
                <a
                  href="https://discord.gg/2MMSdX3Uee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:underline text-sm">
                  → Join Community
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallationPage;
