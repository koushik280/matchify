"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider"; // we'll create this
import "./globals.css";
import { NotificationProvider } from "@/components/NotificationProvider";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { SocketProvider } from "@/components/SocketProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Empty array is crucial!
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <ThemeProvider>
          <NotificationProvider>
            <SocketProvider>
              <QueryClientProvider client={queryClient}>
                {children}
                <Toaster position="top-right" />
              </QueryClientProvider>
            </SocketProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
