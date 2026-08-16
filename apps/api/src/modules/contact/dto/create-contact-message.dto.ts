import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn, IsString, MaxLength, MinLength } from "class-validator";

// Mirrors packages/validation/src/contact.ts — see CLAUDE.md.
export class CreateContactMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  subject!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;

  @ApiProperty({ enum: ["en", "fr", "ar"] })
  @IsIn(["en", "fr", "ar"])
  locale!: string;
}
