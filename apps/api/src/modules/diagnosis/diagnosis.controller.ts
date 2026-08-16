import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { OptionalUser } from "../auth/decorators/optional-user.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { DiagnosisService } from "./diagnosis.service";
import { SubmitStandardDiagnosisDto } from "./dto/submit-standard-diagnosis.dto";

@ApiTags("diagnosis")
@Controller("diagnosis/standard")
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  submit(
    @OptionalUser() user: JwtPayload | undefined,
    @Body() dto: SubmitStandardDiagnosisDto,
  ) {
    return this.diagnosisService.submitStandard({ userId: user?.sub }, dto.answers);
  }

  @Get("mine")
  @UseGuards(JwtAuthGuard)
  listMine(@CurrentUser() user: JwtPayload) {
    return this.diagnosisService.listMine(user.sub);
  }

  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  getById(@OptionalUser() user: JwtPayload | undefined, @Param("id") id: string) {
    return this.diagnosisService.getById(id, { userId: user?.sub });
  }
}
