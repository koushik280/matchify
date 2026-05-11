// hooks/useMatches.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Match } from "@/types/matches.types";

export function useMatches() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const response = await api.get("/matches");
      return response.data.data as Match[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    matches: data || [],
    isLoading,
    error,
    refetch,
  };
}
