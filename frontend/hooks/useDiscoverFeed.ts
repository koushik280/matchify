// hooks/useDiscoverFeed.ts
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import { fetchDiscoverFeed, submitSwipe } from "@/api/discover";
import type { Candidate } from "@/types/swipe.types";
import { DiscoverResponse } from "@/types/discover.types";

export function useDiscoverFeed() {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["discover"],
    queryFn: ({ pageParam }) => fetchDiscoverFeed(pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    staleTime: 5 * 60 * 1000,
  });

  const candidates = data?.pages.flatMap((page) => page.data) || [];

  const swipeMutation = useMutation({
    mutationFn: ({
      targetUserId,
      type,
    }: {
      targetUserId: string;
      type: "like" | "pass";
    }) => submitSwipe(targetUserId, type),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData<InfiniteData<DiscoverResponse>>(
        ["discover"],
        (oldData) => {
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
        },
      );
    },
  });

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
