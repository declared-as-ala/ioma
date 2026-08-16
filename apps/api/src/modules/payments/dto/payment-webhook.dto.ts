import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

// Mock-provider webhook shape. A real provider's webhook DTO would instead
// be whatever that provider sends, verified via HMAC signature header
// before this DTO is ever parsed — see SECURITY.md.
export class PaymentWebhookDto {
  @ApiProperty()
  @IsString()
  idempotencyKey!: string;

  @ApiProperty()
  @IsString()
  eventId!: string;

  @ApiProperty({ enum: ["succeeded", "failed"] })
  @IsIn(["succeeded", "failed"])
  status!: "succeeded" | "failed";

  @ApiProperty()
  @IsString()
  providerReference!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  failureReason?: string;
}
