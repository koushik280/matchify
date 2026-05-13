// "use client";
// import { useEffect, useRef } from "react";
// import { useAuthStore } from "@/stores/authStore";
// import {
//   requestNotificationPermission,
//   onMessageListener,
// } from "@/lib/firebase";
// import toast from "react-hot-toast";

// export function NotificationProvider({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { user, setFcmToken } = useAuthStore();
//   const isMountedRef = useRef(true);

//   // Request permission and store token when user logs in
//   useEffect(() => {
//     if (user) {
//       requestNotificationPermission((token) => {
//         if (isMountedRef.current) setFcmToken(token);
//       });
//     } else {
//       setFcmToken(null);
//     }
//     return () => {
//       isMountedRef.current = false;
//     };
//   }, [user, setFcmToken]);

//   // Continuous foreground message listener (loops on each message)
//   useEffect(() => {
//     let active = true;
//     const listenForeground = async () => {
//       while (active) {
//         try {
//           const payload = await onMessageListener();
//           if (!active) break;
//           toast.success(
//             `${payload.notification?.title}: ${payload.notification?.body}`,
//           );
//         } catch (err) {
//           console.error("Foreground message error:", err);
//           await new Promise((resolve) => setTimeout(resolve, 2000));
//         }
//       }
//     };
//     listenForeground();
//     return () => {
//       active = false;
//     };
//   }, []);

//   return <>{children}</>;
// }

// frontend/components/NotificationProvider.tsx
"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { requestNotificationPermission, initMessaging } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";
import toast from "react-hot-toast";

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setFcmToken } = useAuthStore();
  const syncAttempted = useRef(false);

  useEffect(() => {
    // We only attempt the sync once per session, but we wait for user data
    if (user && user._id && !syncAttempted.current) {
      syncAttempted.current = true;

      // Delaying slightly ensures the browser environment is fully stable
      const timer = setTimeout(() => {
        console.log("Edge/Chrome Sync Triggered: User has no tokens stored.");
        requestNotificationPermission((token) => {
          setFcmToken(token);
        });
      }, 2000);

      return () => clearTimeout(timer);
    }

    if (!user) {
      syncAttempted.current = false;
    }
  }, [user, setFcmToken]);

  // Foreground Listener
  useEffect(() => {
    if (!user || !user._id) return;
    const msg = initMessaging();
    if (!msg) return;

    const unsubscribe = onMessage(msg, (payload) => {
      toast.success(
        `${payload.notification?.title}: ${payload.notification?.body}`,
      );
    });

    return () => unsubscribe();
  }, [user]);

  return <>{children}</>;
}
