"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable, type ColumnDef } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Sparkles } from "lucide-react";
import type { PartnerListItem } from "@ioma/types";

export default function AdminPartnersPage() {
  const {
    data: partners = [],
    isLoading,
    error,
  } = useQuery<PartnerListItem[]>({
    queryKey: ["admin", "partners"],
    queryFn: () => apiFetch("/partners"),
  });

  const columns = useMemo<ColumnDef<PartnerListItem>[]>(
    () => [
      {
        key: "name",
        header: "Clinic / Flagship Name",
        sortable: true,
        cell: (row) => (
          <div>
            <p className="font-medium text-ioma-black">{row.name}</p>
            <p className="text-xs text-ioma-grey-500">{row.address}</p>
          </div>
        ),
      },
      {
        key: "emirate",
        header: "Emirate / City",
        sortable: true,
        cell: (row) => (
          <div className="text-xs font-medium text-ioma-grey-700">
            {row.emirate} ({row.city})
          </div>
        ),
      },
      {
        key: "type",
        header: "Partner Type",
        sortable: true,
        cell: (row) => (
          <Badge variant="outline" className="capitalize text-xs">
            {row.type}
          </Badge>
        ),
      },
      {
        key: "diagnosisAvailable",
        header: "Skin Diagnosis",
        cell: (row) => (
          <Badge
            variant={row.diagnosisAvailable ? "default" : "secondary"}
            className="text-xs"
          >
            <Sparkles className="mr-1 h-3 w-3 text-ioma-gold" />
            {row.diagnosisAvailable ? "IOMA Sphere Equipped" : "Standard"}
          </Badge>
        ),
      },
      {
        key: "services",
        header: "Services Offered",
        cell: (row) => (
          <span className="text-xs text-ioma-grey-600 font-medium">
            {row.services?.length || 0} treatments available
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
          <MapPin className="h-8 w-8 text-ioma-black" />
          Partner Clinics & Flagship Directory
        </h1>
        <p className="mt-2 text-ioma-grey-500">
          Manage certified clinic locations, IOMA Sphere diagnostic equipment, and
          available treatment offerings across the UAE.
        </p>
      </div>

      <DataTable
        data={partners}
        columns={columns}
        keyField="id"
        isLoading={isLoading}
        error={error ? "Failed to load partners directory" : null}
        searchPlaceholder="Search clinic name, emirate, or city..."
        searchField={(row) => `${row.name} ${row.emirate} ${row.city}`}
        filterField={(row) => row.emirate}
        filterOptions={[
          { label: "Dubai", value: "Dubai" },
          { label: "Abu Dhabi", value: "Abu Dhabi" },
          { label: "Sharjah", value: "Sharjah" },
        ]}
      />
    </div>
  );
}
