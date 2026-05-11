import { Candidate } from "./swipe.types";

export interface DiscoverResponse {
  data: Candidate[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}