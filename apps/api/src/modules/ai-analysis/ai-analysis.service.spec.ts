import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { getQueueToken } from "@nestjs/bullmq";
import { Test } from "@nestjs/testing";
import { Types } from "mongoose";
import { AiAnalysisService } from "./ai-analysis.service";
import { AiConsent } from "./schemas/ai-consent.schema";
import { AiAnalysis } from "./schemas/ai-analysis.schema";
import { Product } from "../catalog/schemas/product.schema";
import { DocumentsService } from "../documents/documents.service";
import { AI_ANALYSIS_QUEUE } from "./ai-analysis.constants";

const VALID_IMAGE = {
  buffer: Buffer.from("fake-image-bytes"),
  mimetype: "image/png",
  size: 1024,
};

const FAKE_USER_ID = new Types.ObjectId().toString();

describe("AiAnalysisService consent gating", () => {
  let service: AiAnalysisService;
  let consentModel: { findOne: jest.Mock; create: jest.Mock; updateMany: jest.Mock };
  let analysisModel: { create: jest.Mock; findById: jest.Mock };
  let documentsService: { create: jest.Mock; remove: jest.Mock; getBytes: jest.Mock };
  let queue: { add: jest.Mock };

  beforeEach(async () => {
    consentModel = {
      findOne: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn().mockResolvedValue(undefined),
    };
    analysisModel = {
      create: jest.fn(),
      findById: jest.fn(),
    };
    documentsService = {
      create: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      getBytes: jest.fn(),
    };
    queue = { add: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AiAnalysisService,
        { provide: getModelToken(AiConsent.name), useValue: consentModel },
        { provide: getModelToken(AiAnalysis.name), useValue: analysisModel },
        {
          provide: getModelToken(Product.name),
          useValue: {
            find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
          },
        },
        { provide: DocumentsService, useValue: documentsService },
        { provide: getQueueToken(AI_ANALYSIS_QUEUE), useValue: queue },
      ],
    }).compile();

    service = moduleRef.get(AiAnalysisService);
  });

  it("rejects submission with no consent record at all", async () => {
    consentModel.findOne.mockReturnValue({ sort: jest.fn().mockResolvedValue(null) });

    await expect(service.submit(FAKE_USER_ID, VALID_IMAGE)).rejects.toThrow(
      ForbiddenException,
    );
    expect(analysisModel.create).not.toHaveBeenCalled();
    expect(queue.add).not.toHaveBeenCalled();
  });

  it("rejects submission when every consent record for the user has been withdrawn", async () => {
    // The query itself filters withdrawnAt: null, so a withdrawn-only
    // history correctly resolves to no active consent found.
    consentModel.findOne.mockReturnValue({ sort: jest.fn().mockResolvedValue(null) });

    await expect(service.submit(FAKE_USER_ID, VALID_IMAGE)).rejects.toThrow(
      ForbiddenException,
    );
    expect(consentModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ withdrawnAt: null }),
    );
  });

  it("proceeds to create an analysis and enqueue a job when an active consent exists", async () => {
    const consentId = new Types.ObjectId();
    consentModel.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue({ _id: consentId }),
    });
    const analysisId = new Types.ObjectId();
    const created = { _id: analysisId, save: jest.fn().mockResolvedValue(undefined) };
    analysisModel.create.mockResolvedValue(created);
    documentsService.create.mockResolvedValue({ _id: new Types.ObjectId() });
    // getById re-fetches via a separate query chain not under test here.
    jest
      .spyOn(service, "getById")
      .mockResolvedValue({ id: analysisId.toString() } as never);

    await service.submit(FAKE_USER_ID, VALID_IMAGE);

    expect(analysisModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ status: "queued", consentId }),
    );
    expect(queue.add).toHaveBeenCalledWith("analyze", {
      analysisId: analysisId.toString(),
    });
  });

  it("rejects an unsupported image mime type before ever checking consent", async () => {
    await expect(
      service.submit(FAKE_USER_ID, {
        buffer: Buffer.from("x"),
        mimetype: "application/pdf",
        size: 10,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(consentModel.findOne).not.toHaveBeenCalled();
  });

  it("rejects an oversized image before ever checking consent", async () => {
    await expect(
      service.submit(FAKE_USER_ID, {
        buffer: Buffer.from("x"),
        mimetype: "image/png",
        size: 50 * 1024 * 1024,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(consentModel.findOne).not.toHaveBeenCalled();
  });
});

describe("AiAnalysisService ownership", () => {
  let service: AiAnalysisService;
  let analysisModel: { findById: jest.Mock };

  beforeEach(async () => {
    analysisModel = { findById: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AiAnalysisService,
        { provide: getModelToken(AiConsent.name), useValue: {} },
        { provide: getModelToken(AiAnalysis.name), useValue: analysisModel },
        {
          provide: getModelToken(Product.name),
          useValue: {
            find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
          },
        },
        { provide: DocumentsService, useValue: {} },
        { provide: getQueueToken(AI_ANALYSIS_QUEUE), useValue: { add: jest.fn() } },
      ],
    }).compile();

    service = moduleRef.get(AiAnalysisService);
  });

  it("rejects deleting another user's analysis", async () => {
    analysisModel.findById.mockResolvedValue({
      userId: { toString: () => "different-user-id" },
      deletedAt: null,
    });

    await expect(service.remove("analysis-1", "owner-user-id")).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("throws NotFoundException when the analysis does not exist", async () => {
    analysisModel.findById.mockResolvedValue(null);

    await expect(service.remove("missing-id", "owner-user-id")).rejects.toThrow(
      NotFoundException,
    );
  });
});
