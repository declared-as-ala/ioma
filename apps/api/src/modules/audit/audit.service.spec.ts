import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { AuditService } from "./audit.service";
import { AuditLog } from "./schemas/audit-log.schema";

describe("AuditService", () => {
  let service: AuditService;
  let mockModel: any;

  const mockAuditRecord = {
    _id: new Types.ObjectId(),
    actorId: new Types.ObjectId(),
    actorEmail: "admin@ioma-dev.local",
    action: "product.created",
    resource: "product",
    resourceId: "prod_123",
    details: { name: "Cream" },
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockModel = {
      create: jest.fn().mockImplementation((data) => ({
        ...data,
        _id: new Types.ObjectId(),
      })),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([mockAuditRecord]),
      countDocuments: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getModelToken(AuditLog.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  it("should record an audit event", async () => {
    const actorId = new Types.ObjectId().toString();
    await service.recordEvent({
      actorId,
      actorEmail: "admin@ioma-dev.local",
      action: "order.status_updated",
      resource: "order",
      resourceId: "ord_999",
      details: { status: "shipped" },
    });

    expect(mockModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        actorEmail: "admin@ioma-dev.local",
        action: "order.status_updated",
        resource: "order",
        resourceId: "ord_999",
      }),
    );
  });

  it("should list audit logs with filters", async () => {
    const result = await service.listAuditLogs({
      action: "product.created",
      limit: 10,
      offset: 0,
    });

    expect(mockModel.find).toHaveBeenCalledWith(
      expect.objectContaining({ action: "product.created" }),
    );
    expect(result.total).toBe(1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.action).toBe("product.created");
  });
});
