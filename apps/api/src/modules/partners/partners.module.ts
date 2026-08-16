import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Partner, PartnerSchema } from "./schemas/partner.schema";
import { Service, ServiceSchema } from "./schemas/service.schema";
import { Treatment, TreatmentSchema } from "./schemas/treatment.schema";
import { Availability, AvailabilitySchema } from "./schemas/availability.schema";
import {
  Appointment,
  AppointmentSchema,
} from "../appointments/schemas/appointment.schema";
import { PartnersService } from "./partners.service";
import { AvailabilityService } from "./availability.service";
import { PartnersController } from "./partners.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Partner.name, schema: PartnerSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Treatment.name, schema: TreatmentSchema },
      { name: Availability.name, schema: AvailabilitySchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [PartnersController],
  providers: [PartnersService, AvailabilityService],
  exports: [PartnersService, AvailabilityService, MongooseModule],
})
export class PartnersModule {}
