"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  DIAGNOSIS_QUESTION_KEYS,
  DIAGNOSIS_QUESTION_VALUES,
  type DiagnosisQuestionKey,
} from "@ioma/config";
import type { DiagnosisAnswer } from "@ioma/types";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "@/i18n/navigation";
import { useSubmitStandardDiagnosis } from "@/hooks/use-diagnosis";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Answers = Partial<Record<DiagnosisQuestionKey, string>>;

export default function StandardDiagnosisPage() {
  const t = useTranslations("Diagnosis.standard");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const submit = useSubmitStandardDiagnosis();

  const questionKey = DIAGNOSIS_QUESTION_KEYS[step];
  const isLastStep = step === DIAGNOSIS_QUESTION_KEYS.length - 1;
  const currentValue = questionKey ? answers[questionKey] : undefined;

  function selectAndAdvance(value: string) {
    if (!questionKey) return;
    const next = { ...answers, [questionKey]: value };
    setAnswers(next);

    if (isLastStep) {
      const finalAnswers: DiagnosisAnswer[] = DIAGNOSIS_QUESTION_KEYS.map((key) => ({
        questionKey: key,
        value: next[key] as string,
      }));
      submit.mutate(finalAnswers, {
        onSuccess: (result) => router.push(`/diagnosis/standard/${result.id}`),
      });
    } else {
      setStep((s) => s + 1);
    }
  }

  if (!questionKey) return null;

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-24">
      <div aria-label={t("progressLabel")} data-testid="standard-diagnosis-progress">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {step + 1} / {DIAGNOSIS_QUESTION_KEYS.length}
        </p>
        <div className="mt-3 h-1 w-full bg-ioma-grey-100">
          <div
            className="h-1 bg-foreground transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${((step + 1) / DIAGNOSIS_QUESTION_KEYS.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={questionKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
          className="mt-10"
        >
          <h1 className="font-display text-2xl md:text-3xl">
            {t(`questions.${questionKey}.title`)}
          </h1>

          <div
            role="radiogroup"
            aria-label={t(`questions.${questionKey}.title`)}
            className="mt-8 flex flex-col gap-3"
          >
            {DIAGNOSIS_QUESTION_VALUES[questionKey].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={currentValue === value}
                data-testid={`diagnosis-option-${questionKey}-${value}`}
                onClick={() => selectAndAdvance(value)}
                disabled={submit.isPending}
                className={cn(
                  "rounded-md border px-5 py-4 text-start text-sm transition-colors",
                  currentValue === value
                    ? "border-foreground bg-accent"
                    : "border-border hover:border-foreground/40",
                )}
              >
                {t(`questions.${questionKey}.options.${value}`)}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {submit.isError ? (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {t("errorGeneric")}
        </p>
      ) : null}

      <div className="mt-10 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submit.isPending}
        >
          {t("back")}
        </Button>
        {submit.isPending ? (
          <p role="status" className="text-sm text-muted-foreground">
            {t("submitting")}
          </p>
        ) : null}
      </div>
    </main>
  );
}
