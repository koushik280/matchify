/**
 * Common API response wrappers
 */

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ msg: string; param?: string }>;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    nextCursor: string | null;
    hasMore: boolean;
    limit: number;
  };
}
