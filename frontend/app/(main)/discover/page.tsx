"use client";

import { useEffect, useState } from "react";
import { useDiscoverFeed } from "@/hooks/useDiscoverFeed";
import { SwipeCard } from "@/components/swipe/swipe-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Loader2, Users } from "lucide-react";

export default function DiscoverPage() {
  const {
    candidates,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    swipe,
    refetch,
  } = useDiscoverFeed();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCandidate = candidates[currentIndex];

  // Infinite scroll: load more when near the end
  useEffect(() => {
    if (
      currentIndex >= candidates.length - 2 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [currentIndex, candidates.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSwipe = (direction: "left" | "right") => {
    if (!currentCandidate) return;
    const type = direction === "right" ? "like" : "pass";
    swipe({ targetUserId: currentCandidate._id, type });
    setCurrentIndex((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No more profiles</h2>
          <p className="text-muted-foreground mb-4">
            Check back later for new people.
          </p>
          <button
            onClick={() => {
              refetch();
              setCurrentIndex(0);
            }}
            className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80"
          >
            Refresh
          </button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-[60vh] pt-8">
      <div className="relative w-full max-w-md h-150 flex items-center justify-center">
        {currentCandidate ? (
          <SwipeCard
            key={currentCandidate._id}
            candidate={currentCandidate}
            onSwipe={handleSwipe}
            disabled={false}
          />
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">Loading more profiles...</p>
            {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin mx-auto mt-4" />}
          </div>
        )}
      </div>
    </div>
  );
}