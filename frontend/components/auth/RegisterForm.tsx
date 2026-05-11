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
      const { accessToken } = response.data;
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
      className="space-y-5 max-h-[75vh] overflow-y-auto pr-2"
    >
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-foreground">
          Full Name
        </Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...register("name")}
          className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white/5 border-white/10"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register("email")}
          className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white/5 border-white/10"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label
          htmlFor="password"
          className="text-sm font-medium text-foreground"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••"
            {...register("password")}
            className="w-full pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white/5 border-white/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Age */}
      <div className="space-y-2">
        <Label htmlFor="age" className="text-sm font-medium text-foreground">
          Age (optional)
        </Label>
        <Input
          id="age"
          type="number"
          placeholder="25"
          {...register("age", { valueAsNumber: true })}
          className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white/5 border-white/10"
        />
        {errors.age && (
          <p className="text-sm text-red-500">{errors.age.message}</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium text-foreground">
          Bio (optional)
        </Label>
        <textarea
          id="bio"
          rows={3}
          placeholder="Tell us about yourself..."
          {...register("bio")}
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 resize-none"
        />
        {errors.bio && (
          <p className="text-sm text-red-500">{errors.bio.message}</p>
        )}
      </div>

      {/* Interests */}
      <div className="space-y-2">
        <Label
          htmlFor="interests"
          className="text-sm font-medium text-foreground"
        >
          Interests (optional)
        </Label>
        <div className="flex flex-wrap gap-2 mt-1">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1 rounded-full text-xs transition-all duration-200 ${
                selectedInterests.includes(interest)
                  ? "bg-primary text-white shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
        {selectedInterests.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Selected: {selectedInterests.join(", ")}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 transition-all duration-200"
        disabled={isLoading}
      >
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
