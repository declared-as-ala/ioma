"use client";

import Link from "next/link";
import type { PartnerListItem } from "@ioma/types";

interface PartnerCardProps {
  partner: PartnerListItem;
  isSelected: boolean;
  onSelect: (partner: PartnerListItem) => void;
}

export function PartnerCard({ partner, isSelected, onSelect }: PartnerCardProps) {
  const typeLabels: Record<string, string> = {
    spa: "Spa",
    clinic: "Clinic",
    beauty_institute: "Beauty Institute",
    hotel: "Hotel",
    retail: "Retail",
    diagnostic_center: "Diagnostic Center",
    distributor: "Distributor",
  };

  const formatDistance = (meters: number | null) => {
    if (meters === null) return null;
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/30"
      }`}
      onClick={() => onSelect(partner)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(partner);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${partner.name} — ${partner.city}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{partner.name}</p>
          <p className="text-xs text-muted-foreground">
            {typeLabels[partner.type] ?? partner.type} — {partner.city}
          </p>
          {partner.diagnosisAvailable && (
            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              Diagnosis
            </span>
          )}
          {partner.services.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {partner.services.map((s) => s.name.en).join(", ")}
            </p>
          )}
        </div>
        {partner.distanceMeters !== null && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistance(partner.distanceMeters)}
          </span>
        )}
      </div>
      <Link
        href={`/partners/${partner.slug}`}
        className="inline-block mt-2 text-xs text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        View details
      </Link>
    </div>
  );
}
