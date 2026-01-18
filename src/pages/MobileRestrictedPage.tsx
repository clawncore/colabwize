import React from "react";
import { Monitor, Smartphone, ArrowRight } from "lucide-react";

export const MobileRestrictedPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center">
                <div className="flex justify-center mb-6 relative">
                    <div className="relative">
                        <Smartphone className="w-16 h-16 text-gray-400 opacity-50 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-150 blur-sm" />
                        <Monitor className="w-20 h-20 text-indigo-600 relative z-10" />
                        <div className="absolute -bottom-2 -right-2 bg-red-100 rounded-full p-1.5 border-2 border-white">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4 text-red-500"
                            >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Desktop Experience Required
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    The ColabWize Dashboard is optimized for larger screens to provide the best document analysis and writing experience.
                </p>

                <div className="bg-indigo-50 rounded-xl p-5 mb-8 text-left border border-indigo-100">
                    <h3 className="text-sm font-semibold text-indigo-900 mb-3 uppercase tracking-wider">Why Desktop?</h3>
                    <ul className="space-y-3">
                        <li className="flex items-start text-sm text-indigo-800">
                            <ArrowRight className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-indigo-600" />
                            Comprehensive document visualization
                        </li>
                        <li className="flex items-start text-sm text-indigo-800">
                            <ArrowRight className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-indigo-600" />
                            Side-by-side analysis and editing
                        </li>
                        <li className="flex items-start text-sm text-indigo-800">
                            <ArrowRight className="w-4 h-4 mr-2 mt-0.5 shrink-0 text-indigo-600" />
                            Detailed academic metrics and charts
                        </li>
                    </ul>
                </div>

                <div className="text-sm text-gray-500 italic">
                    Please switch to a laptop or desktop computer to continue.
                </div>
            </div>
        </div>
    );
};

export default MobileRestrictedPage;
