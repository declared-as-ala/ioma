"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, Sparkles } from "lucide-react";

export function AnalysisLoadingSequence() {
  const t = useTranslations("Diagnosis.loading");
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    t("stepImage"),
    t("stepCharacteristics"),
    t("stepProfile"),
    t("stepCatalogue"),
    t("stepRitual"),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="mx-auto max-w-md p-8 text-center animate-in fade-in duration-500">
      <div className="mx-auto size-16 rounded-full bg-accent flex items-center justify-center border border-border/80 shadow-sm">
        <Sparkles className="size-7 text-foreground animate-pulse" />
      </div>

      <h2 className="mt-6 font-display text-2xl md:text-3xl">{t("title")}</h2>
      <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
        {t("subtitle")}
      </p>

      {/* Staged checklist */}
      <div className="mt-10 space-y-4 text-left border border-border/80 p-6 bg-card/60 rounded-md">
        {steps.map((stepText, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={stepText}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                isDone
                  ? "text-foreground font-medium"
                  : isCurrent
                    ? "text-foreground font-medium"
                    : "text-muted-foreground/50"
              }`}
            >
              <div
                className={`size-6 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                  isDone
                    ? "bg-foreground text-background border-foreground"
                    : isCurrent
                      ? "border-foreground bg-accent"
                      : "border-border/60"
                }`}
              >
                {isDone ? (
                  <Check className="size-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  <Loader2 className="size-3 animate-spin text-foreground" />
                ) : (
                  <span className="text-[0.65rem]">{idx + 1}</span>
                )}
              </div>
              <span>{stepText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
