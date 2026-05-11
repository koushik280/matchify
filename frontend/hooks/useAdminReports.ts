import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchPendingReports, resolveReport } from "@/api/admin";
import type { Report } from "@/types/admin.types";
import type { AxiosError } from "axios";

export function useAdminReports() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<{ data: Report[] }, AxiosError>({
    queryKey: ["admin-reports"],
    queryFn: fetchPendingReports,
  });

  const resolveMutation = useMutation({
    mutationFn: resolveReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast.success("Report resolved");
    },
    onError: (error: AxiosError) => {
      toast.error(error.message || "Failed to resolve report");
    },
  });

  return {
    reports: data?.data || [],
    isLoading,
    error,
    resolveReport: resolveMutation.mutate,
    isResolving: resolveMutation.isPending,
  };
}

