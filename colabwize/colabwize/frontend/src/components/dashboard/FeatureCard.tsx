import React from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: "ready" | "scanned" | "pending";
  score?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  status = "ready",
  score,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "scanned":
        return "border-gray-200 hover:border-green-500";
      case "pending":
        return "border-gray-200 hover:border-yellow-500";
      default:
        return "border-gray-300 hover:border-indigo-500";
    }
  };

  const getStatusBadge = () => {
    if (status === "scanned" && score !== undefined) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
          Score: {Math.round(score)}%
        </span>
      );
    }
    if (status === "pending") {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
          Scanning...
        </span>
      );
    }
    return null;
  };

  return (
    <div
      className={`rounded-lg p-6 cursor-pointer transition-all ${getStatusColor()} border border-gray-200 bg-[#FFFAFA] shadow-sm hover:shadow-md`}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl">{icon}</div>
        {getStatusBadge()}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
    </div>
  );
};
