import React from "react";

interface UsageMeterProps {
  current: number;
  limit: number | string;
  planName: string;
  featureName?: string;
  mode?: "subscription" | "credits";
}

export const UsageMeter: React.FC<UsageMeterProps> = ({
  current,
  limit,
  planName,
  featureName = "scans",
  mode = "subscription",
}) => {
  // Logic for Credit Mode
  if (mode === "credits") {
    // Hide credits for paid plans - strict check
    const normalizedPlan = planName.toLowerCase();
    const paidPlans = ["researcher", "student"];

    if (paidPlans.some(p => normalizedPlan.includes(p))) {
      return null;
    }

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Available Credits
            </span>
            <span className="text-xs text-gray-500 ml-2">({planName})</span>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></div>
            <span className="text-sm font-semibold text-indigo-700">{current} Credits</span>
          </div>
          <a href="/pricing" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline">
            Top Up
          </a>
        </div>
      </div>
    );
  }

  // Calculate percentage for Subscription Mode
  const isUnlimited = limit === "unlimited" || limit === -1 || limit === -2;
  const isZeroQuery = limit === 0;
  const percentage = isUnlimited ? 0 : isZeroQuery ? 100 : Math.min((current / (limit as number)) * 100, 100);

  // Determine color based on usage
  const getColor = () => {
    if (isUnlimited) return "bg-green-500";
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTextColor = () => {
    if (isUnlimited) return "text-green-600";
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">
          {featureName.charAt(0).toUpperCase() + featureName.slice(1)} Used
        </span>
      </div>
      <div className={`text-sm font-semibold ${getTextColor()}`}>
        {isUnlimited ? (
          <span>Unlimited</span>
        ) : (
          <span>
            {current} / {limit}
          </span>
        )}
      </div>

      {
        !isUnlimited && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getColor()} transition-all duration-300 ease-in-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {percentage >= 80 && (
              <div className="mt-2 flex items-center justify-between">
                <p className={`text-xs ${getTextColor()}`}>
                  {percentage >= 100
                    ? "Limit reached!"
                    : `${Math.round(100 - percentage)}% remaining`}
                </p>
                {percentage >= 90 && (
                  <a
                    href="/pricing"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500 underline"
                  >
                    Upgrade Plan
                  </a>
                )}
              </div>
            )}
          </>
        )
      }
    </div >
  );
};
