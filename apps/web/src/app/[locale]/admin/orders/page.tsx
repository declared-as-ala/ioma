"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable, type ColumnDef } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag } from "lucide-react";

interface OrderRow {
  _id: string;
  orderNumber: string;
  type: "b2c" | "b2b";
  status:
    "pending_payment" | "paid" | "processing" | "shipped" | "delivered" | "cancelled";
  totalAmountMinor: number;
  currency: string;
  items: { productName: string; quantity: number }[];
  createdAt: string;
}

export default function AdminOrdersPage() {
  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery<OrderRow[]>({
    queryKey: ["admin", "orders"],
    queryFn: () => apiFetch("/orders"),
  });

  const columns = useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        key: "orderNumber",
        header: "Order Reference",
        sortable: true,
        cell: (row) => (
          <div>
            <p className="font-mono font-medium text-ioma-black">{row.orderNumber}</p>
            <p className="text-xs text-ioma-grey-500 font-sans">
              {new Date(row.createdAt).toLocaleDateString("en-AE", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        cell: (row) => (
          <Badge
            variant={row.type === "b2b" ? "default" : "outline"}
            className="uppercase text-xs"
          >
            {row.type}
          </Badge>
        ),
      },
      {
        key: "items",
        header: "Line Items",
        cell: (row) => (
          <div className="text-xs text-ioma-grey-600">
            {row.items.map((i, idx) => (
              <div key={idx}>
                {i.productName} × {i.quantity}
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "total",
        header: "Total",
        sortable: true,
        cell: (row) => (
          <div className="font-medium text-ioma-black">
            {(row.totalAmountMinor / 100).toFixed(2)} {row.currency || "AED"}
          </div>
        ),
      },
      {
        key: "status",
        header: "Fulfillment Status",
        sortable: true,
        cell: (row) => {
          const variants: Record<
            string,
            "default" | "secondary" | "outline" | "destructive"
          > = {
            paid: "default",
            shipped: "secondary",
            delivered: "outline",
            cancelled: "destructive",
          };
          return (
            <Badge
              variant={variants[row.status] || "outline"}
              className="capitalize text-xs"
            >
              {row.status.replace("_", " ")}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-light tracking-tight text-ioma-black md:text-4xl flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-ioma-black" />
          Orders & Fulfillment Operations
        </h1>
        <p className="mt-2 text-ioma-grey-500">
          Track customer retail purchases, B2B wholesale orders, payment verification, and
          delivery status.
        </p>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        keyField="_id"
        isLoading={isLoading}
        error={error ? "Failed to load orders" : null}
        searchPlaceholder="Search order number..."
        searchField={(row) => row.orderNumber}
        filterField={(row) => row.status}
        filterOptions={[
          { label: "Paid", value: "paid" },
          { label: "Processing", value: "processing" },
          { label: "Shipped", value: "shipped" },
          { label: "Delivered", value: "delivered" },
          { label: "Cancelled", value: "cancelled" },
        ]}
      />
    </div>
  );
}
