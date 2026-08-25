"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import type { AdaptiveQuestion, AiAnalysisResult } from "@ioma/types";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Shield,
  Droplets,
  Mic,
  MicOff,
  Sun,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiExpertPresence } from "@/components/diagnosis/ai-expert-presence";
import { useVoiceAdvisor } from "@/hooks/use-voice-advisor";

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

  const {
    speak,
    stopSpeaking,
    toggleMute,
    isSpeaking,
    isMuted,
    isListening,
    startListening,
    stopListening,
    hasSpeechRecognition,
  } = useVoiceAdvisor(locale);

  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Speak the question text whenever step changes (if not muted)
  useEffect(() => {
    if (currentQ) {
      const qText = `${currentQ.title[locale]}. ${currentQ.subtitle?.[locale] || ""}`;
      speak(qText);
    }
    return () => {
      stopSpeaking();
    };
  }, [currentIndex, currentQ, locale, speak, stopSpeaking]);

  const handleSelectOption = (questionKey: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));
  };

  const handleNext = () => {
    stopSpeaking();
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
    stopSpeaking();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentAnswer = currentQ ? answers[currentQ.questionKey] : undefined;
  const isAnswered =
    currentQ?.type === "text" ? routineText.trim().length > 0 : Boolean(currentAnswer);

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center max-w-xl mx-auto py-16 space-y-4 animate-in fade-in">
        <div className="size-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-spin">
          <Sparkles className="size-5 text-amber-500" />
        </div>
        <h2 className="font-display text-xl text-foreground">
          {locale === "ar"
            ? "جاري تجهيز استشارتكِ المخصصة..."
            : "Calibrating Your Adaptive Consultation..."}
        </h2>
        <p className="text-xs text-muted-foreground">
          {locale === "ar"
            ? "يقوم الذكاء الاصطناعي بتحليل ملامح بشرتكِ وإعداد الأسئلة الدقيقة المناسبة لنمط حياتكِ."
            : "Synthesizing optical indicators into personalized lifestyle and tolerance questions."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-16">
      {/* Top Consultation Header */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {t("kicker")}
        </p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl text-foreground">
          {t("title")}
        </h1>
        <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mt-8 mx-auto max-w-md">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>
            {t("progressLabel", {
              current: currentIndex + 1,
              total: questions.length,
            })}
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

      {/* Main 3-Column Luxury Grid */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Analysis & Facial Zones */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border border-border/80 p-5 bg-card rounded-xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Sparkles className="size-4 text-foreground" />
              <h3 className="font-display text-xs uppercase tracking-widest font-medium">
                {t("visualFindingsTitle")}
              </h3>
            </div>

            {analysis.imageUrl && (
              <div className="relative aspect-3/4 w-32 mx-auto overflow-hidden rounded-lg border border-border shadow-sm">
                <img
                  src={analysis.imageUrl}
                  alt="Skin portrait"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("detectedSkinType")}:</span>
                <span className="font-medium capitalize">
                  {analysis.skinProfile?.skinType || "Combination"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("hydrationTendency")}:</span>
                <span className="font-medium">
                  {analysis.skinProfile?.hydrationTendency || "Dehydrated"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("sensitivityLevel")}:</span>
                <span className="font-medium capitalize">
                  {analysis.skinProfile?.sensitivityLevel || "Moderate"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Conversational Question Flow */}
        <div className="lg:col-span-6 space-y-6">
          <AiExpertPresence
            isSpeaking={isSpeaking}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            spokenText={currentQ ? currentQ.title[locale] : undefined}
          />

          {currentQ && (
            <div className="border border-border/80 bg-card p-6 md:p-8 rounded-xl shadow-sm animate-in fade-in duration-300 space-y-6">
              {currentQ.contextReason && (
                <span className="inline-block text-[0.7rem] uppercase tracking-wider text-muted-foreground bg-accent/80 border border-border/60 px-3 py-1 rounded-full font-medium">
                  {currentQ.contextReason[locale]}
                </span>
              )}

              <div>
                <h2 className="font-display text-xl md:text-2xl text-foreground font-medium">
                  {currentQ.title[locale]}
                </h2>

                {currentQ.subtitle && (
                  <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {currentQ.subtitle[locale]}
                  </p>
                )}
              </div>

              {/* Options list */}
              <div className="space-y-3">
                {currentQ.type === "single" && currentQ.options && (
                  <div className="grid grid-cols-1 gap-2.5">
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
                          className={`w-full text-left p-4 rounded-lg border text-xs md:text-sm transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? "border-foreground bg-accent shadow-sm ring-1 ring-foreground"
                              : "border-border hover:border-foreground/40 bg-background/60"
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
                  <div className="space-y-3">
                    <Textarea
                      rows={4}
                      value={routineText}
                      onChange={(e) => setRoutineText(e.target.value)}
                      placeholder={currentQ.placeholder?.[locale]}
                      className="text-xs md:text-sm resize-none bg-background/60"
                      data-testid="consultation-routine-textarea"
                    />

                    {hasSpeechRecognition && (
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isListening) {
                              stopListening();
                            } else {
                              startListening((text) => {
                                setRoutineText((prev) =>
                                  prev ? `${prev} ${text}` : text,
                                );
                              });
                            }
                          }}
                          className={`text-xs ${
                            isListening ? "border-red-500 text-red-500 animate-pulse" : ""
                          }`}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="me-2 size-3.5" />
                              {t("stopVoiceInput")}
                            </>
                          ) : (
                            <>
                              <Mic className="me-2 size-3.5" />
                              {t("dictateRoutine")}
                            </>
                          )}
                        </Button>
                        <span className="text-[0.7rem] text-muted-foreground">
                          {t("naturalLanguageHint")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 flex items-center justify-between border-t border-border/60">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  disabled={currentIndex === 0 || isSubmitting}
                  className="text-xs uppercase tracking-widest"
                >
                  <ArrowLeft className="me-2 size-3.5" />
                  {t("back")}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleNext}
                  disabled={!isAnswered || isSubmitting}
                  className="text-xs uppercase tracking-widest px-6"
                  data-testid="consultation-next-button"
                >
                  {isSubmitting ? (
                    t("synthesizing")
                  ) : isLastQuestion ? (
                    t("revealRitual")
                  ) : (
                    <>
                      {t("continue")}
                      <ArrowRight className="ms-2 size-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Evolving Profile & Priorities */}
        <div className="lg:col-span-3 space-y-4">
          <div className="border border-border/80 p-5 bg-card rounded-xl shadow-sm space-y-4">
            <h4 className="font-display text-xs uppercase tracking-widest text-muted-foreground font-medium border-b border-border/60 pb-3">
              {t("evolvingPrioritiesTitle")}
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-accent/40 rounded-lg border border-border/60 flex items-start gap-2.5">
                <Droplets className="size-4 text-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">{t("priority1Label")}</p>
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                    {t("priority1Desc")}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-accent/40 rounded-lg border border-border/60 flex items-start gap-2.5">
                <Shield className="size-4 text-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">{t("priority2Label")}</p>
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                    {t("priority2Desc")}
                  </p>
                </div>
              </div>
              <div className="p-3 bg-accent/40 rounded-lg border border-border/60 flex items-start gap-2.5">
                <Sun className="size-4 text-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">{t("priority3Label")}</p>
                  <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                    {t("priority3Desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
