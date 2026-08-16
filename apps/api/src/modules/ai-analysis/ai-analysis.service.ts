import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { Model, Types } from "mongoose";
import { createHash } from "crypto";
import { ALLOWED_AI_IMAGE_MIME_TYPES, MAX_AI_IMAGE_SIZE_BYTES } from "@ioma/config";
import {
  AiConsent,
  AiConsentDocument,
  CURRENT_AI_CONSENT_VERSION,
} from "./schemas/ai-consent.schema";
import { AiAnalysis, AiAnalysisDocument } from "./schemas/ai-analysis.schema";
import { Product, ProductDocument } from "../catalog/schemas/product.schema";
import { DocumentsService } from "../documents/documents.service";
import { AI_ANALYSIS_JOB, AI_ANALYSIS_QUEUE } from "./ai-analysis.constants";

interface PopulatedVariant {
  _id: Types.ObjectId;
  sku: string;
  size: string;
  b2cPriceMinor: number;
  productId: Types.ObjectId;
}

// Server-enforced allow-list + size cap — see CLAUDE.md/SECURITY.md "File
// uploads: type allow-list + size limit enforced server-side", never left
// to client-side validation alone. Shared with the frontend via
// @ioma/config so both sides agree on the exact same rule.
export const ALLOWED_IMAGE_MIME_TYPES: readonly string[] = ALLOWED_AI_IMAGE_MIME_TYPES;
export const MAX_IMAGE_SIZE_BYTES = MAX_AI_IMAGE_SIZE_BYTES;

export interface UploadedImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Injectable()
export class AiAnalysisService {
  constructor(
    @InjectModel(AiConsent.name) private readonly consentModel: Model<AiConsentDocument>,
    @InjectModel(AiAnalysis.name)
    private readonly analysisModel: Model<AiAnalysisDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    private readonly documentsService: DocumentsService,
    @InjectQueue(AI_ANALYSIS_QUEUE) private readonly queue: Queue,
  ) {}

  private hashIp(ipAddress: string): string {
    return createHash("sha256").update(ipAddress).digest("hex");
  }

  async recordConsent(userId: string, ipAddress: string) {
    return this.consentModel.create({
      userId: new Types.ObjectId(userId),
      consentedAt: new Date(),
      consentVersion: CURRENT_AI_CONSENT_VERSION,
      ipAddressHash: this.hashIp(ipAddress),
      withdrawnAt: null,
    });
  }

  async withdrawConsent(userId: string) {
    await this.consentModel.updateMany(
      { userId: new Types.ObjectId(userId), withdrawnAt: null },
      { $set: { withdrawnAt: new Date() } },
    );
  }

  private async getActiveConsent(userId: string): Promise<AiConsentDocument> {
    const consent = await this.consentModel
      .findOne({ userId: new Types.ObjectId(userId), withdrawnAt: null })
      .sort({ consentedAt: -1 });
    if (!consent) {
      // Server-side gate — see SECURITY.md "AIAnalysis requires a linked
      // AIConsent record before any image is accepted, enforced server-side,
      // not just gated by a UI checkbox."
      throw new ForbiddenException(
        "AI analysis requires a recorded, non-withdrawn consent.",
      );
    }
    return consent;
  }

