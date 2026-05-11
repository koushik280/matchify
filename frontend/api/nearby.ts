// api/nearby.ts
import api from "@/lib/axios";
import type { Candidate } from "@/types/swipe.types";

export interface NearbyUser extends Candidate {
  distanceKm?: number;
}

export const fetchNearbyUsers = async (
  radius: number = 10,
  limit: number = 20,
) => {
  const res = await api.get<{ data: NearbyUser[] }>(
    `/discover/nearby?radius=${radius}&limit=${limit}`,
  );
  // Transform distanceKm from string to number
  const rawData = res.data.data || [];
  const transformed: NearbyUser[] = rawData.map((item) => ({
    ...item,
    distanceKm: item.distanceKm
      ? parseFloat(item.distanceKm as unknown as string)
      : undefined,
  }));
  return transformed;
};

export const updateUserLocation = async (
  longitude: number,
  latitude: number,
) => {
  const res = await api.patch("/profile/location", { longitude, latitude });
  return res.data;
};

export const swipeOnUser = async (
  targetUserId: string,
  type: "like" | "pass",
) => {
  const res = await api.post("/swipe", { targetUserId, type });
  return res.data;
};

