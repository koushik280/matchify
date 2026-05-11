"use client";

import { motion } from "framer-motion";
import { Heart, Users, MessageCircle, Award } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { GlassCard } from "@/components/ui/glass-card";

export default function DashboardPage() {
  const { user } = useAuthStore();
  // Calculate profile completion percentage based on required fields
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let completed = 0;
    const totalFields = 5; // name, age, bio, photos, interests

    if (user.name && user.name.trim().length > 0) completed++;
    if (user.age && user.age >= 18) completed++;
    if (user.bio && user.bio.trim().length > 0) completed++;
    if (user.photos && user.photos.length > 0) completed++;
    if (user.interests && user.interests.length > 0) completed++;

    return Math.round((completed / totalFields) * 100);
  };

  const completion = calculateProfileCompletion();
  const isComplete = completion === 100;

  const stats = [
    {
      label: "Profile Views",
      value: user?.profileViews?.toString() ?? "0",
      icon: Users,
    }, //TODO
    {
      label: "Matches",
      value: user?.matchesCount?.toString() ?? "0",
      icon: Heart,
    },
    {
      label: "Messages",
      value: user?.messagesCount?.toString() ?? "0",
      icon: MessageCircle,
    },
    { label: "Profile Completion", value: `${completion}%`, icon: Award },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground mb-8">
          Your journey to find the perfect match starts here.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={idx} className="p-6 text-center">
                <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </GlassCard>
            );
          })}
        </div>

        {/* Profile Completion Warning (only if not complete) */}
        {!isComplete && (
          <GlassCard className="p-6 bg-yellow-500/10 border-yellow-500/30 mb-8">
            <p className="text-yellow-600 dark:text-yellow-400">
              ⚠️ Your profile is only {completion}% complete.{" "}
              <Link href="/profile" className="underline ml-2">
                Complete it now
              </Link>{" "}
              to start matching!
            </p>
          </GlassCard>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ready to find love?</h2>
            <div className="flex gap-4">
              <Link href="/discover">
                <span className="glass px-6 py-3 rounded-full hover:bg-primary/20 transition inline-block">
                  Start Swiping
                </span>
              </Link>
              <Link href="/profile">
                <span className="glass px-6 py-3 rounded-full hover:bg-primary/20 transition inline-block">
                  Edit Profile
                </span>
              </Link>
            </div>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
}
