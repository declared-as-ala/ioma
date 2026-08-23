"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import type { BeforeAfterComparison as BeforeAfterData } from "@ioma/types";
import { TrendingUp, Minus, AlertCircle } from "lucide-react";

interface BeforeAfterComparisonProps {
  comparison: BeforeAfterData;
}

export function BeforeAfterComparison({ comparison }: BeforeAfterComparisonProps) {
  const t = useTranslations("Diagnosis.comparison");
  const tIndicators = useTranslations("Diagnosis.ai.indicatorLabels");
  const locale = useLocale() as Locale;

  return (
    <div className="border border-border bg-card rounded-md p-6 md:p-8 space-y-6">
      <div className="border-b border-border/60 pb-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {t("kicker")}
        </p>
        <h3 className="mt-1 font-display text-xl md:text-2xl">
          {t("title", { days: comparison.daySpan })}
        </h3>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {comparison.narrative[locale]}
        </p>
      </div>

      {/* Grid of Indicator Changes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {comparison.indicatorChanges.map((change) => {
          const isImproved = change.trend === "improved";
          const isStable = change.trend === "stable";

          return (
            <div
              key={change.key}
              className="p-3.5 border border-border bg-accent/20 rounded-md text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {tIndicators(change.key)}
                </span>
                <span
                  className={`flex items-center gap-1 font-medium ${
                    isImproved
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isStable
                        ? "text-muted-foreground"
                        : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isImproved && <TrendingUp className="size-3.5" />}
                  {isStable && <Minus className="size-3.5" />}
                  {!isImproved && !isStable && <AlertCircle className="size-3.5" />}
                  {change.diff > 0 ? `+${change.diff}` : change.diff}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[0.65rem] text-muted-foreground">
                <span>
                  {t("initial")}: {change.previousScore}
                </span>
                <span>
                  {t("current")}: {change.currentScore}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
