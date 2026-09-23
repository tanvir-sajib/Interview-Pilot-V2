import { Injectable, Inject } from "@nestjs/common";
import { IPaymentProvider } from "./interfaces/ipayment-provider.interface";

@Injectable()
export class PaymentsService {
  constructor(@Inject('PAYMENT_PROVIDER') private readonly paymentProvider: IPaymentProvider) {}

  async createPayment(amount: number, currency: string, metadata?: Record<string, any>) {
    return this.paymentProvider.createPayment(amount, currency, metadata);
  }

  async verifyPayment(providerPaymentId: string) {
    return this.paymentProvider.verifyPayment(providerPaymentId);
  }

  async handleWebhook(payload: any, signature: string) {
    return this.paymentProvider.handleWebhook(payload, signature);
  }

  // TODO: implement other payment‑related business logic
}
