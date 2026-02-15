import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import { useUser } from "../../services/useUser";

const CallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refreshUser } = useUser();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Set auth provider for apiClient
      localStorage.setItem("auth_provider", "google");

      try {
        console.log("OAuth callback page loaded");

        // Check for OAuth errors from URL parameters
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        // Handle OAuth errors
        if (errorParam) {
          console.error("OAuth error:", errorParam, errorDescription);
          setError(`OAuth error: ${errorDescription || errorParam}`);
          setLoading(false);
          return;
        }

        // Check for existing session (handles both "fresh login with code" and "returning user without code")
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Authentication failed");
          setLoading(false);
          return;
        }

        if (session) {
          console.log("Session established, attempting to sync with backend");
          const user = session.user;

          // Optimistic verification: Check if user exists in DB (or create them)
          if (user) {
            try {
              const { syncUser } = await import("../../services/hybridAuth");
              const syncResult = await syncUser();

              if (syncResult.success) {
                // Check for 2FA requirement FIRST (Backend might return requires_2fa: true without a full user object)
                if (syncResult.requires_2fa && (syncResult.userId || syncResult.user?.id)) {
                  const uid = syncResult.userId || syncResult.user?.id;
                  navigate(`/login?requires_2fa=true&userId=${uid}&provider=google`, { replace: true });
                  return;
                }

                if (syncResult.user) {
                  console.log("User verified/synced in backend");

                  // Refresh client-side user state
                  await refreshUser();

                  // Only redirect to survey if explicitly required and user is NEW
                  // We default to dashboard for existing users to prevent loops
                  const isNewUser = syncResult.user.created_at && (new Date().getTime() - new Date(syncResult.user.created_at).getTime() < 60000); // Created in last minute

                  if (isNewUser && !syncResult.user.survey_completed) {
                    console.log("New user needs to complete survey, redirecting to signup/onboarding");

                    // Store OAuth user data for the signup flow
                    const oauthUserData = {
                      id: user.id,
                      email: user.email,
                      fullName:
                        user.user_metadata?.full_name ||
                        user.user_metadata?.name ||
                        user.email?.split("@")[0],
                      provider: user.app_metadata?.provider || "oauth",
                    };

                    sessionStorage.setItem(
                      "oauthUserData",
                      JSON.stringify(oauthUserData)
                    );

                    // Redirect to signup page for survey completion
                    let redirectUrl = "/signup";
                    const plan = searchParams.get("plan");
                    const redirect = searchParams.get("redirect");

                    const params = new URLSearchParams();
                    if (plan) params.set("plan", plan);
                    if (redirect) params.set("redirect", redirect);
                    params.set("oauth", "true");

                    if ([...params.keys()].length > 0) {
                      redirectUrl += `?${params.toString()}`;
                    }

                    console.log("Redirecting to:", redirectUrl);
                    navigate(redirectUrl, { replace: true });
                    return;
                  }

                  // Check for 2FA requirement
                  if (syncResult.requires_2fa && syncResult.userId) {
                    console.log("2FA required for Google user, redirecting to verification");
                    // We need to pass the userId and indicate it's a google login needing 2FA
                    navigate(`/login?requires_2fa=true&userId=${syncResult.userId}&provider=google`, { replace: true });
                    return;
                  }

                  // Default: Go to Dashboard
                  console.log("User authenticated, redirecting to dashboard");
                  await new Promise((r) => setTimeout(r, 100)); // Small delay for state propagation
                  navigate("/dashboard", { replace: true });
                  return;
                }
              }
            } catch (err) {
              console.warn("Sync failed, but session exists. Proceeding to dashboard optimistically:", err);
              // Fallback: Proceed to Dashboard if sync fails but we have a session
              // This prevents locking users out due to backend glitches
              navigate("/dashboard", { replace: true });
              return;
            }

            // Fallback for logic flow (should ideally not reach here if session exists)
            navigate("/dashboard", { replace: true });
            return;
          }
        }

        // If no session was established, redirect to login
        console.log("No session found, redirecting to login");
        navigate("/login", { replace: true });
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("Authentication failed");
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams, refreshUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Completing authentication...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Authentication Error
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CallbackPage;
