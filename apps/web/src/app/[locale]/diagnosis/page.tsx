"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Shield, Camera, MessageSquare, HelpCircle, Check } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import {
  useAdaptiveQuestionsQuery,
  useAiAnalysisQuery,
  useRecordAiConsent,
  useSubmitAdaptiveAnswers,
  useSubmitAiAnalysis,
} from "@/hooks/use-ai-analysis";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AiCameraCapture } from "@/components/diagnosis/ai-camera-capture";
import { AnalysisLoadingSequence } from "@/components/diagnosis/analysis-loading-sequence";
import { AdaptiveConsultationFlow } from "@/components/diagnosis/adaptive-consultation-flow";

type FlowStep = "landing" | "consent" | "capture" | "analyzing" | "consultation";

export default function DiagnosisLandingPage() {
  const t = useTranslations("Diagnosis.expertLanding");
  const tConsent = useTranslations("Diagnosis.ai.consent");
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);

  const [step, setStep] = useState<FlowStep>("landing");
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [createdAnalysisId, setCreatedAnalysisId] = useState<string | null>(null);

  const consent = useRecordAiConsent();
  const submitAnalysis = useSubmitAiAnalysis();
  const analysisQuery = useAiAnalysisQuery(createdAnalysisId || undefined);
  const adaptiveQuestions = useAdaptiveQuestionsQuery(
    createdAnalysisId || undefined,
    step === "consultation" || step === "analyzing",
  );
  const submitAnswers = useSubmitAdaptiveAnswers(createdAnalysisId || "");

  // As soon as analysis has completed or questions are ready, transition to consultation
  useEffect(() => {
    if (step === "analyzing" && createdAnalysisId) {
      if (
        analysisQuery.data?.status === "completed" ||
        analysisQuery.data?.observations ||
        (adaptiveQuestions.data && adaptiveQuestions.data.length > 0)
      ) {
        setStep("consultation");
      }
    }
  }, [step, createdAnalysisId, analysisQuery.data, adaptiveQuestions.data]);

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-24" aria-busy="true">
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
        <div className="mt-10 h-64 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  const handleStartConsultation = () => {
    if (!user) {
      router.push("/login?redirect=/diagnosis");
      return;
    }
    setStep("consent");
  };

  const handleConsentAgreed = () => {
    if (user) {
      consent.mutate(undefined, {
        onSuccess: () => setStep("capture"),
        onError: () => setStep("capture"), // Fallback gracefully
      });
    } else {
      setStep("capture");
    }
  };

  const handlePhotoSelected = (file: File) => {
    setStep("analyzing");
    submitAnalysis.mutate(file, {
      onSuccess: (result) => {
        setCreatedAnalysisId(result.id);
        // Move to adaptive consultation step
        setStep("consultation");
      },
      onError: () => {
        // Fallback to error or upload retry
        setStep("capture");
      },
    });
  };

  const handleSubmitConsultationAnswers = (data: {
    answers: { questionKey: string; value: string | string[] }[];
    routineText?: string;
    budgetPreference?: string;
    routinePreference?: string;
  }) => {
    if (!createdAnalysisId) return;
    submitAnswers.mutate(data, {
      onSuccess: (result) => {
        router.push(`/diagnosis/ai/${result.id}`);
      },
    });
  };

  return (
    <main className="min-h-[80vh]">
      {/* 1. Landing Hero & Presentation */}
      {step === "landing" && (
        <section className="mx-auto max-w-4xl px-4 md:px-6 py-20 md:py-28 animate-in fade-in duration-300">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t("kicker")}
            </p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.15]">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-base text-muted-foreground leading-relaxed">
              {t("heroSubtitle")}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="w-full sm:w-auto uppercase tracking-widest px-8 py-6 text-xs"
                onClick={handleStartConsultation}
                data-testid="start-ai-skin-expert"
              >
                <Sparkles className="me-2 size-4" />
                {t("startCta")}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto uppercase tracking-widest px-8 py-6 text-xs"
                onClick={() => setHowItWorksOpen(true)}
              >
                <HelpCircle className="me-2 size-4" />
                {t("howItWorksCta")}
              </Button>
            </div>

            {!user && (
              <p className="mt-6 text-xs text-muted-foreground">
                {t("guestNotice")}{" "}
                <Link
                  href="/login"
                  className="underline font-medium hover:text-foreground"
                >
                  {t("signInLink")}
                </Link>
              </p>
            )}
          </div>

          {/* 4 Pillars Grid */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border border-border p-6 bg-card rounded-md">
              <div className="size-10 rounded-full bg-accent flex items-center justify-center border border-border">
                <Camera className="size-5 text-foreground" />
              </div>
              <p className="mt-4 text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
                01
              </p>
              <h3 className="mt-1 font-display text-lg">{t("pillar1Title")}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {t("pillar1Body")}
              </p>
            </div>

            <div className="border border-border p-6 bg-card rounded-md">
              <div className="size-10 rounded-full bg-accent flex items-center justify-center border border-border">
                <MessageSquare className="size-5 text-foreground" />
              </div>
              <p className="mt-4 text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
                02
              </p>
              <h3 className="mt-1 font-display text-lg">{t("pillar2Title")}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {t("pillar2Body")}
              </p>
            </div>

            <div className="border border-border p-6 bg-card rounded-md">
              <div className="size-10 rounded-full bg-accent flex items-center justify-center border border-border">
                <Sparkles className="size-5 text-foreground" />
              </div>
              <p className="mt-4 text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
                03
              </p>
              <h3 className="mt-1 font-display text-lg">{t("pillar3Title")}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {t("pillar3Body")}
              </p>
            </div>

            <div className="border border-border p-6 bg-card rounded-md">
              <div className="size-10 rounded-full bg-accent flex items-center justify-center border border-border">
                <Shield className="size-5 text-foreground" />
              </div>
              <p className="mt-4 text-[0.65rem] uppercase tracking-widest text-muted-foreground font-medium">
                04
              </p>
              <h3 className="mt-1 font-display text-lg">{t("pillar4Title")}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {t("pillar4Body")}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* 2. Consent Step */}
      {step === "consent" && (
        <section className="mx-auto max-w-xl px-4 py-20 animate-in fade-in duration-300">
          <div className="border border-border p-8 bg-card rounded-md">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <Shield className="size-6 text-foreground" />
              <div>
                <h2 className="font-display text-2xl">{tConsent("title")}</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  {t("privacyNoticeKicker")}
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              {tConsent("body")}
            </p>

            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Check className="size-4 text-foreground shrink-0" />
                <span>{t("consentPoint1")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-foreground shrink-0" />
                <span>{t("consentPoint2")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="size-4 text-foreground shrink-0" />
                <span>{t("consentPoint3")}</span>
              </li>
            </ul>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto uppercase tracking-widest text-xs"
                onClick={() => setStep("landing")}
              >
                {t("cancelButton")}
              </Button>
              <Button
                size="lg"
                className="w-full sm:w-auto uppercase tracking-widest text-xs px-8"
                onClick={handleConsentAgreed}
                disabled={consent.isPending}
                data-testid="ai-consent-agree"
              >
                {tConsent("agree")}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* 3. Camera Capture & Upload Step */}
      {step === "capture" && (
        <section className="mx-auto max-w-4xl px-4 py-16">
          <AiCameraCapture
            onPhotoSelected={handlePhotoSelected}
            isSubmitting={submitAnalysis.isPending}
          />
        </section>
      )}

      {/* 4. Analyzing Sequence */}
      {step === "analyzing" && (
        <section className="mx-auto max-w-xl px-4 py-20">
          <AnalysisLoadingSequence />
        </section>
      )}

      {/* 5. Adaptive Multi-Turn Consultation */}
      {step === "consultation" && createdAnalysisId && (
        <section className="mx-auto max-w-5xl px-4 py-12">
          {adaptiveQuestions.isLoading ? (
            <AnalysisLoadingSequence />
          ) : (
            <AdaptiveConsultationFlow
              analysis={
                analysisQuery.data || {
                  id: createdAnalysisId,
                  status: "processing",
                  isSimulated: false,
                  imageUrl: null,
                  observations: null,
                  indicators: null,
                  skinProfile: {
                    skinType: "combination",
                    hydrationTendency: "Dehydrated under AC",
                    sensitivityLevel: "moderate",
                    priorities: [],
                    goals: ["dehydration"],
                    currentRoutine: {},
                    climateContext: { acExposure: "high", sunExposure: "moderate" },
                    routinePreference: "balanced",
                    budgetPreference: "no_preference",
                    confidence: 0.92,
                  },
                  recommendedRange: null,
                  routines: null,
                  activeTier: "complete",
                  morningRoutine: [],
                  eveningRoutine: [],
                  chatHistory: [],
                  failureReason: null,
                  createdAt: new Date().toISOString(),
                }
              }
              questions={adaptiveQuestions.data || []}
              onSubmitAnswers={handleSubmitConsultationAnswers}
              isSubmitting={submitAnswers.isPending}
            />
          )}
        </section>
      )}

      {/* "How It Works" Editorial Dialog */}
      <Dialog open={howItWorksOpen} onOpenChange={setHowItWorksOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {t("howItWorksModalTitle")}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed mt-2">
              {t("howItWorksModalSubtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs text-muted-foreground mt-4 leading-relaxed">
            <div className="p-4 border border-border bg-accent/20 rounded">
              <p className="font-medium text-foreground text-sm">{t("howStep1Title")}</p>
              <p className="mt-1">{t("howStep1Body")}</p>
            </div>
            <div className="p-4 border border-border bg-accent/20 rounded">
              <p className="font-medium text-foreground text-sm">{t("howStep2Title")}</p>
              <p className="mt-1">{t("howStep2Body")}</p>
            </div>
            <div className="p-4 border border-border bg-accent/20 rounded">
              <p className="font-medium text-foreground text-sm">{t("howStep3Title")}</p>
              <p className="mt-1">{t("howStep3Body")}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
