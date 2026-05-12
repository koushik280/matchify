"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Flag,
  ScrollText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface AdminNavProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminNav({ collapsed, onToggle }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isSuperAdmin = user?.role === "superadmin";

  const items = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reports", label: "Reports", icon: Flag },
  ];
  if (isSuperAdmin) {
    items.push({ href: "/admin/audit", label: "Audit Logs", icon: ScrollText });
  }

  const handleLogout = async () => {
    try {
      const { fcmTokens } = useAuthStore.getState();
      const token = fcmTokens || undefined;
      await api.post("/auth/logout", { token });
      logout();
      toast.success("Logged out");
      router.push("/");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Back to User Dashboard */}
      <div className="mb-6 px-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {!collapsed && <span>Back to Dashboard</span>}
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-white/10 text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg w-full hover:bg-red-500/10 text-red-500 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-primary rounded-full p-1 shadow-md z-10"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
