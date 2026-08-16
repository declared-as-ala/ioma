import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common";
import { Types } from "mongoose";
import { ProtocolsService } from "./protocols.service";
import { Protocol } from "./schemas/protocol.schema";
import { DocumentsService } from "../documents/documents.service";

describe("ProtocolsService", () => {
  let service: ProtocolsService;
  let protocolModel: any;
  let documentsService: any;

  beforeEach(async () => {
    protocolModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn(),
    };

    documentsService = {
      getSignedUrl: jest
        .fn()
        .mockResolvedValue("https://minio.ioma-paris.ae/ioma-private/signed-doc.pdf"),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProtocolsService,
        { provide: getModelToken(Protocol.name), useValue: protocolModel },
        { provide: DocumentsService, useValue: documentsService },
      ],
    }).compile();

    service = module.get<ProtocolsService>(ProtocolsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getProtocolBySlug", () => {
    it("should throw NotFoundException if protocol not found", async () => {
      protocolModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getProtocolBySlug("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should return protocol with signed document URLs", async () => {
      const pdfId = new Types.ObjectId();
      const mockProto = {
        _id: new Types.ObjectId(),
        slug: "hydra-facial-protocol",
        title: {
          en: "Hydra Facial Protocol",
          fr: "Protocole Hydra",
          ar: "بروتوكول الهيدرا",
        },
        description: { en: "Hydra Description", fr: "Description", ar: "الوصف" },
        category: "facial",
        applicableRangeKeys: ["HYDRA"],
        durationMinutes: 45,
        isPublished: true,
        pdfDocumentId: pdfId,
        videoDocumentId: null,
      };

      protocolModel.findOne.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockProto),
      });

      const result = await service.getProtocolBySlug("hydra-facial-protocol");

      expect(result.slug).toBe("hydra-facial-protocol");
      expect(result.pdfUrl).toBe(
        "https://minio.ioma-paris.ae/ioma-private/signed-doc.pdf",
      );
      expect(documentsService.getSignedUrl).toHaveBeenCalled();
    });
  });
});
