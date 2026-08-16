"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { usePartnerQuery } from "@/hooks/use-partners";
import Link from "next/link";

export default function PartnerDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = use(params);
  const t = useTranslations("PartnerDetail");
  const { data: partner, isLoading } = usePartnerQuery(slug);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
        <div className="h-8 w-48 bg-muted animate-pulse mb-4" />
        <div className="h-12 w-96 bg-muted animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!partner) {
    return (
      <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-24 text-center">
        <h1 className="font-display text-3xl">{t("notFound")}</h1>
        <Link href="/partners" className="mt-4 inline-block text-sm underline">
          {t("backToPartners")}
        </Link>
      </main>
    );
  }

  const typeLabels: Record<string, string> = {
    spa: t("types.spa"),
    clinic: t("types.clinic"),
    beauty_institute: t("types.institute"),
    hotel: t("types.hotel"),
    retail: t("types.retail"),
    diagnostic_center: t("types.diagnostic"),
    distributor: t("types.distributor"),
  };

  return (
    <main className="mx-auto max-w-[1440px] px-4 md:px-6 py-24">
      <div className="mb-8">
        <Link
          href="/partners"
          className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("backToPartners")}
        </Link>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-4 mb-3">
          {typeLabels[partner.type] ?? partner.type}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight">
          {partner.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {partner.city}, {partner.emirate}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12">
        {/* Info */}
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-xl mb-3">{t("about")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {partner.description.en}
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl mb-3">{t("contact")}</h2>
            <div className="space-y-2 text-sm">
              <p>
                {t("address")}: {partner.address}
              </p>
              <p>
                {t("phone")}: {partner.phone}
              </p>
              {partner.whatsapp && <p>WhatsApp: {partner.whatsapp}</p>}
              {partner.email && <p>Email: {partner.email}</p>}
            </div>
          </div>

          {partner.diagnosisAvailable && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="font-display text-sm">{t("diagnosisAvailable")}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("diagnosisDescription")}
              </p>
            </div>
          )}
        </div>

        {/* Services & Booking */}
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-xl mb-4">{t("services")}</h2>
            {partner.services.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t("noServices")}</p>
            ) : (
              <div className="space-y-3">
                {partner.services.map((svc) => (
                  <div
                    key={svc.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">{svc.name.en}</p>
                      <p className="text-xs text-muted-foreground">
                        {svc.durationMinutes} min
                      </p>
                    </div>
                    <Link
                      href={`/booking?partner=${partner.slug}&service=${svc.slug}`}
                      className="text-xs uppercase tracking-widest text-primary hover:underline"
                    >
                      {t("book")}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href={`/booking?partner=${partner.slug}`}
            className="block w-full text-center py-3 rounded-md bg-primary text-primary-foreground text-sm uppercase tracking-widest hover:bg-primary/90 transition-colors"
          >
            {t("bookAppointment")}
          </Link>
        </div>
      </div>
    </main>
  );
}
