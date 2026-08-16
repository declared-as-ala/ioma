"use client";

import { use, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import { AI_INDICATOR_KEYS } from "@ioma/config";
import { Link, useRouter } from "@/i18n/navigation";
import { useAiAnalysisQuery, useDeleteAiAnalysis } from "@/hooks/use-ai-analysis";
import { useAddRoutineToCart } from "@/hooks/use-add-routine-to-cart";
import { RoutineList, dedupeVariantsBySku } from "@/components/diagnosis/routine-list";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AiDiagnosisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // All translation namespaces are loaded unconditionally, up front — this
  // component has several early-return branches (loading/processing/
  // failed/completed), and calling useTranslations() conditionally inside
  // those branches would violate the Rules of Hooks (a real bug: polling
  // moves this component from the "processing" branch to "completed" on
  // the same mounted instance, which would change the hook call count
  // between renders).
  const t = useTranslations("Diagnosis.ai.result");
  const tProcessing = useTranslations("Diagnosis.ai.processing");
  const tIndicators = useTranslations("Diagnosis.ai.indicatorLabels");
  const tRoutine = useTranslations("Diagnosis.result");
  const locale = useLocale() as Locale;
  const router = useRouter();

  const { data: result, isLoading } = useAiAnalysisQuery(id);
  const addRoutine = useAddRoutineToCart();
  const deleteAnalysis = useDeleteAiAnalysis();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading || !result) {
    return (
      <main className="mx-auto max-w-3xl px-4 md:px-6 py-24" aria-busy="true">
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
        <div className="mt-10 h-64 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  if (result.status === "queued" || result.status === "processing") {
    return (
      <main className="mx-auto max-w-2xl px-4 md:px-6 py-24" aria-busy="true">
        <h1 className="font-display text-3xl">{tProcessing("title")}</h1>
        <p
          role="status"
          className="mt-4 text-sm text-muted-foreground"
          data-testid="ai-processing-status"
        >
          {tProcessing("body")}
        </p>
        <div className="mt-10 h-2 w-full overflow-hidden rounded-full bg-ioma-grey-100">
          <div className="h-2 w-1/3 animate-pulse bg-foreground" />
        </div>
      </main>
    );
  }

  if (result.status === "failed") {
    return (
      <main className="mx-auto max-w-2xl px-4 md:px-6 py-24">
        <h1 className="font-display text-3xl text-destructive">{t("failedTitle")}</h1>
        <p role="alert" className="mt-4 text-sm text-muted-foreground">
          {t("failedBody")}
        </p>
        <Button asChild size="lg" className="mt-8 uppercase tracking-widest">
          <Link href="/diagnosis/ai">{t("tryAgain")}</Link>
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

      {result.isSimulated ? (
        <div
          role="status"
          className="mt-6 rounded-md border border-border bg-accent p-4 text-sm text-foreground/90"
          data-testid="ai-simulated-badge"
        >
          <p className="font-medium uppercase tracking-widest text-xs">
            {t("simulatedBadge")}
          </p>
          <p className="mt-2 text-muted-foreground">{t("disclaimer")}</p>
        </div>
      ) : null}

      {result.indicators ? (
        <div className="mt-10">
          <h2 className="font-display text-xl">{t("indicators")}</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {AI_INDICATOR_KEYS.map((key) => (
              <div key={key}>
                <div className="flex items-center justify-between text-sm">
                  <dt>{tIndicators(key)}</dt>
                  <dd className="text-muted-foreground">
                    {result.indicators![key]} / 100
                  </dd>
                </div>
                <div className="mt-1 h-1.5 w-full bg-ioma-grey-100">
                  <div
                    className="h-1.5 bg-foreground"
                    style={{ width: `${result.indicators![key]}%` }}
                  />
                </div>
              </div>
            ))}
          </dl>
        </div>
      ) : null}

      {result.range ? (
        <p className="mt-10 text-sm">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("recommendedRange")}:{" "}
          </span>
          {result.range.name[locale]}
        </p>
      ) : null}

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <RoutineList
          title={tRoutine("morningRoutine")}
          variants={result.morningRoutine}
          emptyMessage={tRoutine("noMorningProducts")}
          locale={locale}
        />
        <RoutineList
          title={tRoutine("eveningRoutine")}
          variants={result.eveningRoutine}
          emptyMessage={tRoutine("noEveningProducts")}
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
          {addRoutine.isPending ? tRoutine("addingToCart") : tRoutine("addToCart")}
        </Button>
        {addRoutine.isSuccess ? (
          <span role="status" className="text-sm text-muted-foreground">
            {tRoutine("addedToCart")}{" "}
            <Link href="/cart" className="underline">
              {tRoutine("viewCart")}
            </Link>
          </span>
        ) : null}
        {addRoutine.isError ? (
          <span role="alert" className="text-sm text-destructive">
            {tRoutine("addToCartError")}
          </span>
        ) : null}
      </div>

      <Button
        variant="outline"
        className="mt-10 text-destructive hover:text-destructive"
        onClick={() => setConfirmOpen(true)}
        data-testid="delete-ai-analysis"
      >
        {t("delete")}
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>{t("deleteConfirmBody")}</DialogDescription>
          </DialogHeader>
          {deleteAnalysis.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {t("deleteError")}
            </p>
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={deleteAnalysis.isPending}
              onClick={() =>
                deleteAnalysis.mutate(id, {
                  onSuccess: () => router.push("/diagnosis/history"),
                })
              }
            >
              {t("deleteConfirmCta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
