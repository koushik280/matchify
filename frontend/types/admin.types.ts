/**
 * ----------------Admin User Types----------
 */
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "moderator" | "admin" | "superadmin";
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  success: boolean;
  data: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface BlockUserPayload {
  userId: string;
  isBlocked: boolean;
}

export interface ChangeRolePayload {
  userId: string;
  role: AdminUser["role"];
}

export interface VerifyUserPayload {
  userId: string;
  isVerified: boolean;
}

export interface UseAdminUsersParams {
  page: number;
  search: string;
  roleFilter: string;
  blockedFilter: string;
}

/**
 * ----------------Admin Reports Types----------
 */
export interface Report {
  _id: string;
  reporterId: {
    _id: string;
    name: string;
    email: string;
  } | null;
  reportedUserId: {
    _id: string;
    name: string;
    email: string;
  } | null;
  reason: string;
  description?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  updatedAt: string;
}

export interface ReportsResponse {
  success: boolean;
  data: Report[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ResolveReportPayload {
  reportId: string;
  resolution: "block_user" | "dismiss";
  note?: string;
}

/**
 * ----------------Admin Dashboard Types----------
 */

export interface AdminStats {
  totalUsers: number;
  blockedUsers: number;
  pendingReports: number;
  newUsersToday: number;
}

export interface UserGrowthPoint {
  date: string;
  users: number;
}

export interface MatchSuccessPoint {
  name: string;
  value: number;
}

export interface RoleDistributionPoint {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsData {
  userGrowth: UserGrowthPoint[];
  matchSuccess: MatchSuccessPoint[];
  roleDistribution: RoleDistributionPoint[];
}

/**
 * ----------------Admin AuditLogs Types----------
 */
export interface AuditLog {
  _id: string;
  adminId: {
    _id: string;
    name: string;
    email: string;
  } | null;
  action: string;
  targetId: string;
  targetModel: string;
  details: Record<string, unknown>;
  createdAt: string;
  ipAddress?: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}


