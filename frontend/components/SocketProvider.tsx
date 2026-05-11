"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getSocket, disconnectSocket } from "@/lib/socket";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    // If we have a token and a user, connect the socket
    if ( user&& user._id) {
      const socket = getSocket();

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
      });
    }

    // Cleanup: disconnect when user logs out or component unmounts
    return () => {
      if (!user) {
        disconnectSocket();
      }
    };
  }, [ user?._id, isLoading]); // Re-run when token or user changes

  return <>{children}</>;
}
