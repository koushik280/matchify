/**
 * User profile related types
 */

import { User } from "./auth.types";

export interface ProfileUpdateData {
  name?: string;
  age?: number;
  bio?: string;
  interests?: string[];
}

export interface LocationData {
  longitude: number;
  latitude: number;
}

export interface PhotoUploadResponse {
  success: boolean;
  message: string;
  user: User;
}

