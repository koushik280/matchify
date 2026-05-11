import api from "@/lib/axios";
import type {
  AdminUsersResponse,
  BlockUserPayload,
  ChangeRolePayload,
  VerifyUserPayload,
  ReportsResponse,
  ResolveReportPayload,
  AdminStats,
  AnalyticsData,
  AuditLogsResponse,
} from "@/types/admin.types";

export const fetchAdminUsers = async (params: {
  page: number;
  search?: string;
  role?: string;
  isBlocked?: string;
}) => {
  const urlParams = new URLSearchParams();
  urlParams.set("page", params.page.toString());
  if (params.search) urlParams.set("search", params.search);
  if (params.role && params.role !== "all") urlParams.set("role", params.role);
  if (params.isBlocked && params.isBlocked !== "all")
    urlParams.set("isBlocked", params.isBlocked);
  const res = await api.get<AdminUsersResponse>(
    `/admin/users?${urlParams.toString()}`,
  );
  return res.data;
};

export const blockUser = async ({ userId, isBlocked }: BlockUserPayload) => {
  await api.patch(`/admin/users/${userId}/block`, { isBlocked });
};

export const changeUserRole = async ({ userId, role }: ChangeRolePayload) => {
  await api.patch(`/admin/users/${userId}/role`, { role });
};

export const deleteUser = async (userId: string) => {
  await api.delete(`/admin/users/${userId}`);
};

export const verifyUser = async ({ userId, isVerified }: VerifyUserPayload) => {
  await api.patch(`/admin/users/${userId}/verify`, { isVerified });
};

export const fetchPendingReports = async () => {
  const res = await api.get<ReportsResponse>("/admin/reports?status=pending");
  return res.data;
};

export const resolveReport = async ({
  reportId,
  resolution,
  note,
}: ResolveReportPayload) => {
  await api.patch(`/admin/reports/${reportId}/resolve`, { resolution, note });
};

export const fetchAdminStats = async () => {
  const res = await api.get<{ stats: AdminStats }>("/admin/stats");
  return res.data.stats;
};

export const fetchAnalytics = async () => {
  const res = await api.get<{ data: AnalyticsData }>("/admin/analytics");
  return res.data.data;
};

export const fetchAuditLogs = async () => {
  const res = await api.get<AuditLogsResponse>("/superadmin/audit-logs");
  return res.data;
};
