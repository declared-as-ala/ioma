import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Protocol, ProtocolDocument } from "./schemas/protocol.schema";
import { DocumentsService } from "../documents/documents.service";

export interface ProtocolResponse {
  _id: string;
  slug: string;
  title: { en: string; fr: string; ar: string };
  description: { en: string; fr: string; ar: string };
  category: string;
  applicableRangeKeys: string[];
  durationMinutes: number;
  isPublished: boolean;
  pdfUrl: string | null;
  videoUrl: string | null;
}

@Injectable()
export class ProtocolsService {
  constructor(
    @InjectModel(Protocol.name)
    private readonly protocolModel: Model<ProtocolDocument>,
    private readonly documentsService: DocumentsService,
  ) {}

  async listProtocols(category?: string, rangeKey?: string): Promise<ProtocolResponse[]> {
    const filter: Record<string, any> = { isPublished: true };
    if (category) filter.category = category;
    if (rangeKey) filter.applicableRangeKeys = rangeKey;

    const protocols = await this.protocolModel.find(filter).sort({ slug: 1 }).lean();

    return Promise.all(
      protocols.map(async (proto) => {
        const pdfUrl = proto.pdfDocumentId
          ? await this.documentsService.getSignedUrl(
              new Types.ObjectId(proto.pdfDocumentId),
            )
          : null;
        const videoUrl = proto.videoDocumentId
          ? await this.documentsService.getSignedUrl(
              new Types.ObjectId(proto.videoDocumentId),
            )
          : null;

        return {
          _id: proto._id.toString(),
          slug: proto.slug,
          title: proto.title,
          description: proto.description,
          category: proto.category,
          applicableRangeKeys: proto.applicableRangeKeys,
          durationMinutes: proto.durationMinutes,
          isPublished: proto.isPublished,
          pdfUrl,
          videoUrl,
        };
      }),
    );
  }

  async getProtocolBySlug(slug: string): Promise<ProtocolResponse> {
    const proto = await this.protocolModel.findOne({ slug, isPublished: true }).lean();
    if (!proto) throw new NotFoundException("Protocol not found.");

    const pdfUrl = proto.pdfDocumentId
      ? await this.documentsService.getSignedUrl(new Types.ObjectId(proto.pdfDocumentId))
      : null;
    const videoUrl = proto.videoDocumentId
      ? await this.documentsService.getSignedUrl(
          new Types.ObjectId(proto.videoDocumentId),
        )
      : null;

    return {
      _id: proto._id.toString(),
      slug: proto.slug,
      title: proto.title,
      description: proto.description,
      category: proto.category,
      applicableRangeKeys: proto.applicableRangeKeys,
      durationMinutes: proto.durationMinutes,
      isPublished: proto.isPublished,
      pdfUrl,
      videoUrl,
    };
  }
}
