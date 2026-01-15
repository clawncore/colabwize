import React, { useState } from "react";
import {
  User,
  Settings,
  CreditCard,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const SettingsLayout: React.FC = () => {
  const { settings } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Only apply custom layout preferences if the user has enabled them for this layout
  const shouldApplyCustomLayout = settings.layoutSettings !== false;

  // Determine transition classes based on animation settings
  const getTransitionClasses = () => {
    // Only apply custom animation settings if user has enabled it for this layout
    if (!shouldApplyCustomLayout) {
      return "transition-colors duration-200"; // Default transitions
    }

    if (settings.reduceMotion) {
      return "transition-none";
    } else if (settings.animations === false) {
      return "transition-none";
    }
    return "transition-colors duration-200"; // default
  };

  const transitionClasses = getTransitionClasses();

  // Determine sidebar position classes based on user preference
  const getSidebarPositionClasses = () => {
    // Only apply custom sidebar position if user has enabled it for this layout
    const sidebarPosition = shouldApplyCustomLayout
      ? settings.sidebarPosition
      : "left"; // Default to left if not enabled

    if (sidebarPosition === "right") {
      return {
        sidebar:
          "lg:block lg:w-64 xl:w-80 flex-shrink-0 border-l border-gray-200  bg-white ",
        sidebarTransform: mobileMenuOpen ? "block" : "hidden",
        // Removed excessive margins, using flex-based layout instead
      };
    } else {
      // Default to left position
      return {
        sidebar:
          "lg:block lg:w-64 xl:w-80 flex-shrink-0 border-r border-gray-200  bg-white ",
        sidebarTransform: mobileMenuOpen ? "block" : "hidden",
        // Removed excessive margins, using flex-based layout instead
      };
    }
  };

  const positionClasses = getSidebarPositionClasses();

  // Define all navigation items with feature requirements
  const allNavigationItems = [
    { id: "profile", label: "Profile", icon: User, path: "profile" },
    {
      id: "account",
      label: "Account",
      icon: Settings,
      path: "account",
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      path: "billing",
    },
    {
      id: "feedback",
      label: "Feedback",
      icon: MessageSquare,
      path: "feedback",
    },
    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
      path: "help",
    },
  ];

  const getCurrentSection = () => {
    const path = location.pathname;
    // Extract the last part of the path to determine the current section
    const pathParts = path.split("/").filter((part) => part.length > 0);
    const lastPart = pathParts[pathParts.length - 1] || "profile";

    // Special handling for settings root path
    if (path === "/settings" || path === "/settings/") {
      return "profile";
    }

    const section = allNavigationItems.find((item) => item.path === lastPart);
    return section ? section.id : "profile";
  };

  const currentSection = getCurrentSection();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Mobile menu button */}
      <div className="lg:hidden p-4 border-b border-gray-200 ">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex items-center justify-between w-full p-3 text-left bg-gray-50  rounded-lg ${transitionClasses}`}>
          <span className="font-medium text-gray-900 ">
            {allNavigationItems.find((item) => item.id === currentSection)
              ?.label || "Settings"}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 ${settings.animations && shouldApplyCustomLayout ? "transition-transform" : ""} ${mobileMenuOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div
        className={`${positionClasses.sidebar} ${positionClasses.sidebarTransform}`}>
        <div className="lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="p-4 space-y-1">
            {allNavigationItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    isActive
                      ? "bg-blue-50  text-blue-700  border-l-4 border-blue-500 accent-border tab-active"
                      : "text-gray-700  hover:bg-gray-50 "
                  } ${transitionClasses}`}
                  onClick={() => setMobileMenuOpen(false)}>
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-transparent">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
