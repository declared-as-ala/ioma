import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsIn } from "class-validator";

export class SubscribeNewsletterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ["en", "fr", "ar"] })
  @IsIn(["en", "fr", "ar"])
  locale!: string;
}
