// hooks/useLogin.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import type { LoginFormData } from "@/schemas/auth.schema";
import type { AuthResponse } from "@/types/auth.types";
import type { AxiosError } from "axios";

interface LoginErrorResponse {
  message?: string;
}

export function useLogin() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post<AuthResponse>("/auth/login", data);
      const { accessToken } = response.data;

      if (!accessToken) throw new Error("No access token returned");

      // Fetch full user profile using the existing access token (cookie is sent automatically)
      const profileResponse = await api.get<{ user: AuthResponse["user"] }>(
        "/auth/me",
      );
      const fullUser = profileResponse.data.user;

      setAuth(fullUser, accessToken);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<LoginErrorResponse>;
      const message =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Login failed. Please check your credentials.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}
