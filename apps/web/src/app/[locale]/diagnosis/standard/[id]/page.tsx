"use client";

import { use } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { Link } from "@/i18n/navigation";
import { useStandardDiagnosisQuery } from "@/hooks/use-diagnosis";
import { useAddRoutineToCart } from "@/hooks/use-add-routine-to-cart";
import { Button } from "@/components/ui/button";
import { RoutineList, dedupeVariantsBySku } from "@/components/diagnosis/routine-list";

export default function StandardDiagnosisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("Diagnosis.result");
  const locale = useLocale() as Locale;
  const { data: result, isLoading, isError } = useStandardDiagnosisQuery(id);
  const addRoutine = useAddRoutineToCart();

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 md:px-6 py-24" aria-busy="true">
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
        <div className="mt-10 h-64 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  if (isError || !result) {
    return (
      <main className="mx-auto max-w-3xl px-4 md:px-6 py-24">
        <p role="alert" className="text-sm text-destructive">
          {t("loadError")}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/diagnosis/standard">{t("startOver")}</Link>
        </Button>
      </main>
    );
  }

  const allVariants = dedupeVariantsBySku([
    ...result.morningRoutine,
    ...result.eveningRoutine,
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 md:px-6 py-24">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        {t("kicker")}
      </p>
      <h1 className="mt-3 font-display text-4xl">{t("title")}</h1>

      <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-border py-8 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("skinType")}
          </dt>
          <dd className="mt-2 text-sm capitalize">{result.resultProfile.skinType}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("hydrationScore")}
          </dt>
          <dd className="mt-2 text-sm">{result.resultProfile.hydrationScore} / 100</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("recommendedRange")}
          </dt>
          <dd className="mt-2 text-sm">{result.range.name[locale]}</dd>
        </div>
      </dl>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <RoutineList
          title={t("morningRoutine")}
          variants={result.morningRoutine}
          emptyMessage={t("noMorningProducts")}
          locale={locale}
        />
        <RoutineList
          title={t("eveningRoutine")}
          variants={result.eveningRoutine}
          emptyMessage={t("noEveningProducts")}
          locale={locale}
        />
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <Button
          size="lg"
          className="uppercase tracking-widest"
          disabled={addRoutine.isPending || allVariants.length === 0}
          onClick={() => addRoutine.mutate(allVariants)}
          data-testid="add-routine-to-cart"
        >
          {addRoutine.isPending ? t("addingToCart") : t("addToCart")}
        </Button>
        {addRoutine.isSuccess ? (
          <span role="status" className="text-sm text-muted-foreground">
            {t("addedToCart")}{" "}
            <Link href="/cart" className="underline">
              {t("viewCart")}
            </Link>
          </span>
        ) : null}
        {addRoutine.isError ? (
          <span role="alert" className="text-sm text-destructive">
            {t("addToCartError")}
          </span>
        ) : null}
      </div>

      <Button asChild variant="outline" className="mt-8">
        <Link href="/diagnosis/standard">{t("startOver")}</Link>
      </Button>
    </main>
  );
}
