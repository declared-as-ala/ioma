import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Training, TrainingDocument } from "./schemas/training.schema";
import {
  TrainingSession,
  TrainingSessionDocument,
} from "./schemas/training-session.schema";
import {
  TrainingBooking,
  TrainingBookingDocument,
} from "./schemas/training-booking.schema";
import {
  ProfessionalProfile,
  ProfessionalProfileDocument,
} from "../professional/schemas/professional-profile.schema";

@Injectable()
export class TrainingsService {
  constructor(
    @InjectModel(Training.name)
    private readonly trainingModel: Model<TrainingDocument>,
    @InjectModel(TrainingSession.name)
    private readonly sessionModel: Model<TrainingSessionDocument>,
    @InjectModel(TrainingBooking.name)
    private readonly bookingModel: Model<TrainingBookingDocument>,
    @InjectModel(ProfessionalProfile.name)
    private readonly profileModel: Model<ProfessionalProfileDocument>,
  ) {}

  async listTrainings() {
    return this.trainingModel.find().sort({ slug: 1 }).lean();
  }

  async getTrainingBySlug(slug: string) {
    const training = await this.trainingModel.findOne({ slug }).lean();
    if (!training) throw new NotFoundException("Training course not found.");
    return training;
  }

  async listSessions(trainingId: string) {
    return this.sessionModel
      .find({
        trainingId: new Types.ObjectId(trainingId),
        startsAt: { $gte: new Date() },
      })
      .sort({ startsAt: 1 })
      .lean();
  }

  async bookSession(userId: string, sessionId: string) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException("Training session not found.");

    if (session.seatsBooked >= session.capacity) {
      throw new BadRequestException("This training session is fully booked.");
    }

    const existingBooking = await this.bookingModel.findOne({
      sessionId: session._id,
      attendeeUserId: new Types.ObjectId(userId),
      status: "booked",
    });
    if (existingBooking) {
      throw new BadRequestException("You have already booked a seat in this session.");
    }

    const profile = await this.profileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    const booking = await this.bookingModel.create({
      sessionId: session._id,
      attendeeUserId: new Types.ObjectId(userId),
      professionalProfileId: profile ? profile._id : null,
      status: "booked",
    });

    session.seatsBooked += 1;
    await session.save();

    return {
      id: booking._id.toString(),
      sessionId: session._id.toString(),
      startsAt: session.startsAt,
      endsAt: session.endsAt,
      status: booking.status,
    };
  }

  async listMyBookings(userId: string) {
    const docs = await this.bookingModel
      .find({ attendeeUserId: new Types.ObjectId(userId) })
      .populate<{
        sessionId: {
          _id: Types.ObjectId;
          trainingId: Types.ObjectId;
          startsAt: Date;
          endsAt: Date;
          location: string | null;
        };
      }>("sessionId")
      .sort({ createdAt: -1 })
      .lean();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      sessionId: doc.sessionId._id.toString(),
      startsAt: doc.sessionId.startsAt,
      endsAt: doc.sessionId.endsAt,
      location: doc.sessionId.location,
      status: doc.status,
    }));
  }

  async cancelBooking(userId: string, bookingId: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.attendeeUserId.toString() !== userId) {
      throw new BadRequestException("You can only cancel your own booking.");
    }
    if (booking.status === "cancelled") {
      throw new BadRequestException("Booking is already cancelled.");
    }

    booking.status = "cancelled";
    await booking.save();

    const session = await this.sessionModel.findById(booking.sessionId);
    if (session && session.seatsBooked > 0) {
      session.seatsBooked -= 1;
      await session.save();
    }

    return { id: booking._id.toString(), status: booking.status };
  }
}
