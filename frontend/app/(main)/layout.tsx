// app/(main)/layout.tsx
'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { Navbar } from '@/components/Navbar';
//import { useAuth } from '@/hooks/useAuth';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // const { user } = useAuth();

  // if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-linear-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}