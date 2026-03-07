import React from "react";
import { Monitor, Smartphone, ArrowRight, Laptop, Layout } from "lucide-react";
import { Link } from "react-router-dom";

const MobileRestrictedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        {/* Animated Icon Section */}
        <div className="relative h-48 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

          <div className="relative z-10 flex items-center">
            {/* Desktop Monitor */}
            <div className="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 transform -rotate-6 translate-x-4">
              <Monitor className="w-12 h-12 text-blue-600" />
            </div>

            {/* Smartphone with X or Restricted sign */}
            <div className="bg-white p-4 rounded-xl shadow-xl border border-gray-100 transform rotate-12 -translate-x-4 relative">
              <Smartphone className="w-8 h-8 text-gray-400" />
              <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-lg">
                <div className="w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                  !
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Better on Desktop
          </h1>
          <p className="text-gray-600 leading-relaxed text-lg">
            ColabWize is designed for complex academic collaboration and
            research management, which requires a larger screen for the best
            experience.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4 pt-4 text-left">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <Layout className="w-5 h-5 text-indigo-500 mb-2" />
            <span className="text-sm font-semibold text-gray-900 block">
              Advanced Editor
            </span>
            <span className="text-xs text-gray-500">
              Full-featured writing suite
            </span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <Monitor className="w-5 h-5 text-indigo-500 mb-2" />
            <span className="text-sm font-semibold text-gray-900 block">
              Mega Dashboard
            </span>
            <span className="text-xs text-gray-500">
              Comprehensive analytics
            </span>
          </div>
        </div>

        {/* Desktop Recommendation */}
        <div className="pt-6">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <Laptop className="w-4 h-4" />
            <span>Please login from a Desktop or Tablet</span>
          </div>
        </div>

        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700 transition-colors group">
          Return to home page
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <p className="text-xs text-gray-400 pt-8">
          &copy; 2026 ColabWize. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MobileRestrictedPage;
