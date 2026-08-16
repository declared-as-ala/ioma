"use client";

import { useLocale, useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactMessageSchema, type ContactMessageInput } from "@ioma/validation";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useContactMutation } from "@/hooks/use-contact-mutation";
import type { Locale } from "@ioma/config";

export function ContactForm() {
  const t = useTranslations("ContactPage");
  const locale = useLocale() as Locale;
  const mutation = useContactMutation();

  const form = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", locale },
  });

  function onSubmit(values: ContactMessageInput) {
    mutation.mutate(values, {
      onSuccess: () =>
        form.reset({ name: "", email: "", subject: "", message: "", locale }),
    });
  }

  if (mutation.isSuccess) {
    return (
      <div
        role="status"
        className="rounded-md border border-border bg-accent p-8 text-center"
      >
        <p className="font-display text-xl">{t("successTitle")}</p>
        <p className="mt-2 text-sm text-muted-foreground">{t("successBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-name">{t("nameLabel")}</FieldLabel>
              <Input
                {...field}
                id="contact-name"
                aria-invalid={fieldState.invalid}
                autoComplete="name"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-email">{t("emailLabel")}</FieldLabel>
              <Input
                {...field}
                id="contact-email"
                type="email"
                aria-invalid={fieldState.invalid}
                autoComplete="email"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="subject"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-subject">{t("subjectLabel")}</FieldLabel>
              <Input {...field} id="contact-subject" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="message"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="contact-message">{t("messageLabel")}</FieldLabel>
              <Textarea
                {...field}
                id="contact-message"
                rows={6}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {mutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            {t("errorBody")}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
          className="uppercase tracking-widest"
        >
          {mutation.isPending ? t("submitting") : t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
