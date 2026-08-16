import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsIn, IsString, ValidateNested } from "class-validator";
import { DIAGNOSIS_QUESTION_KEYS } from "@ioma/config";

export class DiagnosisAnswerDto {
  @ApiProperty({ enum: DIAGNOSIS_QUESTION_KEYS })
  @IsIn(DIAGNOSIS_QUESTION_KEYS)
  questionKey!: (typeof DIAGNOSIS_QUESTION_KEYS)[number];

  @ApiProperty()
  @IsString()
  value!: string;
}

export class SubmitStandardDiagnosisDto {
  @ApiProperty({ type: [DiagnosisAnswerDto] })
  @ValidateNested({ each: true })
  @Type(() => DiagnosisAnswerDto)
  @ArrayMinSize(DIAGNOSIS_QUESTION_KEYS.length)
  answers!: DiagnosisAnswerDto[];
}
