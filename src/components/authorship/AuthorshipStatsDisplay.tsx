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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm flex flex-col justify-between h-full bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-start justify-between mb-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Time
            </div>
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(stats.totalTimeInvestedMinutes || 0)}
            </div>
            <div className="text-xs text-blue-600 font-medium mt-1">
              Verified Session Duration
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-green-100 shadow-sm flex flex-col justify-between h-full bg-gradient-to-br from-white to-green-50/30">
          <div className="flex items-start justify-between mb-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Manual Edits
            </div>
            <div className="p-1.5 bg-green-100 text-green-600 rounded-md">
              <FileEdit className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {(stats.manualEditsCount || 0).toLocaleString()}
            </div>
            <div className="text-xs text-green-600 font-medium mt-1">
              Human Keystrokes Tracked
            </div>
          </div>
        </div>
      </div>

      {/* Details & Claim Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detailed Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wider border-b border-gray-100 pb-2">
            Session Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">First Edit:</span>
              <span className="font-medium text-gray-900">
                {stats.firstEditDate ? formatDate(stats.firstEditDate) : "N/A"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Last Edit:</span>
              <span className="font-medium text-gray-900">
                {stats.lastEditDate ? formatDate(stats.lastEditDate) : "N/A"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Active Days:</span>
              <span className="font-medium text-gray-900">
                {stats.activeDays || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Total Sessions:</span>
              <span className="font-medium text-gray-900">
                {stats.totalSessions || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Authorship Claim */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Authorship Summary</h3>
          </div>
          <p className="text-xs text-indigo-800 leading-relaxed">
            This project contains <strong>{(stats.manualEditsCount || 0).toLocaleString()} manual edits</strong> recorded over <strong>{stats.activeDays || 0} days</strong> of activity.
            The analysis indicates <strong>{Math.max(0, Math.round(100 - (stats.aiAssistedPercentage || 0)))}% original work contribution</strong> based on keystroke dynamics.
          </p>
        </div>
      </div>
    </div>
  );
};
