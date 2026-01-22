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
} from "lucide-react";
import { Button } from "./ui/button";

// Define types for dropdown items
interface DropdownItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  external?: boolean;
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  // const [pricingOpen, setPricingOpen] = useState(false);

  // Refs for timeout management
  const productTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const solutionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // const pricingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      name: "Originality Map",
      href: "/solutions/originality-map",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Track your writing and research progress",
    },
    {
      name: "Citation Confidence",
      href: "/solutions/citation-confidence",
      icon: <Shield className="h-5 w-5" />,
      description: "Ensure originality with advanced checking",
    },
    {
      name: "Authorship Certificate",
      href: "/solutions/authorship-certificate",
      icon: <Users className="h-5 w-5" />,
      description: "Work together seamlessly in real-time",
    },
    {
      name: "Draft Comparison",
      href: "/solutions/draft-comparison",
      icon: <FileText className="h-5 w-5" />,
      description: "Compare your drafts and get insights",
    },
  ];

  // Handle mouse enter with delay cancellation
  const handleMouseEnter = (
    setOpen: (open: boolean) => void,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
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
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
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
      <div className="container-custom">
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
          <div className="hidden md:flex items-center space-x-8">
            {/* Solutions Dropdown - 3 columns */}
            <div
              className="relative"
              onMouseEnter={() =>
                handleMouseEnter(setSolutionsOpen, solutionsTimeoutRef)
              }
              onMouseLeave={() =>
                handleMouseLeave(setSolutionsOpen, solutionsTimeoutRef)
              }>
              <div className="text-sm font-medium transition-colors duration-200 text-gray-800 flex items-center gap-1 cursor-pointer focus:outline-none">
                Solutions
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    solutionsOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {solutionsOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-[42rem] bg-[#F3F0EC] border border-white rounded-xl shadow-lg z-50 p-4"
                  onMouseEnter={() =>
                    handleMouseEnter(setSolutionsOpen, solutionsTimeoutRef)
                  }
                  onMouseLeave={() =>
                    handleMouseLeave(setSolutionsOpen, solutionsTimeoutRef)
                  }>
                  <div className="grid grid-cols-2 gap-3">
                    {solutionsItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        className="cursor-pointer flex flex-col p-4 rounded-lg hover:bg-[#C9BFB2] transition-colors min-h-[100px]"
                        onClick={() => setSolutionsOpen(false)}>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg mr-3 text-blue-400">
                            {item.icon}
                          </div>
                          <div className="font-semibold text-sm text-gray-800">
                            {item.name}
                          </div>
                        </div>
                        <div className="text-xs text-gray-800 pl-13">
                          {item.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Dropdown - 2 columns */}
            <div
              className="relative"
              onMouseEnter={() =>
                handleMouseEnter(setProductOpen, productTimeoutRef)
              }
              onMouseLeave={() =>
                handleMouseLeave(setProductOpen, productTimeoutRef)
              }>
              <div className="text-sm font-medium transition-colors duration-200 text-gray-800 flex items-center gap-1 cursor-pointer focus:outline-none">
                Product
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    productOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {productOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-[36rem] bg-[#F3F0EC] border border-white rounded-xl shadow-lg z-50 p-4"
                  onMouseEnter={() =>
                    handleMouseEnter(setProductOpen, productTimeoutRef)
                  }
                  onMouseLeave={() =>
                    handleMouseLeave(setProductOpen, productTimeoutRef)
                  }>
                  <div className="grid grid-cols-2 gap-3">
                    {productItems.map((item, index) => (
                      <Link
                        key={index}
                        to={item.href}
                        className="cursor-pointer flex flex-col p-4 rounded-lg hover:bg-[#C9BFB2] transition-colors min-h-[100px]"
                        onClick={() => setProductOpen(false)}>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg mr-3 text-blue-400">
                            {item.icon}
                          </div>
                          <div className="font-semibold text-sm text-gray-800">
                            {item.name}
                          </div>
                        </div>
                        <div className="text-xs text-gray-800 pl-13">
                          {item.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm font-medium transition-colors duration-200 text-gray-800 flex items-center gap-1 cursor-pointer focus:outline-none">
              <Link to="/pricing">Pricing</Link>
            </div>

            {/* Resources Dropdown - 3 columns */}
            <div
              className="relative"
              onMouseEnter={() =>
                handleMouseEnter(setResourcesOpen, resourcesTimeoutRef)
              }
              onMouseLeave={() =>
                handleMouseLeave(setResourcesOpen, resourcesTimeoutRef)
              }>
              <div className="text-sm font-medium transition-colors duration-200 text-gray-800 flex items-center gap-1 cursor-pointer focus:outline-none">
                Resources
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    resourcesOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
              {resourcesOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-[42rem] bg-[#F3F0EC] border border-white rounded-xl shadow-lg z-50 p-4"
                  onMouseEnter={() =>
                    handleMouseEnter(setResourcesOpen, resourcesTimeoutRef)
                  }
                  onMouseLeave={() =>
                    handleMouseLeave(setResourcesOpen, resourcesTimeoutRef)
                  }>
                  <div className="grid grid-cols-2 gap-3">
                    {resourcesItems.map((item, index) =>
                      item.external ? (
                        <a
                          key={index}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="cursor-pointer flex flex-col p-4 rounded-lg hover:bg-[#C9BFB2] transition-colors min-h-[100px]"
                          onClick={() => setResourcesOpen(false)}>
                          <div className="flex items-center mb-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg mr-3 text-blue-400">
                              {item.icon}
                            </div>
                            <div className="font-semibold text-sm text-gray-800">
                              {item.name}
                            </div>
                          </div>
                          <div className="text-xs text-gray-800 pl-13">
                            {item.description}
                          </div>
                        </a>
                      ) : (
                        <Link
                          key={index}
                          to={item.href}
                          className="cursor-pointer flex flex-col p-4 rounded-lg hover:bg-[#C9BFB2] transition-colors min-h-[100px]"
                          onClick={() => setResourcesOpen(false)}>
                          <div className="flex items-center mb-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg mr-3 text-blue-400">
                              {item.icon}
                            </div>
                            <div className="font-semibold text-sm text-gray-800">
                              {item.name}
                            </div>
                          </div>
                          <div className="text-xs text-gray-800 pl-13">
                            {item.description}
                          </div>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              asChild
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
              <Link to="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
              <Link to="/schedule-demo">Schedule Demo</Link>
            </Button>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all">
              <Link to="/signup">Start ColabWize Free</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
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
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col space-y-3 pt-4">
              <Button
                asChild
                variant="outline"
                className="w-full py-6 border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-semibold"
                onClick={() => setIsOpen(false)}>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full py-6 border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-semibold"
                onClick={() => setIsOpen(false)}>
                <Link to="/schedule-demo">Schedule Demo</Link>
              </Button>
              <Button
                asChild
                className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-gray-800"
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
