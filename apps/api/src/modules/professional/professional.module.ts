import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import {
  ProfessionalApplication,
  ProfessionalApplicationSchema,
} from "./schemas/professional-application.schema";
import {
  ProfessionalProfile,
  ProfessionalProfileSchema,
} from "./schemas/professional-profile.schema";
import { PriceList, PriceListSchema } from "./schemas/price-list.schema";
import { ProfessionalService } from "./professional.service";
import { ProfessionalController } from "./professional.controller";
import { UsersModule } from "../users/users.module";
import { DocumentsModule } from "../documents/documents.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProfessionalApplication.name, schema: ProfessionalApplicationSchema },
      { name: ProfessionalProfile.name, schema: ProfessionalProfileSchema },
      { name: PriceList.name, schema: PriceListSchema },
    ]),
    PassportModule,
    UsersModule,
    DocumentsModule,
  ],
  controllers: [ProfessionalController],
  providers: [ProfessionalService],
  exports: [MongooseModule, ProfessionalService],
})
export class ProfessionalModule {}
