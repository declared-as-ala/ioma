import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { PartnersService } from "./partners.service";
import { Partner } from "./schemas/partner.schema";
import { Service } from "./schemas/service.schema";
import { Treatment } from "./schemas/treatment.schema";

describe("PartnersService", () => {
  let service: PartnersService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPartnerModel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockServiceModel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockTreatmentModel: any;

  beforeEach(async () => {
    mockPartnerModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      aggregate: jest.fn(),
    };
    mockServiceModel = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    mockTreatmentModel = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnersService,
        { provide: getModelToken(Partner.name), useValue: mockPartnerModel },
        { provide: getModelToken(Service.name), useValue: mockServiceModel },
        { provide: getModelToken(Treatment.name), useValue: mockTreatmentModel },
      ],
    }).compile();

    service = module.get<PartnersService>(PartnersService);
  });

  describe("listPartners", () => {
    it("should return active partners", async () => {
      const mockDocs = [
        {
          _id: new Types.ObjectId(),
          slug: "test-partner",
          name: "Test Partner",
          type: "spa",
          emirate: "DXB",
          city: "Dubai",
          address: "123 Test St",
          coordinates: { lat: 25.2, lng: 55.3 },
          phone: "+971-4-XXX-XXXX",
          diagnosisAvailable: true,
          description: { en: "Test", fr: "Test", ar: "Test" },
          serviceIds: [
            { slug: "test-service", name: { en: "Test" }, durationMinutes: 30 },
          ],
        },
      ];

      const mockPopulate = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDocs),
      };
      mockPartnerModel.find.mockReturnValue(mockPopulate);

      const result = await service.listPartners({});

      expect(result).toHaveLength(1);
      expect(result[0]?.slug).toBe("test-partner");
    });

    it("should filter by emirate", async () => {
      const mockPopulate = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      };
      mockPartnerModel.find.mockReturnValue(mockPopulate);

      await service.listPartners({ emirate: "DXB" });

      expect(mockPartnerModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ emirate: "DXB" }),
      );
    });
  });

  describe("getPartnerBySlug", () => {
    it("should return a partner by slug", async () => {
      const mockDoc = {
        _id: new Types.ObjectId(),
        slug: "test-partner",
        name: "Test Partner",
        type: "spa",
        emirate: "DXB",
        city: "Dubai",
        address: "123 Test St",
        coordinates: { lat: 25.2, lng: 55.3 },
        phone: "+971-4-XXX-XXXX",
        whatsapp: null,
        email: null,
        diagnosisAvailable: true,
        description: { en: "Test", fr: "Test", ar: "Test" },
        mediaIds: [],
        serviceIds: [
          {
            _id: new Types.ObjectId(),
            slug: "test-service",
            name: { en: "Test" },
            durationMinutes: 30,
            category: "diagnosis",
          },
        ],
      };

      const mockPopulate = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDoc),
      };
      mockPartnerModel.findOne.mockReturnValue(mockPopulate);

      const result = await service.getPartnerBySlug("test-partner");

      expect(result.slug).toBe("test-partner");
      expect(result.services).toHaveLength(1);
    });

    it("should throw NotFoundException for unknown slug", async () => {
      const mockPopulate = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      };
      mockPartnerModel.findOne.mockReturnValue(mockPopulate);

      await expect(service.getPartnerBySlug("unknown")).rejects.toThrow(
        "Partner not found",
      );
    });
  });

  describe("listServices", () => {
    it("should return all services sorted by slug", async () => {
      const mockDocs = [
        {
          slug: "diagnosis",
          name: { en: "Diagnosis" },
          durationMinutes: 30,
          category: "diagnosis",
        },
        {
          slug: "facial",
          name: { en: "Facial" },
          durationMinutes: 60,
          category: "treatment",
        },
      ];
      const mockSort = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockDocs),
      };
      mockServiceModel.find.mockReturnValue(mockSort);

      const result = await service.listServices();

      expect(result).toHaveLength(2);
      expect(mockSort.sort).toHaveBeenCalledWith({ slug: 1 });
    });
  });
});
