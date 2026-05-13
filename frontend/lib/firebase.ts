// frontend/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  MessagePayload,
} from "firebase/messaging";
import api from "./axios";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let messaging: any = null;

export const initMessaging = () => {
  if (typeof window === "undefined") return null;
  if (messaging) return messaging;
  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    messaging = getMessaging(app);
  } catch (err) {
    console.error("Firebase messaging init error:", err);
  }
  return messaging;
};

const sendTokenToBackend = async (token: string) => {
  try {
    await api.post("/users/notification-token", { token });
    console.log("Token stored on backend");
  } catch (err) {
    console.error("Failed to send token to backend:", err);
  }
};

export const requestNotificationPermission = async (
  onToken?: (token: string) => void,
  retries = 3,
) => {
  const msg = initMessaging();
  if (!msg || typeof window === "undefined") return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    // ✅ Use the existing service worker registration (already registered by ServiceWorkerRegistration component)
    const registration = await navigator.serviceWorker.getRegistration("/");
    if (!registration) {
      console.error(
        "No service worker registration found. Make sure ServiceWorkerRegistration component is mounted.",
      );
      return;
    }

    // Wait for the service worker to be active
    if (!registration.active) {
      await new Promise<void>((resolve) => {
        const checkActive = setInterval(() => {
          if (registration.active) {
            clearInterval(checkActive);
            resolve();
          }
        }, 100);
      });
    }

    let token = null;
    for (let i = 0; i < retries; i++) {
      try {
        token = await getToken(msg, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });
        if (token) break;
        console.log(`Retry ${i + 1} for token...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`Attempt ${i + 1} failed:`, err);
      }
    }

    if (token) {
      console.log("FCM Token obtained:", token);
      await sendTokenToBackend(token);
      if (onToken) onToken(token);
    } else {
      console.warn("Could not obtain FCM token after multiple attempts.");
    }
  } catch (err) {
    console.error("Error in notification permission:", err);
  }
};

export const onMessageListener = (): Promise<MessagePayload> =>
  new Promise((resolve) => {
    const msg = initMessaging();
    if (!msg) return;
    const unsubscribe = onMessage(msg, (payload) => {
      unsubscribe(); // only resolve once per call
      resolve(payload);
    });
  });

// Optional: re‑initialize and get token without prompting (e.g., after page refresh)
export const initFirebaseMessaging = async () => {
  initMessaging();
  if (Notification.permission === "granted") {
    const msg = initMessaging();
    if (msg) {
      const token = await getToken(msg, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      if (token) {
        console.log("Existing FCM Token:", token);
        await sendTokenToBackend(token);
        return token;
      }
    }
  }
  return null;
};
