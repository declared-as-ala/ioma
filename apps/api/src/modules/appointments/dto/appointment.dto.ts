import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateAppointmentDto {
  @ApiProperty()
  @IsMongoId()
  partnerId!: string;

  @ApiProperty()
  @IsMongoId()
  serviceId!: string;

  @ApiProperty()
  @IsDateString()
  startsAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  specialistId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  diagnosisId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  treatmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RescheduleAppointmentDto {
  @ApiProperty()
  @IsDateString()
  startsAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CancelAppointmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
