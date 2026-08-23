"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import {
  useAiAnalysisHistoryQuery,
  useCompareAnalysesQuery,
} from "@/hooks/use-ai-analysis";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, TrendingUp } from "lucide-react";
import { BeforeAfterComparison } from "@/components/diagnosis/before-after-comparison";

export default function DiagnosisHistoryPage() {
  const t = useTranslations("Diagnosis.history");
  const locale = useLocale() as Locale;
  const hydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);

  const aiHistory = useAiAnalysisHistoryQuery(hydrated && Boolean(user));
  const entries = aiHistory.data ?? [];

  const [comparePrevId, setComparePrevId] = useState<string | null>(null);
  const [compareCurrId, setCompareCurrId] = useState<string | null>(null);

  const compareQuery = useCompareAnalysesQuery(
    comparePrevId || undefined,
    compareCurrId || undefined,
    Boolean(comparePrevId && compareCurrId),
  );

  if (!hydrated || aiHistory.isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-24" aria-busy="true">
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
        <div className="mt-10 h-40 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 md:px-6 py-24 text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {t("kicker")}
        </p>
        <h1 className="mt-2 font-display text-3xl">{t("title")}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{t("signInPrompt")}</p>
        <Button asChild size="lg" className="mt-6 uppercase tracking-widest text-xs px-8">
          <Link href="/login">{t("signInCta")}</Link>
        </Button>
      </main>
    );
  }

  const handleCompare = (prevId: string, currId: string) => {
    setComparePrevId(prevId);
    setCompareCurrId(currId);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 md:px-6 py-16 md:py-24 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {t("kicker")}
          </p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">{t("title")}</h1>
        </div>
        <Button asChild size="sm" className="uppercase tracking-widest text-xs px-6">
          <Link href="/diagnosis">
            <Sparkles className="me-2 size-3.5" />
            {t("newConsultationCta")}
          </Link>
        </Button>
      </div>

      {/* Before / After Comparison Result if triggered */}
      {compareQuery.data && (
        <section className="animate-in fade-in duration-300">
          <BeforeAfterComparison comparison={compareQuery.data} />
        </section>
      )}

      {/* Consultations List */}
      {entries.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center rounded-md space-y-4">
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
          <Button asChild size="lg" className="uppercase tracking-widest text-xs px-8">
            <Link href="/diagnosis">{t("startFirstConsultation")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.length >= 2 && !compareQuery.data && (
            <div className="p-4 bg-accent/30 border border-border rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-foreground font-medium">
                <TrendingUp className="size-4" />
                <span>{t("comparisonAvailableNotice")}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs uppercase tracking-widest"
                onClick={() =>
                  handleCompare(entries[entries.length - 1]!.id, entries[0]!.id)
                }
              >
                {t("compareProgressButton")}
              </Button>
            </div>
          )}

          <ul className="flex flex-col gap-3">
            {entries.map((entry, idx) => (
              <li
                key={entry.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border p-6 bg-card rounded-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleDateString(locale)
                        : "—"}
                    </span>
                    <span className="capitalize px-2 py-0.5 rounded bg-accent text-[0.65rem] font-medium text-foreground">
                      {entry.activeTier || "Complete"}
                    </span>
                  </div>
                  <p className="font-display text-lg text-foreground">
                    {entry.range?.name[locale] || t("personalizedRitual")}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {entry.skinType || "Combination"} Skin
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {idx > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleCompare(entry.id, entries[0]!.id)}
                    >
                      {t("compareToLatest")}
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-xs uppercase tracking-widest"
                  >
                    <Link href={`/diagnosis/ai/${entry.id}`}>
                      {t("viewConsultation")}
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
