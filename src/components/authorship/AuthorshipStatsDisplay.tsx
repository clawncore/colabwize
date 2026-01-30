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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 h-24 animate-pulse border border-gray-100">
              <div className="w-8 h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 w-16 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 w-24 bg-gray-200 rounded"></div>
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
      {/* Metrics Grid - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Time Card */}
        <div className="bg-white relative rounded-xl p-5 border border-blue-100 shadow-[0_2px_8px_rgba(37,99,235,0.08)] flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-300">
          <div className="mb-3 pr-14">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total Time
            </div>
          </div>
          <div className="absolute top-4 right-4 p-3 bg-blue-500 text-white rounded-xl shadow-blue-200 shadow-lg transform transition-transform hover:scale-110 duration-200">
            <Clock className="w-6 h-6" />
          </div>

          <div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {formatTime(stats.totalTimeInvestedMinutes || 0)}
            </div>
            <div className="text-[10px] text-blue-600 font-bold mt-1.5 uppercase tracking-wide flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
              Verified Duration
            </div>
          </div>
        </div>

        {/* Manual Edits Card */}
        <div className="bg-white relative rounded-xl p-5 border border-green-100 shadow-[0_2px_8px_rgba(22,163,74,0.08)] flex flex-col justify-between h-full hover:shadow-lg transition-shadow duration-300">
          <div className="mb-3 pr-14">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Manual Edits
            </div>
          </div>
          <div className="absolute top-4 right-4 p-3 bg-green-500 text-white rounded-xl shadow-green-200 shadow-lg transform transition-transform hover:scale-110 duration-200">
            <FileEdit className="w-6 h-6" />
          </div>

          <div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {(stats.manualEditsCount || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-green-600 font-bold mt-1.5 uppercase tracking-wide flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              Human Keystrokes
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};
