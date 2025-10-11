import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  onWaitlistClick: () => void;
}

export default function Navbar({ onWaitlistClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 text-center text-sm relative">
        <span>🚀 Launching Q1 2025 - Join 1,234 on the waitlist</span>
        <button
          onClick={onWaitlistClick}
          className="ml-3 underline hover:no-underline font-semibold"
        >
          Join Now
        </button>
      </div>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/colabwize logo.jpg"
                alt="ColabWize Logo"
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-gray-900">
                ColabWize
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/features"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Features
              </Link>
              <Link
                to="/roadmap"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Roadmap
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Contact
              </Link>
              <Link
                to="/help"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Help
              </Link>
              <button
                onClick={onWaitlistClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Join Waitlist
              </button>
            </div>

            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/features"
                className="block text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/roadmap"
                className="block text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Roadmap
              </Link>
              <Link
                to="/about"
                className="block text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/help"
                className="block text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Help
              </Link>
              <Link
                to="/contact"
                className="block text-gray-700 hover:text-blue-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <button
                onClick={() => {
                  onWaitlistClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}