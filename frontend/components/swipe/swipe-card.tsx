"use client";

import { useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, Flag } from "lucide-react";
import Image from "next/image";
import { GlassCard } from "@/components/ui/glass-card";
import { Candidate } from "@/types/swipe.types";
import { VerifiedBadge } from "../ui/verified-badge";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import type { AxiosError } from "axios";

interface SwipeCardProps {
  candidate: Candidate;
  onSwipe: (direction: "left" | "right") => void;
  disabled?: boolean;
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam or promotional content" },
  { value: "fake_profile", label: "Fake profile" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "underage", label: "Underage user" },
  { value: "other", label: "Other" },
];

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);

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

  const handleReport = async () => {
    if (!selectedReason) {
      toast.error("Please select a reason");
      return;
    }
    setIsReporting(true);
    try {
      await api.post("/reports", {
        reportedUserId: candidate._id,
        reason: selectedReason,
        description: reportDescription,
      });
      toast.success(
        "Report submitted. Thank you for helping keep the community safe.",
      );
      setShowReportModal(false);
      setSelectedReason("");
      setReportDescription("");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message =
        axiosError.response?.data?.message || "Failed to submit report";
      toast.error(message);
    } finally {
      setIsReporting(false);
    }
  };

  const mainPhoto = candidate.photos?.[0] || "/placeholder-avatar.png";

  return (
    <>
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

          <div className="flex justify-center gap-4 mt-6">
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
            {/* ✅ NEW: Report button */}
            <button
              onClick={() => setShowReportModal(true)}
              disabled={disabled}
              className="p-4 rounded-full bg-yellow-500/20 hover:bg-yellow-500/40 transition-colors disabled:opacity-50"
              title="Report this user"
            >
              <Flag className="h-6 w-6 text-yellow-500" />
            </button>
          </div>
        </GlassCard>
      </motion.div>
      {/* ✅ ADDED: Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">Report User</h3>
            <p className="text-muted-foreground mb-4">
              Why are you reporting {candidate.name}?
            </p>

            <div className="space-y-3 mb-4">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="text-sm">{reason.label}</span>
                </label>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Additional details (optional)
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Please provide more information..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-md border hover:bg-secondary transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={isReporting}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {isReporting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
