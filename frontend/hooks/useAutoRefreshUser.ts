// hooks/useAutoRefreshUser.ts
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";

export function useAutoRefreshUser() {
  const { user, updateUser } = useAuthStore();

  useQuery({
    queryKey: ["autoRefreshUser"],
    queryFn: async () => {
      // Only fetch if we have a logged‑in user
      if (!user) return null;
      const response = await api.get("/auth/me");
      const freshUser = response.data.user;
      // Merge the fresh data into the existing store (preserves accessToken, etc.)
      updateUser(freshUser);
      return freshUser;
    },
    // Run every 10 seconds when user is logged in; disable when user is null
    refetchInterval: user ? 10000 : false,
    // Also refetch when the browser tab becomes active
    refetchOnWindowFocus: true,
    // Do not retry on failure to avoid console noise
    retry: false,
    // Keep previous data while fetching (avoid flickering)
    placeholderData: (prev) => prev,
    // Only enable the query when user exists
    enabled: !!user,
  });
}
