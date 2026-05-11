"use client";
import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminReports } from "@/hooks/useAdminReports";
import type { Report } from "@/types/admin.types";

export default function AdminReports() {
  const { reports, isLoading, error, resolveReport, isResolving } =
    useAdminReports();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolution, setResolution] = useState<"block_user" | "dismiss">(
    "block_user",
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleResolve = () => {
    if (!selectedReport) return;
    resolveReport({
      reportId: selectedReport._id,
      resolution,
      note: "",
    });
    setDialogOpen(false);
    setSelectedReport(null);
  };

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
        Failed to load reports. Please try again.
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Pending Reports</h1>
        <GlassCard className="p-8 text-center">
          <p className="text-muted-foreground">No pending reports.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pending Reports</h1>
      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reported User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell className="font-medium">
                    {report.reportedUserId?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.reason}</Badge>
                  </TableCell>
                  <TableCell>{report.reporterId?.name || "Unknown"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedReport(report);
                        setDialogOpen(true);
                      }}
                    >
                      Resolve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </GlassCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Report</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Reported user:{" "}
            <span className="font-semibold">
              {selectedReport?.reportedUserId?.name || "Unknown"}
            </span>
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Reason:{" "}
            <span className="font-semibold">{selectedReport?.reason}</span>
          </p>
          <Select
            value={resolution}
            onValueChange={(val) =>
              setResolution(val as "block_user" | "dismiss")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="block_user">Block User</SelectItem>
              <SelectItem value="dismiss">Dismiss</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve} disabled={isResolving}>
              {isResolving ? "Resolving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
