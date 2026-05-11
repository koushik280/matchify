export interface Match {
  matchId: string;
  userId: string;
  name: string;
  photo: string | null;
  age: number;
  matchedAt: string;
  lastMessageAt: string;
  isVerified: boolean;
}
