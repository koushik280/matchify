"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading,isLoggedOut, fetchAuth } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    const verifySession = async () => {

       if (isLoggedOut) {
        setIsChecking(false);
        return;
      }
      // Only call fetchAuth if we don't have a user yet and we're not already loading
      if (!user && !isLoading) {
        await fetchAuth();
      }
      setIsChecking(false);
    };
    verifySession();
  }, [fetchAuth, user, isLoading,isLoggedOut]);

  useEffect(() => {
    if (!isLoading && !isChecking && !user&& !isLoggedOut) {
      router.replace("/login");
    }
  }, [user, isLoading, isChecking, router,isLoggedOut]);

  if (isLoading || isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-pink-500" />
        <p className="mt-4 text-muted-foreground animate-pulse">
          Verifying Matchify+ Session...
        </p>
      </div>
    );
  }
  return user ? <>{children}</> : null;
}
