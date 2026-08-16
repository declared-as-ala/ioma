import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  DiagnosisRecommendation,
  DiagnosisRecommendationSchema,
} from "./schemas/diagnosis-recommendation.schema";
import {
  StandardDiagnosis,
  StandardDiagnosisSchema,
} from "./schemas/standard-diagnosis.schema";
import { CatalogModule } from "../catalog/catalog.module";
import { DiagnosisService } from "./diagnosis.service";
import { DiagnosisController } from "./diagnosis.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiagnosisRecommendation.name, schema: DiagnosisRecommendationSchema },
      { name: StandardDiagnosis.name, schema: StandardDiagnosisSchema },
    ]),
    CatalogModule,
  ],
  providers: [DiagnosisService],
  controllers: [DiagnosisController],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}
