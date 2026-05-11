import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  age: z.number().min(18).max(99).optional(),
  bio: z.string().max(500).optional(),
  interests: z.array(z.string()).optional(),
  photos: z.array(z.string()).optional(),
});

export const locationSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type LocationData = z.infer<typeof locationSchema>;
