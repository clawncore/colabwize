import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Zap,
  Users,
  FileText,
  BarChart3,
  Search,
  Shield,
  Download,
  CreditCard,
  Settings,
  LifeBuoy,
  MessageCircle,
} from "lucide-react";

const DocumentationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  const documentationCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Installation, Quick Start Guide, and Account Setup.",
      articles: 4,
      path: "/quickstart",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Core Features",
      description:
        "Originality Scanning, Citation Confidence, and Certificates.",
      articles: 4,
      path: "/originality",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Features",
      description: "Advanced Analytics and reporting tools.",
      articles: 1,
      path: "/analytics",
      color: "from-teal-500 to-green-500",
    },
    {
      icon: CreditCard,
      title: "Subscription & Billing",
      description: "Plans, Usage Limits, and Credits System.",
      articles: 3,
      path: "/plans",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Settings,
      title: "Settings & Configuration",
      description: "Profile, Account Management, and Privacy Settings.",
      articles: 4,
      path: "/account",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Shield,
      title: "Legal",
      description: "Terms, Privacy Policy, Security, and GDPR.",
      articles: 5,
      path: "/terms",
      color: "from-gray-500 to-gray-700",
    },
    {
      icon: LifeBuoy,
      title: "Troubleshooting",
      description: "FAQ, Troubleshooting Guide, and Support.",
      articles: 3,
      path: "/troubleshooting",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: MessageCircle,
      title: "Community",
      description: "Feature Requests and Beta Program.",
      articles: 2,
      path: "/beta-program",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const comingSoonFeatures = [
    {
      title: "Advanced Analytics Dashboard",
      description:
        "Track your writing progress, productivity trends, and improvement over time",
      status: "coming-soon",
      path: "/analytics",
    },
    {
      title: "AI Literature Review Assistant",
      description: "Get AI-powered literature reviews and research summaries",
      status: "coming-soon",
      path: "/literature-review",
    },
    {
      title: "Templates Marketplace",
      description:
        "Browse thousands of templates for research papers, essays, and more",
      status: "coming-soon",
      path: "/templates",
    },
    {
      title: "Study Groups",
      description:
        "Create study groups, share notes, and collaborate with classmates",
      status: "coming-soon",
      path: "/study-groups",
    },
  ];

  // Additional documentation items for search
  const additionalDocumentationItems = [
    {
      title: "FAQ",
      path: "/faq",
      category: "Help Resources",
      description: "",
    },
    {
      title: "Troubleshooting Guide",
      path: "/troubleshooting",
      category: "Help Resources",
      description: "",
    },
    {
      title: "Contact Support",
      path: "/help",
      category: "Help Resources",
      description: "",
    },
    {
      title: "Community Forum",
      path: "https://discord.gg/2MMSdX3Uee",
      category: "Community",
      description: "",
    },
    {
      title: "Feature Requests",
      path: "/feature-request",
      category: "Community",
      description: "",
    },
    {
      title: "Beta Program",
      path: "/beta-program",
      category: "Community",
      description: "",
    },
    {
      title: "Roadmap",
      path: "/roadmap",
      category: "Coming Soon Features",
      description: "",
    },
    {
      title: "Literature Review",
      path: "/literature-review",
      category: "Coming Soon Features",
      description: "",
    },
    {
      title: "Study Groups",
      path: "/study-groups",
      category: "Coming Soon Features",
      description: "",
    },
    {
      title: "Templates",
      path: "/templates",
      category: "Coming Soon Features",
      description: "",
    },
  ];

  // Combine all searchable items
  const allSearchableItems = [
    ...documentationCategories.map((category) => ({
      title: category.title,
      description: category.description,
      path: category.path,
      category: "Documentation Categories",
    })),
    ...comingSoonFeatures.map((feature) => ({
      title: feature.title,
      description: feature.description,
      path: feature.path,
      category: "Coming Soon Features",
    })),
    ...additionalDocumentationItems,
  ];

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
    const filteredResults = allSearchableItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(query.toLowerCase())) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filteredResults);
    setShowSearchResults(true);
  };

  // Handle search result click
  const handleResultClick = (path: string, isExternal: boolean = false) => {
    if (isExternal) {
      window.open(path, "_blank");
    } else {
      navigate(path);
    }
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
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

  return (
    <div className="min-h-screen px-8 bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              ColabWize Documentation
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Everything you need to know about using ColabWize effectively.
              From getting started to advanced features, we've got you covered.
            </p>

            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto search-container">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="w-full pl-10 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white text-gray-900"
              />

              {/* Search results dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            handleResultClick(
                              result.path,
                              result.path.startsWith("http")
                            )
                          }
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-150">
                          <div className="font-medium text-gray-900">
                            {result.title}
                          </div>
                          {(result.description || result.category) && (
                            <div className="text-sm text-gray-500 mt-1">
                              {result.description || result.category}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="text-gray-500">
                        No documentation found matching "{searchQuery}"
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Documentation Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Browse Documentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {documentationCategories.map((category, index) => (
              <Link
                key={index}
                to={category.path}
                className="group p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {category.description}
                </p>
                <div className="flex items-center text-sm text-blue-600 font-medium">
                  {category.articles} articles
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <Link to="/roadmap" className="text-sm font-medium ml-1 md:ml-2">
              View Full Roadmap
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {comingSoonFeatures.map((feature, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Coming Soon
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link
                  to={feature.path}
                  className="text-sm font-medium ml-1 md:ml-2">
                  Learn more
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Popular Articles</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/quickstart"
                    className="text-sm font-medium ml-1 md:ml-2">
                    Quick Start Guide
                  </Link>
                </li>
                <li>
                  <Link
                    to="/originality"
                    className="text-sm font-medium ml-1 md:ml-2">
                    Originality Scanning
                  </Link>
                </li>
                <li>
                  <Link
                    to="/citations"
                    className="text-sm font-medium ml-1 md:ml-2">
                    Citation Confidence
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Help Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/faq" className="text-sm font-medium ml-1 md:ml-2">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/troubleshooting"
                    className="text-sm font-medium ml-1 md:ml-2">
                    Troubleshooting Guide
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-sm font-medium ml-1 md:ml-2">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Community</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://discord.gg/2MMSdX3Uee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium ml-1 md:ml-2">
                    Community Forum
                  </a>
                </li>
                <li>
                  <Link
                    to="/feature-request"
                    className="text-sm font-medium ml-1 md:ml-2">
                    Feature Requests
                  </Link>
                </li>
                <li>
                  <Link
                    to="/beta-program"
                    className="text-sm font-medium ml-1 md:ml-2">
                    Beta Program
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage;
