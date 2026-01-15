import React from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  usageStats: {
    used: number;
    limit: number;
  };
  featureName?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  usageStats,
  featureName = "scans",
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    navigate("/pricing");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-yellow-100 p-3">
              <svg
                className="h-8 w-8 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Monthly Limit Reached
          </h2>
          <p className="text-gray-600 text-center mb-6">
            You've used all <strong>{usageStats.limit}</strong> {featureName} in
            your <strong className="capitalize">{currentPlan}</strong> plan this
            month.
          </p>

          {/* Usage Stats */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Current Usage</span>
              <span className="text-sm font-semibold text-red-600">
                {usageStats.used} / {usageStats.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Recommended Plans */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Recommended Upgrades:
            </h3>
            <div className="space-y-2">
              {currentPlan === "free" && (
                <>
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Student Plan</p>
                      <p className="text-xs text-gray-600">50 scans/month</p>
                    </div>
                    <p className="text-lg font-bold text-indigo-600">
                      $4.99/mo
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Researcher Plan
                      </p>
                      <p className="text-xs text-gray-600">Unlimited scans</p>
                    </div>
                    <p className="text-lg font-bold text-indigo-600">
                      $12.99/mo
                    </p>
                  </div>
                </>
              )}
              {currentPlan === "student" && (
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Researcher Plan</p>
                    <p className="text-xs text-gray-600">
                      Unlimited scans + priority support
                    </p>
                  </div>
                  <p className="text-lg font-bold text-indigo-600">$12.99/mo</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Maybe Later
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
