// hooks/useAdminDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { fetchAdminStats, fetchAnalytics } from '@/api/admin';
import type { AdminStats, AnalyticsData } from '@/types/admin.types';
import type { AxiosError } from 'axios';

export function useAdminDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats, AxiosError>({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  });

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery<AnalyticsData, AxiosError>({
    queryKey: ['admin-analytics'],
    queryFn: fetchAnalytics,
  });

  return {
    stats: stats ?? null,
    analytics: analytics ?? null,
    isLoading: statsLoading || analyticsLoading,
    error: statsError || analyticsError,
  };
}