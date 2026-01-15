import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  GraduationCap,
  BookOpen,
  Bell,
  CreditCard,
  Shield,
} from "lucide-react";

const AccountSetupPage = () => {
  const setupSteps = [
    {
      id: 1,
      title: "Create Your Account",
      description: "Sign up with email or social login",
      icon: <User className="h-6 w-6 text-blue-600" />,
      completed: true,
    },
    {
      id: 2,
      title: "Verify Your Email",
      description: "Confirm your email address for security",
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      completed: true,
    },
    {
      id: 3,
      title: "Complete Profile",
      description: "Add academic information and preferences",
      icon: <GraduationCap className="h-6 w-6 text-blue-600" />,
      completed: false,
    },
    {
      id: 4,
      title: "Set Preferences",
      description: "Configure notification and writing settings",
      icon: <Bell className="h-6 w-6 text-blue-600" />,
      completed: false,
    },
    {
      id: 5,
      title: "Secure Your Account",
      description: "Enable two-factor authentication",
      icon: <Lock className="h-6 w-6 text-blue-600" />,
      completed: false,
    },
  ];

  const profileSections = [
    {
      icon: <GraduationCap className="h-6 w-6 text-green-600" />,
      title: "Academic Information",
      fields: [
        "Institution",
        "Academic Level",
        "Field of Study",
        "Graduation Year",
      ],
    },
    {
      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
      title: "Writing Preferences",
      fields: [
        "Preferred Citation Style",
        "Document Types",
        "Writing Goals",
        "Language Preferences",
      ],
    },
    {
      icon: <Bell className="h-6 w-6 text-orange-600" />,
      title: "Notification Settings",
      fields: [
        "Email Notifications",
        "Push Notifications",
        "Collaboration Alerts",
        "System Updates",
      ],
    },
  ];

  const securityOptions = [
    {
      icon: <Lock className="h-6 w-6 text-red-600" />,
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security to your account",
      status: "Recommended",
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Password Requirements",
      description: "Use a strong, unique password for your account",
      status: "Essential",
    },
    {
      icon: <CreditCard className="h-6 w-6 text-green-600" />,
      title: "Payment Methods",
      description: "Securely store payment information for subscriptions",
      status: "Optional",
    },
  ];

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
            <h1 className="text-3xl font-bold mb-2">Account Setup</h1>
            <p className="text-lg text-gray-600">
              Configure your ColabWize account for optimal academic writing
              experience
            </p>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3">Account Setup Progress</h2>
          <div className="space-y-4">
            {setupSteps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full ${
                    step.completed ? "bg-green-100" : "bg-gray-100"
                  }`}>
                  {step.completed ? (
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="ml-4">
                  <h3
                    className={`text-lg font-medium ${
                      step.completed ? "text-green-800" : "text-gray-900"
                    }`}>
                    {step.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      step.completed ? "text-green-700" : "text-gray-600"
                    }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Profile Configuration</h2>
            <div className="space-y-6">
              {profileSections.map((section, index) => (
                <div key={index} className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 mr-3">{section.icon}</div>
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.fields.map((field, fieldIndex) => (
                      <li key={fieldIndex} className="flex items-center">
                        <div className="h-2 w-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-gray-600">{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Security & Privacy</h2>
            <div className="space-y-6">
              {securityOptions.map((option, index) => (
                <div key={index} className="p-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1">{option.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold">
                          {option.title}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {option.status}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-600">{option.description}</p>
                      <div className="mt-4">
                        <button className="font-medium text-sm">
                          Configure Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-2">Privacy Notice</h3>
              <p className="text-yellow-700 mb-3">
                Your academic work and personal information are protected with
                enterprise-grade security.
              </p>
              <Link to="/privacy" className="text-yellow-700">
                Learn more about our privacy policy
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-6">
            If you're having trouble setting up your account, our support team
            is here to help.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/contact-support"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center">
              Contact Support
            </Link>
            <Link
              to="/faq"
              className="px-4 py-2 border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 font-medium text-center">
              View FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSetupPage;
