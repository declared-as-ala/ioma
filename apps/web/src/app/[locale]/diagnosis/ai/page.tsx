"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ALLOWED_AI_IMAGE_MIME_TYPES, MAX_AI_IMAGE_SIZE_BYTES } from "@ioma/config";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import { useRecordAiConsent, useSubmitAiAnalysis } from "@/hooks/use-ai-analysis";
import { Button } from "@/components/ui/button";

type Step = "consent" | "upload";

export default function AiDiagnosisPage() {
  const t = useTranslations("Diagnosis.ai");
  const router = useRouter();
  const hydrated = useAuthHydrated();
  const user = useAuthStore((state) => state.user);

  const [step, setStep] = useState<Step>("consent");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const consent = useRecordAiConsent();
  const submit = useSubmitAiAnalysis();

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-2xl px-4 md:px-6 py-24" aria-busy="true">
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
        <div className="mt-10 h-40 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 md:px-6 py-24">
        <p className="max-w-sm text-sm text-muted-foreground">{t("signInPrompt")}</p>
        <Button asChild size="lg" className="mt-6 uppercase tracking-widest">
          <Link href="/login">{t("signInCta")}</Link>
        </Button>
      </main>
    );
  }

  function handleFileChange(selected: File | null) {
    setFileError(null);
    if (!selected) {
      setFile(null);
      return;
    }
    if (!(ALLOWED_AI_IMAGE_MIME_TYPES as readonly string[]).includes(selected.type)) {
      setFileError(t("upload.invalidType"));
      setFile(null);
      return;
    }
    if (selected.size > MAX_AI_IMAGE_SIZE_BYTES) {
      setFileError(t("upload.tooLarge"));
      setFile(null);
      return;
    }
    setFile(selected);
  }

  function submitFile() {
    if (!file) return;
    submit.mutate(file, {
      onSuccess: (result) => router.push(`/diagnosis/ai/${result.id}`),
    });
  }

  return (
    <main className="mx-auto max-w-2xl px-4 md:px-6 py-24">
      {step === "consent" ? (
        <section aria-labelledby="ai-consent-title">
          <h1 id="ai-consent-title" className="font-display text-3xl">
            {t("consent.title")}
          </h1>
          <p className="mt-6 leading-7 text-muted-foreground">{t("consent.body")}</p>
          {consent.isError ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {t("consent.error")}
            </p>
          ) : null}
          <Button
            size="lg"
            className="mt-8 uppercase tracking-widest"
            disabled={consent.isPending}
            data-testid="ai-consent-agree"
            onClick={() =>
              consent.mutate(undefined, { onSuccess: () => setStep("upload") })
            }
          >
            {t("consent.agree")}
          </Button>
        </section>
      ) : (
        <section aria-labelledby="ai-upload-title">
          <h1 id="ai-upload-title" className="font-display text-3xl">
            {t("upload.title")}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">{t("upload.instructions")}</p>

          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_AI_IMAGE_MIME_TYPES.join(",")}
            className="sr-only"
            data-testid="ai-file-input"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              {file ? t("upload.changeFile") : t("upload.chooseFile")}
            </Button>
            {file ? (
              <span className="text-sm text-muted-foreground">{file.name}</span>
            ) : null}
          </div>

          {fileError ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {fileError}
            </p>
          ) : null}
          {submit.isError ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {t("upload.error")}
            </p>
          ) : null}

          <Button
            size="lg"
            className="mt-8 w-fit uppercase tracking-widest"
            disabled={!file || submit.isPending}
            data-testid="ai-submit"
            onClick={submitFile}
          >
            {submit.isPending ? t("upload.submitting") : t("upload.submit")}
          </Button>
        </section>
      )}
    </main>
  );
}
