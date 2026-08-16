"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { Link } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useStandardDiagnosisHistoryQuery } from "@/hooks/use-diagnosis";
import { useAiAnalysisHistoryQuery } from "@/hooks/use-ai-analysis";
import { Button } from "@/components/ui/button";

export default function DiagnosisHistoryPage() {
  const t = useTranslations("Diagnosis.history");
  const locale = useLocale() as Locale;
  const hydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);

  const standardHistory = useStandardDiagnosisHistoryQuery(hydrated && Boolean(user));
  const aiHistory = useAiAnalysisHistoryQuery(hydrated && Boolean(user));

  if (!hydrated || standardHistory.isLoading || aiHistory.isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 md:px-6 py-24" aria-busy="true">
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
        <div className="mt-10 h-40 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 md:px-6 py-24">
        <p className="max-w-sm text-sm text-muted-foreground">{t("signInPrompt")}</p>
        <Button asChild size="lg" className="mt-6 uppercase tracking-widest">
          <Link href="/login">{t("signInCta")}</Link>
        </Button>
      </main>
    );
  }

  const entries = [
    ...(standardHistory.data ?? []).map((entry) => ({
      id: entry.id,
      kind: "standard" as const,
      range: entry.range.name[locale],
      createdAt: entry.createdAt,
      href: `/diagnosis/standard/${entry.id}`,
    })),
    ...(aiHistory.data ?? []).map((entry) => ({
      id: entry.id,
      kind: "ai" as const,
      range: entry.range?.name[locale] ?? null,
      createdAt: entry.createdAt,
      href: `/diagnosis/ai/${entry.id}`,
    })),
  ].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-24">
      <h1 className="font-display text-4xl">{t("title")}</h1>

      {entries.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {entries.map((entry) => (
            <li
              key={`${entry.kind}-${entry.id}`}
              className="flex items-center justify-between border border-border p-5"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {entry.kind === "standard" ? t("standardLabel") : t("aiLabel")}
                </p>
                <p className="mt-1 text-sm">{entry.range ?? "—"}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={entry.href}>{t("viewResult")}</Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
