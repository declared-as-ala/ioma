"use client";

import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@ioma/config";
import {
  useTrainings,
  useTrainingSessions,
  useMyTrainingBookings,
  useBookTrainingSessionMutation,
  useCancelTrainingBookingMutation,
} from "@/hooks/use-trainings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Award, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function PortalTrainingsPage() {
  const t = useTranslations("Pro.trainings");
  const locale = useLocale() as Locale;

  const { data: trainings, isLoading: loadingTrainings } = useTrainings();
  const { data: myBookings, isLoading: loadingBookings } = useMyTrainingBookings();
  const bookMutation = useBookTrainingSessionMutation();
  const cancelMutation = useCancelTrainingBookingMutation();

  const activeTraining = trainings && trainings.length > 0 ? trainings[0] : null;
  const { data: sessions } = useTrainingSessions(activeTraining?._id ?? "");

  const handleBook = async (sessionId: string) => {
    try {
      await bookMutation.mutateAsync(sessionId);
      toast.success(t("booked"));
    } catch {
      toast.error("Failed to book training session.");
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelMutation.mutateAsync(bookingId);
      toast.success("Booking cancelled.");
    } catch {
      toast.error("Failed to cancel booking.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-light tracking-tight text-ioma-black md:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-ioma-grey-500">{t("subtitle")}</p>
      </div>

      {/* Scheduled Bookings */}
      {myBookings && myBookings.length > 0 && (
        <Card className="border-ioma-gold/30 bg-ioma-gold/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-light">
              <Award className="h-5 w-5 text-ioma-gold" />
              {t("myBookings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-ioma-grey-500" />
                    <span className="font-medium text-sm">
                      {new Date(b.startsAt).toLocaleDateString(locale, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <Badge variant={b.status === "booked" ? "default" : "outline"}>
                      {b.status}
                    </Badge>
                  </div>
                  {b.location && (
                    <p className="text-xs text-ioma-grey-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {b.location}
                    </p>
                  )}
                </div>
                {b.status === "booked" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelMutation.isPending}
                  >
                    {t("cancelBooking")}
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Courses & Sessions */}
      {loadingTrainings ? (
        <div className="h-48 animate-pulse rounded-lg bg-ioma-grey-100" />
      ) : trainings && trainings.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {trainings.map((course) => (
            <Card key={course._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="capitalize">
                    {course.mode}
                  </Badge>
                  <Badge variant="outline">{course.requiredLevel}</Badge>
                </div>
                <CardTitle className="text-xl font-light mt-2">
                  {course.name[locale] || course.name.en}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-ioma-grey-600">
                  {course.description[locale] || course.description.en}
                </p>

                {course.includedMaterials.length > 0 && (
                  <div className="text-xs space-y-1">
                    <span className="text-ioma-grey-400 font-medium">Includes:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {course.includedMaterials.map((mat, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                          {mat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Sessions list */}
                <div className="mt-4 pt-4 border-t space-y-3">
                  <span className="text-xs font-medium text-ioma-grey-500 uppercase tracking-wider">
                    Upcoming Sessions
                  </span>

                  {sessions && sessions.length > 0 ? (
                    sessions.map((sess) => {
                      const isFull = sess.seatsBooked >= sess.capacity;
                      const isAlreadyBooked = myBookings?.some(
                        (b) => b.sessionId === sess._id && b.status === "booked",
                      );

                      return (
                        <div
                          key={sess._id}
                          className="flex items-center justify-between rounded-md border p-3 text-sm"
                        >
                          <div>
                            <p className="font-medium flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-ioma-grey-500" />
                              {new Date(sess.startsAt).toLocaleDateString(locale, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-xs text-ioma-grey-500 mt-0.5">
                              {sess.location || "Online"} &middot;{" "}
                              {sess.capacity - sess.seatsBooked} seats remaining
                            </p>
                          </div>

                          <Button
                            size="sm"
                            disabled={isFull || isAlreadyBooked || bookMutation.isPending}
                            onClick={() => handleBook(sess._id)}
                          >
                            {isAlreadyBooked
                              ? t("booked")
                              : isFull
                                ? t("fullyBooked")
                                : t("bookSession")}
                          </Button>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-ioma-grey-400">{t("noSessions")}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-ioma-grey-500">{t("noSessions")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
