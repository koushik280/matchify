"use client";

import { useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Heart, X } from "lucide-react";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { Candidate } from "@/types/swipe.types";
import { VerifiedBadge } from "../ui/verified-badge";

interface SwipeCardProps {
  candidate: Candidate;
  onSwipe: (direction: "left" | "right") => void;
  disabled?: boolean;
}

export function SwipeCard({
  candidate,
  onSwipe,
  disabled = false,
}: SwipeCardProps) {
  const [exitX, setExitX] = useState<number | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const opacity = useTransform(
    x,
    [-200, -100, 0, 100, 200],
    [0.5, 0.8, 1, 0.8, 0.5],
  );

  const handleDragEnd = (event: MouseEvent, info: PanInfo) => {
    if (disabled) return;
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitX(200);
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      setExitX(-200);
      onSwipe("left");
    }
  };

  const handleLike = () => {
    if (disabled) return;
    setExitX(200);
    onSwipe("right");
  };

  const handlePass = () => {
    if (disabled) return;
    setExitX(-200);
    onSwipe("left");
  };

  const mainPhoto = candidate.photos?.[0] || "/placeholder-avatar.png";

  return (
    <motion.div
      className="absolute w-full max-w-md cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag={!disabled ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      animate={exitX !== null ? { x: exitX, opacity: 0 } : {}}
      transition={{ duration: 0.2 }}
      onAnimationComplete={() => {
        if (exitX !== null) setExitX(null);
      }}
    >
      <GlassCard className="relative p-6 text-center shadow-2xl backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20">
        {/* Main photo */}
        <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden ring-4 ring-primary/30 shadow-xl mb-4">
          <Image
            src={mainPhoto}
            alt={candidate.name}
            fill
            className="object-cover"
          />
        </div>

        <h2 className="text-2xl font-bold">
          {candidate.name}, {candidate.age}
          {candidate.isVerified && <VerifiedBadge />}
        </h2>
        <p className="text-muted-foreground mt-2 italic line-clamp-2">
          “{candidate.bio || "No bio yet"}”
        </p>
        {candidate.interests && candidate.interests.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {candidate.interests.slice(0, 4).map((interest) => (
              <span
                key={interest}
                className="px-2 py-1 bg-white/10 rounded-full text-xs"
              >
                {interest}
              </span>
            ))}
            {candidate.interests.length > 4 && (
              <span className="text-xs text-muted-foreground">
                +{candidate.interests.length - 4}
              </span>
            )}
          </div>
        )}

        {candidate.distanceKm !== undefined && candidate.distanceKm > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            📍 {candidate.distanceKm} km away
          </p>
        )}

        {/* Action buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={handlePass}
            disabled={disabled}
            className="p-4 rounded-full bg-rose-500/20 hover:bg-rose-500/40 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6 text-rose-500" />
          </button>
          <button
            onClick={handleLike}
            disabled={disabled}
            className="p-4 rounded-full bg-emerald-500/20 hover:bg-emerald-500/40 transition-colors disabled:opacity-50"
          >
            <Heart className="h-6 w-6 text-emerald-500" />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
