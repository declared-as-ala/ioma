import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

// Mirrors packages/validation/src/auth.ts registerSchema exactly — see CLAUDE.md.
export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10, { message: "Password must be at least 10 characters" })
  @Matches(/[A-Z]/, { message: "Password must contain an uppercase letter" })
  @Matches(/[a-z]/, { message: "Password must contain a lowercase letter" })
  @Matches(/[0-9]/, { message: "Password must contain a number" })
  password!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ required: false, enum: ["en", "fr", "ar"] })
  @IsOptional()
  @IsIn(["en", "fr", "ar"])
  locale?: string;
}
