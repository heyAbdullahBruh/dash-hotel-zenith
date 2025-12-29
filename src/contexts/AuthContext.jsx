/* eslint-disable react-refresh/only-export-components */
// AuthContext.jsx
import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { authService } from "../services/api/authService";
import { useQuery } from "@tanstack/react-query";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Use useEffect to set authChecked to true after initial check
  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["profile"],
    queryFn: authService.getProfile,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (!isLoading) {
      if (isSuccess && data) {
        setUser(data?.data);
      }
      // Whether success or error, mark auth as checked
      setAuthChecked(true);
    }
  }, [isLoading, isSuccess, isError, data]);

  const login = useCallback(async (credentials) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
    return updated;
  }, []);

  const value = {
    user,
    isLoading: isLoading || !authChecked,
    authChecked,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === "super_admin",
    login,
    logout,
    updateProfile,
  };
// console.log(value?.isSuperAdmin,value.user);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
