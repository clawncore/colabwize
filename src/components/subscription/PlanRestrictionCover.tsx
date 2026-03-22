import React from "react";
import { Crown, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface PlanRestrictionCoverProps {
  requiredPlan: "Plus" | "Premium";
  featureName: string;
  featureDescription: string;
}

export const PlanRestrictionCover: React.FC<PlanRestrictionCoverProps> = ({
  requiredPlan,
  featureName,
  featureDescription,
}) => {
  const isPremium = requiredPlan === "Premium";

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-6 animate-in fade-in duration-700">
      {/* Premium Glassmorphic Overlay (Full Coverage) - More Transparent */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 dark:border-white/5" />

      <div className="relative max-w-lg w-full flex flex-col items-center text-center p-8 space-y-8">
        {/* Minimalist Icon Styling */}
        <div className="relative">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl backdrop-blur-md border border-white/20 dark:border-white/10 bg-white/5 dark:bg-white/5 ${
              isPremium
                ? "text-purple-600 dark:text-purple-400"
                : "text-blue-600 dark:text-blue-400"
            }`}>
            <Lock className="w-10 h-10" />
          </div>
          <div className="absolute -top-1 -right-1">
            <div
              className={`p-2 rounded-full shadow-lg ${
                isPremium ? "bg-purple-600" : "bg-blue-600"
              }`}>
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            Unlock {featureName}
          </h3>
          <p className="text-black dark:text-black leading-relaxed text-xl font-semibold max-w-sm mx-auto">
            {featureDescription}
          </p>
          <div className="pt-2">
            <span
              className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-bold border ${
                isPremium
                  ? "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
              }`}>
              Requires {requiredPlan} Plan
            </span>
          </div>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <Link
            to="/pricing"
            className={`flex items-center justify-center gap-3 w-full py-4 px-8 text-white font-black text-lg rounded-2xl shadow-2xl transition-all duration-300 group ${
              isPremium
                ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:scale-[1.02] hover:shadow-purple-500/40"
                : "bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-700 hover:scale-[1.02] hover:shadow-blue-500/40"
            }`}>
            Upgrade to {requiredPlan}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-900 dark:text-white/80">
            <Sparkles
              className={`w-4 h-4 ${isPremium ? "text-purple-500" : "text-blue-500"}`}
            />
            Unlock instant access
          </div>
        </div>
      </div>
    </div>
  );
};
