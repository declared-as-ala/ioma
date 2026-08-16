"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable, type ColumnDef } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Package } from "lucide-react";

interface AdminProductRow {
  slug: string;
  name: { en: string; fr: string; ar: string };
  range: { slug: string; name: { en: string } };
  shortBenefit: { en: string };
  priceFromMinor: number | null;
  variants: {
    sku: string;
    size: string;
    b2cPriceMinor: number;
    b2bPriceMinor: number | null;
    moq: number;
    inStock: boolean;
  }[];
}

export default function AdminProductsPage() {
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery<AdminProductRow[]>({
    queryKey: ["admin", "products"],
    queryFn: () => apiFetch("/pro/catalog"),
  });

  const columns = useMemo<ColumnDef<AdminProductRow>[]>(
    () => [
      {
        key: "name",
        header: "Product Name",
        sortable: true,
        cell: (row) => (
          <div>
            <p className="font-medium text-ioma-black">{row.name.en}</p>
            <p className="text-xs text-ioma-grey-500">{row.shortBenefit.en}</p>
          </div>
        ),
      },
      {
        key: "range",
        header: "Range",
        sortable: true,
        cell: (row) => (
          <Badge variant="outline" className="capitalize text-xs">
            <Sparkles className="mr-1 h-3 w-3 text-ioma-gold" />
            {row.range.name.en}
          </Badge>
        ),
      },
      {
        key: "sku",
        header: "SKU / Size",
        cell: (row) => (
          <div className="text-xs space-y-1">
            {row.variants.map((v) => (
              <div key={v.sku} className="font-mono text-ioma-grey-600">
                {v.sku} ({v.size})
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "b2cPrice",
        header: "B2C Price (AED)",
        cell: (row) => (
          <div className="text-xs">
            {row.variants.map((v) => (
              <div key={v.sku}>{(v.b2cPriceMinor / 100).toFixed(2)}</div>
            ))}
          </div>
        ),
      },
      {
        key: "b2bPrice",
        header: "B2B Wholesale (AED)",
        cell: (row) => (
          <div className="text-xs font-semibold text-ioma-gold">
            {row.variants.map((v) => (
              <div key={v.sku}>
                {v.b2bPriceMinor
                  ? `${(v.b2bPriceMinor / 100).toFixed(2)} (MOQ ${v.moq})`
                  : "N/A"}
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "status",
        header: "Stock Status",
        cell: (row) => {
          const anyInStock = row.variants.some((v) => v.inStock);
          return (
            <Badge variant={anyInStock ? "default" : "destructive"} className="text-xs">
              {anyInStock ? "In Stock" : "Out of Stock"}
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
          <Package className="h-8 w-8 text-ioma-black" />
          Catalog & Products Management
        </h1>
        <p className="mt-2 text-ioma-grey-500">
          Manage formulations, SKUs, inventory status, B2C retail prices, and B2B
          wholesale prices.
        </p>
      </div>

      <DataTable
        data={products}
        columns={columns}
        keyField="slug"
        isLoading={isLoading}
        error={error ? "Failed to load product catalog" : null}
        searchPlaceholder="Search product name or SKU..."
        searchField={(row) =>
          `${row.name.en} ${row.variants.map((v) => v.sku).join(" ")}`
        }
      />
    </div>
  );
}
