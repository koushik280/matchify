import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "@/lib/axios";
import type { User } from "@/types/auth.types";
import { AxiosError } from "axios";
interface AuthState {
  user: User | null;
  accessToken: string | null;
  _isFetching: boolean;
  isLoading: boolean;
  fcmTokens: string | null;
  isLoggedOut: boolean;
  setAuth: (user: User, accessToken: string | null) => void;
  setFcmToken: (token: string | null) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  fetchAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      fcmTokens: null,
      // 1. START FALSE: This allows fetchAuth to pass the "Shield" check on mount
      isLoading: false,
      _isFetching: false,
      isLoggedOut: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isLoading: false, _isFetching: false }),

      setFcmToken: (token) => set({ fcmTokens: token }),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          fcmTokens: null,
          isLoading: false,
          _isFetching: false,
          isLoggedOut: true,
        });
        if (typeof window !== "undefined") {
          // Use window.location.replace to clear the session and the history entry
          window.location.replace("/login");
        }
      },

      updateUser: (updatedFields) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedFields } : null,
        })),

      fetchAuth: async () => {
        if (get().isLoggedOut) return;
        // 2. Auth Page Check: Don't show spinner on login/register
        if (
          typeof window !== "undefined" &&
          ["/login", "/register", "/"].includes(window.location.pathname)
        ) {
          set({ isLoading: false, _isFetching: false });
          return;
        }

        // 3. The Shield: Only blocks if a network request is already active
        // Because we set isLoading to true inside this function, it works correctly.
        if (get()._isFetching) return;

        set({ isLoading: true, _isFetching: true });

        try {
          const userResponse = await api.get("/auth/me");
          set({
            user: userResponse.data.user,
            accessToken: "authenticated",
            isLoading: false,
            _isFetching: false,
          });
        } catch (error: unknown) {
          set({
            user: null,
            accessToken: null,
            isLoading: false,
            _isFetching: false,
          });
          const axiosError = error as AxiosError;
          if (
            axiosError.response?.status === 401 &&
            typeof window !== "undefined"
          ) {
            if (!window.location.pathname.includes("/login")) {
              window.location.replace("/login");
            }
          }
        } finally {
          // 4. Always ensure loading is released
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      // 5. DO NOT PERSIST isLoading: This prevents the "sticky" spinner
      partialize: (state) => ({
        user: state.user,
        fcmTokens: state.fcmTokens,
      }),
      // 6. Manual Rehydration: This ensures that when the app wakes up,
      // the ProtectedRoute sees a loading state briefly while fetchAuth starts.
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = true;
          state._isFetching = false;
        }
      },
    },
  ),
);
