/**
 * Authentication related types
 */

export interface User {
  _id: string;
  email: string;
  name: string;
  role: "user" | "moderator" | "admin" | "superadmin";
  isVerified?: boolean;
  isBlocked?: boolean;
  profileCompleted: boolean;
  photos?: string[];
  age?: number | null;
  bio?: string;
  interests?: string[];
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };

  matchesCount?: number;
  messagesCount?: number;
  profileViews?: number;
  fcmTokens?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  age?: number;
  bio?: string;
  interests?: string[];
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

export interface RefreshResponse {
  success: boolean;
  accessToken: string;
}
