import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import type { Job } from "bullmq";
import { AiAnalysis, AiAnalysisDocument } from "../schemas/ai-analysis.schema";
import { Product, ProductDocument } from "../../catalog/schemas/product.schema";
import {
  ProductVariant,
  ProductVariantDocument,
} from "../../catalog/schemas/product-variant.schema";
import {
  ProductRange,
  ProductRangeDocument,
} from "../../catalog/schemas/product-range.schema";
import { buildRoutineForRange } from "../../catalog/routine-builder";
import { DocumentsService } from "../../documents/documents.service";
import { AI_PROVIDER, type AIProvider } from "../providers/ai-provider.interface";
import { recommendRangeFromIndicators } from "../ai-analysis-rules";
import { AI_ANALYSIS_JOB, AI_ANALYSIS_QUEUE } from "../ai-analysis.constants";

interface AnalyzeJobData {
  analysisId: string;
}

@Processor(AI_ANALYSIS_QUEUE)
export class AiAnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AiAnalysisProcessor.name);

  constructor(
    @InjectModel(AiAnalysis.name)
    private readonly analysisModel: Model<AiAnalysisDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
    @InjectModel(ProductRange.name)
    private readonly rangeModel: Model<ProductRangeDocument>,
    private readonly documentsService: DocumentsService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
  ) {
    super();
  }

  async process(job: Job<AnalyzeJobData>): Promise<void> {
    if (job.name !== AI_ANALYSIS_JOB) return;

    const analysis = await this.analysisModel.findById(job.data.analysisId);
    if (!analysis || analysis.status !== "queued" || !analysis.imageDocumentId) {
      this.logger.warn(
        `Skipping job for analysis ${job.data.analysisId}: not in a processable state.`,
      );
      return;
    }

    analysis.status = "processing";
    await analysis.save();

    try {
      const { data, mimeType } = await this.documentsService.getBytes(
        analysis.imageDocumentId,
      );
      const result = await this.aiProvider.analyze({ imageBuffer: data, mimeType });
      const recommendation = recommendRangeFromIndicators(result.indicators);
      const range = await this.rangeModel.findOne({ slug: recommendation.range });
      if (!range) {
        throw new Error(
          `Recommended range slug "${recommendation.range}" has no matching ProductRange document.`,
        );
      }
      const { morningRoutine, eveningRoutine } = await buildRoutineForRange(
        this.productModel,
        this.variantModel,
        range._id,
      );

      analysis.indicators = result.indicators;
      analysis.isSimulated = result.isSimulated;
      analysis.resultVersion = "v1";
      analysis.recommendedRangeId = range._id;
      analysis.morningRoutine = morningRoutine;
      analysis.eveningRoutine = eveningRoutine;
      analysis.status = "completed";
      await analysis.save();
    } catch (err) {
      this.logger.error(
        `Analysis ${analysis._id.toString()} failed: ${(err as Error).message}`,
      );
      analysis.status = "failed";
      analysis.failureReason = (err as Error).message;
      await analysis.save();
    }
  }
}
