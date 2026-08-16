import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { EMIRATES } from "@ioma/config";

const EMIRATE_CODES = EMIRATES.map((e) => e.code);

export class OrderAddressDto {
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

  @ApiProperty({ enum: EMIRATE_CODES })
  @IsIn(EMIRATE_CODES)
  emirate!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  city!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  addressLine1!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;
}
