import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import ConfigService from "../services/ConfigService";
import {
  Menu,
  X,
  ChevronDown,
  FileText,
  BarChart3,
  Users,
  Zap,
  Bot,
  BookOpen,
  Lightbulb,
  Shield,
  Calendar,
  LayoutDashboard,
  MessageSquareText,
  Map as MapIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../hooks/useAuth";

// Define types for dropdown items
interface DropdownItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  external?: boolean;
}

export default function Navigation() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  // Refs for timeout management
  const productTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const solutionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define dropdown items with icons and descriptions based on footer navigation
  const productItems: DropdownItem[] = [
    {
      name: "Features",
      href: "/features",
      icon: <Zap className="h-5 w-5" />,
      description: "Explore all features of ColabWize",
    },
    {
      name: "Integrations",
      href: "/integrations",
      icon: <Bot className="h-5 w-5" />,
      description: "Connect with your favorite tools",
    },
    {
      name: "What's New",
      href: "/changelog",
      icon: <Calendar className="h-5 w-5" />,
      description: "See the latest updates and improvements",
    },
    {
      name: "Roadmap",
      href: "/roadmap",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Discover what's coming next",
    },
  ];

  const resourcesItems: DropdownItem[] = [
    {
      name: "Blogs",
      href: "/resources/blogs",
      icon: <BookOpen className="h-5 w-5" />,
      description: "Read our latest articles and insights",
    },
    {
      name: "Case Studies",
      href: "/resources/case-studies",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "See how others use ColabWize successfully",
    },
    {
      name: "Help Center",
      href: "/resources/help-center",
      icon: <Lightbulb className="h-5 w-5" />,
      description: "Get help with using ColabWize",
    },
    {
      name: "Documentation",
      href: ConfigService.getDocsUrl(),
      icon: <FileText className="h-5 w-5" />,
      description: "Comprehensive guides and API references",
      external: true,
    },
  ];

  const solutionsItems: DropdownItem[] = [
    {
      name: "Chat with PDFs",
      href: "/solutions/chat-with-pdfs",
      icon: <MessageSquareText className="h-5 w-5" />,
      description: "Interact with your research documents using AI",
    },
    {
      name: "Citation Confidence",
      href: "/solutions/citation-confidence",
      icon: <Shield className="h-5 w-5" />,
      description: "Ensure originality with advanced checking",
    },
    {
      name: "Analytics Metrics",
      href: "/solutions/analytics-metrics",
      icon: <MapIcon className="h-5 w-5" />,
      description: "Visualize your work's metrics",
    },
    {
      name: "Draft Comparison",
      href: "/solutions/draft-comparison",
      icon: <FileText className="h-5 w-5" />,
      description: "Compare your drafts and get insights",
    },
    {
      name: "Collaboration",
      href: "/solutions/collaboration",
      icon: <Users className="h-5 w-5" />,
      description: "Work together seamlessly in real-time",
    },
    {
      name: "Team Workspace",
      href: "/solutions/team-workspace",
      icon: <LayoutDashboard className="h-5 w-5" />,
      description: "Centralized hub to manage your group projects",
    },
  ];

  // Handle mouse enter with delay cancellation
  const handleMouseEnter = (
    setOpen: (open: boolean) => void,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  // Handle mouse leave with delay
  const handleMouseLeave = (
    setOpen: (open: boolean) => void,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
  ) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 300); // 300ms delay before closing
  };

  return (
    <nav className="fixed top-0 w-full bg-[#F3F0EC] border-b border-white z-50 rounded-b-xl">
      <div className="container-custom relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src="/images/Colabwize-logo.png"
              alt="ColabWize Logo"
              className="h-10 w-auto group-hover:shadow-lg transition-all duration-300"
            />
            <span className="text-xl font-bold text-gray-800">ColabWize</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8 static">
            {/* Solutions Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() =>
                handleMouseEnter(setSolutionsOpen, solutionsTimeoutRef)
              }
              onMouseLeave={() =>
                handleMouseLeave(setSolutionsOpen, solutionsTimeoutRef)
              }>
              <div className="text-[15px] font-medium transition-colors duration-200 text-gray-800 hover:text-blue-600 flex items-center gap-1 cursor-pointer focus:outline-none py-4">
                Solutions
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    solutionsOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {solutionsOpen && (
                <div
                  className="fixed top-[64px] left-0 right-0 w-full bg-white border-t border-gray-100 shadow-2xl z-50 p-8 flex justify-center rounded-b-3xl"
                  onMouseEnter={() =>
                    handleMouseEnter(setSolutionsOpen, solutionsTimeoutRef)
                  }
                  onMouseLeave={() =>
                    handleMouseLeave(setSolutionsOpen, solutionsTimeoutRef)
                  }>
                  <div className="container-custom flex justify-between gap-12 pl-12">
                    <div className="flex-[3] grid grid-cols-2 gap-x-12 gap-y-6 pr-12 border-r border-gray-100">
                      <div className="col-span-1 mb-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-3">
                          Integrity & Proof
                        </h3>
                      </div>
                      <div className="col-span-1 mb-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-3">
                          Team & Workspace
                        </h3>
                      </div>
                      {/* Column 1 items */}
                      <div className="flex flex-col gap-1">
                        {solutionsItems.slice(0, 3).map((item, index) => (
                          <Link
                            key={index}
                            to={item.href}
                            className="cursor-pointer flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                            onClick={() => setSolutionsOpen(false)}>
                            <div>
                              <div className="font-semibold text-sm text-gray-900 group-hover/item:text-blue-600">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {/* Column 2 items */}
                      <div className="flex flex-col gap-1">
                        {solutionsItems.slice(3, 6).map((item, index) => (
                          <Link
                            key={index}
                            to={item.href}
                            className="cursor-pointer flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                            onClick={() => setSolutionsOpen(false)}>
                            <div>
                              <div className="font-semibold text-sm text-gray-900 group-hover/item:text-blue-600">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    {/* Right Promo */}
                    <div className="w-[340px] pl-12 flex flex-col justify-center">
                      <div
                        className="bg-[#050B14] rounded-2xl overflow-hidden shadow-2xl h-[280px] w-full relative flex flex-col p-8 text-white cursor-pointer hover:shadow-blue-900/20 transition-all group/promo"
                        onClick={() => {
                          window.location.href = "/solutions/team-workspace";
                          setSolutionsOpen(false);
                        }}>
                        <div className="absolute inset-0 z-0">
                          <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"
                            alt="Team Workspaces"
                            className="w-full h-full object-cover opacity-40 group-hover/promo:scale-105 transition-transform duration-700 block"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent"></div>
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-center">
                          <div className="text-[11px] font-bold tracking-[0.2em] text-center mb-4 uppercase text-blue-400">
                            New Offering
                          </div>
                          <h4 className="text-3xl font-black text-center mb-4 leading-tight tracking-tight">
                            TEAM
                            <br />
                            WORKSPACES
                          </h4>
                          <p className="text-[14px] text-gray-300 mb-6 text-center leading-relaxed">
                            Centralize your team's research. Organize projects
                            and monitor activities seamlessly.
                          </p>
                          <div className="mt-auto text-center">
                            <span className="text-sm font-bold text-white group-hover/promo:text-blue-300 transition-colors border-b-2 border-transparent hover:border-blue-300 pb-1">
                              See how it works &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() =>
                handleMouseEnter(setProductOpen, productTimeoutRef)
              }
              onMouseLeave={() =>
                handleMouseLeave(setProductOpen, productTimeoutRef)
              }>
              <div className="text-[15px] font-medium transition-colors duration-200 text-gray-800 hover:text-blue-600 flex items-center gap-1 cursor-pointer focus:outline-none py-4">
                Product
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    productOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {productOpen && (
                <div
                  className="fixed top-[64px] left-0 right-0 w-full bg-white border-t border-gray-100 shadow-2xl z-50 p-8 flex justify-center rounded-b-3xl"
                  onMouseEnter={() =>
                    handleMouseEnter(setProductOpen, productTimeoutRef)
                  }
                  onMouseLeave={() =>
                    handleMouseLeave(setProductOpen, productTimeoutRef)
                  }>
                  <div className="container-custom flex justify-between gap-12 pl-12">
                    <div className="flex-[3] grid grid-cols-2 gap-x-12 gap-y-6 pr-12 border-r border-gray-100">
                      <div className="col-span-1 mb-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-3">
                          Explore
                        </h3>
                      </div>
                      <div className="col-span-1 mb-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-3">
                          Updates
                        </h3>
                      </div>
                      {/* Column 1 items */}
                      <div className="flex flex-col gap-1">
                        {productItems.slice(0, 2).map((item, index) => (
                          <Link
                            key={index}
                            to={item.href}
                            className="cursor-pointer flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                            onClick={() => setProductOpen(false)}>
                            <div>
                              <div className="font-semibold text-sm text-gray-900 group-hover/item:text-blue-600">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {/* Column 2 items */}
                      <div className="flex flex-col gap-1">
                        {productItems.slice(2, 4).map((item, index) => (
                          <Link
                            key={index}
                            to={item.href}
                            className="cursor-pointer flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                            onClick={() => setProductOpen(false)}>
                            <div>
                              <div className="font-semibold text-sm text-gray-900 group-hover/item:text-blue-600">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                {item.description}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                    {/* Right Promo */}
                    <div className="w-[340px] pl-12 flex flex-col justify-center">
                      <div
                        className="bg-[#050B14] rounded-2xl overflow-hidden shadow-2xl h-[280px] w-full relative flex flex-col p-8 text-white cursor-pointer hover:shadow-indigo-900/20 transition-all group/promo"
                        onClick={() => {
                          window.location.href = "/changelog";
                          setProductOpen(false);
                        }}>
                        <div className="absolute inset-0 z-0">
                          <img
                            src="https://randomill.com/wp-content/uploads/version-release-220.jpg?w=600&q=80"
                            alt="New Version"
                            className="w-full h-full object-cover opacity-30 group-hover/promo:scale-105 transition-transform duration-700 block"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-transparent"></div>
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-center">
                          <div className="text-[11px] font-bold tracking-[0.2em] text-center mb-4 uppercase text-indigo-400">
                            Release
                          </div>
                          <h4 className="text-3xl font-black text-center mb-4 leading-tight tracking-tight">
                            VERSION
                            <br />
                            2.2.0
                          </h4>
                          <p className="text-[14px] text-gray-300 mb-6 text-center leading-relaxed">
                            Discover Chat with PDF, Real-Time Collaboration and
                            more.
                          </p>
                          <div className="mt-auto text-center">
                            <span className="text-sm font-bold text-white group-hover/promo:text-indigo-300 transition-colors border-b-2 border-transparent hover:border-indigo-300 pb-1">
                              View Changelog &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="text-[15px] font-medium transition-colors duration-200 text-gray-800 hover:text-blue-600 flex items-center gap-1 cursor-pointer focus:outline-none py-4">
              <Link to="/pricing">Pricing</Link>
            </div>

            {/* Resources Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() =>
                handleMouseEnter(setResourcesOpen, resourcesTimeoutRef)
              }
              onMouseLeave={() =>
                handleMouseLeave(setResourcesOpen, resourcesTimeoutRef)
              }>
              <div className="text-[15px] font-medium transition-colors duration-200 text-gray-800 hover:text-blue-600 flex items-center gap-1 cursor-pointer focus:outline-none py-4">
                Resources
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    resourcesOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {resourcesOpen && (
                <div
                  className="fixed top-[64px] left-0 right-0 w-full bg-white border-t border-gray-100 shadow-2xl z-50 p-8 flex justify-center rounded-b-3xl"
                  onMouseEnter={() =>
                    handleMouseEnter(setResourcesOpen, resourcesTimeoutRef)
                  }
                  onMouseLeave={() =>
                    handleMouseLeave(setResourcesOpen, resourcesTimeoutRef)
                  }>
                  <div className="container-custom flex justify-between gap-12 pl-12">
                    <div className="flex-[3] grid grid-cols-2 gap-x-12 gap-y-6 pr-12 border-r border-gray-100">
                      <div className="col-span-1 mb-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-3">
                          Learn
                        </h3>
                      </div>
                      <div className="col-span-1 mb-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest pl-3">
                          Support
                        </h3>
                      </div>
                      {/* Column 1 items */}
                      <div className="flex flex-col gap-1">
                        {resourcesItems.slice(0, 2).map((item, index) =>
                          item.external ? (
                            <a
                              key={index}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                              onClick={() => setResourcesOpen(false)}>
                              <div>
                                <div className="font-semibold text-sm text-gray-900 group-hover/item:text-blue-600">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                  {item.description}
                                </div>
                              </div>
                            </a>
                          ) : (
                            <Link
                              key={index}
                              to={item.href}
                              className="cursor-pointer flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                              onClick={() => setResourcesOpen(false)}>
                              <div>
                                <div className="font-semibold text-sm text-gray-900 group-hover/item:text-blue-600">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ),
                        )}
                      </div>
                      {/* Column 2 items */}
                      <div className="flex flex-col gap-1">
                        {resourcesItems.slice(2, 4).map((item, index) =>
                          item.external ? (
                            <a
                              key={index}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="cursor-pointer flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                              onClick={() => setResourcesOpen(false)}>
                              <div>
                                <div className="font-semibold text-sm text-gray-900 group-hover/item:text-blue-600">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                  {item.description}
                                </div>
                              </div>
                            </a>
                          ) : (
                            <Link
                              key={index}
                              to={item.href}
                              className="cursor-pointer flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                              onClick={() => setResourcesOpen(false)}>
                              <div>
                                <div className="font-semibold text-sm text-gray-900 group-hover/item:text-blue-600">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          ),
                        )}
                      </div>
                    </div>
                    {/* Right Promo */}
                    <div className="w-[440px] pl-12 flex flex-col justify-center">
                      <div
                        className="bg-[#050B14] rounded-2xl overflow-hidden shadow-2xl h-[280px] w-full relative flex flex-col p-8 text-white cursor-pointer hover:shadow-emerald-900/20 transition-all group/promo"
                        onClick={() => {
                          window.location.href = "/resources/blogs";
                          setResourcesOpen(false);
                        }}>
                        <div className="absolute inset-0 z-0">
                          <img
                            src="https://youthincmag.com/wp-content/uploads/2020/02/Academic-Integrity.jpg?w=600&q=80"
                            alt="Masterclass"
                            className="w-full h-full object-cover opacity-30 group-hover/promo:scale-105 transition-transform duration-700 mix-blend-luminosity"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/80 to-emerald-900/30"></div>
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-center">
                          <div className="text-[11px] font-bold tracking-[0.2em] text-center mb-4 uppercase text-emerald-400">
                            Masterclass
                          </div>
                          <h4 className="text-3xl font-black text-center mb-4 leading-tight tracking-tight">
                            ACADEMIC
                            <br />
                            INTEGRITY
                          </h4>
                          <p className="text-[14px] text-gray-300 mb-6 text-center leading-relaxed">
                            Learn how to ensure your work is original and
                            well-cited with our comprehensive guides.
                          </p>
                          <div className="mt-auto text-center">
                            <span className="text-sm font-bold text-white group-hover/promo:text-emerald-300 transition-colors border-b-2 border-transparent hover:border-emerald-300 pb-1">
                              Read the Guide &rarr;
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  asChild
                  className="bg-blue-600 border-gray-300 text-white hover:bg-blue-700 hover:text-white font-medium transition-all shadow-sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-blue-600 border-white text-white hover:bg-blue-700 hover:text-white font-semibold shadow-sm transition-all">
                  <Link to="/schedule-demo">Schedule Demo</Link>
                </Button>
                <Button
                  asChild
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/20 rounded-full transition-all duration-300">
                  <Link to="/dashboard">Start ColabWize Free</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="bg-blue-600 border-white text-white hover:bg-blue-700 hover:text-white font-medium transition-all">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-blue-600 border-white text-white hover:bg-blue-700 hover:text-white font-semibold shadow-sm transition-all">
                  <Link to="/schedule-demo">Schedule Demo</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/20 rounded-full contrast-125 hover:scale-105 transition-all duration-300">
                  <Link to="/signup">Start ColabWize Free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu and auth button */}
          <div className="md:hidden flex items-center space-x-3">
            {!user ? (
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold py-1.5 px-4 rounded-lg h-auto shadow-md shadow-blue-500/20">
                <Link to="/signup">Sign up</Link>
              </Button>
            ) : (
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold py-1.5 px-4 rounded-lg h-auto shadow-md shadow-blue-500/20">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-800 hover:text-gray-800">
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}></div>
      )}
      <div
        className={`md:hidden fixed top-16 right-0 left-0 bg-[#F3F0EC] z-40 transition-all duration-300 ease-in-out ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto max-h-screen overflow-y-auto"
            : "opacity-0 -translate-y-full pointer-events-none max-h-0 overflow-hidden"
        }`}>
        <div className="container-custom pt-6 pb-8">
          <div className="flex flex-col space-y-6">
            {/* Mobile Navigation Items */}
            <div className="flex flex-col space-y-4">
              {/* Solutions Dropdown for Mobile */}
              <div className="border-b border-gray-300 pb-4">
                <button
                  onClick={() => {
                    setSolutionsOpen(!solutionsOpen);
                    if (productOpen) setProductOpen(false);
                    if (resourcesOpen) setResourcesOpen(false);
                  }}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-800 py-2">
                  <span>Solutions</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      solutionsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {solutionsOpen && (
                  <div className="mt-2 space-y-2 pl-4">
                    {solutionsItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        className="flex items-center space-x-3 py-2 text-gray-700 hover:text-gray-900"
                        onClick={() => {
                          setIsOpen(false);
                          setSolutionsOpen(false);
                        }}>
                        <span className="text-blue-400">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Dropdown for Mobile */}
              <div className="border-b border-gray-300 pb-4">
                <button
                  onClick={() => {
                    setProductOpen(!productOpen);
                    if (solutionsOpen) setSolutionsOpen(false);
                    if (resourcesOpen) setResourcesOpen(false);
                  }}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-800 py-2">
                  <span>Product</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      productOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {productOpen && (
                  <div className="mt-2 space-y-2 pl-4">
                    {productItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        className="flex items-center space-x-3 py-2 text-gray-700 hover:text-gray-900"
                        onClick={() => {
                          setIsOpen(false);
                          setProductOpen(false);
                        }}>
                        <span className="text-blue-400">{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="border-b border-gray-300 pb-4">
                <Link
                  to="/pricing"
                  className="block py-2 text-gray-800 font-medium"
                  onClick={() => setIsOpen(false)}>
                  Pricing
                </Link>
              </div>

              {/* Resources Dropdown for Mobile */}
              <div className="border-b border-gray-300 pb-4">
                <button
                  onClick={() => {
                    setResourcesOpen(!resourcesOpen);
                    if (solutionsOpen) setSolutionsOpen(false);
                    if (productOpen) setProductOpen(false);
                  }}
                  className="flex justify-between items-center w-full text-left font-medium text-gray-800 py-2">
                  <span>Resources</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      resourcesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {resourcesOpen && (
                  <div className="mt-2 space-y-2 pl-4">
                    {resourcesItems.map((item, index) =>
                      item.external ? (
                        <a
                          key={index}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 py-2 text-gray-700 hover:text-gray-900"
                          onClick={() => {
                            setIsOpen(false);
                            setResourcesOpen(false);
                          }}>
                          <span className="text-blue-400">{item.icon}</span>
                          <span>{item.name}</span>
                        </a>
                      ) : (
                        <Link
                          key={index}
                          to={item.href}
                          className="flex items-center space-x-3 py-2 text-gray-700 hover:text-gray-900"
                          onClick={() => {
                            setIsOpen(false);
                            setResourcesOpen(false);
                          }}>
                          <span className="text-blue-400">{item.icon}</span>
                          <span>{item.name}</span>
                        </Link>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col space-y-3 pt-4">
              <Button
                asChild
                className="w-full py-6 border-gray-200 bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                onClick={() => setIsOpen(false)}>
                <Link to="/schedule-demo">Schedule Demo</Link>
              </Button>
              <Button
                asChild
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md shadow-blue-500/20 rounded-full"
                onClick={() => setIsOpen(false)}>
                <Link to="/signup">Start ColabWize Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
