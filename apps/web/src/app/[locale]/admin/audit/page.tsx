"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable, type ColumnDef } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

interface AuditLogRow {
  _id: string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export default function AdminAuditPage() {
  const { data, isLoading, error } = useQuery<{ items: AuditLogRow[] }>({
    queryKey: ["admin", "audit-logs"],
    queryFn: () => apiFetch("/admin/audit-logs"),
  });

  const logs = data?.items || [];

  const columns = useMemo<ColumnDef<AuditLogRow>[]>(
    () => [
      {
        key: "createdAt",
        header: "Timestamp",
        sortable: true,
        cell: (row) => (
          <span className="text-xs font-mono text-ioma-grey-600">
            {new Date(row.createdAt).toLocaleString("en-AE")}
          </span>
        ),
      },
      {
        key: "actorEmail",
        header: "Administrator",
        sortable: true,
        cell: (row) => (
          <span className="text-xs font-medium text-ioma-black">{row.actorEmail}</span>
        ),
      },
      {
        key: "action",
        header: "Action Event",
        sortable: true,
        cell: (row) => (
          <Badge
            variant="outline"
            className="font-mono text-xs uppercase bg-ioma-grey-50"
          >
            {row.action}
          </Badge>
        ),
      },
      {
        key: "resource",
        header: "Resource Target",
        cell: (row) => (
          <div className="text-xs">
            <span className="font-medium capitalize">{row.resource}</span>
            {row.resourceId && (
              <span className="ml-1 font-mono text-ioma-grey-500 text-[10px]">
                ({row.resourceId})
              </span>
            )}
          </div>
        ),
      },
      {
        key: "details",
        header: "Event Details",
        cell: (row) => (
          <span className="text-xs font-mono text-ioma-grey-500 truncate max-w-xs block">
            {row.details ? JSON.stringify(row.details) : "—"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-light tracking-tight text-ioma-black md:text-4xl flex items-center gap-3">
          <ShieldAlert className="h-8 w-8 text-ioma-black" />
          Security Audit Trail
        </h1>
        <p className="mt-2 text-ioma-grey-500">
          Immutable audit record of administrative actions, status approvals, inventory
          updates, and system operations.
        </p>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        keyField="_id"
        isLoading={isLoading}
        error={error ? "Failed to load audit logs" : null}
        searchPlaceholder="Search actor email or action name..."
        searchField={(row) => `${row.actorEmail} ${row.action} ${row.resource}`}
      />
    </div>
  );
}
