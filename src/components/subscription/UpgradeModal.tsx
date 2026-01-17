import React from "react";
import { X, Crown, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  feature?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  title = "Limit Reached",
  message = "You have reached your free usage limit. Please upgrade to continue.",
  feature = "scans",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred Backdrop - Lighter and more blurred */}
      <div
        className="absolute inset-0 bg-white/30 backdrop-blur-xl transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal Content - Smaller width */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-sm w-full p-6 overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/50">
        {/* Decorative Background Pattern */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Crown className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h3>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="grid grid-cols-1 gap-4 w-full">
            <Link
              to="/pricing"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Pro
            </Link>

            <Link
              to="/dashboard/billing/subscription"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border-2 border-indigo-100 hover:border-indigo-200 text-indigo-700 font-semibold rounded-xl transition-all duration-200 hover:bg-indigo-50"
            >
              <Zap className="w-5 h-5" />
              Buy Credits
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-400">
            Secure processing by Lemon Squeezy
          </p>
        </div>
      </div>
    </div>
  );
};
