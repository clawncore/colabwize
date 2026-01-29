import React from "react";

import { X, Crown, Zap, HeartCrack } from "lucide-react";
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
  title = "Oops! Limit Reached",
  message = "You've hit your usage limit for now. Upgrade to keep going or grab some credits.",
  feature = "scans",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Reduced Blur Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 overflow-hidden animate-in fade-in zoom-in duration-200 z-[101]">

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
            <HeartCrack className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {title}
          </h3>

          <p className="text-gray-500 mb-6 text-sm leading-relaxed px-2">
            {message}
          </p>

          <div className="grid grid-cols-1 gap-3 w-full">
            <Link
              to="/pricing"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all duration-200"
            >
              <Crown className="w-4 h-4" />
              Upgrade Plan
            </Link>

            <Link
              to="/dashboard/billing/subscription"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-700 font-medium rounded-lg transition-all duration-200 hover:bg-indigo-50/50"
            >
              <Zap className="w-4 h-4" />
              Buy Credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
