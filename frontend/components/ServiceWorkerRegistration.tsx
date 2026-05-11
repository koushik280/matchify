'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((reg) => {
          console.log('✅ Service Worker registered:', reg);
        })
        .catch((err) => {
          console.error('❌ Service Worker registration failed:', err);
        });
    } else {
      console.warn('Service workers are not supported.');
    }
  }, []);

  return null;
}