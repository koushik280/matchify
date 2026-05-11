"use client";

import {
  Users,
  UserX,
  Flag,
  Calendar,
  TrendingUp,
  PieChart as PieChartIcon,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

export default function AdminDashboard() {
  const { stats, analytics, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load dashboard data. Please try again.
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Blocked Users",
      value: stats?.blockedUsers ?? 0,
      icon: UserX,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      label: "Pending Reports",
      value: stats?.pendingReports ?? 0,
      icon: Flag,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
    {
      label: "New Today",
      value: stats?.newUsersToday ?? 0,
      icon: Calendar,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
  ];

  const userGrowthData = analytics?.userGrowth ?? [];
  const matchSuccessData = analytics?.matchSuccess ?? [];
  const roleDistribution = analytics?.roleDistribution ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of platform activity and metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, idx) => (
          <GlassCard
            key={idx}
            className="p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">User Growth (Last 7 Days)</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#333"
                opacity={0.3}
              />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#ec4899"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Total Activity</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={matchSuccessData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#333"
                opacity={0.3}
              />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "#fff" }}
              />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">User Role Distribution</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-around">
          <ResponsiveContainer width="100%" height={250} className="md:w-1/2">
            <PieChart>
              <Pie
                data={roleDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
              >
                {roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 md:mt-0">
            {roleDistribution.map((role) => (
              <div key={role.name} className="flex items-center gap-3 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: role.color }}
                />
                <span className="text-sm">
                  {role.name}: {role.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
