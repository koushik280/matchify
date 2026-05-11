"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import type { AxiosError } from "axios";

const INTEREST_OPTIONS = [
  "Music",
  "Travel",
  "Sports",
  "Food",
  "Movies",
  "Gaming",
  "Photography",
  "Dancing",
  "Reading",
  "Fitness",
  "Yoga",
  "Art",
];

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      age: undefined,
      bio: "",
      interests: [],
    },
  });

  const selectedInterests = watch("interests") || [];

  const toggleInterest = (interest: string) => {
    const current = selectedInterests;
    if (current.includes(interest)) {
      setValue(
        "interests",
        current.filter((i) => i !== interest),
      );
    } else {
      setValue("interests", [...current, interest]);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", data);
      const {  accessToken } = response.data;
      if (!accessToken) throw new Error("No access token returned");

      const profileRes = await api.get("/profile/me");
      const fullUser = profileRes.data.user;

      setAuth(fullUser, accessToken);
      toast.success("Account created!");
      if (onSuccess) onSuccess();
      router.push("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message || "Registration failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-h-[80vh] overflow-y-auto pr-2"
    >
      <div>
        <Label>Full Name</Label>
        <Input {...register("name")} placeholder="John Doe" />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label>Email</Label>
        <Input
          type="email"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      <div>
        <Label>Password</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <div>
        <Label>Age (optional)</Label>
        <Input
          type="number"
          {...register("age", { valueAsNumber: true })}
          placeholder="25"
        />
      </div>
      <div>
        <Label>Bio (optional)</Label>
        <textarea
          rows={3}
          {...register("bio")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <Label>Interests (optional)</Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedInterests.includes(interest)
                  ? "bg-primary text-white"
                  : "bg-secondary"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <UserPlus className="mr-2 h-4 w-4" /> Sign Up
          </>
        )}
      </Button>
    </form>
  );
}
