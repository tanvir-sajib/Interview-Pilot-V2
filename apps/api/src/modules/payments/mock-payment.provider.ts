import { Injectable } from "@nestjs/common";
import { IPaymentProvider } from "./interfaces/ipayment-provider.interface";

/**
 * Simple in‑memory mock implementation used for tests and local development.
 * It generates deterministic IDs and always reports successful verification.
 */
@Injectable()
export class MockPaymentProvider implements IPaymentProvider {
  private payments = new Map<string, { amount: number; currency: string }>();

  async createPayment(amount: number, currency: string, metadata?: Record<string, any>): Promise<{ providerPaymentId: string; checkoutUrl?: string }> {
    const providerPaymentId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.payments.set(providerPaymentId, { amount, currency });
    // In a real integration this would be a URL to redirect the user to.
    const checkoutUrl = `https://example.com/checkout/${providerPaymentId}`;
    return { providerPaymentId, checkoutUrl };
  }

  async verifyPayment(providerPaymentId: string): Promise<boolean> {
    // For the mock we simply consider any stored payment as successful.
    return this.payments.has(providerPaymentId);
  }

  async handleWebhook(_payload: any, _signature: string): Promise<void> {
    // No‑op for the mock – real providers would validate the signature and update payment status.
    return;
  }
}
