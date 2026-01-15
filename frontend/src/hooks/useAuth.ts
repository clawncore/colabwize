import { useState, useEffect } from "react";
import authService from "../services/authService";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // Optionally verify token with backend
          const userData = await authService.getCurrentUser();
          if (userData.success) {
            setIsAuthenticated(true);
            setUser(userData.user);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    if (result.success) {
      setIsAuthenticated(true);
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
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
