import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { AppointmentsService } from "./appointments.service";
import { Appointment } from "./schemas/appointment.schema";
import { Partner } from "../partners/schemas/partner.schema";
import { Availability } from "../partners/schemas/availability.schema";

describe("AppointmentsService", () => {
  let service: AppointmentsService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAppointmentModel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPartnerModel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockAvailabilityModel: any;

  const userId = new Types.ObjectId().toString();
  const partnerId = new Types.ObjectId().toString();
  const serviceId = new Types.ObjectId().toString();

  // Helper to create a chainable mock (findOne().populate().lean())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function chainable(result: any) {
    const chain: any = {};
    chain.populate = jest.fn().mockReturnValue(chain);
    chain.sort = jest.fn().mockReturnValue(chain);
    chain.lean = jest.fn().mockResolvedValue(result);
    return chain;
  }

  beforeEach(async () => {
    mockAppointmentModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      countDocuments: jest.fn(),
    };
    mockPartnerModel = {
      findOne: jest.fn(),
    };
    mockAvailabilityModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getModelToken(Appointment.name), useValue: mockAppointmentModel },
        { provide: getModelToken(Partner.name), useValue: mockPartnerModel },
        { provide: getModelToken(Availability.name), useValue: mockAvailabilityModel },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  describe("book", () => {
    it("should successfully book an available slot", async () => {
      const mockDoc = {
        _id: new Types.ObjectId(),
        partnerId: new Types.ObjectId(partnerId),
        serviceId: new Types.ObjectId(serviceId),
        startsAt: new Date("2026-09-01T10:00:00.000Z"),
        endsAt: new Date("2026-09-01T10:30:00.000Z"),
        status: "confirmed",
        notes: null,
      };

      mockPartnerModel.findOne.mockReturnValue(
        chainable({ _id: new Types.ObjectId(partnerId), status: "active" }),
      );
      mockAvailabilityModel.findOne.mockReturnValue(chainable({ capacityPerSlot: 2 }));
      mockAppointmentModel.countDocuments.mockResolvedValue(1);
      mockAppointmentModel.create.mockResolvedValue(mockDoc);

      const result = await service.book(userId, {
        partnerId,
        serviceId,
        startsAt: "2026-09-01T10:00:00.000Z",
      });

      expect(result.status).toBe("confirmed");
      expect(mockAppointmentModel.create).toHaveBeenCalled();
    });

    it("should reject booking when slot is at capacity", async () => {
      mockPartnerModel.findOne.mockReturnValue(
        chainable({ _id: new Types.ObjectId(partnerId), status: "active" }),
      );
      mockAvailabilityModel.findOne.mockReturnValue(chainable({ capacityPerSlot: 1 }));
      mockAppointmentModel.countDocuments.mockResolvedValue(1);

      await expect(
        service.book(userId, {
          partnerId,
          serviceId,
          startsAt: "2026-09-01T10:00:00.000Z",
        }),
      ).rejects.toThrow("no longer available");
    });

    it("should handle concurrent booking attempts for the same slot cleanly", async () => {
      mockPartnerModel.findOne.mockReturnValue(
        chainable({ _id: new Types.ObjectId(partnerId), status: "active" }),
      );
      mockAvailabilityModel.findOne.mockReturnValue(chainable({ capacityPerSlot: 1 }));
      mockAppointmentModel.countDocuments.mockResolvedValue(0);

      const mockDoc = {
        _id: new Types.ObjectId(),
        partnerId: new Types.ObjectId(partnerId),
        serviceId: new Types.ObjectId(serviceId),
        startsAt: new Date("2026-09-01T10:00:00.000Z"),
        endsAt: new Date("2026-09-01T10:30:00.000Z"),
        status: "confirmed",
        notes: null,
      };

      const mongoDupError = new Error("E11000 duplicate key error") as Error & {
        code: number;
      };
      mongoDupError.code = 11000;

      mockAppointmentModel.create
        .mockResolvedValueOnce(mockDoc)
        .mockRejectedValueOnce(mongoDupError);

      const user2Id = new Types.ObjectId().toString();
      const bookingDto = {
        partnerId,
        serviceId,
        startsAt: "2026-09-01T10:00:00.000Z",
      };

      const results = await Promise.allSettled([
        service.book(userId, bookingDto),
        service.book(user2Id, bookingDto),
      ]);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      const rejectedReason = (rejected[0] as PromiseRejectedResult).reason;
      expect(rejectedReason.message).toBe(
        "This time slot is no longer available. Please choose another.",
      );
    });

    it("should reject booking for an inactive partner", async () => {
      mockPartnerModel.findOne.mockReturnValue(chainable(null));

      await expect(
        service.book(userId, {
          partnerId,
          serviceId,
          startsAt: "2026-09-01T10:00:00.000Z",
        }),
      ).rejects.toThrow("Partner not found");
    });
  });

  describe("cancel", () => {
    it("should cancel an appointment owned by the user", async () => {
      const mockAppointment = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        partnerId: new Types.ObjectId(partnerId),
        serviceId: new Types.ObjectId(serviceId),
        status: "confirmed",
        statusHistory: [],
        notes: null,
        save: jest.fn().mockResolvedValue(true),
      };
      mockAppointmentModel.findById.mockResolvedValue(mockAppointment);

      await service.cancel(userId, mockAppointment._id.toString());

      expect(mockAppointment.status).toBe("cancelled");
      expect(mockAppointment.save).toHaveBeenCalled();
    });

    it("should reject cancellation of another user's appointment", async () => {
      const mockAppointment = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(), // Different user
        partnerId: new Types.ObjectId(partnerId),
        serviceId: new Types.ObjectId(serviceId),
        status: "confirmed",
      };
      mockAppointmentModel.findById.mockResolvedValue(mockAppointment);

      await expect(
        service.cancel(userId, mockAppointment._id.toString()),
      ).rejects.toThrow("You can only cancel your own appointments.");
    });

    it("should reject cancelling an already-cancelled appointment", async () => {
      const mockAppointment = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        partnerId: new Types.ObjectId(partnerId),
        serviceId: new Types.ObjectId(serviceId),
        status: "cancelled",
      };
      mockAppointmentModel.findById.mockResolvedValue(mockAppointment);

      await expect(
        service.cancel(userId, mockAppointment._id.toString()),
      ).rejects.toThrow("already cancelled");
    });
  });

  describe("reschedule", () => {
    it("should reschedule to an available slot", async () => {
      const mockAppointment = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        partnerId: new Types.ObjectId(partnerId),
        serviceId: new Types.ObjectId(serviceId),
        specialistId: null,
        status: "confirmed",
        startsAt: new Date("2026-09-01T10:00:00.000Z"),
        endsAt: new Date("2026-09-01T10:30:00.000Z"),
        notes: null,
        statusHistory: [],
        save: jest.fn().mockResolvedValue(true),
      };
      mockAppointmentModel.findById.mockResolvedValue(mockAppointment);
      mockAvailabilityModel.findOne.mockReturnValue(chainable({ capacityPerSlot: 2 }));
      mockAppointmentModel.countDocuments.mockResolvedValue(0);

      const result = await service.reschedule(userId, mockAppointment._id.toString(), {
        startsAt: "2026-09-02T14:00:00.000Z",
      });

      expect(result.status).toBe("rescheduled");
      expect(mockAppointment.save).toHaveBeenCalled();
    });

    it("should reject rescheduling to a full slot", async () => {
      const mockAppointment = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        partnerId: new Types.ObjectId(partnerId),
        specialistId: null,
        status: "confirmed",
      };
      mockAppointmentModel.findById.mockResolvedValue(mockAppointment);
      mockAvailabilityModel.findOne.mockReturnValue(chainable({ capacityPerSlot: 1 }));
      mockAppointmentModel.countDocuments.mockResolvedValue(1);

      await expect(
        service.reschedule(userId, mockAppointment._id.toString(), {
          startsAt: "2026-09-02T14:00:00.000Z",
        }),
      ).rejects.toThrow("no longer available");
    });
  });

  describe("listMine", () => {
    it("should return appointments for the user", async () => {
      const mockDocs = [
        {
          _id: new Types.ObjectId(),
          partnerId: { slug: "test-partner", name: "Test", city: "Dubai" },
          serviceId: { slug: "test-service", name: { en: "Test" }, durationMinutes: 30 },
          startsAt: new Date(),
          endsAt: new Date(),
          status: "confirmed",
          notes: null,
          createdAt: new Date(),
        },
      ];

      mockAppointmentModel.find.mockReturnValue(chainable(mockDocs));

      const result = await service.listMine(userId);

      expect(result).toHaveLength(1);
      expect(result[0]?.partner.slug).toBe("test-partner");
    });
  });
});
