"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale, RoutineTier } from "@ioma/config";
import type { RecommendedProduct, RoutineTierData } from "@ioma/types";
import { ShoppingBag, Sun, Moon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoutineTierCardProps {
  tiers: {
    essential: RoutineTierData;
    complete: RoutineTierData;
    premium: RoutineTierData;
  };
  activeTier: RoutineTier;
  onSelectTier: (tier: RoutineTier) => void;
  onAddToCart: (products: RecommendedProduct[]) => void;
  isAddingToCart?: boolean;
}

export function RoutineTierCard({
  tiers,
  activeTier,
  onSelectTier,
  onAddToCart,
  isAddingToCart,
}: RoutineTierCardProps) {
  const t = useTranslations("Diagnosis.routine");
  const locale = useLocale() as Locale;

  const currentTierData = tiers[activeTier] || tiers.complete;

  const formatPrice = (priceMinor: number) => {
    return (priceMinor / 100).toLocaleString(locale === "ar" ? "ar-AE" : "en-AE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const allActiveProducts = [
    ...currentTierData.morningSteps,
    ...currentTierData.eveningSteps,
  ].filter((v, i, a) => a.findIndex((t) => t.sku === v.sku) === i);

  return (
    <div className="space-y-12">
      {/* 3 Tier Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["essential", "complete", "premium"] as const).map((tierKey) => {
          const tierInfo = tiers[tierKey];
          const isSelected = activeTier === tierKey;

          return (
            <button
              key={tierKey}
              type="button"
              onClick={() => onSelectTier(tierKey)}
              data-testid={`routine-tier-tab-${tierKey}`}
              className={`p-5 rounded-md border text-left transition-all relative ${
                isSelected
                  ? "border-foreground bg-accent shadow-md ring-1 ring-foreground"
                  : "border-border hover:border-foreground/40 bg-card"
              }`}
            >
              {tierKey === "complete" && (
                <span className="absolute -top-2.5 right-4 bg-foreground text-background text-[0.65rem] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-medium">
                  {t("recommendedBadge")}
                </span>
              )}
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                {t(`tierTitles.${tierKey}`)}
              </p>
              <p className="mt-2 font-display text-2xl">
                {formatPrice(tierInfo.totalPriceMinor)}{" "}
                <span className="text-sm font-sans font-normal text-muted-foreground">
                  AED
                </span>
              </p>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {tierInfo.description[locale]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Morning and Evening Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Morning Ritual */}
        <div className="border border-border p-6 md:p-8 bg-card rounded-md space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-4">
            <Sun className="size-5 text-amber-500" />
            <div>
              <h3 className="font-display text-lg">{t("morningRitualTitle")}</h3>
              <p className="text-xs text-muted-foreground">
                {t("morningRitualSubtitle")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {currentTierData.morningSteps.map((prod, idx) => (
              <div
                key={prod.sku}
                className="p-4 rounded-xl border border-border/80 bg-background/60 hover:bg-background/90 transition-all flex flex-col sm:flex-row gap-4 items-start shadow-sm"
              >
                {/* Product Packaging Image Container */}
                <div className="relative size-20 sm:size-24 shrink-0 rounded-lg bg-white border border-border/60 p-2 flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={prod.image || "/images/products/creme-sublime-revitalisante-1.jpg"}
                    alt={prod.name[locale]}
                    className="size-full object-contain select-none"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/products/creme-sublime-revitalisante-1.jpg";
                    }}
                  />
                  <span className="absolute top-1 start-1 size-5 rounded-full bg-foreground text-background text-[0.6rem] font-bold flex items-center justify-center shadow">
                    {idx + 1}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-display text-sm sm:text-base font-medium text-foreground leading-snug">
                      {prod.name[locale]}
                    </h4>
                    <span className="text-xs sm:text-sm font-semibold text-foreground shrink-0">
                      {formatPrice(prod.priceMinor)}{" "}
                      <span className="text-[0.65rem] font-normal text-muted-foreground">
                        AED
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                    <span className="uppercase tracking-wider font-medium text-ioma-violet">
                      {prod.range?.name?.[locale] || "IOMA"}
                    </span>
                    <span>•</span>
                    <span>{prod.size}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {prod.shortBenefit[locale]}
                  </p>

                  <div className="pt-1">
                    <p className="text-[0.7rem] bg-accent/70 px-2.5 py-1 rounded text-muted-foreground inline-block">
                      <span className="font-semibold text-foreground">
                        {t("whyLabel")}:
                      </span>{" "}
                      {prod.whyThisProduct[locale]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evening Ritual */}
        <div className="border border-border p-6 md:p-8 bg-card rounded-md space-y-6">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-4">
            <Moon className="size-5 text-indigo-400" />
            <div>
              <h3 className="font-display text-lg">{t("eveningRitualTitle")}</h3>
              <p className="text-xs text-muted-foreground">
                {t("eveningRitualSubtitle")}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {currentTierData.eveningSteps.map((prod, idx) => (
              <div
                key={prod.sku}
                className="p-4 rounded-xl border border-border/80 bg-background/60 hover:bg-background/90 transition-all flex flex-col sm:flex-row gap-4 items-start shadow-sm"
              >
                {/* Product Packaging Image Container */}
                <div className="relative size-20 sm:size-24 shrink-0 rounded-lg bg-white border border-border/60 p-2 flex items-center justify-center overflow-hidden shadow-sm">
                  <img
                    src={prod.image || "/images/products/creme-sublime-revitalisante-1.jpg"}
                    alt={prod.name[locale]}
                    className="size-full object-contain select-none"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/images/products/creme-sublime-revitalisante-1.jpg";
                    }}
                  />
                  <span className="absolute top-1 start-1 size-5 rounded-full bg-foreground text-background text-[0.6rem] font-bold flex items-center justify-center shadow">
                    {idx + 1}
                  </span>
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-display text-sm sm:text-base font-medium text-foreground leading-snug">
                      {prod.name[locale]}
                    </h4>
                    <span className="text-xs sm:text-sm font-semibold text-foreground shrink-0">
                      {formatPrice(prod.priceMinor)}{" "}
                      <span className="text-[0.65rem] font-normal text-muted-foreground">
                        AED
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                    <span className="uppercase tracking-wider font-medium text-ioma-violet">
                      {prod.range?.name?.[locale] || "IOMA"}
                    </span>
                    <span>•</span>
                    <span>{prod.size}</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {prod.shortBenefit[locale]}
                  </p>

                  <div className="pt-1">
                    <p className="text-[0.7rem] bg-accent/70 px-2.5 py-1 rounded text-muted-foreground inline-block">
                      <span className="font-semibold text-foreground">
                        {t("whyLabel")}:
                      </span>{" "}
                      {prod.whyThisProduct[locale]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Ritual Band */}
      {currentTierData.weeklyRitual && currentTierData.weeklyRitual.length > 0 && (
        <div className="border border-border p-6 md:p-8 bg-accent/30 rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-4 text-foreground" />
            <h4 className="font-display text-sm uppercase tracking-widest">
              {t("weeklyRitualTitle")}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTierData.weeklyRitual.map((step, idx) => (
              <div key={idx} className="p-4 bg-card border border-border rounded text-xs">
                <div className="flex items-center justify-between font-medium text-foreground mb-1">
                  <span>{step.action[locale]}</span>
                  <span className="text-muted-foreground text-[0.65rem] uppercase tracking-widest">
                    {step.day}
                  </span>
                </div>
                <p className="text-muted-foreground">{step.guidance[locale]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Entire Routine to Cart CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border border-border bg-card rounded-md">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {t("selectedTierSummary", { tier: t(`tierTitles.${activeTier}`) })}
          </p>
          <p className="mt-1 font-display text-2xl text-foreground">
            {formatPrice(currentTierData.totalPriceMinor)}{" "}
            <span className="text-sm font-sans font-normal text-muted-foreground">
              AED
            </span>
          </p>
        </div>
        <Button
          size="lg"
          className="w-full sm:w-auto uppercase tracking-widest px-8"
          disabled={isAddingToCart || allActiveProducts.length === 0}
          onClick={() => onAddToCart(allActiveProducts)}
          data-testid="add-entire-routine-button"
        >
          <ShoppingBag className="me-2 size-4" />
          {isAddingToCart ? t("addingToCart") : t("addEntireRoutine")}
        </Button>
      </div>
    </div>
  );
}
