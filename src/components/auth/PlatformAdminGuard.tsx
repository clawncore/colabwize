import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../../services/useUser";

interface PlatformAdminGuardProps {
  children: React.ReactNode;
}

const ADMIN_WHITELIST = [
  "clawncore@colabwize.com",
  "simbisai@colabwize.com",
  "craig@colabwize.com"
];

const PlatformAdminGuard: React.FC<PlatformAdminGuardProps> = ({ children }) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Cross-check metadata / app_metadata vs generic string definition
  const role = 
    user.role || 
    user.user_metadata?.role || 
    user.app_metadata?.role;
    
  const userEmail = user.email?.toLowerCase() || "";
  const isWhitelisted = ADMIN_WHITELIST.includes(userEmail);

  // Allow if EITHER role is admin OR email is whitelisted
  if (role === "admin" || isWhitelisted) {
    return <>{children}</>;
  }

  return <Navigate to="/dashboard" replace />;
};


export default PlatformAdminGuard;
