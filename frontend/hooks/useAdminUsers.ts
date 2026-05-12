import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchAdminUsers,
  blockUser,
  changeUserRole,
  deleteUser,
  verifyUser,
} from "@/api/admin";
import type { UseAdminUsersParams } from "@/types/admin.types";

export function useAdminUsers({
  page,
  search,
  roleFilter,
  blockedFilter,
}: UseAdminUsersParams) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter, blockedFilter],
    queryFn: () =>
      fetchAdminUsers({
        page,
        search,
        role: roleFilter,
        isBlocked: blockedFilter,
      }),
  });

  const blockMutation = useMutation({
    mutationFn: blockUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(`User ${variables.isBlocked ? "blocked" : "unblocked"}`);
    },
  });

  const roleMutation = useMutation({
    mutationFn: changeUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("User role updated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("User deleted");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success(`User ${variables.isVerified ? "verified" : "unverified"}`);
    },
  });

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    refetch,
    blockUser: blockMutation.mutate,
    changeRole: roleMutation.mutate,
    deleteUser: deleteMutation.mutate,
    verifyUser: verifyMutation.mutate,
    isBlocking: blockMutation.isPending,
    isChangingRole: roleMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isVerifying: verifyMutation.isPending,
  };
}
