"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAppointmentQuery } from "@/hooks/use-partners";

export default function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("BookingConfirmation");
  const { data: appointment, isLoading } = useAppointmentQuery(id);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[600px] px-4 md:px-6 py-24 text-center">
        <div className="h-8 w-48 bg-muted animate-pulse mx-auto mb-4" />
        <div className="h-12 w-64 bg-muted animate-pulse mx-auto mb-8" />
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="mx-auto max-w-[600px] px-4 md:px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">{t("notFound")}</h1>
        <Link href="/booking" className="text-sm underline text-muted-foreground">
          {t("backToBooking")}
        </Link>
      </main>
    );
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-AE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <main className="mx-auto max-w-[600px] px-4 md:px-6 py-24 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="font-display text-3xl tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </div>

      <div className="rounded-lg border p-6 text-left space-y-3 mb-8">
        <div className="flex justify-between">
          <span className="text-muted-foreground text-sm">{t("partner")}</span>
          <span className="text-sm font-medium">{appointment.partner.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground text-sm">{t("location")}</span>
          <span className="text-sm">{appointment.partner.city}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground text-sm">{t("service")}</span>
          <span className="text-sm font-medium">{appointment.service.name.en}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground text-sm">{t("date")}</span>
          <span className="text-sm font-medium">{formatDate(appointment.startsAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground text-sm">{t("time")}</span>
          <span className="text-sm font-medium">
            {new Date(appointment.startsAt).toLocaleTimeString("en-AE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground text-sm">{t("status")}</span>
          <span className="text-sm font-medium capitalize">{appointment.status}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/account/appointments"
          className="py-3 px-6 bg-primary text-primary-foreground text-sm uppercase tracking-widest rounded-md text-center"
        >
          {t("viewAppointments")}
        </Link>
        <Link
          href="/"
          className="py-3 px-6 border border-border text-sm uppercase tracking-widest rounded-md text-center hover:bg-accent transition-colors"
        >
          {t("backToHome")}
        </Link>
      </div>
    </main>
  );
}
