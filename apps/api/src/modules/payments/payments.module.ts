import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Payment, PaymentSchema } from "./schemas/payment.schema";
import { PAYMENT_PROVIDER } from "./providers/payment-provider.interface";
import { MockPaymentProvider } from "./providers/mock-payment.provider";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";

// Provider selection point: PAYMENT_PROVIDER always resolves to
// MockPaymentProvider today (env var `PAYMENT_PROVIDER=mock`, see
// ENVIRONMENT.md) — swapping in a real gateway later means adding a real
// provider class and changing only the line below, never OrdersService or
// PaymentsController.
@Module({
  imports: [MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }])],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    { provide: PAYMENT_PROVIDER, useClass: MockPaymentProvider },
  ],
  exports: [MongooseModule, PaymentsService],
})
export class PaymentsModule {}
