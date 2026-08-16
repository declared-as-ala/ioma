import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";
import { EMIRATES } from "@ioma/config";

const EMIRATE_CODES = EMIRATES.map((e) => e.code);

export class UpsertAddressDto {
  @ApiProperty({ enum: ["shipping", "billing"] })
  @IsIn(["shipping", "billing"])
  type!: "shipping" | "billing";

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  label!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  fullName!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  line1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  line2?: string;

  @ApiProperty({ enum: EMIRATE_CODES })
  @IsIn(EMIRATE_CODES)
  emirate!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  city!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
