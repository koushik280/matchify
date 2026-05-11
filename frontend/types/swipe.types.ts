/**
 * Swipe and match related types
 */

import { User } from "./auth.types";

export interface SwipeData {
  targetUserId: string;
  type: "like" | "pass";
}

export interface SwipeResponse {
  success: boolean;
  swipe: { id: string; type: "like" | "pass" };
  isMutual: boolean;
  match?: {
    id: string;
    createdAt: string;
  };
}

export interface Candidate extends User {
  distanceKm?: number;
  isVerified?: boolean;
}

export interface Match {
  matchId: string;
  user: User;
  matchedAt: string;
  lastMessageAt: string;
}
