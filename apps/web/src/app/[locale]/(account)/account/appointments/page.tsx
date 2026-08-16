"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useAppointmentsQuery, useCancelAppointment } from "@/hooks/use-partners";
import { useState } from "react";

export default function AppointmentsPage() {
  const t = useTranslations("Account.appointments");
  const { data: appointments = [], isLoading } = useAppointmentsQuery();
  const cancelAppointment = useCancelAppointment();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm(t("confirmCancel"))) return;
    setCancellingId(id);
    try {
      await cancelAppointment.mutateAsync({ id });
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-AE", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString("en-AE", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusColors: Record<string, string> = {
    confirmed: "bg-green-100 text-green-800",
    rescheduled: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-blue-100 text-blue-800",
    no_show: "bg-gray-100 text-gray-800",
  };

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">{t("title")}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t("noAppointments")}</p>
          <Link
            href="/booking"
            className="inline-block py-2 px-4 bg-primary text-primary-foreground text-sm uppercase tracking-widest rounded-md"
          >
            {t("bookFirst")}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${statusColors[apt.status] ?? "bg-gray-100"}`}
                  >
                    {apt.status}
                  </span>
                </div>
                <p className="font-medium text-sm">{apt.partner.name}</p>
                <p className="text-xs text-muted-foreground">
                  {apt.service.name.en} — {formatDate(apt.startsAt)} at{" "}
                  {formatTime(apt.startsAt)}
                </p>
              </div>
              <div className="flex gap-2">
                {(apt.status === "confirmed" || apt.status === "rescheduled") && (
                  <>
                    <Link
                      href={`/booking/reschedule/${apt.id}`}
                      className="text-xs px-3 py-1.5 border border-border rounded hover:bg-accent transition-colors"
                    >
                      {t("reschedule")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleCancel(apt.id)}
                      disabled={cancellingId === apt.id}
                      className="text-xs px-3 py-1.5 border border-destructive/50 text-destructive rounded hover:bg-destructive/5 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === apt.id ? t("cancelling") : t("cancel")}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
