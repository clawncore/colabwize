import { useState, useEffect } from "react";
import authService from "../services/authService";
import { supabase } from "../lib/supabase/client";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Initial Session Check
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (session && !error) {
          setIsAuthenticated(true);
          setUser(session.user);
          // Sync with legacy auth service just in case
          if (session.access_token) {
            localStorage.setItem("auth_token", session.access_token);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
          localStorage.removeItem("auth_token");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // 2. Real-time Subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session ? "Session exists" : "No session");

      if (session) {
        setIsAuthenticated(true);
        setUser(session.user);
        localStorage.setItem("auth_token", session.access_token);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("auth_token");
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    // Use Supabase directly or via authService wrapper?
    // Let's keep using authService for login to maintain existing structure
    // but relies on the onAuthStateChange to update state
    const result = await authService.login({ email, password });
    return result;
  };

  const logout = async () => {
    await authService.logout();
    // State update will happen via onAuthStateChange
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    const result = await authService.register({ email, password, fullName });
    return result;
  };

  const checkAuthStatus = () => {
    return isAuthenticated;
  };

  return {
    isAuthenticated: checkAuthStatus,
    loading,
    user,
    login,
    logout,
    register,
  };
};
