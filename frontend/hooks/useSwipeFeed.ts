import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import api from "@/lib/axios";
import { Candidate, SwipeResponse } from "@/types/swipe.types";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface DiscoverResponse {
  success: boolean;
  data: Candidate[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

interface SwipeVariables {
  targetUserId: string;
  type: "like" | "pass";
}

interface DiscoverPage {
  data: Candidate[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}

interface DiscoverCacheData {
  pages: DiscoverPage[];
  pageParams: (string | null)[];
}

export function useSwipeFeed() {
  const queryClient = useQueryClient();

  // Fetch candidates with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["discover"],
    queryFn: async ({ pageParam }) => {
      const response = await api.get<DiscoverResponse>(
        `/discover?cursor=${pageParam || ""}&limit=10`,
      );
      return response.data;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    staleTime: 5 * 60 * 1000,
  });

  // Submit swipe
  const swipeMutation = useMutation<SwipeResponse, AxiosError, SwipeVariables>({
    mutationFn: async ({
      targetUserId,
      type,
    }: {
      targetUserId: string;
      type: "like" | "pass";
    }) => {
      const response = await api.post<SwipeResponse>("/swipe", {
        targetUserId,
        type,
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (data.isMutual && data.match) {
        // Trigger match event (will be handled in component)
        window.dispatchEvent(new CustomEvent("match", { detail: data.match }));
      }
      // Remove the swiped candidate from the cache
      queryClient.setQueryData<DiscoverCacheData>(["discover"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.filter(
              (c: Candidate) => c._id !== variables.targetUserId,
            ),
          })),
        };
      });
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        toast.error("You already swiped on this person");
      } else {
        toast.error("Swipe failed. Please try again.");
      }
    },
  });

  // Flatten all candidates from all pages
  const candidates = data?.pages.flatMap((page) => page.data) || [];

  return {
    candidates,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    swipe: swipeMutation.mutate,
    isSwiping: swipeMutation.isPending,
    refetch,
  };
}
