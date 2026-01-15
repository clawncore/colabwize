import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, BookOpen, Clock } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const SearchResultsPage = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Documentation data structure - in a real app, this would come from an API
  const documentationSections = [
    {
      title: "Getting Started",
      items: [
        {
          id: "introduction",
          label: "Introduction",
          path: "/",
          description:
            "Learn about ColabWize and how it can help with your academic writing.",
        },
        {
          id: "quickstart",
          label: "Quick Start Guide",
          path: "/quickstart",
          description: "Get up and running with ColabWize in under 30 minutes.",
        },
        {
          id: "installation",
          label: "Installation",
          path: "/installation",
          description:
            "Install ColabWize on any device for seamless academic writing.",
        },
        {
          id: "account-setup",
          label: "Account Setup",
          path: "/account-setup",
          description:
            "Configure your account for optimal academic writing experience.",
        },
      ],
    },
    {
      title: "Core Features",
      items: [
        {
          id: "ai-writing",
          label: "AI Writing",
          path: "/ai-writing",
          description:
            "Learn how to use our powerful AI tools to enhance your writing process.",
        },
        {
          id: "plagiarism",
          label: "Plagiarism Detection",
          path: "/plagiarism",
          description:
            "Ensure academic integrity with our comprehensive plagiarism tools.",
        },
        {
          id: "citations",
          label: "Citations & References",
          path: "/citations",
          description:
            "Manage citations and create bibliographies in any format.",
        },
        {
          id: "collaboration",
          label: "Collaboration",
          path: "/collaboration",
          description:
            "Work together seamlessly with real-time editing and sharing.",
        },
        {
          id: "export",
          label: "Export Options",
          path: "/export",
          description:
            "Export your work in multiple formats for sharing and submission.",
        },
        {
          id: "keyboard-shortcuts",
          label: "Keyboard Shortcuts",
          path: "/keyboard-shortcuts",
          description: "Increase your productivity with keyboard shortcuts.",
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
          description: "Track your writing progress and improvement over time.",
        },
        {
          id: "ai-writing-assistant",
          label: "AI Writing Assistant",
          path: "/ai-writing-assistant",
          description:
            "Master the advanced features of our AI writing assistant.",
        },
        {
          id: "templates",
          label: "Templates Marketplace",
          path: "/templates",
          description: "Browse and use professionally designed templates.",
        },
        {
          id: "templates-library",
          label: "Templates Library",
          path: "/templates-library",
          description: "Create and manage your own template library.",
        },
      ],
    },
    {
      title: "Settings & Configuration",
      items: [
        {
          id: "profile",
          label: "Profile Settings",
          path: "/profile",
          description: "Manage your personal and academic profile information.",
        },
        {
          id: "account",
          label: "Account Management",
          path: "/account",
          description:
            "Control all aspects of your ColabWize account settings.",
        },
        {
          id: "notifications",
          label: "Notifications",
          path: "/notifications",
          description: "Customize how and when you receive notifications.",
        },
        {
          id: "billing",
          label: "Billing & Plans",
          path: "/billing",
          description:
            "Understand our pricing plans and manage your subscription.",
        },
        {
          id: "privacy",
          label: "Privacy & Security",
          path: "/privacy",
          description: "How we protect your data and respect your privacy.",
        },
      ],
    },
    {
      title: "Developer Documentation",
      items: [
        {
          id: "api",
          label: "API Overview",
          path: "/developer/api",
          description: "Learn how to integrate with our API.",
        },
        {
          id: "api-auth",
          label: "Authentication",
          path: "/developer/api/auth",
          description: "Authenticate with our API using various methods.",
        },
        {
          id: "api-projects",
          label: "Projects",
          path: "/developer/api/projects",
          description: "Manage projects through our API.",
        },
        {
          id: "api-documents",
          label: "Documents",
          path: "/developer/api/documents",
          description: "Create, read, update, and delete documents via API.",
        },
        {
          id: "api-citations",
          label: "Citations",
          path: "/developer/api/citations",
          description: "Handle citations programmatically with our API.",
        },
      ],
    },
    {
      title: "Legal",
      items: [
        {
          id: "terms",
          label: "Terms of Service",
          path: "/terms",
          description: "Our terms of service agreement.",
        },
        {
          id: "privacy-policy",
          label: "Privacy Policy",
          path: "/privacy-policy",
          description:
            "Detailed information about how we collect and use your data.",
        },
        {
          id: "security",
          label: "Security",
          path: "/security",
          description: "Learn about our security measures and practices.",
        },
        {
          id: "cookies",
          label: "Cookie Policy",
          path: "/cookies",
          description: "Information about cookies we use and why.",
        },
        {
          id: "gdpr",
          label: "GDPR Compliance",
          path: "/gdpr",
          description: "How we comply with GDPR regulations.",
        },
      ],
    },
    {
      title: "Troubleshooting",
      items: [
        {
          id: "faq",
          label: "FAQ",
          path: "/faq",
          description: "Find answers to common questions about ColabWize.",
        },
        {
          id: "troubleshooting",
          label: "Troubleshooting",
          path: "/troubleshooting",
          description:
            "Solutions to common issues and problems you might encounter.",
        },
        {
          id: "contact-support",
          label: "Contact Support",
          path: "/contact-support",
          description: "Get help from our dedicated support team.",
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
          description: "Suggest new features and vote on existing requests.",
        },
        {
          id: "beta-program",
          label: "Beta Program",
          path: "/beta-program",
          description:
            "Get early access to new features and help shape ColabWize.",
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

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";
    setSearchQuery(query);

    if (query) {
      performSearch(query);
    }
  }, [location.search]);

  // Perform search
  const performSearch = (query: string) => {
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const filteredResults = allDocumentationItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.section.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(filteredResults);
      setIsLoading(false);
    }, 300);
  };

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL with new search query
      window.history.pushState(
        {},
        "",
        `/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      performSearch(searchQuery.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Results
        </h1>
        <p className="text-gray-600">
          {searchQuery
            ? `Search results for "${searchQuery}"`
            : "Search our documentation"}
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-6 text-lg border-2 border-gray-300 focus:border-blue-500 rounded-xl shadow-sm bg-white text-gray-900"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Search
          </Button>
        </div>
      </form>

      {/* Search Results */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-4">
          <p className="text-gray-600">
            Found {searchResults.length} result
            {searchResults.length !== 1 ? "s" : ""}
          </p>
          {searchResults.map((result) => (
            <Link
              key={`${result.section}-${result.id}`}
              to={result.path}
              className="block group">
              <Card className="border border-gray-200 hover:shadow-md transition-shadow bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <BookOpen className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {result.label}
                      </h3>
                      <p className="text-gray-600 mt-1">{result.description}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {result.section}
                        </span>
                        <div className="flex items-center text-xs text-gray-500 ml-3">
                          <Clock className="h-3 w-3 mr-1" />3 min read
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No results found
          </h3>
          <p className="mt-2 text-gray-600">
            We couldn't find any documentation matching "{searchQuery}". Try
            different keywords.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Browse All Documentation
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Search Our Documentation
          </h3>
          <p className="mt-2 text-gray-600">
            Enter a keyword or phrase to search through our documentation.
          </p>
        </div>
      )}

      {/* Popular Search Topics */}
      {!searchQuery && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Popular Topics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { term: "AI Writing", path: "/ai-writing" },
              { term: "Citations", path: "/citations" },
              { term: "Plagiarism", path: "/plagiarism" },
              { term: "Collaboration", path: "/collaboration" },
              { term: "Export", path: "/export" },
              { term: "Account Setup", path: "/account-setup" },
            ].map((topic) => (
              <Link
                key={topic.term}
                to={topic.path}
                className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {topic.term}
                  </p>
                </div>
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
