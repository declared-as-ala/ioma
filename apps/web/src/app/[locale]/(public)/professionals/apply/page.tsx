"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/auth-store";
import { useAuthHydrated } from "@/hooks/use-auth-hydrated";
import {
  useApplications,
  useCreateDraftMutation,
  useSubmitApplicationMutation,
} from "@/hooks/use-professional";
import { applicationFormSchema, type ApplicationFormValues } from "@ioma/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Upload, FileText, Clock, XCircle } from "lucide-react";

const BUSINESS_TYPES = [
  { value: "spa", label: "Spa" },
  { value: "clinic", label: "Clinic" },
  { value: "beauty_institute", label: "Beauty Institute" },
  { value: "hotel", label: "Hotel" },
  { value: "retail", label: "Retail" },
  { value: "distributor", label: "Distributor" },
] as const;

const EMIRATES = [
  { value: "AUH", label: "Abu Dhabi" },
  { value: "DXB", label: "Dubai" },
  { value: "SHJ", label: "Sharjah" },
  { value: "AJM", label: "Ajman" },
  { value: "UAQ", label: "Umm Al Quwain" },
  { value: "RAK", label: "Ras Al Khaimah" },
  { value: "FUJ", label: "Fujairah" },
] as const;

const STATUS_CONFIG = {
  draft: { icon: FileText, color: "text-ioma-grey-500", bg: "bg-ioma-grey-50" },
  submitted: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  pending_review: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  documents_requested: { icon: Upload, color: "text-orange-600", bg: "bg-orange-50" },
  approved: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  suspended: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
} as const;

