import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, Search, ChevronRight } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const DocsLayout = () => {
  const { settings } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Only apply custom layout preferences if the user has enabled them for this layout
  const shouldApplyCustomLayout = settings.layoutDocs !== false;

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
          "fixed inset-y-0 right-0 z-40 w-64 bg-white border-l border-gray-200",
        sidebarTransform: mobileMenuOpen ? "translate-x-0" : "translate-x-full",
        mainContent: "flex-1 md:mr-64 bg-white",
        mobileOverlay: "fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden",
      };
    } else {
      // Default to left position
      return {
        sidebar:
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200",
        sidebarTransform: mobileMenuOpen
          ? "translate-x-0"
          : "-translate-x-full",
        mainContent: "flex-1 md:ml-64 bg-white",
        mobileOverlay: "fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden",
      };
    }
  };

  const positionClasses = getSidebarPositionClasses();

  const documentationSections = [
    {
      title: "Getting Started",
      items: [
        { id: "introduction", label: "Introduction", path: "/" },
        {
          id: "quickstart",
          label: "Quick Start Guide",
          path: "/quickstart",
        },
        {
          id: "installation",
          label: "Installation",
          path: "/installation",
        },
        {
          id: "account-setup",
          label: "Account Setup",
          path: "/account-setup",
        },
      ],
    },
    {
      title: "Core Features",
      items: [
        {
          id: "originality",
          label: "Originality Scanning",
          path: "/originality",
        },

        {
          id: "citations",
          label: "Citation Confidence",
          path: "/citations",
        },
        {
          id: "certificates",
          label: "Authorship Certificates",
          path: "/certificates",
        },
        {
          id: "keyboard-shortcuts",
          label: "Keyboard Shortcuts",
          path: "/keyboard-shortcuts",
        },
      ],
    },
    {
      title: "Advanced Features",
      items: [
        {
          id: "analytics",
          label: "Advanced Analytics",
          path: "/analytics",
        },
      ],
    },
    {
      title: "Subscription & Billing",
      items: [
        {
          id: "plans",
          label: "Subscription Plans",
          path: "/plans",
        },
        {
          id: "limits",
          label: "Usage Limits",
          path: "/limits",
        },
        {
          id: "credits",
          label: "Credits System",
          path: "/credits",
        },
      ],
    },
    {
      title: "Settings & Configuration",
      items: [
        { id: "profile", label: "Profile Settings", path: "/profile" },
        { id: "account", label: "Account Management", path: "/account" },
        { id: "billing", label: "Billing & Plans", path: "/billing" },
        { id: "privacy", label: "Privacy & Security", path: "/privacy" },
      ],
    },
    {
      title: "Legal",
      items: [
        { id: "terms", label: "Terms of Service", path: "/terms" },
        {
          id: "privacy-policy",
          label: "Privacy Policy",
          path: "/privacy-policy",
        },
        { id: "security", label: "Security", path: "/security" },
        { id: "cookies", label: "Cookie Policy", path: "/cookies" },
        { id: "gdpr", label: "GDPR Compliance", path: "/gdpr" },
      ],
    },
    {
      title: "Troubleshooting",
      items: [
        { id: "faq", label: "FAQ", path: "/faq" },
        {
          id: "troubleshooting",
          label: "Troubleshooting",
          path: "/troubleshooting",
        },
        {
          id: "contact-support",
          label: "Contact Support",
          path: "/contact-support",
        },
      ],
    },
    {
      title: "Community",
      items: [
        {
          id: "feature-request",
          label: "Feature Requests",
          path: "/feature-request",
        },
        {
          id: "beta-program",
          label: "Beta Program",
          path: "/beta-program",
        },
        {
          id: "roadmap",
          label: "Product Roadmap",
          path: "/roadmap",
        },
      ],
    },
    {
      title: "Coming Soon",
      items: [
        {
          id: "literature-review",
          label: "Literature Review",
          path: "/literature-review",
        },
        {
          id: "study-groups",
          label: "Study Groups",
          path: "/study-groups",
        },
        {
          id: "templates",
          label: "Templates",
          path: "/templates",
        },
      ],
    },
  ];

  // Flatten all documentation items for easier searching
  const allDocumentationItems = documentationSections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      section: section.title,
    }))
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Filter documentation items based on search query
    const filteredResults = allDocumentationItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.section.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filteredResults);
    setShowSearchResults(true);
  };

  // Handle search result click
  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setMobileMenuOpen(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSearchResults && target && !target.closest(".search-container")) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearchResults]);

  const getCurrentSection = () => {
    const path = location.pathname;
    for (const section of documentationSections) {
      const item = section.items.find((item) => item.path === path);
      if (item) return section.title;
    }
    return "ColabWize Docs";
  };

  const currentSection = getCurrentSection();

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img
                  src="/images/Colabwize-logo.png"
                  alt="ColabWize Logo"
                  className="h-10 w-auto"
                  style={{ color: `hsl(var(--accent))` }}
                />
                <span className="text-xl font-bold text-gray-900">
                  ColabWize Docs : {currentSection}
                </span>
              </Link>
            </div>

            {/* Search bar */}
            <div className="flex items-center relative search-container flex-grow max-w-2xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 form-input"
                />
              </div>

              {/* Search results dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white bg-[#1A1A1A] rounded-lg shadow-lg border border-gray-200 border-gray-700 z-50 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.section}-${result.id}`}
                          onClick={() => handleResultClick(result.path)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 hover:bg-gray-700 transition-colors duration-150">
                          <div className="font-medium text-gray-900 text-white">
                            {result.label}
                          </div>
                          <div className="text-xs text-gray-500 text-gray-400 mt-1">
                            {result.section}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="text-gray-500 text-gray-400">
                        No documentation found matching "{searchQuery}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/help"
                className="text-gray-600 hover:text-blue-600 text-gray-300 hover:text-blue-400 accent-link">
                Help Center
              </Link>
              <Link
                to="/features"
                className="text-gray-600 hover:text-blue-600 text-gray-300 hover:text-blue-400 accent-link">
                Features
              </Link>
              <Link
                to="/billing"
                className="text-gray-600 hover:text-blue-600 text-gray-300 hover:text-blue-400 accent-link">
                Pricing
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-gray-300 hover:text-white hover:bg-gray-700 ${transitionClasses}`}>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`
          ${positionClasses.sidebar} transform transition-transform duration-300 ease-in-out md:translate-x-0
          ${positionClasses.sidebarTransform}
        `}>
          <div className="flex flex-col h-full pt-16">
            <div className="flex-1 overflow-y-auto p-4">
              {/* Sidebar content */}
              <nav className="space-y-8">
                {documentationSections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-xs font-semibold text-gray-500 text-gray-400 uppercase tracking-wider mb-3">
                      {section.title}
                    </h3>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <li key={item.id}>
                            <Link
                              to={item.path}
                              className={`flex items-center justify-between px-3 py-2 text-sm rounded-md ${
                                isActive
                                  ? "bg-blue-50 text-blue-700 font-medium bg-blue-900/30 text-blue-400 tab-active"
                                  : "text-gray-700 hover:bg-gray-50 text-gray-300 hover:bg-gray-300"
                              } ${transitionClasses}`}
                              onClick={() => setMobileMenuOpen(false)}>
                              <span>{item.label}</span>
                              {isActive && (
                                <ChevronRight
                                  className="h-4 w-4 text-blue-600 text-blue-400"
                                  style={{ color: `hsl(var(--accent))` }}
                                />
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>

            <div className="p-4 border-t border-gray-200 border-gray-700">
              <Link
                to="/help"
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 text-blue-400 bg-blue-900/30 hover:bg-blue-900/50 accent-button">
                Visit Help Center
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div
            className={positionClasses.mobileOverlay}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={positionClasses.mainContent}>
          <div className="container-custom py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocsLayout;
