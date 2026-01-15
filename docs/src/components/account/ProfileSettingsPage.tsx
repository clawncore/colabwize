import { Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Camera,
  GraduationCap,
  BookOpen,
  Globe,
} from "lucide-react";

const ProfileSettingsPage = () => {
  const profileSections = [
    {
      title: "Basic Information",
      description: "Your name, profile picture, and contact details",
      icon: <User className="h-6 w-6 text-blue-600" />,
      settings: [
        "Full Name",
        "Profile Picture",
        "Email Address",
        "Phone Number",
      ],
    },
    {
      title: "Academic Profile",
      description: "Your educational background and academic interests",
      icon: <GraduationCap className="h-6 w-6 text-green-600" />,
      settings: [
        "Institution",
        "Academic Level",
        "Field of Study",
        "Graduation Year",
      ],
    },
    {
      title: "Writing Preferences",
      description: "Customize your writing experience",
      icon: <BookOpen className="h-6 w-6 text-purple-600" />,
      settings: [
        "Preferred Citation Style",
        "Default Document Type",
        "Language Preferences",
        "Writing Goals",
      ],
    },
    {
      title: "Public Profile",
      description: "Control what others see on your profile",
      icon: <Globe className="h-6 w-6 text-orange-600" />,
      settings: [
        "Profile Visibility",
        "Show Academic Information",
        "Display Achievements",
        "Social Links",
      ],
    },
  ];

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
            <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
            <p className="text-lg text-gray-600">
              Manage your personal and academic profile information
            </p>
          </div>{" "}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 mb-4 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">Customize Your Profile</h2>
            <p className="opacity-90">
              Control how you appear to others and personalize your experience
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="bg-white/20 p-3 rounded-lg">
              <User className="h-6 w-6" />
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">Profile Sections</h2>
          <div className="space-y-6">
            {profileSections.map((section, index) => (
              <div key={index} className="p-5">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mr-3">{section.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <p className="text-sm text-gray-600">
                      {section.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {section.settings.map((setting, settingIndex) => (
                    <li key={settingIndex} className="flex items-center">
                      <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">{setting}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6">Managing Your Profile</h2>

          <div className="p-5 mb-6">
            <h3 className="text-lg font-semibold mb-3">Profile Picture</h3>
            <div className="flex items-center">
              <div className="relative">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>
                <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-1">
                  <Camera className="h-3 w-3" />
                </button>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  Upload a professional photo
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, or GIF (max 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 mb-6">
            <h3 className="text-lg font-semibold mb-3">Academic Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  placeholder="Enter your university or institution"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Field of Study
                </label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science, Biology, History"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h3 className="text-lg font-semibold mb-2">Privacy Notice</h3>
            <p className="text-blue-800 text-sm">
              Your profile information is only shared according to your privacy
              settings. Review our{" "}
              <Link to="/privacy" className="underline">
                Privacy Policy
              </Link>{" "}
              for more details.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Tips for a Great Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Professional Presentation
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-3 mt-2"></div>
                <span className="text-gray-600">
                  Use a clear, professional profile picture
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-3 mt-2"></div>
                <span className="text-gray-600">
                  Keep your academic information up to date
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-3 mt-2"></div>
                <span className="text-gray-600">
                  Highlight your areas of expertise
                </span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">
              Collaboration Benefits
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-3 mt-2"></div>
                <span className="text-gray-600">
                  A complete profile helps others find you
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-3 mt-2"></div>
                <span className="text-gray-600">
                  Academic credentials build trust
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-3 mt-2"></div>
                <span className="text-gray-600">
                  Writing preferences help collaborators
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
