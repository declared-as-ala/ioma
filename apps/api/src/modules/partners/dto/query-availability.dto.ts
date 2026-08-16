import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class QueryAvailabilityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD
}
