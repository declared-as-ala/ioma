import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Appointment, AppointmentDocument } from "./schemas/appointment.schema";
import { Partner, PartnerDocument } from "../partners/schemas/partner.schema";
import {
  Availability,
  AvailabilityDocument,
} from "../partners/schemas/availability.schema";
import type {
  CreateAppointmentDto,
  RescheduleAppointmentDto,
} from "./dto/appointment.dto";

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Partner.name)
    private readonly partnerModel: Model<PartnerDocument>,
    @InjectModel(Availability.name)
    private readonly availabilityModel: Model<AvailabilityDocument>,
  ) {}

  async book(userId: string, dto: CreateAppointmentDto) {
    const partner = await this.partnerModel
      .findOne({
        _id: new Types.ObjectId(dto.partnerId),
        status: "active",
      })
      .lean();
    if (!partner) throw new NotFoundException("Partner not found.");

    const startsAt = new Date(dto.startsAt);
    if (isNaN(startsAt.getTime())) {
      throw new BadRequestException("Invalid startsAt date.");
    }

    // Determine slot duration from the service
    // For simplicity, default to 30 min if no service duration is found
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000);

    // Check capacity before inserting — this is the race-condition prevention.
    // The unique compound index on {partnerId, specialistId, startsAt}
    // catches any concurrent duplicate at the DB level, but we check capacity
    // here first for a better user experience (full vs. conflict).
    const availability = await this.availabilityModel
      .findOne({
        resourceType: "partner",
        resourceId: new Types.ObjectId(dto.partnerId),
      })
      .lean();

    const capacity = availability?.capacityPerSlot ?? 1;

    const existingCount = await this.appointmentModel.countDocuments({
      partnerId: new Types.ObjectId(dto.partnerId),
      specialistId: dto.specialistId ? new Types.ObjectId(dto.specialistId) : null,
      status: { $in: ["confirmed", "rescheduled"] },
      startsAt: startsAt,
    });

    if (existingCount >= capacity) {
      throw new BadRequestException(
        "This time slot is no longer available. Please choose another.",
      );
    }

    try {
      const appointment = await this.appointmentModel.create({
        userId: new Types.ObjectId(userId),
        partnerId: new Types.ObjectId(dto.partnerId),
        serviceId: new Types.ObjectId(dto.serviceId),
        specialistId: dto.specialistId ? new Types.ObjectId(dto.specialistId) : null,
        startsAt,
        endsAt,
        status: "confirmed",
        notes: dto.notes ?? null,
        diagnosisId: dto.diagnosisId ? new Types.ObjectId(dto.diagnosisId) : null,
        treatmentId: dto.treatmentId ? new Types.ObjectId(dto.treatmentId) : null,
        statusHistory: [{ status: "confirmed", at: new Date() }],
      });

      return this.toResponse(appointment);
    } catch (error: unknown) {
      if (
        (typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as { code: unknown }).code === 11000) ||
        (error instanceof Error && error.name === "MongoServerError")
      ) {
        throw new BadRequestException(
          "This time slot is no longer available. Please choose another.",
        );
      }
      throw error;
    }
  }

  async reschedule(userId: string, appointmentId: string, dto: RescheduleAppointmentDto) {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) throw new NotFoundException("Appointment not found.");
    if (appointment.userId.toString() !== userId) {
      throw new ForbiddenException("You can only reschedule your own appointments.");
    }
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      throw new BadRequestException(
        `Cannot reschedule an appointment with status "${appointment.status}".`,
      );
    }

    const newStartsAt = new Date(dto.startsAt);
    if (isNaN(newStartsAt.getTime())) {
      throw new BadRequestException("Invalid startsAt date.");
    }

    // Check capacity at the new slot
    const availability = await this.availabilityModel
      .findOne({
        resourceType: "partner",
        resourceId: appointment.partnerId,
      })
      .lean();
    const capacity = availability?.capacityPerSlot ?? 1;

    const existingCount = await this.appointmentModel.countDocuments({
      _id: { $ne: appointment._id },
      partnerId: appointment.partnerId,
      specialistId: appointment.specialistId,
      status: { $in: ["confirmed", "rescheduled"] },
      startsAt: newStartsAt,
    });

    if (existingCount >= capacity) {
      throw new BadRequestException(
        "The new time slot is no longer available. Please choose another.",
      );
    }

    appointment.startsAt = newStartsAt;
    appointment.endsAt = new Date(newStartsAt.getTime() + 30 * 60 * 1000);
    appointment.status = "rescheduled";
    if (dto.notes) appointment.notes = dto.notes;
    appointment.statusHistory.push({
      status: "rescheduled",
      at: new Date(),
      by: new Types.ObjectId(userId),
    });

    await appointment.save();
    return this.toResponse(appointment);
  }

  async cancel(userId: string, appointmentId: string, reason?: string) {
    const appointment = await this.appointmentModel.findById(appointmentId);
    if (!appointment) throw new NotFoundException("Appointment not found.");
    if (appointment.userId.toString() !== userId) {
      throw new ForbiddenException("You can only cancel your own appointments.");
    }
    if (appointment.status === "cancelled") {
      throw new BadRequestException("Appointment is already cancelled.");
    }
    if (appointment.status === "completed") {
      throw new BadRequestException("Cannot cancel a completed appointment.");
    }

    appointment.status = "cancelled";
    appointment.notes = reason ?? appointment.notes;
    appointment.statusHistory.push({
      status: "cancelled",
      at: new Date(),
      by: new Types.ObjectId(userId),
    });

    await appointment.save();
    return this.toResponse(appointment);
  }

  async listMine(userId: string) {
    const docs = await this.appointmentModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate<{ partnerId: { slug: string; name: string; city: string } }>("partnerId")
      .populate<{
        serviceId: {
          slug: string;
          name: Record<string, string>;
          durationMinutes: number;
        };
      }>("serviceId")
      .sort({ startsAt: -1 })
      .lean();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      partner: {
        slug: doc.partnerId.slug,
        name: doc.partnerId.name,
        city: doc.partnerId.city,
      },
      service: {
        slug: doc.serviceId.slug,
        name: doc.serviceId.name,
        durationMinutes: doc.serviceId.durationMinutes,
      },
      startsAt: doc.startsAt,
      endsAt: doc.endsAt,
      status: doc.status,
      notes: doc.notes,
      createdAt: (doc as unknown as { createdAt?: Date }).createdAt ?? null,
    }));
  }

  async getById(userId: string, appointmentId: string) {
    const doc = await this.appointmentModel
      .findById(appointmentId)
      .populate<{
        partnerId: { slug: string; name: string; city: string; address: string };
      }>("partnerId")
      .populate<{
        serviceId: {
          slug: string;
          name: Record<string, string>;
          durationMinutes: number;
          category: string;
        };
      }>("serviceId")
      .lean();

    if (!doc) throw new NotFoundException("Appointment not found.");
    if (doc.userId.toString() !== userId) {
      throw new ForbiddenException("You can only view your own appointments.");
    }

    return {
      id: doc._id.toString(),
      partner: {
        slug: doc.partnerId.slug,
        name: doc.partnerId.name,
        city: doc.partnerId.city,
        address: doc.partnerId.address,
      },
      service: {
        slug: doc.serviceId.slug,
        name: doc.serviceId.name,
        durationMinutes: doc.serviceId.durationMinutes,
        category: doc.serviceId.category,
      },
      startsAt: doc.startsAt,
      endsAt: doc.endsAt,
      status: doc.status,
      notes: doc.notes,
      statusHistory: doc.statusHistory,
      createdAt: (doc as unknown as { createdAt?: Date }).createdAt ?? null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toResponse(doc: any) {
    return {
      id: doc._id.toString(),
      partnerId: doc.partnerId.toString(),
      serviceId: doc.serviceId.toString(),
      startsAt: doc.startsAt,
      endsAt: doc.endsAt,
      status: doc.status,
      notes: doc.notes,
    };
  }
}
