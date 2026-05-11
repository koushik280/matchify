"use client";

import { useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus,  } from "lucide-react";
import Link from "next/link";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Custom hook
import { useRegister } from "@/hooks/useRegister";

// Types & Schemas
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { useState } from "react";

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

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useRegister();
  const [showPassword, setShowPassword] = useState(false);

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

  const onSubmit = (data: RegisterFormData) => registerUser(data);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl px-4"
      >
        <GlassCard className="relative">
          {/* Theme toggle */}
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-muted-foreground mt-2">
              Join Matchify+ and find your perfect match
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register("name")}
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="mt-1"
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password with visibility toggle */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Age */}
            <div>
              <Label htmlFor="age">Age (Optional)</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                {...register("age", { valueAsNumber: true })}
                className="mt-1"
              />
              {errors.age && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.age.message}
                </p>
              )}
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">Bio (Optional)</Label>
              <textarea
                id="bio"
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.bio.message}
                </p>
              )}
            </div>

            {/* Interests (Tags) */}
            <div>
              <Label>Interests (Optional)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedInterests.includes(interest)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              {selectedInterests.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Selected: {selectedInterests.join(", ")}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
