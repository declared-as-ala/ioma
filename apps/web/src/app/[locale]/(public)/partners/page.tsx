"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePartnersQuery } from "@/hooks/use-partners";
import { PartnerLocatorMap } from "@/components/partners/partner-locator-map";
import { PartnerCard } from "@/components/partners/partner-card";
import type { PartnerListItem } from "@ioma/types";
import { EMIRATES } from "@ioma/config";

export default function PartnersPage() {
  const t = useTranslations("Partners");
  const [selectedEmirate, setSelectedEmirate] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [diagnosisOnly, setDiagnosisOnly] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerListItem | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  const filters = useMemo(
    () => ({
      emirate: selectedEmirate || undefined,
      type: selectedType || undefined,
      diagnosisAvailable: diagnosisOnly || undefined,
      ...(userLocation
        ? { lat: userLocation.lat, lng: userLocation.lng, radius: 50000 }
        : {}),
    }),
    [selectedEmirate, selectedType, diagnosisOnly, userLocation],
  );

  const { data: partners = [], isLoading } = usePartnersQuery(filters);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
      );
    }
  };

  const partnerTypes = [
    { value: "", label: t("filterTypes.all") },
    { value: "spa", label: t("filterTypes.spa") },
    { value: "clinic", label: t("filterTypes.clinic") },
    { value: "beauty_institute", label: t("filterTypes.institute") },
    { value: "hotel", label: t("filterTypes.hotel") },
    { value: "retail", label: t("filterTypes.retail") },
  ];

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
          {t("kicker")}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">{t("subtitle")}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={selectedEmirate}
          onChange={(e) => setSelectedEmirate(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label={t("filterEmirate")}
        >
          <option value="">{t("filterAllEmirates")}</option>
          {EMIRATES.map((em) => (
            <option key={em.code} value={em.code}>
              {em.name.en}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          aria-label={t("filterType")}
        >
          {partnerTypes.map((pt) => (
            <option key={pt.value} value={pt.value}>
              {pt.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={diagnosisOnly}
            onChange={(e) => setDiagnosisOnly(e.target.checked)}
            className="rounded"
          />
          {t("diagnosisOnly")}
        </label>

        <button
          type="button"
          onClick={handleUseMyLocation}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent"
        >
          {t("useMyLocation")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Map */}
        <div className="h-[400px] lg:h-[600px] rounded-lg overflow-hidden border">
          <PartnerLocatorMap
            partners={partners}
            selectedPartner={selectedPartner}
            onSelectPartner={setSelectedPartner}
            userLocation={userLocation}
          />
        </div>

        {/* Partner list */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
            ))
          ) : partners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("noPartners")}
            </div>
          ) : (
            partners.map((partner) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                isSelected={selectedPartner?.id === partner.id}
                onSelect={setSelectedPartner}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
