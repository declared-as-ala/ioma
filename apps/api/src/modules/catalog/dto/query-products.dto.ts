import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import type { ProductRangeKey } from "@ioma/config";

export class QueryProductsDto {
  @ApiPropertyOptional({
    enum: ["hydra", "energize", "renew", "calm", "purete", "matte", "illumine"],
  })
  @IsOptional()
  @IsIn(["hydra", "energize", "renew", "calm", "purete", "matte", "illumine"])
  range?: ProductRangeKey;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  concern?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;
}