  async submit(userId: string, image: UploadedImage) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(image.mimetype)) {
      throw new BadRequestException(
        `Unsupported image type "${image.mimetype}". Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}.`,
      );
    }
    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException(
        `Image exceeds the ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB limit.`,
      );
    }

    const consent = await this.getActiveConsent(userId);
    const userObjectId = new Types.ObjectId(userId);

    const analysis = await this.analysisModel.create({
      userId: userObjectId,
      consentId: consent._id,
      imageDocumentId: null,
      provider: "mock",
      status: "queued",
      indicators: null,
      isSimulated: true,
    });

    const extension =
      image.mimetype === "image/png"
        ? ".png"
        : image.mimetype === "image/webp"
          ? ".webp"
          : ".jpg";
    const document = await this.documentsService.create({
      bucket: "ioma-private",
      data: image.buffer,
      mimeType: image.mimetype,
      ownerType: "ai_analysis",
      ownerId: analysis._id,
      uploadedBy: userObjectId,
      extension,
    });

    analysis.imageDocumentId = document._id;
    await analysis.save();

    await this.queue.add(AI_ANALYSIS_JOB, { analysisId: analysis._id.toString() });

    return this.getById(analysis._id.toString(), userId);
  }

  async getById(id: string, userId: string) {
    const doc = await this.analysisModel
      .findById(id)
      .populate<{
        recommendedRangeId: { slug: string; name: Record<string, string> } | null;
      }>("recommendedRangeId")
      .populate<{ morningRoutine: PopulatedVariant[] }>("morningRoutine")
      .populate<{ eveningRoutine: PopulatedVariant[] }>("eveningRoutine")
      .lean();

    if (!doc) {
      throw new NotFoundException("Analysis not found.");
    }
    if (doc.userId.toString() !== userId) {
      throw new ForbiddenException("This analysis belongs to another account.");
    }

    // Map raw populated variants into the shared RoutineVariant shape
    // ({sku, size, priceMinor, name}) — mirrors DiagnosisService.getById,
    // which the frontend's RoutineList component is built against. Missed
    // on the first pass here (variants were returned raw, with
    // `b2cPriceMinor` and no `name`), which crashed the results page with
    // `variant.name[locale]` reading a property off `undefined` — caught
    // by the Sprint 6 Playwright suite, not a manual check.
    const productIds = [...doc.morningRoutine, ...doc.eveningRoutine].map(
      (v) => v.productId,
    );
    const products = await this.productModel.find({ _id: { $in: productIds } }).lean();
    const nameFor = (productId: Types.ObjectId) =>
      products.find((p) => p._id.toString() === productId.toString())?.name;
    const mapVariant = (v: PopulatedVariant) => ({
      sku: v.sku,
      size: v.size,
      priceMinor: v.b2cPriceMinor,
      name: nameFor(v.productId),
    });

    return {
      id: doc._id.toString(),
      status: doc.status,
      isSimulated: doc.isSimulated,
      indicators: doc.indicators,
      range: doc.recommendedRangeId
        ? { slug: doc.recommendedRangeId.slug, name: doc.recommendedRangeId.name }
        : null,
      morningRoutine: doc.morningRoutine.map(mapVariant),
      eveningRoutine: doc.eveningRoutine.map(mapVariant),
      failureReason: doc.failureReason,
      createdAt: (doc as unknown as { createdAt?: Date }).createdAt ?? null,
    };
  }

  async listMine(userId: string) {
    const docs = await this.analysisModel
      .find({ userId: new Types.ObjectId(userId), deletedAt: null })
      .sort({ createdAt: -1 })
      .populate<{
        recommendedRangeId: { slug: string; name: Record<string, string> } | null;
      }>("recommendedRangeId")
      .lean();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      status: doc.status,
      range: doc.recommendedRangeId
        ? { slug: doc.recommendedRangeId.slug, name: doc.recommendedRangeId.name }
        : null,
      createdAt: (doc as unknown as { createdAt?: Date }).createdAt ?? null,
    }));
  }

  // Removes both the underlying MinIO object and the record's own sensitive
  // fields — not just a soft-delete flag left pointing at a live image. See
  // SECURITY.md "AI & Diagnosis Data" and SPRINTS.md Sprint 6 acceptance
  // criteria.
  async remove(id: string, userId: string): Promise<void> {
    const doc = await this.analysisModel.findById(id);
    if (!doc) {
      throw new NotFoundException("Analysis not found.");
    }
    if (doc.userId.toString() !== userId) {
      throw new ForbiddenException("This analysis belongs to another account.");
    }
    if (doc.deletedAt) {
      return;
    }

    if (doc.imageDocumentId) {
      await this.documentsService.remove(doc.imageDocumentId);
    }

    doc.imageDocumentId = null;
    doc.indicators = null;
    doc.deletedAt = new Date();
    await doc.save();
  }
}
