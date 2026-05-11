import { z } from "zod";

export const swipeSchema = z.object({
  targetUserId: z.string().length(24), // MongoDB ObjectId
  type: z.enum(["like", "pass"]),
});
