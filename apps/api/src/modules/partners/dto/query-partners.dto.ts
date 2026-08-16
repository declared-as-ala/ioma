import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumber, IsOptional, IsString } from "class-validator";

const PARTNER_TYPES = [
  "spa",
  "clinic",
  "beauty_institute",
  "hotel",
  "retail",
  "diagnostic_center",
  "distributor",
] as const;

export class QueryPartnersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emirate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ enum: PARTNER_TYPES })
  @IsOptional()
  @IsIn(PARTNER_TYPES)
  type?: (typeof PARTNER_TYPES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional()
  @IsOptional()
  diagnosisAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  radius?: number; // meters
}
