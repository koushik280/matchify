"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  User,
  // MessageCircle,
  LogOut,
  LayoutDashboard,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "./ui/button";
//import api from "@/lib/axios";
import toast from "react-hot-toast";
import axios from "axios";

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  // const handleLogout = async () => {
  //   try {
  //     await api.post("/auth/logout", { token: fcmTokens });
  //     logout();
  //     toast.success("Logged out");
  //     window.location.href = "/";
  //   } catch (error) {
  //     toast.error("Logout failed");
  //   }
  // };

  const handleLogout = async () => {
    const tokenToDelete = useAuthStore.getState().fcmTokens;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        { token: tokenToDelete },
        { withCredentials: true },
      );
    } catch {
      console.warn("Server logout failed, clearing local state.");
    } finally {
      logout(); // Clear Zustand
      toast.success("Logged out");
      window.location.href = "/";
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/matches", label: "Matches", icon: Heart },
    //{ href: "/chat", label: "Chat", icon: MessageCircle },
    { href: "/nearby", label: "Nearby", icon: MapPin },
  ];

  return (
    <nav className="glass sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-xl font-bold bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
        >
          Matchify+
        </Link>

        <div className="flex items-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}

          {/* Admin link (visible only for admin/superadmin) */}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname.startsWith("/admin")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}

          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
