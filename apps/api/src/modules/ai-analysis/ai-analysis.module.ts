import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
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
import { GeminiAIProvider } from "./providers/gemini-ai.provider";
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
    ConfigModule,
  ],
  providers: [
    AiAnalysisService,
    AiAnalysisProcessor,
    GeminiAIProvider,
    MockAIProvider,
    {
      provide: AI_PROVIDER,
      useFactory: (
        configService: ConfigService,
        geminiProvider: GeminiAIProvider,
        mockProvider: MockAIProvider,
      ) => {
        const providerName = configService.get<string>("AI_PROVIDER");
        const hasGeminiKey =
          !!configService.get<string>("AI_PROVIDER_API_KEY") ||
          !!configService.get<string>("GEMINI_API_KEY");

        if (providerName === "gemini" || hasGeminiKey) {
          return geminiProvider;
        }
        return mockProvider;
      },
      inject: [ConfigService, GeminiAIProvider, MockAIProvider],
    },
  ],
  controllers: [AiAnalysisController],
})
export class AiAnalysisModule {}
