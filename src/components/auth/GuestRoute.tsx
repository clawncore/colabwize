import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../services/useUser";
import { AuthInitContext } from "./AuthInitializer";

interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { user, loading } = useUser();
  const { isInitialized } = useContext(AuthInitContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    console.log("GuestRoute: Checking auth status", { user, loading });

    // If we've finished loading and auth is initialized, check auth status
    if (!loading && isInitialized) {
      // Check if 2FA is required (via URL query param)
      const searchParams = new URLSearchParams(location.search);
      const is2FARequired = searchParams.get("requires_2fa") === "true";

      if (user && !is2FARequired) {
        console.log("GuestRoute: User found, redirecting to dashboard");

        // Check if there's a redirect parameter in the URL
        const redirectPath = searchParams.get("redirect");

        // Add a small delay to prevent race conditions
        setTimeout(() => {
          // If there's a redirect path, use it; otherwise go to dashboard
          if (redirectPath) {
            navigate(redirectPath, { replace: true });
          } else {
            navigate("/dashboard", { replace: true });
          }
        }, 100);
      }
      setChecked(true);
    }
  }, [user, loading, isInitialized, navigate, location]);

  // Show loading state while checking auth status
  if (loading) {
    console.log("GuestRoute: Showing loading state", { loading });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If we've checked auth status and user is authenticated, redirect to dashboard (useEffect will handle this)
  // If not authenticated OR 2FA is required, render children
  const searchParams = new URLSearchParams(location.search);
  const is2FARequired = searchParams.get("requires_2fa") === "true";

  if (checked && (!user || is2FARequired)) {
    return <>{children}</>;
  }

  // If we've checked and there is a user (and no 2FA required), don't render anything while redirecting
  if (checked && user && !is2FARequired) {
    return null;
  }

  // Default loading state
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default GuestRoute;
