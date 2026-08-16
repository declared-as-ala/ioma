import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PartnersService } from "./partners.service";
import { AvailabilityService } from "./availability.service";
import { QueryPartnersDto } from "./dto/query-partners.dto";
import { QueryAvailabilityDto } from "./dto/query-availability.dto";

@ApiTags("partners")
@Controller()
export class PartnersController {
  constructor(
    private readonly partnersService: PartnersService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Get("partners")
  listPartners(@Query() query: QueryPartnersDto) {
    return this.partnersService.listPartners(query);
  }

  @Get("partners/:slug")
  getPartner(@Param("slug") slug: string) {
    return this.partnersService.getPartnerBySlug(slug);
  }

  @Get("services")
  listServices() {
    return this.partnersService.listServices();
  }

  @Get("services/:slug")
  getService(@Param("slug") slug: string) {
    return this.partnersService.getServiceBySlug(slug);
  }

  @Get("treatments")
  listTreatments() {
    return this.partnersService.listTreatments();
  }

  @Get("treatments/:slug")
  getTreatment(@Param("slug") slug: string) {
    return this.partnersService.getTreatmentBySlug(slug);
  }

  @Get("availability/:resourceId/slots")
  getSlots(
    @Param("resourceId") resourceId: string,
    @Query() query: QueryAvailabilityDto,
  ) {
    const date = query.date ?? new Date().toISOString().slice(0, 10);
    return this.availabilityService.getAvailableSlots(resourceId, date);
  }
}
