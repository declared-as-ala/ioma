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
import { AiExpertPresence } from "@/components/diagnosis/ai-expert-presence";
import { useVoiceAdvisor } from "@/hooks/use-voice-advisor";
import {
  Calendar,
  Trash2,
  Share2,
  Sparkles,
  Shield,
  Droplets,
  Sun,
  Flame,
  CheckCircle2,
  Eye,
  Layers,
  MapPin,
  HeartHandshake,
} from "lucide-react";

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

  const {
    speak,
    stopSpeaking,
    toggleMute,
    isSpeaking,
    isMuted,
  } = useVoiceAdvisor(locale);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (isLoading || !result) {
    return (
      <main className="mx-auto max-w-5xl px-4 md:px-6 py-24" aria-busy="true">
        <div className="h-8 w-56 animate-pulse bg-accent rounded" />
        <div className="mt-10 h-96 animate-pulse bg-accent/40 rounded-xl" />
      </main>
    );
  }

  if (result.status === "failed") {
    return (
      <main className="mx-auto max-w-2xl px-4 md:px-6 py-24 text-center space-y-6">
        <h1 className="font-display text-3xl text-destructive">{tAi("failedTitle")}</h1>
        <p role="alert" className="text-sm text-muted-foreground leading-relaxed">
          {tAi("failedBody")}
        </p>
        <Button asChild size="lg" className="uppercase tracking-widest px-8">
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
    <main className="mx-auto max-w-6xl px-4 md:px-8 py-12 md:py-20 space-y-24">
      {/* 01: YOUR SKIN TODAY */}
      <section aria-labelledby="section-skin-today" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t("section01Kicker")}
            </p>
            <h1
              id="section-skin-today"
              className="mt-2 font-display text-3xl md:text-5xl text-foreground"
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

        {/* Portrait & Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {result.imageUrl && (
            <div className="md:col-span-4">
              <div className="relative aspect-3/4 rounded-xl overflow-hidden border border-border shadow-md bg-card">
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

          <div className={`${result.imageUrl ? "md:col-span-8" : "md:col-span-12"} space-y-6`}>
            <div className="p-5 rounded-xl border border-border/80 bg-accent/30 text-xs text-muted-foreground leading-relaxed space-y-1.5">
              <p className="font-semibold text-foreground uppercase tracking-widest text-[0.7rem]">
                {t("cosmeticDisclaimerTitle")}
              </p>
              <p>{t("cosmeticDisclaimerBody")}</p>
            </div>

            {/* Visual Indicators Bars */}
            {result.indicators && (
              <div className="border border-border/80 bg-card rounded-xl p-6 shadow-sm space-y-5">
                <h3 className="font-display text-sm uppercase tracking-widest text-foreground font-medium">
                  {t("indicatorsTitle")}
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {AI_INDICATOR_KEYS.map((key) => (
                    <div key={key} className="text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">{tIndicators(key)}</dt>
                        <dd className="font-semibold text-foreground">
                          {result.indicators![key]} / 100
                        </dd>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground transition-all duration-500"
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

      {/* 02: WHAT I OBSERVED (DEEP COSMETIC OBSERVATIONS) */}
      {result.observations && (
        <section aria-labelledby="section-observations" className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t("section02Kicker")}
            </p>
            <h2 id="section-observations" className="mt-1 font-display text-2xl md:text-3xl text-foreground">
              {t("section02Title")}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground">
              {t("section02Subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(result.observations).map(([obsKey, obs]) => {
              if (!obs || typeof obs !== "object") return null;
              return (
                <div
                  key={obsKey}
                  className="p-5 rounded-xl border border-border/80 bg-card hover:bg-accent/20 transition-all space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-foreground capitalize">
                      {obsKey.replace("Appearance", "").replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="text-[0.65rem] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-accent border border-border/60 text-foreground">
                      {obs.level}
                    </span>
                  </div>

                  <div className="text-[0.7rem] text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="size-3 text-ioma-violet shrink-0" />
                    <span>{obs.visibleArea}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {obs.explanation}
                  </p>

                  {obs.uncertaintyNote && (
                    <p className="text-[0.65rem] text-muted-foreground/80 italic pt-1 border-t border-border/40">
                      {obs.uncertaintyNote}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 03 & 04: YOUR SKIN PROFILE & RANKED PRIORITIES */}
      {result.skinProfile && (
        <section aria-labelledby="section-skin-profile" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-5 border border-border/80 p-6 md:p-8 bg-card rounded-xl shadow-sm space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {t("section03Kicker")}
              </p>
              <h2 id="section-skin-profile" className="font-display text-2xl text-foreground">
                {t("section03Title")}
              </h2>
            </div>

            <div className="space-y-3 text-xs divide-y divide-border/60">
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">{t("profileSkinType")}:</span>
                <span className="font-medium capitalize text-foreground">
                  {result.skinProfile.skinType}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">{t("profileHydration")}:</span>
                <span className="font-medium text-foreground">
                  {result.skinProfile.hydrationTendency}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">{t("profileSensitivity")}:</span>
                <span className="font-medium capitalize text-foreground">
                  {result.skinProfile.sensitivityLevel}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">{t("profileAcExposure")}:</span>
                <span className="font-medium capitalize text-foreground">
                  {result.skinProfile.climateContext.acExposure} (Dubai Indoor AC)
                </span>
              </div>
            </div>

            {/* Preserved Routine Products Badge */}
            {result.skinProfile.currentRoutine?.preservedProducts &&
              result.skinProfile.currentRoutine.preservedProducts.length > 0 && (
                <div className="p-4 bg-accent/40 rounded-lg border border-border/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="size-4 text-foreground" />
                    <p className="text-[0.7rem] uppercase tracking-wider font-semibold text-foreground">
                      {t("preservedProductsTitle")}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t("preservedProductsNote")}
                  </p>
                  <ul className="text-xs font-medium space-y-1 ps-5 list-disc text-foreground">
                    {result.skinProfile.currentRoutine.preservedProducts.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Ranked Priorities */}
          <div className="lg:col-span-7 border border-border/80 p-6 md:p-8 bg-card rounded-xl shadow-sm space-y-5">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {t("section04Kicker")}
              </p>
              <h2 className="font-display text-2xl text-foreground">{t("section04Title")}</h2>
            </div>

            <div className="space-y-3 pt-1">
              {result.skinProfile.priorities.map((p) => (
                <div
                  key={p.id}
                  className="p-4 border border-border/80 bg-accent/20 hover:bg-accent/40 transition-all rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-display text-sm font-semibold text-foreground">
                      0{p.rank} —
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {p.title[locale]}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed ps-7">
                    {p.rationale[locale]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 05: WHAT YOUR SKIN NEEDS (AI EXPERT NARRATIVE + VOICE) */}
      <section aria-labelledby="section-expert-narrative" className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {t("section05Kicker")}
          </p>
          <h2 id="section-expert-narrative" className="font-display text-2xl md:text-3xl text-foreground">
            {t("section05Title")}
          </h2>
        </div>

        <AiExpertPresence
          isSpeaking={isSpeaking}
          isMuted={isMuted}
          onToggleMute={() => {
            if (isMuted) {
              toggleMute();
              if (result.diagnosticNarrative?.[locale]) {
                speak(result.diagnosticNarrative[locale]);
              }
            } else {
              toggleMute();
            }
          }}
          spokenText={
            result.diagnosticNarrative?.[locale] ||
            result.skinProfile?.expertConsultationSummary?.[locale]
          }
        />
      </section>

      {/* 06, 07, 08: YOUR IOMA RITUAL (ESSENTIAL, COMPLETE, PREMIUM) */}
      {routines && (
        <section aria-labelledby="section-ioma-ritual" className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t("section06Kicker")}
            </p>
            <h2 id="section-ioma-ritual" className="mt-1 font-display text-3xl md:text-4xl text-foreground">
              {t("section06Title")}
            </h2>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground">
              {t("section06Subtitle")}
            </p>
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

      {/* 09: ASK YOUR IOMA SKIN EXPERT (GROUNDED CONVERSATION) */}
      <section aria-labelledby="section-ai-chat" className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {t("section09Kicker")}
          </p>
          <h2 id="section-ai-chat" className="font-display text-2xl md:text-3xl text-foreground">
            {t("section09Title")}
          </h2>
        </div>

        <AiChatConsultant
          chatHistory={result.chatHistory || []}
          suggestedQuestions={result.suggestedQuestions || []}
          onSendMessage={handleSendMessage}
          isSending={askAdvisor.isPending}
        />
      </section>

      {/* 10 & 11: SAVE MY CONSULTATION & BOOK AN IN-INSTITUTE EXPERT */}
      <section className="border border-border/80 p-8 md:p-12 bg-gradient-to-r from-card via-accent/20 to-card rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            {t("journeyKicker")}
          </p>
          <h3 className="font-display text-2xl md:text-3xl text-foreground">
            {t("journeyTitle")}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            {t("journeySubtitle")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="uppercase tracking-widest text-xs px-6"
          >
            <Link href="/diagnosis/history">{t("viewHistory")}</Link>
          </Button>
          <Button asChild size="lg" className="uppercase tracking-widest text-xs px-6 shadow-md">
            <Link href="/booking">
              <Calendar className="me-2 size-4" />
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
