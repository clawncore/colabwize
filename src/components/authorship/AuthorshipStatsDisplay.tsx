import React, { useState, useEffect } from "react";
import {
  AuthorshipService,
  AuthorshipStats,
} from "../../services/authorshipService";
import { Clock, FileEdit } from "lucide-react";

interface AuthorshipStatsDisplayProps {
  projectId: string;
}

export const AuthorshipStatsDisplay: React.FC<AuthorshipStatsDisplayProps> = ({
  projectId,
}) => {
  const [stats, setStats] = useState<AuthorshipStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    const loadStatsInner = async (isSilent = false) => {
      if (!isSilent) setIsLoading(true);
      setError(null);

      try {
        const data = await AuthorshipService.getStats(projectId);
        setStats(data);
      } catch (err: any) {
        console.error("Error loading stats:", err);
        // Only show error on initial load, not silent updates
        if (!isSilent) setError(err.message || "Failed to load statistics");
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    };

    // Initial load
    loadStatsInner();

    const intervalId = setInterval(() => {
      loadStatsInner(true); // Silent update
    }, 30000);

    return () => clearInterval(intervalId);
  }, [projectId]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (isLoading && !stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 h-36 animate-pulse border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
                <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
              </div>
              <div className="space-y-2">
                <div className="h-8 w-20 bg-gray-100 rounded"></div>
                <div className="h-2 w-32 bg-gray-50 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-50 rounded-lg border border-gray-100 animate-pulse"></div>
          <div className="h-32 bg-gray-50 rounded-lg border border-gray-100 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Metrics Grid - 2 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Time Card */}
        <div className="bg-white relative rounded-xl p-5 border border-blue-100 shadow-[0_2px_8px_rgba(37,99,235,0.08)] flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Verified Duration
            </div>
            <div className="p-2.5 bg-blue-500 text-white rounded-xl shadow-blue-200 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-4xl font-black text-gray-900 tracking-tight mb-1">
              {formatTime(stats.totalTimeInvestedMinutes || 0)}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:animate-pulse"></div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Authentic Production Time
              </span>
            </div>
          </div>
        </div>

        {/* Manual Edits Card */}
        <div className="bg-white relative rounded-xl p-5 border border-emerald-100 shadow-[0_2px_8px_rgba(16,185,129,0.08)] flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FileEdit className="w-3.5 h-3.5" />
              Human Keystrokes
            </div>
            <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-emerald-200 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              <FileEdit className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-4xl font-black text-gray-900 tracking-tight mb-1">
              {(stats.manualEditsCount || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:animate-pulse"></div>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Manual Edit Operations
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
