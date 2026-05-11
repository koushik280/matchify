"use client";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAdminAuditLogs } from "@/hooks/useAdminAuditLogs";

export default function AuditLogs() {
  const { logs, isLoading, error } = useAdminAuditLogs();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load audit logs. Please try again.
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <GlassCard className="p-8 text-center">
          <p className="text-muted-foreground">No audit logs found.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Audit Logs</h1>
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log._id}>
                  <TableCell>{log.adminId?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {log.targetId}
                    </code>
                  </TableCell>
                  <TableCell>
                    <pre className="text-xs whitespace-pre-wrap max-w-75 overflow-hidden">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlassCard>
    </div>
  );
}
