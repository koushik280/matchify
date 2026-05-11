"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import confetti from "canvas-confetti";

interface MatchModalProps {
  isOpen: boolean;
  matchName: string;
  onClose: () => void;
  onMessage: () => void;
}

export function MatchModal({
  isOpen,
  matchName,
  onClose,
  onMessage,
}: MatchModalProps) {
  useEffect(() => {
    if (isOpen) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <GlassCard className="p-8 text-center max-w-sm mx-auto">
              <div className="inline-flex p-3 rounded-full bg-primary/20 mb-4">
                <Heart className="h-12 w-12 text-primary fill-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">It&apos;s a Match!</h2>
              <p className="text-muted-foreground mb-4">
                You and{" "}
                <span className="font-semibold text-primary">{matchName}</span>{" "}
                have liked each other.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Keep Swiping
                </Button>
                <Button onClick={onMessage} className="flex-1 gap-2">
                  <MessageCircle className="h-4 w-4" /> Message
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
