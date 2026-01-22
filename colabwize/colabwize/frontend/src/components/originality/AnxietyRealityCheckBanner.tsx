import React from "react";
import { RealityCheckStats } from "../../services/originalityService";
import { ShieldCheck, AlertTriangle, CheckCircle } from "lucide-react";

interface AnxietyRealityCheckBannerProps {
  stats: RealityCheckStats;
  overallScore: number;
  onOpenPanel?: () => void;
}

export const AnxietyRealityCheckBanner: React.FC<
  AnxietyRealityCheckBannerProps
> = ({ stats, overallScore, onOpenPanel }) => {
  // Determine the banner style based on trust score
  const getBannerStyle = () => {
    if (stats.trustScore > 70) {
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-800",
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        status: "Good Standing",
      };
    } else if (stats.trustScore > 40) {
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-800",
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
        status: "Review Needed",
      };
    } else {
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-800",
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        status: "Attention Required",
      };
    }
  };

  const style = getBannerStyle();

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 mb-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{style.icon}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900">
                Academic Reality Check
              </h4>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text} border ${style.border}`}
              >
                {style.status}
              </span>
            </div>
            <p className={`text-sm ${style.text} mb-2`}>
              Overall Score:{" "}
              <span className="font-bold">{Math.round(overallScore)}%</span> |
              References:{" "}
              <span className="font-bold">{stats.referencePercent}%</span> |
              Common Phrases:{" "}
              <span className="font-bold">{stats.commonPhrasePercent}%</span>
            </p>
            <p className="text-sm text-gray-700 italic">"{stats.message}"</p>
          </div>
        </div>
        <button
          onClick={onOpenPanel}
          className="ml-2 px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  );
};
