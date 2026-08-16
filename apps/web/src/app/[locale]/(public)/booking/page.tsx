"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import {
  usePartnersQuery,
  useServicesQuery,
  useSlotsQuery,
  useBookAppointment,
} from "@/hooks/use-partners";
import { useAuthStore } from "@/stores/auth-store";
import type { PartnerListItem, ServiceSummary, TimeSlot } from "@ioma/types";

type BookingStep = "partner" | "service" | "datetime" | "confirm";

export default function BookingPage() {
  const t = useTranslations("Booking");
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPartner = searchParams.get("partner") ?? "";
  const preselectedService = searchParams.get("service") ?? "";

  const [step, setStep] = useState<BookingStep>(
    preselectedPartner ? (preselectedService ? "datetime" : "service") : "partner",
  );
  const [selectedPartner, setSelectedPartner] = useState<PartnerListItem | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [bookingError, setBookingError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const bookAppointment = useBookAppointment();

  const { data: partners = [], isLoading: partnersLoading } = usePartnersQuery({
    diagnosisAvailable: true,
  });
  const { data: services = [], isLoading: servicesLoading } = useServicesQuery();
  const { data: slots = [], isLoading: slotsLoading } = useSlotsQuery(
    selectedPartner?.id ?? "",
    selectedDate,
  );

  // Filter services to those offered by the selected partner
  const availableServices = useMemo(() => {
    if (!selectedPartner) return services;
    const partnerServiceSlugs = selectedPartner.services.map((s) => s.slug);
    return services.filter((s) => partnerServiceSlugs.includes(s.slug));
  }, [selectedPartner, services]);

  // Pre-select partner from URL
  const preselectedPartnerData = useMemo(() => {
    if (!preselectedPartner) return null;
    return partners.find((p) => p.slug === preselectedPartner) ?? null;
  }, [preselectedPartner, partners]);

  // Pre-select service from URL
  const preselectedServiceData = useMemo(() => {
    if (!preselectedService) return null;
    return services.find((s) => s.slug === preselectedService) ?? null;
  }, [preselectedService, services]);

  // Apply pre-selections when data loads
  useMemo(() => {
    if (preselectedPartnerData && !selectedPartner) {
      setSelectedPartner(preselectedPartnerData);
    }
  }, [preselectedPartnerData, selectedPartner]);

  useMemo(() => {
    if (preselectedServiceData && !selectedService) {
      setSelectedService(preselectedServiceData);
    }
  }, [preselectedServiceData, selectedService]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-AE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleBook = useCallback(async () => {
    if (!selectedPartner || !selectedService || !selectedSlot || !selectedDate) return;

    setBookingError(null);
    try {
      const result = await bookAppointment.mutateAsync({
        partnerId: selectedPartner.id,
        serviceId: selectedService._id,
        startsAt: `${selectedDate}T${selectedSlot.startsAt}:00.000Z`,
        notes: notes || undefined,
      });
      router.push(`/booking/confirmation/${result.id}`);
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : t("errors.bookingFailed"));
    }
  }, [
    selectedPartner,
    selectedService,
    selectedSlot,
    selectedDate,
    notes,
    bookAppointment,
    router,
    t,
  ]);

  const steps: { key: BookingStep; label: string }[] = [
    { key: "partner", label: t("steps.partner") },
    { key: "service", label: t("steps.service") },
    { key: "datetime", label: t("steps.datetime") },
    { key: "confirm", label: t("steps.confirm") },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  // Generate next 14 days as date options
  const dateOptions = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, []);

  if (!user) {
    return (
      <main className="mx-auto max-w-[600px] px-4 md:px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">{t("authRequired")}</h1>
        <p className="text-muted-foreground mb-6">{t("authRequiredMessage")}</p>
        <a
          href={`/login?redirect=/booking`}
          className="inline-block py-3 px-6 bg-primary text-primary-foreground text-sm uppercase tracking-widest rounded-md"
        >
          {t("signIn")}
        </a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[800px] px-4 md:px-6 py-24">
      <h1 className="font-display text-3xl sm:text-4xl tracking-tight mb-8">
        {t("title")}
      </h1>

      {/* Progress steps */}
      <nav className="flex items-center gap-2 mb-10" aria-label={t("progress")}>
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                i <= currentStepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              aria-current={s.key === step ? "step" : undefined}
            >
              {i + 1}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                i <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-border mx-1" />}
          </div>
        ))}
      </nav>

      {/* Step: Select Partner */}
      {step === "partner" && (
        <section>
          <h2 className="font-display text-xl mb-4">{t("selectPartner")}</h2>
          {partnersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {partners.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPartner(p);
                    setStep("service");
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedPartner?.id === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.city} — {p.services.length} {t("servicesAvailable")}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Step: Select Service */}
      {step === "service" && (
        <section>
          <h2 className="font-display text-xl mb-4">{t("selectService")}</h2>
          {servicesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {availableServices.map((svc) => (
                <button
                  key={svc._id}
                  type="button"
                  onClick={() => {
                    setSelectedService(svc);
                    setStep("datetime");
                  }}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedService?._id === svc._id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{svc.name.en}</p>
                      <p className="text-sm text-muted-foreground">
                        {svc.durationMinutes} min — {svc.category}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">{t("select")}</span>
                  </div>
                </button>
              ))}
              {availableServices.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8">
                  {t("noServices")}
                </p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setStep("partner")}
            className="mt-6 text-sm text-muted-foreground hover:text-foreground"
          >
            {t("back")}
          </button>
        </section>
      )}

      {/* Step: Select Date & Time */}
      {step === "datetime" && (
        <section>
          <h2 className="font-display text-xl mb-4">{t("selectDateTime")}</h2>

          {/* Date picker */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground mb-2 block">
              {t("selectDate")}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dateOptions.map((dateStr) => {
                const d = new Date(dateStr);
                const dayName = d.toLocaleDateString("en-AE", { weekday: "short" });
                const dayNum = d.getDate();
                const isSelected = selectedDate === dateStr;
                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedSlot(null);
                    }}
                    className={`flex-shrink-0 w-16 py-3 rounded-lg border text-center transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="text-xs">{dayName}</p>
                    <p className="text-lg font-medium">{dayNum}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                {t("selectTime")}
              </label>
              {slotsLoading ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">{t("noSlots")}</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.startsAt}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded border text-sm transition-colors ${
                        !slot.available
                          ? "opacity-30 cursor-not-allowed border-border"
                          : selectedSlot?.startsAt === slot.startsAt
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:border-primary/50"
                      }`}
                    >
                      {slot.startsAt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setStep("service")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("back")}
            </button>
            {selectedSlot && (
              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="py-2 px-6 bg-primary text-primary-foreground text-sm uppercase tracking-widest rounded-md"
              >
                {t("continue")}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Step: Confirm */}
      {step === "confirm" && (
        <section>
          <h2 className="font-display text-xl mb-6">{t("confirmBooking")}</h2>

          <div className="rounded-lg border p-6 space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t("partner")}</span>
              <span className="text-sm font-medium">{selectedPartner?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t("service")}</span>
              <span className="text-sm font-medium">{selectedService?.name.en}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t("date")}</span>
              <span className="text-sm font-medium">{formatDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">{t("time")}</span>
              <span className="text-sm font-medium">
                {selectedSlot?.startsAt} — {selectedSlot?.endsAt}
              </span>
            </div>
            {selectedService && (
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">{t("duration")}</span>
                <span className="text-sm font-medium">
                  {selectedService.durationMinutes} min
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground mb-2 block">
              {t("notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder={t("notesPlaceholder")}
            />
          </div>

          {bookingError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {bookingError}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep("datetime")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("back")}
            </button>
            <button
              type="button"
              onClick={handleBook}
              disabled={bookAppointment.isPending}
              className="py-3 px-8 bg-primary text-primary-foreground text-sm uppercase tracking-widest rounded-md disabled:opacity-50"
            >
              {bookAppointment.isPending ? t("booking") : t("confirmBookingCta")}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
