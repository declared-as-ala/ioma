"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import type { Locale } from "@ioma/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNewsletterMutation } from "@/hooks/use-newsletter-mutation";

export function NewsletterForm() {
  const t = useTranslations("Footer");
  const locale = useLocale() as Locale;
  const mutation = useNewsletterMutation();
  const [email, setEmail] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({ email, locale }, { onSuccess: () => setEmail("") });
  }

  if (mutation.isSuccess) {
    return <p className="text-sm text-foreground">{t("newsletterSuccess")}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("newsletterPlaceholder")}
          aria-label={t("newsletterPlaceholder")}
          className="bg-background"
        />
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="shrink-0 uppercase tracking-widest"
        >
          {mutation.isPending ? t("newsletterSubmitting") : t("newsletterSubmit")}
        </Button>
      </div>
      {mutation.isError && (
        <p role="alert" className="text-xs text-destructive">
          {t("newsletterError")}
        </p>
      )}
    </form>
  );
}
