import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Menu,
  X,
  Home,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Trash2,
  Crown,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

// Note: These imports need to be updated based on your actual auth implementation
import { useAuth } from "../../hooks/useAuth";
import { documentService } from "../../services/documentService";
import certificateService from "../../services/certificateService";
import {
  Subscription,
  // PaymentMethod,
  // Invoice,
} from "../../services/subscriptionService";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { UsageMeter } from "../../components/subscription/UsageMeter";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobileRestrictedPage from "../MobileRestrictedPage";
import { useSubscriptionStore } from "../../stores/useSubscriptionStore";

interface DashboardLayoutProps {
  children?: ReactNode;
  activeTab?: string;
}

export default function DashboardLayout({
  children,
  activeTab,
}: DashboardLayoutProps) {
  const { loading, isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // Check for mobile device



  // Global Subscription Store
  const {
    plan,
    limits: planLimits,
    usage: planUsage,
    creditBalance,
    fetchSubscription,
    loading: subscriptionLoading,
    error: subscriptionError,
    // subscription
  } = useSubscriptionStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Removed local subscription states in favor of store

  const [isUsageCollapsed, setIsUsageCollapsed] = useState(true);
  // const userId = useMemo(() => user?.id, [user?.id]);

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (activeTab) return activeTab;

    const path = location.pathname;

    // More specific route matching to ensure correct tab highlighting
    if (path === "/dashboard" || path.startsWith("/dashboard/overview"))
      return "dashboard";
    if (path.startsWith("/dashboard/documents")) return "documents";
    if (path.startsWith("/dashboard/settings")) return "settings";
    if (path.startsWith("/dashboard/billing/subscription")) return "billing";
    if (path.startsWith("/dashboard/recycle-bin")) return "recycle-bin";
    if (path.startsWith("/dashboard/settings/help")) return "help";

    // Default fallback
    return "dashboard";
  };

  // Recalculate active tab whenever location changes
  const currentActiveTab = getActiveTab();

  const [searchParams] = useSearchParams();

  // Fetch real project count and subscription data
  useEffect(() => {
    // Only trigger fetch if authenticated
    const isAuthSettled = !loading && isAuthenticated() && !!user;

    if (isAuthSettled) {
      // Force refresh if returning from checkout (success=true or invoice id present)
      const isCheckoutReturn = searchParams.get('success') === 'true' || searchParams.has('checkout_success');
      fetchSubscription(isAuthSettled, isCheckoutReturn);
    }
  }, [loading, isAuthenticated, user, fetchSubscription, searchParams]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        profileDropdownOpen &&
        target &&
        !target.closest(".profile-dropdown")
      ) {
        setProfileDropdownOpen(false);
      }

      // Close search results when clicking outside
      if (showSearchResults && target && !target.closest(".search-container")) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen, showSearchResults]);

  // Authentication is handled by ProtectedRoute wrapper

  // Define all navigation items
  const allNavigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      href: "/dashboard/documents",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings/profile",
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      href: "/dashboard/billing/subscription",
    },
    {
      id: "recycle-bin",
      label: "Recycle Bin",
      icon: Trash2,
      href: "/dashboard/recycle-bin",
    },
    {
      id: "help",
      label: "Help",
      icon: HelpCircle,
      href: "/dashboard/settings/help",
    },
  ];

  // Filter navigation items based on user permissions if needed
  const navigationItems = allNavigationItems;

  // Helper to get plan display name from ID
  const getPlanDisplayName = (planData: any) => {
    if (!planData) return "Free Plan";

    // Handle if it's already an object with name
    if (typeof planData === "object" && planData.name) return planData.name;

    // Get the ID string
    const planId =
      typeof planData === "object" && planData.id
        ? planData.id
        : String(planData);
    const id = planId.toLowerCase();

    if (id === "student") return "Student Pro";
    if (id === "researcher") return "Researcher";
    if (id === "payg") return "Pay As You Go";
    if (id === "free") return "Free Plan";

    // Fallback
    return planId.charAt(0).toUpperCase() + planId.slice(1);
  };

  const userPlan = getPlanDisplayName(plan);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  type PlanType = "Student Pro" | "Researcher" | "Free Plan" | string;

  const getPlanBadgeColor = (plan: PlanType): string => {
    const planBadgeColors: Record<string, string> = {
      "Student Pro": "bg-blue-100 text-blue-700",
      Researcher: "bg-purple-100 text-purple-700",
      "Free Plan": "bg-gray-100 text-gray-700",
    };

    // Special badge for premium users
    if (
      plan &&
      (plan.includes("Student") ||
        plan.includes("Pro") ||
        plan.includes("Researcher"))
    ) {
      return "bg-gradient-to-r from-blue-500 to-purple-600 text-white";
    }

    return planBadgeColors[plan] || "bg-gray-100 text-gray-700";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get user's plan badge
  const getUserPlanBadge = () => {
    // Only show badge for premium plans
    if (!userPlan || userPlan === "Free Plan" || userPlan === "Free") {
      return null;
    }

    const planColor = getPlanBadgeColor(userPlan);
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planColor} shadow-sm`}>
        <Crown className="mr-1 h-3 w-3" />
        {userPlan}
      </span>
    );
  };

  // Handle search functionality
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      // Fetch documents and certificates in parallel
      const [documentsResponse, certificatesResponse] = await Promise.all([
        documentService.getProjects(),
        certificateService.getCertificates(1, 100), // Fetch top 100 for search
      ]);

      const results = [];
      const query = searchQuery.toLowerCase();

      // Process documents
      if (documentsResponse.success && documentsResponse.data) {
        const matchedDocs = documentsResponse.data
          .filter(
            (doc) =>
              doc.title.toLowerCase().includes(query) ||
              (doc.description && doc.description.toLowerCase().includes(query))
          )
          .map((doc) => ({
            id: doc.id,
            title: doc.title,
            description: doc.description || "Document",
            type: "document",
            url: `/dashboard/editor/${doc.id}`,
          }));
        results.push(...matchedDocs);
      }

      // Process certificates
      if (certificatesResponse && certificatesResponse.certificates) {
        const matchedCerts = certificatesResponse.certificates
          .filter((cert) => cert.title.toLowerCase().includes(query))
          .map((cert) => ({
            id: cert.id,
            title: cert.title,
            description: `Certificate (${cert.status})`,
            type: "certificate",
            url: `/dashboard/authorship`,
          }));
        results.push(...matchedCerts);
      }

      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setShowSearchResults(true);
    }
  };

  // Handle search input change with debounce
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // If input is cleared, hide results
    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // Handle search result click
  const handleResultClick = (url: string) => {
    navigate(url);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  // Determine sidebar position classes based on theme preference
  const getSidebarPositionClasses = () => {
    // Always use left position for this dashboard
    return {
      sidebar:
        "fixed inset-y-0 left-0 z-40 w-64 bg-[#FFFAFA] border-r border-gray-200",
      sidebarTransform: sidebarOpen ? "translate-x-0" : "-translate-x-full",
      mainContent: `flex-1 min-h-screen transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"} pt-16 lg:pt-0`,
      topNav: `sticky top-0 z-50 bg-[#FFFAFA] border-b border-gray-200 shadow-sm ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"}`,
    };
  };

  // Determine transition classes based on theme settings
  const getTransitionClasses = () => {
    return "transition-colors duration-200"; // default
  };

  const positionClasses = getSidebarPositionClasses();
  const transitionClasses = getTransitionClasses();

  // Helper to get display name
  const getDisplayName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.username) {
      // Capitalize first letter of username
      return user.username.charAt(0).toUpperCase() + user.username.slice(1);
    }
    if (user?.email) {
      // Use part before @ and capitalize first letter
      const name = user.email.split("@")[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return "User";
  };

  if (isMobile) {
    return <MobileRestrictedPage />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className={positionClasses.topNav}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 ${transitionClasses}`}>
                {sidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* Desktop collapse/expand button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`hidden lg:block p-2 rounded-lg text-gray-600 hover:bg-gray-100 ${transitionClasses}`}>
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo */}
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 group">
                <div className="flex items-center">
                  <img
                    src="/images/Colabwize-logo.png"
                    alt="ColabWize Logo"
                    className="h-8 w-auto transition-transform duration-200 group-hover:scale-105"
                  />
                  {userPlan &&
                    userPlan !== "Free Plan" &&
                    userPlan !== "Free" && (
                      <span
                        className={`
                      ml-0.5 px-2 py-1 text-xs font-bold rounded-full shadow-sm
                      ${userPlan.includes("Student") || userPlan.includes("Pro")
                            ? "bg-blue-600 text-white"
                            : "bg-purple-600 text-white"
                          }
                    `}>
                        {userPlan.includes("Student") ||
                          userPlan.includes("Pro")
                          ? "PRO"
                          : "RESEARCHER"}
                      </span>
                    )}
                </div>
                <span className="text-xl font-bold text-gray-900 font-sans hidden sm:block">
                  ColabWize
                </span>
              </Link>

              {/* Search bar */}
              <div className="hidden md:block relative search-container">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={() => searchQuery && setShowSearchResults(true)}
                      className="pl-10 pr-4 py-2 w-80 bg-white border-0 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </form>

                {/* Search results dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Projects
                        </div>
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result.url)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors duration-150">
                            <div className="font-medium text-gray-900">
                              {result.title}
                            </div>
                            {result.description && (
                              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {result.description}
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <div className="text-gray-500">
                          {searchQuery
                            ? "No projects found"
                            : "Start typing to search"}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Profile dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 ${transitionClasses}`}>
                  <div
                    className={`
                    relative w-8 h-8 rounded-full flex items-center justify-center
                    ${userPlan === "Free Plan" || !userPlan
                        ? "bg-gradient-to-br from-gray-400 to-gray-600"
                        : userPlan.includes("Student") ||
                          userPlan.includes("Pro")
                          ? "bg-gradient-to-br from-blue-500 to-blue-700"
                          : "bg-gradient-to-br from-purple-500 to-purple-700"
                      }
                  `}>
                    <span className="text-white font-medium text-sm">
                      {user?.user_metadata?.full_name
                        ? user.user_metadata.full_name.charAt(0).toUpperCase()
                        : user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                    {userPlan &&
                      userPlan !== "Free Plan" &&
                      userPlan !== "Free" && (
                        <div
                          className={`
                        absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm
                        ${userPlan.includes("Student") ||
                              userPlan.includes("Pro")
                              ? "bg-blue-500 border-2 border-white"
                              : "bg-purple-500 border-2 border-white"
                            }
                      `}>
                          <Crown className="w-2 h-2 text-white" />
                        </div>
                      )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#FFFAFA] rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`
                          relative w-10 h-10 rounded-full flex items-center justify-center
                          ${userPlan === "Free Plan" || !userPlan
                              ? "bg-gradient-to-br from-gray-400 to-gray-600"
                              : userPlan.includes("Student") ||
                                userPlan.includes("Pro")
                                ? "bg-gradient-to-br from-blue-500 to-blue-700"
                                : "bg-gradient-to-br from-purple-500 to-purple-700"
                            }
                        `}>
                          <span className="text-white font-medium">
                            {user?.user_metadata?.full_name
                              ? user.user_metadata.full_name.charAt(0).toUpperCase()
                              : user?.email?.charAt(0).toUpperCase() || "U"}
                          </span>
                          {userPlan &&
                            userPlan !== "Free Plan" &&
                            userPlan !== "Free" && (
                              <div
                                className={`
                              absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm
                              ${userPlan.includes("Student") ||
                                    userPlan.includes("Pro")
                                    ? "bg-blue-500 border-2 border-white"
                                    : "bg-purple-500 border-2 border-white"
                                  }
                            `}>
                                <Crown className="w-2.5 h-2.5 text-white" />
                              </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                          {/* User plan badge */}
                          <div className="mt-1">{getUserPlanBadge()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <Link
                        to="/dashboard/settings/profile"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${transitionClasses}`}>
                        <svg
                          className="w-4 h-4 mr-3 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        View Profile
                      </Link>

                      <Link
                        to="/dashboard/documents"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${transitionClasses}`}>
                        <svg
                          className="w-4 h-4 mr-3 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        My Documents
                      </Link>

                      <Link
                        to="/dashboard/settings/help"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${transitionClasses}`}>
                        <svg
                          className="w-4 h-4 mr-3 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 3.747-.54 1.165-1.333 2-2.48 2-1.147 0-1.94-1.165-2.48-2C7.788 11.575 6.51 10.4 6.51 9c0-1.657 1.79-3 4-3z"
                          />
                        </svg>
                        Help Center
                      </Link>

                      <Link
                        to="/dashboard/settings/account"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${transitionClasses}`}>
                        <svg
                          className="w-4 h-4 mr-3 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.638 2.296.07 2.572-1.065z"
                          />
                        </svg>
                        Account Settings
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className={`flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 ${transitionClasses}`}>
                        <LogOut className="w-4 h-4 mr-3" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
          ${positionClasses.sidebar} transform transition-all duration-300 ease-in-out lg:translate-x-0
          ${positionClasses.sidebarTransform}
          ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
        `}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {navigationItems.map((item) => {
                const isActive = currentActiveTab === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium ${transitionClasses}
                      ${isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                      }
                      ${sidebarCollapsed ? "justify-center" : ""}
                    `}>
                    <item.icon className="w-5 h-5" />
                    {!sidebarCollapsed && (
                      <span className="ml-3 flex items-center">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Usage meter */}
            {!sidebarCollapsed && (
              <div className="p-4 border-t border-gray-200 mt-auto">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <button
                    onClick={() => setIsUsageCollapsed(!isUsageCollapsed)}
                    className="w-full flex items-center justify-between mb-1 focus:outline-none"
                  >
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <Crown className="mr-2 h-4 w-4 text-purple-600" />
                      {userPlan}
                    </span>
                    {isUsageCollapsed ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    )}
                  </button>

                  <div className={`transition-all duration-300 ${isUsageCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[500px] opacity-100 mt-3 overflow-y-auto'}`}>
                    <div className="space-y-3 pr-1 custom-scrollbar">
                      {/* Credits Meter (Only for Free/PAYG) */}
                      {(['Free Plan', 'Pay As You Go'].includes(userPlan) && creditBalance > 0) && (
                        <UsageMeter
                          current={creditBalance}
                          limit={0}
                          planName={userPlan}
                          featureName="credits"
                          mode="credits"
                        />
                      )}

                      {/* Scans Meter - Derived from sub-limits */}
                      <UsageMeter
                        current={
                          ((planUsage?.originality_scan || 0) >= (planLimits?.originality_scan ?? 3) ? 1 : 0) +
                          ((planUsage?.citation_check || 0) >= (typeof planLimits?.citation_check === 'number' ? planLimits.citation_check : 0) ? 1 : 0) +
                          ((planUsage?.rephrase || 0) >= (planLimits?.rephrase_per_month ?? 3) ? 1 : 0)
                        }
                        limit={3}
                        planName={userPlan}
                        featureName="scans"
                      />

                      {/* Originality Meter */}
                      <UsageMeter
                        current={planUsage?.originality_scan || 0}
                        limit={planLimits?.originality_scan ?? 3}
                        planName={userPlan}
                        featureName="originality"
                      />

                      {/* Citations Meter */}
                      <UsageMeter
                        current={planUsage?.citation_check || 0}
                        limit={planLimits?.citation_check ?? 0}
                        planName={userPlan}
                        featureName="citations"
                      />

                      {/* Rephrase Meter */}
                      <UsageMeter
                        current={planUsage?.rephrase_suggestions || 0}
                        limit={planLimits?.rephrase_suggestions ?? 3}
                        planName={userPlan}
                        featureName="rephrase"
                      />
                    </div>
                  </div>

                  {isUsageCollapsed && (() => {
                    const derivedCurrent =
                      ((planUsage?.originality_scan || 0) >= (planLimits?.originality_scan ?? 3) ? 1 : 0) +
                      ((planUsage?.citation_check || 0) >= (typeof planLimits?.citation_check === 'number' ? planLimits.citation_check : 0) ? 1 : 0) +
                      ((planUsage?.rephrase || 0) >= (planLimits?.rephrase_per_month ?? 3) ? 1 : 0);

                    const derivedLimit = 3; // Hardcoded to 3 as requested for typical plans
                    const percent = Math.min((derivedCurrent / derivedLimit) * 100, 100);

                    return (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-end items-center mt-1">
                          <p className="text-[10px] text-gray-400">
                            {derivedCurrent} / {derivedLimit} Scans
                          </p>
                          <span className="text-[10px] text-gray-400 ml-1">
                            ({Math.round(percent)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })()}




                  {/* Show loading indicator when projects are loading */}
                  {subscriptionLoading && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 flex items-center">
                        <span className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                        Loading data...
                      </p>
                    </div>
                  )}

                  {/* Show error message if there was an API error */}
                  {subscriptionError && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {typeof subscriptionError === 'string' ? subscriptionError : 'Error loading subscription'}
                      </p>
                    </div>
                  )}

                  {/* Greeting message */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      {getGreeting()}, {getDisplayName()}!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={positionClasses.mainContent}>
          {subscriptionLoading && !children ? (
            <div className="flex h-[50vh] items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-sm font-medium text-gray-500">
                  Loading workspace...
                </p>
              </div>
            </div>
          ) : children ? (
            children
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
