"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Shield, Ban, Trash2, CheckCircle } from "lucide-react";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import type { AdminUser } from "@/types/admin.types";

export default function AdminUsers() {
  const { user: currentUser } = useAuthStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [blockedFilter, setBlockedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    type: "block" | "role" | "delete" | "verify";
    open: boolean;
  }>({ type: "block", open: false });
  const [newRole, setNewRole] = useState("");

  const {
    users,
    pagination,
    isLoading,
    blockUser,
    changeRole,
    deleteUser,
    verifyUser,
  } = useAdminUsers({ page, search, roleFilter, blockedFilter });

  const isSuperAdmin = currentUser?.role === "superadmin";
  const isAdmin = currentUser?.role === "admin";

  const handleBlockToggle = () => {
    if (!selectedUser) return;
    blockUser({ userId: selectedUser._id, isBlocked: !selectedUser.isBlocked });
    setActionDialog({ ...actionDialog, open: false });
  };

  const handleRoleChange = () => {
    if (!selectedUser || !newRole) return;
    changeRole({
      userId: selectedUser._id,
      role: newRole as AdminUser["role"],
    });
    setActionDialog({ ...actionDialog, open: false });
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    deleteUser(selectedUser._id);
    setActionDialog({ ...actionDialog, open: false });
  };

  const handleVerify = () => {
    if (!selectedUser) return;
    verifyUser({
      userId: selectedUser._id,
      isVerified: !selectedUser.isVerified,
    });
    setActionDialog({ ...actionDialog, open: false });
  };

  const openAction = (
    user: AdminUser,
    type: "block" | "role" | "delete" | "verify",
  ) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setActionDialog({ type, open: true });
  };

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-50 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-37.5">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="superadmin">SuperAdmin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={blockedFilter} onValueChange={setBlockedFilter}>
            <SelectTrigger className="w-37.5">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Blocked</SelectItem>
              <SelectItem value="false">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-25"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isCurrentUser = user._id === currentUser?._id;
              return (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">
                    {user.name}
                    {isCurrentUser && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "admin" || user.role === "superadmin"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge variant="destructive">Blocked</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Badge variant="default" className="bg-green-600">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Verified</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(isAdmin || isSuperAdmin) && !isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAction(user, "block")}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      {isSuperAdmin && !isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAction(user, "verify")}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {isSuperAdmin && !isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAction(user, "role")}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                      {isSuperAdmin && !isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAction(user, "delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </GlassCard>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button
              disabled={page === pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "block" &&
                (selectedUser?.isBlocked ? "Unblock User" : "Block User")}
              {actionDialog.type === "role" && "Change User Role"}
              {actionDialog.type === "delete" && "Delete User"}
              {actionDialog.type === "verify" &&
                (selectedUser?.isVerified
                  ? "Remove Verification"
                  : "Verify User")}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === "block" &&
                `Are you sure you want to ${selectedUser?.isBlocked ? "unblock" : "block"} ${selectedUser?.name}?`}
              {actionDialog.type === "role" &&
                `Select a new role for ${selectedUser?.name}.`}
              {actionDialog.type === "delete" &&
                `This action cannot be undone. ${selectedUser?.name} will be permanently deleted.`}
              {actionDialog.type === "verify" &&
                `${selectedUser?.isVerified ? "Remove verification" : "Verify"} ${selectedUser?.name}?`}
            </DialogDescription>
          </DialogHeader>
          {actionDialog.type === "role" && (
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">SuperAdmin</SelectItem>
              </SelectContent>
            </Select>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ ...actionDialog, open: false })}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionDialog.type === "delete" ? "destructive" : "default"
              }
              onClick={
                actionDialog.type === "block"
                  ? handleBlockToggle
                  : actionDialog.type === "role"
                    ? handleRoleChange
                    : actionDialog.type === "delete"
                      ? handleDelete
                      : handleVerify
              }
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
