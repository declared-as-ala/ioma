"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import type { AdaptiveQuestion, AiAnalysisResult } from "@ioma/types";
import { ArrowLeft, ArrowRight, Check, Sparkles, Shield, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AdaptiveConsultationFlowProps {
  analysis: AiAnalysisResult;
  questions: AdaptiveQuestion[];
  onSubmitAnswers: (answers: {
    answers: { questionKey: string; value: string | string[] }[];
    routineText?: string;
    budgetPreference?: string;
    routinePreference?: string;
  }) => void;
  isSubmitting?: boolean;
}

export function AdaptiveConsultationFlow({
  analysis,
  questions,
  onSubmitAnswers,
  isSubmitting,
}: AdaptiveConsultationFlowProps) {
  const t = useTranslations("Diagnosis.consultation");
  const locale = useLocale() as Locale;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [routineText, setRoutineText] = useState("");

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleSelectOption = (questionKey: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      const answersArray = Object.entries(answers).map(([k, v]) => ({
        questionKey: k,
        value: v,
      }));
      const complexity = answers["routineComplexity"] as string | undefined;
      onSubmitAnswers({
        answers: answersArray,
        routineText,
        routinePreference: complexity,
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentAnswer = currentQ ? answers[currentQ.questionKey] : undefined;
  const isAnswered =
    currentQ?.type === "text" ? routineText.trim().length > 0 : Boolean(currentAnswer);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Top Consultation Header */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {t("kicker")}
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 mx-auto max-w-md">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>
            {t("progressLabel", { current: currentIndex + 1, total: questions.length })}
          </span>
          <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-foreground transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side / Mobile Top: Visual Analysis Snapshot & Evolving Profile */}
        <div className="lg:col-span-4 space-y-4">
          <div className="border border-border p-5 bg-card rounded-md">
            <div className="flex items-center gap-2.5">
              <Sparkles className="size-4 text-foreground" />
              <h3 className="font-display text-sm uppercase tracking-widest">
                {t("visualFindingsTitle")}
              </h3>
            </div>

            {analysis.imageUrl && (
              <div className="mt-4 relative w-24 aspect-3/4 mx-auto overflow-hidden rounded border border-border shadow-sm">
                <img
                  src={analysis.imageUrl}
                  alt="Skin portrait"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">{t("detectedSkinType")}:</span>
                <span className="font-medium capitalize">
                  {analysis.skinProfile?.skinType || "Combination"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">{t("hydrationTendency")}:</span>
                <span className="font-medium">
                  {analysis.skinProfile?.hydrationTendency || "Dehydrated"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground">{t("sensitivityLevel")}:</span>
                <span className="font-medium capitalize">
                  {analysis.skinProfile?.sensitivityLevel || "Moderate"}
                </span>
              </div>
            </div>
          </div>

          {/* Live Evolving Priorities Card */}
          <div className="border border-border p-5 bg-accent/30 rounded-md">
            <h4 className="font-display text-xs uppercase tracking-widest text-muted-foreground">
              {t("evolvingPrioritiesTitle")}
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Droplets className="size-3.5 text-foreground shrink-0" />
                <span>{t("priority1Label")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="size-3.5 text-foreground shrink-0" />
                <span>{t("priority2Label")}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Center / Right: Dynamic Question Card */}
        {currentQ && (
          <div className="lg:col-span-8 border border-border bg-card p-6 md:p-10 rounded-md animate-in fade-in duration-300">
            {currentQ.contextReason && (
              <p className="text-xs uppercase tracking-widest text-muted-foreground bg-accent/60 px-3 py-1.5 rounded w-fit mb-4">
                {currentQ.contextReason[locale]}
              </p>
            )}

            <h2 className="font-display text-2xl md:text-3xl text-foreground">
              {currentQ.title[locale]}
            </h2>

            {currentQ.subtitle && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {currentQ.subtitle[locale]}
              </p>
            )}

            {/* Question Options */}
            <div className="mt-8 space-y-3">
              {currentQ.type === "single" && currentQ.options && (
                <div className="grid grid-cols-1 gap-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = currentAnswer === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          handleSelectOption(currentQ.questionKey, opt.value)
                        }
                        data-testid={`consultation-option-${opt.value}`}
                        className={`w-full text-left p-4 rounded-md border text-sm transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? "border-foreground bg-accent shadow-sm"
                            : "border-border hover:border-foreground/40 bg-card"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {opt.label[locale]}
                          </p>
                          {opt.description && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {opt.description[locale]}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="size-4 shrink-0 text-foreground mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQ.type === "text" && (
                <div className="space-y-2">
                  <Textarea
                    value={routineText}
                    onChange={(e) => setRoutineText(e.target.value)}
                    placeholder={
                      currentQ.placeholder?.[locale] || "Enter your current routine..."
                    }
                    rows={4}
                    className="w-full text-sm resize-none"
                    data-testid="consultation-routine-input"
                  />
                  <p className="text-xs text-muted-foreground italic">
                    {t("routineOptionalHint")}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentIndex === 0 || isSubmitting}
                className="uppercase tracking-widest text-xs"
              >
                <ArrowLeft className="me-2 size-3.5" />
                {t("backButton")}
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isAnswered || isSubmitting}
                className="uppercase tracking-widest text-xs px-6"
                data-testid="consultation-next-button"
              >
                {isLastQuestion ? t("finishButton") : t("nextButton")}
                <ArrowRight className="ms-2 size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
