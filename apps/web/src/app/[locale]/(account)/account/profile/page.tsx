"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { LOCALE_LABELS, type Locale } from "@ioma/config";
import { profileSchema, type ProfileInput } from "@ioma/validation";
import { useConcernsQuery } from "@/hooks/use-catalog-queries";
import { useProfileQuery, useUpdateProfileMutation } from "@/hooks/use-account";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfilePage() {
  const t = useTranslations("Account");
  const locale = useLocale() as Locale;
  const profile = useProfileQuery();
  const concerns = useConcernsQuery();
  const update = useUpdateProfileMutation();
  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      dateOfBirth: "",
      skinConcerns: [],
      newsletterOptIn: false,
      preferredLocale: locale,
    },
  });

  useEffect(() => {
    if (!profile.data) return;
    form.reset({
      firstName: profile.data.firstName,
      lastName: profile.data.lastName,
      phone: profile.data.phone ?? "",
      dateOfBirth: profile.data.dateOfBirth?.slice(0, 10) ?? "",
      skinConcerns: profile.data.skinConcerns,
      newsletterOptIn: profile.data.newsletterOptIn,
      preferredLocale: profile.data.preferredLocale,
    });
  }, [form, profile.data]);

  if (profile.isLoading) {
    return <div className="h-80 animate-pulse bg-ioma-grey-100" aria-busy="true" />;
  }

  if (profile.isError || !profile.data) {
    return (
      <section role="alert">
        <h1 className="font-display text-3xl">{t("profile.title")}</h1>
        <p className="mt-4 text-sm text-destructive">{t("loadError")}</p>
        <Button variant="outline" className="mt-4" onClick={() => profile.refetch()}>
          {t("retry")}
        </Button>
      </section>
    );
  }

  return (
    <section aria-labelledby="profile-title" className="max-w-3xl">
      <h1 id="profile-title" className="font-display text-3xl">
        {t("profile.title")}
      </h1>
      <form
        className="mt-10"
        noValidate
        onSubmit={form.handleSubmit((values) => update.mutate(values))}
      >
        <FieldGroup>
          <div className="grid gap-5 sm:grid-cols-2">
            <Controller
              name="firstName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-first-name">
                    {t("profile.firstName")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="profile-first-name"
                    autoComplete="given-name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="lastName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-last-name">
                    {t("profile.lastName")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="profile-last-name"
                    autoComplete="family-name"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Field>
            <FieldLabel htmlFor="profile-email">{t("profile.email")}</FieldLabel>
            <Input
              id="profile-email"
              type="email"
              value={profile.data.email}
              readOnly
              aria-readonly="true"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Controller
              name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-phone">{t("profile.phone")}</FieldLabel>
                  <Input
                    {...field}
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="dateOfBirth"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="profile-date-of-birth">
                    {t("profile.dateOfBirth")}
                  </FieldLabel>
                  <Input
                    {...field}
                    id="profile-date-of-birth"
                    type="date"
                    autoComplete="bday"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>

          <Controller
            name="preferredLocale"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="profile-language">
                  {t("profile.preferredLocale")}
                </FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="profile-language"
                    className="min-h-11 w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["en", "fr", "ar"] as const).map((value) => (
                      <SelectItem key={value} value={value}>
                        {LOCALE_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="skinConcerns"
            control={form.control}
            render={({ field }) => (
              <FieldSet>
                <FieldLegend>{t("profile.skinConcerns")}</FieldLegend>
                {concerns.isLoading ? (
                  <div className="h-20 animate-pulse bg-ioma-grey-100" aria-busy="true" />
                ) : concerns.isError ? (
                  <p role="alert" className="text-sm text-destructive">
                    {t("profile.concernsError")}
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {concerns.data?.map((concern) => {
                      const checked = field.value.includes(concern.slug);
                      return (
                        <label
                          key={concern.slug}
                          className="flex min-h-11 cursor-pointer items-center gap-3 border border-border px-3 py-2 text-sm"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) =>
                              field.onChange(
                                value
                                  ? [...field.value, concern.slug]
                                  : field.value.filter((slug) => slug !== concern.slug),
                              )
                            }
                          />
                          {concern.name[locale]}
                        </label>
                      );
                    })}
                  </div>
                )}
              </FieldSet>
            )}
          />

          <Controller
            name="newsletterOptIn"
            control={form.control}
            render={({ field }) => (
              <label className="flex min-h-11 cursor-pointer items-start gap-3 border-t border-border pt-5 text-sm">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                />
                <span>{t("profile.newsletterOptIn")}</span>
              </label>
            )}
          />

          {update.isError && (
            <p role="alert" className="text-sm text-destructive">
              {t("saveError")}
            </p>
          )}
          {update.isSuccess && (
            <p role="status" className="text-sm">
              {t("profile.saved")}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-fit uppercase tracking-widest"
            disabled={update.isPending}
          >
            {update.isPending ? t("profile.saving") : t("profile.save")}
          </Button>
        </FieldGroup>
      </form>
    </section>
  );
}
