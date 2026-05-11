// api/discover.ts
import api from "@/lib/axios";
import { DiscoverResponse } from "@/types/discover.types";

export const fetchDiscoverFeed = async (cursor: string | null = null) => {
  const res = await api.get<DiscoverResponse>(
    `/discover?cursor=${cursor || ""}&limit=10`,
  );
  return res.data;
};

export const submitSwipe = async (
  targetUserId: string,
  type: "like" | "pass",
) => {
  const res = await api.post("/swipe", { targetUserId, type });
  return res.data;
};
