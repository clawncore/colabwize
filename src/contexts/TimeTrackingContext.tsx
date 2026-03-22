"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { timeTrackingService, TimeEntry } from "../services/timeTrackingService";
import { supabase } from "../lib/supabase/client";

interface TimeTrackingContextType {
    activeTimer: TimeEntry | null;
    elapsedTime: number;
    startTimer: (taskId: string, description?: string) => Promise<void>;
    stopTimer: () => Promise<void>;
    refreshTimer: () => Promise<void>;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const TimeTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);

    // Use a ref for BroadcastChannel to avoid recreated-on-render issues
    // and handle React 18 Strict Mode cleanup better
    const channelRef = useRef<BroadcastChannel | null>(null);

    const getChannel = useCallback(() => {
        if (!channelRef.current) {
            channelRef.current = new BroadcastChannel("time_tracking_sync");
        }
        return channelRef.current;
    }, []);

    const refreshTimer = useCallback(async () => {
        try {
            // Check if user is authenticated before checking for active timer
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log("Skipping active timer check - no session found");
                return;
            }

            const timer = await timeTrackingService.getActiveTimer();
            setActiveTimer(timer);
        } catch (error) {
            console.error("Failed to refresh active timer", error);
        }
    }, []);

    const startTimer = async (taskId: string, description?: string) => {
        try {
            const timer = await timeTrackingService.startTimer(taskId, description);
            setActiveTimer(timer);
            const ch = getChannel();
            if (ch) ch.postMessage({ type: "TIMER_STARTED", timer });
        } catch (error) {
            console.error("Failed to start timer", error);
            throw error;
        }
    };

    const stopTimer = async () => {
        if (!activeTimer) return;
        try {
            await timeTrackingService.stopTimer(activeTimer.id);
            setActiveTimer(null);
            setElapsedTime(0);
            const ch = getChannel();
            if (ch) ch.postMessage({ type: "TIMER_STOPPED" });
        } catch (error) {
            console.error("Failed to stop timer", error);
            throw error;
        }
    };

    useEffect(() => {
        refreshTimer();

        const ch = getChannel();
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === "TIMER_STARTED") {
                setActiveTimer(event.data.timer);
            } else if (event.data.type === "TIMER_STOPPED") {
                setActiveTimer(null);
                setElapsedTime(0);
            }
        };

        ch.onmessage = handleMessage;

        // Initial sync across tabs
        ch.postMessage({ type: "SYNC_REQUEST" });

        return () => {
            if (channelRef.current) {
                channelRef.current.close();
                channelRef.current = null;
            }
        };
    }, [getChannel, refreshTimer]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTimer) {
            const startTime = new Date(activeTimer.start_time).getTime();
            interval = setInterval(() => {
                const now = new Date().getTime();
                setElapsedTime(Math.floor((now - startTime) / 1000));
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [activeTimer]);

    return (
        <TimeTrackingContext.Provider value={{ activeTimer, elapsedTime, startTimer, stopTimer, refreshTimer }}>
            {children}
        </TimeTrackingContext.Provider>
    );
};

export const useTimeTracking = () => {
    const context = useContext(TimeTrackingContext);
    if (context === undefined) {
        throw new Error("useTimeTracking must be used within a TimeTrackingProvider");
    }
    return context;
};
