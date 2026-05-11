"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Heart, Users, Loader2 } from "lucide-react";
import Image from "next/image";
import { useMatches } from "@/hooks/useMatches";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/ui/verified-badge";

export default function MatchesPage() {
  const router = useRouter();
  const { matches, isLoading, error } = useMatches();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <p className="text-red-500">
            Failed to load matches. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
          <p className="text-muted-foreground mb-4">
            Keep swiping to find people who like you back!
          </p>
          <Button onClick={() => router.push("/discover")}>
            Start Swiping
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Your Matches</h1>
          <span className="text-sm text-muted-foreground">
            ({matches.length})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {matches.map((match, idx) => (
            <motion.div
              key={match.matchId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard className="p-4 flex items-center gap-4 hover:shadow-xl transition-all">
                {/* Avatar */}
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/30">
                  {match.photo ? (
                    <Image
                      src={match.photo}
                      alt={match.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {match.name[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {match.name}, {match.age}
                    {match.isVerified && <VerifiedBadge />}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Matched on {new Date(match.matchedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Chat button */}
                <Button
                  size="sm"
                  onClick={() => router.push(`/chat/${match.matchId}`)}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
