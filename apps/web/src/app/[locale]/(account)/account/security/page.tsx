"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { changePasswordSchema, type ChangePasswordInput } from "@ioma/validation";
import { ApiError } from "@/lib/api";
import { useChangePasswordMutation } from "@/hooks/use-account";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function SecurityPage() {
  const t = useTranslations("Account");
  const changePassword = useChangePasswordMutation();
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });
  const incorrectCurrent =
    changePassword.error instanceof ApiError &&
    changePassword.error.message === "Current password is incorrect.";

  return (
    <section aria-labelledby="security-title" className="max-w-xl">
      <h1 id="security-title" className="font-display text-3xl">
        {t("security.title")}
      </h1>
      <form
        className="mt-10"
        noValidate
        onSubmit={form.handleSubmit((values) =>
          changePassword.mutate(values, {
            onSuccess: () => form.reset(),
          }),
        )}
      >
        <FieldGroup>
          <Controller
            name="currentPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || incorrectCurrent}>
                <FieldLabel htmlFor="current-password">
                  {t("security.currentPassword")}
                </FieldLabel>
                <Input
                  {...field}
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={fieldState.invalid || incorrectCurrent}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                {incorrectCurrent && (
                  <FieldError>{t("security.incorrectCurrent")}</FieldError>
                )}
              </Field>
            )}
          />
          <Controller
            name="newPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="new-password">
                  {t("security.newPassword")}
                </FieldLabel>
                <Input
                  {...field}
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={fieldState.invalid}
                  aria-describedby="new-password-hint"
                />
                <p id="new-password-hint" className="text-xs text-muted-foreground">
                  {t("security.passwordHint")}
                </p>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          {changePassword.isError && !incorrectCurrent && (
            <p role="alert" className="text-sm text-destructive">
              {t("saveError")}
            </p>
          )}
          {changePassword.isSuccess && (
            <p role="status" className="text-sm">
              {t("security.changed")}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-fit uppercase tracking-widest"
            disabled={changePassword.isPending}
          >
            {changePassword.isPending ? t("security.submitting") : t("security.submit")}
          </Button>
        </FieldGroup>
      </form>
    </section>
  );
}
