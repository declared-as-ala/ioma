import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuditLog, AuditLogDocument } from "./schemas/audit-log.schema";

export interface RecordAuditParams {
  actorId: Types.ObjectId | string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export interface AuditLogItem {
  _id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

export interface AuditLogListResponse {
  items: AuditLogItem[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditModel: Model<AuditLogDocument>,
  ) {}

  async recordEvent(params: RecordAuditParams): Promise<AuditLogDocument> {
    return this.auditModel.create({
      actorId: new Types.ObjectId(params.actorId),
      actorEmail: params.actorEmail,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details,
      ipAddress: params.ipAddress,
    });
  }

  async listAuditLogs(query?: {
    action?: string;
    resource?: string;
    actorEmail?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLogListResponse> {
    const filter: Record<string, any> = {};
    if (query?.action) filter.action = query.action;
    if (query?.resource) filter.resource = query.resource;
    if (query?.actorEmail) {
      filter.actorEmail = { $regex: query.actorEmail, $options: "i" };
    }

    const limit = query?.limit ?? 50;
    const offset = query?.offset ?? 0;

    const [items, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean(),
      this.auditModel.countDocuments(filter),
    ]);

    return {
      items: items.map((item) => ({
        _id: item._id.toString(),
        actorId: item.actorId.toString(),
        actorEmail: item.actorEmail,
        action: item.action,
        resource: item.resource,
        resourceId: item.resourceId,
        details: item.details,
        ipAddress: item.ipAddress,
        createdAt: (item as any).createdAt || new Date(),
      })),
      total,
      limit,
      offset,
    };
  }
}
