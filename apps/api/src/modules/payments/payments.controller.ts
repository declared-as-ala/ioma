import { Body, Controller, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PaymentsService } from "./payments.service";
import { PaymentWebhookDto } from "./dto/payment-webhook.dto";

@ApiTags("payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // :provider is accepted (not just "mock") so a real provider's webhook
  // URL shape is already stable before that provider is wired in — see
  // SECURITY.md for the signature verification a real implementation adds
  // here before this DTO is trusted.
  @Post("webhook/:provider")
  handleWebhook(@Param("provider") _provider: string, @Body() dto: PaymentWebhookDto) {
    return this.paymentsService.handleProviderEvent(dto.idempotencyKey, {
      eventId: dto.eventId,
      status: dto.status,
      providerReference: dto.providerReference,
      failureReason: dto.failureReason,
    });
  }
}