export default function ApplyPage() {
  const t = useTranslations("Professionals.apply");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthHydrated();
  const { data: applications } = useApplications();
  const createDraft = useCreateDraftMutation();
  const submitApp = useSubmitApplicationMutation();

  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      companyName: "",
      contactPerson: "",
      businessType: undefined,
      tradeLicenceNumber: "",
      vatNumber: "",
      email: user?.email ?? "",
      phone: "",
      address: "",
      emirate: undefined,
      city: "",
      website: "",
      socialMedia: "",
      locationsCount: 1,
      expectedOrderVolume: "",
      message: "",
    },
  });

  if (!hydrated) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-[1440px] px-4 md:px-6 py-24">
        <div className="h-8 w-56 animate-pulse bg-ioma-grey-100" />
      </main>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  // If user has existing applications, show status
  if (applications && applications.length > 0 && !currentAppId) {
    const latest = applications[0]!;
    const config =
      STATUS_CONFIG[latest.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;
    const Icon = config.icon;

    return (
      <main className="mx-auto min-h-[50vh] max-w-[800px] px-4 md:px-6 py-24">
        <h1 className="font-heading text-3xl font-light tracking-tight text-ioma-black md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-ioma-grey-500">{t("subtitle")}</p>

        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`rounded-full p-2 ${config.bg}`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{latest.companyName}</CardTitle>
                <p className="text-sm text-ioma-grey-500 capitalize">
                  {latest.status.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {latest.reviewNotes && (
              <Alert className="mb-4">
                <AlertDescription>{latest.reviewNotes}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2 text-sm text-ioma-grey-500">
              <p>
                {t("status.submitted")}: {new Date(latest.createdAt).toLocaleDateString()}
              </p>
              <p>
                {t("status.company")}: {latest.companyName}
              </p>
              <p>
                {t("status.type")}: {latest.businessType}
              </p>
            </div>
            {latest.status === "rejected" && (
              <Button className="mt-6" onClick={() => setCurrentAppId(null)}>
                {t("actions.newApplication")}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    );
  }

  // Application form
  const onSubmit = async (values: ApplicationFormValues) => {
    try {
      let appId = currentAppId;
      if (!appId) {
        const draft = await createDraft.mutateAsync();
        appId = draft._id;
        setCurrentAppId(appId);
      }
      if (!appId) return;
      await submitApp.mutateAsync({ id: appId, data: values });
      setSubmitSuccess(true);
    } catch {
      // Error handled by mutation
    }
  };

  if (submitSuccess) {
    return (
      <main className="mx-auto min-h-[50vh] max-w-[800px] px-4 md:px-6 py-24">
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 font-heading text-2xl font-light text-ioma-black">
              {t("success.title")}
            </h2>
            <p className="mt-2 text-ioma-grey-500">{t("success.description")}</p>
            <Button className="mt-8" onClick={() => router.push("/")}>
              {t("success.backToHome")}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[50vh] max-w-[800px] px-4 md:px-6 py-24">
      <h1 className="font-heading text-3xl font-light tracking-tight text-ioma-black md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-4 text-ioma-grey-500">{t("subtitle")}</p>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-8">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.company")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="companyName">{t("fields.companyName")}</Label>
                <Input
                  id="companyName"
                  {...form.register("companyName")}
                  className="mt-1"
                />
                {form.formState.errors.companyName && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.companyName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="contactPerson">{t("fields.contactPerson")}</Label>
                <Input
                  id="contactPerson"
                  {...form.register("contactPerson")}
                  className="mt-1"
                />
                {form.formState.errors.contactPerson && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.contactPerson.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="businessType">{t("fields.businessType")}</Label>
                <Select
                  value={form.watch("businessType")}
                  onValueChange={(v) =>
                    form.setValue(
                      "businessType",
                      v as ApplicationFormValues["businessType"],
                    )
                  }
                >
                  <SelectTrigger id="businessType" className="mt-1">
                    <SelectValue placeholder={t("fields.businessTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((bt) => (
                      <SelectItem key={bt.value} value={bt.value}>
                        {bt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.businessType && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.businessType.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="tradeLicenceNumber">{t("fields.tradeLicence")}</Label>
                <Input
                  id="tradeLicenceNumber"
                  {...form.register("tradeLicenceNumber")}
                  className="mt-1"
                />
                {form.formState.errors.tradeLicenceNumber && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.tradeLicenceNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="vatNumber">
                {t("fields.vatNumber")} ({t("fields.optional")})
              </Label>
              <Input id="vatNumber" {...form.register("vatNumber")} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.contact")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">{t("fields.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  className="mt-1"
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">{t("fields.phone")}</Label>
                <Input id="phone" {...form.register("phone")} className="mt-1" />
                {form.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">{t("fields.address")}</Label>
              <Input id="address" {...form.register("address")} className="mt-1" />
              {form.formState.errors.address && (
                <p className="mt-1 text-sm text-red-500">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="emirate">{t("fields.emirate")}</Label>
                <Select
                  value={form.watch("emirate")}
                  onValueChange={(v) =>
                    form.setValue("emirate", v as ApplicationFormValues["emirate"])
                  }
                >
                  <SelectTrigger id="emirate" className="mt-1">
                    <SelectValue placeholder={t("fields.emiratePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {EMIRATES.map((e) => (
                      <SelectItem key={e.value} value={e.value}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.emirate && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.emirate.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="city">{t("fields.city")}</Label>
                <Input id="city" {...form.register("city")} className="mt-1" />
                {form.formState.errors.city && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="website">
                  {t("fields.website")} ({t("fields.optional")})
                </Label>
                <Input
                  id="website"
                  {...form.register("website")}
                  className="mt-1"
                  placeholder="https://"
                />
              </div>
              <div>
                <Label htmlFor="socialMedia">
                  {t("fields.socialMedia")} ({t("fields.optional")})
                </Label>
                <Input
                  id="socialMedia"
                  {...form.register("socialMedia")}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.business")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="locationsCount">{t("fields.locationsCount")}</Label>
                <Input
                  id="locationsCount"
                  type="number"
                  min={1}
                  {...form.register("locationsCount")}
                  className="mt-1"
                />
                {form.formState.errors.locationsCount && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.locationsCount.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="expectedOrderVolume">
                  {t("fields.expectedOrderVolume")}
                </Label>
                <Input
                  id="expectedOrderVolume"
                  {...form.register("expectedOrderVolume")}
                  className="mt-1"
                />
                {form.formState.errors.expectedOrderVolume && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.formState.errors.expectedOrderVolume.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="message">
                {t("fields.message")} ({t("fields.optional")})
              </Label>
              <Textarea
                id="message"
                {...form.register("message")}
                className="mt-1"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/")}>
            {t("actions.cancel")}
          </Button>
          <Button type="submit" disabled={createDraft.isPending || submitApp.isPending}>
            {createDraft.isPending || submitApp.isPending
              ? t("actions.submitting")
              : t("actions.submit")}
          </Button>
        </div>
      </form>
    </main>
  );
}
