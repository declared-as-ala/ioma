import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BullModule } from "@nestjs/bullmq";
import { AiConsent, AiConsentSchema } from "./schemas/ai-consent.schema";
import { AiAnalysis, AiAnalysisSchema } from "./schemas/ai-analysis.schema";
import { CatalogModule } from "../catalog/catalog.module";
import { DocumentsModule } from "../documents/documents.module";
import { AiAnalysisService } from "./ai-analysis.service";
import { AiAnalysisController } from "./ai-analysis.controller";
import { AiAnalysisProcessor } from "./processors/ai-analysis.processor";
import { AI_PROVIDER } from "./providers/ai-provider.interface";
import { MockAIProvider } from "./providers/mock-ai.provider";
import { AI_ANALYSIS_QUEUE } from "./ai-analysis.constants";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiConsent.name, schema: AiConsentSchema },
      { name: AiAnalysis.name, schema: AiAnalysisSchema },
    ]),
    BullModule.registerQueue({ name: AI_ANALYSIS_QUEUE }),
    CatalogModule,
    DocumentsModule,
  ],
  providers: [
    AiAnalysisService,
    AiAnalysisProcessor,
    // AI_PROVIDER=mock is the only implementation until a real vision-AI
    // vendor is selected — see ENVIRONMENT.md / CLIENT_REQUIREMENTS.md.
    // Swapping providers touches only this binding.
    { provide: AI_PROVIDER, useClass: MockAIProvider },
  ],
  controllers: [AiAnalysisController],
})
export class AiAnalysisModule {}
