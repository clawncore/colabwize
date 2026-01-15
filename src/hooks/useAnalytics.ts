import { useEffect, useCallback } from "react";
import { apiClient } from "../services/apiClient";
import ConfigService from "../services/ConfigService";

const API_BASE_URL = ConfigService.getApiUrl();

interface TrackEventParams {
  eventType: "feature_usage" | "user_journey" | "conversion" | "engagement";
  eventName: string;
  eventData?: Record<string, any>;
  projectId?: string;
}

export const useAnalytics = () => {
  const getAuthToken = () => localStorage.getItem("auth_token") || "";
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("session_id", sessionId);
    }
    return sessionId;
  };

  /*
   * Track an analytics event
   */
  const trackEvent = useCallback(async (params: TrackEventParams) => {
    try {
      await apiClient.post("/api/analytics/track", {
        ...params,
        sessionId: getSessionId(),
      });
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.warn("Analytics tracking failed:", error);
    }
  }, []);

  /**
   * Track feature usage
   */
  const trackFeatureUsage = useCallback(
    (featureName: string, eventData?: Record<string, any>) => {
      trackEvent({
        eventType: "feature_usage",
        eventName: `${featureName}_used`,
        eventData: { feature: featureName, ...eventData },
      });
    },
    [trackEvent]
  );

  /**
   * Track user journey step
   */
  const trackJourneyStep = useCallback(
    (step: "upload" | "scan" | "review" | "defend", projectId?: string) => {
      trackEvent({
        eventType: "user_journey",
        eventName: `journey_${step}`,
        eventData: { step },
        projectId,
      });
    },
    [trackEvent]
  );

  /**
   * Track conversion
   */
  const trackConversion = useCallback(
    (conversionType: string) => {
      trackEvent({
        eventType: "conversion",
        eventName: conversionType,
      });
    },
    [trackEvent]
  );

  /**
   * Track page view
   */
  const trackPageView = useCallback(
    (pageName: string) => {
      trackEvent({
        eventType: "engagement",
        eventName: "page_view",
        eventData: { page: pageName },
      });
    },
    [trackEvent]
  );

  /**
   * Track button click
   */
  const trackButtonClick = useCallback(
    (buttonName: string, context?: string) => {
      trackEvent({
        eventType: "engagement",
        eventName: "button_click",
        eventData: { button: buttonName, context },
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackFeatureUsage,
    trackJourneyStep,
    trackConversion,
    trackPageView,
    trackButtonClick,
  };
};

/**
 * Hook to track component mount/unmount
 */
export const usePageTracking = (pageName: string) => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);
};

/**
 * Hook to track time spent on page
 */
export const useTimeTracking = (pageName: string) => {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds
      trackEvent({
        eventType: "engagement",
        eventName: "time_spent",
        eventData: { page: pageName, seconds: timeSpent },
      });
    };
  }, [pageName, trackEvent]);
};
