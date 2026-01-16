import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { Button } from "../ui/button";

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Small delay to show animation
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        <div className="flex-1 flex gap-4 items-start">
          <div className="p-2 bg-indigo-100 rounded-full flex-shrink-0 hidden sm:block">
            <Cookie className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              We value your privacy
              <span className="sm:hidden text-lg">🍪</span>
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
              By clicking "Accept Non-Essential", you consent to our use of cookies.
              Only essential cookies are used if you reject.
              <Link to="/legal/cookies" className="text-indigo-600 hover:text-indigo-700 underline ml-1">
                Read our Cookie Policy
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleReject}
            className="whitespace-nowrap border-gray-300 bg-blue-500 hover:bg-blue-700 text-gray-700"
          >
            Reject Non-Essential
          </Button>
          <Button
            onClick={handleAccept}
            className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            Accept Non-Essential
          </Button>
        </div>
      </div>
    </div>
  );
};
