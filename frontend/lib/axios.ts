import { useAuthStore } from "@/stores/authStore";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(null);
  });
  failedQueue = [];
};

// Extend the AxiosRequestConfig to include our custom _retry flag
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // --- UPGRADE 1: THE CIRCUIT BREAKER ---
    // If the request that failed WAS a refresh attempt, or we get a 403,
    // it means the session is unrecoverable. STOP EVERYTHING.
    const isRefreshRequest = originalRequest.url?.includes("refresh");

    if (isRefreshRequest || error.response?.status === 403) {
      isRefreshing = false;
      useAuthStore.getState().logout();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.replace("/login");
      }
      return Promise.reject(error);
    }

    // --- UPGRADE 2: HANDLE 401 ---
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already happening, don't start another. Wait in line.
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // --- UPGRADE 3: BYPASS INTERCEPTOR ---
        // We use a clean 'axios' instance here so this call doesn't trigger THIS interceptor
        // Inside the interceptor, before calling refresh
        if (useAuthStore.getState().isLoggedOut) {
          return Promise.reject(error);
        }
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError as AxiosError);

        // Refresh failed (likely expired refresh token). Wipe state.
        useAuthStore.getState().logout();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          window.location.replace("/login");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
