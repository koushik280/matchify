import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useAuth() {
  const { user, accessToken, isLoading, fetchAuth, logout } = useAuthStore();

  useEffect(() => {
    // Trigger auth fetch only if we have no user and are not already loading
    if (!user && !accessToken && !isLoading) {
      fetchAuth();
    }
  }, [user, accessToken, isLoading, fetchAuth]);

  return { user, accessToken, isLoading, logout };
}