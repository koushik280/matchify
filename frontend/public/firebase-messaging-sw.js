// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyB2OZUR7ucFZwT_ERf5pEa3IPTcdad6X63Q",
  authDomain: "matchify-95a73.firebaseapp.com",
  projectId: "matchify-95a73",
  storageBucket: "matchify-95a73.firebasestorage.app",
  messagingSenderId: "420135848359",
  appId: "1:420135848359:web:a5299b86c19fff38ff0e82",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

