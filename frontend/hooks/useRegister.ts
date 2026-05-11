import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import type { RegisterFormData } from "@/schemas/auth.schema";
import type { AxiosError } from "axios";

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();
  //const setUser = useAuthStore((state) => state.setUser);

  const register = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", data);
      const { user, accessToken } = response.data;
      setAuth(user, accessToken);
      // setUser(user);
      toast.success("Account created! Welcome to Matchify+");
      router.push("/dashboard");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message || "Registration failed.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading };
}
