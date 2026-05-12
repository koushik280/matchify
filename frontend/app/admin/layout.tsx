"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Loader2, Menu } from "lucide-react";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, _hasHydrated } = useAuthStore();
  const router = useRouter();

  // Lazy initializer: read localStorage only once during initial render
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminSidebarCollapsed");
      return saved === "true";
    }
    return false;
  });

  // Save collapsed state to localStorage when it changes (no effect warning here)
  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem("adminSidebarCollapsed", String(newState));
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isLoading) {
      if (!user) router.push("/");
      else if (user.role !== "admin" && user.role !== "superadmin")
        router.push("/dashboard");
    }
  }, [user, isLoading, _hasHydrated, router]);

  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "superadmin"))
    return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900/20 via-pink-900/20 to-orange-900/20 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Mobile Drawer (visible on small screens) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden fixed top-4 left-4 z-50"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 p-0 bg-background/95 backdrop-blur-xl"
            >
              <AdminNav collapsed={false} onToggle={() => {}} />
            </SheetContent>
          </Sheet>

          {/* Desktop Sidebar */}
          <aside
            className={`hidden md:block transition-all duration-300 ${
              collapsed ? "w-20" : "w-64"
            } relative`}
          >
            <AdminNav collapsed={collapsed} onToggle={handleToggle} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
