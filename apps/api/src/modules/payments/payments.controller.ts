import { Controller, Post, Body, Headers, BadRequestException } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  async create(@Body() body: { amount: number; currency: string; metadata?: Record<string, any> }) {
    const { amount, currency, metadata } = body;
    return this.paymentsService.createPayment(amount, currency, metadata);
  }

  @Post('webhook')
  async webhook(@Body() payload: any, @Headers('x-signature') signature: string) {
    if (!signature) {
      throw new BadRequestException('Missing signature');
    }
    try {
      await this.paymentsService.handleWebhook(payload, signature);
    } catch (e) {
      // Propagate signature errors as BadRequest for clarity.
      throw new BadRequestException(e.message);
    }
    return { received: true };
  }
}
