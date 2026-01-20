import { create } from 'zustand';
import apiClient from '../services/apiClient';
import { supabase } from '../lib/supabase/client';

// Types matching the backend response
export interface PlanLimits {
    scans_per_month: number;
    [key: string]: any;
}

export interface UsageFunc {
    scans: number;
    [key: string]: any;
}

export interface SubscriptionState {
    // Data
    status: 'active' | 'inactive' | 'unknown';
    plan: string;
    limits: PlanLimits;
    usage: UsageFunc;
    creditBalance: number;
    source: 'stripe' | 'cache' | 'fallback' | 'database';
    subscription: any | null; // The raw prisma subscription object

    // Meta
    loading: boolean;
    error: string | null;
    lastFetched: number;

    // Actions
    fetchSubscription: (isAuthSettled: boolean, force?: boolean) => Promise<void>;
    reset: () => void;
}

// TTL: 5 minutes
const TTL_MS = 5 * 60 * 1000;

// Promise holder for request deduplication
let inFlightPromise: Promise<void> | null = null;

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    // Initial State
    status: 'unknown',
    plan: 'free',
    limits: { scans_per_month: 3 }, // Safe default
    usage: { scans: 0 },
    creditBalance: 0,
    source: 'fallback',
    subscription: null,

    loading: false,
    error: null,
    lastFetched: 0,

    fetchSubscription: async (isAuthSettled: boolean, force = false) => {
        const { lastFetched, loading, status } = get();
        const now = Date.now();

        // 1. AUTH-SETTLED GATE (Hard Requirement)
        if (!isAuthSettled) {
            console.log("⏹ Subscription fetch blocked: Auth not settled.");
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.warn("⏹ Subscription fetch blocked: No active session.");
            return;
        }

        // 2. TTL GATE
        if (!force && lastFetched > 0 && (now - lastFetched < TTL_MS) && status !== 'unknown') {
            console.log("♻️  Subscription fetch skipped: Cache valid.");
            return;
        }

        // 3. REQUEST DEDUPLICATION (Request Locking)
        if (inFlightPromise) {
            console.log("🔒 Subscription fetch deduplicated: Awaiting in-flight request.");
            return inFlightPromise;
        }

        // 4. EXECUTION
        console.log("🚀 Fetching Subscription...");
        set({ loading: true, error: null });

        inFlightPromise = (async () => {
            try {
                // Outer HTTP timeout for safety (5s) to catch network hangs
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);

                const response: any = await apiClient.get('/api/subscription/current', {
                    signal: controller.signal
                }).finally(() => clearTimeout(timeoutId));

                if (response.success) {
                    set({
                        status: response.status,
                        plan: response.plan,
                        limits: response.limits,
                        usage: response.usage,
                        creditBalance: response.creditBalance,
                        source: response.source,
                        subscription: response.subscription,
                        lastFetched: Date.now(),
                        loading: false,
                        error: null
                    });
                    console.log("✅ Subscription updated:", response.status);
                } else {
                    throw new Error(response.message || 'Failed to fetch subscription');
                }
            } catch (err: any) {
                console.error("❌ Subscription fetch failed:", err);
                set({
                    error: err.message,
                    loading: false,
                    // On error, we keep 'unknown' status or whatever was there, 
                    // but we effectively "stop" loading. 
                    // We do NOT reset data to blank to avoid flashing.
                });
            } finally {
                inFlightPromise = null;
            }
        })();

        return inFlightPromise;
    },

    reset: () => {
        set({
            status: 'unknown',
            plan: 'free',
            limits: { scans_per_month: 3 },
            usage: { scans: 0 },
            creditBalance: 0,
            subscription: null,
            loading: false,
            error: null,
            lastFetched: 0
        });
    }
}));
