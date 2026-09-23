import { Module } from "@nestjs/common";
import { MockPaymentProvider } from "./mock-payment.provider";
import { IPaymentProvider } from "./interfaces/ipayment-provider.interface";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, { provide: 'PAYMENT_PROVIDER', useClass: MockPaymentProvider }],
})
export class PaymentsModule {}
