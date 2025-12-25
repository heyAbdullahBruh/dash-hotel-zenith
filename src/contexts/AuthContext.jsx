import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api/authService';
import { useMutation, useQuery } from '@tanstack/react-query';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    retry: false,
    enabled: !user,
  });

  useEffect(() => {
    if (profile && !user) {
      setUser(profile);
    }
    setIsLoading(profileLoading);
  }, [profile, profileLoading]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUser(data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setUser(null);
      window.location.href = '/login';
    },
  });

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    updateProfile: async (data) => {
      const updated = await authService.updateProfile(data);
      setUser(updated);
      return updated;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};