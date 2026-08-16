import { z } from "zod";

export const createAppointmentSchema = z.object({
  partnerId: z.string().min(1),
  serviceId: z.string().min(1),
  startsAt: z.string().min(1),
  specialistId: z.string().optional(),
  diagnosisId: z.string().optional(),
  treatmentId: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const rescheduleAppointmentSchema = z.object({
  startsAt: z.string().min(1),
  notes: z.string().max(500).optional(),
});

export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;

export const cancelAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
});

export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
