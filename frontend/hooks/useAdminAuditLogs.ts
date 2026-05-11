import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "@/api/admin";
import type { AuditLog } from "@/types/admin.types";
import type { AxiosError } from "axios";

export function useAdminAuditLogs() {
  const { data, isLoading, error } = useQuery<{ data: AuditLog[] }, AxiosError>(
    {
      queryKey: ["audit-logs"],
      queryFn: fetchAuditLogs,
    },
  );

  return {
    logs: data?.data || [],
    isLoading,
    error,
  };
}
