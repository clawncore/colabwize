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
    status: 'active' | 'inactive' | 'unknown' | 'failed';
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
        const { lastFetched, status } = get();
        const now = Date.now();

        // 1. TERMINAL FAILURE GATE (Stop Retries)
        if (status === 'failed' && !force) {
            console.log("🛑 Subscription fetch blocked: In terminal FAILED state. Manual retry required.");
            return;
        }

        // 2. AUTH-SETTLED GATE (Hard Requirement)
        if (!isAuthSettled) {
            console.log("⏹ Subscription fetch blocked: Auth not settled.");
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.warn("⏹ Subscription fetch blocked: No active session.");
            return;
        }

        // 3. TTL GATE
        if (!force && lastFetched > 0 && (now - lastFetched < TTL_MS) && status !== 'unknown') {
            console.log("♻️  Subscription fetch skipped: Cache valid.");
            return;
        }

        // 4. REQUEST DEDUPLICATION (Request Locking)
        if (inFlightPromise) {
            console.log("🔒 Subscription fetch deduplicated: Awaiting in-flight request.");
            return inFlightPromise;
        }

        // 5. EXECUTION
        console.log("🚀 Fetching Subscription...");
        set({ loading: true, error: null });

        inFlightPromise = (async () => {
            try {
                // Outer HTTP timeout for safety (5s) to catch network hangs
                const controller = new AbortController();
                // Increased timeout to 25s to match backend limits
                const timeoutId = setTimeout(() => controller.abort(), 25000);

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
                    // Backend returned soft failure/unavailable
                    console.warn("⚠️ Subscription fetch soft failure:", response.message);
                    set({
                        status: 'failed',
                        error: response.message || 'Service unavailable',
                        loading: false
                    });
                }
            } catch (err: any) {
                console.error("❌ Subscription fetch critical failure:", err);
                set({
                    status: 'failed', // TERMINAL STATE
                    error: err.message,
                    loading: false,
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
