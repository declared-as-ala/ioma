"use client";

import { use, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale, RoutineTier } from "@ioma/config";
import { AI_INDICATOR_KEYS } from "@ioma/config";
import type { RecommendedProduct } from "@ioma/types";
import { Link, useRouter } from "@/i18n/navigation";
import {
  useAiAnalysisQuery,
  useAskAdvisor,
  useDeleteAiAnalysis,
  useSelectRoutineTier,
  useSubmitFollowUp,
} from "@/hooks/use-ai-analysis";
import { useAddRoutineToCart } from "@/hooks/use-add-routine-to-cart";
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
import { RoutineTierCard } from "@/components/diagnosis/routine-tier-card";
import { AiChatConsultant } from "@/components/diagnosis/ai-chat-consultant";
import { Calendar, Trash2, Share2 } from "lucide-react";

export default function AiDiagnosisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("Diagnosis.resultPage");
  const tAi = useTranslations("Diagnosis.ai.result");
  const tIndicators = useTranslations("Diagnosis.ai.indicatorLabels");
  const locale = useLocale() as Locale;
  const router = useRouter();

  const { data: result, isLoading } = useAiAnalysisQuery(id);
  const selectTier = useSelectRoutineTier(id);
  const addRoutine = useAddRoutineToCart();
  const deleteAnalysis = useDeleteAiAnalysis();
  const askAdvisor = useAskAdvisor(id);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (isLoading || !result) {
    return (
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-24" aria-busy="true">
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
        <div className="mt-10 h-96 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  if (result.status === "failed") {
    return (
      <main className="mx-auto max-w-2xl px-4 md:px-6 py-24 text-center">
        <h1 className="font-display text-3xl text-destructive">{tAi("failedTitle")}</h1>
        <p role="alert" className="mt-4 text-sm text-muted-foreground">
          {tAi("failedBody")}
        </p>
        <Button asChild size="lg" className="mt-8 uppercase tracking-widest">
          <Link href="/diagnosis">{tAi("tryAgain")}</Link>
        </Button>
      </main>
    );
  }

  const activeTier = result.activeTier || "complete";
  const routines = result.routines;

  const handleSelectTier = (tier: RoutineTier) => {
    selectTier.mutate(tier);
  };

  const handleAddToCart = (products: RecommendedProduct[]) => {
    const variants = products.map((p) => ({
      sku: p.sku,
      size: p.size,
      priceMinor: p.priceMinor,
      name: p.name,
      image: p.image,
    }));
    addRoutine.mutate(variants);
  };

  const handleSendMessage = (message: string) => {
    askAdvisor.mutate({ message, locale });
  };

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 md:px-6 py-16 md:py-24 space-y-20">
      {/* 01: YOUR SKIN TODAY */}
      <section aria-labelledby="section-skin-today" className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t("section01Kicker")}
            </p>
            <h1
              id="section-skin-today"
              className="mt-2 font-display text-3xl md:text-5xl"
            >
              {t("section01Title")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleShare} className="text-xs">
              <Share2 className="me-2 size-3.5" />
              {copiedLink ? t("copiedLink") : t("shareConsultation")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              className="text-xs text-destructive hover:text-destructive"
              data-testid="delete-ai-analysis"
            >
              <Trash2 className="me-2 size-3.5" />
              {tAi("delete")}
            </Button>
          </div>
        </div>

        {/* Disclaimer & Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {result.imageUrl && (
            <div className="md:col-span-4">
              <div className="relative aspect-3/4 rounded-md overflow-hidden border border-border shadow-sm">
                <img
                  src={result.imageUrl}
                  alt="Skin diagnosis portrait"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 text-[0.65rem] text-center text-muted-foreground uppercase tracking-widest">
                {t("privateImageNotice")}
              </p>
            </div>
          )}

          <div
            className={`${result.imageUrl ? "md:col-span-8" : "md:col-span-12"} space-y-6`}
          >
            <div className="p-4 rounded border border-border/80 bg-accent/40 text-xs text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground uppercase tracking-widest text-[0.65rem] mb-1">
                {t("cosmeticDisclaimerTitle")}
              </p>
              {t("cosmeticDisclaimerBody")}
            </div>

            {/* Visual Indicators Bars */}
            {result.indicators && (
              <div className="space-y-4">
                <h3 className="font-display text-sm uppercase tracking-widest">
                  {t("indicatorsTitle")}
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {AI_INDICATOR_KEYS.map((key) => (
                    <div key={key} className="text-xs">
                      <div className="flex justify-between py-1">
                        <dt className="text-muted-foreground">{tIndicators(key)}</dt>
                        <dd className="font-medium">{result.indicators![key]} / 100</dd>
                      </div>
                      <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground"
                          style={{ width: `${result.indicators![key]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 02 & 03: YOUR SKIN PROFILE & PRIORITIES */}
      {result.skinProfile && (
        <section
          aria-labelledby="section-skin-profile"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          <div className="lg:col-span-5 border border-border p-6 md:p-8 bg-card rounded-md space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t("section02Kicker")}
            </p>
            <h2 id="section-skin-profile" className="font-display text-2xl">
              {t("section02Title")}
            </h2>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">{t("profileSkinType")}:</span>
                <span className="font-medium capitalize">
                  {result.skinProfile.skinType}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">{t("profileHydration")}:</span>
                <span className="font-medium">
                  {result.skinProfile.hydrationTendency}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">{t("profileSensitivity")}:</span>
                <span className="font-medium capitalize">
                  {result.skinProfile.sensitivityLevel}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-muted-foreground">{t("profileAcExposure")}:</span>
                <span className="font-medium capitalize">
                  {result.skinProfile.climateContext.acExposure}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 border border-border p-6 md:p-8 bg-card rounded-md space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t("section03Kicker")}
            </p>
            <h2 className="font-display text-2xl">{t("section03Title")}</h2>

            <div className="space-y-3 pt-2">
              {result.skinProfile.priorities.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 border border-border/80 bg-accent/20 rounded-md text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-display text-sm font-medium text-foreground">
                      0{p.rank} —
                    </span>
                    <span className="font-medium text-foreground">{p.title[locale]}</span>
                  </div>
                  <p className="mt-1 text-muted-foreground leading-relaxed ps-7">
                    {p.rationale[locale]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 04: WHAT YOUR SKIN IS TELLING US */}
      {result.diagnosticNarrative && (
        <section
          aria-labelledby="section-skin-narrative"
          className="border border-border p-6 md:p-10 bg-accent/30 rounded-md"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {t("section04Kicker")}
          </p>
          <h2
            id="section-skin-narrative"
            className="mt-2 font-display text-2xl md:text-3xl"
          >
            {t("section04Title")}
          </h2>
          <p className="mt-4 text-sm md:text-base text-foreground/90 leading-relaxed max-w-3xl">
            {result.diagnosticNarrative[locale]}
          </p>
        </section>
      )}

      {/* 05, 06, 07: YOUR IOMA RITUAL (3 TIERS) */}
      {routines && (
        <section aria-labelledby="section-ioma-ritual" className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t("section05Kicker")}
            </p>
            <h2
              id="section-ioma-ritual"
              className="mt-2 font-display text-3xl md:text-4xl"
            >
              {t("section05Title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("section05Subtitle")}</p>
          </div>

          <RoutineTierCard
            tiers={routines}
            activeTier={activeTier}
            onSelectTier={handleSelectTier}
            onAddToCart={handleAddToCart}
            isAddingToCart={addRoutine.isPending}
          />
        </section>
      )}

      {/* 08: ASK YOUR IOMA SKIN EXPERT */}
      <section aria-labelledby="section-ai-chat" className="space-y-6">
        <AiChatConsultant
          chatHistory={result.chatHistory || []}
          suggestedQuestions={result.suggestedQuestions || []}
          onSendMessage={handleSendMessage}
          isSending={askAdvisor.isPending}
        />
      </section>

      {/* 09 & 10: SKIN JOURNEY & FOLLOW-UP */}
      <section className="border border-border p-6 md:p-10 bg-card rounded-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {t("journeyKicker")}
          </p>
          <h3 className="font-display text-2xl">{t("journeyTitle")}</h3>
          <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
            {t("journeySubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="uppercase tracking-widest text-xs"
          >
            <Link href="/diagnosis/history">{t("viewHistory")}</Link>
          </Button>
          <Button asChild size="sm" className="uppercase tracking-widest text-xs">
            <Link href="/booking">
              <Calendar className="me-2 size-3.5" />
              {t("bookInstituteAnalysis")}
            </Link>
          </Button>
        </div>
      </section>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tAi("deleteConfirmTitle")}</DialogTitle>
            <DialogDescription>{tAi("deleteConfirmBody")}</DialogDescription>
          </DialogHeader>
          {deleteAnalysis.isError && (
            <p role="alert" className="text-sm text-destructive">
              {tAi("deleteError")}
            </p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{tAi("cancel")}</Button>
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
              {tAi("deleteConfirmCta")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
