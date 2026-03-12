import React, { useState, useEffect } from "react";
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

  const [isHovered, setIsHovered] = useState(false);

  // Close mobile menu and collapse sidebar on navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsHovered(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col lg:flex-row min-h-full bg-white">
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
        className={`sticky top-0 z-10 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isHovered ? "w-64" : "w-16"
        } ${mobileMenuOpen ? "block w-64" : "hidden lg:block"} flex-shrink-0 ${
          settings.sidebarPosition === "right" ? "order-last border-l border-r-0" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}>
        <div className="h-full overflow-y-auto overflow-x-hidden">
          <nav className="p-4 space-y-2 lg:mt-0">
            {allNavigationItems.map((item) => {
              const isActive = currentSection === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center text-sm font-medium rounded-lg whitespace-nowrap overflow-hidden transition-all duration-200 ${
                    isActive
                      ? `bg-blue-50 text-blue-700 ${isHovered ? "border-l-4 border-blue-500" : ""}`
                      : "text-gray-700 hover:bg-gray-50"
                  } ${isHovered ? "p-3" : "py-3 px-0 justify-center"}`}
                  onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`ml-3 transition-opacity duration-300 ${
                      isHovered || mobileMenuOpen ? "opacity-100" : "opacity-0 w-0"
                    }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-transparent transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
