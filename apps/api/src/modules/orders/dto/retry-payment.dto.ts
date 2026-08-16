import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class RetryPaymentDto {
  @ApiProperty({ enum: ["mock_success", "mock_failure"] })
  @IsIn(["mock_success", "mock_failure"])
  paymentMethod!: "mock_success" | "mock_failure";
}
