import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { TrainingsService } from "./trainings.service";
import { Training } from "./schemas/training.schema";
import { TrainingSession } from "./schemas/training-session.schema";
import { TrainingBooking } from "./schemas/training-booking.schema";
import { ProfessionalProfile } from "../professional/schemas/professional-profile.schema";

describe("TrainingsService", () => {
  let service: TrainingsService;
  let trainingModel: any;
  let sessionModel: any;
  let bookingModel: any;
  let profileModel: any;

  const mockUserId = new Types.ObjectId().toString();
  const mockTrainingId = new Types.ObjectId().toString();
  const mockSessionId = new Types.ObjectId().toString();

  beforeEach(async () => {
    trainingModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn(),
    };

    sessionModel = {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn(),
    };

    bookingModel = {
      findOne: jest.fn(),
      find: jest.fn().mockReturnThis(),
      findById: jest.fn(),
      create: jest.fn(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn(),
    };

    profileModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingsService,
        { provide: getModelToken(Training.name), useValue: trainingModel },
        { provide: getModelToken(TrainingSession.name), useValue: sessionModel },
        { provide: getModelToken(TrainingBooking.name), useValue: bookingModel },
        { provide: getModelToken(ProfessionalProfile.name), useValue: profileModel },
      ],
    }).compile();

    service = module.get<TrainingsService>(TrainingsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("bookSession", () => {
    it("should throw NotFoundException if session does not exist", async () => {
      sessionModel.findById.mockResolvedValue(null);

      await expect(service.bookSession(mockUserId, mockSessionId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if session capacity is reached", async () => {
      sessionModel.findById.mockResolvedValue({
        _id: new Types.ObjectId(mockSessionId),
        capacity: 5,
        seatsBooked: 5,
      });

      await expect(service.bookSession(mockUserId, mockSessionId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException if user already booked the session", async () => {
      sessionModel.findById.mockResolvedValue({
        _id: new Types.ObjectId(mockSessionId),
        capacity: 10,
        seatsBooked: 2,
      });
      bookingModel.findOne.mockResolvedValue({ _id: new Types.ObjectId() });

      await expect(service.bookSession(mockUserId, mockSessionId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should book session and increment seatsBooked on success", async () => {
      const mockSession = {
        _id: new Types.ObjectId(mockSessionId),
        capacity: 10,
        seatsBooked: 2,
        startsAt: new Date(),
        endsAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };
      sessionModel.findById.mockResolvedValue(mockSession);
      bookingModel.findOne.mockResolvedValue(null);
      profileModel.findOne.mockResolvedValue({ _id: new Types.ObjectId() });

      const createdBookingId = new Types.ObjectId();
      bookingModel.create.mockResolvedValue({
        _id: createdBookingId,
        status: "booked",
      });

      const result = await service.bookSession(mockUserId, mockSessionId);

      expect(mockSession.seatsBooked).toBe(3);
      expect(mockSession.save).toHaveBeenCalled();
      expect(result.id).toBe(createdBookingId.toString());
      expect(result.status).toBe("booked");
    });
  });

  describe("cancelBooking", () => {
    it("should cancel booking and decrement seatsBooked", async () => {
      const mockBooking = {
        _id: new Types.ObjectId(),
        sessionId: new Types.ObjectId(mockSessionId),
        attendeeUserId: new Types.ObjectId(mockUserId),
        status: "booked",
        save: jest.fn().mockResolvedValue(true),
      };
      const mockSession = {
        _id: new Types.ObjectId(mockSessionId),
        seatsBooked: 3,
        save: jest.fn().mockResolvedValue(true),
      };

      bookingModel.findById.mockResolvedValue(mockBooking);
      sessionModel.findById.mockResolvedValue(mockSession);

      const result = await service.cancelBooking(mockUserId, mockBooking._id.toString());

      expect(mockBooking.status).toBe("cancelled");
      expect(mockSession.seatsBooked).toBe(2);
      expect(result.status).toBe("cancelled");
    });
  });
});
