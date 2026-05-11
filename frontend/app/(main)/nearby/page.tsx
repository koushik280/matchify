"use client";

import { useNearby } from "@/hooks/useNearby";
import { SwipeCard } from "@/components/swipe/swipe-card";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, AlertCircle } from "lucide-react";

export default function NearbyPage() {
  const {
    currentCandidate,
    isLoading,
    hasLocation,
    isUpdatingLocation,
    error,
    updateLocation,
    swipe,
    fetchNearby,
  } = useNearby();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Location needed</h2>
          <p className="text-muted-foreground mb-4">
            To find people near you, we need access to your location.
          </p>
          <Button onClick={updateLocation} disabled={isUpdatingLocation}>
            {isUpdatingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting location...
              </>
            ) : (
              "Share my location"
            )}
          </Button>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => fetchNearby()}>Try again</Button>
        </GlassCard>
      </div>
    );
  }

  if (currentCandidate === null && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No nearby users</h2>
          <p className="text-muted-foreground mb-4">
            There’s no one nearby right now. Check back later or increase your
            radius.
          </p>
          <Button onClick={() => fetchNearby(20)}>Expand radius (20km)</Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-[60vh] pt-8">
      <div className="w-full max-w-md mb-4 text-center">
        <p className="text-sm text-muted-foreground">
          Showing people within{" "}
          <strong>{currentCandidate?.distanceKm?.toFixed(1)} km</strong> of you
        </p>
      </div>
      <div className="relative w-full max-w-md h-150 flex items-center justify-center">
        {currentCandidate && (
          <SwipeCard
            key={currentCandidate._id}
            candidate={currentCandidate}
            onSwipe={swipe}
            disabled={false}
          />
        )}
      </div>
    </div>
  );
}
