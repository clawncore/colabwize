import React from "react";
import { BarChart, CheckCircle, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
import { UsageSparkline } from "./UsageSparkline";

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

const PLAN_FEATURES_LIST: Record<string, string[]> = {
    free: [
        "3 document scans per month",
        "3 Rephrase Suggestions",
        "3 Paper Searches",
        "Max 100,000 characters",
        "Basic originality check",
        "Watermarked certificate",
        "7-day certificate retention"
    ],
    student: [
        "50 document scans per month",
        "50 Rephrase Suggestions",
        "50 Paper Searches",
        "Max 300,000 characters",
        "Full originality map",
        "Citation confidence auditor",
        "Professional certificate",
        "30-day certificate retention",
        "Email support"
    ],
    researcher: [
        "Unlimited document scans",
        "Unlimited Rephrase Suggestions",
        "Max 500,000 characters",
        "Priority scanning",
        "Advanced citation suggestions",
        "Draft comparison",
        "Safe AI Integrity Assistant",
        "Unlimited certificate retention",
        "Priority support"
    ]
};

export const UsageChart = ({ usage, limits, cycleStart, cycleEnd, planName = 'free' }: { usage: Usage; limits: any, cycleStart?: string, cycleEnd?: string, planName?: string }) => {
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

    // Generate sparkline data from current usage (for demo - in production use real 30-day data)
    const totalUsage = Object.values(usage).reduce((sum: number, val) => sum + (typeof val === 'number' ? val : 0), 0);
    const sparklineData = Array.from({ length: 30 }, (_, i) => {
        const variance = Math.random() * 0.4 - 0.2;
        return Math.max(0, totalUsage * (0.5 + i / 60 + variance));
    });

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
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center">
                            <div className="p-2 bg-indigo-50 rounded-lg mr-3 text-indigo-600">
                                <BarChart className="h-5 w-5" />
                            </div>
                            Usage Overview
                        </h2>
                        {/* Global sparkline showing 30-day trend */}
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Activity (30d)</span>
                                <UsageSparkline data={sparklineData} width={120} height={32} color="#6366f1" />
                            </div>
                            <span className="text-[10px] text-gray-400">Trend based on total account activity</span>
                        </div>
                    </div>

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

                            // Brighter Color Logic with gradients: >80% Red, >50% Yellow, else Green
                            let colorClass = "bg-gradient-to-r from-emerald-500 to-emerald-600";
                            if (percentage > 80) colorClass = "bg-gradient-to-r from-rose-500 to-rose-600";
                            else if (percentage > 50) colorClass = "bg-gradient-to-r from-amber-500 to-amber-600";
                            else colorClass = "bg-gradient-to-r from-emerald-500 to-emerald-600";

                            // Determine usage context for unlimited plans
                            // Use percentage of typical baseline (e.g., 50 uses/month as baseline)
                            const TYPICAL_BASELINE = 50; // Typical monthly usage baseline
                            const usagePercentage = (current / TYPICAL_BASELINE) * 100;

                            const getUsageContext = () => {
                                if (usagePercentage > 70) {
                                    return {
                                        label: "High usage this month",
                                        color: "bg-green-100 text-green-700 border-green-200"
                                    };
                                }
                                if (usagePercentage >= 20) {
                                    return {
                                        label: "Normal usage",
                                        color: "bg-blue-100 text-blue-700 border-blue-200"
                                    };
                                }
                                return {
                                    label: "Low usage this month",
                                    color: "bg-gray-100 text-gray-700 border-gray-200"
                                };
                            };

                            const usageContext = getUsageContext();

                            // Empty state intelligence - encourage usage when current = 0
                            const showEmptyState = current === 0;

                            return (
                                <div key={feature}>
                                    <div className="flex justify-between items-center text-sm mb-2">
                                        <span className="font-semibold text-gray-700">
                                            {config?.label || feature}
                                        </span>
                                        <span className={`font-medium ${percentage > 80 ? 'text-red-600' : 'text-gray-500'}`}>
                                            {current} / {isUnlimited ? "Unlimited" : limit}
                                        </span>
                                    </div>
                                    {!isUnlimited && (
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden max-w-2xl">
                                            <div
                                                className={`h-full rounded-full transition-all duration-700 ${colorClass} shadow-sm`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    )}
                                    {isUnlimited && (
                                        <div className="flex items-center gap-4 max-w-2xl">
                                            {/* Dynamic active indicator for unlimited plans */}
                                            {/* Visual baseline of 100 for relative comparison */}
                                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden relative">
                                                <div
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full opacity-80"
                                                    style={{ width: `${Math.min(100, Math.max(5, (current / 100) * 100))}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                                                Active
                                            </span>
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
                        {planName.charAt(0).toUpperCase() + planName.slice(1)} Features
                    </h2>

                    <div className="space-y-3">
                        {(PLAN_FEATURES_LIST[planName] || PLAN_FEATURES_LIST['free']).map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-lg px-2 -mx-2 transition-colors">
                                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-gray-700 text-sm font-medium leading-tight">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
