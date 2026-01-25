import React from "react";
import { BarChart, CheckCircle, Clock } from "lucide-react";

export interface Usage {
    [feature: string]: number;
}

const FEATURE_CONFIG: Record<
    string,
    {
        label: string;
        usageKey?: string;
        type: "consumable" | "static" | "boolean";
    }
> = {
    scans_per_month: {
        label: "Monthly Scans",
        usageKey: "scan",
        type: "consumable",
    },
    originality_scan: {
        label: "Originality Scans",
        usageKey: "originality_scan",
        type: "consumable",
    },
    citation_check: {
        label: "Citation Checks",
        usageKey: "citation_check",
        type: "consumable",
    },
    rephrase: {
        label: "Rephraser Uses",
        usageKey: "rephrase",
        type: "consumable",
    },
    certificate: {
        label: "Certificates Generated",
        usageKey: "certificate",
        type: "consumable",
    },
    max_scan_characters: {
        label: "Max Characters per Scan",
        type: "static",
    },
    certificate_retention_days: {
        label: "Certificate Retention",
        type: "static",
    },
    draft_comparison: {
        label: "Draft Comparison",
        type: "boolean",
    },
    priority_scanning: {
        label: "Priority Scanning",
        type: "boolean",
    },
};

export const UsageChart = ({ usage, limits, cycleStart, cycleEnd }: { usage: Usage; limits: any, cycleStart?: string, cycleEnd?: string }) => {
    // Filter for consumable features to show in progress bars
    const consumableFeatures = Object.keys(limits).filter((key) => {
        const config = FEATURE_CONFIG[key];
        return config && config.type === "consumable";
    });

    // Filter for static limits/info to show as simple stats
    const staticFeatures = Object.keys(limits).filter((key) => {
        const config = FEATURE_CONFIG[key];
        return config && config.type === "static";
    });

    // Calculate billing cycle progress
    const calculateCycleProgress = () => {
        if (!cycleStart || !cycleEnd) return 0;
        const start = new Date(cycleStart).getTime();
        const end = new Date(cycleEnd).getTime();
        const now = Date.now();
        const total = end - start;
        const elapsed = now - start;
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    };

    const cycleProgress = calculateCycleProgress();
    const daysRemaining = cycleEnd ? Math.ceil((new Date(cycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    if (!consumableFeatures.length && !staticFeatures.length) return null;

    return (
        <div className="space-y-8 mb-8">
            {/* Cycle Progress Meter */}
            {cycleStart && cycleEnd && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 ring-1 ring-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg mr-3 text-blue-600">
                            <Clock className="h-5 w-5" />
                        </div>
                        Billing Cycle
                    </h2>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Started {new Date(cycleStart).toLocaleDateString()}</span>
                        <span className="font-medium text-blue-600">{daysRemaining} days remaining</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
                            style={{ width: `${cycleProgress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>0%</span>
                        <span>Renews {new Date(cycleEnd).toLocaleDateString()}</span>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                {/* Usage Progress Bars */}
                <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 ring-1 ring-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center mb-6">
                        <div className="p-2 bg-indigo-50 rounded-lg mr-3 text-indigo-600">
                            <BarChart className="h-5 w-5" />
                        </div>
                        Usage Overview
                    </h2>

                    <div className="space-y-6">
                        {consumableFeatures.map((feature) => {
                            const config = FEATURE_CONFIG[feature];
                            const limit = limits[feature];

                            // Skip negative limits (unlimited) for progress bars, handle display
                            const isUnlimited = limit < 0 || limit === "unlimited";

                            // Get usage using the mapped key or fallback to feature name
                            const usageKey = config?.usageKey || feature;
                            let current = usage[usageKey] || 0;

                            // Special handling for Scans Used - derived logic
                            if (feature === "scans_per_month") {
                                const origUsage = usage['originality_scan'] || 0;
                                const origLimit = limits['originality_scan'] ?? 3;

                                const citeUsage = usage['citation_check'] || 0;
                                const citeLimit = typeof limits['citation_check'] === 'number' ? limits['citation_check'] : 0;

                                const rephraseUsage = usage['rephrase'] || 0;
                                const rephraseLimit = limits['rephrase_per_month'] ?? 3;

                                current = (origUsage >= origLimit ? 1 : 0) +
                                    (citeUsage >= citeLimit ? 1 : 0) +
                                    (rephraseUsage >= rephraseLimit ? 1 : 0);
                            }

                            const percentage = isUnlimited
                                ? 0
                                : limit === Infinity
                                    ? 0
                                    : Math.min(100, (current / limit) * 100);

                            // Updated Color Logic: >80% Red, >50% Yellow, else Blue/Green
                            let colorClass = "bg-emerald-500";
                            if (percentage > 80) colorClass = "bg-red-500";
                            else if (percentage > 50) colorClass = "bg-amber-400";
                            else colorClass = "bg-emerald-500";

                            return (
                                <div key={feature}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-semibold text-gray-700">
                                            {config?.label || feature}
                                        </span>
                                        <span className={`font-medium ${percentage > 80 ? 'text-red-600' : 'text-gray-500'}`}>
                                            {current} / {isUnlimited ? "Unlimited" : limit}
                                        </span>
                                    </div>
                                    {!isUnlimited && (
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                    {isUnlimited && (
                                        <div className="h-2.5 bg-emerald-50 rounded-full overflow-hidden relative">
                                            <div className="absolute inset-0 bg-emerald-400 opacity-20 animate-pulse"></div>
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-emerald-700 font-bold tracking-widest">UNLIMITED</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Plan Limits/Info */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 ring-1 ring-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center mb-6">
                        <div className="p-2 bg-emerald-50 rounded-lg mr-3 text-emerald-600">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        Plan Limits
                    </h2>

                    <div className="space-y-4">
                        {staticFeatures.map((feature) => {
                            const config = FEATURE_CONFIG[feature];
                            const limit = limits[feature];

                            return (
                                <div
                                    key={feature}
                                    className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors">
                                    <span className="text-gray-600 text-sm font-medium">
                                        {config?.label || feature}
                                    </span>
                                    <span className="font-bold text-gray-900 text-sm">
                                        {config?.label.includes("Retention")
                                            ? `${limit} Days`
                                            : limit.toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
