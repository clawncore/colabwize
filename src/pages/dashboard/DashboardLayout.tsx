import { useState, useEffect, useCallback } from "react";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../../hooks/useAuth";
import { useUser } from "../../services/useUser";
import { documentService } from "../../services/documentService";
import certificateService from "../../services/certificateService";
import WorkspaceService, { Workspace } from "../../services/workspaceService";
import { usePresence } from "../../hooks/usePresence";
import PendingInvitationsBanner from "../../components/workspace/PendingInvitationsBanner";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { UsageMeter } from "../../components/subscription/UsageMeter";
import { useIsMobile } from "../../hooks/useIsMobile";
import MobileRestrictedPage from "../MobileRestrictedPage";
import { useSubscriptionStore } from "../../stores/useSubscriptionStore";
import {
  Search,
  Menu,
  X,
  Users,
  Folder,
  Home,
  Settings,
  CreditCard,
  Zap,
  LogOut,
  Trash2,
  Crown,
  FileText,
  Lock,
  Plus,
  Hash,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Bell,
  AlertCircle,
  Calendar,
  LayoutDashboard,
  Briefcase,
  Layout,
  Trello,
  BarChart2,
  MessageSquare,
  List,
  Sparkles,
  User,
  HelpCircle,
  Rocket,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

interface DashboardLayoutProps {
  children?: ReactNode;
  activeTab?: string;
}

export default function DashboardLayout({
  children,
  activeTab,
}: DashboardLayoutProps) {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // Check for mobile device
  // Extract workspace ID from URL path if present
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const workspaceIdMatch = pathname.match(/\/dashboard\/workspace\/([^/]+)/);
  const currentWorkspaceId = workspaceIdMatch
    ? workspaceIdMatch[1]
    : searchParams.get("id");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isUsageCollapsed, setIsUsageCollapsed] = useState(true);

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(workspaceId)
        ? prev.filter((id) => id !== workspaceId)
        : [...prev, workspaceId],
    );
  };
  const { user, loading } = useUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false);

  const primaryWorkspaceId =
    workspaces.length > 0 ? `workspace-${workspaces[0].id}` : "";
  usePresence(primaryWorkspaceId);

  // Global Subscription Store
  const {
    plan,
    limits: planLimits,
    usage: planUsage,
    creditBalance,
    fetchSubscription,
    loading: subscriptionLoading,
    status: subscriptionStatus,
    error: subscriptionError,
  } = useSubscriptionStore();

  // Fetch workspaces
  const fetchWorkspaces = useCallback(async () => {
    // Wait for both user AND token to be ready
    if (!user) return;

    setLoadingWorkspaces(true);
    try {
      const data = await WorkspaceService.getWorkspaces();
      setWorkspaces(data || []);
    } catch (err) {
      console.error("Failed to fetch workspaces in sidebar:", err);
    } finally {
      setLoadingWorkspaces(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  // Prevent indexing of dashboard pages
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.getElementsByTagName("head")[0].appendChild(meta);
    return () => {
      document.getElementsByTagName("head")[0].removeChild(meta);
    };
  }, []);

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
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (activeTab) return activeTab;

    const path = location.pathname;

    // More specific route matching to ensure correct tab highlighting
    if (path === "/dashboard" || path.startsWith("/dashboard/overview"))
      return "dashboard";
    if (path.startsWith("/dashboard/documents")) return "projects";
    if (path.startsWith("/dashboard/settings")) return "settings";
    if (path.startsWith("/dashboard/billing/subscription")) return "billing";
    if (path.startsWith("/dashboard/pdf-upload")) return "pdf-chat";
    if (path.startsWith("/dashboard/workspace/")) return "workspace";
    if (path.startsWith("/dashboard/admin")) return "admin";
    if (path.startsWith("/dashboard/admin/")) return "admin";
    if (path.startsWith("/dashboard/recycle-bin")) return "recycle-bin";
    if (path.startsWith("/dashboard/notifications")) return "notifications";
    // Default fallback
    return "dashboard";
  };

  // Recalculate active tab whenever location changes
  const currentActiveTab = getActiveTab();

  // Fetch real project count and subscription data
  useEffect(() => {
    // Only trigger fetch if authenticated
    const isAuthSettled = !loading && isAuthenticated() && !!user;

    if (isAuthSettled) {
      // Force refresh if returning from checkout (success=true or invoice id present)
      const isCheckoutReturn =
        searchParams.get("success") === "true" ||
        searchParams.has("checkout_success");
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

  // Define navigation categories
  const privateItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    {
      id: "projects",
      label: "My Projects",
      icon: Folder,
      href: "/dashboard/documents",
    },
    {
      id: "pdf-chat",
      label: "PDF Chat",
      icon: Sparkles,
      href: "/dashboard/pdf-upload",
    },
  ];

  const isAdmin = workspaces.some(
    (w) => w.role === "admin" || w.owner_id === user?.id,
  );

  const bottomItems = [
    {
      id: "admin",
      label: "Admin",
      icon: Users,
      href: "/dashboard/admin",
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
      id: "settings",
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings/profile",
    },
  ].filter((item) => item.id !== "admin" || isAdmin);

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

    if (id === "plus" || id === "student") return "Plus";
    if (id === "premium" || id === "researcher") return "Premium";
    if (id === "payg") return "Pay As You Go";
    if (id === "free") return "Free Plan";

    // Fallback
    return planId.charAt(0).toUpperCase() + planId.slice(1);
  };

  const userPlan = getPlanDisplayName(plan);

  // Collaboration usage limits based on plan
  const collaborationLimits = (() => {
    const p = userPlan.toLowerCase();
    if (
      p.includes("premium") ||
      p.includes("pro") ||
      p.includes("researcher")
    ) {
      return {
        workspaces: "unlimited" as const,
        collaborators: "unlimited" as const,
      };
    }
    if (p.includes("plus") || p.includes("student")) {
      return { workspaces: 5, collaborators: 10 };
    }
    return { workspaces: 1, collaborators: 2 };
  })();

  // Current workspace status
  const currentWorkspace = workspaces.find(
    (ws) => ws.id === currentWorkspaceId,
  );
  const currentWorkspaceMemberCount =
    currentWorkspace?._count?.members || currentWorkspace?.members?.length || 0;

  const handleSignOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  type PlanType = "Plus" | "Premium" | "Free Plan" | string;

  const getPlanBadgeColor = (plan: PlanType): string => {
    if (plan === "Plus") {
      return "bg-gradient-to-r from-blue-500 to-cyan-600 text-white";
    }
    if (plan === "Premium") {
      return "bg-gradient-to-r from-purple-600 to-indigo-700 text-white";
    }
    if (plan === "Pay As You Go") {
      return "bg-amber-100 text-amber-700 border border-amber-200";
    }
    return "bg-gray-100 text-gray-700";
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
    const Icon = userPlan === "Premium" ? Crown : Rocket;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${planColor} shadow-sm border border-white/10`}>
        <Icon className="mr-1 h-3 w-3" />
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
              (doc.description &&
                doc.description.toLowerCase().includes(query)),
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
      mainContent: `flex-1 h-full overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"} pt-16 lg:pt-0`,
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
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      {/* Top Navigation */}
      <nav className={`${positionClasses.topNav} flex-shrink-0`}>
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
                  {/* Loading State for Badge */}
                  {subscriptionLoading || subscriptionStatus === "unknown" ? (
                    <span className="ml-2 h-5 w-16 bg-gray-200 animate-pulse rounded-full"></span>
                  ) : (
                    userPlan &&
                    userPlan !== "Free Plan" &&
                    userPlan !== "Free" && (
                      <span
                        className={`
                      ml-0.5 px-2 py-1 text-xs font-bold rounded-full shadow-sm
                      ${
                        userPlan.includes("Plus") || userPlan.includes("Pro")
                          ? "bg-blue-600 text-white"
                          : "bg-purple-600 text-white"
                      }
                    `}>
                        {userPlan.includes("Plus") || userPlan.includes("Pro")
                          ? "PLUS"
                          : "PREMIUM"}
                      </span>
                    )
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
              {/* Notifications */}
              {workspaces.length > 0 && <NotificationBell />}

              {/* Profile dropdown */}
              <div className="relative profile-dropdown">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 ${transitionClasses}`}>
                  <div
                    className={`
                    relative w-8 h-8 rounded-full flex items-center justify-center
                    ${
                      userPlan === "Free Plan" || !userPlan
                        ? "bg-gradient-to-br from-gray-400 to-gray-600"
                        : userPlan.includes("Plus") || userPlan.includes("Pro")
                          ? "bg-gradient-to-br from-blue-500 to-blue-700"
                          : "bg-gradient-to-br from-purple-500 to-purple-700"
                    }
                  `}>
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-medium text-sm">
                        {user?.user_metadata?.full_name
                          ? user.user_metadata.full_name.charAt(0).toUpperCase()
                          : user?.email?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                    {userPlan &&
                      userPlan !== "Free Plan" &&
                      userPlan !== "Free" && (
                        <div
                          className={`
                        absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm
                        ${
                          userPlan.includes("Plus") || userPlan.includes("Pro")
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
                          ${
                            userPlan === "Free Plan" || !userPlan
                              ? "bg-gradient-to-br from-gray-400 to-gray-600"
                              : userPlan.includes("Plus") ||
                                  userPlan.includes("Pro")
                                ? "bg-gradient-to-br from-blue-500 to-blue-700"
                                : "bg-gradient-to-br from-purple-500 to-purple-700"
                          }
                        `}>
                          {user?.user_metadata?.avatar_url ? (
                            <img
                              src={user.user_metadata.avatar_url}
                              alt="Profile"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium">
                              {user?.user_metadata?.full_name
                                ? user.user_metadata.full_name
                                    .charAt(0)
                                    .toUpperCase()
                                : user?.email?.charAt(0).toUpperCase() || "U"}
                            </span>
                          )}
                          {userPlan &&
                            userPlan !== "Free Plan" &&
                            userPlan !== "Free" && (
                              <div
                                className={`
                              absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-sm
                              ${
                                userPlan.includes("Plus") ||
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
                            {user?.user_metadata?.full_name ||
                              user?.email?.split("@")[0]}
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
                        <User className="w-4 h-4 mr-3 text-gray-500" />
                        View Profile
                      </Link>

                      <Link
                        to="/dashboard/documents"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${transitionClasses}`}>
                        <FileText className="w-4 h-4 mr-3 text-gray-500" />
                        My Documents
                      </Link>

                      <Link
                        to="/dashboard/settings/help"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${transitionClasses}`}>
                        <HelpCircle className="w-4 h-4 mr-3 text-gray-500" />
                        Help Center
                      </Link>

                      <Link
                        to="/dashboard/settings/account"
                        className={`flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${transitionClasses}`}>
                        <Settings className="w-4 h-4 mr-3 text-gray-500" />
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
          ${positionClasses.sidebar} transform transition-all duration-300 ease-in-out lg:translate-x-0
          ${positionClasses.sidebarTransform}
          ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"}
        `}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            {/* Navigation Sections */}
            <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto custom-scrollbar">
              {/* Private Section */}
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between px-3 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Lock className="w-3 h-3 mr-1.5" /> Private
                    </span>
                  </div>
                )}
                {privateItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={`
                      flex items-center px-3 py-2 rounded-lg text-sm font-medium ${transitionClasses}
                      ${
                        currentActiveTab === item.id
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      }
                      ${sidebarCollapsed ? "justify-center" : ""}
                    `}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="ml-3 truncate">{item.label}</span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Teamspaces Section */}
              <div className="space-y-1 pt-4 mt-2 border-t border-border">
                {!sidebarCollapsed && (
                  <div className="flex items-center justify-between px-3 mb-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
                      <Users className="w-3 h-3 mr-1.5" /> Teamspaces
                    </span>
                    <Link
                      to="/dashboard/admin"
                      className="text-muted-foreground hover:text-emerald-500 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
                {loadingWorkspaces ? (
                  <div className="px-3 py-2 space-y-2 animate-pulse">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  </div>
                ) : workspaces.length > 0 ? (
                  workspaces.map((ws) => {
                    const isExpanded = expandedWorkspaces.includes(ws.id);
                    const isActive = currentWorkspaceId === ws.id;

                    return (
                      <div key={ws.id} className="mb-1">
                        <div
                          className={`
                            flex items-center px-3 py-2 rounded-lg text-sm font-medium ${transitionClasses} group
                            ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
                            }
                            ${sidebarCollapsed ? "justify-center" : "justify-between"}
                          `}
                          onClick={() =>
                            !sidebarCollapsed && toggleWorkspace(ws.id)
                          }>
                          <div className="flex items-center flex-1 min-w-0">
                            {ws.icon ? (
                              <span className={`text-base flex-shrink-0`}>
                                {ws.icon}
                              </span>
                            ) : (
                              <Hash
                                className={`w-4 h-4 flex-shrink-0 ${
                                  isActive
                                    ? "text-emerald-500"
                                    : "text-slate-300"
                                }`}
                              />
                            )}
                            {!sidebarCollapsed && (
                              <span className="ml-3 truncate">{ws.name}</span>
                            )}
                          </div>

                          {!sidebarCollapsed && (
                            <ChevronRight
                              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          )}
                        </div>

                        {/* Sub-navigation items */}
                        {!sidebarCollapsed && isExpanded && (
                          <div className="mt-1 ml-4 space-y-1 border-l border-slate-200 pl-2">
                            <Link
                              to={`/dashboard/workspace/${ws.id}/overview`}
                              className={`
                                flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                ${
                                  pathname ===
                                  `/dashboard/workspace/${ws.id}/overview`
                                    ? "text-emerald-600 bg-emerald-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }
                              `}>
                              <LayoutDashboard className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                              Overview
                            </Link>
                            <Link
                              to={`/dashboard/workspace/${ws.id}/projects`}
                              className={`
                                flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                ${
                                  pathname.includes(
                                    `/workspace/${ws.id}/projects`,
                                  )
                                    ? "text-emerald-600 bg-emerald-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }
                              `}>
                              <Briefcase className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                              Projects
                            </Link>
                            <Link
                              to={`/dashboard/workspace/${ws.id}/templates`}
                              className={`
                                flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                ${
                                  pathname.includes(
                                    `/workspace/${ws.id}/templates`,
                                  )
                                    ? "text-emerald-600 bg-emerald-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }
                              `}>
                              <Layout className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                              Templates
                            </Link>
                            <Link
                              to={`/dashboard/workspace/${ws.id}/files`}
                              className={`
                                flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                ${
                                  pathname.includes(`/workspace/${ws.id}/files`)
                                    ? "text-emerald-600 bg-emerald-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }
                              `}>
                              <FileText className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                              Files
                            </Link>
                            <Link
                              to={`/dashboard/workspace/${ws.id}/kanban`}
                              className={`
                                flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                ${
                                  pathname.includes(
                                    `/workspace/${ws.id}/kanban`,
                                  ) && !searchParams.get("view")
                                    ? "text-emerald-600 bg-emerald-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }
                              `}>
                              <Trello className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                              Kanban
                            </Link>
                            <Link
                              to={`/dashboard/workspace/${ws.id}/kanban?view=calendar`}
                              className={`
                                flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                ${
                                  pathname.includes(
                                    `/workspace/${ws.id}/kanban`,
                                  ) && searchParams.get("view") === "calendar"
                                    ? "text-emerald-600 bg-emerald-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }
                              `}>
                              <Calendar className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                              Calendar
                            </Link>
                            <Link
                              to={`/dashboard/workspace/${ws.id}/analytics`}
                              className={`
                                flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                ${
                                  pathname.includes(
                                    `/workspace/${ws.id}/analytics`,
                                  )
                                    ? "text-emerald-600 bg-emerald-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }
                              `}>
                              <BarChart2 className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                              Analytics
                            </Link>
                            <Link
                              to={`/dashboard/workspace/${ws.id}/chat`}
                              className={`
                                flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                ${
                                  pathname.includes(`/workspace/${ws.id}/chat`)
                                    ? "text-emerald-600 bg-emerald-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }
                              `}>
                              <MessageSquare className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                              Chat
                            </Link>
                            <Link
                              to={`/dashboard/workspace/${ws.id}/notifications`}
                              className={`
                                flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                ${
                                  pathname.includes(
                                    `/workspace/${ws.id}/notifications`,
                                  )
                                    ? "text-emerald-600 bg-emerald-50/50"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                }
                              `}>
                              <Bell className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                              Notifications
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  !sidebarCollapsed && (
                    <p className="px-3 py-2 text-[10px] text-slate-400 italic">
                      No workspaces
                    </p>
                  )
                )}
              </div>

              {/* Utility Section */}
              <div className="space-y-1 pt-4 border-t border-border">
                {bottomItems.map((item) => {
                  if (item.id === "admin") {
                    const isAdminExpanded =
                      expandedWorkspaces.includes("admin-section");

                    return (
                      <div key={item.id}>
                        <div
                          onClick={() =>
                            !sidebarCollapsed &&
                            (workspaces.filter((ws: any) => ws.role === "admin")
                              .length === 0
                              ? navigate("/dashboard/admin")
                              : toggleWorkspace("admin-section"))
                          }
                          className={`
                            flex items-center px-3 py-2 rounded-lg text-sm font-medium ${transitionClasses} cursor-pointer
                            ${
                              currentActiveTab === item.id
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            }
                            ${sidebarCollapsed ? "justify-center" : "justify-between"}
                          `}>
                          <div className="flex items-center">
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!sidebarCollapsed && (
                              <span className="ml-3 truncate">
                                {item.label}
                              </span>
                            )}
                          </div>
                          {!sidebarCollapsed && (
                            <ChevronRight
                              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                                isAdminExpanded ? "rotate-90" : ""
                              }`}
                            />
                          )}
                        </div>

                        {/* Admin Sub-menu */}
                        {!sidebarCollapsed && isAdminExpanded && (
                          <div className="mt-1 ml-4 space-y-1 border-l border-slate-200 pl-2">
                            {workspaces
                              .filter((ws: any) => ws.role === "admin")
                              .map((ws: any) => (
                                <div key={`admin-${ws.id}`}>
                                  <div
                                    className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
                                    onClick={() =>
                                      toggleWorkspace(`admin-${ws.id}`)
                                    }>
                                    <div className="flex items-center flex-1 min-w-0">
                                      {ws.icon ? (
                                        <span className="text-sm flex-shrink-0">
                                          {ws.icon}
                                        </span>
                                      ) : (
                                        <Hash className="w-3 h-3 flex-shrink-0 text-slate-300" />
                                      )}
                                      <span className="ml-2 truncate">
                                        {ws.name}
                                      </span>
                                    </div>
                                    <ChevronRight
                                      className={`w-3 h-3 transition-transform duration-200 ${
                                        expandedWorkspaces.includes(
                                          `admin-${ws.id}`,
                                        )
                                          ? "rotate-90"
                                          : ""
                                      }`}
                                    />
                                  </div>

                                  {expandedWorkspaces.includes(
                                    `admin-${ws.id}`,
                                  ) && (
                                    <div className="ml-2 pl-2 border-l border-slate-200 mt-1 space-y-1">
                                      <Link
                                        to={`/dashboard/admin/${ws.id}/members`}
                                        className={`
                                        flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                        ${
                                          pathname.includes(
                                            `/admin/${ws.id}/members`,
                                          )
                                            ? "text-emerald-600 bg-emerald-50/50"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }
                                      `}>
                                        <Users className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                                        Members
                                      </Link>
                                      <Link
                                        to={`/dashboard/admin/${ws.id}/settings`}
                                        className={`
                                        flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                        ${
                                          pathname.includes(
                                            `/admin/${ws.id}/settings`,
                                          )
                                            ? "text-emerald-600 bg-emerald-50/50"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }
                                      `}>
                                        <Settings className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                                        Settings
                                      </Link>
                                      <Link
                                        to={`/dashboard/admin/${ws.id}/activity`}
                                        className={`
                                        flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                        ${
                                          pathname.includes(
                                            `/admin/${ws.id}/activity`,
                                          )
                                            ? "text-emerald-600 bg-emerald-50/50"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }
                                      `}>
                                        <List className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                                        Activity Log
                                      </Link>
                                      <Link
                                        to={`/dashboard/admin/${ws.id}/notifications`}
                                        className={`
                                        flex items-center px-3 py-1.5 rounded-md text-xs font-medium ${transitionClasses}
                                        ${
                                          pathname.includes(
                                            `/admin/${ws.id}/notifications`,
                                          )
                                            ? "text-emerald-600 bg-emerald-50/50"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                        }
                                      `}>
                                        <Bell className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                                        Notifications
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      className={`
                        flex items-center px-3 py-2 rounded-lg text-sm font-medium ${transitionClasses}
                        ${
                          currentActiveTab === item.id
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        }
                        ${sidebarCollapsed ? "justify-center" : ""}
                      `}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="ml-3 truncate">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Usage meter */}
            {!sidebarCollapsed && (
              <div className="p-4 border-t border-gray-200 mt-auto">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="w-full flex items-center justify-between mb-1 focus:outline-none">
                    {subscriptionLoading || subscriptionStatus === "unknown" ? (
                      <div className="flex items-center space-x-2 w-full">
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsUsageCollapsed(!isUsageCollapsed)}
                        className="w-full flex items-center justify-between focus:outline-none">
                        <span className="text-sm font-medium text-gray-700 flex items-center">
                          {userPlan === "Premium" ? (
                            <Crown className="mr-2 h-4 w-4 text-purple-600" />
                          ) : userPlan === "Plus" ? (
                            <Rocket className="mr-2 h-4 w-4 text-blue-600" />
                          ) : (
                            <Zap className="mr-2 h-4 w-4 text-amber-500" />
                          )}
                          {userPlan}
                        </span>
                        {isUsageCollapsed ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>

                  <div
                    className={`transition-all duration-300 ${isUsageCollapsed ? "max-h-0 opacity-0 overflow-hidden" : "max-h-[500px] opacity-100 mt-3 overflow-y-auto"}`}>
                    <div className="space-y-3 pr-1 custom-scrollbar">
                      {/* Credits Meter (Only for Free/PAYG) */}
                      {["Free Plan", "Pay As You Go"].includes(userPlan) &&
                        creditBalance > 0 && (
                          <UsageMeter
                            current={creditBalance}
                            limit={0}
                            planName={userPlan}
                            featureName="credits"
                            mode="credits"
                          />
                        )}

                      {/* Scans Meter */}
                      <UsageMeter
                        current={
                          planUsage?.scan || planUsage?.scans_per_month || 0
                        }
                        limit={planLimits?.scans_per_month ?? 3}
                        planName={userPlan}
                        featureName="scans"
                      />

                      {/* Citations Meter */}
                      <UsageMeter
                        current={
                          planUsage?.citation_check ||
                          planUsage?.citation_audit ||
                          0
                        }
                        limit={
                          planLimits?.citation_audit ??
                          planLimits?.citation_check ??
                          0
                        }
                        planName={userPlan}
                        featureName="citations"
                      />

                      {/* Rephrase Meter */}
                      <UsageMeter
                        current={
                          planUsage?.rephrase ||
                          planUsage?.rephrase_suggestions ||
                          0
                        }
                        limit={planLimits?.rephrase_suggestions ?? 3}
                        planName={userPlan}
                        featureName="rephrase"
                      />

                      {/* Workspaces Meter */}
                      <UsageMeter
                        current={workspaces.length}
                        limit={collaborationLimits.workspaces}
                        planName={userPlan}
                        featureName="workspaces"
                      />

                      {/* Collaborators Meter (Only show when in a workspace) */}
                      {currentWorkspaceId && (
                        <UsageMeter
                          current={currentWorkspaceMemberCount}
                          limit={collaborationLimits.collaborators}
                          planName={userPlan}
                          featureName="collaborators"
                        />
                      )}
                    </div>
                  </div>

                  {isUsageCollapsed &&
                    (() => {
                      const currentScans =
                        planUsage?.scan || planUsage?.scans_per_month || 0;
                      const limitScans = planLimits?.scans_per_month ?? 3;

                      const isPremium =
                        userPlan.toLowerCase().includes("premium") ||
                        userPlan.toLowerCase().includes("plus");

                      const percent = isPremium
                        ? 0
                        : Math.min((currentScans / limitScans) * 100, 100);

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
                              {currentScans} / {limitScans} Scans
                            </p>
                            {!isPremium && (
                              <span className="text-[10px] text-gray-400 ml-1">
                                ({Math.round(percent)}%)
                              </span>
                            )}
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

                  {/* Graceful Error Handling - Retry Button */}
                  {subscriptionError && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs text-gray-500 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1 text-orange-500" />
                          <span>Status: Offline</span>
                        </p>
                        <button
                          onClick={() => fetchSubscription(true, true)}
                          className="text-xs flex items-center justify-center gap-1 w-full py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors">
                          Retry Connection
                        </button>
                      </div>
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
          <PendingInvitationsBanner onInvitationAction={fetchWorkspaces} />
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
