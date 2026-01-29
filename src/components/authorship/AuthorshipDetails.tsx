import React, { useState, useEffect } from "react";
import {
    AuthorshipService,
    AuthorshipStats,
} from "../../services/authorshipService";

interface AuthorshipDetailsProps {
    projectId: string;
}

export const AuthorshipDetails: React.FC<AuthorshipDetailsProps> = ({
    projectId,
}) => {
    const [stats, setStats] = useState<AuthorshipStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadStats = async () => {
            try {
                const data = await AuthorshipService.getStats(projectId);
                if (isMounted) {
                    setStats(data);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Error loading stats for details:", err);
                if (isMounted) setIsLoading(false);
            }
        };
        loadStats();
        return () => { isMounted = false; };
    }, [projectId]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (isLoading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="h-32 bg-gray-50 rounded-lg border border-gray-100 animate-pulse"></div>
                <div className="h-32 bg-gray-50 rounded-lg border border-gray-100 animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
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
    );
};
